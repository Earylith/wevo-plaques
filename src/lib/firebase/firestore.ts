import { db } from "./config";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where
} from "firebase/firestore/lite";
import { Accommodation } from "../types/accommodation";

const COLLECTION_NAME = "accommodations";

export const getAccommodations = async (): Promise<Accommodation[]> => {
  const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Accommodation));
};

export const getAccommodationById = async (id: string): Promise<Accommodation | null> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Accommodation;
  }
  return null;
};

export const getAccommodationBySlug = async (slug: string): Promise<Accommodation | null> => {
  const q = query(collection(db, COLLECTION_NAME), where("slug", "==", slug));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const docSnap = querySnapshot.docs[0];
    return { id: docSnap.id, ...docSnap.data() } as Accommodation;
  }
  return null;
};

export const createAccommodation = async (data: Omit<Accommodation, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  const now = Date.now();
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...data,
    createdAt: now,
    updatedAt: now
  });
  return docRef.id;
};

export const updateAccommodation = async (id: string, data: Partial<Accommodation>): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Date.now()
  });
};

export const deleteAccommodation = async (id: string): Promise<void> => {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
};
