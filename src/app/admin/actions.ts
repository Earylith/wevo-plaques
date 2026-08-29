"use server";

import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { Accommodation } from "@/lib/types/accommodation";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const COLLECTION_NAME = "accommodations";

/**
 * Borne les appels Firestore.
 *
 * Le SDK gRPC réessaie plus d'une minute quand le réseau est coupé : sans
 * cette limite, l'admin reste figé sur un écran de chargement au lieu
 * d'afficher une erreur exploitable.
 */
const FIRESTORE_TIMEOUT_MS = 8000;

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`Firestore injoignable (${label}). Vérifiez votre connexion, puis réessayez.`)),
      FIRESTORE_TIMEOUT_MS
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer)) as Promise<T>;
}

async function requireAdminAuth() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get("admin_auth")?.value === "true";
  if (!isAdmin) {
    throw new Error("Unauthorized access. Admin privileges required.");
  }
}

/**
 * Firestore refuse les valeurs `undefined` : toute écriture contenant une clé
 * indéfinie (imbriquée ou dans un tableau) échoue avec
 * "Cannot use 'undefined' as a Firestore value".
 *
 * Le formulaire d'édition manipule un objet Accommodation dont une bonne
 * moitié des champs sont optionnels : on nettoie donc systématiquement la
 * charge utile avant écriture, en profondeur.
 */
function sanitizeForFirestore<T>(value: T): T {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    // Les trous sont retirés plutôt que remplacés par null : aucun composant
    // ne teste `item === null`, un null ferait planter les `.map()` de rendu.
    return value
      .filter((item) => item !== undefined && item !== null)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }

  if (value instanceof Date) return value;

  // Les sentinelles (FieldValue.delete(), serverTimestamp()…) doivent traverser
  // intactes : les parcourir comme un objet ordinaire les réduirait à `{}`.
  if (value instanceof FieldValue) return value;

  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, raw] of Object.entries(value as Record<string, unknown>)) {
      if (raw === undefined) continue;
      out[key] = sanitizeForFirestore(raw);
    }
    return out as T;
  }

  return value;
}

/** Invalide toutes les routes qui affichent un livret donné. */
function revalidateAccommodation(id: string, slug?: string) {
  revalidatePath("/admin/hebergements");
  revalidatePath(`/admin/hebergements/${id}`);
  if (slug) {
    revalidatePath(`/h/${slug}`);
    if (slug === "demo-confort2") revalidatePath("/demo-confort2");
    if (slug === "demo-confort") revalidatePath("/demo-confort");
    if (slug === "demo-essentielle") revalidatePath("/demo-essentielle");
  }
  // Pas de revalidatePath("/", "layout") ici : l'enregistrement automatique
  // se déclenche toutes les quelques secondes, purger tout le cache de
  // l'application à chaque frappe serait hors de proportion.
}

export async function getAdminAccommodations(): Promise<Accommodation[]> {
  await requireAdminAuth();
  try {
    const snapshot = await withTimeout(adminDb.collection(COLLECTION_NAME).get(), "liste des livrets");
    const items = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    })) as Accommodation[];

    const hasDemoConfort2 = items.some(item => item.id === "demo-confort2" || item.slug === "demo-confort2");
    if (!hasDemoConfort2) {
      const { demoConfortMarseille } = await import("@/lib/demoData");
      items.push(demoConfortMarseille);
    }
    return items;
  } catch (error) {
    console.error("Error fetching admin accommodations", error);
    // Surtout pas de repli sur la démo ici : afficher du contenu de démo à la
    // place du vrai catalogue conduirait l'admin à l'écraser au prochain
    // enregistrement. On laisse l'erreur remonter.
    throw new Error(
      error instanceof Error
        ? error.message
        : "Impossible de charger les hébergements depuis Firestore."
    );
  }
}

export async function toggleAccommodationStatus(id: string, currentStatus: boolean) {
  await requireAdminAuth();
  try {
    const docRef = adminDb.collection(COLLECTION_NAME).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      // Ne jamais matérialiser un livret à partir de la démo sur un simple
      // basculement de statut : cela créerait un livret au contenu d'emprunt.
      throw new Error("Livret introuvable — ouvrez-le et enregistrez-le d'abord.");
    }
    const current = doc.data() as Accommodation;
    await docRef.update(
      sanitizeForFirestore({
        isActive: !currentStatus,
        updatedAt: Date.now(),
      }) as Record<string, unknown>
    );
    // La page publique doit refléter le changement, pas seulement la liste admin.
    revalidateAccommodation(id, current.slug);
  } catch (error) {
    console.error("Error toggling status", error);
    throw new Error(error instanceof Error ? error.message : "Failed to update status");
  }
}

/**
 * Détache le compte propriétaire d'un livret.
 *
 * Utilise `FieldValue.delete()` plutôt qu'une écriture à `null` : on veut que
 * les clés disparaissent du document, pas qu'elles restent présentes à null
 * (`"ownerUid" in data` resterait vrai et piégerait toute logique ultérieure).
 */
export async function detachOwnerAccount(id: string) {
  await requireAdminAuth();
  try {
    const docRef = adminDb.collection(COLLECTION_NAME).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return { ok: false as const };
    const current = doc.data() as Accommodation;
    await docRef.update({
      ownerUid: FieldValue.delete(),
      mustChangePassword: FieldValue.delete(),
      updatedAt: Date.now(),
    });
    revalidateAccommodation(id, current.slug);
    return { ok: true as const };
  } catch (error) {
    console.error("Error detaching owner account", error);
    throw new Error("Impossible de détacher le compte propriétaire.");
  }
}

/**
 * Duplique un livret pour un second logement.
 *
 * La copie repart en BROUILLON avec un slug libre : on ne veut ni publier
 * involontairement, ni faire pointer deux livrets sur la même URL. L'historique
 * propre au logement d'origine (ménages, états des lieux, compte propriétaire)
 * n'est jamais recopié.
 */
export async function duplicateAdminAccommodation(id: string) {
  await requireAdminAuth();
  try {
    const source = await withTimeout(
      adminDb.collection(COLLECTION_NAME).doc(id).get(),
      `livret ${id}`
    );
    if (!source.exists) throw new Error("Livret introuvable.");

    const data = source.data() as Accommodation;
    const copy: Partial<Accommodation> = { ...data };
    for (const key of [
      "id", "ownerUid", "mustChangePassword", "publishedAt",
      "cleaningLogs", "inventories", "createdAt", "updatedAt",
    ] as const) {
      delete copy[key];
    }

    // Slug libre : on suffixe jusqu'à en trouver un qui n'existe pas.
    const base = (data.slug || "livret").replace(/-copie(-\d+)?$/, "");
    let slug = `${base}-copie`;
    for (let attempt = 2; attempt <= 30; attempt++) {
      const taken = await withTimeout(
        adminDb.collection(COLLECTION_NAME).where("slug", "==", slug).limit(1).get(),
        `slug ${slug}`
      );
      if (taken.empty) break;
      slug = `${base}-copie-${attempt}`;
    }

    const timestamp = Date.now();
    const docRef = await adminDb.collection(COLLECTION_NAME).add(
      sanitizeForFirestore({
        ...copy,
        slug,
        isActive: false,
        property: { ...data.property, name: `${data.property?.name || "Livret"} (copie)` },
        createdAt: timestamp,
        updatedAt: timestamp,
      }) as Record<string, unknown>
    );

    revalidatePath("/admin/hebergements");
    return { id: docRef.id, slug };
  } catch (error) {
    console.error("Error duplicating accommodation", error);
    throw new Error(error instanceof Error ? error.message : "La duplication a échoué.");
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

/**
 * Charge utile de peuplement : un livret complet, dont les horodatages sont
 * posés par l'action elle-même.
 */
type DemoSeed = Omit<Accommodation, "createdAt" | "updatedAt"> &
  Partial<Pick<Accommodation, "createdAt" | "updatedAt">>;

export async function seedDemos(
  demoEssentielle: DemoSeed,
  demoConfort: DemoSeed,
  demoConfort2?: DemoSeed
) {
  await requireAdminAuth();
  try {
    const timestamp = Date.now();
    
    // Check if demo-essentielle exists, update or create
    const essSnapshot = await adminDb.collection(COLLECTION_NAME).where("slug", "==", "demo-essentielle").get();
    if (!essSnapshot.empty) {
      await adminDb.collection(COLLECTION_NAME).doc(essSnapshot.docs[0].id).update(sanitizeForFirestore({ ...demoEssentielle, updatedAt: timestamp }) as Record<string, unknown>);
    } else {
      await adminDb.collection(COLLECTION_NAME).doc("demo-essentielle").set(sanitizeForFirestore({ ...demoEssentielle, createdAt: timestamp, updatedAt: timestamp }) as Record<string, unknown>);
    }

    // Check if demo-confort exists, update or create
    const confSnapshot = await adminDb.collection(COLLECTION_NAME).where("slug", "==", "demo-confort").get();
    if (!confSnapshot.empty) {
      await adminDb.collection(COLLECTION_NAME).doc(confSnapshot.docs[0].id).update(sanitizeForFirestore({ ...demoConfort, updatedAt: timestamp }) as Record<string, unknown>);
    } else {
      await adminDb.collection(COLLECTION_NAME).doc("demo-confort").set(sanitizeForFirestore({ ...demoConfort, createdAt: timestamp, updatedAt: timestamp }) as Record<string, unknown>);
    }

    // Check if demo-confort2 exists, update or create
    const { demoConfortMarseille } = await import("@/lib/demoData");
    const demo2Data = demoConfort2 || demoConfortMarseille;
    const conf2Snapshot = await adminDb.collection(COLLECTION_NAME).where("slug", "==", "demo-confort2").get();
    if (!conf2Snapshot.empty) {
      await adminDb.collection(COLLECTION_NAME).doc(conf2Snapshot.docs[0].id).update(sanitizeForFirestore({ ...demo2Data, updatedAt: timestamp }) as Record<string, unknown>);
    } else {
      await adminDb.collection(COLLECTION_NAME).doc("demo-confort2").set(sanitizeForFirestore({ ...demo2Data, createdAt: timestamp, updatedAt: timestamp }) as Record<string, unknown>);
    }
  } catch (error) {
    console.error("Error seeding demos", error);
    throw new Error("Failed to seed demos");
  }
}

export async function getAdminAccommodationById(id: string): Promise<Accommodation | null> {
  await requireAdminAuth();
  try {
    const doc = await withTimeout(adminDb.collection(COLLECTION_NAME).doc(id).get(), `livret ${id}`);
    if (!doc.exists) {
      if (id === "demo-confort2") {
        const { demoConfortMarseille } = await import("@/lib/demoData");
        return demoConfortMarseille;
      }
      return null;
    }
    return { ...doc.data(), id: doc.id } as Accommodation;
  } catch (error) {
    console.error("Error fetching accommodation", error);
    // Pas de repli démo sur erreur : un incident Firestore transitoire ferait
    // afficher la démo, et le prochain enregistrement écraserait le vrai livret.
    throw new Error(
      error instanceof Error
        ? error.message
        : "Impossible de charger ce livret depuis Firestore."
    );
  }
}

/**
 * Refuse d'écrire un slug vide ou déjà pris.
 *
 * Le slug EST l'URL publique. Deux livrets partageant la même valeur, c'est
 * le second qui gagne l'URL pour tout le monde : les QR codes déjà imprimés
 * du premier mènent alors chez son voisin — codes de porte et mot de passe
 * Wi-Fi compris — et les fiches de ménage se rangent dans le mauvais dossier.
 */
async function assertSlugAvailable(slug: string | undefined, selfId?: string) {
  if (slug === undefined) return; // mise à jour partielle : le slug ne change pas

  const clean = slug.trim();
  if (!clean) {
    throw new Error("L’adresse publique ne peut pas être vide.");
  }

  const snapshot = await withTimeout(
    adminDb.collection(COLLECTION_NAME).where("slug", "==", clean).get(),
    `slug ${clean}`
  );
  const clash = snapshot.docs.find((d) => d.id !== selfId);
  if (clash) {
    const owner = (clash.data() as Accommodation).property?.name || clash.id;
    throw new Error(`L’adresse /h/${clean} est déjà utilisée par « ${owner} ». Choisissez-en une autre.`);
  }
}

export async function updateAdminAccommodation(id: string, data: Partial<Accommodation>) {
  await requireAdminAuth();
  try {
    await assertSlugAvailable(data.slug, id);

    const docRef = adminDb.collection(COLLECTION_NAME).doc(id);
    const doc = await withTimeout(docRef.get(), `livret ${id}`);

    // `id` n'a pas à être dupliqué dans le document : il vient de docRef.
    // Un champ `id` stocké finirait par masquer l'identifiant réel à la lecture.
    const rest: Partial<Accommodation> = { ...data };
    delete rest.id;
    const payload = sanitizeForFirestore({ ...rest, updatedAt: Date.now() });

    if (doc.exists) {
      // update() remplace intégralement chaque map de premier niveau fournie
      // (property, wifi, practicalInfo…) : c'est exactement ce que l'on veut,
      // l'éditeur envoie toujours l'objet complet.
      await withTimeout(docRef.update(payload as Record<string, unknown>), "enregistrement");
    } else {
      await withTimeout(
        docRef.set(sanitizeForFirestore({ ...payload, createdAt: Date.now() }) as Record<string, unknown>),
        "création"
      );
    }

    const slug = data.slug || (doc.exists ? (doc.data() as Accommodation | undefined)?.slug : undefined);
    revalidateAccommodation(id, slug);
    return { ok: true as const };
  } catch (error) {
    console.error("Error updating accommodation", error);
    throw new Error(
      error instanceof Error
        ? `Échec de l'enregistrement : ${error.message}`
        : "Failed to update accommodation"
    );
  }
}

/**
 * Publie un livret : le rend visible sur /h/<slug> et horodate la publication.
 * Idempotent — republier ne réécrit pas la date de première publication.
 */
export async function publishAdminAccommodation(id: string) {
  await requireAdminAuth();
  try {
    const docRef = adminDb.collection(COLLECTION_NAME).doc(id);
    const doc = await withTimeout(docRef.get(), `livret ${id}`);
    if (!doc.exists) {
      throw new Error("Livret introuvable — enregistrez-le avant de le publier.");
    }
    const current = doc.data() as Accommodation;
    await withTimeout(
      docRef.update(
        sanitizeForFirestore({
          isActive: true,
          publishedAt: current.publishedAt || Date.now(),
          updatedAt: Date.now(),
        }) as Record<string, unknown>
      ),
      "publication"
    );
    revalidateAccommodation(id, current.slug);
    return { ok: true as const, slug: current.slug };
  } catch (error) {
    console.error("Error publishing accommodation", error);
    throw new Error(
      error instanceof Error ? error.message : "Failed to publish accommodation"
    );
  }
}

/** Repasse un livret en brouillon (page publique masquée). */
export async function unpublishAdminAccommodation(id: string) {
  await requireAdminAuth();
  try {
    const docRef = adminDb.collection(COLLECTION_NAME).doc(id);
    const doc = await withTimeout(docRef.get(), `livret ${id}`);
    // On ne prétend pas avoir dépublié un document qui n'existe pas.
    if (!doc.exists) {
      throw new Error("Livret introuvable — il n'a jamais été enregistré.");
    }
    const current = doc.data() as Accommodation;
    await withTimeout(
      docRef.update({ isActive: false, updatedAt: Date.now() }),
      "dépublication"
    );
    revalidateAccommodation(id, current.slug);
    return { ok: true as const };
  } catch (error) {
    console.error("Error unpublishing accommodation", error);
    throw new Error("Failed to unpublish accommodation");
  }
}

export async function createAdminAccommodation(data: Omit<Accommodation, "id" | "createdAt" | "updatedAt">) {
  await requireAdminAuth();
  try {
    await assertSlugAvailable(data.slug);

    const timestamp = Date.now();
    const docRef = await withTimeout(
      adminDb.collection(COLLECTION_NAME).add(
        sanitizeForFirestore({
          ...data,
          createdAt: timestamp,
          updatedAt: timestamp
        }) as Record<string, unknown>
      ),
      "création du livret"
    );
    revalidateAccommodation(docRef.id, data.slug);
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
