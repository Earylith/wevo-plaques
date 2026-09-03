"use server";

import { adminDb } from "@/lib/firebase/admin";
import { MOTIFS_SIGNALEMENT, MotifSignalement } from "@/lib/signalement";
import { envoyerCourriel } from "@/lib/server/email";
import { urlAbsolue } from "@/lib/site";

/**
 * Signalements de livrets par les voyageurs.
 *
 * Nous hébergeons des pages écrites par des tiers. Sans ce canal, un contenu
 * haineux ou une photo déplacée resterait en ligne jusqu'à ce que quelqu'un
 * pense à nous écrire — c'est-à-dire souvent jamais.
 *
 * Aucun compte n'est demandé : exiger une inscription pour signaler garantit
 * que personne ne signale. En contrepartie, l'action est ouverte à tous et
 * doit donc se défendre seule contre les envois massifs — d'où les champs
 * bornés et le plafond par livret.
 */

const SIGNALEMENTS = "reports";

/**
 * Au-delà de ce nombre de signalements en attente, on cesse d'en enregistrer
 * pour un même livret.
 *
 * Le premier a déjà déclenché l'examen : les suivants n'apprennent rien de
 * plus et permettraient à quiconque de remplir la base. Le signaleur reçoit
 * néanmoins une confirmation — lui répondre « déjà signalé » lui apprendrait
 * ce qu'il n'a pas à savoir.
 */
const PLAFOND_PAR_LIVRET = 20;

export async function signalerLivret(signalement: {
  livretId: string;
  slug: string;
  motif: MotifSignalement;
  details: string;
}): Promise<void> {
  const { livretId, slug, motif } = signalement;

  if (!livretId || !(motif in MOTIFS_SIGNALEMENT)) {
    throw new Error("Signalement incomplet.");
  }

  const enAttente = await adminDb
    .collection(SIGNALEMENTS)
    .where("livretId", "==", livretId)
    .where("statut", "==", "nouveau")
    .limit(PLAFOND_PAR_LIVRET)
    .get();

  if (enAttente.size >= PLAFOND_PAR_LIVRET) {
    // Silencieux à dessein : le signaleur n'a pas à savoir combien d'autres
    // l'ont précédé, et l'examen est déjà déclenché.
    return;
  }

  const details = (signalement.details || "").trim().slice(0, 2000);
  const propre = (slug || "").slice(0, 200);

  const cree = await adminDb.collection(SIGNALEMENTS).add({
    livretId,
    slug: propre,
    motif,
    details,
    statut: "nouveau",
    createdAt: Date.now(),
  });

  /*
   * Prévenir Guidz.
   *
   * Un signalement rangé dans une collection que personne ne regarde ne vaut
   * pas mieux que pas de signalement du tout : un contenu haineux resterait
   * en ligne jusqu'à ce que quelqu'un pense à ouvrir l'écran. L'e-mail met
   * la question sous les yeux de l'équipe le jour même.
   *
   * L'échec d'envoi n'annule jamais l'enregistrement : le signalement existe
   * déjà en base au moment où l'on arrive ici, et l'écran d'administration
   * reste le registre de référence.
   */
  await envoyerCourriel({
    destinataire: process.env.SIGNALEMENT_EMAIL
      || process.env.DEVIS_EMAIL
      || process.env.BREVO_SENDER_EMAIL
      || "contact@guidzme.fr",
    sujet: `Signalement — ${MOTIFS_SIGNALEMENT[motif]} · /h/${propre}`,
    html: [
      "<p>Un voyageur vient de signaler un livret.</p>",
      `<p><strong>Motif :</strong> ${MOTIFS_SIGNALEMENT[motif]}<br>`,
      `<strong>Livret :</strong> ${urlAbsolue(`/h/${propre}`)}<br>`,
      `<strong>Identifiant :</strong> ${livretId}</p>`,
      details ? `<p><strong>Détails :</strong><br>${details.replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>` : "",
      `<p><a href="${urlAbsolue("/admin/signalements")}">Examiner dans l’administration</a></p>`,
    ].join("\n"),
    texte: [
      "Un voyageur vient de signaler un livret.",
      "",
      `Motif       : ${MOTIFS_SIGNALEMENT[motif]}`,
      `Livret      : ${urlAbsolue(`/h/${propre}`)}`,
      `Identifiant : ${livretId}`,
      "",
      details || "(aucun détail)",
      "",
      `Examiner : ${urlAbsolue("/admin/signalements")}`,
    ].join("\n"),
    etiquette: "signalement",
  });

  console.info("[signalement] enregistré", cree.id, motif, propre);
}
