"use client";

import React, { useEffect, useRef, useState } from "react";
import { MagnifyingGlass, MapPin, Spinner, Warning, X } from "@phosphor-icons/react";
import { searchPlaces } from "@/app/admin/places";
import { PlaceResult, LatLon, describeDistance } from "@/lib/geo";

/*
 * Champ de recherche de lieu, adossé à OpenStreetMap.
 *
 * Déclaré au niveau du module : à l'intérieur du composant éditeur, React le
 * remonterait à chaque rendu et le curseur sauterait hors du champ à chaque
 * frappe — précisément le contraire de ce qu'on cherche ici.
 */

interface PlaceSearchProps {
  /** Texte du bouton / de l'invite. */
  placeholder?: string;
  /** Position du logement : biaise la recherche et permet le calcul de distance. */
  near?: LatLon;
  /** Appelé quand l'utilisateur retient un résultat. */
  onSelect: (place: PlaceResult, distance?: string) => void;
  /** Vidé après chaque sélection (ajout en série) ou conservé (champ unique). */
  clearOnSelect?: boolean;
  autoFocus?: boolean;
  /** Rappel « renseignez l'adresse du logement » — hors du champ d'adresse. */
  hintWhenNoOrigin?: boolean;
  /**
   * Neutralise la recherche.
   *
   * La démo publique n'a pas de session d'administration : laisser le champ
   * actif ferait répondre « accès non autorisé » au premier visiteur qui tape
   * une adresse.
   */
  disabled?: boolean;
  /** Ce qu'on affiche à la place, quand la recherche est neutralisée. */
  disabledHint?: string;
}

export default function PlaceSearch({
  placeholder = "Rechercher un lieu…",
  near,
  onSelect,
  clearOnSelect = true,
  autoFocus = false,
  hintWhenNoOrigin = false,
  disabled = false,
  disabledHint,
}: PlaceSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const requestIdRef = useRef(0);

  /*
   * Recherche différée de 600 ms après la dernière frappe : Nominatim tolère
   * une requête par seconde, et l'hôte n'a pas besoin d'un résultat par lettre.
   */
  const trimmed = query.trim();
  const canSearch = !disabled && trimmed.length >= 3;
  // On DÉRIVE ce qui est visible plutôt que de vider l'état dans l'effet :
  // un setState synchrone en corps d'effet déclenche un rendu en cascade.
  const visibleResults = canSearch ? results : [];
  const visibleError = canSearch ? error : null;

  // Les coordonnées sont dépliées en nombres : `near` est un objet recréé à
  // chaque rendu, le suivre relancerait une recherche en boucle.
  const nearLat = near?.lat;
  const nearLon = near?.lon;

  useEffect(() => {
    if (!canSearch) return;

    const requestId = ++requestIdRef.current;
    const timer = setTimeout(() => {
      setLoading(true);
      const point =
        typeof nearLat === "number" && typeof nearLon === "number"
          ? { lat: nearLat, lon: nearLon }
          : undefined;
      searchPlaces(trimmed, point)
        .then((found) => {
          // Une réponse tardive ne doit pas écraser une recherche plus récente.
          if (requestId !== requestIdRef.current) return;
          setResults(found);
          setError(found.length === 0 ? "Aucun lieu trouvé pour cette recherche." : null);
        })
        .catch((err: unknown) => {
          if (requestId !== requestIdRef.current) return;
          setResults([]);
          setError(err instanceof Error ? err.message : "Recherche indisponible.");
        })
        .finally(() => {
          if (requestId === requestIdRef.current) setLoading(false);
        });
    }, 600);

    return () => clearTimeout(timer);
  }, [trimmed, canSearch, nearLat, nearLon]);

  const handleSelect = (place: PlaceResult) => {
    const distance = near ? describeDistance(near, { lat: place.lat, lon: place.lon }) : undefined;
    onSelect(place, distance);
    setResults([]);
    setError(null);
    setTouched(false);
    setQuery(clearOnSelect ? "" : place.name);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <MagnifyingGlass
          size={15}
          weight="bold"
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8998A] pointer-events-none"
        />
        <input
          type="text"
          value={query}
          disabled={disabled}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setTouched(true);
          }}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white text-xs outline-none focus:border-[#C4714A] focus:ring-2 focus:ring-[#C4714A]/15 transition-colors disabled:bg-gray-50 disabled:text-[#A8998A] disabled:cursor-not-allowed"
        />
        {loading && (
          <Spinner size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#C4714A] animate-spin" />
        )}
        {!loading && query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setError(null);
            }}
            aria-label="Effacer la recherche"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A8998A] hover:text-[#2A2016] p-0.5"
          >
            <X size={13} weight="bold" />
          </button>
        )}
      </div>

      {visibleResults.length > 0 && (
        <ul className="rounded-xl border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100 max-h-64 overflow-y-auto thin-scroll">
          {visibleResults.map((place) => {
            const distance = near ? describeDistance(near, { lat: place.lat, lon: place.lon }) : null;
            return (
              <li key={place.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(place)}
                  className="w-full text-left px-3 py-2.5 hover:bg-[#FFF5F7] transition-colors flex items-start gap-2.5"
                >
                  <MapPin size={14} weight="fill" className="text-[#C4714A] shrink-0 mt-0.5" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-[#2A2016] truncate">{place.name}</span>
                    <span className="block text-[11px] text-[#6B5D4E] truncate">{place.address}</span>
                    <span className="flex items-center gap-1.5 mt-1">
                      <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#6B5D4E] bg-gray-100 px-1.5 py-0.5 rounded">
                        {place.category}
                      </span>
                      {distance && <span className="text-[10px] text-[#A8998A]">{distance}</span>}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {visibleError && touched && !loading && (
        <p className="text-[11px] text-[#6B5D4E] flex items-start gap-1.5">
          <Warning size={12} weight="fill" className="shrink-0 mt-0.5 text-amber-500" />
          {visibleError}
        </p>
      )}

      {disabled && disabledHint && (
        <p className="text-[11px] text-[#6B5D4E]">{disabledHint}</p>
      )}

      {!disabled && hintWhenNoOrigin && !near && (
        <p className="text-[11px] text-[#6B5D4E]">
          Renseignez l&apos;adresse du logement pour que les distances se calculent toutes seules.
        </p>
      )}
    </div>
  );
}
