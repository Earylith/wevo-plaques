"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import AdminAccommodationForm from "@/components/admin/AdminAccommodationForm";
import { getAccommodationById, updateAccommodation } from "@/lib/firebase/firestore";
import { Accommodation } from "@/lib/types/accommodation";
import { UserPlus, Trash, CheckCircle, Copy } from "@phosphor-icons/react";

interface Props {
  params: Promise<{ id: string }>;
}

export default function EditAccommodationPage({ params }: Props) {
  const router = useRouter();
  const { id } = use(params);
  const [data, setData] = useState<Accommodation | null>(null);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchAccommodation = async () => {
      try {
        const acc = await getAccommodationById(id);
        if (acc) {
          setData(acc);
          // On ne pré-remplit plus l'email et le nom pour la création du compte
        } else {
          router.push("/admin/hebergements");
        }
      } catch (error) {
        console.error("Error fetching accommodation:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAccommodation();
  }, [id, router]);

  const handleSubmit = async (updatedData: Omit<Accommodation, "id" | "createdAt" | "updatedAt">) => {
    setIsSubmitting(true);
    try {
      await updateAccommodation(id, updatedData);
      router.push("/admin/hebergements");
      router.refresh();
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      alert("Une erreur est survenue lors de la mise à jour.");
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
      // Stocker l'UID Firebase et mettre à jour l'email du propriétaire dans Firestore
      const updatedOwner = { ...data!.owner, email: ownerEmail, name: ownerName || data!.owner.name };
      
      await updateAccommodation(id, { 
        ownerUid: result.uid, 
        mustChangePassword: true,
        owner: updatedOwner
      });
      setData(prev => prev ? { ...prev, ownerUid: result.uid, mustChangePassword: true, owner: updatedOwner } : prev);
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
      await updateAccommodation(id, { ownerUid: null as any, mustChangePassword: null as any });
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
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4714A]"></div></div>;
  }

  if (!data) return null;

  const hasOwnerAccount = Boolean(data.ownerUid);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016]">
          Modifier le logement
        </h1>
        <p className="text-sm text-[#6B5D4E] mt-1">Édition de {data.property.name}</p>
      </div>

      {/* ── Gestion Compte Propriétaire ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#EDD9A3]/40 shadow-sm overflow-hidden mb-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EDD9A3]/30 bg-[#FBF5EC]">
          <div className="flex items-center gap-3">
            <UserPlus size={20} className="text-[#C4714A]" />
            <h2 className="font-semibold text-[#2A2016]">Compte propriétaire</h2>
          </div>
          {hasOwnerAccount && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
              <CheckCircle size={14} weight="fill" /> Compte actif
            </span>
          )}
        </div>

        <div className="p-6">
          {accountMessage && (
            <div className={`mb-4 px-4 py-3 rounded-xl text-sm ${accountMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"}`}>
              {accountMessage.text}
            </div>
          )}

          {hasOwnerAccount ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-[#FBF5EC] rounded-xl">
                <div>
                  <p className="text-sm font-medium text-[#2A2016]">{data.owner.name}</p>
                  <p className="text-xs text-[#6B5D4E]">{data.owner.email}</p>
                  <p className="text-xs text-[#B0A090] mt-0.5">UID : {data.ownerUid}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopyLoginLink}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#EDD9A3] text-[#6B5D4E] hover:text-[#C4714A] hover:border-[#C4714A] transition-colors text-xs font-medium"
                  >
                    <Copy size={14} />
                    {copied ? "Copié !" : "Lien de connexion"}
                  </button>
                  <button
                    onClick={handleDeleteOwnerAccount}
                    disabled={deletingAccount}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors text-xs font-medium disabled:opacity-50"
                  >
                    <Trash size={14} />
                    {deletingAccount ? "Suppression…" : "Supprimer le compte"}
                  </button>
                </div>
              </div>
              {data.mustChangePassword && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                  ⚠️ Le propriétaire n&apos;a pas encore changé son mot de passe.
                </p>
              )}
            </div>
          ) : (
            <div>
              {!showCreateForm ? (
                <div className="text-center py-4">
                  <p className="text-sm text-[#6B5D4E] mb-4">Aucun compte propriétaire créé pour cet hébergement.</p>
                  <button
                    onClick={() => {
                      setOwnerName("");
                      setOwnerEmail("");
                      setOwnerPassword("");
                      setShowCreateForm(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C4714A] text-white font-semibold hover:bg-[#A35A38] transition-colors shadow-sm mx-auto text-sm"
                  >
                    <UserPlus size={18} />
                    Créer un compte propriétaire
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateOwnerAccount} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#6B5D4E] uppercase tracking-wider mb-1.5">Nom affiché</label>
                      <input
                        type="text"
                        value={ownerName}
                        onChange={e => setOwnerName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/40 bg-[#FBF5EC] text-sm"
                        placeholder="Jean Dupont"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#6B5D4E] uppercase tracking-wider mb-1.5">Email</label>
                      <input
                        type="email"
                        required
                        value={ownerEmail}
                        onChange={e => setOwnerEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/40 bg-[#FBF5EC] text-sm"
                        placeholder="proprietaire@email.com"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-[#6B5D4E] uppercase tracking-wider mb-1.5">Mot de passe temporaire</label>
                      <input
                        type="text"
                        required
                        minLength={8}
                        value={ownerPassword}
                        onChange={e => setOwnerPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#EDD9A3] focus:outline-none focus:ring-2 focus:ring-[#C4714A]/40 bg-[#FBF5EC] text-sm font-mono"
                        placeholder="Min. 8 caractères — à communiquer au propriétaire"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={creatingAccount}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C4714A] text-white font-semibold hover:bg-[#A35A38] transition-colors shadow-sm text-sm disabled:opacity-60"
                    >
                      <UserPlus size={16} />
                      {creatingAccount ? "Création…" : "Créer le compte"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowCreateForm(false); setAccountMessage(null); }}
                      className="px-5 py-2.5 rounded-xl text-[#6B5D4E] hover:bg-gray-100 transition-colors text-sm"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      <AdminAccommodationForm initialData={data} onSubmit={handleSubmit} isLoading={isSubmitting} />
    </div>
  );
}

