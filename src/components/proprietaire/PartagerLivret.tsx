"use client";

import { useState } from "react";
import {
  ChatCircleDots,
  DeviceMobile,
  PencilSimple,
  Check,
  Sparkle,
  House,
  MapPin,
  ArrowRight,
} from "@phosphor-icons/react";
import { enregistrerMessagePartage } from "@/app/espace-actions";
import { OfferType } from "@/lib/types/accommodation";

/**
 * Envoi du livret au voyageur, par SMS ou WhatsApp.
 *
 * Un lien seul, jeté dans une conversation, ressemble à un spam : le voyageur
 * ne sait ni de qui il vient ni pourquoi. L'hôte écrit donc son mot une fois,
 * et le retrouve prérempli à chaque partage — le lien y est ajouté tout seul.
 *
 * L'aperçu montre fidèlement la carte que le voyageur recevra, adaptée selon
 * la formule : photo de couverture et expérience complète pour le Confort,
 * titre de l'hébergement et consignes essentielles pour l'Essentielle.
 */

const MESSAGE_PAR_DEFAUT =
  "Bonjour, merci pour votre réservation. Voici toutes les informations utiles pour votre séjour :";

export default function PartagerLivret({
  livretId,
  lien,
  nom,
  formule,
  imageCouverture,
  ville,
  messageInitial,
  jeton,
}: {
  livretId: string;
  lien: string;
  nom: string;
  formule: OfferType;
  imageCouverture?: string | null;
  ville?: string | null;
  messageInitial: string | null;
  /** Jeton de l'hôte, pour enregistrer son message. */
  jeton: () => Promise<string | undefined>;
}) {
  const [message, setMessage] = useState(messageInitial || MESSAGE_PAR_DEFAUT);
  const [edition, setEdition] = useState(false);
  const [enregistre, setEnregistre] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  const estConfort = formule === "comfort";

  /*
   * Le lien est ajouté au moment de l'envoi, jamais stocké dans le message :
   * l'adresse d'un livret peut changer tant qu'il n'est pas payé, et un
   * message figé enverrait alors les voyageurs dans le vide.
   */
  const texteComplet = `${message.trim()} ${lien}`;

  const sms = `sms:?&body=${encodeURIComponent(texteComplet)}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(texteComplet)}`;

  const enregistrer = async () => {
    setErreur(null);
    try {
      await enregistrerMessagePartage(livretId, message, await jeton());
      setEdition(false);
      setEnregistre(true);
      setTimeout(() => setEnregistre(false), 2500);
    } catch (e) {
      console.error(e);
      setErreur(e instanceof Error ? e.message : "Enregistrement impossible.");
    }
  };

  return (
    <div className="border-t border-black/[0.05] px-5 py-4 sm:px-7 sm:py-6">
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#A8998A]">
            Envoyer à vos voyageurs
          </p>
          <p className="text-[12.5px] text-[#6B5D4E] mt-0.5">
            Aperçu du message et du lien partagé avec vos locataires
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEdition((v) => !v)}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-[#A35A38] transition-colors hover:text-[#C4714A] shrink-0"
        >
          <PencilSimple size={13} weight="bold" />
          {edition ? "Fermer l'éditeur" : "Modifier le message"}
        </button>
      </div>

      {edition && (
        <div className="my-3.5 rounded-2xl border border-black/[0.08] bg-white p-4 shadow-sm">
          <label className="block text-[12px] font-semibold text-[#5C3D2E] mb-1.5">
            Votre message personnalisé :
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-black/[0.08] bg-[#FAF8F5] px-3.5 py-2.5 text-[13.5px] leading-relaxed text-[#2A2016] outline-none focus:border-[#C4714A] focus:bg-white transition-colors"
          />
          <p className="mt-1 text-[11.5px] text-[#A8998A]">
            Le lien vers votre livret sera automatiquement ajouté à la fin du message lors de l&apos;envoi.
          </p>
          {erreur && <p className="mt-2 text-[12.5px] text-red-700">{erreur}</p>}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => void enregistrer()}
              className="rounded-full bg-[#2A2016] px-5 py-2 text-[12.5px] font-semibold text-white transition-all hover:bg-[#C4714A] active:scale-[0.98]"
            >
              Enregistrer ce message
            </button>
            <button
              type="button"
              onClick={() => setEdition(false)}
              className="rounded-full border border-black/[0.08] px-4 py-2 text-[12.5px] font-medium text-[#6B5D4E] hover:bg-black/5"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* ── Aperçu réaliste du message & de la carte livret ── */}
      <div className="mt-3 overflow-hidden rounded-2xl border border-black/[0.07] bg-[#FAF7F2] p-4 sm:p-5">
        {/* Texte du message */}
        <p className="text-[13.5px] leading-relaxed text-[#5C3D2E] mb-3 whitespace-pre-wrap">
          {message}
        </p>

        {/* Card d'aperçu du livret (Lien riche voyageur) */}
        <a
          href={lien}
          target="_blank"
          rel="noopener noreferrer"
          title="Ouvrir le livret voyageur"
          className="group block overflow-hidden rounded-[20px] border border-black/[0.08] bg-white shadow-[0_2px_12px_rgba(42,32,22,0.05)] transition-all hover:border-[#C4714A]/40 hover:shadow-[0_8px_24px_rgba(42,32,22,0.09)] active:scale-[0.99]"
        >
          {estConfort ? (
            /* ── APERÇU FORMULE CONFORT (Image de couverture & Wording premium) ── */
            <>
              {imageCouverture ? (
                <div className="relative aspect-[16/9] sm:aspect-[21/9] max-h-52 w-full overflow-hidden bg-[#2A2016]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageCouverture}
                    alt={nom}
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  {/* Badges d'angle */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    {ville ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md border border-white/20">
                        <MapPin size={12} weight="fill" className="text-[#E8BE72]" />
                        {ville}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#C4714A] px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-wider text-white shadow-md">
                      <Sparkle size={11} weight="fill" className="text-[#E8BE72]" />
                      Confort
                    </span>
                  </div>

                  {/* Nom du logement sur la photo */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h4 className="font-[family-name:var(--font-display)] text-[20px] sm:text-[23px] font-bold text-white leading-tight drop-shadow-md truncate">
                      {nom}
                    </h4>
                  </div>
                </div>
              ) : (
                /* Fallback Confort si photo pas encore ajoutée */
                <div className="relative h-28 sm:h-32 w-full overflow-hidden bg-gradient-to-br from-[#2A2016] via-[#3D2E22] to-[#C4714A]/40 flex items-center justify-center p-5 text-center">
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#C4714A] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      <Sparkle size={10} weight="fill" className="text-[#E8BE72]" /> Confort
                    </span>
                  </div>
                  <div>
                    <h4 className="font-[family-name:var(--font-display)] text-[20px] sm:text-[22px] font-bold text-white leading-tight">
                      {nom}
                    </h4>
                    {ville && (
                      <p className="text-[12px] text-white/70 mt-0.5">{ville}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Description & wording Confort */}
              <div className="p-4 sm:p-5 bg-white">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#C4714A]">
                    Livret d’accueil digital
                  </span>
                  <span className="text-[11px] font-mono text-[#A8998A]">
                    guidzme.fr
                  </span>
                </div>
                <p className="text-[13px] sm:text-[13.5px] leading-relaxed text-[#6B5D4E]">
                  Retrouvez toutes les informations utiles pour votre séjour : code Wi-Fi, consignes d’arrivée, équipements pas-à-pas &amp; recommandations locales.
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-[#A35A38] group-hover:text-[#C4714A] transition-colors">
                  <span>Consulter le livret voyageur</span>
                  <ArrowRight size={13} weight="bold" className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </>
          ) : (
            /* ── APERÇU FORMULE ESSENTIELLE (Titre mis en valeur & Wording adapté) ── */
            <div className="p-5 sm:p-6 bg-gradient-to-br from-[#FAF8F5] via-white to-[#F5EFE6] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#5A7A4E]/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#5A7A4E]/10 text-[#425B39]">
                    <House size={15} weight="duotone" />
                  </div>
                  <div>
                    <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#5A7A4E]">
                      Formule Essentielle
                    </span>
                    <span className="mx-1.5 text-black/20">·</span>
                    <span className="text-[11px] font-mono text-[#A8998A]">guidzme.fr</span>
                  </div>
                </div>
                <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-[10.5px] font-medium text-[#6B5D4E]">
                  Sans application
                </span>
              </div>

              {/* Titre de l'hébergement */}
              <h4 className="font-[family-name:var(--font-display)] text-[21px] sm:text-[24px] font-bold text-[#2A2016] group-hover:text-[#C4714A] transition-colors leading-tight">
                {nom}
              </h4>
              {ville && (
                <p className="text-[12px] font-medium text-[#8A7968] mt-0.5">
                  {ville}
                </p>
              )}

              {/* Wording Essentielle */}
              <p className="mt-2 text-[13px] sm:text-[13.5px] leading-relaxed text-[#6B5D4E]">
                Toutes les consignes utiles pour votre séjour : codes Wi-Fi, horaires d’arrivée &amp; de départ, règles du logement et contacts d’urgence.
              </p>

              <div className="mt-3.5 pt-3 border-t border-black/[0.06] flex items-center justify-between text-[12px]">
                <span className="text-[#8A7968] font-medium">Page mobile dédiée</span>
                <span className="font-semibold text-[#5A7A4E] group-hover:text-[#3B5432] flex items-center gap-1 group-hover:translate-x-0.5 transition-all">
                  Consulter la page <ArrowRight size={12} weight="bold" />
                </span>
              </div>
            </div>
          )}
        </a>
      </div>

      {/* ── Boutons d'action : WhatsApp et SMS ── */}
      <div className="mt-3.5 flex flex-col gap-2.5 sm:flex-row">
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-[13.5px] font-semibold text-white transition-all hover:brightness-95 active:scale-[0.98] shadow-sm"
        >
          <ChatCircleDots size={16} weight="fill" />
          Partager sur WhatsApp
        </a>
        <a
          href={sms}
          className="flex flex-1 items-center justify-center gap-2 rounded-full border border-black/[0.08] bg-white px-5 py-3 text-[13.5px] font-semibold text-[#6B5D4E] transition-all hover:border-black/20 hover:text-[#2A2016] active:scale-[0.98] shadow-sm"
        >
          <DeviceMobile size={16} weight="bold" />
          Envoyer par SMS
        </a>
      </div>

      {enregistre && (
        <p className="mt-2.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-emerald-700">
          <Check size={13} weight="bold" />
          Message personnalisé enregistré.
        </p>
      )}
    </div>
  );
}
