"use server";

import { adminDb } from "@/lib/firebase/admin";
import { Accommodation } from "@/lib/types/accommodation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const COLLECTION_NAME = "accommodations";

async function requireAdminAuth() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_auth")?.value === "true";
  if (!isAdmin) {
    throw new Error("Unauthorized access. Admin privileges required.");
  }
}

export async function getAdminAccommodations(): Promise<Accommodation[]> {
  await requireAdminAuth();
  try {
    const snapshot = await adminDb.collection(COLLECTION_NAME).get();
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Accommodation[];
  } catch (error) {
    console.error("Error fetching admin accommodations", error);
    return [];
  }
}

export async function toggleAccommodationStatus(id: string, currentStatus: boolean) {
  await requireAdminAuth();
  try {
    await adminDb.collection(COLLECTION_NAME).doc(id).update({
      isActive: !currentStatus,
      updatedAt: Date.now()
    });
    revalidatePath("/admin/hebergements");
  } catch (error) {
    console.error("Error toggling status", error);
    throw new Error("Failed to update status");
  }
}

export async function deleteAdminAccommodation(id: string) {
  await requireAdminAuth();
  try {
    await adminDb.collection(COLLECTION_NAME).doc(id).delete();
    revalidatePath("/admin/hebergements");
  } catch (error) {
    console.error("Error deleting accommodation", error);
    throw new Error("Failed to delete accommodation");
  }
}

export async function seedDemos(demoEssentielle: any, demoConfort: any) {
  await requireAdminAuth();
  try {
    const timestamp = Date.now();
    
    // Check if demo-essentielle exists, update or create
    const essSnapshot = await adminDb.collection(COLLECTION_NAME).where("slug", "==", "demo-essentielle").get();
    if (!essSnapshot.empty) {
      await adminDb.collection(COLLECTION_NAME).doc(essSnapshot.docs[0].id).update({ ...demoEssentielle, updatedAt: timestamp });
    } else {
      await adminDb.collection(COLLECTION_NAME).add({ ...demoEssentielle, createdAt: timestamp, updatedAt: timestamp });
    }

    // Check if demo-confort exists, update or create
    const confSnapshot = await adminDb.collection(COLLECTION_NAME).where("slug", "==", "demo-confort").get();
    if (!confSnapshot.empty) {
      await adminDb.collection(COLLECTION_NAME).doc(confSnapshot.docs[0].id).update({ ...demoConfort, updatedAt: timestamp });
    } else {
      await adminDb.collection(COLLECTION_NAME).add({ ...demoConfort, createdAt: timestamp, updatedAt: timestamp });
    }
  } catch (error) {
    console.error("Error seeding demos", error);
    throw new Error("Failed to seed demos");
  }
}

export async function getAdminAccommodationById(id: string): Promise<Accommodation | null> {
  await requireAdminAuth();
  try {
    const doc = await adminDb.collection(COLLECTION_NAME).doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Accommodation;
  } catch (error) {
    console.error("Error fetching accommodation", error);
    return null;
  }
}

export async function updateAdminAccommodation(id: string, data: Partial<Accommodation>) {
  await requireAdminAuth();
  try {
    await adminDb.collection(COLLECTION_NAME).doc(id).update({
      ...data,
      updatedAt: Date.now()
    });
    revalidatePath("/admin/hebergements");
    revalidatePath(`/admin/hebergements/${id}`);
  } catch (error) {
    console.error("Error updating accommodation", error);
    throw new Error("Failed to update accommodation");
  }
}

export async function createAdminAccommodation(data: Omit<Accommodation, "id" | "createdAt" | "updatedAt">) {
  await requireAdminAuth();
  try {
    const timestamp = Date.now();
    const docRef = await adminDb.collection(COLLECTION_NAME).add({
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp
    });
    revalidatePath("/admin/hebergements");
    return docRef.id;
  } catch (error) {
    console.error("Error creating accommodation", error);
    throw new Error("Failed to create accommodation");
  }
}

export async function uploadAdminImageAction(formData: FormData, folder: string) {
  await requireAdminAuth();
  try {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExtension = file.name.split('.').pop();
    const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    const fileName = `${uniqueId}.${fileExtension}`;
    const filePath = `${folder}/${fileName}`;

    // On utilise uuid de Node pour le token (on installe uuid si nécessaire ou on fait un simple math random mais un uuid est mieux)
    // Pour simplifier et éviter une dépendance, on génère un UUID simple
    const token = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
    
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "plaques-digital.firebasestorage.app";
    const bucket = (await import("@/lib/firebase/admin")).adminStorage.bucket(bucketName);
    const fileRef = bucket.file(filePath);
    
    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: {
          firebaseStorageDownloadTokens: token
        }
      }
    });
    
    return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;
  } catch (error) {
    console.error("Error uploading image via admin", error);
    throw new Error("Failed to upload image");
  }
}
