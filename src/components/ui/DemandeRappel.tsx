"use client";

import { useState } from "react";
import { PhoneCall, X, Check, Warning, Spinner } from "@phosphor-icons/react";
import { demanderRappel } from "@/app/rappel-actions";
import { CRENEAUX, Creneau } from "@/lib/rappel";

/**
 * « Être rappelé » — un bouton qui rappelle vraiment.
 *
 * Il pointait sur `href="#"` : le visiteur cliquait, la page sautait en haut,
 * et rien ne se passait. Celui qui préfère un appel à un formulaire est
 * pourtant le visiteur le plus chaud — il a une question et veut une réponse
 * maintenant.
 *
 * Trois champs, dont un facultatif. Chaque champ de plus est une occasion
 * d'abandonner, et un numéro sans e-mail suffit largement pour rappeler
 * quelqu'un.
 *
 * La fenêtre s'ouvre au clic plutôt que de mener à une page : faire quitter
 * la page de vente à quelqu'un qui hésite est le plus sûr moyen de le perdre.
 */

export default function DemandeRappel({ className = "" }: { className?: string }) {
  const [ouvert, setOuvert] = useState(false);
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [creneau, setCreneau] = useState<Creneau>("peu_importe");
  const [message, setMessage] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoye, setEnvoye] = useState(false);

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnCours(true);
    setErreur(null);
    try {
      await demanderRappel({ nom, telephone, creneau, message });
      setEnvoye(true);
    } catch (err) {
      console.error(err);
      setErreur(err instanceof Error ? err.message : "Envoi impossible. Réessayez.");
    } finally {
      setEnCours(false);
    }
  };

  const fermer = () => {
    setOuvert(false);
    // On remet à zéro APRÈS la fermeture : réinitialiser pendant que la
    // fenêtre est encore visible fait clignoter le formulaire vide.
    setTimeout(() => {
      setEnvoye(false);
      setErreur(null);
    }, 250);
  };

  const champ =
    "mt-1 w-full rounded-xl border border-[#EDD9A3] bg-[#FBF5EC] px-3.5 py-2.5 text-sm outline-none focus:border-[#C4714A]";
  const intitule = "text-[10px] font-bold uppercase tracking-wider text-[#6B5D4E]";

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className={
          className ||
          "inline-flex items-center justify-center gap-3 rounded-full border-2 border-[#2A2016]/10 bg-white/50 px-10 py-5 text-lg font-semibold text-[#2A2016] transition-all btn-press hover:border-[#C4714A] hover:bg-white hover:text-[#C4714A]"
        }
      >
        <PhoneCall size={20} />
        Être rappelé
      </button>

      {ouvert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Demande de rappel"
          className="fixed inset-0 z-[200] flex items-end justify-center bg-[#2A2016]/40 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          onClick={fermer}
        >
          <div
            className="w-full max-w-md rounded-[26px] border border-[#EDD9A3]/60 bg-white p-6 shadow-[0_20px_60px_-20px_rgba(42,32,22,0.4)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="font-[family-name:var(--font-display)] text-[22px] font-bold text-[#2A2016]">
                  {envoye ? "C’est noté" : "On vous rappelle"}
                </h2>
                <p className="mt-1 text-[13px] leading-relaxed text-[#6B5D4E]">
                  {envoye
                    ? "Nous vous appellerons au moment que vous avez choisi. Aucun automate : c’est une vraie personne qui vous rappelle."
                    : "Laissez votre numéro, nous vous appelons. Pas de formulaire à rallonge, pas de démarchage ensuite."}
                </p>
              </div>
              <button
                type="button"
                onClick={fermer}
                aria-label="Fermer"
                className="shrink-0 rounded-full p-1.5 text-[#A8998A] transition-colors hover:bg-[#FBF5EC] hover:text-[#2A2016]"
              >
                <X size={18} />
              </button>
            </div>

            {envoye ? (
              <div className="flex items-center gap-2.5 rounded-2xl border border-[#5A7A4E]/30 bg-[#EBF0E6] px-4 py-3">
                <Check size={17} weight="bold" className="shrink-0 text-[#3F5836]" />
                <p className="text-[13px] font-semibold text-[#3F5836]">
                  Votre demande est bien arrivée.
                </p>
              </div>
            ) : (
              <form onSubmit={soumettre} className="space-y-3">
                <label className="block">
                  <span className={intitule}>Votre nom</span>
                  <input
                    type="text"
                    required
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    autoComplete="name"
                    placeholder="Camille Rousseau"
                    className={champ}
                  />
                </label>

                <label className="block">
                  <span className={intitule}>Votre téléphone</span>
                  <input
                    type="tel"
                    required
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    autoComplete="tel"
                    placeholder="06 12 34 56 78"
                    className={champ}
                  />
                </label>

                <label className="block">
                  <span className={intitule}>Quand vous appeler ?</span>
                  <select
                    value={creneau}
                    onChange={(e) => setCreneau(e.target.value as Creneau)}
                    className={champ}
                  >
                    {(Object.keys(CRENEAUX) as Creneau[]).map((cle) => (
                      <option key={cle} value={cle}>
                        {CRENEAUX[cle]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className={intitule}>Votre question (facultatif)</span>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ce que vous voulez savoir avant de vous décider."
                    className={`${champ} resize-y`}
                  />
                </label>

                {erreur && (
                  <p className="flex items-start gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[11.5px] text-red-700">
                    <Warning size={13} weight="fill" className="mt-0.5 shrink-0" />
                    {erreur}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={enCours}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#C4714A] py-3 text-sm font-bold text-white transition-colors hover:bg-[#A35A38] disabled:opacity-60"
                >
                  {enCours ? <Spinner size={16} className="animate-spin" /> : <PhoneCall size={16} />}
                  {enCours ? "Envoi…" : "Demander un rappel"}
                </button>

                <p className="text-center text-[10.5px] leading-relaxed text-[#A8998A]">
                  Votre numéro ne sert qu’à ce rappel. Il n’est ni revendu, ni
                  versé à une liste de diffusion.
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
