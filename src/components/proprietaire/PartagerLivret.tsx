"use client";

import { useState } from "react";
import {
  ChatCircleDots,
  DeviceMobile,
  PencilSimple,
  Check,
  ArrowRight,
  House,
  MapPin,
  Sparkle,
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
 * Le dashboard montre un rappel compact du message. L'hôte peut le modifier
 * sur place, puis ouvrir WhatsApp ou l'application SMS sans quitter son flux.
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
    <div className="border-t border-black/[0.05] px-5 py-5 sm:px-7 sm:py-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-[#2A2016]">Envoyer à vos voyageurs</p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-[#8A7968]">
            Votre message enregistré accompagne automatiquement le lien.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEdition((v) => !v)}
          className="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] font-semibold text-[#A35A38] transition-colors hover:bg-[#C4714A]/8 hover:text-[#C4714A]"
        >
          <PencilSimple size={13} weight="bold" />
          {edition ? "Fermer l'éditeur" : "Modifier le message"}
        </button>
      </div>

      <div className="mt-4 rounded-2xl bg-[#F8F5F0] p-4">
        <p className="line-clamp-2 whitespace-pre-wrap text-[13.5px] leading-relaxed text-[#5C3D2E]">
          {message}
        </p>
        <a
          href={lien}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-3 flex overflow-hidden rounded-[18px] border border-black/[0.07] bg-white shadow-[0_5px_18px_-14px_rgba(42,32,22,.4)] transition-all hover:border-[#C4714A]/35 hover:shadow-[0_9px_24px_-16px_rgba(42,32,22,.45)]"
        >
          <span
            aria-hidden
            className={`relative flex w-[86px] shrink-0 items-center justify-center overflow-hidden sm:w-[104px] ${estConfort ? "bg-[#2A2016]" : "bg-[#EAF0E5]"}`}
            style={imageCouverture ? {
              backgroundImage: `linear-gradient(rgba(42,32,22,.18), rgba(42,32,22,.18)), url("${imageCouverture.replace(/"/g, "\\\"")}")`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            } : undefined}
          >
            {!imageCouverture && (
              estConfort
                ? <Sparkle size={22} weight="fill" className="text-[#E8BE72]" />
                : <House size={22} weight="duotone" className="text-[#5A7A4E]" />
            )}
          </span>
          <span className="min-w-0 flex-1 px-3.5 py-3">
            <span className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.12em] text-[#A35A38]">
              {estConfort && <Sparkle size={11} weight="fill" />}
              Livret d’accueil
            </span>
            <span className="mt-0.5 block truncate font-[family-name:var(--font-display)] text-[16px] font-bold text-[#2A2016]">
              {nom}
            </span>
            {ville && (
              <span className="mt-0.5 flex items-center gap-1 truncate text-[11.5px] text-[#8A7968]">
                <MapPin size={11} weight="fill" className="shrink-0" /> {ville}
              </span>
            )}
          </span>
          <span className="flex shrink-0 items-center gap-1 self-center pr-3.5 text-[11.5px] font-semibold text-[#A35A38]">
            Ouvrir
            <ArrowRight size={12} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </a>
      </div>

      {edition && (
        <div className="mt-3.5 rounded-2xl border border-[#C4714A]/20 bg-white p-4 shadow-sm">
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
