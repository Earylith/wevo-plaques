import Link from "next/link";
import { CheckCircle, Clock, Warning } from "@phosphor-icons/react/dist/ssr";
import { etatPaiement } from "@/app/paiement-actions";

/**
 * Retour après paiement.
 *
 * Cette page ne publie rien et ne commande rien : elle CONSTATE. La mise en
 * ligne et la gravure sont déclenchées par le webhook, seul témoin fiable de
 * l'encaissement. Ici, on lit l'état de la session pour rassurer le client —
 * y compris dans le cas normal où le webhook n'est pas encore arrivé.
 */

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function MerciPage({ searchParams }: Props) {
  const { session_id: sessionId } = await searchParams;
  const etat = sessionId
    ? await etatPaiement(sessionId)
    : { paye: false, accommodationId: null, email: null };

  return (
    <main className="min-h-screen bg-[#FBF5EC] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-[#EDD9A3]/60 shadow-sm p-8 text-center">
        {etat.paye ? (
          <>
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={28} weight="fill" />
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#2A2016]">
              Merci, c’est validé
            </h1>
            <p className="text-sm text-[#6B5D4E] mt-3 leading-relaxed">
              Votre livret est en ligne et votre plaque part en préparation.
              {etat.email && (
                <>
                  {" "}Un récapitulatif est disponible sur le compte{" "}
                  <strong className="text-[#2A2016]">{etat.email}</strong>.
                </>
              )}
            </p>
            <p className="text-[11px] text-[#A8998A] mt-3 leading-relaxed">
              L’adresse gravée sur la plaque est désormais définitive. Le contenu
              du livret, lui, reste modifiable à volonté.
            </p>
          </>
        ) : sessionId ? (
          <>
            <div className="w-14 h-14 rounded-full bg-[#FDF3DC] text-[#C4714A] flex items-center justify-center mx-auto mb-5">
              <Clock size={28} weight="fill" />
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#2A2016]">
              Paiement en cours de confirmation
            </h1>
            <p className="text-sm text-[#6B5D4E] mt-3 leading-relaxed">
              Votre banque n’a pas encore rendu sa réponse. Il n’y a rien à
              refaire : dès la confirmation, votre livret sera mis en ligne
              automatiquement. Rechargez cette page dans un instant.
            </p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-5">
              <Warning size={28} weight="fill" />
            </div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#2A2016]">
              Commande introuvable
            </h1>
            <p className="text-sm text-[#6B5D4E] mt-3 leading-relaxed">
              Cette page attend une référence de paiement. Si vous venez de
              régler, revenez au lien reçu à la fin du parcours.
            </p>
          </>
        )}

        <div className="mt-7 flex items-center justify-center gap-2.5">
          <Link
            href="/proprietaire/dashboard"
            className="px-5 py-2.5 rounded-full bg-[#C4714A] hover:bg-[#A35A38] text-white text-xs font-bold transition-colors"
          >
            Mon espace
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full border border-[#EDD9A3] text-[#6B5D4E] hover:border-[#C4714A] text-xs font-bold transition-colors"
          >
            Retour à l’accueil
          </Link>
        </div>
      </div>
    </main>
  );
}
