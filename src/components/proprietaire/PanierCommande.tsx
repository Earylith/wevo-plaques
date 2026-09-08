"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  X, ShoppingCart, Plus, Trash, PencilSimple, Check, ArrowRight,
  ShieldCheck, Package, Sparkle, Info, CaretDown,
} from "@phosphor-icons/react";
import {
  LivretResume,
  creerNouveauLivret,
  supprimerLivretBrouillon,
  modifierPlaqueBrouillon,
} from "@/app/espace-actions";
import { changerFormuleBrouillon } from "@/app/creation-actions";
import { ouvrirPaiementPanier } from "@/app/paiement-actions";
import { RythmeAbonnement } from "@/lib/stripe";
import { OfferType } from "@/lib/types/accommodation";
import { TAGLINE_PAR_DEFAUT, TAGLINE_MAX } from "@/lib/plaque";

interface PanierCommandeProps {
  ouvert: boolean;
  onFermer: () => void;
  livrets: LivretResume[];
  onLivretsChange: () => Promise<void>;
  jetonHote: () => Promise<string | undefined>;
  notificationMessage?: string | null;
}

export default function PanierCommande({
  ouvert,
  onFermer,
  livrets,
  onLivretsChange,
  jetonHote,
  notificationMessage,
}: PanierCommandeProps) {
  // Fermeture facile via la touche Échap et verrouillage du défilement arrière-plan
  useEffect(() => {
    if (!ouvert) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onFermer();
    };
    window.addEventListener("keydown", handleKeyDown);
    const scrollOrigine = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = scrollOrigine;
    };
  }, [ouvert, onFermer]);

  // Liste des livrets encore en brouillon (commandables)
  const brouillons = livrets.filter((l) => !l.enLigne);

  // État des IDs sélectionnés dans le panier (par défaut tous les brouillons)
  const [idsSelectionnes, setIdsSelectionnes] = useState<string[]>(() =>
    brouillons.map((b) => b.id)
  );

  // Rythme de facturation pour les livrets Confort
  const [rythme, setRythme] = useState<RythmeAbonnement>("mensuel");

  // Formulaire d'ajout rapide d'un livret dans le panier
  const [afficheAjout, setAfficheAjout] = useState(false);
  const [nomNouveau, setNomNouveau] = useState("");
  const [formuleNouveau, setFormuleNouveau] = useState<OfferType>("comfort");
  const [ajoutEnCours, setAjoutEnCours] = useState(false);
  const [erreurAjout, setErreurAjout] = useState<string | null>(null);

  // Édition de la phrase gravée d'une plaque Confort
  const [idEditionPlaque, setIdEditionPlaque] = useState<string | null>(null);
  const [phraseTemp, setPhraseTemp] = useState("");

  // État de paiement
  const [paiementEnCours, setPaiementEnCours] = useState(false);
  const [erreurPaiement, setErreurPaiement] = useState<string | null>(null);

  // État d'action locale
  const [actionEnCoursId, setActionEnCoursId] = useState<string | null>(null);

  // État des inclusions : pliées de base sur tous les écrans (PC et mobile) pour éviter l'effet pâté, dépliables en 1 clic
  const [detailsOuvertsIds, setDetailsOuvertsIds] = useState<string[]>([]);

  const toggleDetails = (id: string) => {
    setDetailsOuvertsIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  if (!ouvert) return null;

  // Filtrer les brouillons sélectionnés pour la commande
  const articlesAuPanier = brouillons.filter((b) => idsSelectionnes.includes(b.id));

  // Calculs financiers
  const nbConfort = articlesAuPanier.filter((b) => b.formule === "comfort").length;
  const nbEssentiel = articlesAuPanier.filter((b) => b.formule !== "comfort").length;
  const totalLivrets = articlesAuPanier.length;

  const totalPonctuelEssentiel = nbEssentiel * 49;
  const totalPonctuelConfort = nbConfort * 69;
  const sousTotalFabrication = totalPonctuelEssentiel + totalPonctuelConfort;
  const prixAbonnementUnitaire = rythme === "annuel" ? 19 : 1.99;
  const totalAbonnement = nbConfort * prixAbonnementUnitaire;
  const totalImmediat = sousTotalFabrication + (nbConfort > 0 ? totalAbonnement : 0);

  const toggleSelection = (id: string) => {
    setIdsSelectionnes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toutSelectionner = () => {
    setIdsSelectionnes(brouillons.map((b) => b.id));
  };

  const toutDeselectionner = () => {
    setIdsSelectionnes([]);
  };

  const handleChangerFormule = async (id: string, nouvelleFormule: OfferType) => {
    setActionEnCoursId(id);
    try {
      const jeton = await jetonHote();
      await changerFormuleBrouillon(id, nouvelleFormule, jeton);
      await onLivretsChange();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Erreur lors du changement de formule.");
    } finally {
      setActionEnCoursId(null);
    }
  };

  const handleSupprimerBrouillon = async (id: string, nom: string) => {
    if (!confirm(`Voulez-vous retirer définitivement le livret « ${nom} » ?`)) return;
    setActionEnCoursId(id);
    try {
      const jeton = await jetonHote();
      if (!jeton) return;
      await supprimerLivretBrouillon(id, jeton);
      setIdsSelectionnes((prev) => prev.filter((i) => i !== id));
      await onLivretsChange();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Impossible de retirer ce livret.");
    } finally {
      setActionEnCoursId(null);
    }
  };

  const handleEnregistrerPhrasePlaque = async (id: string) => {
    setActionEnCoursId(id);
    try {
      const jeton = await jetonHote();
      if (!jeton) return;
      await modifierPlaqueBrouillon(id, "noyer", phraseTemp.trim(), jeton);
      setIdEditionPlaque(null);
      await onLivretsChange();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement de la phrase gravée.");
    } finally {
      setActionEnCoursId(null);
    }
  };

  const handleAjouterNouveauLivret = async (e: React.FormEvent) => {
    e.preventDefault();
    const nom = nomNouveau.trim();
    if (!nom) {
      setErreurAjout("Veuillez indiquer le nom de votre logement.");
      return;
    }
    setAjoutEnCours(true);
    setErreurAjout(null);
    try {
      const jeton = await jetonHote();
      if (!jeton) throw new Error("Veuillez vous reconnecter.");
      const nouveau = await creerNouveauLivret(jeton, nom, formuleNouveau);
      setNomNouveau("");
      setAfficheAjout(false);
      setIdsSelectionnes((prev) => [...prev, nouveau.id]);
      await onLivretsChange();
    } catch (err) {
      console.error(err);
      setErreurAjout(err instanceof Error ? err.message : "La création a échoué.");
    } finally {
      setAjoutEnCours(false);
    }
  };

  const handlePayerPanier = async () => {
    if (articlesAuPanier.length === 0) {
      setErreurPaiement("Veuillez cocher au moins un livret à commander.");
      return;
    }
    setPaiementEnCours(true);
    setErreurPaiement(null);
    try {
      const jeton = await jetonHote();
      if (!jeton) throw new Error("Veuillez vous reconnecter pour poursuivre.");
      const ids = articlesAuPanier.map((a) => a.id);
      const { url } = await ouvrirPaiementPanier(ids, window.location.origin, jeton, rythme);
      window.location.assign(url);
    } catch (err) {
      console.error(err);
      setErreurPaiement(
        err instanceof Error ? err.message : "Le paiement du panier n’a pas pu être ouvert."
      );
      setPaiementEnCours(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-6 overflow-hidden animate-in fade-in duration-200">
      {/* Arrière-plan sombre avec effet de flou, clic n'importe où pour fermer */}
      <div
        onClick={onFermer}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
        title="Cliquer pour fermer le panier"
      />

      {/* Boîte Modale Mobile-First : Plein écran sur mobile, modale élégante sur PC */}
      <div className="relative w-full h-full sm:h-auto sm:max-h-[92vh] max-w-5xl xl:max-w-6xl bg-[#FAF7F2] rounded-none sm:rounded-[32px] shadow-2xl border-0 sm:border sm:border-black/[0.08] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 z-10">
        {/* ── En-tête de la modale Mobile-First ────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-8 sm:py-5 border-b border-black/[0.07] bg-white shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-[#C4714A]/10 text-[#C4714A]">
              <ShoppingCart size={19} weight="duotone" className="sm:hidden" />
              <ShoppingCart size={22} weight="duotone" className="hidden sm:block" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-[family-name:var(--font-display)] text-[17px] sm:text-2xl font-bold text-[#2A2016] truncate">
                  Mon panier
                </h2>
                <span className="shrink-0 rounded-full bg-[#C4714A] px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold text-white shadow-2xs">
                  {totalLivrets} {totalLivrets > 1 ? "sélectionnés" : "sélectionné"}
                </span>
              </div>
              <p className="hidden sm:block text-[12.5px] text-[#6B5D4E] mt-0.5 truncate">
                Plaques artisanales en noyer & activation de vos livrets d’accueil numériques
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onFermer}
            className="flex items-center justify-center h-8 w-8 sm:h-auto sm:w-auto sm:gap-1.5 rounded-full border border-black/[0.1] bg-[#F6F3ED] hover:bg-black/[0.06] sm:px-4 sm:py-2 text-[12.5px] font-semibold text-[#2A2016] transition-colors cursor-pointer shadow-2xs"
            title="Fermer le panier (Échap)"
          >
            <span className="hidden sm:inline">Fermer</span>
            <X size={15} weight="bold" />
          </button>
        </div>

        {/* ── Notification éventuelle ──────────────────────────────────── */}
        {notificationMessage && (
          <div className="bg-emerald-50 border-b border-emerald-100 px-6 sm:px-8 py-2.5 flex items-center gap-2 text-[12.5px] font-medium text-emerald-800 shrink-0 animate-in fade-in">
            <Check size={16} weight="bold" className="text-emerald-600 shrink-0" />
            <span>{notificationMessage}</span>
          </div>
        )}

        {/* ── Corps défilant de la modale ──────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 pb-24 sm:pb-6 lg:pb-8">
          {brouillons.length === 0 ? (
            /* Si aucun brouillon n'existe */
            <div className="rounded-3xl border border-black/[0.06] bg-white p-10 text-center max-w-lg mx-auto my-8 shadow-xs">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F6F3ED] text-[#C4714A]">
                <Package size={28} weight="duotone" />
              </div>
              <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-[#2A2016]">
                Votre panier est actuellement vide
              </h3>
              <p className="mt-2 text-[14px] text-[#6B5D4E] leading-relaxed">
                Tous vos hébergements sont déjà en ligne avec leur plaque commandée. Vous pouvez ajouter un nouveau logement ci-dessous pour commander une plaque supplémentaire.
              </p>
              <button
                type="button"
                onClick={() => setAfficheAjout(true)}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2A2016] px-6 py-3 text-[13.5px] font-semibold text-white hover:bg-[#C4714A] transition-colors cursor-pointer shadow-xs"
              >
                <Plus size={16} weight="bold" />
                <span>Ajouter un hébergement au panier</span>
              </button>
            </div>
          ) : (
            /* Grille responsive 2 colonnes spacieuse */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* ── COLONNE GAUCHE (7 / 12) : Liste des hébergements ── */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-5">
                {/* Bandeau d'information (masqué sur mobile pour laisser voir les hébergements directement) */}
                <div className="hidden sm:flex rounded-2xl border border-[#EDD9A3]/70 bg-[#FFFBF4] p-4 text-[13px] text-[#5C3D2E] leading-relaxed items-start gap-3 shadow-2xs">
                  <Info size={20} weight="duotone" className="shrink-0 text-[#C4714A] mt-0.5" />
                  <div>
                    <strong className="block text-[#2A2016] font-semibold mb-0.5">
                      Commandez plusieurs plaques et livrets en une seule fois
                    </strong>
                    Cochez les hébergements à valider. Chaque livret comprend sa{" "}
                    <strong>plaque artisanale en noyer (25 × 22 cm) avec QR code permanent</strong> gravé dans notre atelier, expédiée gratuitement à votre adresse.
                  </div>
                </div>

                {/* Barre de contrôle de la liste Mobile-First */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-[#A8998A]">
                      Vos hébergements ({brouillons.length})
                    </span>
                    {brouillons.length > 1 && (
                      <span className="text-[11px] sm:text-[12px] font-semibold text-[#C4714A]">
                        • {articlesAuPanier.length} sélectionné{articlesAuPanier.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 sm:gap-3">
                    {brouillons.length > 1 && (
                      <button
                        type="button"
                        onClick={
                          idsSelectionnes.length === brouillons.length
                            ? toutDeselectionner
                            : toutSelectionner
                        }
                        className="text-[11.5px] sm:text-[12px] font-semibold text-[#6B5D4E] hover:text-[#2A2016] underline cursor-pointer"
                      >
                        {idsSelectionnes.length === brouillons.length
                          ? "Tout désélectionner"
                          : "Tout sélectionner"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setAfficheAjout(true)}
                      className="inline-flex items-center gap-1 text-[11.5px] sm:text-[12.5px] font-bold text-[#C4714A] hover:text-[#A35A38] transition-colors cursor-pointer"
                    >
                      <Plus size={13} weight="bold" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                </div>

                {/* Liste des cartes d'hébergements */}
                <div className="space-y-3.5 sm:space-y-4">
                  {brouillons.map((item) => {
                    const estCoche = idsSelectionnes.includes(item.id);
                    const estConfort = item.formule === "comfort";
                    const estEnCours = actionEnCoursId === item.id;
                    const modeEditionPlaque = idEditionPlaque === item.id;
                    const estDetailsOuvert = detailsOuvertsIds.includes(item.id);

                    // Si Confort : phrase de l'éditeur ou phrase standard par défaut
                    const phraseAffichee = item.plaqueTagline?.trim() || TAGLINE_PAR_DEFAUT;
                    const estPhraseParDefaut = !item.plaqueTagline?.trim();

                    return (
                      <div
                        key={item.id}
                        className={`group relative rounded-2xl sm:rounded-3xl border transition-all duration-200 bg-white p-4 sm:p-6 shadow-xs ${
                          estCoche
                            ? "border-[#C4714A]/40 ring-2 ring-[#C4714A]/10"
                            : "border-black/[0.07] opacity-65 hover:opacity-90"
                        }`}
                      >
                        {/* Barre du haut : case à cocher sur-mesure + nom + actions */}
                        <div className="flex items-start gap-3 sm:gap-3.5">
                          {/* Case à cocher sur-mesure Guidz (remplace la case bleue hideuse du navigateur) */}
                          <button
                            type="button"
                            role="checkbox"
                            aria-checked={estCoche}
                            onClick={() => toggleSelection(item.id)}
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all cursor-pointer mt-0.5 ${
                              estCoche
                                ? "border-[#C4714A] bg-[#C4714A] text-white shadow-2xs"
                                : "border-[#D6CCC2] bg-white hover:border-[#C4714A]"
                            }`}
                            title={estCoche ? "Désélectionner cet hébergement" : "Sélectionner cet hébergement"}
                          >
                            {estCoche && <Check size={14} weight="bold" className="text-white" />}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                                <h4
                                  onClick={() => toggleSelection(item.id)}
                                  className="font-[family-name:var(--font-display)] text-[16px] sm:text-[18px] font-bold text-[#2A2016] truncate cursor-pointer hover:text-[#C4714A] transition-colors"
                                >
                                  {item.nom}
                                </h4>
                                {estConfort ? (
                                  <span className="shrink-0 rounded-full bg-[#C4714A]/10 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[10.5px] font-bold text-[#C4714A]">
                                    Confort
                                  </span>
                                ) : (
                                  <span className="shrink-0 rounded-full bg-gray-100 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[10.5px] font-bold text-gray-700">
                                    Essentielle
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                <Link
                                  href={`/proprietaire/dashboard/${item.id}/edit`}
                                  className="inline-flex items-center gap-1 rounded-lg px-2 sm:px-2.5 py-1 text-[11.5px] sm:text-[12px] font-semibold text-[#6B5D4E] hover:bg-[#F6F3ED] hover:text-[#2A2016] transition-colors"
                                  title="Personnaliser dans l'éditeur"
                                >
                                  <PencilSimple size={13} weight="bold" />
                                  <span className="hidden sm:inline">Éditer</span>
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleSupprimerBrouillon(item.id, item.nom)}
                                  disabled={estEnCours}
                                  className="inline-flex items-center justify-center h-7 w-7 sm:h-8 sm:w-8 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                                  title="Retirer ce livret du panier"
                                >
                                  <Trash size={14} weight="bold" />
                                </button>
                              </div>
                            </div>

                            {item.ville && (
                              <p className="text-[12px] sm:text-[12.5px] text-[#A8998A] mt-0.5">{item.ville}</p>
                            )}

                            {/* ── Sélecteur de formule clarifié ── */}
                            <div className="mt-4 space-y-1.5">
                              <div className="flex items-center justify-between text-[11.5px]">
                                <span className="font-bold uppercase tracking-wider text-[#A8998A]">
                                  Formule choisie
                                </span>
                                <span className="font-medium">
                                  {estConfort ? (
                                    <span className="text-[#C4714A] flex items-center gap-1">
                                      <Sparkle size={12} weight="fill" />
                                      Modifiable 24/7 & 5 langues
                                    </span>
                                  ) : (
                                    <span className="text-[#6B5D4E]">Achat 1× sans abonnement</span>
                                  )}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#F6F3ED] p-1.5 text-[12px]">
                                <button
                                  type="button"
                                  disabled={estEnCours}
                                  onClick={() => handleChangerFormule(item.id, "essential")}
                                  className={`rounded-xl px-3.5 py-2.5 text-center transition-all cursor-pointer ${
                                    !estConfort
                                      ? "bg-white text-[#2A2016] font-bold shadow-xs ring-1 ring-black/5"
                                      : "text-[#6B5D4E] hover:text-[#2A2016] hover:bg-white/40"
                                  }`}
                                >
                                  <div className="flex items-center justify-center gap-1.5">
                                    {!estConfort && (
                                      <Check size={13} weight="bold" className="text-[#2A2016]" />
                                    )}
                                    <span className="font-semibold text-[13px]">Essentielle</span>
                                  </div>
                                  <span className="mt-0.5 block text-[11px] font-normal text-[#8C7E72]">
                                    49 € en 1 fois
                                  </span>
                                </button>

                                <button
                                  type="button"
                                  disabled={estEnCours}
                                  onClick={() => handleChangerFormule(item.id, "comfort")}
                                  className={`rounded-xl px-3.5 py-2.5 text-center transition-all cursor-pointer ${
                                    estConfort
                                      ? "bg-[#C4714A] text-white font-bold shadow-xs"
                                      : "text-[#6B5D4E] hover:text-[#2A2016] hover:bg-white/40"
                                  }`}
                                >
                                  <div className="flex items-center justify-center gap-1.5">
                                    <Sparkle
                                      size={13}
                                      weight="fill"
                                      className={estConfort ? "text-amber-200" : "text-[#C4714A]"}
                                    />
                                    <span className="font-semibold text-[13px]">Confort</span>
                                  </div>
                                  <span
                                    className={`mt-0.5 block text-[11px] font-normal ${
                                      estConfort ? "text-white/85" : "text-[#8C7E72]"
                                    }`}
                                  >
                                    69 € + abonnement
                                  </span>
                                </button>
                              </div>
                            </div>

                            {/* ── Détails & prestation inclus de ce livret ── */}
                            <div className="mt-3.5 rounded-2xl bg-[#FAF7F2] p-4 text-[12.5px] text-[#6B5D4E] space-y-2.5 border border-black/[0.05]">
                              {/* Ligne 1 : Plaque physique noyer & formule */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C4714A]/10 text-[#C4714A]">
                                    <Package size={15} weight="duotone" />
                                  </div>
                                  <div>
                                    <span className="font-semibold text-[#2A2016] text-[13px]">
                                      {estConfort
                                        ? "Plaque en noyer & formule Confort"
                                        : "Plaque en noyer & formule Essentielle"}
                                    </span>
                                    <span className="text-[11.5px] text-[#8C7E72] block">
                                      25 × 22 cm • QR code permanent gravé dans le bois
                                    </span>
                                  </div>
                                </div>
                                <span className="font-bold text-[#2A2016] text-[13.5px]">
                                  {estConfort ? "69,00 €" : "49,00 €"}
                                </span>
                              </div>

                              {/* Ligne 2 : Phrase gravée — UNIQUEMENT si formule Confort */}
                              {estConfort && (
                                <div className="pt-2.5 border-t border-black/[0.05]">
                                  {modeEditionPlaque ? (
                                    <div className="space-y-2 py-1">
                                      <label className="block text-[11.5px] font-bold text-[#2A2016]">
                                        Personnaliser la phrase gravée au bas de la plaque :
                                      </label>
                                      <input
                                        type="text"
                                        maxLength={TAGLINE_MAX}
                                        value={phraseTemp}
                                        onChange={(e) => setPhraseTemp(e.target.value)}
                                        className="w-full rounded-xl border border-black/[0.18] bg-white px-3 py-2 text-[13px] text-[#2A2016] placeholder-[#A8998A] outline-none focus:border-[#C4714A] focus:ring-1 focus:ring-[#C4714A]"
                                        placeholder={TAGLINE_PAR_DEFAUT}
                                        autoFocus
                                      />
                                      <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-[10.5px] text-[#8C7E72]">
                                          {phraseTemp.length}/{TAGLINE_MAX} car. (laisser vide = phrase standard)
                                        </span>
                                        <div className="flex items-center gap-1.5">
                                          <button
                                            type="button"
                                            onClick={() => setIdEditionPlaque(null)}
                                            className="rounded-lg px-2.5 py-1 text-[11px] font-medium text-[#6B5D4E] hover:bg-black/[0.05] cursor-pointer"
                                          >
                                            Annuler
                                          </button>
                                          <button
                                            type="button"
                                            disabled={estEnCours}
                                            onClick={() => handleEnregistrerPhrasePlaque(item.id)}
                                            className="rounded-lg bg-[#2A2016] px-3.5 py-1 text-[11px] font-bold text-white hover:bg-[#C4714A] transition-colors cursor-pointer"
                                          >
                                            Enregistrer
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="min-w-0 flex-1">
                                        <span className="text-[11.5px] font-medium text-[#8C7E72] block">
                                          Phrase gravée personnalisée :
                                        </span>
                                        <div className="mt-0.5 flex flex-wrap items-baseline gap-2">
                                          <span className="font-serif italic text-[13px] text-[#3D2E24] font-medium">
                                            « {phraseAffichee} »
                                          </span>
                                          {estPhraseParDefaut && (
                                            <span className="rounded-md bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 text-[10px] font-semibold text-amber-800">
                                              Phrase standard
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setIdEditionPlaque(item.id);
                                          setPhraseTemp(item.plaqueTagline?.trim() || "");
                                        }}
                                        className="shrink-0 text-[11.5px] font-semibold text-[#C4714A] hover:underline cursor-pointer pt-0.5"
                                      >
                                        Modifier
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Ligne 3 : Prestation livret numérique */}
                              <div className="flex items-center justify-between text-[12px] pt-2.5 border-t border-black/[0.05]">
                                {estConfort ? (
                                  <>
                                    <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                                      <Sparkle
                                        size={14}
                                        weight="fill"
                                        className="text-[#C4714A] shrink-0"
                                      />
                                      <span>Abonnement Confort (expérience complète)</span>
                                    </div>
                                    <span className="font-bold text-emerald-700">
                                      {rythme === "annuel"
                                        ? "+ 19 € / an"
                                        : "+ 1,99 € / mois"}
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-1.5 text-[#6B5D4E]">
                                      <Check
                                        size={14}
                                        weight="bold"
                                        className="text-emerald-600 shrink-0"
                                      />
                                      <span>Livret d'accueil en ligne (sans abonnement)</span>
                                    </div>
                                    <span className="font-semibold text-emerald-700">Inclus</span>
                                  </>
                                )}
                              </div>

                              {/* Bouton accordéon pour déplier/replier les avantages (déplié sur PC, replié sur mobile) */}
                              <button
                                type="button"
                                onClick={() => toggleDetails(item.id)}
                                className="mt-2.5 w-full flex items-center justify-between rounded-xl bg-[#F8F5F0] hover:bg-[#F2ECE2] px-3 py-2 text-[11.5px] font-semibold text-[#5C4D3E] border border-[#EBE3D7] transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {estConfort ? (
                                    <Sparkle size={13} weight="fill" className="text-[#C4714A] shrink-0" />
                                  ) : (
                                    <Check size={13} weight="bold" className="text-emerald-600 shrink-0" />
                                  )}
                                  <span className="truncate">
                                    {estConfort
                                      ? "Avantages formule Confort (6 inclus)"
                                      : "Inclus dans l’Essentielle (4 piliers)"}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-[11px] text-[#8C7E72] shrink-0">
                                  <span className="hidden sm:inline">{estDetailsOuvert ? "Masquer" : "Voir le détail"}</span>
                                  <CaretDown
                                    size={13}
                                    weight="bold"
                                    className={`transition-transform duration-200 ${estDetailsOuvert ? "rotate-180" : ""}`}
                                  />
                                </div>
                              </button>

                              {/* Contenu déroulant de l'accordéon */}
                              {estDetailsOuvert && (
                                <div className="mt-1.5 rounded-xl bg-[#F8F5F0] p-3 border border-[#EBE3D7] text-[11px] animate-in fade-in-50 duration-150">
                                  {estConfort ? (
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 text-[#5C4D3E]">
                                      <li className="flex items-center gap-1.5">
                                        <Check size={12} weight="bold" className="text-emerald-600 shrink-0" />
                                        <span><strong>Modifications illimitées 24/7</strong> (WiFi, accès, photos)</span>
                                      </li>
                                      <li className="flex items-center gap-1.5">
                                        <Check size={12} weight="bold" className="text-emerald-600 shrink-0" />
                                        <span><strong>Traduction en 5 langues</strong> (FR, EN, ES, IT, DE)</span>
                                      </li>
                                      <li className="flex items-center gap-1.5">
                                        <Check size={12} weight="bold" className="text-emerald-600 shrink-0" />
                                        <span><strong>Phrase gravée personnalisée</strong> sur la plaque</span>
                                      </li>
                                      <li className="flex items-center gap-1.5">
                                        <Check size={12} weight="bold" className="text-emerald-600 shrink-0" />
                                        <span><strong>Notices équipements pas-à-pas</strong> & vidéos</span>
                                      </li>
                                      <li className="flex items-center gap-1.5">
                                        <Check size={12} weight="bold" className="text-emerald-600 shrink-0" />
                                        <span><strong>Recommandations locales</strong> & carte interactive</span>
                                      </li>
                                      <li className="flex items-center gap-1.5">
                                        <Check size={12} weight="bold" className="text-emerald-600 shrink-0" />
                                        <span><strong>FAQ voyageur, livre d'or</strong> & météo</span>
                                      </li>
                                    </ul>
                                  ) : (
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1.5 text-[#5C4D3E]">
                                      <li className="flex items-center gap-1.5">
                                        <Check size={12} weight="bold" className="text-emerald-600 shrink-0" />
                                        <span><strong>Arrivée</strong> (horaires, accès & remise des clés)</span>
                                      </li>
                                      <li className="flex items-center gap-1.5">
                                        <Check size={12} weight="bold" className="text-emerald-600 shrink-0" />
                                        <span><strong>Départ</strong> (horaires & consignes de départ)</span>
                                      </li>
                                      <li className="flex items-center gap-1.5">
                                        <Check size={12} weight="bold" className="text-emerald-600 shrink-0" />
                                        <span><strong>Règles du logement</strong> & consignes intérieures</span>
                                      </li>
                                      <li className="flex items-center gap-1.5">
                                        <Check size={12} weight="bold" className="text-emerald-600 shrink-0" />
                                        <span><strong>Contacts</strong> (hôte, urgences & assistance)</span>
                                      </li>
                                    </ul>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Formulaire pour ajouter un autre livret en direct ─────── */}
                {afficheAjout ? (
                  <form
                    onSubmit={handleAjouterNouveauLivret}
                    className="rounded-3xl border-2 border-dashed border-[#C4714A]/40 bg-white p-5 sm:p-6 space-y-4 animate-in fade-in"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[#2A2016] text-[15px] flex items-center gap-2">
                        <Plus size={16} weight="bold" className="text-[#C4714A]" />
                        Ajouter un nouveau livret au panier
                      </h4>
                      <button
                        type="button"
                        onClick={() => setAfficheAjout(false)}
                        className="text-gray-400 hover:text-black cursor-pointer text-xs"
                      >
                        Fermer
                      </button>
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-[#6B5D4E] mb-1">
                        Nom de votre hébergement
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex : Chalet les Marmottes, Villa Sud…"
                        value={nomNouveau}
                        onChange={(e) => setNomNouveau(e.target.value)}
                        className="w-full rounded-xl border border-black/[0.12] bg-[#FAF7F2] px-3.5 py-2.5 text-[14px] text-[#2A2016] outline-none focus:border-[#C4714A] focus:bg-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-[#6B5D4E] mb-1.5">
                        Choisissez sa formule :
                      </label>
                      <div className="grid grid-cols-2 gap-2.5">
                        <button
                          type="button"
                          onClick={() => setFormuleNouveau("comfort")}
                          className={`rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                            formuleNouveau === "comfort"
                              ? "border-[#C4714A] bg-[#C4714A]/5 ring-1 ring-[#C4714A]"
                              : "border-black/[0.08] hover:border-black/20"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[12.5px] font-bold text-[#2A2016]">Confort</span>
                            <Sparkle size={13} weight="fill" className="text-[#C4714A]" />
                          </div>
                          <p className="mt-1 text-[11px] text-[#6B5D4E]">
                            69 € + abonnement. Modifiable 24/7, 5 langues, notices & carte locale.
                          </p>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormuleNouveau("essential")}
                          className={`rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                            formuleNouveau === "essential"
                              ? "border-[#2A2016] bg-black/[0.04] ring-1 ring-[#2A2016]"
                              : "border-black/[0.08] hover:border-black/20"
                          }`}
                        >
                          <span className="text-[12.5px] font-bold text-[#2A2016]">Essentielle</span>
                          <p className="mt-1 text-[11px] text-[#6B5D4E]">
                            49 € en 1 fois. Arrivée, départ, règles du logement & contacts (sans abonnement).
                          </p>
                        </button>
                      </div>
                    </div>

                    {erreurAjout && (
                      <p className="text-[12px] text-red-600 font-medium">{erreurAjout}</p>
                    )}

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setAfficheAjout(false)}
                        className="rounded-full px-4 py-2 text-[12.5px] font-semibold text-[#6B5D4E] hover:text-[#2A2016] cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        disabled={ajoutEnCours}
                        className="rounded-full bg-[#C4714A] px-5 py-2 text-[12.5px] font-bold text-white hover:bg-[#A35A38] transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
                      >
                        {ajoutEnCours ? "Création en cours…" : "Créer et ajouter au panier"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAfficheAjout(true)}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-black/[0.12] py-4 text-[13px] font-bold text-[#6B5D4E] hover:border-[#C4714A] hover:text-[#C4714A] hover:bg-[#C4714A]/5 transition-all cursor-pointer bg-white/40"
                  >
                    <Plus size={16} weight="bold" />
                    <span>Ajouter un hébergement supplémentaire au panier</span>
                  </button>
                )}
              </div>

              {/* ── COLONNE DROITE (5 / 12) : Récapitulatif & Abonnement ── */}
              <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-0">
                {/* Choix du rythme d'abonnement (si au moins 1 Confort coché) */}
                {nbConfort > 0 && (
                  <div className="rounded-3xl border border-black/[0.08] bg-white p-5 sm:p-6 space-y-3.5 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkle size={16} weight="fill" className="text-[#C4714A]" />
                        <span className="text-[12px] font-bold uppercase tracking-wider text-[#2A2016]">
                          Abonnement Confort ({nbConfort} {nbConfort > 1 ? "hébergements" : "hébergement"})
                        </span>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-800">
                        Facture groupée unique
                      </span>
                    </div>

                    <p className="text-[12.5px] text-[#6B5D4E] leading-relaxed">
                      La formule Confort débloque l’expérience complète pour vous et vos voyageurs : <strong>modifications illimitées 24/7</strong> (codes WiFi, digicodes, photos), <strong>traduction automatique en 5 langues</strong> (FR, EN, ES, IT, DE), <strong>notices d’équipements pas-à-pas</strong>, <strong>recommandations locales interactives</strong>, <strong>FAQ</strong> et <strong>livre d'or</strong>. Sans engagement, résiliable en 1 clic.
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Option Mensuelle */}
                      <button
                        type="button"
                        onClick={() => setRythme("mensuel")}
                        className={`rounded-2xl border p-3.5 text-left transition-all cursor-pointer relative ${
                          rythme === "mensuel"
                            ? "border-[#C4714A] bg-[#C4714A]/5 ring-2 ring-[#C4714A]/20"
                            : "border-black/[0.08] hover:border-black/20 bg-white"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-bold text-[#2A2016]">Mensuel</span>
                          {rythme === "mensuel" && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C4714A] text-white">
                              <Check size={12} weight="bold" />
                            </div>
                          )}
                        </div>
                        <p className="mt-1.5 font-mono text-[16px] font-bold text-[#C4714A]">
                          {(nbConfort * 1.99).toFixed(2).replace(".", ",")} €{" "}
                          <span className="text-[11.5px] font-normal text-[#6B5D4E]">/ mois</span>
                        </p>
                        <p className="mt-1 text-[11px] text-[#8C7E72]">
                          {nbConfort > 1 ? `1,99 €/m par hébergement` : "Sans engagement"}
                        </p>
                      </button>

                      {/* Option Annuelle */}
                      <button
                        type="button"
                        onClick={() => setRythme("annuel")}
                        className={`relative rounded-2xl border p-3.5 text-left transition-all cursor-pointer ${
                          rythme === "annuel"
                            ? "border-[#C4714A] bg-[#C4714A]/5 ring-2 ring-[#C4714A]/20"
                            : "border-black/[0.08] hover:border-black/20 bg-white"
                        }`}
                      >
                        <span className="absolute -top-2.5 right-3 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wide text-white shadow-2xs">
                          2 mois offerts
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] font-bold text-[#2A2016]">Annuel</span>
                          {rythme === "annuel" && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C4714A] text-white">
                              <Check size={12} weight="bold" />
                            </div>
                          )}
                        </div>
                        <p className="mt-1.5 font-mono text-[16px] font-bold text-[#C4714A]">
                          {(nbConfort * 19).toFixed(2).replace(".", ",")} €{" "}
                          <span className="text-[11.5px] font-normal text-[#6B5D4E]">/ an</span>
                        </p>
                        <p className="mt-1 text-[11px] text-[#8C7E72]">
                          Soit ~{((nbConfort * 19) / 12).toFixed(2).replace(".", ",")} € / mois
                        </p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Encart Récapitulatif financier & Paiement */}
                <div className="rounded-3xl border border-black/[0.08] bg-white p-5 sm:p-6 space-y-4 shadow-sm">
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-[#2A2016] border-b border-black/[0.06] pb-3">
                    Récapitulatif de votre commande
                  </h3>

                  {/* Détail clair des coûts */}
                  <div className="space-y-2.5 text-[13px]">
                    {nbEssentiel > 0 && (
                      <div className="flex justify-between text-[#4A3E31]">
                        <span>
                          {nbEssentiel > 1 ? `${nbEssentiel} × Formule Essentielle` : "1 × Formule Essentielle"} (plaque en noyer incluse)
                        </span>
                        <span className="font-semibold text-[#2A2016]">
                          {(nbEssentiel * 49).toFixed(2).replace(".", ",")} €
                        </span>
                      </div>
                    )}

                    {nbConfort > 0 && (
                      <div className="flex justify-between text-[#4A3E31]">
                        <span>
                          {nbConfort > 1 ? `${nbConfort} × Formule Confort` : "1 × Formule Confort"} (plaque en noyer incluse)
                        </span>
                        <span className="font-semibold text-[#2A2016]">
                          {(nbConfort * 69).toFixed(2).replace(".", ",")} €
                        </span>
                      </div>
                    )}

                    {nbConfort > 0 && (
                      <div className="flex justify-between text-emerald-800 text-[12.5px]">
                        <span>
                          Abonnement Confort ({nbConfort} {nbConfort > 1 ? "hébergements" : "hébergement"}, {rythme})
                        </span>
                        <span className="font-semibold text-emerald-800">
                          +{totalAbonnement.toFixed(2).replace(".", ",")} €
                        </span>
                      </div>
                    )}

                    {/* Livraison sans précision de transporteur */}
                    <div className="flex justify-between text-[#4A3E31]">
                      <span>Livraison</span>
                      <span className="font-semibold text-emerald-600">Offerte</span>
                    </div>

                    <div className="pt-3 border-t border-black/[0.07] flex items-baseline justify-between">
                      <div>
                        <span className="text-[15.5px] font-bold text-[#2A2016] block">
                          Total réglé aujourd’hui
                        </span>
                        {nbConfort > 0 ? (
                          <span className="text-[11.5px] text-[#8C7E72] block mt-0.5">
                            Puis {totalAbonnement.toFixed(2).replace(".", ",")} € / {rythme === "annuel" ? "an" : "mois"} sans engagement
                          </span>
                        ) : (
                          <span className="text-[11.5px] text-emerald-700 block mt-0.5">
                            Règlement unique • Aucun prélèvement futur
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-[26px] font-bold text-[#2A2016] tracking-tight">
                          {totalImmediat.toFixed(2).replace(".", ",")} €
                        </span>
                        <span className="block text-[10px] uppercase font-bold text-[#A8998A]">
                          TVA incluse
                        </span>
                      </div>
                    </div>
                  </div>

                  {erreurPaiement && (
                    <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-[12px] text-red-700 font-medium">
                      {erreurPaiement}
                    </p>
                  )}

                  {/* Bouton de paiement Stripe */}
                  <button
                    type="button"
                    onClick={handlePayerPanier}
                    disabled={paiementEnCours || totalLivrets === 0}
                    className="w-full rounded-2xl bg-[#C4714A] hover:bg-[#A35A38] text-white py-4 px-6 text-[15.5px] font-bold flex items-center justify-center gap-2.5 shadow-md shadow-[#C4714A]/25 transition-all active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                  >
                    {paiementEnCours ? (
                      <>
                        <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                        <span>Ouverture du paiement sécurisé…</span>
                      </>
                    ) : totalLivrets === 0 ? (
                      <span>Cochez au moins un livret pour commander</span>
                    ) : (
                      <>
                        <span>
                          Commander {totalLivrets > 1 ? `les ${totalLivrets} plaques` : "la plaque"} ({totalImmediat.toFixed(2).replace(".", ",")} €)
                        </span>
                        <ArrowRight size={18} weight="bold" />
                      </>
                    )}
                  </button>

                  {/* Réassurances */}
                  <div className="pt-2 border-t border-black/[0.06] flex flex-col gap-2 text-[11.5px] text-[#8C7E72]">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} weight="bold" className="text-emerald-600 shrink-0" />
                      <span>Paiement sécurisé par Stripe (CB, Apple Pay, Google Pay)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package size={16} weight="duotone" className="text-[#C4714A] shrink-0" />
                      <span>Adresse de livraison demandée à l'étape suivante</span>
                    </div>
                  </div>

                  {/* Bouton de fermeture secondaire */}
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={onFermer}
                      className="text-[12px] font-medium text-[#8C7E72] hover:text-[#2A2016] hover:underline cursor-pointer"
                    >
                      Continuer mes modifications dans le tableau de bord
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Barre d'action fixe en bas sur mobile (Mobile-First sticky checkout) ── */}
        {brouillons.length > 0 && (
          <div className="sm:hidden border-t border-black/[0.08] bg-white px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] shrink-0 z-20">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-[#8C7E72] uppercase tracking-wider block">
                  Total à régler
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-[20px] font-bold text-[#2A2016] leading-none">
                    {totalImmediat.toFixed(2).replace(".", ",")} €
                  </span>
                  {nbConfort > 0 && (
                    <span className="text-[10px] text-emerald-700 font-semibold truncate">
                      +{totalAbonnement.toFixed(2).replace(".", ",")}€/{rythme === "annuel" ? "an" : "m"}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handlePayerPanier}
                disabled={paiementEnCours || totalLivrets === 0}
                className="flex-1 max-w-[200px] rounded-xl bg-[#C4714A] hover:bg-[#A35A38] text-white py-2.5 px-3 text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#C4714A]/25 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {paiementEnCours ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : totalLivrets === 0 ? (
                  <span className="text-[11.5px]">0 sélectionné</span>
                ) : (
                  <>
                    <span className="truncate">Commander ({totalLivrets})</span>
                    <ArrowRight size={14} weight="bold" className="shrink-0" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
