"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EnvelopeSimple, Warning, CheckCircle, ArrowSquareOut, ArrowCounterClockwise,
  Plus, Trash,
} from "@phosphor-icons/react";
import {
  envoyerEssai, etatMessagerie, chargerTextes, enregistrerTexte, retablirTexte,
} from "../emails";
import { CleMessage, TexteMessage, TextesEmails, VARIABLES } from "@/lib/emailsTextes";

/**
 * Les e-mails que reçoivent les clients : relus, modifiables, essayables.
 *
 * Cinq messages seulement, mais ce sont les seuls écrits que Guidz adresse
 * à ses clients : une faute de frappe, un lien mort ou une mise en page
 * cassée s'y voient plus que partout ailleurs.
 *
 * L'aperçu est rendu dans un cadre isolé, avec le HTML exact qui partira, et
 * il se recharge après chaque enregistrement — voir le résultat du texte
 * qu'on vient d'écrire est la moitié du travail.
 */

const MESSAGES: { cle: CleMessage; titre: string; quand: string }[] = [
  {
    cle: "bienvenue",
    titre: "Bienvenue",
    quand: "À la création du compte, quand l’hôte choisit sa formule.",
  },
  {
    cle: "commande",
    titre: "Commande confirmée",
    quand: "À l’encaissement, depuis le webhook Stripe et lui seul.",
  },
  {
    cle: "expedition",
    titre: "Plaque expédiée",
    quand:
      "Automatiquement, dès qu’un suivi de livraison est enregistré dans les commandes.",
  },
  {
    cle: "resiliation",
    titre: "Résiliation Confort",
    quand:
      "Quand un abonné Confort demande à résilier, dès que Stripe confirme la demande.",
  },
  {
    cle: "devis",
    titre: "Devis reçu",
    quand:
      "À l’envoi du formulaire de devis. Le demandeur reçoit cet accusé, l’équipe reçoit la fiche sur contact@guidzme.fr.",
  },
];

export default function EmailsPage() {
  const [actif, setActif] = useState<CleMessage>("bienvenue");
  const [etat, setEtat] = useState<{ configuree: boolean; expediteur: string } | null>(null);
  const [textes, setTextes] = useState<TextesEmails | null>(null);
  const [brouillon, setBrouillon] = useState<TexteMessage | null>(null);
  const [adresse, setAdresse] = useState("");
  const [envoi, setEnvoi] = useState<{ ok: boolean; detail: string } | null>(null);
  const [sauvegarde, setSauvegarde] = useState<{ ok: boolean; detail: string } | null>(null);
  const [enCours, setEnCours] = useState(false);
  /*
   * Change à chaque enregistrement pour forcer le rechargement du cadre :
   * sans cela, le navigateur réaffiche l'aperçu d'avant la modification.
   */
  const [version, setVersion] = useState(0);

  const charger = useCallback(async () => {
    try {
      const [e, t] = await Promise.all([etatMessagerie(), chargerTextes()]);
      setEtat(e);
      setTextes(t);
      setBrouillon(t.bienvenue);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    // Chargement initial : le seul setState vient d'une réponse réseau.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void charger();
  }, [charger]);

  const choisir = (cle: CleMessage) => {
    setActif(cle);
    setBrouillon(textes ? textes[cle] : null);
    setEnvoi(null);
    setSauvegarde(null);
  };

  const essayer = async () => {
    setEnCours(true);
    setEnvoi(null);
    try {
      setEnvoi(await envoyerEssai(actif, adresse));
    } catch (e) {
      setEnvoi({ ok: false, detail: e instanceof Error ? e.message : "Envoi impossible." });
    } finally {
      setEnCours(false);
    }
  };

  const sauver = async () => {
    if (!brouillon) return;
    setEnCours(true);
    setSauvegarde(null);
    try {
      const issue = await enregistrerTexte(actif, brouillon);
      setSauvegarde(issue);
      if (issue.ok) {
        setTextes((t) => (t ? { ...t, [actif]: brouillon } : t));
        setVersion((v) => v + 1);
      }
    } catch (e) {
      setSauvegarde({ ok: false, detail: e instanceof Error ? e.message : "Échec." });
    } finally {
      setEnCours(false);
    }
  };

  const retablir = async () => {
    setEnCours(true);
    setSauvegarde(null);
    try {
      const origine = await retablirTexte(actif);
      setBrouillon(origine);
      setTextes((t) => (t ? { ...t, [actif]: origine } : t));
      setVersion((v) => v + 1);
      setSauvegarde({ ok: true, detail: "Texte d’origine rétabli." });
    } catch (e) {
      setSauvegarde({ ok: false, detail: e instanceof Error ? e.message : "Échec." });
    } finally {
      setEnCours(false);
    }
  };

  const courant = MESSAGES.find((m) => m.cle === actif)!;
  const champ =
    "mt-1 w-full rounded-xl border border-[#EDD9A3] bg-white px-3 py-2 text-[13px] leading-relaxed outline-none focus:border-[#C4714A]";
  const intitule = "text-[10px] font-bold uppercase tracking-[0.1em] text-[#A8998A]";

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016]">
          E-mails clients
        </h1>
        <p className="mt-1 text-sm text-[#6B5D4E]">
          Les cinq messages transactionnels : relisez-les, modifiez le texte, essayez-les.
        </p>
      </div>

      {etat && (
        <div
          className={`mb-6 flex items-start gap-3 rounded-2xl border px-5 py-4 ${
            etat.configuree
              ? "border-[#5A7A4E]/30 bg-[#EBF0E6]"
              : "border-[#EDD9A3] bg-[#FDF3DC]"
          }`}
        >
          {etat.configuree ? (
            <CheckCircle size={18} weight="fill" className="mt-0.5 shrink-0 text-[#3F5836]" />
          ) : (
            <Warning size={18} weight="fill" className="mt-0.5 shrink-0 text-[#A35A38]" />
          )}
          <div>
            <p
              className={`text-[13px] font-bold ${
                etat.configuree ? "text-[#3F5836]" : "text-[#A35A38]"
              }`}
            >
              {etat.configuree
                ? "Messagerie configurée"
                : "Messagerie non configurée — aucun e-mail ne part"}
            </p>
            <p className="mt-0.5 text-[12px] leading-relaxed text-[#6B5D4E]">
              {etat.configuree ? (
                <>
                  Expéditeur : <span className="font-mono">{etat.expediteur}</span>. Il doit
                  être validé dans Brevo, sinon les envois sont refusés.
                </>
              ) : (
                <>
                  Ajoutez <span className="font-mono">BREVO_API_KEY</span> dans{" "}
                  <span className="font-mono">.env.local</span> (et dans Vercel pour la
                  production), puis relancez le serveur. Les comptes se créent et les
                  commandes s’enregistrent normalement en attendant — seuls les e-mails
                  sont sautés.
                </>
              )}
            </p>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {MESSAGES.map((m) => (
          <button
            key={m.cle}
            type="button"
            onClick={() => choisir(m.cle)}
            className={`rounded-full border px-4 py-2 text-[12px] font-semibold transition-colors ${
              actif === m.cle
                ? "border-[#C4714A] bg-[#C4714A] text-white"
                : "border-[#EDD9A3] bg-white text-[#6B5D4E] hover:border-[#C4714A]/50"
            }`}
          >
            {m.titre}
          </button>
        ))}
      </div>

      <p className="mb-4 text-[12px] text-[#6B5D4E]">
        <span className="font-semibold text-[#5C3D2E]">Déclenché :</span> {courant.quand}
      </p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="overflow-hidden rounded-3xl border border-[#EDD9A3]/40 bg-white shadow-sm">
          <iframe
            key={`${actif}-${version}`}
            src={`/api/admin/emails?type=${actif}&v=${version}`}
            title={`Aperçu — ${courant.titre}`}
            className="h-[820px] w-full border-0"
          />
        </div>

        <div className="space-y-4">
          {/* ─── Le texte, modifiable ─────────────────────────────────── */}
          {brouillon && (
            <div className="rounded-3xl border border-[#EDD9A3]/40 bg-white p-5 shadow-sm">
              <p className={intitule}>Texte du message</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[#6B5D4E]">
                Seuls l’objet, le titre et les paragraphes se modifient. Le
                récapitulatif, le bouton et les liens sont composés
                automatiquement — pour qu’aucune reformulation ne puisse faire
                disparaître un numéro de suivi.
              </p>

              <label className="mt-3 block">
                <span className={intitule}>Objet</span>
                <input
                  value={brouillon.sujet}
                  onChange={(e) => setBrouillon({ ...brouillon, sujet: e.target.value })}
                  className={champ}
                />
              </label>

              <label className="mt-3 block">
                <span className={intitule}>Titre dans le message</span>
                <input
                  value={brouillon.titre}
                  onChange={(e) => setBrouillon({ ...brouillon, titre: e.target.value })}
                  className={champ}
                />
              </label>

              <div className="mt-3">
                <span className={intitule}>Paragraphes</span>
                {brouillon.paragraphes.map((p, i) => (
                  <div key={i} className="mt-1.5 flex gap-1.5">
                    <textarea
                      value={p}
                      rows={3}
                      onChange={(e) => {
                        const suite = [...brouillon.paragraphes];
                        suite[i] = e.target.value;
                        setBrouillon({ ...brouillon, paragraphes: suite });
                      }}
                      className={`${champ} mt-0 resize-y`}
                    />
                    <button
                      type="button"
                      title="Supprimer ce paragraphe"
                      onClick={() =>
                        setBrouillon({
                          ...brouillon,
                          paragraphes: brouillon.paragraphes.filter((_, j) => j !== i),
                        })
                      }
                      className="shrink-0 self-start rounded-lg p-1.5 text-[#A8998A] transition-colors hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                ))}
                {brouillon.paragraphes.length < 8 && (
                  <button
                    type="button"
                    onClick={() =>
                      setBrouillon({
                        ...brouillon,
                        paragraphes: [...brouillon.paragraphes, ""],
                      })
                    }
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#2B5F75] hover:text-[#C4714A]"
                  >
                    <Plus size={12} weight="bold" />
                    Ajouter un paragraphe
                  </button>
                )}
              </div>

              <label className="mt-3 block">
                <span className={intitule}>Post-scriptum (sous le trait)</span>
                <textarea
                  value={brouillon.postScriptum}
                  rows={3}
                  onChange={(e) =>
                    setBrouillon({ ...brouillon, postScriptum: e.target.value })
                  }
                  className={`${champ} resize-y`}
                />
              </label>

              <div className="mt-3 rounded-xl bg-[#FBF5EC] p-3">
                <p className={intitule}>Valeurs disponibles</p>
                <ul className="mt-1.5 space-y-1">
                  {VARIABLES[actif].map((v) => (
                    <li key={v.cle} className="text-[11px] leading-snug text-[#6B5D4E]">
                      <button
                        type="button"
                        onClick={() => navigator.clipboard?.writeText(v.cle)}
                        title="Copier"
                        className="font-mono font-bold text-[#A35A38] hover:underline"
                      >
                        {v.cle}
                      </button>{" "}
                      — {v.sens}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void sauver()}
                  disabled={enCours}
                  className="rounded-full bg-[#2A2016] px-4 py-2 text-[11px] font-bold text-white transition-colors hover:bg-[#C4714A] disabled:opacity-50"
                >
                  {enCours ? "…" : "Enregistrer le texte"}
                </button>
                <button
                  type="button"
                  onClick={() => void retablir()}
                  disabled={enCours}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#EDD9A3] bg-white px-4 py-2 text-[11px] font-bold text-[#6B5D4E] transition-colors hover:border-[#C4714A] hover:text-[#C4714A] disabled:opacity-50"
                >
                  <ArrowCounterClockwise size={12} weight="bold" />
                  Texte d’origine
                </button>
              </div>

              {sauvegarde && (
                <p
                  className={`mt-2.5 text-[11px] font-semibold leading-relaxed ${
                    sauvegarde.ok ? "text-[#3F5836]" : "text-red-700"
                  }`}
                >
                  {sauvegarde.detail}
                </p>
              )}
            </div>
          )}

          {/* ─── L'envoi d'essai ──────────────────────────────────────── */}
          <div className="rounded-3xl border border-[#EDD9A3]/40 bg-white p-5 shadow-sm">
            <p className={`flex items-center gap-1.5 ${intitule}`}>
              <EnvelopeSimple size={12} weight="fill" />
              Envoi d’essai
            </p>
            <p className="mt-2 text-[11px] leading-relaxed text-[#6B5D4E]">
              Envoie ce message avec des données d’exemple et un objet préfixé{" "}
              <span className="font-mono">[ESSAI]</span>. C’est le seul moyen de vérifier
              que Brevo accepte l’expéditeur et que le message n’atterrit pas dans les
              indésirables.
            </p>

            <input
              type="email"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
              placeholder="votre@adresse.fr"
              className={champ}
            />

            <button
              type="button"
              onClick={() => void essayer()}
              disabled={enCours || !adresse.trim()}
              className="mt-3 w-full rounded-full bg-[#C4714A] px-4 py-2.5 text-[12px] font-bold text-white transition-colors hover:bg-[#A35A38] disabled:opacity-50"
            >
              {enCours ? "Envoi…" : `Envoyer « ${courant.titre} »`}
            </button>

            {envoi && (
              <p
                className={`mt-3 text-[12px] font-semibold leading-relaxed ${
                  envoi.ok ? "text-[#3F5836]" : "text-red-700"
                }`}
              >
                {envoi.detail}
              </p>
            )}

            <a
              href={`/api/admin/emails?type=${actif}&format=texte&v=${version}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-[#2B5F75] underline decoration-[#D6E3E8] underline-offset-2 hover:text-[#C4714A]"
            >
              Lire la version texte
              <ArrowSquareOut size={11} />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
