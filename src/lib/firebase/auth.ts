import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
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
 * Création d'un compte par e-mail, mot de passe et nom.
 *
 * L'hôte est connecté dans la foulée : c'est ce qui permet d'enchaîner
 * directement sur la création de son livret, sans étape de connexion.
 *
 * Le nom est posé sur le compte lui-même, puis le JETON EST RAFRAÎCHI. Sans
 * ce rafraîchissement, le jeton encore en mémoire date d'avant
 * l'enregistrement du nom : le serveur lirait un `name` vide, écrirait un
 * livret sans propriétaire nommé, et enverrait un « Bonjour, » orphelin.
 */
export const signUp = async (email: string, password: string, nom?: string) => {
  const identifiants = await createUserWithEmailAndPassword(auth, email, password);

  const propre = (nom || "").trim();
  if (propre) {
    await updateProfile(identifiants.user, { displayName: propre });
    await identifiants.user.getIdToken(true);
  }

  return identifiants;
};

/**
 * Connexion par Google.
 *
 * En fenêtre surgissante plutôt qu'en redirection : la redirection perd le
 * contexte de la page et complique le retour vers l'étape suivante.
 */
export const signInWithGoogle = async () => {
  const fournisseur = new GoogleAuthProvider();
  fournisseur.setCustomParameters({ prompt: "select_account" });
  return signInWithPopup(auth, fournisseur);
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
