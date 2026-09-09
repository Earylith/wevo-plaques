"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CaretDown, Check, HouseLine, LockSimple, Package, PencilSimple, Plus, ShoppingCart, Sparkle, Trash, Truck, X } from "@phosphor-icons/react";
import { type LivretResume, creerNouveauLivret, supprimerLivretBrouillon, modifierPlaqueBrouillon } from "@/app/espace-actions";
import { changerFormuleBrouillon } from "@/app/creation-actions";
import { ouvrirPaiementPanier } from "@/app/paiement-actions";
import type { RythmeAbonnement } from "@/lib/stripe";
import type { OfferType } from "@/lib/types/accommodation";
import { TAGLINE_PAR_DEFAUT, TAGLINE_MAX } from "@/lib/plaque";
import s from "./PanierCommande.module.css";

interface PanierCommandeProps {
  ouvert: boolean;
  onFermer: () => void;
  livrets: LivretResume[];
  onLivretsChange: () => Promise<void>;
  jetonHote: () => Promise<string | undefined>;
  notificationMessage?: string | null;
}

// Calculer en centimes évite les arrondis sur les paniers de plusieurs livrets.
const PRIX = { essential: 4900, comfort: 6900, mensuel: 199, annuel: 1900 };
const euros = (prix: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(prix / 100);
const FORMULES = ["essential", "comfort"] as const;
const INCLUS = {
  essential: ["Plaque en noyer gravée, 25 × 22 cm", "QR code permanent et livret en ligne", "Wi-Fi, accès, arrivée et départ", "Règles du logement et contacts", "Modifications : 5 € par session"],
  comfort: ["Tous les essentiels du livret d’accueil", "Phrase personnalisée sur la plaque", "Modifications illimitées et photos", "Traduction en 5 langues", "Équipements et bonnes adresses", "FAQ, livre d’or, carte et météo"],
};
const Spinner = () => <span className={s.spinner} aria-hidden="true" />;

function ChoixFormule({ name, valeur, onChange, disabled, rythme }: {
  name: string; valeur: OfferType; onChange: (value: OfferType) => void; disabled: boolean; rythme: RythmeAbonnement;
}) {
  return <fieldset className={s.planChoices} disabled={disabled}>
    <legend className={s.srOnly}>Choisir la formule</legend>
    {FORMULES.map((formule) => <label key={formule} className={s.planChoice}>
      <input type="radio" name={name} value={formule} checked={valeur === formule} onChange={() => onChange(formule)} />
      <span className={s.choiceTop}><span>{formule === "comfort" && <Sparkle size={14} weight="fill" />}{formule === "comfort" ? "Confort" : "Essentielle"}</span><span className={s.choiceMark}><Check size={11} weight="bold" /></span></span>
      <span className={s.choicePrice}><strong>{PRIX[formule] / 100} €</strong><span>{formule === "essential" ? "sans abonnement" : "+ " + euros(PRIX[rythme]) + "/" + (rythme === "annuel" ? "an" : "mois")}</span></span>
    </label>)}
  </fieldset>;
}

export default function PanierCommande({ ouvert, onFermer, livrets, onLivretsChange, jetonHote, notificationMessage }: PanierCommandeProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const ajoutRef = useRef<HTMLDivElement>(null);
  const recapRef = useRef<HTMLElement>(null);
  const id = useId();
  const [rythme, setRythme] = useState<RythmeAbonnement>("mensuel");
  // Mémoriser les exclusions sélectionne aussi les nouveaux brouillons reçus après le montage.
  const [idsExclus, setIdsExclus] = useState<string[]>([]);
  const [afficheAjout, setAfficheAjout] = useState(false);
  const [nomNouveau, setNomNouveau] = useState("");
  const [formuleNouveau, setFormuleNouveau] = useState<OfferType>("comfort");
  const [ajoutEnCours, setAjoutEnCours] = useState(false);
  const [erreurAjout, setErreurAjout] = useState<string | null>(null);
  const [idEdition, setIdEdition] = useState<string | null>(null);
  const [phrase, setPhrase] = useState("");
  const [idSuppression, setIdSuppression] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [erreurArticle, setErreurArticle] = useState<{ id: string; message: string } | null>(null);
  const [paiementEnCours, setPaiementEnCours] = useState(false);
  const [erreurPaiement, setErreurPaiement] = useState<string | null>(null);
  const [recapVisible, setRecapVisible] = useState(false);

  // Le dialogue natif retient le focus, rend l'arrière-plan inerte et restitue le focus à la fermeture.
  useEffect(() => {
    if (!ouvert) return;
    const dialog = dialogRef.current;
    const declencheur = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      if (declencheur?.isConnected) declencheur.focus({ preventScroll: true });
    };
  }, [ouvert]);

  useEffect(() => {
    if (ouvert && afficheAjout) {
      ajoutRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
      ajoutRef.current?.querySelector("input")?.focus({ preventScroll: true });
    }
  }, [ouvert, afficheAjout]);

  // Sur mobile, le pied de page mène d'abord au détail, puis au paiement
  // dès que l'utilisateur consulte sa commande.
  useEffect(() => {
    if (!ouvert || !recapRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setRecapVisible(entry.isIntersecting && entry.intersectionRatio >= 0.1);
    }, { root: bodyRef.current, threshold: 0.1 });
    observer.observe(recapRef.current);
    return () => observer.disconnect();
  }, [ouvert]);

  const brouillons = livrets.filter((livret) => !livret.enLigne);
  const articles = brouillons.filter((livret) => !idsExclus.includes(livret.id));
  const nbConfort = articles.filter((livret) => livret.formule === "comfort").length;
  const nbEssentiel = articles.length - nbConfort;
  const abonnement = nbConfort * PRIX[rythme];
  const total = nbEssentiel * PRIX.essential + nbConfort * PRIX.comfort + abonnement;
  const periode = rythme === "annuel" ? "an" : "mois";
  const occupe = paiementEnCours || ajoutEnCours || actionId !== null;
  const paiementDesactive = occupe || articles.length === 0 || idEdition !== null;

  const jetonRequis = async () => {
    const jeton = await jetonHote();
    if (!jeton) throw new Error("Veuillez vous reconnecter pour poursuivre.");
    return jeton;
  };
  const toggleSelection = (articleId: string) => {
    setIdsExclus((ids) => ids.includes(articleId) ? ids.filter((valeur) => valeur !== articleId) : [...ids, articleId]);
    setErreurPaiement(null);
  };
  const agirSurArticle = async (articleId: string, action: (jeton: string) => Promise<void>) => {
    if (occupe) return;
    setActionId(articleId);
    setErreurArticle(null);
    try {
      await action(await jetonRequis());
      await onLivretsChange();
    } catch (erreur) {
      setErreurArticle({ id: articleId, message: erreur instanceof Error ? erreur.message : "La modification n’a pas pu être enregistrée." });
    } finally { setActionId(null); }
  };
  const changerFormule = (item: LivretResume, formule: OfferType) => {
    if (item.formule === formule) return;
    void agirSurArticle(item.id, async (jeton) => {
      await changerFormuleBrouillon(item.id, formule, jeton);
      if (idEdition === item.id) setIdEdition(null);
    });
  };
  const supprimer = (articleId: string) => void agirSurArticle(articleId, async (jeton) => {
    await supprimerLivretBrouillon(articleId, jeton);
    setIdSuppression(null);
    if (idEdition === articleId) setIdEdition(null);
  });
  const enregistrerPhrase = (e: React.FormEvent, articleId: string) => {
    e.preventDefault();
    void agirSurArticle(articleId, async (jeton) => {
      await modifierPlaqueBrouillon(articleId, "noyer", phrase.trim(), jeton);
      setIdEdition(null);
    });
  };
  const ajouter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (occupe) return;
    if (!nomNouveau.trim()) { setErreurAjout("Indiquez le nom de votre hébergement."); return; }
    setAjoutEnCours(true);
    setErreurAjout(null);
    try {
      await creerNouveauLivret(await jetonRequis(), nomNouveau.trim(), formuleNouveau);
      await onLivretsChange();
      setNomNouveau("");
      setAfficheAjout(false);
    } catch (erreur) { setErreurAjout(erreur instanceof Error ? erreur.message : "Le livret n’a pas pu être créé."); }
    finally { setAjoutEnCours(false); }
  };
  const payer = async () => {
    if (paiementDesactive) return;
    setPaiementEnCours(true);
    setErreurPaiement(null);
    try {
      const { url } = await ouvrirPaiementPanier(articles.map((article) => article.id), window.location.origin, await jetonRequis(), rythme);
      window.location.assign(url);
    } catch (erreur) {
      setErreurPaiement(erreur instanceof Error ? erreur.message : "Le paiement n’a pas pu être ouvert. Réessayez.");
      setPaiementEnCours(false);
    }
  };
  const voirRecapitulatif = () => {
    const recap = recapRef.current;
    const body = bodyRef.current;
    if (!recap || !body) return;
    recap.querySelector("h3")?.focus({ preventScroll: true });
    body.scrollTo({
      top: body.scrollTop + recap.getBoundingClientRect().top - body.getBoundingClientRect().top,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  };

  if (!ouvert) return null;
  return <dialog ref={dialogRef} className={s.dialog} aria-labelledby={id + "-titre"}
    onCancel={(e) => { e.preventDefault(); if (!occupe) onFermer(); }}
    onClick={(e) => { if (e.target === e.currentTarget && !occupe) onFermer(); }}>
    <div className={s.shell}>
      <header className={s.header}>
        <div className={s.heading}>
          <span className={s.cartIcon}><ShoppingCart size={24} weight="duotone" /></span>
          <div><div className={s.titleRow}><h2 id={id + "-titre"}>Mon panier</h2><span className={s.count} aria-live="polite">{articles.length}</span></div><p>Plaques gravées & livrets d’accueil</p></div>
        </div>
        <ol className={s.steps} aria-label="Étapes de commande"><li aria-current="step"><span>1</span>Votre panier</li><li><span>2</span>Livraison & paiement</li></ol>
        <button type="button" className={s.close} onClick={onFermer} disabled={occupe} aria-label="Fermer le panier"><X size={20} /></button>
      </header>
      {notificationMessage && <p className={s.notification} role="status"><Check size={18} />{notificationMessage}</p>}
      <div className={s.body} ref={bodyRef}>
        <section className={s.items} aria-labelledby={id + "-hebergements"}>
          <div className={s.listHeading}>
            <div><h3 id={id + "-hebergements"}>Vos hébergements</h3><p>{articles.length} sur {brouillons.length} sélectionné{articles.length > 1 ? "s" : ""}</p></div>
            {brouillons.length > 1 && <button type="button" className={s.textButton} disabled={occupe} onClick={() => {
              setIdsExclus(articles.length === brouillons.length ? brouillons.map((livret) => livret.id) : []);
              setErreurPaiement(null);
            }}>{articles.length === brouillons.length ? "Tout désélectionner" : "Tout sélectionner"}</button>}
          </div>
          {brouillons.length === 0 && !afficheAjout && <div className={s.empty}>
            <span><ShoppingCart size={32} weight="duotone" /></span><h3>Votre prochain accueil commence ici</h3>
            <p>Ajoutez un hébergement pour créer son livret et commander sa plaque en noyer.</p>
          </div>}
          <div className={s.itemList}>
            {brouillons.map((item) => <article key={item.id} className={s.item} data-selected={!idsExclus.includes(item.id)} aria-busy={actionId === item.id}>
              <div className={s.itemHeader}>
                <label className={s.itemSelect}>
                  <input type="checkbox" checked={!idsExclus.includes(item.id)} onChange={() => toggleSelection(item.id)} disabled={occupe} aria-label={"Commander " + item.nom} />
                  <span className={s.checkbox}><Check size={13} weight="bold" /></span>
                  <span className={s.thumbnail} aria-hidden="true">{item.imageCouverture
                    ? <Image src={item.imageCouverture} alt="" width={48} height={48} unoptimized />
                    : <HouseLine size={25} weight="duotone" />}</span>
                  <span className={s.itemName}><span className={s.propertyName}>{item.nom}</span><span className={s.propertyMeta}>{item.ville || "Plaque en noyer + livret numérique"}</span></span>
                </label>
                <div className={s.itemActions}>
                  <Link href={"/proprietaire/dashboard/" + item.id + "/edit"} className={s.iconButton} aria-label={"Modifier le livret " + item.nom} title="Modifier le livret" aria-disabled={occupe} onClick={(e) => { if (occupe) e.preventDefault(); }}><PencilSimple size={18} /></Link>
                  <button type="button" className={s.iconButton + " " + s.deleteButton} disabled={occupe} onClick={() => { setIdSuppression(idSuppression === item.id ? null : item.id); setErreurArticle(null); }}
                    aria-label={"Supprimer le brouillon " + item.nom} title="Supprimer le brouillon" aria-expanded={idSuppression === item.id}><Trash size={18} /></button>
                </div>
              </div>
              {idSuppression === item.id && <div className={s.deleteConfirmation}>
                <strong>Supprimer ce brouillon et son contenu ?</strong><p>Pour le garder sans le commander, décochez simplement cet hébergement.</p>
                <div className={s.formActions}><button type="button" className={s.textButton} disabled={occupe} onClick={() => setIdSuppression(null)}>Conserver</button>
                  <button type="button" className={s.dangerButton} disabled={occupe} onClick={() => supprimer(item.id)}>Supprimer le brouillon</button></div>
              </div>}
              <ChoixFormule name={id + "-formule-" + item.id} valeur={item.formule} onChange={(formule) => changerFormule(item, formule)} disabled={occupe} rythme={rythme} />
              {item.formule === "comfort" && <div className={s.engraving}>
                {idEdition === item.id ? <form onSubmit={(e) => enregistrerPhrase(e, item.id)} className={s.phraseForm}>
                  <label htmlFor={id + "-phrase-" + item.id}>Votre phrase gravée</label>
                  <input id={id + "-phrase-" + item.id} type="text" value={phrase} maxLength={TAGLINE_MAX} onChange={(e) => setPhrase(e.target.value)} placeholder={TAGLINE_PAR_DEFAUT} disabled={occupe} autoFocus aria-describedby={id + "-phrase-aide-" + item.id} />
                  <div className={s.inputHelp} id={id + "-phrase-aide-" + item.id}><span>Vide : la phrase standard sera gravée.</span><span>{phrase.length}/{TAGLINE_MAX}</span></div>
                  <div className={s.formActions}><button type="button" className={s.textButton} disabled={occupe} onClick={() => setIdEdition(null)}>Annuler</button><button type="submit" className={s.smallPrimary} disabled={occupe}>{actionId === item.id ? "Enregistrement…" : "Enregistrer"}</button></div>
                </form> : <><div><span className={s.eyebrow}>Votre phrase gravée</span><p>« {item.plaqueTagline?.trim() || TAGLINE_PAR_DEFAUT} »</p></div>
                  <button type="button" className={s.textButton} disabled={occupe} aria-label={"Personnaliser la phrase de " + item.nom} onClick={() => { setIdEdition(item.id); setPhrase(item.plaqueTagline?.trim() || ""); setErreurArticle(null); }}><PencilSimple size={14} /><span>Modifier</span></button></>}
              </div>}
              <details className={s.features}>
                <summary><span><Package size={16} />Plaque en noyer incluse</span><span>Voir les détails<CaretDown size={14} /></span></summary>
                <ul>{INCLUS[item.formule].map((texte) => <li key={texte}><Check size={14} weight="bold" />{texte}</li>)}</ul>
              </details>
              {actionId === item.id && <p className={s.saving} role="status"><Spinner />Enregistrement de vos choix…</p>}
              {erreurArticle?.id === item.id && <p className={s.error} role="alert">{erreurArticle.message}</p>}
            </article>)}
          </div>
          <div ref={ajoutRef} className={s.addArea}>
            {afficheAjout ? <form onSubmit={ajouter} className={s.addForm}>
              <div className={s.formHeading}><h3>Un hébergement de plus</h3><button type="button" className={s.iconButton} disabled={occupe} onClick={() => setAfficheAjout(false)} aria-label="Fermer l’ajout d’hébergement"><X size={18} /></button></div>
              <label htmlFor={id + "-nom"}>Nom de l’hébergement</label><input id={id + "-nom"} value={nomNouveau} onChange={(e) => setNomNouveau(e.target.value)} placeholder="Ex. La Maison des Oliviers" required disabled={occupe} />
              <ChoixFormule name={id + "-nouvelle-formule"} valeur={formuleNouveau} onChange={setFormuleNouveau} disabled={occupe} rythme={rythme} />
              {erreurAjout && <p className={s.error} role="alert">{erreurAjout}</p>}
              <div className={s.formActions}><button type="button" className={s.textButton} disabled={occupe} onClick={() => setAfficheAjout(false)}>Annuler</button>
                <button type="submit" className={s.smallPrimary} disabled={occupe}>{ajoutEnCours ? <><Spinner />Création…</> : <><Plus size={16} />Ajouter au panier</>}</button></div>
            </form> : <button type="button" className={s.addButton} disabled={occupe} onClick={() => setAfficheAjout(true)}><Plus size={19} />Ajouter un hébergement</button>}
          </div>
          <p className={s.listNote}><Truck size={18} />Livraison offerte pour toutes vos plaques.</p>
        </section>

        <aside className={s.summary} ref={recapRef} tabIndex={-1} aria-labelledby={id + "-recap"}>
          <div className={s.summaryContent}>
            <div className={s.summaryHeading}><h3 id={id + "-recap"} tabIndex={-1}>Votre commande</h3></div>
            {articles.length > 0 ? <dl className={s.orderLines}>
              {nbEssentiel > 0 && <div><dt>{nbEssentiel} × Essentielle</dt><dd>{euros(nbEssentiel * PRIX.essential)}</dd></div>}
              {nbConfort > 0 && <div><dt>{nbConfort} × Confort</dt><dd>{euros(nbConfort * PRIX.comfort)}</dd></div>}
              {nbConfort > 0 && <div><dt>Abonnement · {rythme === "annuel" ? "1re année" : "1er mois"}</dt><dd>{euros(abonnement)}</dd></div>}
              <div><dt>Livraison</dt><dd className={s.free}>Offerte</dd></div>
            </dl> : <p className={s.emptySelection}>Sélectionnez un hébergement pour préparer votre commande.</p>}
            {nbConfort > 0 && <section className={s.subscription} aria-labelledby={id + "-abonnement"}>
              <h4 id={id + "-abonnement"}><Sparkle size={17} weight="fill" />Votre abonnement Confort</h4>
              <p>{nbConfort} livret{nbConfort > 1 ? "s" : ""} · résiliable à tout moment</p>
              <fieldset className={s.billingChoices} disabled={occupe}>
                <legend className={s.srOnly}>Rythme de facturation</legend>
                {(["mensuel", "annuel"] as const).map((choix) => <label key={choix} className={s.billingChoice}>
                  <input type="radio" name={id + "-rythme"} checked={rythme === choix} onChange={() => { setRythme(choix); setErreurPaiement(null); }} />
                  <span className={s.choiceTop}><span>{choix === "annuel" ? "Annuel" : "Mensuel"}</span><span className={s.choiceMark}><Check size={11} weight="bold" /></span></span>
                  <span className={s.billingPrice}>{euros(nbConfort * PRIX[choix])}</span><span className={s.billingPeriod}>par {choix === "annuel" ? "an" : "mois"}{nbConfort > 1 ? " pour " + nbConfort + " livrets" : ""}</span>
                </label>)}
              </fieldset>
              <p className={s.savings}><span>Avec l’annuel</span>Économisez {euros(nbConfort * (12 * PRIX.mensuel - PRIX.annuel))} / an</p>
            </section>}
          </div>
          <div className={s.checkout}>
            <div className={s.total}>
              <div className={s.totalHeading}><span>À régler aujourd’hui</span><span>TVA incluse</span></div>
              <p className={s.totalAmount} aria-live="polite" aria-atomic="true">{euros(total)}</p>
              <p className={s.renewal}>{nbConfort > 0 ? <>Puis <strong>{euros(abonnement)} / {periode}</strong> à partir {rythme === "annuel" ? "de l’année prochaine" : "du mois prochain"}.</> : articles.length > 0 ? "Paiement unique, sans abonnement." : "Aucun hébergement sélectionné."}</p>
            </div>
            {idEdition !== null && <p className={s.checkoutNotice}>Enregistrez ou annulez la modification de votre phrase avant de continuer.</p>}
            {erreurPaiement && <p className={s.error} role="alert">{erreurPaiement}</p>}
            <button type="button" className={s.payButton} disabled={paiementDesactive} onClick={payer}>{paiementEnCours ? <><Spinner />Ouverture du paiement…</> : <><LockSimple size={18} />Passer au paiement<ArrowRight size={19} /></>}</button>
            <p className={s.secure}>Paiement sécurisé par <strong>stripe</strong></p>
            <p className={s.shippingNote}>Votre adresse de livraison sera demandée à l’étape suivante.</p>
          </div>
        </aside>
      </div>
      {brouillons.length > 0 && <div className={s.mobileBar}>
        <div><span>Aujourd’hui</span><strong>{euros(total)}</strong>{nbConfort > 0 && <small>Puis {euros(abonnement)} / {periode}</small>}</div>
        <button type="button" onClick={recapVisible ? payer : voirRecapitulatif} disabled={recapVisible && paiementDesactive}>
          {paiementEnCours ? <><Spinner />Ouverture…</> : <>{recapVisible ? "Passer au paiement" : "Voir le récapitulatif"}<ArrowRight size={17} /></>}
        </button>
      </div>}
    </div>
  </dialog>;
}
