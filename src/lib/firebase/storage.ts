import { storage } from "./config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadImage = async (file: File, folder: string = "accommodations"): Promise<string> => {
  if (!file) throw new Error("No file provided");
  
  // Generate a unique filename
  const fileExtension = file.name.split('.').pop();
  const uniqueId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  const fileName = `${uniqueId}.${fileExtension}`;
  
  // Create a reference to the file
  const storageRef = ref(storage, `${folder}/${fileName}`);
  
  // Upload the file
  const snapshot = await uploadBytes(storageRef, file);
  
  // Get the download URL
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  return downloadURL;
};
