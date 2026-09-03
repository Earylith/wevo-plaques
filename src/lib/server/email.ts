import "server-only";

/**
 * Envoi d'e-mails transactionnels, par l'API Brevo.
 *
 * Trois règles, dont dépend tout le reste :
 *
 *  1. CET ENVOI NE LÈVE JAMAIS. Un e-mail est une conséquence de l'action,
 *     pas l'action elle-même. Un compte créé, une commande encaissée ou un
 *     suivi enregistré doivent le rester même si Brevo est en panne — sinon
 *     une panne de messagerie devient une perte de commande.
 *  2. L'échec est JOURNALISÉ et REMONTÉ à l'appelant, qui décide s'il le
 *     signale. Avaler l'erreur en silence, c'est croire pendant des semaines
 *     qu'on prévient des clients qu'on ne prévient pas.
 *  3. Sans clé configurée, on ne tente rien et on le dit. En développement,
 *     c'est l'état normal : personne ne veut écrire à de vrais clients depuis
 *     sa machine.
 *
 * Le corps est envoyé en HTML ET en texte. Un message sans version texte
 * part plus volontiers en indésirable, et reste illisible pour qui lit ses
 * e-mails en texte brut.
 */

const API = "https://api.brevo.com/v3/smtp/email";

/** L'expéditeur, tel qu'il apparaît chez le destinataire. */
function expediteur() {
  return {
    name: process.env.BREVO_SENDER_NAME || "Guidz",
    email: process.env.BREVO_SENDER_EMAIL || "contact@guidzme.fr",
  };
}

export interface Courriel {
  destinataire: string;
  nomDestinataire?: string;
  sujet: string;
  html: string;
  texte: string;
  /** Adresse à laquelle le client répondra s'il clique sur « Répondre ». */
  repondreA?: { email: string; nom?: string };
  /**
   * Étiquette Brevo : elle permet de retrouver, dans les journaux, tous les
   * envois d'un même type sans les compter à la main.
   */
  etiquette?: string;
}

export type ResultatEnvoi =
  | { envoye: true; id: string | null }
  | { envoye: false; raison: "non-configure" | "refuse" | "injoignable"; detail?: string };

export async function envoyerCourriel(courriel: Courriel): Promise<ResultatEnvoi> {
  const cle = process.env.BREVO_API_KEY;

  if (!cle) {
    console.info(
      "[email] envoi ignoré —",
      courriel.etiquette || "sans étiquette",
      "· BREVO_API_KEY absente"
    );
    return { envoye: false, raison: "non-configure" };
  }

  const destinataire = (courriel.destinataire || "").trim();
  if (!destinataire.includes("@")) {
    console.error("[email] destinataire invalide", destinataire);
    return { envoye: false, raison: "refuse", detail: "destinataire invalide" };
  }

  try {
    const reponse = await fetch(API, {
      method: "POST",
      headers: {
        "api-key": cle,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: expediteur(),
        to: [{ email: destinataire, name: courriel.nomDestinataire || undefined }],
        replyTo: courriel.repondreA
          ? { email: courriel.repondreA.email, name: courriel.repondreA.nom }
          : { email: expediteur().email, name: expediteur().name },
        subject: courriel.sujet,
        htmlContent: courriel.html,
        textContent: courriel.texte,
        tags: courriel.etiquette ? [courriel.etiquette] : undefined,
      }),
    });

    if (!reponse.ok) {
      const detail = await reponse.text().catch(() => "");
      console.error("[email] Brevo a refusé", courriel.etiquette, reponse.status, detail);
      return { envoye: false, raison: "refuse", detail: `${reponse.status} ${detail}`.trim() };
    }

    const corps = (await reponse.json().catch(() => null)) as { messageId?: string } | null;
    console.info("[email] envoyé", courriel.etiquette, "→", destinataire);
    return { envoye: true, id: corps?.messageId || null };
  } catch (error) {
    console.error("[email] envoi impossible", courriel.etiquette, error);
    return {
      envoye: false,
      raison: "injoignable",
      detail: error instanceof Error ? error.message : String(error),
    };
  }
}

/** La messagerie est-elle branchée ? Sert à le dire dans l'administration. */
export function messagerieConfiguree(): boolean {
  return Boolean(process.env.BREVO_API_KEY);
}
