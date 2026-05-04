"use client";

import { useEffect, useState } from "react";
import { getAccommodations, deleteAccommodation, updateAccommodation } from "@/lib/firebase/firestore";
import { Accommodation } from "@/lib/types/accommodation";
import Link from "next/link";
import { Plus, PencilSimple, Trash, Link as LinkIcon, QrCode } from "@phosphor-icons/react";

export default function AccommodationsList() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    try {
      const data = await getAccommodations();
      setAccommodations(data);
    } catch (error) {
      console.error("Error fetching accommodations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateAccommodation(id, { isActive: !currentStatus });
      fetchAccommodations();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet hébergement ? Cette action est irréversible.")) {
      try {
        await deleteAccommodation(id);
        fetchAccommodations();
      } catch (error) {
        console.error("Error deleting accommodation:", error);
      }
    }
  };

  const copyUrl = (slug: string) => {
    const url = `${window.location.origin}/h/${slug}`;
    navigator.clipboard.writeText(url);
    alert("URL copiée !");
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C4714A]"></div></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold text-[#2A2016]">
            Hébergements
          </h1>
          <p className="text-sm text-[#6B5D4E] mt-1">Gérez les livrets d&apos;accueil de vos propriétés</p>
        </div>
        <Link 
          href="/admin/hebergements/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C4714A] text-white font-semibold hover:bg-[#A35A38] transition-colors shadow-sm"
        >
          <Plus size={18} />
          Nouveau logement
        </Link>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-[#EDD9A3]/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#FBF5EC] border-b border-[#EDD9A3]/40">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B5D4E] uppercase tracking-wider">Logement</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B5D4E] uppercase tracking-wider">Propriétaire</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B5D4E] uppercase tracking-wider">Offre</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B5D4E] uppercase tracking-wider">Statut</th>
                <th className="px-6 py-4 text-xs font-semibold text-[#6B5D4E] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDD9A3]/20">
              {accommodations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#6B5D4E]">
                    Aucun hébergement pour le moment.
                  </td>
                </tr>
              ) : (
                accommodations.map((acc) => (
                  <tr key={acc.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[#2A2016]">{acc.property.name}</div>
                      <div className="text-xs text-[#6B5D4E] mt-0.5">{acc.property.city}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#2A2016]">{acc.owner.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        acc.offerType === 'comfort' ? 'bg-[#FDF3DC] text-[#D4A34A]' : 'bg-[#EBF0E6] text-[#5A7A4E]'
                      }`}>
                        {acc.offerType === 'comfort' ? 'Confort' : 'Essentielle'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleToggleActive(acc.id!, acc.isActive)}
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                          acc.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {acc.isActive ? 'En ligne' : 'Désactivé'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => copyUrl(acc.slug)}
                          className="p-2 text-[#6B5D4E] hover:text-[#C4714A] hover:bg-[#FBF5EC] rounded-lg transition-colors"
                          title="Copier le lien"
                        >
                          <LinkIcon size={18} />
                        </button>
                        <Link 
                          href={`/admin/hebergements/${acc.id}`}
                          className="p-2 text-[#6B5D4E] hover:text-[#2B5F75] hover:bg-[#E4EEF3] rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <PencilSimple size={18} />
                        </Link>
                        <button 
                          onClick={() => handleDelete(acc.id!)}
                          className="p-2 text-[#6B5D4E] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
