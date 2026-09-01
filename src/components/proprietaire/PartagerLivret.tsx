"use client";

import { useState } from "react";
import { ChatCircleDots, DeviceMobile, PencilSimple, Check } from "@phosphor-icons/react";
import { enregistrerMessagePartage } from "@/app/espace-actions";

/**
 * Envoi du livret au voyageur, par SMS ou WhatsApp.
 *
 * Un lien seul, jeté dans une conversation, ressemble à un spam : le voyageur
 * ne sait ni de qui il vient ni pourquoi. L'hôte écrit donc son mot une fois,
 * et le retrouve prérempli à chaque partage — le lien y est ajouté tout seul.
 *
 * Aucun numéro n'est demandé : on ouvre l'application de messagerie de l'hôte
 * avec le texte prêt, et c'est lui qui choisit le destinataire. Demander un
 * numéro obligerait à le stocker, pour un service que le téléphone rend déjà.
 */

const MESSAGE_PAR_DEFAUT =
  "Bonjour, merci pour votre réservation. Voici toutes les informations utiles pour votre séjour :";

export default function PartagerLivret({
  livretId,
  lien,
  messageInitial,
  jeton,
}: {
  livretId: string;
  lien: string;
  messageInitial: string | null;
  /** Jeton de l'hôte, pour enregistrer son message. */
  jeton: () => Promise<string | undefined>;
}) {
  const [message, setMessage] = useState(messageInitial || MESSAGE_PAR_DEFAUT);
  const [edition, setEdition] = useState(false);
  const [enregistre, setEnregistre] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

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
    <div className="border-t border-black/[0.05] px-5 py-4 sm:px-7 sm:py-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-[#A8998A]">
          Envoyer à vos voyageurs
        </p>
        <button
          type="button"
          onClick={() => setEdition((v) => !v)}
          className="flex items-center gap-1 text-[12px] font-semibold text-[#A35A38] transition-colors hover:text-[#C4714A]"
        >
          <PencilSimple size={12} weight="bold" />
          {edition ? "Terminer" : "Modifier le message"}
        </button>
      </div>

      {edition ? (
        <div className="mt-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-2xl border border-black/[0.08] bg-white px-4 py-3 text-[14px] leading-relaxed text-[#2A2016] outline-none focus:border-[#C4714A]"
          />
          <p className="mt-1.5 text-[12px] text-[#A8998A]">
            Le lien de votre livret est ajouté automatiquement à la fin.
          </p>
          {erreur && <p className="mt-2 text-[12.5px] text-red-700">{erreur}</p>}
          <button
            type="button"
            onClick={() => void enregistrer()}
            className="mt-3 rounded-full bg-[#2A2016] px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:bg-[#C4714A] active:scale-[0.98]"
          >
            Enregistrer ce message
          </button>
        </div>
      ) : (
        <>
          <p className="mt-2.5 rounded-2xl bg-[#F6F3ED] px-4 py-3 text-[13.5px] leading-relaxed text-[#5C3D2E]">
            {message}{" "}
            <span className="break-all font-mono text-[12px] text-[#A8998A]">{lien}</span>
          </p>

          <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-[13.5px] font-semibold text-white transition-all hover:brightness-95 active:scale-[0.98]"
            >
              <ChatCircleDots size={15} weight="fill" />
              WhatsApp
            </a>
            <a
              href={sms}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-black/[0.08] px-5 py-3 text-[13.5px] font-semibold text-[#6B5D4E] transition-all hover:border-black/20 hover:text-[#2A2016] active:scale-[0.98]"
            >
              <DeviceMobile size={15} weight="bold" />
              SMS
            </a>
          </div>

          {enregistre && (
            <p className="mt-2.5 flex items-center gap-1.5 text-[12.5px] font-semibold text-emerald-700">
              <Check size={13} weight="bold" />
              Message enregistré.
            </p>
          )}
        </>
      )}
    </div>
  );
}
