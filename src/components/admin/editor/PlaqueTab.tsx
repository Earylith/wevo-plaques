"use client";

import React, { useState } from "react";
import {
  Check, Warning, Spinner, ArrowSquareOut, Package, Lock,
} from "@phosphor-icons/react";
import { Accommodation, PlaqueConfig, PlaqueWood, PlaqueOrder, ORDER_STATUS_LABELS } from "@/lib/types/accommodation";
import VerrouConfort from "@/components/admin/editor/VerrouConfort";

/**
 * Onglet « Plaque » de l'éditeur.
 *
 * Deux teintes de bois, un aperçu du rendu réel avec le VRAI QR code, et la
 * commande. Le fond bois sert uniquement à la présentation : il n'entrera
 * jamais dans le fichier de gravure, qui repartira d'un tracé vectoriel.
 *
 * Déclaré au niveau du module — dans le corps de l'éditeur, React le
 * remonterait à chaque frappe.
 */

interface WoodOption {
  id: PlaqueWood;
  label: string;
  hint: string;
  /** Teinte dominante, pour la pastille de choix. */
  swatch: string;
}

/** Phrase gravée au bas de la plaque, telle qu'elle figure sur le gabarit. */
export const TAGLINE_PAR_DEFAUT = "Profitez pleinement de votre séjour !";

/**
 * Longueur maximale de la phrase gravée.
 *
 * Ce n'est pas une limite de base de données. L'aperçu réduit déjà la phrase
 * pour qu'elle tienne dans la plaque, mais une phrase trop longue finirait
 * gravée si petite qu'elle en deviendrait illisible. On l'arrête donc avant.
 */
export const TAGLINE_MAX = 40;

/**
 * Essences proposées.
 *
 * Une seule pour l'instant. La structure reste une liste : en rajouter une
 * ne demandera qu'une entrée de plus, ici et dans les textures de l'aperçu.
 */
const WOODS: WoodOption[] = [
  {
    id: "noyer",
    label: "Essence de bois",
    hint: "Brun profond, contraste marqué — la signature Guidz.",
    swatch: "#5C3D2E",
  },
];

/** Ce que reçoit l'hôte, tel qu'il faut le lui annoncer. */
const CARACTERISTIQUES = [
  "Essence de bois",
  "Dimensions 25 × 22 cm",
  "Système de fixation murale inclus",
];

/**
 * Ramène une essence enregistrée à une essence réellement commandable.
 *
 * Des livrets portent une essence qui n'est plus proposée. L'interface la
 * montre déjà repliée sur celle par défaut ; sans cette conversion au moment
 * de commander, la commande figerait une teinte qu'on ne produit plus alors
 * que l'écran en affichait une autre.
 */
export function essenceCommandable(wood?: PlaqueWood): PlaqueWood {
  return WOODS.some((w) => w.id === wood) ? (wood as PlaqueWood) : WOODS[0].id;
}

interface PlaqueTabProps {
  data: Accommodation;
  /** Modifie la configuration de plaque du livret. */
  onChange: (patch: Partial<PlaqueConfig>) => void;
  /** Commandes déjà passées pour ce logement. */
  orders: PlaqueOrder[];
  /** Attribue l'identifiant permanent puis enregistre la commande. */
  onOrder: () => Promise<void>;
  ordering: boolean;
  /** Enregistrement en attente : commander figerait un état non sauvegardé. */
  dirty: boolean;
  error: string | null;
  /**
   * La commande est-elle passable depuis cet écran ?
   *
   * Côté hôte, non : elle relève du parcours de paiement, et l'action serveur
   * qui l'enregistre est réservée à l'administration. L'hôte choisit sa
   * plaque et sa phrase, Guidz produit.
   */
  commandable?: boolean;
}

export default function PlaqueTab({
  data, onChange, orders, onOrder, ordering, dirty, error, commandable = true,
}: PlaqueTabProps) {
  const [confirming, setConfirming] = useState(false);

  const plaque: PlaqueConfig = data.plaque || { wood: "noyer" };
  const tagline = plaque.engravedTagline?.trim() ? plaque.engravedTagline : TAGLINE_PAR_DEFAUT;
  const wood = WOODS.find((w) => w.id === plaque.wood) || WOODS[0];

  const lastOrder = orders[0];

  return (
    <div className="space-y-5">
      {/* ── Teinte du bois ── */}
      <div className="space-y-3">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-[15px] font-bold text-[#5C3D2E]">
            Teinte du bois
          </h3>
          <p className="text-[11px] text-[#6B5D4E] mt-0.5">
            Une essence unique, choisie pour la netteté de la gravure.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {WOODS.map((option) => {
            const active = wood.id === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onChange({ wood: option.id })}
                className={`p-3 rounded-2xl border text-left transition-colors ${
                  active
                    ? "border-[#C4714A] bg-[#C4714A]/5"
                    : "border-[#EDD9A3]/60 hover:border-[#EDD9A3]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded-full border-2 border-white shadow-sm shrink-0"
                    style={{ backgroundColor: option.swatch }}
                  />
                  <span className={`text-xs font-bold ${active ? "text-[#C4714A]" : "text-[#2A2016]"}`}>
                    {option.label}
                  </span>
                  {active && <Check size={13} weight="bold" className="text-[#C4714A] ml-auto" />}
                </span>
                <span className="block text-[10px] text-[#6B5D4E] mt-1.5 leading-snug">
                  {option.hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Ce que contient la commande ── */}
      <ul className="space-y-1.5">
        {CARACTERISTIQUES.map((c) => (
          <li key={c} className="flex items-start gap-2 text-[11px] text-[#5C3D2E]">
            <Check size={13} weight="bold" className="shrink-0 mt-0.5 text-[#C4714A]" />
            {c}
          </li>
        ))}
      </ul>

      {/* ── Phrase gravée ── */}
      <VerrouConfort
        verrouille={data.offerType !== "comfort"}
        argument="Faites graver votre propre phrase au bas de la plaque, à la place du texte standard."
      >
      <div className="space-y-2 pt-4 border-t border-[#EDD9A3]/60">
        <h3 className="font-[family-name:var(--font-display)] text-[15px] font-bold text-[#5C3D2E]">
          Votre phrase
        </h3>
        <p className="text-[11px] text-[#6B5D4E] leading-relaxed">
          Votre signature, gravée en bas de la plaque. C’est le mot qui vous
          ressemble — le reste de la mise en page est composé pour lui laisser
          toute la place.
        </p>
        {orders.some((o) => o.status !== "annulee") && (
          <p className="text-[11px] text-[#6B5D4E] bg-[#FDF9F2] border border-[#EDD9A3] rounded-xl px-3 py-2.5">
            La plaque déjà commandée garde la phrase qu’elle portait : elle est
            figée dans la commande. Ce que vous écrivez ici vaut pour vos
            prochaines commandes.
          </p>
        )}
        <input
          type="text"
          value={tagline}
          maxLength={TAGLINE_MAX}
          onChange={(e) => onChange({ engravedTagline: e.target.value })}
          placeholder={TAGLINE_PAR_DEFAUT}
          className="w-full px-3 py-2.5 rounded-xl border border-[#EDD9A3] bg-white text-xs outline-none focus:border-[#C4714A]"
        />
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onChange({ engravedTagline: TAGLINE_PAR_DEFAUT })}
            disabled={tagline === TAGLINE_PAR_DEFAUT}
            className="text-[10px] font-bold text-[#A8998A] hover:text-[#C4714A] transition-colors disabled:opacity-40 disabled:hover:text-[#A8998A]"
          >
            Rétablir la phrase d’origine
          </button>
          <span
            className={`text-[10px] tabular-nums ${
              tagline.length > TAGLINE_MAX - 5 ? "text-[#C4714A] font-bold" : "text-[#A8998A]"
            }`}
          >
            {tagline.length}/{TAGLINE_MAX}
          </span>
        </div>
      </div>
      </VerrouConfort>


      {/* ── Commandes passées ── */}
      {commandable && orders.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-[#EDD9A3]/60">
          <h3 className="font-[family-name:var(--font-display)] text-[15px] font-bold text-[#5C3D2E]">
            Vos commandes
          </h3>
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-3 rounded-xl border border-[#EDD9A3]/60 bg-white flex items-center justify-between gap-3"
            >
              <span className="min-w-0">
                <span className="block text-xs font-bold text-[#2A2016]">
                  {order.reference}
                  <span className="ml-1.5 font-normal text-[#6B5D4E]">
                    · {WOODS.find((w) => w.id === order.plaque?.wood)?.label || "—"}
                  </span>
                </span>
                <span className="block text-[10px] text-[#6B5D4E]">
                  Version {order.version} ·{" "}
                  {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </span>
              <span className="shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#FDF3DC] text-[#A35A38]">
                {ORDER_STATUS_LABELS[order.status]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Commander ── */}
      {commandable && (
      <div className="space-y-2.5 pt-4 border-t border-[#EDD9A3]/60">
        {data.slugLocked && (
          <p className="text-[11px] text-[#5C3D2E] bg-[#FDF9F2] border border-[#EDD9A3] rounded-xl px-3 py-2.5 flex items-start gap-1.5">
            <Lock size={13} weight="fill" className="shrink-0 mt-0.5 text-[#C4714A]" />
            L’adresse publique de ce livret est verrouillée : elle est gravée sur
            une plaque commandée.
          </p>
        )}

        {error && (
          <p className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 flex items-start gap-1.5">
            <Warning size={13} weight="fill" className="shrink-0 mt-0.5" />
            {error}
          </p>
        )}

        {dirty ? (
          <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 flex items-start gap-1.5">
            <Warning size={13} weight="fill" className="shrink-0 mt-0.5" />
            Enregistrez vos modifications avant de commander : la commande fige
            la configuration telle qu’elle est en base.
          </p>
        ) : confirming ? (
          <div className="rounded-2xl border border-[#C4714A] bg-[#C4714A]/5 p-3.5 space-y-2.5">
            <p className="text-xs font-bold text-[#2A2016]">
              Commander une plaque en {wood.label.toLowerCase()} ?
            </p>
            <p className="text-[11px] text-[#5C3D2E] leading-relaxed">
              Cette action <strong>verrouille définitivement l’adresse publique</strong> de
              votre livret, puisqu’elle sera gravée dans le bois. Le contenu du
              livret, lui, restera modifiable à volonté.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void onOrder().finally(() => setConfirming(false))}
                disabled={ordering}
                className="flex-1 py-2.5 rounded-full bg-[#C4714A] hover:bg-[#A35A38] text-white text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-60 transition-colors"
              >
                {ordering ? <Spinner size={14} className="animate-spin" /> : <Check size={14} weight="bold" />}
                {ordering ? "Enregistrement…" : "Confirmer la commande"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={ordering}
                className="px-4 py-2.5 rounded-full border border-[#EDD9A3] text-xs font-bold text-[#5C3D2E] hover:bg-white transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="w-full py-3 rounded-full bg-[#C4714A] hover:bg-[#A35A38] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <Package size={15} weight="fill" />
            {orders.length > 0 ? "Commander une nouvelle plaque" : "Commander cette plaque"}
          </button>
        )}

        {lastOrder && (
          <a
            href={lastOrder.permanentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 rounded-full border border-[#EDD9A3] text-xs font-bold text-[#5C3D2E] hover:border-[#C4714A] flex items-center justify-center gap-1.5 transition-colors"
          >
            Tester le QR gravé <ArrowSquareOut size={13} weight="bold" />
          </a>
        )}

        <p className="text-[10px] text-[#6B5D4E] text-center leading-relaxed">
          Commande directe, réservée à Guidz. Côté hôte, la plaque part avec le
          paiement : « Publier et commander ma plaque » règle et lance la
          gravure d&apos;un seul geste.
        </p>
      </div>
      )}
    </div>
  );
}
