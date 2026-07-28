"use server";

import { adminDb } from "@/lib/firebase/admin";
import { Accommodation, InventoryReport, CleaningLog } from "@/lib/types/accommodation";
import { revalidatePath } from "next/cache";

const COLLECTION_NAME = "accommodations";

export async function fetchPublicAccommodation(slug: string): Promise<Accommodation | null> {
  try {
    const snapshot = await adminDb
      .collection(COLLECTION_NAME)
      .where("slug", "==", slug)
      .get();

    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Accommodation;
    }
    return null;
  } catch (error) {
    console.error("Error fetching public accommodation:", error);
    return null;
  }
}

export async function submitCleaningLogAction(slug: string, agentName: string): Promise<{ success: boolean; error?: string }> {
  try {
    const snapshot = await adminDb
      .collection(COLLECTION_NAME)
      .where("slug", "==", slug)
      .get();

    if (snapshot.empty) {
      return { success: false, error: "Hébergement introuvable" };
    }

    const docRef = snapshot.docs[0].ref;
    const data = snapshot.docs[0].data() as Accommodation;

    const newLog = {
      date: Date.now(),
      agentName: agentName.trim() || "Agent d'entretien",
    };

    const updatedLogs = [...(data.cleaningLogs || []), newLog];

    await docRef.update({
      cleaningLogs: updatedLogs,
      updatedAt: Date.now(),
    });

    revalidatePath(`/h/${slug}/menage`);
    revalidatePath(`/h/${slug}`);
    revalidatePath(`/proprietaire/dashboard`);

    return { success: true };
  } catch (error: any) {
    console.error("Error submitting cleaning log:", error);
    return {
      success: false,
      error: error?.message || "Une erreur est survenue lors de l'enregistrement",
    };
  }
}

export async function submitInventoryReportAction(
  slug: string,
  reportData: Omit<InventoryReport, "id" | "date"> & { id?: string; date?: number }
): Promise<{ success: boolean; error?: string }> {
  try {
    const snapshot = await adminDb
      .collection(COLLECTION_NAME)
      .where("slug", "==", slug)
      .get();

    if (snapshot.empty) {
      return { success: false, error: "Hébergement introuvable" };
    }

    const docRef = snapshot.docs[0].ref;
    const data = snapshot.docs[0].data() as Accommodation;

    const newReport: InventoryReport = {
      id:
        reportData.id ||
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 15) + Date.now().toString(36)),
      date: reportData.date || Date.now(),
      type: reportData.type,
      travelerName: (reportData.travelerName || "Voyageur").trim(),
      notes: reportData.notes || "",
      photos: reportData.photos || [],
    };

    const updatedInventories = [...(data.inventories || []), newReport];

    await docRef.update({
      inventories: updatedInventories,
      updatedAt: Date.now(),
    });

    revalidatePath(`/h/${slug}/etat-des-lieux`);
    revalidatePath(`/h/${slug}`);
    revalidatePath(`/proprietaire/dashboard`);

    return { success: true };
  } catch (error: any) {
    console.error("Error submitting inventory report:", error);
    return {
      success: false,
      error: error?.message || "Une erreur est survenue lors de l'envoi de l'état des lieux",
    };
  }
}

export async function startCleaningLogAction(slug: string, agentName: string): Promise<{ success: boolean; logId?: string; error?: string }> {
  try {
    const snapshot = await adminDb
      .collection(COLLECTION_NAME)
      .where("slug", "==", slug)
      .get();

    if (snapshot.empty) {
      return { success: false, error: "Hébergement introuvable" };
    }

    const docRef = snapshot.docs[0].ref;
    const data = snapshot.docs[0].data() as Accommodation;

    const logId = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15) + Date.now().toString(36);

    const now = Date.now();
    const newLog: CleaningLog = {
      id: logId,
      date: now,
      startTime: now,
      agentName: agentName.trim() || "Agent d'entretien / Société",
      status: "in_progress",
    };

    const updatedLogs = [...(data.cleaningLogs || []), newLog];

    await docRef.update({
      cleaningLogs: updatedLogs,
      updatedAt: now,
    });

    revalidatePath(`/h/${slug}/menage`);
    revalidatePath(`/h/${slug}`);
    revalidatePath(`/proprietaire/dashboard`);

    return { success: true, logId };
  } catch (error: any) {
    console.error("Error starting cleaning log:", error);
    return {
      success: false,
      error: error?.message || "Erreur lors du pointage d'arrivée",
    };
  }
}

export async function endCleaningLogAction(slug: string, logId: string): Promise<{ success: boolean; durationMinutes?: number; error?: string }> {
  try {
    const snapshot = await adminDb
      .collection(COLLECTION_NAME)
      .where("slug", "==", slug)
      .get();

    if (snapshot.empty) {
      return { success: false, error: "Hébergement introuvable" };
    }

    const docRef = snapshot.docs[0].ref;
    const data = snapshot.docs[0].data() as Accommodation;
    const logs = data.cleaningLogs || [];

    let targetIndex = logs.findIndex((l) => l.id === logId && l.status === "in_progress");
    if (targetIndex === -1) {
      for (let i = logs.length - 1; i >= 0; i--) {
        if (logs[i].status === "in_progress") {
          targetIndex = i;
          break;
        }
      }
    }

    if (targetIndex === -1) {
      return { success: false, error: "Aucun pointage de ménage en cours n'a été trouvé." };
    }

    const targetLog = logs[targetIndex];
    const endTime = Date.now();
    const startTime = targetLog.startTime || targetLog.date;
    const durationMinutes = Math.max(1, Math.round((endTime - startTime) / 60000));

    const updatedLog: CleaningLog = {
      ...targetLog,
      endTime,
      durationMinutes,
      status: "completed",
    };

    const updatedLogs = [...logs];
    updatedLogs[targetIndex] = updatedLog;

    await docRef.update({
      cleaningLogs: updatedLogs,
      updatedAt: endTime,
    });

    revalidatePath(`/h/${slug}/menage`);
    revalidatePath(`/h/${slug}`);
    revalidatePath(`/proprietaire/dashboard`);

    return { success: true, durationMinutes };
  } catch (error: any) {
    console.error("Error ending cleaning log:", error);
    return {
      success: false,
      error: error?.message || "Erreur lors de la validation du départ",
    };
  }
}

export async function toggleAccommodationModuleAction(
  id: string,
  feature: "inventory" | "cleaning",
  enabled: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = adminDb.collection("accommodations").doc(id);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return { success: false, error: "Hébergement introuvable" };
    }

    await docRef.update({
      [`features.${feature}`]: enabled,
      updatedAt: Date.now(),
    });

    revalidatePath(`/proprietaire/dashboard/${id}`);
    revalidatePath(`/proprietaire/dashboard`);
    const data = docSnap.data();
    if (data && data.slug) {
      revalidatePath(`/h/${data.slug}`);
      revalidatePath(`/h/${data.slug}/menage`);
      revalidatePath(`/h/${data.slug}/etat-des-lieux`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error toggling feature:", error);
    return {
      success: false,
      error: error?.message || "Erreur lors de l'activation/désactivation du module",
    };
  }
}
