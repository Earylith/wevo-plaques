"use server";

import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { ModuleId } from "@/lib/types/accommodation";

/**
 * Mesure d'usage du livret.
 *
 * Volontairement minimale : on compte des OUVERTURES, pas des personnes.
 * Aucun identifiant, aucun cookie, aucune adresse IP — juste des compteurs
 * agrégés par livret. C'est suffisant pour dire à l'hôte ce que ses voyageurs
 * cherchent, sans rien collecter de personnel.
 */

const STATS = "stats";

/** Un compteur par jour, pour distinguer l'avant-arrivée du pendant-séjour. */
function dayKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/** Tranche horaire, pour savoir QUAND le livret est consulté. */
function hourBucket(now: Date): string {
  const h = now.getUTCHours();
  if (h < 6) return "nuit";
  if (h < 12) return "matin";
  if (h < 18) return "apresmidi";
  return "soir";
}

/**
 * Enregistre l'ouverture d'un livret.
 *
 * Les erreurs sont avalées : une statistique n'a jamais à casser l'affichage
 * du livret pour un voyageur.
 */
export async function trackLivretOpen(accommodationId: string, viaQr: boolean) {
  if (!accommodationId) return;
  try {
    const now = new Date();
    // Cartes IMBRIQUÉES, pas de clés pointées : `set()` ne lit pas un point
    // comme un chemin de champ (contrairement à `update()`), il créerait un
    // champ littéralement nommé « byDay.2026-08-29 ». Or `update()` échouerait
    // sur un livret qui n'a encore aucune statistique.
    await adminDb.collection(STATS).doc(accommodationId).set(
      {
        opens: FieldValue.increment(1),
        qrScans: FieldValue.increment(viaQr ? 1 : 0),
        byDay: { [dayKey(now)]: FieldValue.increment(1) },
        byHour: { [hourBucket(now)]: FieldValue.increment(1) },
        lastOpenAt: now.getTime(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("[trackLivretOpen]", error);
  }
}

/** Enregistre l'ouverture d'une rubrique. */
export async function trackModuleOpen(accommodationId: string, moduleId: ModuleId) {
  if (!accommodationId || !moduleId) return;
  try {
    await adminDb.collection(STATS).doc(accommodationId).set(
      { modules: { [moduleId]: FieldValue.increment(1) } },
      { merge: true }
    );
  } catch (error) {
    console.error("[trackModuleOpen]", error);
  }
}
