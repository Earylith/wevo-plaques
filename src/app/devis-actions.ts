"use server";

import { adminDb } from "@/lib/firebase/admin";

/**
 * Demandes de devis pour les offres professionnelles.
 *
 * La demande est D'ABORD enregistrée, et seulement ensuite notifiée par
 * e-mail. Si le service d'envoi est absent ou en panne, la demande existe
 * quand même : une piste commerciale perdue parce qu'un tiers ne répondait
 * pas serait une perte sèche, et le client, lui, croirait avoir écrit.
 *
 * L'envoi Brevo n'est pas encore branché. Il se posera ici, sans rien changer
 * au reste : le contrat de cette action ne dépend pas de lui.
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
 */
async function notifierEquipe(demande: DemandeDevis, id: string): Promise<boolean> {
  const cle = process.env.BREVO_API_KEY;
  const destinataire = process.env.DEVIS_EMAIL;

  if (!cle || !destinataire) {
    // Pas encore branché : la demande reste consultable dans l'administration.
    console.info("[devis] demande", id, "enregistrée — notification non configurée");
    return false;
  }

  try {
    const reponse = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": cle,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Guidz", email: process.env.BREVO_SENDER || destinataire },
        to: [{ email: destinataire }],
        replyTo: { email: demande.email, name: demande.nom },
        subject: `Demande de devis ${demande.offre === "signature" ? "Signature" : "Multi-biens"} — ${demande.societe || demande.nom}`,
        textContent: [
          `Offre      : ${demande.offre}`,
          `Nom        : ${demande.nom}`,
          `Société    : ${demande.societe || "—"}`,
          `E-mail     : ${demande.email}`,
          `Téléphone  : ${demande.telephone || "—"}`,
          `Logements  : ${demande.logements || "—"}`,
          "",
          demande.message || "(aucun message)",
        ].join("\n"),
      }),
    });

    if (!reponse.ok) {
      console.error("[devis] Brevo a refusé l'envoi", reponse.status, await reponse.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("[devis] envoi impossible", error);
    return false;
  }
}

export async function envoyerDemandeDevis(
  demande: DemandeDevis
): Promise<{ id: string; notifie: boolean }> {
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

  const notifie = await notifierEquipe(propre, cree.id);
  if (notifie) {
    await cree.update({ notifiedAt: Date.now() }).catch(() => {});
  }

  return { id: cree.id, notifie };
}
