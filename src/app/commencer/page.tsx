"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GoogleLogo, EnvelopeSimple, Spinner, Warning, ArrowRight } from "@phosphor-icons/react";
import { useAuth } from "@/lib/hooks/useAuth";
import { signIn, signUp, signInWithGoogle } from "@/lib/firebase/auth";
import { ouvrirLivret } from "@/app/creation-actions";
import { OfferType } from "@/lib/types/accommodation";

/**
 * Entrée du parcours, pour les deux formules.
 *
 * L'ordre compte : compte d'abord, contenu ensuite, paiement en dernier.
 * L'hôte crée son livret et le remplit gratuitement ; il ne paie qu'au
 * moment de le publier et de commander sa plaque. C'est l'inverse d'un lien
 * de paiement, qui encaisse avant que quoi que ce soit existe.
 */

type Mode = "inscription" | "connexion";

function messageErreur(erreur: unknown): string {
  const code = (erreur as { code?: string })?.code || "";
  // Les codes Firebase sont techniques : on les traduit en langage d'hôte.
  if (code.includes("email-already-in-use")) {
    return "Cette adresse a déjà un compte. Connectez-vous plutôt.";
  }
  if (code.includes("invalid-credential") || code.includes("wrong-password")) {
    return "Adresse ou mot de passe incorrect.";
  }
  if (code.includes("user-not-found")) return "Aucun compte pour cette adresse.";
  if (code.includes("weak-password")) return "Mot de passe trop court : 6 caractères au minimum.";
  if (code.includes("invalid-email")) return "Cette adresse e-mail n’est pas valide.";
  if (code.includes("popup-closed") || code.includes("cancelled-popup")) {
    return "Connexion Google interrompue.";
  }
  if (code.includes("network")) return "Connexion impossible. Vérifiez votre réseau.";
  return erreur instanceof Error ? erreur.message : "Une erreur est survenue.";
}

/** Ce qui distingue les deux entrées : le nom, et ce qu'on promet. */
const FORMULES: Record<OfferType, { nom: string; promesse: string }> = {
  comfort: {
    nom: "Formule Confort",
    promesse:
      "Vous composerez votre livret librement. Le paiement n’intervient qu’au moment de le mettre en ligne et de commander votre plaque.",
  },
  essential: {
    nom: "Formule Essentielle",
    promesse:
      "Vous composerez votre page librement. Le paiement n’intervient qu’au moment de la mettre en ligne et de commander votre plaque.",
  },
};

export default function CommencerPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FBF5EC] flex items-center justify-center px-6">
          <p className="text-xs text-[#A8998A]">Chargement…</p>
        </main>
      }
    >
      <Formulaire />
    </Suspense>
  );
}

function Formulaire() {
  const router = useRouter();
  const parametres = useSearchParams();
  /*
   * La formule vient de l'adresse. Sans elle, on ouvre un Confort : c'est la
   * formule mise en avant, et l'admin pourra toujours corriger.
   */
  const offre: OfferType = parametres.get("offre") === "essentiel" ? "essential" : "comfort";
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<Mode>("inscription");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  /**
   * Ouvre le livret et emmène l'hôte dans l'éditeur.
   *
   * Appelé après connexion, jamais au chargement : créer un livret pour
   * quelqu'un qui ne fait que passer laisserait des brouillons vides.
   */
  const continuer = async () => {
    setEnCours(true);
    setErreur(null);
    try {
      const { auth } = await import("@/lib/firebase/config");
      const courant = auth.currentUser;
      if (!courant) throw new Error("Session perdue. Reconnectez-vous.");
      const jeton = await courant.getIdToken();
      const livret = await ouvrirLivret(jeton, offre);
      router.push(`/proprietaire/dashboard/${livret.id}/edit`);
    } catch (e) {
      console.error(e);
      setErreur(messageErreur(e));
      setEnCours(false);
    }
  };

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnCours(true);
    setErreur(null);
    try {
      if (mode === "inscription") {
        await signUp(email, motDePasse, nom);
      } else {
        await signIn(email, motDePasse);
      }
      await continuer();
    } catch (err) {
      console.error(err);
      setErreur(messageErreur(err));
      setEnCours(false);
    }
  };

  const avecGoogle = async () => {
    setEnCours(true);
    setErreur(null);
    try {
      await signInWithGoogle();
      await continuer();
    } catch (err) {
      console.error(err);
      setErreur(messageErreur(err));
      setEnCours(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FBF5EC] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          <span className="inline-block text-[10px] font-extrabold tracking-[0.18em] uppercase text-[#A35A38] bg-[#F7EBE4] border border-[#EDD9A3] rounded-full px-3 py-1">
            {FORMULES[offre].nom}
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016] mt-4">
            Créez votre compte
          </h1>
          <p className="text-sm text-[#6B5D4E] mt-2.5 leading-relaxed">
            {FORMULES[offre].promesse}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-[#EDD9A3]/60 shadow-sm p-6">
          {loading ? (
            <p className="text-center text-xs text-[#A8998A] py-8">Chargement…</p>
          ) : user ? (
            <div className="text-center space-y-4">
              <p className="text-sm text-[#2A2016]">
                Vous êtes connecté en tant que{" "}
                <strong>{user.email}</strong>.
              </p>
              <button
                type="button"
                onClick={() => void continuer()}
                disabled={enCours}
                className="w-full py-3 rounded-2xl bg-[#C4714A] hover:bg-[#A35A38] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
              >
                {enCours ? <Spinner size={16} className="animate-spin" /> : <ArrowRight size={16} weight="bold" />}
                {enCours ? "Ouverture…" : "Continuer vers mon livret"}
              </button>
              {erreur && (
                <p className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 flex items-start gap-1.5 text-left">
                  <Warning size={13} weight="fill" className="shrink-0 mt-0.5" />
                  {erreur}
                </p>
              )}
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={() => void avecGoogle()}
                disabled={enCours}
                className="w-full py-3 rounded-2xl border border-gray-200 hover:border-[#C4714A] text-sm font-bold text-[#2A2016] flex items-center justify-center gap-2.5 transition-colors disabled:opacity-60"
              >
                <GoogleLogo size={18} weight="bold" />
                Continuer avec Google
              </button>

              <div className="flex items-center gap-3 my-5">
                <span className="flex-1 h-px bg-gray-200" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A8998A]">ou</span>
                <span className="flex-1 h-px bg-gray-200" />
              </div>

              <form onSubmit={soumettre} className="space-y-3">
                {/*
                  Le nom n'est demandé qu'à l'inscription : à la connexion, il
                  est déjà connu, et le redemander donnerait l'impression que
                  rien n'a été retenu.

                  Il sert partout ensuite — la salutation du tableau de bord,
                  l'en-tête des e-mails, le destinataire du colis. Sans lui,
                  chaque message commence par un « Bonjour, » orphelin.
                */}
                {mode === "inscription" && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B5D4E] mb-1.5">
                      Votre nom
                    </label>
                    <input
                      type="text"
                      required
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      autoComplete="name"
                      placeholder="Camille Rousseau"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDD9A3] bg-[#FBF5EC] text-sm outline-none focus:border-[#C4714A]"
                    />
                    <p className="mt-1 text-[10.5px] text-[#A8998A]">
                      Pour vous accueillir par votre prénom, et pour l’adresse du colis.
                    </p>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B5D4E] mb-1.5">
                    Adresse e-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    placeholder="vous@exemple.fr"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDD9A3] bg-[#FBF5EC] text-sm outline-none focus:border-[#C4714A]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#6B5D4E] mb-1.5">
                    Mot de passe
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                    autoComplete={mode === "inscription" ? "new-password" : "current-password"}
                    placeholder="6 caractères au minimum"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EDD9A3] bg-[#FBF5EC] text-sm outline-none focus:border-[#C4714A]"
                  />
                </div>

                {erreur && (
                  <p className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 flex items-start gap-1.5">
                    <Warning size={13} weight="fill" className="shrink-0 mt-0.5" />
                    {erreur}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={enCours}
                  className="w-full py-3 rounded-2xl bg-[#C4714A] hover:bg-[#A35A38] text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                >
                  {enCours ? <Spinner size={16} className="animate-spin" /> : <EnvelopeSimple size={16} weight="bold" />}
                  {enCours
                    ? "Un instant…"
                    : mode === "inscription"
                      ? "Créer mon compte"
                      : "Me connecter"}
                </button>
              </form>

              <p className="text-center text-[11px] text-[#6B5D4E] mt-4">
                {mode === "inscription" ? "Vous avez déjà un compte ?" : "Pas encore de compte ?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === "inscription" ? "connexion" : "inscription");
                    setErreur(null);
                  }}
                  className="font-bold text-[#C4714A] hover:text-[#A35A38] transition-colors"
                >
                  {mode === "inscription" ? "Se connecter" : "Créer un compte"}
                </button>
              </p>
            </>
          )}
        </div>

        <p className="text-center text-[11px] text-[#A8998A] mt-5">
          <Link href="/" className="hover:text-[#C4714A] transition-colors">
            Retour à l’accueil
          </Link>
        </p>
      </div>
    </main>
  );
}
