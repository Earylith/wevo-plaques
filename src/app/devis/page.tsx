"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Warning } from "@phosphor-icons/react";
import { envoyerDemandeDevis, OffrePro } from "@/app/devis-actions";

/**
 * Demande de devis pour les offres professionnelles.
 *
 * Le bouton « Demander un devis » pointait sur une ancre `#contact` qui
 * n'existe pas : le visiteur cliquait et la page ne bougeait pas. Une offre
 * « sur devis » sans moyen de le demander ne se vend jamais.
 *
 * Le formulaire ne demande que ce qui sert à rappeler quelqu'un et à chiffrer
 * : un champ de plus, c'est un abandon de plus. Le message reste libre pour
 * qui veut en dire davantage.
 */

const OFFRES: Record<OffrePro, { titre: string; pour: string }> = {
  multibien: {
    titre: "Multi-biens",
    pour: "Conciergeries et propriétaires de plusieurs logements",
  },
  signature: {
    titre: "Signature",
    pour: "Hôtels, résidences et groupes",
  },
};

function Formulaire() {
  const parametres = useSearchParams();
  const demande = parametres.get("offre");
  const offreInitiale: OffrePro = demande === "signature" ? "signature" : "multibien";

  const [offre, setOffre] = useState<OffrePro>(offreInitiale);
  const [nom, setNom] = useState("");
  const [societe, setSociete] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [logements, setLogements] = useState("");
  const [message, setMessage] = useState("");

  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoye, setEnvoye] = useState(false);

  const soumettre = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnvoi(true);
    setErreur(null);
    try {
      await envoyerDemandeDevis({ offre, nom, societe, email, telephone, logements, message });
      setEnvoye(true);
    } catch (err) {
      console.error(err);
      setErreur(err instanceof Error ? err.message : "L’envoi a échoué. Réessayez.");
      setEnvoi(false);
    }
  };

  if (envoye) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-[20px] bg-white shadow-[0_1px_2px_rgba(42,32,22,0.05),0_12px_28px_-14px_rgba(42,32,22,0.2)]">
          <Check size={24} weight="bold" className="text-emerald-600" />
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-[30px] font-bold tracking-[-0.02em] text-[#2A2016]">
          Votre demande est partie
        </h1>
        <p className="mx-auto mt-2.5 max-w-sm text-[15px] leading-relaxed text-[#6B5D4E]">
          Nous revenons vers vous sous 48 heures ouvrées, à l’adresse{" "}
          <span className="font-semibold text-[#2A2016]">{email}</span>.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#2A2016] px-6 py-3 text-[14px] font-semibold text-white transition-all hover:bg-[#C4714A] active:scale-[0.98]"
        >
          Revenir à l’accueil
        </Link>
      </div>
    );
  }

  const champ =
    "mt-1.5 w-full rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-[15px] text-[#2A2016] outline-none transition-colors focus:border-[#C4714A]";
  const intitule = "text-[13px] font-semibold text-[#6B5D4E]";

  return (
    <div className="mx-auto max-w-2xl px-5 py-14 sm:px-8 sm:py-20">
      <Link
        href="/#pro"
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#6B5D4E] transition-colors hover:text-[#C4714A]"
      >
        <ArrowLeft size={14} weight="bold" />
        Retour aux offres professionnelles
      </Link>

      <h1 className="mt-6 font-[family-name:var(--font-display)] text-[38px] font-bold leading-[1.05] tracking-[-0.025em] text-[#2A2016] sm:text-[46px]">
        Demander un devis
      </h1>
      <p className="mt-3 max-w-lg text-[15.5px] leading-relaxed text-[#6B5D4E]">
        Dites-nous ce que vous gérez, nous vous répondons avec une proposition
        chiffrée sous 48 heures ouvrées.
      </p>

      <form onSubmit={(e) => void soumettre(e)} className="mt-9 space-y-5">
        {/* L'offre reste modifiable : on arrive parfois par le mauvais bouton. */}
        <fieldset>
          <legend className={intitule}>Votre besoin</legend>
          <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
            {(Object.keys(OFFRES) as OffrePro[]).map((cle) => (
              <button
                key={cle}
                type="button"
                onClick={() => setOffre(cle)}
                className={`rounded-2xl border p-4 text-left transition-all ${
                  offre === cle
                    ? "border-[#C4714A] bg-[#F7EBE4]"
                    : "border-black/[0.08] bg-white hover:border-black/20"
                }`}
              >
                <span className="block text-[15px] font-bold text-[#2A2016]">
                  {OFFRES[cle].titre}
                </span>
                <span className="mt-0.5 block text-[13px] leading-snug text-[#6B5D4E]">
                  {OFFRES[cle].pour}
                </span>
              </button>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className={intitule}>Votre nom *</span>
            <input required value={nom} onChange={(e) => setNom(e.target.value)} className={champ} />
          </label>
          <label className="block">
            <span className={intitule}>Société</span>
            <input value={societe} onChange={(e) => setSociete(e.target.value)} className={champ} />
          </label>
          <label className="block">
            <span className={intitule}>E-mail *</span>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={champ}
            />
          </label>
          <label className="block">
            <span className={intitule}>Téléphone</span>
            {/*
              Obligatoire : un devis multi-biens se cadre au téléphone en dix
              minutes, et par écrit en quatre allers-retours. Le demander,
              c'est répondre plus vite — pas collecter pour collecter.
            */}
            <input
              type="tel"
              required
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="06 12 34 56 78"
              className={champ}
            />
          </label>
        </div>

        <label className="block">
          <span className={intitule}>Combien de logements ?</span>
          <input
            value={logements}
            onChange={(e) => setLogements(e.target.value)}
            placeholder="12, une trentaine, un hôtel de 40 chambres…"
            className={champ}
          />
        </label>

        <label className="block">
          <span className={intitule}>Votre message</span>
          <textarea
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ce que vous cherchez, vos contraintes, vos échéances."
            className={`${champ} resize-none`}
          />
        </label>

        {erreur && (
          <p className="flex items-start gap-2 rounded-2xl bg-red-50 px-4 py-3 text-[13.5px] leading-relaxed text-red-700">
            <Warning size={15} weight="fill" className="mt-0.5 shrink-0" />
            {erreur}
          </p>
        )}

        <button
          type="submit"
          disabled={envoi}
          className="w-full rounded-full bg-[#2A2016] px-6 py-4 text-[15px] font-semibold text-white transition-all hover:bg-[#C4714A] active:scale-[0.99] disabled:opacity-60 sm:w-auto sm:px-10"
        >
          {envoi ? "Envoi en cours…" : "Envoyer ma demande"}
        </button>

        <p className="text-[12.5px] leading-relaxed text-[#A8998A]">
          Vos informations servent uniquement à vous répondre. Elles ne sont ni
          revendues, ni utilisées pour autre chose.
        </p>
      </form>
    </div>
  );
}

export default function DevisPage() {
  return (
    <main className="min-h-screen bg-[#FBF5EC]">
      {/* `useSearchParams` impose une frontière de suspense côté serveur. */}
      <Suspense fallback={<div className="h-screen" />}>
        <Formulaire />
      </Suspense>
    </main>
  );
}
