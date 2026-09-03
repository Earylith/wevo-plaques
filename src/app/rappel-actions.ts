"use server";

import { adminDb } from "@/lib/firebase/admin";
import { envoyerCourriel } from "@/lib/server/email";
import { urlAbsolue } from "@/lib/site";
import { CRENEAUX, DemandeRappel } from "@/lib/rappel";

/**
 * Demandes de rappel téléphonique.
 *
 * Le bouton « Être rappelé » de la page d'accueil pointait sur `href="#"` :
 * il ne faisait rien. Chaque visiteur qui préférait un appel à un formulaire
 * était donc perdu en silence — et c'est précisément le visiteur le plus
 * chaud, celui qui a une question et veut une réponse tout de suite.
 *
 * On demande le strict nécessaire : un numéro, et de quoi rappeler au bon
 * moment. Pas d'e-mail, pas de société, pas de message obligatoire — chaque
 * champ de plus est une occasion d'abandonner.
 */

const RAPPELS = "callbacks";

/**
 * Enregistre la demande, PUIS prévient l'équipe.
 *
 * Dans cet ordre, et l'envoi n'annule jamais l'enregistrement : une demande
 * de rappel perdue parce que Brevo était en panne serait une perte sèche, et
 * le visiteur, lui, croirait avoir laissé son numéro.
 */
export async function demanderRappel(
  demande: DemandeRappel
): Promise<{ id: string; prevenu: boolean }> {
  const nom = (demande.nom || "").trim();
  const brut = (demande.telephone || "").trim();
  const chiffres = brut.replace(/\D/g, "");

  if (nom.length < 2) throw new Error("Indiquez votre nom.");
  if (chiffres.length < 9) {
    throw new Error("Ce numéro de téléphone ne semble pas complet.");
  }
  if (!(demande.creneau in CRENEAUX)) {
    throw new Error("Créneau inconnu.");
  }

  /*
   * Les champs sont bornés : cette action est ouverte à tous, sans compte.
   * Sans plafond, un envoi automatisé remplirait la base de mégaoctets de
   * texte et rendrait l'administration illisible.
   */
  const propre: DemandeRappel = {
    nom: nom.slice(0, 120),
    telephone: brut.slice(0, 40),
    creneau: demande.creneau,
    message: (demande.message || "").trim().slice(0, 1000),
  };

  const cree = await adminDb.collection(RAPPELS).add({
    ...propre,
    statut: "a_rappeler",
    createdAt: Date.now(),
  });

  const envoi = await envoyerCourriel({
    destinataire:
      process.env.RAPPEL_EMAIL
      || process.env.DEVIS_EMAIL
      || process.env.BREVO_SENDER_EMAIL
      || "contact@guidzme.fr",
    sujet: `Rappel demandé — ${propre.nom} · ${propre.telephone}`,
    html: [
      "<p>Quelqu’un demande à être rappelé.</p>",
      `<p><strong>Nom :</strong> ${propre.nom}<br>`,
      `<strong>Téléphone :</strong> <a href="tel:${chiffres}">${propre.telephone}</a><br>`,
      `<strong>Moment souhaité :</strong> ${CRENEAUX[propre.creneau]}</p>`,
      propre.message
        ? `<p><strong>Sa question :</strong><br>${propre.message.replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>`
        : "",
      `<p><a href="${urlAbsolue("/admin/rappels")}">Voir dans l’administration</a></p>`,
    ].join("\n"),
    texte: [
      "Quelqu’un demande à être rappelé.",
      "",
      `Nom              : ${propre.nom}`,
      `Téléphone        : ${propre.telephone}`,
      `Moment souhaité  : ${CRENEAUX[propre.creneau]}`,
      "",
      propre.message || "(aucune question précisée)",
      "",
      `Administration : ${urlAbsolue("/admin/rappels")}`,
    ].join("\n"),
    etiquette: "rappel",
  });

  if (envoi.envoye) {
    await cree.update({ notifiedAt: Date.now() }).catch(() => {});
  } else {
    console.warn("[rappel] demande", cree.id, "non notifiée à l’équipe");
  }

  return { id: cree.id, prevenu: envoi.envoye };
}
