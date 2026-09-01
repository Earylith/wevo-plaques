"use client";

import { useState } from "react";
import { Truck } from "@phosphor-icons/react";
import { updateOrderShipping } from "@/app/admin/orders";
import { PlaqueOrder } from "@/lib/types/accommodation";

/**
 * Suivi d'expédition d'une plaque, renseigné par Guidz.
 *
 * Ce qui est saisi ici part directement dans l'espace du client : c'est la
 * seule information qu'il attend une fois qu'il a payé. Un client sans
 * nouvelles écrit ; un client qui suit son colis attend.
 *
 * Enregistrer un suivi marque aussi la commande comme expédiée. Demander deux
 * gestes à l'équipe, c'est garantir qu'un des deux sera oublié.
 *
 * Déclaré dans son propre module : dans le corps de la page, React le
 * remonterait à chaque frappe et le champ perdrait le focus.
 */

/** Date au format court, ou un tiret quand il n'y en a pas. */
export function dateCourte(ms?: number | null): string {
  if (!ms) return "—";
  return new Date(ms).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Une information de commande : intitulé discret, valeur lisible. */
export function Champ({
  intitule,
  children,
}: {
  intitule: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#A8998A]">
        {intitule}
      </p>
      <div className="mt-0.5 truncate text-[12px] text-[#2A2016]">{children}</div>
    </div>
  );
}

export default function PanneauExpedition({
  order,
  onEnregistre,
}: {
  order: PlaqueOrder;
  onEnregistre: (maj: Partial<PlaqueOrder>) => void;
}) {
  const [ouvert, setOuvert] = useState(Boolean(order.trackingUrl || order.carrier));
  const [transporteur, setTransporteur] = useState(order.carrier || "");
  const [numero, setNumero] = useState(order.trackingNumber || "");
  const [lien, setLien] = useState(order.trackingUrl || "");
  const [note, setNote] = useState(order.clientNote || "");
  const [livraison, setLivraison] = useState(
    order.estimatedDelivery
      ? new Date(order.estimatedDelivery).toISOString().slice(0, 10)
      : ""
  );
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [enregistre, setEnregistre] = useState(false);

  const soumettre = async () => {
    setEnCours(true);
    setErreur(null);
    try {
      // Midi plutôt que minuit : une date de livraison ne doit pas basculer
      // au jour précédent selon le fuseau de celui qui la lit.
      const estimee = livraison ? new Date(`${livraison}T12:00:00`).getTime() : null;

      await updateOrderShipping(order.id!, {
        carrier: transporteur,
        trackingNumber: numero,
        trackingUrl: lien,
        clientNote: note,
        estimatedDelivery: estimee,
      });

      onEnregistre({
        carrier: transporteur || undefined,
        trackingNumber: numero || undefined,
        trackingUrl: lien || undefined,
        clientNote: note || undefined,
        estimatedDelivery: estimee || undefined,
        status: lien || numero ? "expediee" : order.status,
      });
      setEnregistre(true);
      setTimeout(() => setEnregistre(false), 2500);
    } catch (e) {
      console.error(e);
      setErreur(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setEnCours(false);
    }
  };

  if (!ouvert) {
    return (
      <div className="border-t border-[#EDD9A3]/40 px-6 py-3">
        <button
          type="button"
          onClick={() => setOuvert(true)}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#2B5F75] transition-colors hover:text-[#C4714A]"
        >
          <Truck size={13} weight="bold" />
          Renseigner le suivi de livraison
        </button>
      </div>
    );
  }

  const champ =
    "mt-1 w-full rounded-lg border border-[#D6E3E8] bg-white px-2.5 py-1.5 text-[12px] outline-none focus:border-[#2B5F75]";
  const intitule = "text-[10px] font-semibold text-[#6B5D4E]";

  return (
    <div className="border-t border-[#EDD9A3]/40 bg-[#F7FAFB] px-6 py-4">
      <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#2B5F75]">
        <Truck size={12} weight="bold" />
        Suivi de livraison — visible par le client
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className={intitule}>Transporteur</span>
          <input
            value={transporteur}
            onChange={(e) => setTransporteur(e.target.value)}
            placeholder="Colissimo, Mondial Relay…"
            className={champ}
          />
        </label>
        <label className="block">
          <span className={intitule}>Numéro de suivi</span>
          <input
            value={numero}
            onChange={(e) => setNumero(e.target.value)}
            className={`${champ} font-mono`}
          />
        </label>
        <label className="block lg:col-span-2">
          <span className={intitule}>Lien de suivi</span>
          <input
            value={lien}
            onChange={(e) => setLien(e.target.value)}
            placeholder="https://…"
            className={champ}
          />
        </label>
        <label className="block">
          <span className={intitule}>Livraison prévue</span>
          <input
            type="date"
            value={livraison}
            onChange={(e) => setLivraison(e.target.value)}
            className={champ}
          />
        </label>
        <label className="block lg:col-span-3">
          <span className={intitule}>Mot au client</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Facultatif — s’affiche dans son espace"
            className={champ}
          />
        </label>
      </div>

      {erreur && <p className="mt-2.5 text-[11px] text-red-700">{erreur}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void soumettre()}
          disabled={enCours}
          className="rounded-full bg-[#2B5F75] px-4 py-2 text-[11px] font-bold text-white transition-colors hover:bg-[#1A3F52] disabled:opacity-60"
        >
          {enCours ? "Enregistrement…" : "Enregistrer le suivi"}
        </button>
        {enregistre && (
          <span className="text-[11px] font-semibold text-[#3F5836]">
            Enregistré — visible dans l’espace du client.
          </span>
        )}
        {order.shippedAt && (
          <span className="text-[11px] text-[#6B5D4E]">
            Expédiée le {dateCourte(order.shippedAt)}
          </span>
        )}
      </div>
    </div>
  );
}
