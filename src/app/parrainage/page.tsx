import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  ArrowRight,
  Check,
  Clock3,
  Gift,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  REFERRAL_COOKIE,
  readReferralCookieValue,
  referralCodeExists,
} from "@/lib/server/referrals";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Votre avantage parrainage | Guidzme",
  description: "Profitez de votre avantage de parrainage pour créer votre premier livret Guidzme.",
  robots: { index: false, follow: false },
};

async function parrainageValide(): Promise<boolean> {
  const cookieStore = await cookies();
  const code = readReferralCookieValue(cookieStore.get(REFERRAL_COOKIE)?.value);
  return Boolean(code && await referralCodeExists(code));
}

function Logo() {
  return (
    <Link href="/" className="inline-flex items-center text-2xl font-bold tracking-tight text-[#2A2016]">
      Guidzme<span className="text-[#C4714A]">.</span>
    </Link>
  );
}

function InvalidReferral() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FBF5EC] px-5 py-12">
      <div className="absolute -left-32 top-0 h-80 w-80 rounded-full bg-[#EDD9A3]/30 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[#C4714A]/10 blur-3xl" />
      <section className="relative w-full max-w-lg rounded-[32px] border border-[#EDD9A3]/70 bg-white/90 p-7 text-center shadow-[0_24px_70px_-34px_rgba(42,32,22,0.32)] backdrop-blur sm:p-10">
        <Logo />
        <div className="mx-auto mt-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7EBE4] text-[#C4714A]">
          <Gift size={27} />
        </div>
        <h1 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold leading-none text-[#2A2016]">
          Ce lien n’est plus valide
        </h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-[#6B5D4E]">
          Demandez un nouveau lien à votre parrain. Vous pourrez ensuite revenir ici pour activer votre avantage.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-[#2A2016] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#C4714A]"
        >
          Découvrir Guidzme <ArrowRight size={16} />
        </Link>
      </section>
    </main>
  );
}

export default async function ReferralWelcomePage() {
  if (!(await parrainageValide())) return <InvalidReferral />;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FBF5EC] px-5 py-8 sm:px-8 sm:py-12">
      <div className="pointer-events-none absolute -left-36 top-20 h-96 w-96 rounded-full bg-[#EDD9A3]/35 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-1/3 h-80 w-80 rounded-full bg-[#C4714A]/10 blur-3xl" />

      <div className="relative mx-auto max-w-5xl">
        <header className="flex items-center justify-between">
          <Logo />
          <Link href="/proprietaire/dashboard" className="text-xs font-semibold text-[#6B5D4E] transition-colors hover:text-[#C4714A]">
            Déjà un compte ?
          </Link>
        </header>

        <section className="pb-10 pt-12 text-center sm:pt-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#5A7A4E]/20 bg-[#EBF0E6] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#3F5836]">
            <Check size={14} strokeWidth={3} /> Avantage enregistré
          </span>
          <h1 className="mx-auto mt-6 max-w-3xl font-[family-name:var(--font-display)] text-[42px] font-bold leading-[0.98] tracking-[-0.025em] text-[#2A2016] sm:text-6xl">
            Votre premier Guidz commence avec un cadeau.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-[15px] leading-7 text-[#6B5D4E] sm:text-base">
            Votre parrain vous fait découvrir Guidzme. Choisissez votre formule : votre avantage sera appliqué automatiquement au moment du paiement.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="relative overflow-hidden rounded-[30px] border border-[#C4714A]/25 bg-[#2A2016] p-6 text-white shadow-[0_26px_60px_-34px_rgba(42,32,22,0.7)] sm:p-8">
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#C4714A]/25 blur-2xl" />
            <div className="relative">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#F5E6C8]">
                <Sparkles size={13} /> Le plus avantageux
              </span>
              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-[#D8C7B4]">Formule Confort</p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold">6 mois offerts</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/70">
                Six mensualités offertes sur un hébergement, ou la remise équivalente si vous choisissez l’abonnement annuel.
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-white/85">
                <li className="flex items-center gap-2"><Check size={15} className="text-[#D4A34A]" /> Livret complet et personnalisable</li>
                <li className="flex items-center gap-2"><Check size={15} className="text-[#D4A34A]" /> Avantage appliqué sans code promo</li>
              </ul>
              <Link
                href="/commencer?offre=confort"
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#C4714A] px-6 py-4 text-sm font-bold text-white transition-all hover:bg-[#D4866A] sm:w-auto"
              >
                Créer mon livret Confort <ArrowRight size={17} />
              </Link>
            </div>
          </article>

          <article className="rounded-[30px] border border-[#EDD9A3]/80 bg-white/90 p-6 shadow-[0_22px_55px_-38px_rgba(42,32,22,0.4)] backdrop-blur sm:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F7EBE4] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-[#A35A38]">
              <Gift size={13} /> Offre découverte
            </span>
            <p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-[#8B7A69]">Formule Essentielle</p>
            <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold text-[#2A2016]">5 € offerts</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#6B5D4E]">
              Une remise immédiate de 5 € sur votre première commande éligible, appliquée automatiquement au paiement.
            </p>
            <ul className="mt-6 space-y-2.5 text-sm text-[#5C3D2E]">
              <li className="flex items-center gap-2"><Check size={15} className="text-[#5A7A4E]" /> Aucun code à saisir</li>
              <li className="flex items-center gap-2"><Check size={15} className="text-[#5A7A4E]" /> Avantage réservé à la première commande</li>
            </ul>
            <Link
              href="/commencer?offre=essentielle"
              className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#C4714A]/35 px-6 py-4 text-sm font-bold text-[#A35A38] transition-all hover:border-[#C4714A] hover:bg-[#F7EBE4] sm:w-auto"
            >
              Choisir Essentielle <ArrowRight size={17} />
            </Link>
          </article>
        </section>

        <section className="mt-5 grid gap-3 rounded-[26px] border border-[#EDD9A3]/60 bg-white/60 p-5 text-xs text-[#6B5D4E] sm:grid-cols-3 sm:p-6">
          <p className="flex items-center gap-2.5"><ShieldCheck size={18} className="shrink-0 text-[#5A7A4E]" /> L’avantage est vérifié par notre serveur.</p>
          <p className="flex items-center gap-2.5"><Clock3 size={18} className="shrink-0 text-[#C4714A]" /> Il reste associé à ce navigateur pendant 30 jours.</p>
          <p className="flex items-center gap-2.5"><Gift size={18} className="shrink-0 text-[#D4A34A]" /> Il s’applique à votre première commande éligible.</p>
        </section>

        <p className="mt-7 text-center text-[11px] leading-5 text-[#A8998A]">
          L’avantage de parrainage n’est pas cumulable avec un autre code promotionnel.
        </p>
      </div>
    </main>
  );
}
