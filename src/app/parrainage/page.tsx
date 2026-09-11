import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import {
  ArrowRight, BadgeEuro, CalendarDays, Check, Clock3, Gift,
  House, Share2, ShieldCheck, Sparkles, Users,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  REFERRAL_COOKIE, readReferralCookieValue, referralCodeExists,
} from "@/lib/server/referrals";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Programme de parrainage Guidzme — Des avantages pour tous",
  description: "Parrainez des hôtes avec Guidzme : jusqu’à 20 € de crédit et un mois Confort offert chaque année par filleul Confort actif.",
  alternates: { canonical: "/parrainage" },
};

async function hasValidReferral(): Promise<boolean> {
  const cookieStore = await cookies();
  const code = readReferralCookieValue(cookieStore.get(REFERRAL_COOKIE)?.value);
  return Boolean(code && await referralCodeExists(code));
}

const steps = [
  { number: "01", title: "Passez votre première commande", text: "Le programme se débloque dès que votre premier paiement Guidzme est confirmé." },
  { number: "02", title: "Partagez votre lien personnel", text: "Votre lien apparaît dans votre espace propriétaire. Votre filleul dispose de 30 jours pour commencer." },
  { number: "03", title: "Votre filleul commande", text: "Son avantage est appliqué automatiquement sur sa première commande éligible, sans code à saisir." },
  { number: "04", title: "Vos récompenses s’activent", text: "Le crédit de bienvenue devient disponible après 7 jours et les droits Confort suivent l’abonnement actif." },
];

const questions = [
  { question: "Quand puis-je commencer à parrainer ?", answer: "Après votre première commande payée. La rubrique reste visible avant, puis votre lien personnel y apparaît automatiquement dès la confirmation du paiement." },
  { question: "Combien puis-je gagner ?", answer: "Les quatre premiers filleuls payés rapportent 5 € chacun, soit 20 € au total. En plus, chaque filleul Confort actif donne droit à un mois Confort offert par cycle annuel." },
  { question: "Que se passe-t-il avec plusieurs hébergements ?", answer: "Le nombre de filleuls n’est pas limité. Le plafond utile correspond à 12 mois par hébergement Confort facturé : 24 droits pour deux hébergements, 36 pour trois, etc." },
  { question: "Les avantages se cumulent-ils avec un code promo ?", answer: "Non. L’avantage de parrainage ne se cumule pas avec une promotion publique. L’offre de parrainage applicable est directement intégrée au paiement." },
];

export default async function ReferralProgramPage({ searchParams }: { searchParams: Promise<{ invitation?: string }> }) {
  const [{ invitation }, referred] = await Promise.all([searchParams, hasValidReferral()]);
  const invalidInvitation = invitation === "invalide" && !referred;

  return (
    <>
      <Header />
      <main className="overflow-hidden bg-[#FBF5EC]">
        <section className="relative px-5 pb-20 pt-36 sm:px-8 sm:pb-28 sm:pt-44">
          <div className="pointer-events-none absolute -left-44 top-12 h-[480px] w-[480px] rounded-full bg-[#EDD9A3]/35 blur-3xl" />
          <div className="pointer-events-none absolute -right-36 top-44 h-96 w-96 rounded-full bg-[#C4714A]/10 blur-3xl" />
          <div className="relative mx-auto max-w-6xl text-center">
            {referred && (
              <div className="mx-auto mb-8 flex max-w-2xl items-start gap-3 rounded-2xl border border-[#5A7A4E]/25 bg-[#EBF0E6] px-5 py-4 text-left text-[#3F5836]">
                <Check size={19} strokeWidth={3} className="mt-0.5 shrink-0" />
                <div><p className="text-sm font-bold">Votre avantage filleul est enregistré</p><p className="mt-0.5 text-xs leading-5 text-[#526849]">Il sera appliqué automatiquement à votre première commande éligible sur ce navigateur.</p></div>
              </div>
            )}
            {invalidInvitation && <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">Ce lien d’invitation n’est pas valide ou son propriétaire n’a pas encore accès au programme. Demandez-lui un nouveau lien après sa première commande.</div>}

            <span className="inline-flex items-center gap-2 rounded-full border border-[#C4714A]/20 bg-white/70 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#A35A38]"><Gift size={15} /> Programme de parrainage</span>
            <h1 className="mx-auto mt-7 max-w-4xl font-[family-name:var(--font-display)] text-[48px] font-bold leading-[0.95] tracking-[-0.035em] text-[#2A2016] sm:text-7xl">Faites découvrir Guidzme. Tout le monde y gagne.</h1>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-8 text-[#6B5D4E] sm:text-lg">Votre filleul profite d’un avantage sur sa première commande. De votre côté, vous gagnez du crédit et des mois Confort tant que vos filleuls restent actifs.</p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {referred ? (
                <>
                  <Link href="/commencer?offre=confort" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#C4714A] px-7 py-4 text-sm font-bold text-white shadow-[0_10px_30px_-12px_rgba(196,113,74,0.7)] transition-colors hover:bg-[#A35A38] sm:w-auto">Profiter de mes 6 mois <ArrowRight size={17} /></Link>
                  <Link href="/commencer?offre=essentielle" className="inline-flex w-full items-center justify-center rounded-full border border-[#C4714A]/30 bg-white/70 px-7 py-4 text-sm font-bold text-[#A35A38] hover:bg-white sm:w-auto">Choisir Essentielle</Link>
                </>
              ) : (
                <>
                  <Link href="/proprietaire/dashboard" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2A2016] px-7 py-4 text-sm font-bold text-white transition-colors hover:bg-[#C4714A] sm:w-auto">Accéder à mon espace <ArrowRight size={17} /></Link>
                  <Link href="/#offres" className="inline-flex w-full items-center justify-center rounded-full border border-[#C4714A]/30 bg-white/70 px-7 py-4 text-sm font-bold text-[#A35A38] hover:bg-white sm:w-auto">Découvrir les formules</Link>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <SectionTitle eyebrow="Pour votre filleul" title="Un vrai coup de pouce dès le départ">Un seul avantage par compte, réservé à la première commande éligible et jamais multiplié par le nombre de logements.</SectionTitle>
            <div className="mt-12 grid gap-5 md:grid-cols-2">
              <article className="rounded-[32px] border border-[#EDD9A3]/70 bg-[#FBF5EC] p-7 sm:p-9">
                <IconBox icon={<BadgeEuro size={24} />} />
                <p className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-[#A35A38]">Essentielle</p>
                <h3 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold text-[#2A2016]">5 € offerts</h3>
                <p className="mt-4 text-sm leading-6 text-[#6B5D4E]">La remise est immédiate sur la première commande Essentielle. Aucun code promotionnel n’est nécessaire.</p>
              </article>
              <article className="relative overflow-hidden rounded-[32px] bg-[#2A2016] p-7 text-white sm:p-9">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#C4714A]/25 blur-3xl" />
                <div className="relative">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-[#E8BE72]"><Sparkles size={24} /></span>
                  <p className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-[#D8C7B4]">Confort</p>
                  <h3 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-bold">6 mois offerts</h3>
                  <p className="mt-4 text-sm leading-6 text-white/65">En mensuel, six mensualités d’un hébergement sont couvertes. En annuel, la remise équivalente à six mois est appliquée immédiatement.</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C4714A]">Pour le parrain</p><h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold leading-tight text-[#2A2016] sm:text-5xl">Deux récompenses, deux objectifs</h2><p className="mt-5 text-sm leading-7 text-[#6B5D4E]">Le crédit récompense l’acquisition d’un nouveau client. Les mois Confort récompensent les abonnements qui restent réellement actifs.</p></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <RewardCard icon={<Gift size={24} />} title="Jusqu’à 20 € de crédit">5 € pour chacun des quatre premiers filleuls payés. Le crédit devient disponible après 7 jours.</RewardCard>
              <article className="rounded-[28px] border border-[#5A7A4E]/20 bg-[#EBF0E6] p-6"><CalendarDays size={24} className="text-[#3F5836]" /><h3 className="mt-5 text-lg font-bold text-[#2A2016]">1 mois Confort par an</h3><p className="mt-2 text-sm leading-6 text-[#526849]">Chaque filleul Confort actif donne un droit d’un mois offert à chaque cycle annuel.</p></article>
              <article className="rounded-[28px] border border-[#EDD9A3]/70 bg-white p-6 shadow-sm sm:col-span-2"><div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDF3DC] text-[#A35A38]"><House size={23} /></span><div><h3 className="text-lg font-bold text-[#2A2016]">Le multi-logements est pris en compte</h3><p className="mt-1 text-sm leading-6 text-[#6B5D4E]">Le plafond utile est de 12 droits par hébergement Confort facturé. Les réductions sont appliquées globalement sur l’abonnement.</p></div></div></article>
            </div>
          </div>
        </section>

        <section className="bg-[#2A2016] px-5 py-20 text-white sm:px-8 sm:py-28">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#E8BE72]">Comment ça marche ?</p><h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold sm:text-5xl">Quatre étapes, aucun calcul à faire</h2></div>
            <div className="mt-12 grid gap-px overflow-hidden rounded-[30px] border border-white/10 bg-white/10 md:grid-cols-4">
              {steps.map((step) => <article key={step.number} className="bg-[#2A2016] p-7"><p className="font-[family-name:var(--font-display)] text-4xl font-bold text-[#C4714A]">{step.number}</p><h3 className="mt-8 text-base font-bold">{step.title}</h3><p className="mt-3 text-sm leading-6 text-white/55">{step.text}</p></article>)}
            </div>
            <div className="mt-8 grid gap-3 text-xs text-white/65 sm:grid-cols-3"><p className="flex items-center gap-2"><ShieldCheck size={18} className="text-[#E8BE72]" /> Lien signé et vérifié côté serveur</p><p className="flex items-center gap-2"><Clock3 size={18} className="text-[#E8BE72]" /> Attribution valable 30 jours</p><p className="flex items-center gap-2"><Share2 size={18} className="text-[#E8BE72]" /> Suivi automatique dans votre espace</p></div>
          </div>
        </section>

        <section className="bg-white px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-4xl">
            <SectionTitle eyebrow="Questions fréquentes" title="Tout ce qu’il faut savoir" />
            <div className="mt-12 divide-y divide-[#EDD9A3]/60 border-y border-[#EDD9A3]/60">
              {questions.map((item) => <article key={item.question} className="grid gap-3 py-7 sm:grid-cols-[0.8fr_1.2fr] sm:gap-10"><h3 className="text-sm font-bold text-[#2A2016]">{item.question}</h3><p className="text-sm leading-6 text-[#6B5D4E]">{item.answer}</p></article>)}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 text-center sm:px-8 sm:py-24">
          <div className="mx-auto max-w-3xl rounded-[36px] border border-[#C4714A]/20 bg-gradient-to-br from-white to-[#F7EBDD] px-7 py-12 shadow-[0_24px_70px_-40px_rgba(42,32,22,0.4)] sm:px-12">
            <Users size={29} className="mx-auto text-[#C4714A]" /><h2 className="mt-5 font-[family-name:var(--font-display)] text-4xl font-bold text-[#2A2016]">Prêt à partager Guidzme ?</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#6B5D4E]">Passez votre première commande, puis retrouvez votre lien personnel et toutes vos récompenses dans votre espace.</p><Link href="/proprietaire/dashboard" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#2A2016] px-7 py-4 text-sm font-bold text-white transition-colors hover:bg-[#C4714A]">Ouvrir mon espace <ArrowRight size={17} /></Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function SectionTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return <div className="mx-auto max-w-2xl text-center"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C4714A]">{eyebrow}</p><h2 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-bold text-[#2A2016] sm:text-5xl">{title}</h2>{children && <p className="mt-4 text-sm leading-7 text-[#6B5D4E]">{children}</p>}</div>;
}

function IconBox({ icon }: { icon: React.ReactNode }) {
  return <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F7EBE4] text-[#C4714A]">{icon}</span>;
}

function RewardCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <article className="rounded-[28px] border border-[#EDD9A3]/70 bg-white p-6 shadow-sm"><span className="text-[#C4714A]">{icon}</span><h3 className="mt-5 text-lg font-bold text-[#2A2016]">{title}</h3><p className="mt-2 text-sm leading-6 text-[#6B5D4E]">{children}</p></article>;
}
