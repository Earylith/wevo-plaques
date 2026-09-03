"use server";

import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { Accommodation, PlaqueOrder, OfferType } from "@/lib/types/accommodation";

/**
 * Qui s'est inscrit, et où il en est.
 *
 * Deux mondes à réconcilier : les COMPTES vivent dans Firebase Auth — c'est
 * lui qui sait quand quelqu'un s'est inscrit et quand il s'est connecté pour
 * la dernière fois — et les LIVRETS vivent dans Firestore. Ni l'un ni l'autre
 * ne suffit : un compte sans livret est une inscription abandonnée dès la
 * première minute, et un livret sans compte est une page composée par Guidz.
 *
 * L'écran sert à relancer. Il est donc construit autour d'une seule question :
 * cette personne a-t-elle décroché, et depuis quand ?
 */

const ACCOMMODATIONS = "accommodations";
const ORDERS = "orders";

async function exigerAdmin() {
  const cookieStore = await cookies();
  if (cookieStore.get("admin_auth")?.value !== "true") {
    throw new Error("Accès réservé.");
  }
}

export interface Inscrit {
  uid: string;
  email: string;
  nom: string;
  /** Comment il s'est inscrit : mot de passe, Google… */
  fournisseur: string;
  inscritLe: number | null;
  derniereConnexion: number | null;

  /* Son livret, s'il en a un. */
  livretId: string | null;
  livretNom: string | null;
  slug: string | null;
  formule: OfferType | null;
  enLigne: boolean;
  paye: boolean;
  payeLe: number | null;
  abonne: boolean;
  /** Dernier passage dans l'éditeur — mesuré, pas déduit. */
  derniereVisite: number | null;
  /** Dernier enregistrement : il prouve qu'il a modifié, pas seulement ouvert. */
  derniereModification: number | null;
  /** Commande de plaque en cours, s'il y en a une. */
  commandeStatut: string | null;

  /**
   * Là où la personne s'est arrêtée. C'est la colonne qui décide d'une
   * relance, et le reste de l'écran est là pour l'expliquer.
   */
  etape: "sans-livret" | "brouillon" | "publie";
}

export async function listerInscrits(): Promise<Inscrit[]> {
  await exigerAdmin();

  /*
   * Les trois lectures sont indépendantes : on les mène de front. Firebase
   * Auth pagine à mille comptes — largement au-delà de ce que Guidz aura
   * avant longtemps, et la page suivante se demandera le jour venu.
   */
  const [comptes, livretsSnap, commandesSnap] = await Promise.all([
    adminAuth.listUsers(1000),
    adminDb.collection(ACCOMMODATIONS).get(),
    adminDb.collection(ORDERS).get().catch(() => null),
  ]);

  /* Un livret par propriétaire : on l'indexe par UID. */
  const parProprietaire = new Map<string, Accommodation & { id: string }>();
  for (const doc of livretsSnap.docs) {
    const livret = { ...(doc.data() as Accommodation), id: doc.id };
    if (livret.ownerUid) parProprietaire.set(livret.ownerUid, livret);
  }

  /* La commande vivante la plus récente, par livret. */
  const commandeParLivret = new Map<string, PlaqueOrder>();
  for (const doc of commandesSnap?.docs || []) {
    const commande = doc.data() as PlaqueOrder;
    if (!commande.accommodationId || commande.status === "annulee") continue;
    const connue = commandeParLivret.get(commande.accommodationId);
    if (!connue || commande.createdAt > connue.createdAt) {
      commandeParLivret.set(commande.accommodationId, commande);
    }
  }

  const enMs = (v?: string) => (v ? new Date(v).getTime() : null);

  return comptes.users
    .map((u): Inscrit => {
      const livret = parProprietaire.get(u.uid) || null;
      const commande = livret ? commandeParLivret.get(livret.id) : undefined;

      return {
        uid: u.uid,
        email: u.email || "",
        nom: u.displayName || livret?.owner?.name || "",
        fournisseur:
          u.providerData[0]?.providerId === "google.com"
            ? "Google"
            : u.providerData[0]?.providerId === "password"
              ? "Mot de passe"
              : u.providerData[0]?.providerId || "—",
        inscritLe: enMs(u.metadata.creationTime),
        derniereConnexion: enMs(u.metadata.lastSignInTime),

        livretId: livret?.id || null,
        livretNom: livret?.property?.name || null,
        slug: livret?.slug || null,
        formule: livret?.offerType || null,
        enLigne: Boolean(livret?.isActive),
        paye: Boolean(livret?.paidAt),
        payeLe: livret?.paidAt || null,
        abonne: Boolean(livret?.stripeSubscriptionId),
        derniereVisite: livret?.derniereVisiteEditeur || null,
        derniereModification: livret?.updatedAt || null,
        commandeStatut: commande?.status || null,

        etape: !livret ? "sans-livret" : livret.isActive ? "publie" : "brouillon",
      };
    })
    /*
     * Les inscrits récents d'abord : c'est là que se joue une relance utile.
     * Un compte de six mois qui n'a jamais rien fait ne se rattrape pas d'un
     * courriel, celui d'avant-hier peut-être.
     */
    .sort((a, b) => (b.inscritLe || 0) - (a.inscritLe || 0));
}
