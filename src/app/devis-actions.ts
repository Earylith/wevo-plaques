"use server";

import { adminDb } from "@/lib/firebase/admin";
import { envoyerCourriel } from "@/lib/server/email";
import { messageDevis, messageDevisInterne } from "@/lib/server/emails/messages";

/**
 * Demandes de devis pour les offres professionnelles.
 *
 * La demande est D'ABORD enregistrée, et seulement ensuite notifiée par
 * e-mail. Si le service d'envoi est absent ou en panne, la demande existe
 * quand même : une piste commerciale perdue parce qu'un tiers ne répondait
 * pas serait une perte sèche, et le client, lui, croirait avoir écrit.
 *
 * Deux envois en découlent : la fiche pour l'équipe, et l'accusé de réception
 * pour le demandeur. Aucun des deux ne peut faire échouer l'enregistrement.
 */

const DEMANDES = "quote_requests";

export type OffrePro = "multibien" | "signature";

export interface DemandeDevis {
  offre: OffrePro;
  nom: string;
  societe: string;
  email: string;
  telephone: string;
  /** Nombre de logements concernés, tel que saisi. */
  logements: string;
  message: string;
}

/** Un e-mail plausible. On ne vérifie pas qu'il existe — seul l'envoi le dira. */
function emailPlausible(valeur: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(valeur.trim());
}

/**
 * Notifie l'équipe d'une nouvelle demande.
 *
 * Volontairement tolérante : elle ne lève jamais. Une notification manquée
 * doit rester une notification manquée, pas une demande perdue — la demande
 * est déjà en base au moment où on arrive ici.
 *
 * `replyTo` porte l'adresse du demandeur : répondre au message suffit à lui
 * répondre, sans recopier son adresse depuis l'administration.
 */
async function notifierEquipe(demande: DemandeDevis): Promise<boolean> {
  const destinataire =
    process.env.DEVIS_EMAIL || process.env.BREVO_SENDER_EMAIL || "contact@guidzme.fr";

  const message = messageDevisInterne({
    offre: demande.offre,
    nom: demande.nom,
    societe: demande.societe,
    email: demande.email,
    telephone: demande.telephone,
    logements: demande.logements,
    message: demande.message,
  });

  const envoi = await envoyerCourriel({
    destinataire,
    sujet: message.sujet,
    html: message.html,
    texte: message.texte,
    repondreA: { email: demande.email, nom: demande.nom },
    etiquette: "devis-interne",
  });

  return envoi.envoye;
}

/**
 * Accuse réception auprès du demandeur.
 *
 * Sans ce message, celui qui remplit le formulaire n'a aucun signe que sa
 * demande est partie : il la renvoie, ou il va voir ailleurs. Un accusé de
 * réception coûte un e-mail et évite les deux.
 */
async function confirmerAuDemandeur(demande: DemandeDevis): Promise<boolean> {
  const message = await messageDevis({
    prenom: demande.nom.trim().split(/\s+/)[0],
    societe: demande.societe,
    offre: demande.offre,
    logements: demande.logements,
    email: demande.email,
    telephone: demande.telephone,
  });

  const envoi = await envoyerCourriel({
    destinataire: demande.email,
    nomDestinataire: demande.nom,
    sujet: message.sujet,
    html: message.html,
    texte: message.texte,
    etiquette: "devis-confirmation",
  });

  return envoi.envoye;
}

export async function envoyerDemandeDevis(
  demande: DemandeDevis
): Promise<{ id: string; notifie: boolean; confirme: boolean }> {
  const nom = demande.nom?.trim() || "";
  const email = demande.email?.trim() || "";

  if (nom.length < 2) throw new Error("Indiquez votre nom.");
  if (!emailPlausible(email)) throw new Error("Cette adresse e-mail ne semble pas valide.");
  if (demande.offre !== "multibien" && demande.offre !== "signature") {
    throw new Error("Offre inconnue.");
  }

  /*
   * Les champs sont bornés à l'écriture. Sans cela, un envoi automatisé
   * pourrait remplir la base de mégaoctets de texte, et l'administration
   * deviendrait illisible.
   */
  const borner = (v: string | undefined, max: number) => (v || "").trim().slice(0, max);

  const propre: DemandeDevis = {
    offre: demande.offre,
    nom: borner(nom, 120),
    societe: borner(demande.societe, 160),
    email: borner(email, 200),
    telephone: borner(demande.telephone, 40),
    logements: borner(demande.logements, 40),
    message: borner(demande.message, 4000),
  };

  const cree = await adminDb.collection(DEMANDES).add({
    ...propre,
    statut: "nouvelle",
    createdAt: Date.now(),
  });

  /*
   * Les deux envois sont menés de front et leurs échecs n'annulent rien : la
   * demande existe déjà en base. Le demandeur reçoit son accusé, l'équipe
   * reçoit la fiche — et si l'un des deux tombe, l'autre passe quand même.
   */
  const [notifie, confirme] = await Promise.all([
    notifierEquipe(propre).catch(() => false),
    confirmerAuDemandeur(propre).catch(() => false),
  ]);

  const trace: Record<string, number> = {};
  if (notifie) trace.notifiedAt = Date.now();
  if (confirme) trace.confirmedAt = Date.now();
  if (Object.keys(trace).length) await cree.update(trace).catch(() => {});

  if (!notifie) {
    console.warn("[devis] demande", cree.id, "non notifiée à l’équipe");
  }

  return { id: cree.id, notifie, confirme };
}
