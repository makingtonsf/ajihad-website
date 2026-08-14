import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";
import { Heart, ChevronDown, Eye, X } from "lucide-react";
import Pastille, { libelleStatut, tonDuStatut } from "@/components/Pastille";
import EtatVide from "@/components/EtatVide";
import { TITRE_MODALE, TITRE_PAGE } from "@/lib/typographie";
import CarteCompteur from "@/components/CarteCompteur";

const STATUTS = [
  "brouillon", "declaree", "en_attente_verification", "confirmee",
  "annulee", "recue_nature", "remboursee",
];

export default function AdminContributions() {
  const { data: contributions, refetch } = trpc.admin.contributions.list.useQuery();
  const [selected, setSelected] = useState<any>(null);
  const [filtreStatut, setFiltreStatut] = useState("");

  const updateStatut = trpc.admin.contributions.updateStatut.useMutation({
    onSuccess: () => { toast.success("Statut mis à jour."); refetch(); },
    onError: (err: any) => toast.error(`Erreur : ${err.message}`),
  });

  const filtered = (contributions || []).filter((c: any) =>
    !filtreStatut || c.statut === filtreStatut
  );


  // Totaux
  const totalDeclaree = (contributions || []).filter((c: any) => c.statut === "declaree").length;
  const totalConfirmee = (contributions || []).filter((c: any) => c.statut === "confirmee").length;
  const totalEnAttente = (contributions || []).filter((c: any) => c.statut === "en_attente_verification").length;

  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className={TITRE_PAGE}>Contributions & Dons</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gérez les déclarations de contributions reçues par AJIHAD.</p>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { label: "Déclarées", val: totalDeclaree, couleur: "#185FA5" },
            { label: "En vérification", val: totalEnAttente, couleur: "#F4A022" },
            { label: "Confirmées", val: totalConfirmee, couleur: "#2E9E5B" },
          ].map(stat => (
            <CarteCompteur key={stat.label} icone={Heart} couleur={stat.couleur}
              valeur={stat.val} libelle={stat.label} />
          ))}
        </div>

        {/* Filtre statut */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button onClick={() => setFiltreStatut("")} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!filtreStatut ? "bg-[#185FA5] text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}>Tous</button>
          {STATUTS.map(s => (
            <button key={s} onClick={() => setFiltreStatut(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filtreStatut === s ? "bg-[#185FA5] text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"}`}>{libelleStatut(s)}</button>
          ))}
        </div>

        {/* Détail modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={TITRE_MODALE}>Détail de la contribution</h3>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X className="w-4 h-4 text-gray-500" /></button>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Référence", val: selected.reference },
                  { label: "Contributeur", val: selected.nomContributeur || "Anonyme" },
                  { label: "Email", val: selected.email || "—" },
                  { label: "Type", val: selected.typeContribution },
                  { label: "Montant", val: selected.montant ? `${selected.montant} ${selected.devise || "USD"}` : "—" },
                  { label: "Projet soutenu", val: selected.projetSoutenu || "Fonds général" },
                  { label: "Moyen", val: selected.moyenContribution || "—" },
                  { label: "Pays", val: selected.pays || "—" },
                  { label: "Commentaire", val: selected.commentaire || "—" },
                  { label: "Date", val: new Date(selected.createdAt).toLocaleDateString("fr-HT") },
                ].map(item => (
                  <div key={item.label} className="flex gap-3">
                    <span className="text-gray-500 dark:text-gray-400 w-32 flex-shrink-0">{item.label}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{item.val}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Changer le statut</label>
                <select value={selected.statut} onChange={e => { updateStatut.mutate({ id: selected.id, statut: e.target.value as any }); setSelected({ ...selected, statut: e.target.value }); }}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none">
                  {STATUTS.map(s => <option key={s} value={s}>{libelleStatut(s)}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {!filtered || filtered.length === 0 ? (
            <EtatVide
              icone={Heart}
              raison={filtreStatut ? "filtre" : "vide"}
              titre={filtreStatut ? "Aucune contribution à ce statut" : "Aucune contribution"}
              description={filtreStatut
                ? `Aucune contribution n'est actuellement au statut « ${libelleStatut(filtreStatut)} ».`
                : "Les contributions déclarées depuis le site apparaîtront ici, avec leur référence de suivi."}
              action={filtreStatut ? { libelle: "Voir tous les statuts", onClick: () => setFiltreStatut("") } : undefined}
            />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Référence</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide hidden md:table-cell">Contributeur</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide hidden lg:table-cell">Montant</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide hidden lg:table-cell">Type</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Statut</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide hidden md:table-cell">Date</th>
                  <th className="px-5 py-3 text-right font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((c: any) => {
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">{c.reference}</td>
                      <td className="px-5 py-3 text-gray-700 dark:text-gray-300 hidden md:table-cell">{c.nomContributeur || <span className="text-gray-400 italic">Anonyme</span>}</td>
                      <td className="px-5 py-3 font-semibold text-gray-900 dark:text-white hidden lg:table-cell">{c.montant ? `${c.montant} ${c.devise || "USD"}` : "—"}</td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell capitalize">{c.typeContribution}</td>
                      <td className="px-5 py-3">
                        <Pastille ton={tonDuStatut(c.statut)}>{libelleStatut(c.statut)}</Pastille>
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs hidden md:table-cell">
                        {new Date(c.createdAt).toLocaleDateString("fr-HT")}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => setSelected(c)} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-[#185FA5] transition-colors" aria-label="Voir le détail">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-3">{filtered.length} contribution{filtered.length !== 1 ? "s" : ""}</p>
      </div>
    </AdminLayout>
  );
}

