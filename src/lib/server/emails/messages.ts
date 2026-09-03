import { urlAbsolue } from "@/lib/site";
import { enveloppe, versionTexte, echapper, Bouton, Fait } from "./gabarit";
import { lignesAdresse } from "@/lib/adressePostale";
import { AdressePostale } from "@/lib/types/accommodation";
import {
  CleMessage, TextesEmails, TexteMessage, appliquerVariables,
  lireTextesEmails, TEXTES_PAR_DEFAUT,
} from "./reglages";

/**
 * Les trois messages que Guidz envoie à ses clients.
 *
 * Ils sont composés ici, dans le dépôt, et non dans l'éditeur de Brevo. Un
 * gabarit qui vit chez un prestataire n'est ni relu, ni versionné, et se
 * modifie sans que personne ne le sache — alors qu'il porte la référence de
 * commande, l'adresse de livraison et la promesse de délai.
 *
 * Le TEXTE, lui, est modifiable depuis l'administration : c'est ce qui se
 * relit, se corrige et se réécrit. La structure — encadré, bouton, liens —
 * reste du ressort du code, pour qu'aucune modification de formulation ne
 * puisse faire disparaître un lien de suivi.
 *
 * Chaque message dit UNE chose et annonce la suivante. Un client qui vient
 * de payer veut savoir ce qui se passe maintenant, pas relire l'argumentaire
 * de vente.
 */

export interface Message {
  sujet: string;
  html: string;
  texte: string;
}

const NOM_FORMULE = { comfort: "Confort", essential: "Essentielle" } as const;

/** Assemble les deux versions à partir des mêmes éléments. */
function composer(parties: {
  sujet: string;
  apercu: string;
  titre: string;
  /** Paragraphes en texte brut : ils sont échappés pour la version HTML. */
  corps: string[];
  faits?: Fait[];
  titreFaits?: string;
  bouton?: Bouton;
  postScriptum?: string;
}): Message {
  return {
    sujet: parties.sujet,
    html: enveloppe({
      apercu: parties.apercu,
      titre: parties.titre,
      corps: parties.corps.map(echapper),
      faits: parties.faits?.map((f) => ({ ...f, valeur: echapper(f.valeur) })),
      titreFaits: parties.titreFaits,
      bouton: parties.bouton,
      postScriptum: parties.postScriptum ? echapper(parties.postScriptum) : undefined,
    }),
    texte: versionTexte(parties),
  };
}

/**
 * Applique les variables au texte d'un message.
 *
 * Le titre passe aussi à la moulinette : « Bienvenue {prenom} » doit donner
 * « Bienvenue Sami », et « Bienvenue » tout court quand le prénom est
 * inconnu — jamais « Bienvenue, » orpheline de son nom.
 */
function rendre(
  modele: TexteMessage,
  valeurs: Record<string, string | undefined>
): TexteMessage {
  return {
    sujet: appliquerVariables(modele.sujet, valeurs),
    titre: appliquerVariables(modele.titre, valeurs),
    paragraphes: modele.paragraphes
      .map((p) => appliquerVariables(p, valeurs))
      .filter(Boolean),
    postScriptum: appliquerVariables(modele.postScriptum || "", valeurs),
  };
}

/**
 * Le texte en vigueur pour un message.
 *
 * `textes` est passé par l'appelant quand il en a déjà chargé un jeu — c'est
 * le cas de l'aperçu, qui affiche les trois d'affilée et n'a aucune raison
 * de relire Firestore trois fois.
 */
async function texteDe(cle: CleMessage, textes?: TextesEmails): Promise<TexteMessage> {
  if (textes) return textes[cle];
  return (await lireTextesEmails())[cle];
}

/* ══════════════════════════════════════════════════════════════════════════
   1. BIENVENUE — le compte vient d'être créé
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Le premier message. Il a un seul travail : ramener l'hôte dans l'éditeur.
 *
 * Il dit aussi, explicitement, que rien n'est en ligne. Un client qui croit
 * sa page publiée avant d'avoir payé le découvre au pire moment — quand un
 * voyageur lui écrit que le lien ne marche pas.
 */
export async function messageBienvenue(
  donnees: {
    prenom?: string;
    formule: "comfort" | "essential";
    livretId: string;
  },
  textes?: TextesEmails
): Promise<Message> {
  const modele = rendre(await texteDe("bienvenue", textes), {
    prenom: donnees.prenom,
    formule: NOM_FORMULE[donnees.formule],
  });

  return composer({
    sujet: modele.sujet,
    apercu: "Votre livret d’accueil vous attend — il n’est pas encore en ligne.",
    titre: modele.titre,
    corps: modele.paragraphes,
    titreFaits: "Votre livret",
    faits: [
      { intitule: "Formule", valeur: NOM_FORMULE[donnees.formule], fort: true },
      { intitule: "État", valeur: "Brouillon — rien n’est publié" },
      { intitule: "Modifications", valeur: "Illimitées avant publication" },
    ],
    bouton: {
      libelle: "Composer mon livret",
      href: urlAbsolue(`/proprietaire/dashboard/${donnees.livretId}/edit`),
    },
    postScriptum: modele.postScriptum,
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   2. COMMANDE — le paiement est confirmé
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * La confirmation d'achat, envoyée après l'encaissement.
 *
 * Elle affiche l'adresse de livraison telle qu'elle partira. C'est le seul
 * moment où le client peut encore corriger un numéro de rue avant que la
 * plaque ne soit gravée et postée — et il n'y pensera que si on la lui met
 * sous les yeux.
 */
export async function messageCommande(
  donnees: {
    prenom?: string;
    reference: string;
    nomLogement: string;
    formule: "comfort" | "essential";
    slug: string;
    essence: string;
    phraseGravee?: string;
    adresse?: AdressePostale | null;
    destinataire?: string;
  },
  textes?: TextesEmails
): Promise<Message> {
  const lienPage = urlAbsolue(`/h/${donnees.slug}`);

  const modele = rendre(await texteDe("commande", textes), {
    prenom: donnees.prenom,
    reference: donnees.reference,
    logement: donnees.nomLogement,
    formule: NOM_FORMULE[donnees.formule],
    lien_page: lienPage,
  });

  const faits: Fait[] = [
    { intitule: "Commande", valeur: donnees.reference, fort: true },
    { intitule: "Logement", valeur: donnees.nomLogement },
    { intitule: "Formule", valeur: NOM_FORMULE[donnees.formule] },
    { intitule: "Plaque", valeur: donnees.essence },
  ];

  if (donnees.phraseGravee?.trim()) {
    faits.push({ intitule: "Phrase gravée", valeur: donnees.phraseGravee.trim() });
  }
  faits.push({ intitule: "Page publique", valeur: `/h/${donnees.slug}` });

  const adresse = lignesAdresse(donnees.adresse, donnees.destinataire);
  const corps = [...modele.paragraphes];

  if (adresse.length) {
    faits.push({ intitule: "Livraison", valeur: adresse.join(", ") });
  } else {
    /*
     * Sans adresse, le paragraphe qui invite à la vérifier n'a plus de sens :
     * on le remplace par la demande. Laisser « vérifiez l'adresse ci-dessous »
     * au-dessus d'un encadré qui n'en contient aucune serait absurde.
     */
    corps.push(
      "Il nous manque votre adresse postale pour vous envoyer la plaque. Répondez simplement à ce message avec l’adresse de livraison, et nous lancerons la gravure."
    );
  }

  return composer({
    sujet: modele.sujet,
    apercu: "Votre livret est en ligne, votre plaque part en fabrication.",
    titre: modele.titre,
    corps,
    titreFaits: "Récapitulatif",
    faits,
    bouton: { libelle: "Voir mon espace", href: urlAbsolue("/proprietaire/dashboard") },
    postScriptum: modele.postScriptum,
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   3. EXPÉDITION — la plaque est partie
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * L'annonce d'expédition.
 *
 * C'est le message que le client attend vraiment : entre le paiement et la
 * réception, c'est le seul signe que quelque chose avance. Sans lui, un
 * client sans nouvelles écrit — et il a raison d'écrire.
 */
export async function messageExpedition(
  donnees: {
    prenom?: string;
    reference: string;
    nomLogement: string;
    transporteur?: string;
    numeroSuivi?: string;
    lienSuivi?: string;
    livraisonPrevue?: number | null;
    mot?: string;
    adresse?: AdressePostale | null;
    destinataire?: string;
  },
  textes?: TextesEmails
): Promise<Message> {
  const modele = rendre(await texteDe("expedition", textes), {
    prenom: donnees.prenom,
    reference: donnees.reference,
    logement: donnees.nomLogement,
    // Sans transporteur nommé, la phrase reste vraie sans mentir.
    transporteur: donnees.transporteur?.trim() || "notre transporteur",
    suivi: donnees.numeroSuivi,
  });

  const faits: Fait[] = [
    { intitule: "Commande", valeur: donnees.reference },
    { intitule: "Logement", valeur: donnees.nomLogement },
  ];

  if (donnees.transporteur?.trim()) {
    faits.push({ intitule: "Transporteur", valeur: donnees.transporteur.trim() });
  }
  if (donnees.numeroSuivi?.trim()) {
    faits.push({ intitule: "Numéro de suivi", valeur: donnees.numeroSuivi.trim(), fort: true });
  }
  if (donnees.livraisonPrevue) {
    faits.push({
      intitule: "Livraison prévue",
      valeur: new Date(donnees.livraisonPrevue).toLocaleDateString("fr-FR", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }),
    });
  }

  const adresse = lignesAdresse(donnees.adresse, donnees.destinataire);
  if (adresse.length) {
    faits.push({ intitule: "Livrée à", valeur: adresse.join(", ") });
  }

  /*
   * Le mot de Guidz est glissé APRÈS le premier paragraphe : c'est un aparté
   * personnel, il n'a pas à ouvrir le message ni à le clore.
   */
  const corps = [...modele.paragraphes];
  if (donnees.mot?.trim()) corps.splice(1, 0, donnees.mot.trim());

  /*
   * Le bouton mène au suivi quand il existe, et à l'espace client sinon :
   * un bouton « Suivre mon colis » qui ne suit rien serait pire que pas de
   * bouton du tout.
   */
  const bouton: Bouton = donnees.lienSuivi?.trim()
    ? { libelle: "Suivre mon colis", href: donnees.lienSuivi.trim() }
    : { libelle: "Voir mon espace", href: urlAbsolue("/proprietaire/dashboard") };

  return composer({
    sujet: modele.sujet,
    apercu: `Votre plaque « ${donnees.nomLogement} » vient de quitter l’atelier.`,
    titre: modele.titre,
    corps,
    titreFaits: "Votre colis",
    faits,
    bouton,
    postScriptum: modele.postScriptum,
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   4. DEVIS — accusé de réception d'une demande professionnelle
   ══════════════════════════════════════════════════════════════════════════ */

const NOM_OFFRE = { multibien: "Multi-biens", signature: "Signature" } as const;

/**
 * L'accusé de réception d'une demande de devis.
 *
 * Il ne vend rien et ne chiffre rien : il dit que la demande est arrivée et
 * quand la réponse viendra. Sans lui, celui qui remplit le formulaire n'a
 * aucun signe que son message est parti — et il recommence, ou il va voir
 * ailleurs.
 */
export async function messageDevis(
  donnees: {
    prenom?: string;
    societe?: string;
    offre: "multibien" | "signature";
    logements?: string;
    email: string;
    telephone?: string;
  },
  textes?: TextesEmails
): Promise<Message> {
  const modele = rendre(await texteDe("devis", textes), {
    prenom: donnees.prenom,
    societe: donnees.societe,
    offre: NOM_OFFRE[donnees.offre],
    logements: donnees.logements,
  });

  const faits: Fait[] = [
    { intitule: "Offre", valeur: NOM_OFFRE[donnees.offre], fort: true },
  ];
  if (donnees.societe?.trim()) {
    faits.push({ intitule: "Société", valeur: donnees.societe.trim() });
  }
  if (donnees.logements?.trim()) {
    faits.push({ intitule: "Logements", valeur: donnees.logements.trim() });
  }
  faits.push({ intitule: "Contact", valeur: donnees.email });
  if (donnees.telephone?.trim()) {
    faits.push({ intitule: "Téléphone", valeur: donnees.telephone.trim() });
  }

  return composer({
    sujet: modele.sujet,
    apercu: "Nous revenons vers vous sous un jour ouvré.",
    titre: modele.titre,
    corps: modele.paragraphes,
    titreFaits: "Votre demande",
    faits,
    bouton: { libelle: "Voir les livrets de démonstration", href: urlAbsolue("/livrets-demo") },
    postScriptum: modele.postScriptum,
  });
}

/**
 * La même demande, telle que Guidz la reçoit.
 *
 * Volontairement non modifiable depuis l'administration : c'est une fiche de
 * travail, pas un message commercial. Elle doit porter tous les champs, y
 * compris ceux qu'on serait tenté d'abréger — c'est sur elle qu'on rappelle
 * le prospect.
 */
export function messageDevisInterne(donnees: {
  offre: "multibien" | "signature";
  nom: string;
  societe?: string;
  email: string;
  telephone?: string;
  logements?: string;
  message?: string;
}): Message {
  const faits: Fait[] = [
    { intitule: "Offre", valeur: NOM_OFFRE[donnees.offre], fort: true },
    { intitule: "Nom", valeur: donnees.nom },
    { intitule: "Société", valeur: donnees.societe?.trim() || "—" },
    { intitule: "E-mail", valeur: donnees.email },
    { intitule: "Téléphone", valeur: donnees.telephone?.trim() || "—" },
    { intitule: "Logements", valeur: donnees.logements?.trim() || "—" },
  ];

  return composer({
    sujet: `Devis ${NOM_OFFRE[donnees.offre]} — ${donnees.societe?.trim() || donnees.nom}`,
    apercu: `${donnees.nom} demande un devis ${NOM_OFFRE[donnees.offre]}.`,
    titre: "Nouvelle demande de devis",
    corps: [
      `${donnees.nom} vient de demander un devis pour l’offre ${NOM_OFFRE[donnees.offre]}.`,
      donnees.message?.trim() || "(aucun message)",
      "Répondez directement à ce courriel : la réponse partira vers le demandeur.",
    ],
    titreFaits: "Le demandeur",
    faits,
    bouton: { libelle: "Ouvrir dans l’administration", href: urlAbsolue("/admin/devis") },
  });
}

/* ══════════════════════════════════════════════════════════════════════════
   5. RÉSILIATION — l'abonnement Confort s'arrêtera
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * L'accusé de résiliation.
 *
 * Il a un travail précis : dissiper la crainte. Quelqu'un qui résilie un
 * abonnement à 1,99 € se demande immédiatement si sa page va disparaître et
 * si sa plaque devient un morceau de bois. La réponse est non dans les deux
 * cas, et elle doit être dite en toutes lettres, tout de suite — pas
 * découverte par soulagement trois semaines plus tard.
 *
 * Il rappelle aussi qu'on peut revenir en arrière. Un client qui a résilié
 * par erreur, ou changé d'avis, ne doit pas avoir à nous écrire pour le
 * défaire.
 */
export async function messageResiliation(
  donnees: {
    prenom?: string;
    nomLogement: string;
    /** Fin de la période payée, en millisecondes. */
    finLe: number | null;
    rythme?: "mensuel" | "annuel";
  },
  textes?: TextesEmails
): Promise<Message> {
  const finTexte = donnees.finLe
    ? new Date(donnees.finLe).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "la fin de votre période en cours";

  const modele = rendre(await texteDe("resiliation", textes), {
    prenom: donnees.prenom,
    logement: donnees.nomLogement,
    fin: finTexte,
  });

  const faits: Fait[] = [
    { intitule: "Logement", valeur: donnees.nomLogement },
    { intitule: "Fin de l’abonnement", valeur: finTexte, fort: true },
    { intitule: "Votre page", valeur: "Reste en ligne, en formule Essentielle" },
    { intitule: "Votre plaque", valeur: "Continue de fonctionner" },
  ];
  if (donnees.rythme) {
    faits.splice(1, 0, {
      intitule: "Formule quittée",
      valeur: donnees.rythme === "annuel" ? "Confort, 19 €/an" : "Confort, 1,99 €/mois",
    });
  }

  return composer({
    sujet: modele.sujet,
    apercu: "Votre page reste en ligne, et votre plaque continue de fonctionner.",
    titre: modele.titre,
    corps: modele.paragraphes,
    titreFaits: "Ce qui se passe",
    faits,
    bouton: { libelle: "Voir mon espace", href: urlAbsolue("/proprietaire/dashboard") },
    postScriptum: modele.postScriptum,
  });
}

/** Les textes d'origine, pour l'administration. */
export { TEXTES_PAR_DEFAUT };
