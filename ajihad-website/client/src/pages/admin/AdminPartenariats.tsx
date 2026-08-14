import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";
import { Handshake, X, Save, Mail, Phone, Globe, Briefcase, CheckCircle } from "lucide-react";
import Pastille, { libelleStatut, tonDuStatut } from "@/components/Pastille";
import EtatVide from "@/components/EtatVide";
import { TITRE_CARTE, TITRE_MODALE, TITRE_PAGE } from "@/lib/typographie";

const STATUTS = ["recue", "en_analyse", "en_negociation", "acceptee", "refusee", "archive"] as const;

type StatutValue = (typeof STATUTS)[number];

export default function AdminPartenariats() {
  const { data: demandes, refetch, isLoading } = trpc.admin.partenariats.list.useQuery();
  const [selected, setSelected] = useState<any>(null);
  const [notes, setNotes] = useState("");
  const [statutEdite, setStatutEdite] = useState<StatutValue>("recue");
  const [filtreStatut, setFiltreStatut] = useState("");
  const [filtrePays, setFiltrePays] = useState("");
  const [recherche, setRecherche] = useState("");

  const updateStatut = trpc.admin.partenariats.updateStatut.useMutation({
    onSuccess: () => { toast.success("Demande mise à jour."); refetch(); },
    onError: (err: any) => toast.error(`Erreur : ${err.message}`),
  });

  const pays = useMemo(
    () => Array.from(new Set((demandes || []).map((d: any) => d.pays).filter(Boolean))).sort(),
    [demandes]
  );

  const filtered = (demandes || []).filter((d: any) => {
    if (filtreStatut && d.statut !== filtreStatut) return false;
    if (filtrePays && d.pays !== filtrePays) return false;
    if (recherche) {
      const q = recherche.toLowerCase();
      const cible = `${d.nomOrganisation ?? ""} ${d.nomContact ?? ""} ${d.email ?? ""}`.toLowerCase();
      if (!cible.includes(q)) return false;
    }
    return true;
  });

  const ouvrirDetail = (d: any) => {
    setSelected(d);
    setNotes(d.notesInternes || "");
    setStatutEdite(d.statut || "recue");
  };

  const enregistrer = () => {
    if (!selected) return;
    updateStatut.mutate({ id: selected.id, statut: statutEdite, notes: notes || undefined });
    setSelected({ ...selected, statut: statutEdite, notesInternes: notes });
  };


  const selectClass = "px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-[#185FA5] outline-none";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div>
          <h1 className={TITRE_PAGE}>Demandes de partenariat</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {filtered.length} demande{filtered.length !== 1 ? "s" : ""} affichée{filtered.length !== 1 ? "s" : ""}
            {demandes && filtered.length !== demandes.length ? ` sur ${demandes.length}` : ""}
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-3">
          <input type="search" value={recherche} onChange={e => setRecherche(e.target.value)}
            placeholder="Rechercher une organisation ou un contact…" aria-label="Rechercher par organisation ou contact"
            className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#185FA5] outline-none" />
          <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)} aria-label="Filtrer par statut" className={selectClass}>
            <option value="">Tous les statuts</option>
            {STATUTS.map(s => <option key={s} value={s}>{libelleStatut(s)}</option>)}
          </select>
          <select value={filtrePays} onChange={e => setFiltrePays(e.target.value)} aria-label="Filtrer par pays" className={selectClass}>
            <option value="">Tous les pays</option>
            {pays.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {/* Tableau */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[0, 1, 2].map(i => <div key={i} className="h-10 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <EtatVide
              icone={Handshake}
              raison={!filtreStatut && !filtrePays && !recherche ? "vide" : "filtre"}
              titre={!filtreStatut && !filtrePays && !recherche ? "Aucune demande de partenariat" : "Aucun résultat"}
              description={!filtreStatut && !filtrePays && !recherche
                ? "Les organisations qui vous contactent via le formulaire de partenariat apparaîtront ici."
                : "Aucune demande ne correspond aux critères sélectionnés."}
              action={!filtreStatut && !filtrePays && !recherche ? undefined : {
                libelle: "Réinitialiser les filtres",
                onClick: () => { setFiltreStatut(""); setFiltrePays(""); setRecherche(""); },
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Référence</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Organisation</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide hidden sm:table-cell">Contact</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide hidden lg:table-cell">Domaine</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Statut</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide hidden md:table-cell">Date</th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filtered.map((d: any) => {
                    return (
                      <tr key={d.id} onClick={() => ouvrirDetail(d)}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer">
                        <td className="px-5 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{d.reference}</td>
                        <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{d.nomOrganisation}</td>
                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs hidden sm:table-cell">{d.nomContact}</td>
                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs hidden lg:table-cell">{d.domaineCollaboration || "—"}</td>
                        <td className="px-5 py-3">
                          <Pastille ton={tonDuStatut(d.statut)}>{libelleStatut(d.statut)}</Pastille>
                        </td>
                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs hidden md:table-cell">
                          {new Date(d.createdAt).toLocaleDateString("fr-HT")}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={e => { e.stopPropagation(); ouvrirDetail(d); }}
                            className="text-[#185FA5] text-xs font-semibold hover:underline">
                            Consulter
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Panneau latéral de détail */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Détail de la demande de partenariat">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <aside className="relative bg-white dark:bg-gray-800 w-full max-w-lg h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-start justify-between gap-4">
              <div>
                <h2 className={TITRE_MODALE}>{selected.nomOrganisation}</h2>
                <p className="text-gray-400 dark:text-gray-500 text-xs font-mono mt-0.5">{selected.reference}</p>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Fermer le panneau"
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Pastille ton={tonDuStatut(selected.statut)}>{libelleStatut(selected.statut)}</Pastille>
                {selected.accuseEnvoye && (
                  <Pastille ton="accent"><CheckCircle className="w-3 h-3" /> Accusé envoyé</Pastille>
                )}
              </div>

              <div className="space-y-2">
                {[
                  { icon: Briefcase, label: "Contact", value: [selected.nomContact, selected.fonction].filter(Boolean).join(" — ") },
                  { icon: Mail, label: "E-mail", value: selected.email },
                  { icon: Phone, label: "Téléphone", value: selected.telephone },
                  { icon: Globe, label: "Pays", value: selected.pays },
                  { icon: Briefcase, label: "Type d'organisation", value: selected.typeOrganisation },
                  { icon: Handshake, label: "Domaine de collaboration", value: selected.domaineCollaboration },
                  { icon: Handshake, label: "Projet concerné", value: selected.projetConcerne },
                ].filter(x => x.value).map((x, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-[#F6F8FB] dark:bg-gray-700/50 rounded-lg">
                    <x.icon className="w-4 h-4 text-[#185FA5] flex-shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-gray-400 dark:text-gray-500 text-xs">{x.label}</p>
                      <p className="text-gray-900 dark:text-white text-sm break-words">{x.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {selected.message && (
                <div>
                  <h3 className={`${TITRE_CARTE} mb-1.5`}>Message</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line">{selected.message}</p>
                </div>
              )}

              <div>
                <label htmlFor="prt-statut" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Statut de la demande</label>
                <select id="prt-statut" value={statutEdite} onChange={e => setStatutEdite(e.target.value as StatutValue)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none">
                  {STATUTS.map(s => <option key={s} value={s}>{libelleStatut(s)}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="prt-notes" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Notes internes</label>
                <textarea id="prt-notes" rows={4} value={notes} onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none resize-none"
                  placeholder="Suivi de la négociation, points d'attention…" />
              </div>

              <button onClick={enregistrer} disabled={updateStatut.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:bg-[#042C53] transition-colors disabled:opacity-60">
                <Save className="w-4 h-4" /> Enregistrer les modifications
              </button>

              <p className="text-gray-400 dark:text-gray-500 text-xs text-center">
                Reçue le {new Date(selected.createdAt).toLocaleString("fr-HT")}
              </p>
            </div>
          </aside>
        </div>
      )}
    </AdminLayout>
  );
}
