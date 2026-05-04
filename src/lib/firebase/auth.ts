import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { auth } from "./config";

/**
 * Connexion email + mot de passe
 */
export const signIn = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Déconnexion
 */
export const signOut = async () => {
  return firebaseSignOut(auth);
};

/**
 * Envoi d'un email de réinitialisation de mot de passe
 */
export const sendPasswordReset = async (email: string) => {
  return sendPasswordResetEmail(auth, email);
};

/**
 * Mise à jour du mot de passe de l'utilisateur connecté
 */
export const changePassword = async (newPassword: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Aucun utilisateur connecté");
  return updatePassword(user, newPassword);
};

/**
 * Retourne l'utilisateur actuellement connecté (ou null)
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Écoute les changements d'état d'authentification
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
