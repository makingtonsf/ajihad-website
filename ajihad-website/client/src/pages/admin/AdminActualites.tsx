import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";
import { Plus, Pencil, Eye, Archive, FileText, X, Check } from "lucide-react";
import Pastille, { libelleStatut, tonDuStatut } from "@/components/Pastille";
import EtatVide from "@/components/EtatVide";
import { TITRE_MODALE, TITRE_PAGE } from "@/lib/typographie";

const CATEGORIES = [
  { value: "actualite", label: "Actualité" },
  { value: "communique", label: "Communiqué" },
  { value: "evenement", label: "Événement" },
  { value: "conference", label: "Conférence" },
  { value: "formation", label: "Formation" },
  { value: "appel_candidature", label: "Appel à candidature" },
  { value: "publication", label: "Publication" },
];

// Les couleurs ne sont plus définies ici : le ton découle du statut via
// tonDuStatut(), pour que le même statut ait la même apparence partout.
const STATUTS = ["brouillon", "en_revision", "valide", "publie", "archive"];

const emptyForm = {
  slug: "", titre: "", resume: "", contenu: "", auteur: "",
  categorie: "actualite" as const, statut: "brouillon" as const,
};

export default function AdminActualites() {
  const { data: actualites, refetch } = trpc.admin.actualites.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [filtre, setFiltre] = useState("");

  const createActualite = trpc.admin.actualites.create.useMutation({
    onSuccess: () => { toast.success("Actualité créée avec succès."); refetch(); closeForm(); },
    onError: (err: any) => toast.error(`Erreur : ${err.message}`),
  });
  const updateActualite = trpc.admin.actualites.update.useMutation({
    onSuccess: () => { toast.success("Actualité mise à jour."); refetch(); closeForm(); },
    onError: (err: any) => toast.error(`Erreur : ${err.message}`),
  });

  const closeForm = () => { setShowForm(false); setEditing(null); setForm(emptyForm); };

  const startEdit = (a: any) => {
    setEditing(a);
    setForm({ slug: a.slug || "", titre: a.titre || "", resume: a.resume || "", contenu: a.contenu || "", auteur: a.auteur || "", categorie: a.categorie || "actualite", statut: a.statut || "brouillon" });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateActualite.mutate({ id: editing.id, data: form });
    } else {
      createActualite.mutate(form);
    }
  };

  const filtered = (actualites || []).filter((a: any) =>
    !filtre || a.titre?.toLowerCase().includes(filtre.toLowerCase()) || a.auteur?.toLowerCase().includes(filtre.toLowerCase())
  );


  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={TITRE_PAGE}>Actualités & Événements</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Gérez les publications et communications d'AJIHAD.</p>
          </div>
          <button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:bg-[#042C53] transition-colors">
            <Plus className="w-4 h-4" /> Nouvelle actualité
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className={TITRE_MODALE}>{editing ? "Modifier l'actualité" : "Nouvelle actualité"}</h2>
              <button type="button" onClick={closeForm} aria-label="Fermer le formulaire" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><X className="w-4 h-4 text-gray-500" aria-hidden="true" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Titre *</label>
                  <input required value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none" placeholder="Titre de l'actualité" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Slug (URL) *</label>
                  <input required value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none font-mono" placeholder="mon-article-2026" />
                </div>
                <div>
                  <label htmlFor="actualite-categorie" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie</label>
                  <select id="actualite-categorie" value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value as any }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none">
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="actualite-statut" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
                  <select id="actualite-statut" value={form.statut} onChange={e => setForm(f => ({ ...f, statut: e.target.value as any }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none">
                    {STATUTS.map(s => <option key={s} value={s}>{libelleStatut(s)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Auteur</label>
                  <input value={form.auteur} onChange={e => setForm(f => ({ ...f, auteur: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none" placeholder="Nom de l'auteur" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Résumé</label>
                <textarea rows={2} value={form.resume} onChange={e => setForm(f => ({ ...f, resume: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none resize-none" placeholder="Bref résumé visible dans les listes..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Contenu complet</label>
                <textarea rows={6} value={form.contenu} onChange={e => setForm(f => ({ ...f, contenu: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none resize-none" placeholder="Contenu complet de l'article..." />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={createActualite.isPending || updateActualite.isPending}
                  className="flex items-center gap-2 px-5 py-2 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:bg-[#042C53] transition-colors disabled:opacity-60">
                  <Check className="w-4 h-4" /> {editing ? "Enregistrer les modifications" : "Créer l'actualité"}
                </button>
                <button type="button" onClick={closeForm} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Annuler</button>
              </div>
            </form>
          </div>
        )}

        {/* Filtre */}
        <div className="mb-4">
          <input value={filtre} onChange={e => setFiltre(e.target.value)} placeholder="Rechercher par titre ou auteur..."
            className="w-full sm:w-80 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none" />
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {!filtered || filtered.length === 0 ? (
            <EtatVide
              icone={FileText}
              raison={filtre ? "filtre" : "vide"}
              titre={filtre ? "Aucun résultat" : "Aucune actualité"}
              description={filtre
                ? "Aucune actualité ne correspond à votre recherche."
                : "Publiez votre première actualité pour informer vos membres et visiteurs."}
              action={filtre
                ? { libelle: "Effacer la recherche", onClick: () => setFiltre("") }
                : { libelle: "Créer une actualité", onClick: () => { setEditing(null); setForm(emptyForm); setShowForm(true); } }}
            />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Titre</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide hidden md:table-cell">Catégorie</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide hidden lg:table-cell">Auteur</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Statut</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide hidden lg:table-cell">Date</th>
                  <th className="px-5 py-3 text-right font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((a: any) => {
                  const cat = CATEGORIES.find(c => c.value === a.categorie);
                  return (
                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-medium text-gray-900 dark:text-white line-clamp-1">{a.titre}</div>
                        <div className="text-gray-400 dark:text-gray-500 text-xs font-mono mt-0.5">{a.slug}</div>
                      </td>
                      <td className="px-5 py-3 hidden md:table-cell">
                        <span className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full">{cat?.label || a.categorie}</span>
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell">{a.auteur || "—"}</td>
                      <td className="px-5 py-3">
                        <Pastille ton={tonDuStatut(a.statut)}>{libelleStatut(a.statut)}</Pastille>
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs hidden lg:table-cell">
                        {a.updatedAt ? new Date(a.updatedAt).toLocaleDateString("fr-HT") : "—"}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => startEdit(a)} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-[#185FA5] transition-colors" aria-label="Modifier">
                          <Pencil className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-3">{filtered.length} actualité{filtered.length !== 1 ? "s" : ""} affichée{filtered.length !== 1 ? "s" : ""}</p>
      </div>
    </AdminLayout>
  );
}
