"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  messageBienvenue, messageCommande, messageExpedition, messageDevis,
  messageResiliation, Message,
} from "@/lib/server/emails/messages";
import {
  lireTextesEmails, ecrireTexteEmail, retablirTexteEmail,
} from "@/lib/server/emails/reglages";
import { CleMessage, TexteMessage, TextesEmails } from "@/lib/emailsTextes";
import { envoyerCourriel, messagerieConfiguree } from "@/lib/server/email";

/**
 * Ce que l'administration peut faire des e-mails : les relire, les modifier,
 * s'en envoyer un.
 *
 * L'envoi d'essai est ce qui compte le plus. Un aperçu dans le navigateur ne
 * dit pas si la clé est bonne, si l'expéditeur est autorisé, ni si le message
 * atterrit en boîte de réception ou dans les indésirables. Seul un envoi réel
 * le dit.
 *
 * Tout est réservé à l'administration : une route d'envoi ouverte serait un
 * relais de courrier indésirable offert au premier venu.
 */

async function exigerAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "true") {
    throw new Error("Accès réservé.");
  }
}

const ADRESSE = {
  line1: "12 rue des Lauriers",
  line2: "Bâtiment B, 3e étage",
  postalCode: "13008",
  city: "Marseille",
  country: "FR",
};

/**
 * Un jeu d'exemple volontairement complet.
 *
 * Avec des champs facultatifs vides, on validerait une mise en page qu'aucun
 * vrai message n'aura — et on découvrirait le débordement en production.
 */
export async function exempleMessage(
  type: CleMessage,
  prenom = "Sami",
  textes?: TextesEmails
): Promise<Message> {
  if (type === "bienvenue") {
    return messageBienvenue({ prenom, formule: "comfort", livretId: "exemple" }, textes);
  }
  if (type === "commande") {
    return messageCommande(
      {
        prenom,
        reference: "GUIDZ-1042",
        nomLogement: "Le Mas des Oliviers",
        formule: "comfort",
        slug: "le-mas-des-oliviers",
        essence: "Noyer",
        phraseGravee: "Profitez pleinement de votre séjour !",
        adresse: ADRESSE,
        destinataire: "Sami Peyri",
      },
      textes
    );
  }
  if (type === "devis") {
    return messageDevis(
      {
        prenom,
        societe: "Conciergerie du Bassin",
        offre: "multibien",
        logements: "12",
        email: `${prenom}@conciergerie-bassin.fr`,
        telephone: "06 12 34 56 78",
      },
      textes
    );
  }
  if (type === "resiliation") {
    return messageResiliation(
      {
        prenom,
        nomLogement: "Le Mas des Oliviers",
        finLe: Date.now() + 18 * 86400000,
        rythme: "mensuel",
      },
      textes
    );
  }
  return messageExpedition(
    {
      prenom,
      reference: "GUIDZ-1042",
      nomLogement: "Le Mas des Oliviers",
      transporteur: "Colissimo",
      numeroSuivi: "6A21847395021",
      lienSuivi: "https://www.laposte.fr/outils/suivre-vos-envois?code=6A21847395021",
      livraisonPrevue: Date.now() + 3 * 86400000,
      mot: "Nous avons glissé un petit guide de pose dans le colis.",
      adresse: ADRESSE,
      destinataire: "Sami Peyri",
    },
    textes
  );
}

export async function envoyerEssai(
  type: CleMessage,
  destinataire: string
): Promise<{ ok: boolean; detail: string }> {
  await exigerAdmin();

  const adresse = (destinataire || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(adresse)) {
    return { ok: false, detail: "Cette adresse e-mail ne semble pas valide." };
  }

  if (!messagerieConfiguree()) {
    return {
      ok: false,
      detail:
        "BREVO_API_KEY n’est pas configurée : aucun envoi n’est tenté. Ajoutez-la dans .env.local, puis relancez le serveur.",
    };
  }

  // Le prénom vient de l'adresse d'essai : on voit ainsi que la salutation
  // se personnalise, sans écrire « Bonjour Sami » à quelqu'un d'autre.
  const message = await exempleMessage(type, adresse.split("@")[0]);

  const envoi = await envoyerCourriel({
    // Objet préfixé : un essai ne doit jamais être confondu avec un vrai
    // message, ni dans la boîte du destinataire ni dans les journaux Brevo.
    sujet: `[ESSAI] ${message.sujet}`,
    destinataire: adresse,
    html: message.html,
    texte: message.texte,
    etiquette: `essai-${type}`,
  });

  if (envoi.envoye) {
    return {
      ok: true,
      detail: `Envoyé à ${adresse}${envoi.id ? ` (${envoi.id})` : ""}. Regardez aussi vos indésirables.`,
    };
  }

  return {
    ok: false,
    detail:
      envoi.raison === "refuse"
        ? `Brevo a refusé l’envoi : ${envoi.detail || "sans détail"}. L’expéditeur est-il validé dans Brevo ?`
        : `Brevo injoignable : ${envoi.detail || "sans détail"}.`,
  };
}

/** État de la configuration, affiché dans l'administration. */
export async function etatMessagerie(): Promise<{
  configuree: boolean;
  expediteur: string;
}> {
  await exigerAdmin();
  return {
    configuree: messagerieConfiguree(),
    expediteur: process.env.BREVO_SENDER_EMAIL || "contact@guidzme.fr",
  };
}

/* ══════════════════════════════════════════════════════════════════════════
   TEXTE DES MESSAGES
   ══════════════════════════════════════════════════════════════════════════ */

export async function chargerTextes(): Promise<TextesEmails> {
  await exigerAdmin();
  return lireTextesEmails();
}

export async function enregistrerTexte(
  cle: CleMessage,
  texte: TexteMessage
): Promise<{ ok: boolean; detail: string }> {
  await exigerAdmin();

  if (!texte.sujet?.trim()) {
    return { ok: false, detail: "L’objet ne peut pas être vide." };
  }
  if (!texte.paragraphes?.some((p) => p.trim())) {
    return { ok: false, detail: "Il faut au moins un paragraphe." };
  }

  await ecrireTexteEmail(cle, texte);
  revalidatePath("/admin/emails");
  return { ok: true, detail: "Enregistré. Les prochains envois utiliseront ce texte." };
}

export async function retablirTexte(cle: CleMessage): Promise<TexteMessage> {
  await exigerAdmin();
  await retablirTexteEmail(cle);
  revalidatePath("/admin/emails");
  return (await lireTextesEmails())[cle];
}
