import { adminDb } from "./admin";
import { Accommodation } from "../types/accommodation";

const COLLECTION_NAME = "accommodations";

export const getAccommodationBySlugAdmin = async (slug: string): Promise<Accommodation | null> => {
  const querySnapshot = await adminDb
    .collection(COLLECTION_NAME)
    .where("slug", "==", slug)
    .get();

  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as Accommodation;
  }
  return null;
};
