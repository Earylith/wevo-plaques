"use client";

import { useState } from "react";
import { MapPin, Copy, Check, PencilSimple, Phone } from "@phosphor-icons/react";
import { updateOrderShipping } from "@/app/admin/orders";
import { AdressePostale, PlaqueOrder } from "@/lib/types/accommodation";
import { adresseEnTexte, lignesAdresse, adresseExpediable } from "@/lib/adressePostale";

/**
 * Où envoyer la plaque.
 *
 * L'information la plus bête et la plus indispensable de tout l'écran :
 * une plaque gravée sans adresse reste sur l'établi. Elle est désormais
 * demandée au paiement, mais deux cas obligent à pouvoir la saisir ici — les
 * commandes passées avant que Stripe ne la réclame, et le client qui s'est
 * trompé d'étage.
 *
 * Le bouton de copie n'est pas un confort : recopier une adresse à la main
 * dans l'interface d'un transporteur, c'est un chiffre de code postal
 * inversé tôt ou tard, et un colis qui part à l'autre bout du département.
 */

/** Une adresse vide, prête à être remplie. */
const VIDE: AdressePostale = {
  line1: "",
  line2: "",
  postalCode: "",
  city: "",
  country: "FR",
};

export default function AdresseLivraison({
  order,
  onEnregistre,
}: {
  order: PlaqueOrder;
  onEnregistre: (maj: Partial<PlaqueOrder>) => void;
}) {
  const [edition, setEdition] = useState(false);
  const [copie, setCopie] = useState(false);
  const [adresse, setAdresse] = useState<AdressePostale>(order.shippingAddress || VIDE);
  const [destinataire, setDestinataire] = useState(order.shippingName || order.ownerName || "");
  const [telephone, setTelephone] = useState(order.shippingPhone || "");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const connue = adresseExpediable(order.shippingAddress);
  const nom = order.shippingName || order.ownerName || "";

  const copier = () => {
    const texte = adresseEnTexte(order.shippingAddress, nom);
    navigator.clipboard?.writeText(texte);
    setCopie(true);
    setTimeout(() => setCopie(false), 2000);
  };

  const enregistrer = async () => {
    setEnCours(true);
    setErreur(null);
    try {
      await updateOrderShipping(order.id!, {
        // Le suivi déjà saisi est repassé tel quel : ce panneau ne touche
        // qu'à l'adresse, et ne doit pas effacer le numéro de colis.
        carrier: order.carrier,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        clientNote: order.clientNote,
        estimatedDelivery: order.estimatedDelivery ?? null,
        shippingAddress: adresse,
        shippingName: destinataire,
        shippingPhone: telephone,
      });
      onEnregistre({
        shippingAddress: adresseExpediable(adresse) ? adresse : undefined,
        shippingName: destinataire || undefined,
        shippingPhone: telephone || undefined,
      });
      setEdition(false);
    } catch (e) {
      console.error(e);
      setErreur(e instanceof Error ? e.message : "Enregistrement impossible.");
    } finally {
      setEnCours(false);
    }
  };

  const champ =
    "mt-1 w-full rounded-lg border border-[#EDD9A3] bg-white px-2.5 py-1.5 text-[12px] outline-none focus:border-[#C4714A]";
  const intitule = "text-[10px] font-semibold text-[#6B5D4E]";

  if (edition) {
    return (
      <div className="border-t border-[#EDD9A3]/40 bg-[#FBF5EC] px-6 py-4">
        <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#A35A38]">
          <MapPin size={12} weight="fill" />
          Adresse de livraison
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block lg:col-span-2">
            <span className={intitule}>Destinataire</span>
            <input value={destinataire} onChange={(e) => setDestinataire(e.target.value)} className={champ} />
          </label>
          <label className="block lg:col-span-2">
            <span className={intitule}>Téléphone</span>
            <input
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="Réclamé par les transporteurs"
              className={champ}
            />
          </label>
          <label className="block lg:col-span-2">
            <span className={intitule}>Numéro et rue</span>
            <input
              value={adresse.line1}
              onChange={(e) => setAdresse({ ...adresse, line1: e.target.value })}
              className={champ}
            />
          </label>
          <label className="block lg:col-span-2">
            <span className={intitule}>Complément</span>
            <input
              value={adresse.line2 || ""}
              onChange={(e) => setAdresse({ ...adresse, line2: e.target.value })}
              placeholder="Bâtiment, étage, digicode…"
              className={champ}
            />
          </label>
          <label className="block">
            <span className={intitule}>Code postal</span>
            <input
              value={adresse.postalCode}
              onChange={(e) => setAdresse({ ...adresse, postalCode: e.target.value })}
              className={champ}
            />
          </label>
          <label className="block lg:col-span-2">
            <span className={intitule}>Ville</span>
            <input
              value={adresse.city}
              onChange={(e) => setAdresse({ ...adresse, city: e.target.value })}
              className={champ}
            />
          </label>
          <label className="block">
            <span className={intitule}>Pays</span>
            <input
              value={adresse.country}
              onChange={(e) => setAdresse({ ...adresse, country: e.target.value.toUpperCase() })}
              maxLength={2}
              className={`${champ} font-mono uppercase`}
            />
          </label>
        </div>

        {erreur && <p className="mt-2.5 text-[11px] text-red-700">{erreur}</p>}

        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => void enregistrer()}
            disabled={enCours}
            className="rounded-full bg-[#C4714A] px-4 py-2 text-[11px] font-bold text-white transition-colors hover:bg-[#A35A38] disabled:opacity-60"
          >
            {enCours ? "Enregistrement…" : "Enregistrer l’adresse"}
          </button>
          <button
            type="button"
            onClick={() => setEdition(false)}
            className="text-[11px] font-semibold text-[#6B5D4E] hover:text-[#2A2016]"
          >
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`border-t px-6 py-3.5 ${
        connue ? "border-[#EDD9A3]/40 bg-white" : "border-red-200 bg-red-50"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.12em] ${
              connue ? "text-[#A8998A]" : "text-red-700"
            }`}
          >
            <MapPin size={12} weight="fill" />
            Adresse de livraison
          </p>

          {connue ? (
            <>
              <div className="mt-1 text-[12px] leading-snug text-[#2A2016]">
                {lignesAdresse(order.shippingAddress, nom).map((ligne, i) => (
                  <div key={i} className={i === 0 ? "font-semibold" : undefined}>
                    {ligne}
                  </div>
                ))}
              </div>
              {order.shippingPhone && (
                <p className="mt-1 flex items-center gap-1 text-[11px] text-[#6B5D4E]">
                  <Phone size={11} weight="fill" />
                  {order.shippingPhone}
                </p>
              )}
            </>
          ) : (
            <p className="mt-1 max-w-md text-[12px] leading-snug text-red-700">
              Aucune adresse connue — cette plaque ne peut pas être expédiée.
              Réclamez-la au client, puis saisissez-la ici.
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {connue && (
            <button
              type="button"
              onClick={copier}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#EDD9A3] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#6B5D4E] transition-colors hover:border-[#C4714A] hover:text-[#C4714A]"
            >
              {copie ? (
                <>
                  <Check size={12} weight="bold" className="text-[#3F5836]" />
                  Copiée
                </>
              ) : (
                <>
                  <Copy size={12} />
                  Copier l’étiquette
                </>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={() => setEdition(true)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
              connue
                ? "border border-[#EDD9A3] bg-white text-[#6B5D4E] hover:border-[#C4714A] hover:text-[#C4714A]"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            <PencilSimple size={12} weight="bold" />
            {connue ? "Corriger" : "Saisir l’adresse"}
          </button>
        </div>
      </div>
    </div>
  );
}
