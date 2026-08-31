"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import AdminModernTileEditor from "@/components/admin/AdminModernTileEditor";
import { getAdminAccommodationById, updateAdminAccommodation, detachOwnerAccount } from "../../actions";
import { Accommodation } from "@/lib/types/accommodation";
import { UserPlus, Trash, CheckCircle, Copy, Warning } from "@phosphor-icons/react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditAccommodationPage({ params }: Props) {
  const router = useRouter();
  const { id } = use(params);
  const [data, setData] = useState<Accommodation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Owner account management
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPassword, setOwnerPassword] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [accountMessage, setAccountMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [copied, setCopied] = useState(false);
  /** Canal pour pousser une écriture faite hors éditeur dans son état interne. */
  const applyToEditor = useRef<((patch: Partial<Accommodation>) => void) | null>(null);

  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetchAccommodation = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const acc = await getAdminAccommodationById(id);
        if (cancelled) return;
        if (acc) {
          setData(acc);
        } else {
          router.push("/admin/hebergements");
        }
      } catch (error) {
        if (cancelled) return;
        console.error("Error fetching accommodation:", error);
        // On affiche l'erreur au lieu de rester sur un écran vide : sans le
        // livret réel, éditer reviendrait à risquer d'écraser son contenu.
        setLoadError(error instanceof Error ? error.message : "Chargement impossible.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAccommodation();
    return () => {
      cancelled = true;
    };
  }, [id, router, reloadToken]);

  /**
   * Enregistrement depuis l'éditeur en direct : on RESTE sur la page pour
   * continuer à travailler, et on garde l'état local synchronisé.
   * Les erreurs remontent à l'éditeur, qui les affiche dans son bandeau.
   *
   * `ownerUid` et `mustChangePassword` sont volontairement RETIRÉS de la charge
   * utile : ils appartiennent au panneau « Compte propriétaire », pas à
   * l'éditeur. L'éditeur travaille sur un instantané figé au montage ; sans ce
   * filtre, enregistrer après avoir créé un compte réécrirait l'ancien état et
   * effacerait l'UID tout juste enregistré.
   */
  const handleSubmitInPlace = async (updatedData: Accommodation) => {
    setIsSubmitting(true);
    try {
      const payload: Partial<Accommodation> = { ...updatedData };
      // Champs pilotés hors éditeur : compte propriétaire, historiques, et
      // l'identité gravée (identifiant permanent, verrou de slug).
      for (const key of ["ownerUid", "mustChangePassword", "cleaningLogs", "inventories", "features", "publishedAt", "createdAt", "permanentId", "slugLocked"] as const) {
        delete payload[key];
      }
      await updateAdminAccommodation(id, payload);
      setData((prev) => (prev ? { ...prev, ...payload } : updatedData));
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateOwnerAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAccount(true);
    setAccountMessage(null);
    try {
      const response = await fetch("/api/admin/create-owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: ownerEmail, password: ownerPassword, displayName: ownerName }),
      });
      const result = await response.json();
      if (!response.ok) {
        setAccountMessage({ type: "error", text: result.error || "Erreur lors de la création du compte." });
        return;
      }
      const updatedOwner = { ...data!.owner, email: ownerEmail, name: ownerName || data!.owner.name };

      await updateAdminAccommodation(id, {
        ownerUid: result.uid,
        mustChangePassword: true,
        owner: updatedOwner
      });
      setData(prev => prev ? { ...prev, ownerUid: result.uid, mustChangePassword: true, owner: updatedOwner } : prev);
      // L'éditeur travaille sur son propre instantané : sans ce report, son
      // prochain enregistrement remettrait l'ancienne adresse e-mail et le
      // propriétaire ne retrouverait plus son livret à la connexion.
      applyToEditor.current?.({ owner: updatedOwner });
      setAccountMessage({ type: "success", text: `Compte créé ! UID : ${result.uid}` });
      setShowCreateForm(false);
      setOwnerPassword("");
    } catch {
      setAccountMessage({ type: "error", text: "Erreur réseau. Réessayez." });
    } finally {
      setCreatingAccount(false);
    }
  };

  const handleDeleteOwnerAccount = async () => {
    if (!data?.ownerUid) return;
    if (!confirm(`Supprimer le compte propriétaire de ${data.owner.name} ? Cette action est irréversible.`)) return;
    setDeletingAccount(true);
    setAccountMessage(null);
    try {
      const response = await fetch(`/api/admin/delete-owner?uid=${data.ownerUid}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) {
        setAccountMessage({ type: "error", text: result.error || "Erreur lors de la suppression." });
        return;
      }
      await detachOwnerAccount(id);
      setData(prev => prev ? { ...prev, ownerUid: undefined, mustChangePassword: undefined } : prev);
      setAccountMessage({ type: "success", text: "Compte propriétaire supprimé." });
    } catch {
      setAccountMessage({ type: "error", text: "Erreur réseau." });
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleCopyLoginLink = () => {
    const url = `${window.location.origin}/proprietaire/login`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4714A]" />
        <p className="text-xs text-[#6B5D4E]">Chargement du livret…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-lg mx-auto mt-16 bg-white border border-red-200 rounded-2xl p-6 text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
          <Warning size={24} weight="fill" />
        </div>
        <h1 className="font-bold text-lg text-[#2A2016] mb-2">Impossible de charger ce livret</h1>
        <p className="text-sm text-[#6B5D4E] mb-5">{loadError}</p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setReloadToken((t) => t + 1)}
            className="px-5 py-2.5 rounded-xl bg-[#C4714A] text-white text-sm font-semibold hover:bg-[#A35A38] transition-colors"
          >
            Réessayer
          </button>
          <button
            onClick={() => router.push("/admin/hebergements")}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#6B5D4E] hover:bg-gray-50 transition-colors"
          >
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const hasOwnerAccount = Boolean(data.ownerUid);

  /* ── Bloc « Compte propriétaire », partagé par les deux éditeurs ────── */
  const ownerPanel = (
    <div className="bg-white rounded-2xl border border-[#EDD9A3]/40 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#EDD9A3]/30 bg-[#FBF5EC] gap-2">
        <div className="flex items-center gap-2.5">
          <UserPlus size={18} className="text-[#C4714A]" />
          <h2 className="font-semibold text-sm text-[#2A2016]">Compte propriétaire</h2>
        </div>
        {hasOwnerAccount && (
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200 shrink-0">
            <CheckCircle size={12} weight="fill" /> Actif
          </span>
        )}
      </div>

      <div className="p-5">
        {accountMessage && (
          <div className={`mb-4 px-3.5 py-2.5 rounded-xl text-xs ${accountMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
            {accountMessage.text}
          </div>
        )}

        {hasOwnerAccount ? (
          <div className="space-y-3">
            <div className="p-3.5 bg-[#FBF5EC] rounded-xl">
              <p className="text-xs font-medium text-[#2A2016]">{data.owner.name}</p>
              <p className="text-[11px] text-[#6B5D4E]">{data.owner.email}</p>
              <p className="text-[10px] text-[#B0A090] mt-0.5 break-all">UID : {data.ownerUid}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleCopyLoginLink}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#EDD9A3] text-[#6B5D4E] hover:text-[#C4714A] hover:border-[#C4714A] transition-colors text-[11px] font-medium"
              >
                <Copy size={13} />
                {copied ? "Copié !" : "Lien de connexion"}
              </button>
              <button
                onClick={handleDeleteOwnerAccount}
                disabled={deletingAccount}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors text-[11px] font-medium disabled:opacity-50"
              >
                <Trash size={13} />
                {deletingAccount ? "Suppression…" : "Supprimer"}
              </button>
            </div>
            {data.mustChangePassword && (
              <p className="text-[11px] text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                ⚠️ Le propriétaire n&apos;a pas encore changé son mot de passe.
              </p>
            )}
          </div>
        ) : !showCreateForm ? (
          <div className="text-center py-2">
            <p className="text-xs text-[#6B5D4E] mb-3">Aucun compte propriétaire pour cet hébergement.</p>
            <button
              onClick={() => {
                setOwnerName(data.owner.name || "");
                setOwnerEmail(data.owner.email || "");
                setOwnerPassword("");
                setShowCreateForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C4714A] text-white font-semibold hover:bg-[#A35A38] transition-colors shadow-sm mx-auto text-xs"
            >
              <UserPlus size={16} />
              Créer un compte propriétaire
            </button>
          </div>
        ) : (
          <form onSubmit={handleCreateOwnerAccount} className="space-y-3">
            <div>
              <label className="block text-[10px] font-semibold text-[#6B5D4E] uppercase tracking-wider mb-1">Nom affiché</label>
              <input
                type="text"
                value={ownerName}
                onChange={e => setOwnerName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/40 bg-[#FBF5EC] text-xs"
                placeholder="Jean Dupont"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6B5D4E] uppercase tracking-wider mb-1">Email</label>
              <input
                type="email"
                required
                value={ownerEmail}
                onChange={e => setOwnerEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/40 bg-[#FBF5EC] text-xs"
                placeholder="proprietaire@email.com"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-[#6B5D4E] uppercase tracking-wider mb-1">Mot de passe temporaire</label>
              <input
                type="text"
                required
                minLength={8}
                value={ownerPassword}
                onChange={e => setOwnerPassword(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/40 bg-[#FBF5EC] text-xs font-mono"
                placeholder="Min. 8 caractères"
              />
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={creatingAccount}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C4714A] text-white font-semibold hover:bg-[#A35A38] transition-colors shadow-sm text-xs disabled:opacity-60"
              >
                <UserPlus size={14} />
                {creatingAccount ? "Création…" : "Créer le compte"}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreateForm(false); setAccountMessage(null); }}
                className="px-4 py-2 rounded-xl text-[#6B5D4E] hover:bg-gray-100 transition-colors text-xs"
              >
                Annuler
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  /*
   * Un seul éditeur, quelle que soit la formule.
   *
   * L'Essentielle passait par un formulaire distinct, moins abouti et
   * entretenu en double. Elle utilise le même écran : ce qui relève du
   * Confort y est grisé, et l'aperçu prend le gabarit de sa formule.
   */
  return (
    <AdminModernTileEditor
      initialData={data}
      onSubmit={handleSubmitInPlace}
      isLoading={isSubmitting}
      ownerPanel={ownerPanel}
      externalPatchRef={applyToEditor}
    />
  );
}
