"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Eye, Check, Trash, ArrowLeft, ArrowRight, MagnifyingGlass, X, Spinner, Warning,
} from "@phosphor-icons/react";
import { uploadAdminImageAction } from "@/app/admin/actions";
import { compressImage, MAX_UPLOAD_BYTES } from "@/lib/imageCompression";
import { auth } from "@/lib/firebase/config";

/* Banque de photos libres (Unsplash) proposée quand l'hôte n'a pas encore
   ses propres visuels. Chaque entrée porte des mots-clés français pour que
   la recherche fonctionne hors ligne, sans clé d'API. */
const PHOTO_BANK: { url: string; tags: string[] }[] = [
  { url: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1400&q=80", tags: ["salon", "appartement", "moderne", "intérieur", "canapé"] },
  { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=80", tags: ["maison", "villa", "extérieur", "jardin"] },
  { url: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1400&q=80", tags: ["chambre", "lit", "cosy", "intérieur"] },
  { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=80", tags: ["salon", "lumineux", "appartement", "design"] },
  { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80", tags: ["maison", "villa", "moderne", "piscine"] },
  { url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1400&q=80", tags: ["villa", "piscine", "luxe", "extérieur"] },
  { url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=1400&q=80", tags: ["ville", "urbain", "rue"] },
  { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=80", tags: ["plage", "mer", "sable", "vacances", "littoral"] },
  { url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1400&q=80", tags: ["montagne", "nature", "lac", "randonnée"] },
  { url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=80", tags: ["campagne", "nature", "champ", "vert"] },
  { url: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1400&q=80", tags: ["calanque", "mer", "méditerranée", "falaise"] },
  { url: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=1400&q=80", tags: ["cuisine", "intérieur", "table"] },
  { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1400&q=80", tags: ["salon", "cheminée", "chaleureux"] },
  { url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1400&q=80", tags: ["salle de bain", "intérieur", "douche"] },
  { url: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1400&q=80", tags: ["terrasse", "balcon", "extérieur", "vue"] },
  { url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1400&q=80", tags: ["chalet", "montagne", "bois", "hiver"] },
];

interface PhotoManagerProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  /** Sert à pré-remplir la recherche de photos. */
  city?: string;
  /**
   * L'envoi de fichiers passe par une action serveur réservée à
   * l'administration. Sur la démo publique, on retire la zone de dépôt : la
   * banque d'images et l'ajout par lien suffisent à montrer le principe, et
   * personne ne se heurte à un « accès non autorisé ».
   */
  allowUpload?: boolean;
}

export default function PhotoManager({ photos, onChange, city, allowUpload = true }: PhotoManagerProps) {
  const [urlInput, setUrlInput] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  // Un envoi dure plusieurs secondes : sans cette référence, `add` repartirait
  // du tableau capturé au moment du dépôt et écraserait les photos ajoutées
  // entre-temps (deuxième lot, collage, sélection dans la banque d'images).
  const photosRef = useRef(photos);
  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  const add = useCallback(
    (urls: string[]) => {
      const base = photosRef.current;
      const clean = urls.map((u) => u.trim()).filter(Boolean).filter((u) => !base.includes(u));
      if (clean.length === 0) return;
      const next = [...base, ...clean];
      photosRef.current = next;
      onChange(next);
    },
    [onChange]
  );

  const uploadFiles = useCallback(
    async (files: File[]) => {
      const images = files.filter((f) => f.type.startsWith("image/"));
      if (images.length === 0) return;
      setError(null);
      setUploading((n) => n + images.length);
      const uploaded: string[] = [];
      for (const original of images) {
        try {
          // Réduction à 1600 px + WebP : indispensable, une photo de téléphone
          // brute dépasse la limite de corps des Server Actions.
          const file = await compressImage(original);
          if (file.size > MAX_UPLOAD_BYTES) {
            throw new Error(`« ${original.name} » est trop lourde même après compression.`);
          }
          const fd = new FormData();
          fd.append("file", file);
          /*
           * Le jeton de l'hôte accompagne l'envoi.
           *
           * L'action était réservée au cookie d'administration : un client
           * qui ajoutait une photo depuis son propre éditeur se voyait
           * refuser l'envoi, et lisait un message l'invitant à vérifier son
           * stockage Firebase — qui n'y était pour rien.
           *
           * Guidz garde son cookie ; le jeton, absent dans son cas, ne
           * change rien pour lui.
           */
          const jeton = await auth.currentUser?.getIdToken().catch(() => undefined);
          const url = await uploadAdminImageAction(fd, "livrets", jeton);
          uploaded.push(url);
        } catch (err) {
          console.error(err);
          // La cause réelle, quand on l'a : « vérifiez votre stockage » a
          // envoyé chercher le problème là où il n'était pas.
          setError(
            err instanceof Error && err.message
              ? err.message
              : "L’envoi de la photo a échoué. Réessayez, ou collez un lien d’image ci-dessous."
          );
        } finally {
          setUploading((n) => Math.max(0, n - 1));
        }
      }
      if (uploaded.length) add(uploaded);
    },
    [add]
  );

  /* Coller une image ou un lien depuis le presse-papiers. */
  const handlePaste = (e: React.ClipboardEvent) => {
    const files = Array.from(e.clipboardData.files || []);
    if (files.length) {
      e.preventDefault();
      void uploadFiles(files);
      return;
    }
    const text = e.clipboardData.getData("text");
    if (text && /^https?:\/\//i.test(text.trim())) {
      e.preventDefault();
      add([text]);
    }
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= photos.length) return;
    const next = [...photos];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const suggestions = query.trim()
    ? PHOTO_BANK.filter((p) =>
        p.tags.some((t) => t.includes(query.trim().toLowerCase())) ||
        query.trim().toLowerCase().split(/\s+/).some((w) => p.tags.some((t) => t.startsWith(w)))
      )
    : PHOTO_BANK;

  return (
    <div className="space-y-3" onPaste={allowUpload ? handlePaste : undefined}>
      {/* Zone de dépôt */}
      {allowUpload && (
      <div
        onClick={() => fileInput.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void uploadFiles(Array.from(e.dataTransfer.files || []));
        }}
        className={`relative w-full rounded-2xl border-2 border-dashed transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 py-10 px-6 text-center ${
          dragOver ? "border-[#C4714A] bg-[#C4714A]/5" : "border-gray-300 bg-[#FDF9F2] hover:border-gray-400"
        }`}
      >
        {uploading > 0 ? (
          <>
            <Spinner size={26} className="text-[#C4714A] animate-spin" />
            <span className="text-xs font-bold text-[#2A2016]">
              Envoi de {uploading} photo{uploading > 1 ? "s" : ""}…
            </span>
          </>
        ) : (
          <>
            <Eye size={26} className="text-[#6B5D4E]" />
            <span className="text-xs text-[#6B5D4E]">
              Cliquez, déposez ou collez — plusieurs photos d&apos;un coup
            </span>
          </>
        )}
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            void uploadFiles(Array.from(e.target.files || []));
            e.target.value = "";
          }}
        />
      </div>
      )}

      {error && (
        <p className="text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 flex items-start gap-2">
          <Warning size={14} weight="fill" className="shrink-0 mt-0.5" /> {error}
        </p>
      )}

      {/* Recherche dans la banque d'images */}
      <button
        type="button"
        onClick={() => {
          setSearchOpen((o) => !o);
          if (!query && city) setQuery("");
        }}
        className="w-full py-2.5 rounded-xl border border-gray-200 bg-white hover:border-[#C4714A] text-xs font-bold text-[#2A2016] flex items-center justify-center gap-2 transition-colors"
      >
        {searchOpen ? <X size={14} weight="bold" /> : <MagnifyingGlass size={14} weight="bold" />}
        {searchOpen ? "Fermer la recherche" : "Rechercher une photo"}
      </button>

      {searchOpen && (
        <div className="rounded-2xl border border-gray-200 bg-white p-3 space-y-3 animate-fadeIn">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Ex : plage, montagne, salon${city ? `, ${city}` : ""}…`}
            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#C4714A]"
          />
          {suggestions.length === 0 ? (
            <p className="text-[11px] text-[#6B5D4E] text-center py-4">
              Aucune photo pour « {query} ». Essayez « mer », « ville », « chambre »…
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto thin-scroll">
              {suggestions.map((p) => {
                const picked = photos.includes(p.url);
                return (
                  <button
                    key={p.url}
                    type="button"
                    onClick={() => (picked ? onChange(photos.filter((u) => u !== p.url)) : add([p.url]))}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      picked ? "border-[#C4714A]" : "border-transparent hover:border-gray-300"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                    {picked && (
                      <span className="absolute inset-0 bg-[#C4714A]/30 flex items-center justify-center">
                        <span className="w-6 h-6 rounded-full bg-[#C4714A] text-white flex items-center justify-center">
                          <Check size={13} weight="bold" />
                        </span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Ajout par URL */}
      <div className="flex gap-2">
        <input
          type="text"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add([urlInput]);
              setUrlInput("");
            }
          }}
          placeholder="Ou collez un lien d'image (https://...)"
          className="flex-1 px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#C4714A]"
        />
        <button
          type="button"
          onClick={() => {
            add([urlInput]);
            setUrlInput("");
          }}
          disabled={!urlInput.trim()}
          className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-[#C4714A] text-xs font-bold text-[#2A2016] flex items-center gap-1.5 disabled:opacity-40 transition-colors"
        >
          <Check size={14} weight="bold" /> Ajouter
        </button>
      </div>

      {/* Galerie */}
      {photos.length > 0 && (
        <div className="space-y-2 pt-1">
          {photos.map((url, idx) => (
            <div key={url + idx} className="flex items-center gap-2.5 p-2 rounded-2xl border border-gray-200 bg-white">
              <span className="relative w-16 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-full h-full object-cover" />
              </span>
              <span className="min-w-0 flex-1">
                {idx === 0 ? (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#C4714A] bg-[#C4714A]/10 px-2 py-0.5 rounded-full">
                    Couverture
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-[#7A5544]">Photo {idx + 1}</span>
                )}
                <span className="block text-[10px] text-[#A8998A] truncate mt-0.5">{url}</span>
              </span>
              <span className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => move(idx, idx - 1)}
                  disabled={idx === 0}
                  title="Vers la gauche"
                  className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-[#6B5D4E] disabled:opacity-30 hover:border-gray-300"
                >
                  <ArrowLeft size={12} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={() => move(idx, idx + 1)}
                  disabled={idx === photos.length - 1}
                  title="Vers la droite"
                  className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-[#6B5D4E] disabled:opacity-30 hover:border-gray-300"
                >
                  <ArrowRight size={12} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(photos.filter((_, i) => i !== idx))}
                  title="Retirer"
                  className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200"
                >
                  <Trash size={12} weight="bold" />
                </button>
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-[#6B5D4E] leading-relaxed">
        Sélectionnez ou déposez <strong>plusieurs photos d&apos;un coup</strong> : elles
        défileront en <strong>fondu</strong>
        {" "}
        derrière le titre. La 1re sert d&apos;aperçu (QR &amp; partage).
      </p>
    </div>
  );
}
