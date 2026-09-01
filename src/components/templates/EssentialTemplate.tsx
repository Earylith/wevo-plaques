"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  List, X, WifiHigh, Key, DoorOpen, BookOpen, Phone, WarningCircle,
  MapPin, Car, Clock, Copy, Check, CaretDown, House, ChatCircleDots,
} from "@phosphor-icons/react";
import { Accommodation, ModuleId, isModuleVisible } from "@/lib/types/accommodation";
import { trackLivretOpen, trackModuleOpen } from "@/app/stats-actions";

/**
 * Gabarit de la formule Essentielle.
 *
 * Règle unique, et c'est tout l'objet de ce fichier : **on n'affiche que ce
 * que l'hôte peut modifier, et on affiche tout ce qu'il peut modifier.** Un
 * bloc figé qu'il subit et un champ qu'il remplit sans le voir sont deux
 * versions du même défaut.
 *
 * Les cinq rubriques et leurs intitulés reprennent ceux de la formule
 * Confort — Arrivée, Codes & Wi-Fi, Départ, Règlement, Contacts — pour qu'un
 * hôte qui change de formule retrouve ses repères.
 *
 * La mise en page suit la largeur du CONTENEUR (`@container`) et non celle de
 * la fenêtre : le même composant sert la page publiée et l'aperçu de
 * l'éditeur, qui ne fait que 350 px dans une fenêtre de 1500.
 */

/* ══════════════════════════════════════════════════════════════════════════
   PIÈCES COMMUNES
   ══════════════════════════════════════════════════════════════════════════ */

interface SectionProps {
  id: ModuleId;
  ancre: string;
  titre: string;
  sousTitre: string;
  Icone: React.ComponentType<{ size?: number; weight?: "regular" | "bold" | "fill" | "duotone"; className?: string }>;
  couleur: string;
  zone: Record<string, unknown>;
  children: React.ReactNode;
  /** Appelé quand le voyageur rouvre une rubrique qu'il avait repliée. */
  surOuverture?: () => void;
}

/**
 * Cartouche d'une rubrique.
 *
 * Repliable tant que le conteneur est étroit, toujours ouvert au-delà : la
 * bascule est en CSS, jamais en JavaScript sur la largeur de la fenêtre.
 */
function Rubrique({
  ancre,
  titre,
  sousTitre,
  Icone,
  couleur,
  zone,
  children,
  surOuverture,
}: SectionProps) {
  const [ouvert, setOuvert] = useState(true);

  return (
    <section
      id={ancre}
      {...zone}
      className={`bg-white rounded-3xl p-5 @2xl:p-7 shadow-sm border border-[#EDD9A3]/40 ${
        (zone.className as string) || ""
      }`}
    >
      <button
        type="button"
        onClick={(e) => {
          // Le repli ne doit pas déclencher l'ouverture du formulaire.
          e.stopPropagation();
          setOuvert((v) => {
            // Seule la RÉOUVERTURE compte : les rubriques sont déployées
            // d'emblée, et une mesure doit refléter un geste, pas un affichage.
            if (!v) surOuverture?.();
            return !v;
          });
        }}
        aria-expanded={ouvert}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <span className="flex items-center gap-3 min-w-0">
          <span
            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${couleur}18`, color: couleur }}
          >
            <Icone size={22} weight="duotone" />
          </span>
          <span className="min-w-0">
            <span
              className="block font-[family-name:var(--font-display)] font-bold text-[17px] @2xl:text-xl truncate"
              style={{ color: couleur }}
            >
              {titre}
            </span>
            <span className="block text-[11px] @2xl:text-xs text-[#6B5D4E] truncate">{sousTitre}</span>
          </span>
        </span>
        <CaretDown
          size={18}
          className={`shrink-0 text-[#A8998A] transition-transform @5xl:hidden ${ouvert ? "rotate-180" : ""}`}
        />
      </button>

      <div className={`mt-5 pt-5 border-t border-[#EDD9A3]/40 @5xl:block ${ouvert ? "block" : "hidden"}`}>
        {children}
      </div>
    </section>
  );
}

/** Ligne « intitulé → valeur », le motif de base de toutes les rubriques. */
function Ligne({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 border-b border-[#EDD9A3]/30 last:border-0">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B5D4E] shrink-0">
        {label}
      </span>
      <span className="text-sm text-[#2A2016] text-right min-w-0">{children}</span>
    </div>
  );
}

/** Paragraphe libre, qui respecte les retours à la ligne saisis par l'hôte. */
function Texte({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="py-2.5 border-b border-[#EDD9A3]/30 last:border-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B5D4E] mb-1.5">{label}</p>
      <p className="text-sm text-[#2A2016] leading-relaxed whitespace-pre-line">{valeur}</p>
    </div>
  );
}

/** Valeur à recopier — mot de passe, digicode : elle mérite un bouton. */
function ValeurCopiable({ label, valeur }: { label: string; valeur: string }) {
  const [copie, setCopie] = useState(false);

  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#FDFBF7] border border-[#EDD9A3]/40">
      <span className="text-xs text-[#6B5D4E] min-w-0 truncate">{label}</span>
      <span className="flex items-center gap-2 shrink-0">
        <span className="font-mono text-sm font-bold text-[#2A2016]">{valeur}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard?.writeText(valeur);
            setCopie(true);
            setTimeout(() => setCopie(false), 1800);
          }}
          aria-label={`Copier ${label}`}
          className="w-7 h-7 rounded-lg bg-white border border-[#EDD9A3] flex items-center justify-center text-[#6B5D4E] hover:text-[#C4714A] transition-colors"
        >
          {copie ? <Check size={13} weight="bold" className="text-emerald-600" /> : <Copy size={13} />}
        </button>
      </span>
    </div>
  );
}

const rempli = (v?: string) => Boolean(v && v.trim());

/* ══════════════════════════════════════════════════════════════════════════
   GABARIT
   ══════════════════════════════════════════════════════════════════════════ */

interface EssentialTemplateProps {
  data: Accommodation;
  /**
   * Ouvre la rubrique correspondante dans l'éditeur.
   *
   * Absent sur la page publiée : le voyageur n'a rien à modifier, et sans ce
   * rappel aucune zone ne devient cliquable.
   */
  onModuleClick?: (id: ModuleId) => void;
  /** Rubrique en cours d'édition, mise en évidence dans l'aperçu. */
  activeModule?: ModuleId;
  /**
   * Identifiant du livret, pour la mesure d'usage.
   *
   * Le comptage n'existait que dans le gabarit Confort : une page Essentielle
   * ne remontait donc AUCUNE consultation, et son tableau de bord restait
   * désespérément vide. L'hôte en concluait que personne ne lisait sa page.
   */
  trackingId?: string;
}

export default function EssentialTemplate({
  data,
  onModuleClick,
  activeModule,
  trackingId,
}: EssentialTemplateProps) {
  const [menuOuvert, setMenuOuvert] = useState(false);

  /*
   * Une seule remontée par visite, et jamais depuis l'éditeur : l'hôte qui
   * relit son livret n'est pas un voyageur. `onModuleClick` n'existe que côté
   * éditeur — sa présence suffit à reconnaître ce cas.
   */
  /**
   * Remontée d'une rubrique consultée, côté voyageur uniquement.
   *
   * Les rubriques sont déployées d'emblée : on ne compte donc pas un
   * affichage, mais le geste de rouvrir ce qu'on avait replié — le seul qui
   * désigne vraiment un contenu.
   */
  const compter = (id: ModuleId) =>
    trackingId && !onModuleClick
      ? () => void trackModuleOpen(trackingId, id)
      : undefined;

  const compte = useRef(false);
  useEffect(() => {
    if (!trackingId || onModuleClick || compte.current) return;
    compte.current = true;
    const viaQr = document.referrer === "" && window.location.search.includes("qr");
    void trackLivretOpen(trackingId, viaQr);
  }, [trackingId, onModuleClick]);

  const couleur = data.comfortOptions?.theme?.primaryColor || "#C4714A";

  /** Rend une zone cliquable côté éditeur, inerte côté voyageur. */
  const zone = (id: ModuleId): Record<string, unknown> =>
    onModuleClick
      ? {
          onClick: () => onModuleClick(id),
          role: "button",
          tabIndex: 0,
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onModuleClick(id);
            }
          },
          title: "Cliquez pour modifier cette rubrique",
          className: `cursor-pointer transition-shadow outline-none ${
            activeModule === id
              ? "ring-2 ring-offset-2 ring-[#C4714A]"
              : "hover:ring-2 hover:ring-offset-2 hover:ring-[#C4714A]/40"
          }`,
        }
      : {};

  const codes = (data.codes || []).filter((c) => rempli(c.label) || rempli(c.value));
  const regles = (data.rules || []).filter(rempli);
  const consignes = (data.practicalInfo?.departureInstructions || []).filter((i) => rempli(i.text));
  const contactsHote = (data.contacts || []).filter((c) => c.type !== "emergency" && rempli(c.phone));
  const urgences = (data.contacts || []).filter((c) => c.type === "emergency" && rempli(c.phone));

  /* Une rubrique masquée par l'hôte, ou entièrement vide, ne s'affiche pas. */
  const visible = (id: ModuleId, aDuContenu: boolean) => isModuleVisible(data, id) && aDuContenu;

  const montreArrivee = visible(
    "arrivee",
    rempli(data.practicalInfo?.checkin) ||
      rempli(data.practicalInfo?.arrivalNotes) ||
      rempli(data.property?.address) ||
      rempli(data.practicalInfo?.parking)
  );
  const montreWifi = visible("wifi", rempli(data.wifi?.ssid) || rempli(data.wifi?.password) || codes.length > 0);
  const montreDepart = visible(
    "depart",
    rempli(data.practicalInfo?.checkout) || rempli(data.practicalInfo?.departureNotes) || consignes.length > 0
  );
  const montreReglement = visible("reglement", regles.length > 0);
  const montreContacts = visible(
    "contacts",
    rempli(data.owner?.phone) || contactsHote.length > 0 || urgences.length > 0
  );

  const raccourcis = [
    { actif: montreArrivee, label: "Arrivée", href: "#arrivee", Icone: Key },
    { actif: montreWifi, label: "Wi-Fi", href: "#wifi", Icone: WifiHigh },
    { actif: montreDepart, label: "Départ", href: "#depart", Icone: DoorOpen },
    { actif: montreReglement, label: "Règlement", href: "#reglement", Icone: BookOpen },
    { actif: montreContacts, label: "Contacts", href: "#contacts", Icone: Phone },
  ].filter((r) => r.actif);

  return (
    <div className="@container min-h-screen bg-[#FDFBF7] font-[family-name:var(--font-sans)] text-[#2A2016] overflow-x-hidden">
      {/* ── En-tête ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#EDD9A3]/40">
        <div className="max-w-4xl mx-auto px-4 @2xl:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${couleur}18`, color: couleur }}
            >
              <House size={20} weight="duotone" />
            </span>
            <div className="min-w-0">
              <h1 className="font-[family-name:var(--font-display)] font-bold text-sm @2xl:text-base leading-tight uppercase tracking-widest truncate">
                {data.property?.name}
              </h1>
              <p className="text-[9px] @2xl:text-[10px] text-[#6B5D4E] uppercase tracking-wider truncate">
                {[data.property?.type, data.property?.city].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>

          {raccourcis.length > 0 && (
            <>
              <nav className="hidden @5xl:flex items-center gap-5">
                {raccourcis.map((r) => (
                  <a
                    key={r.href}
                    href={r.href}
                    className="text-xs font-semibold text-[#6B5D4E] hover:text-[#C4714A] transition-colors"
                  >
                    {r.label}
                  </a>
                ))}
              </nav>
              <button
                type="button"
                onClick={() => setMenuOuvert((v) => !v)}
                aria-label="Ouvrir le sommaire"
                className="@5xl:hidden p-2 text-[#6B5D4E]"
              >
                {menuOuvert ? <X size={20} /> : <List size={20} />}
              </button>
            </>
          )}
        </div>

        {menuOuvert && (
          <div className="@5xl:hidden border-t border-[#EDD9A3]/40 bg-white px-4 py-2">
            {raccourcis.map((r) => (
              <a
                key={r.href}
                href={r.href}
                onClick={() => setMenuOuvert(false)}
                className="flex items-center gap-3 py-3 border-b border-[#EDD9A3]/30 last:border-0 text-sm font-medium"
              >
                <r.Icone size={18} weight="duotone" style={{ color: couleur }} />
                {r.label}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* ── Accueil ── */}
      {/*
        Texte STANDARD, non modifiable : le mot d'accueil personnalisé relève
        de la formule Confort. Seul le nom du logement varie, et celui-là se
        saisit bien dans la rubrique Logement.
      */}
      <div className="px-4 @2xl:px-6 pt-8 @2xl:pt-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-[family-name:var(--font-display)] text-2xl @2xl:text-4xl font-bold leading-tight">
            Bienvenue à {data.property?.name}
          </h2>
          <p className="text-[#6B5D4E] text-sm @2xl:text-[15px] leading-relaxed mt-3 max-w-lg mx-auto">
            Vous trouverez ici toutes les informations utiles pour votre séjour.
          </p>
        </div>
      </div>

      {/* ── Accès rapides ── */}
      {raccourcis.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 @2xl:px-6 mt-8 @2xl:mt-12">
          <div className="grid grid-cols-3 @2xl:grid-cols-5 gap-2 @2xl:gap-3">
            {raccourcis.map((r) => (
              <a
                key={r.href}
                href={r.href}
                className="flex flex-col items-center justify-center gap-2 py-4 px-2 bg-white border border-[#EDD9A3]/40 rounded-2xl hover:border-[#C4714A]/50 hover:shadow-md transition-all text-center"
              >
                <r.Icone size={22} weight="duotone" style={{ color: couleur }} />
                <span className="text-[10px] @2xl:text-xs font-semibold">{r.label}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Rubriques ── */}
      <main className="max-w-4xl mx-auto px-4 @2xl:px-6 py-8 @2xl:py-12 space-y-5 @2xl:space-y-6">
        {montreArrivee && (
          <Rubrique
            id="arrivee"
            ancre="arrivee"
            surOuverture={compter("arrivee" as ModuleId)}
            titre="Arrivée"
            sousTitre="Horaire, accès et consignes d’arrivée"
            Icone={Key}
            couleur={couleur}
            zone={zone("arrivee")}
          >
            <div className="space-y-1">
              {rempli(data.practicalInfo?.checkin) && (
                <Ligne label="Arrivée">
                  <span className="font-bold">{data.practicalInfo.checkin}</span>
                </Ligne>
              )}
              {rempli(data.property?.address) && (
                <Ligne label="Adresse">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.property.address || "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 hover:underline"
                    style={{ color: couleur }}
                  >
                    <MapPin size={14} weight="fill" className="shrink-0" />
                    {data.property.address}
                  </a>
                </Ligne>
              )}
              {rempli(data.practicalInfo?.parking) && (
                <Ligne label="Stationnement">
                  <span className="inline-flex items-center gap-1.5">
                    <Car size={14} weight="duotone" className="shrink-0 text-[#6B5D4E]" />
                    {data.practicalInfo.parking}
                  </span>
                </Ligne>
              )}
              {rempli(data.practicalInfo?.arrivalNotes) && (
                <Texte label="Consignes d’arrivée" valeur={data.practicalInfo.arrivalNotes!} />
              )}
            </div>
          </Rubrique>
        )}

        {montreWifi && (
          <Rubrique
            id="wifi"
            ancre="wifi"
            surOuverture={compter("wifi" as ModuleId)}
            titre="Codes & Wi-Fi"
            sousTitre="Réseau, mot de passe et digicodes"
            Icone={WifiHigh}
            couleur={couleur}
            zone={zone("wifi")}
          >
            <div className="space-y-2.5">
              {rempli(data.wifi?.ssid) && <ValeurCopiable label="Réseau" valeur={data.wifi.ssid || ""} />}
              {rempli(data.wifi?.password) && (
                <ValeurCopiable label="Mot de passe" valeur={data.wifi.password || ""} />
              )}
              {codes.map((code, idx) => (
                <ValeurCopiable key={idx} label={code.label || "Code"} valeur={code.value || ""} />
              ))}
            </div>
          </Rubrique>
        )}

        {montreDepart && (
          <Rubrique
            id="depart"
            ancre="depart"
            surOuverture={compter("depart" as ModuleId)}
            titre="Départ"
            sousTitre="Horaire et check-list de fin de séjour"
            Icone={DoorOpen}
            couleur={couleur}
            zone={zone("depart")}
          >
            <div className="space-y-1">
              {rempli(data.practicalInfo?.checkout) && (
                <Ligne label="Départ">
                  <span className="font-bold">{data.practicalInfo.checkout}</span>
                </Ligne>
              )}
              {consignes.length > 0 && (
                <div className="py-2.5 border-b border-[#EDD9A3]/30 last:border-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B5D4E] mb-2">
                    Avant de partir
                  </p>
                  <ul className="space-y-2">
                    {consignes.map((etape, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm">
                        <span
                          className="mt-0.5 w-4 h-4 rounded-md border-2 shrink-0"
                          style={{ borderColor: couleur }}
                        />
                        <span>
                          {etape.text}
                          {etape.required && (
                            <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wider text-[#A35A38]">
                              obligatoire
                            </span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {rempli(data.practicalInfo?.departureNotes) && (
                <Texte label="Note complémentaire" valeur={data.practicalInfo.departureNotes!} />
              )}
            </div>
          </Rubrique>
        )}

        {montreReglement && (
          <Rubrique
            id="reglement"
            ancre="reglement"
            surOuverture={compter("reglement" as ModuleId)}
            titre="Règlement"
            sousTitre="Les règles de la maison"
            Icone={BookOpen}
            couleur={couleur}
            zone={zone("reglement")}
          >
            <ul className="space-y-2.5">
              {regles.map((regle, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm">
                  <Check size={15} weight="bold" className="mt-0.5 shrink-0" style={{ color: couleur }} />
                  <span>{regle}</span>
                </li>
              ))}
            </ul>
          </Rubrique>
        )}

        {montreContacts && (
          <Rubrique
            id="contacts"
            ancre="contacts"
            surOuverture={compter("contacts" as ModuleId)}
            titre="Contacts"
            sousTitre="Vos numéros, les secours et les urgences"
            Icone={Phone}
            couleur={couleur}
            zone={zone("contacts")}
          >
            <div className="space-y-4">
              {rempli(data.owner?.phone) && (
                <a
                  href={`tel:${data.owner.phone.replace(/\s+/g, "")}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border transition-colors"
                  style={{ backgroundColor: `${couleur}10`, borderColor: `${couleur}40` }}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <House size={20} weight="duotone" style={{ color: couleur }} className="shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-sm font-bold truncate">
                        {data.owner?.name || "Votre hôte"}
                      </span>
                      <span className="block text-[11px] text-[#6B5D4E]">{data.owner.phone}</span>
                    </span>
                  </span>
                  <span
                    className="px-3.5 py-2 rounded-full text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: couleur }}
                  >
                    Appeler
                  </span>
                </a>
              )}

              {contactsHote.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#6B5D4E]">
                    Autres contacts utiles
                  </p>
                  {contactsHote.map((contact, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-[#FDFBF7] border border-[#EDD9A3]/40"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold truncate">{contact.label}</span>
                        <span className="block text-[11px] text-[#6B5D4E]">{contact.phone}</span>
                      </span>
                      <span className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={`tel:${contact.phone.replace(/\s+/g, "")}`}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Appeler ${contact.label}`}
                          className="w-8 h-8 rounded-lg bg-white border border-[#EDD9A3] flex items-center justify-center text-[#6B5D4E] hover:text-[#C4714A] transition-colors"
                        >
                          <Phone size={14} weight="bold" />
                        </a>
                        <a
                          href={`sms:${contact.phone.replace(/\s+/g, "")}`}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`Écrire à ${contact.label}`}
                          className="w-8 h-8 rounded-lg bg-white border border-[#EDD9A3] flex items-center justify-center text-[#6B5D4E] hover:text-[#C4714A] transition-colors"
                        >
                          <ChatCircleDots size={14} weight="bold" />
                        </a>
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {urgences.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-red-700 flex items-center gap-1.5">
                    <WarningCircle size={13} weight="fill" />
                    Urgences & santé
                  </p>
                  <div className="grid grid-cols-2 @2xl:grid-cols-4 gap-2">
                    {urgences.map((secours, idx) => (
                      <a
                        key={idx}
                        href={`tel:${secours.phone.replace(/\s+/g, "")}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex flex-col items-center p-3 rounded-2xl bg-red-50 border border-red-100 text-center"
                      >
                        <span className="text-[9px] font-bold uppercase tracking-wider text-red-700 mb-1 truncate max-w-full">
                          {secours.label}
                        </span>
                        <span className="text-base font-bold text-red-600">{secours.phone}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Rubrique>
        )}
      </main>

      <footer className="border-t border-[#EDD9A3]/40 py-8 text-center">
        <p className="text-sm font-medium text-[#6B5D4E] flex items-center justify-center gap-1.5">
          <Clock size={14} weight="duotone" />
          Bon séjour à {data.property?.name} !
        </p>
      </footer>
    </div>
  );
}
