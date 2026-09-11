"use server";

import { randomUUID } from "node:crypto";
import type { DocumentReference } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { hasValidAdminSession } from "@/lib/server/admin-auth";
import type { Accommodation, CleaningLog, InventoryReport } from "@/lib/types/accommodation";
import { revalidatePath } from "next/cache";

const COLLECTION_NAME = "accommodations";

export interface PublicModuleAccommodation {
  id: string;
  slug: string;
  offerType: Accommodation["offerType"];
  isActive: boolean;
  property: { name: string };
  features?: Accommodation["features"];
  cleaningLogs?: CleaningLog[];
  canManage: boolean;
}

export interface PublicPortfolioAccommodation {
  id: string;
  slug: string;
  offerType: Accommodation["offerType"];
  ownerName: string;
  property: {
    name: string;
    city: string;
    type: string;
    mainImageUrl?: string;
  };
}

type MutationIdentity = { admin: true; uid: null } | { admin: false; uid: string };

function slugValide(slug: string): boolean {
  return /^[a-z0-9][a-z0-9-]{0,159}$/.test(slug);
}

async function identiteMutation(jetonHote?: string): Promise<MutationIdentity> {
  if (await hasValidAdminSession()) return { admin: true, uid: null };
  if (!jetonHote) throw new Error("Connectez-vous pour effectuer cette opération.");
  const token = await adminAuth.verifyIdToken(jetonHote, true);
  return { admin: false, uid: token.uid };
}

function autorisee(livret: Accommodation, identite: MutationIdentity): boolean {
  return identite.admin || Boolean(livret.ownerUid && livret.ownerUid === identite.uid);
}

async function trouverParSlug(slug: string): Promise<DocumentReference | null> {
  if (!slugValide(slug)) return null;
  const snapshot = await adminDb
    .collection(COLLECTION_NAME)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  return snapshot.empty ? null : snapshot.docs[0].ref;
}

/** DTO volontairement minimal : aucun identifiant Stripe ni coordonnée privée. */
export async function fetchPublicAccommodation(
  slug: string,
  jetonHote?: string
): Promise<PublicModuleAccommodation | null> {
  try {
    const ref = await trouverParSlug(slug);
    if (!ref) return null;
    const doc = await ref.get();
    const data = doc.data() as Accommodation;
    if (!data.isActive) return null;

    let canManage = await hasValidAdminSession();
    if (!canManage && jetonHote) {
      try {
        const token = await adminAuth.verifyIdToken(jetonHote, true);
        canManage = Boolean(data.ownerUid && data.ownerUid === token.uid);
      } catch {
        canManage = false;
      }
    }

    return {
      id: doc.id,
      slug: data.slug,
      offerType: data.offerType,
      isActive: true,
      property: { name: data.property?.name || "" },
      features: data.features
        ? { inventory: data.features.inventory, cleaning: data.features.cleaning }
        : undefined,
      cleaningLogs: canManage ? (data.cleaningLogs || []) : undefined,
      canManage,
    };
  } catch (error) {
    console.error("Error fetching public accommodation:", error);
    return null;
  }
}

export async function fetchPublicOwnerPortfolio(
  ownerSlug: string
): Promise<PublicPortfolioAccommodation[]> {
  if (!slugValide(ownerSlug)) return [];
  try {
    const snapshot = await adminDb
      .collection(COLLECTION_NAME)
      .where("owner.slug", "==", ownerSlug)
      .where("isActive", "==", true)
      .limit(100)
      .get();
    return snapshot.docs.map((doc) => {
      const data = doc.data() as Accommodation;
      return {
        id: doc.id,
        slug: data.slug,
        offerType: data.offerType,
        ownerName: data.owner?.name || "",
        property: {
          name: data.property?.name || "",
          city: data.property?.city || "",
          type: data.property?.type || "",
          mainImageUrl: data.property?.mainImageUrl,
        },
      };
    });
  } catch (error) {
    console.error("Error fetching public portfolio:", error);
    return [];
  }
}

export async function submitInventoryReportAction(
  slug: string,
  reportData: Omit<InventoryReport, "id" | "date"> & { id?: string; date?: number },
  jetonHote?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const [ref, identite] = await Promise.all([trouverParSlug(slug), identiteMutation(jetonHote)]);
    if (!ref) return { success: false, error: "Hébergement introuvable" };
    if (reportData.type !== "arrival" && reportData.type !== "departure") {
      return { success: false, error: "Type d’état des lieux invalide" };
    }

    const photos = (reportData.photos || []).slice(0, 5).filter((url) => {
      try {
        return new URL(url).hostname === "firebasestorage.googleapis.com";
      } catch {
        return false;
      }
    });
    const newReport: InventoryReport = {
      id: randomUUID(),
      date: Date.now(),
      type: reportData.type,
      travelerName: String(reportData.travelerName || "Voyageur").trim().slice(0, 120),
      notes: String(reportData.notes || "").trim().slice(0, 4000),
      photos,
    };

    await adminDb.runTransaction(async (transaction) => {
      const current = await transaction.get(ref);
      if (!current.exists) throw new Error("Hébergement introuvable");
      const data = current.data() as Accommodation;
      if (!autorisee(data, identite)) throw new Error("Accès refusé à ce livret.");
      if (!data.isActive || data.offerType !== "comfort" || data.features?.inventory === false) {
        throw new Error("Le module d’état des lieux n’est pas actif.");
      }
      transaction.update(ref, {
        inventories: [...(data.inventories || []).slice(-199), newReport],
        updatedAt: Date.now(),
      });
    });

    revalidatePath(`/h/${slug}/etat-des-lieux`);
    revalidatePath(`/proprietaire/dashboard`);
    return { success: true };
  } catch (error) {
    console.error("Error submitting inventory report:", error);
    return { success: false, error: error instanceof Error ? error.message : "Envoi impossible" };
  }
}

export async function startCleaningLogAction(
  slug: string,
  agentName: string,
  jetonHote?: string
): Promise<{ success: boolean; logId?: string; error?: string }> {
  try {
    const [ref, identite] = await Promise.all([trouverParSlug(slug), identiteMutation(jetonHote)]);
    if (!ref) return { success: false, error: "Hébergement introuvable" };
    const now = Date.now();
    const logId = randomUUID();
    const newLog: CleaningLog = {
      id: logId,
      date: now,
      startTime: now,
      agentName: String(agentName || "Agent d'entretien / Société").trim().slice(0, 120),
      status: "in_progress",
    };

    await adminDb.runTransaction(async (transaction) => {
      const current = await transaction.get(ref);
      if (!current.exists) throw new Error("Hébergement introuvable");
      const data = current.data() as Accommodation;
      if (!autorisee(data, identite)) throw new Error("Accès refusé à ce livret.");
      if (!data.isActive || data.offerType !== "comfort" || data.features?.cleaning === false) {
        throw new Error("Le module de ménage n’est pas actif.");
      }
      transaction.update(ref, {
        cleaningLogs: [...(data.cleaningLogs || []).slice(-499), newLog],
        updatedAt: now,
      });
    });

    revalidatePath(`/h/${slug}/menage`);
    revalidatePath(`/proprietaire/dashboard`);
    return { success: true, logId };
  } catch (error) {
    console.error("Error starting cleaning log:", error);
    return { success: false, error: error instanceof Error ? error.message : "Pointage impossible" };
  }
}

export async function endCleaningLogAction(
  slug: string,
  logId: string,
  jetonHote?: string
): Promise<{ success: boolean; durationMinutes?: number; error?: string }> {
  try {
    if (!/^[0-9a-f-]{36}$/i.test(logId)) return { success: false, error: "Pointage invalide" };
    const [ref, identite] = await Promise.all([trouverParSlug(slug), identiteMutation(jetonHote)]);
    if (!ref) return { success: false, error: "Hébergement introuvable" };
    let durationMinutes = 0;

    await adminDb.runTransaction(async (transaction) => {
      const current = await transaction.get(ref);
      if (!current.exists) throw new Error("Hébergement introuvable");
      const data = current.data() as Accommodation;
      if (!autorisee(data, identite)) throw new Error("Accès refusé à ce livret.");
      const logs = data.cleaningLogs || [];
      const targetIndex = logs.findIndex((log) => log.id === logId && log.status === "in_progress");
      if (targetIndex === -1) throw new Error("Ce pointage en cours n’existe pas.");

      const endTime = Date.now();
      const target = logs[targetIndex];
      durationMinutes = Math.max(1, Math.round((endTime - (target.startTime || target.date)) / 60000));
      const updatedLogs = [...logs];
      updatedLogs[targetIndex] = {
        ...target,
        endTime,
        durationMinutes,
        status: "completed",
      };
      transaction.update(ref, { cleaningLogs: updatedLogs, updatedAt: endTime });
    });

    revalidatePath(`/h/${slug}/menage`);
    revalidatePath(`/proprietaire/dashboard`);
    return { success: true, durationMinutes };
  } catch (error) {
    console.error("Error ending cleaning log:", error);
    return { success: false, error: error instanceof Error ? error.message : "Validation impossible" };
  }
}
