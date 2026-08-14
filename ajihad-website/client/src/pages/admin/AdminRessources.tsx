import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Check, FileText, Download, Eye, EyeOff } from "lucide-react";
import Pastille, { libelleStatut, tonDeCategorie, tonDuStatut } from "@/components/Pastille";
import EtatVide from "@/components/EtatVide";
import { TITRE_MODALE, TITRE_PAGE } from "@/lib/typographie";

const CATEGORIES = [
  { value: "rapport_annuel", label: "Rapport annuel" },
  { value: "rapport_activites", label: "Rapport d'activités" },
  { value: "institutionnel", label: "Institutionnel" },
  { value: "resume_projet", label: "Résumé de projet" },
  { value: "note_conceptuelle", label: "Note conceptuelle" },
  { value: "presentation", label: "Présentation" },
  { value: "formulaire", label: "Formulaire" },
  { value: "publication", label: "Publication" },
  { value: "communique", label: "Communiqué" },
  { value: "ressource_pedagogique", label: "Ressource pédagogique" },
] as const;

const VISIBILITES = [
  { value: "public", label: "Public" },
  { value: "membres", label: "Membres" },
  { value: "gestionnaires", label: "Gestionnaires" },
  { value: "admin", label: "Admin" },
] as const;

const STATUTS = ["brouillon", "valide", "archive"] as const;

const TYPES_FICHIER = ["PDF", "DOCX", "XLSX", "PPTX"];

const emptyForm = {
  titre: "",
  description: "",
  categorie: "institutionnel" as (typeof CATEGORIES)[number]["value"],
  fileUrl: "",
  fileType: "PDF",
  langue: "fr",
  version: "",
  visibilite: "public" as (typeof VISIBILITES)[number]["value"],
  projetId: "",
  dateDocument: "",
  dateExpiration: "",
  statut: "brouillon" as (typeof STATUTS)[number],
  estPublic: false,
};

const toDateInput = (v: any) => (v ? new Date(v).toISOString().slice(0, 10) : "");

export default function AdminRessources() {
  const { data: documents, refetch, isLoading } = trpc.admin.documents.list.useQuery();
  const { data: projets } = trpc.admin.projets.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [recherche, setRecherche] = useState("");
  const [filtreCategorie, setFiltreCategorie] = useState("");
  const [filtreVisibilite, setFiltreVisibilite] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("");

  const closeForm = () => { setShowForm(false); setEditing(null); setForm(emptyForm); };

  const createDocument = trpc.admin.documents.create.useMutation({
    onSuccess: () => { toast.success("Document créé avec succès."); refetch(); closeForm(); },
    onError: (err: any) => toast.error(`Erreur : ${err.message}`),
  });
  const updateDocument = trpc.admin.documents.update.useMutation({
    onSuccess: () => { toast.success("Document mis à jour."); refetch(); closeForm(); },
    onError: (err: any) => toast.error(`Erreur : ${err.message}`),
  });
  const deleteDocument = trpc.admin.documents.delete.useMutation({
    onSuccess: () => { toast.success("Document supprimé."); refetch(); },
    onError: (err: any) => toast.error(`Erreur : ${err.message}`),
  });
  const togglePublic = trpc.admin.documents.togglePublic.useMutation({
    onSuccess: () => { toast.success("Visibilité mise à jour."); refetch(); },
    onError: (err: any) => toast.error(`Erreur : ${err.message}`),
  });

  const startEdit = (d: any) => {
    setEditing(d);
    setForm({
      titre: d.titre || "", description: d.description || "",
      categorie: d.categorie || "institutionnel", fileUrl: d.fileUrl || "",
      fileType: d.fileType || "PDF", langue: d.langue || "fr", version: d.version || "",
      visibilite: d.visibilite || "public", projetId: d.projetId ? String(d.projetId) : "",
      dateDocument: toDateInput(d.dateDocument), dateExpiration: toDateInput(d.dateExpiration),
      statut: d.statut || "brouillon", estPublic: Boolean(d.estPublic),
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      titre: form.titre,
      description: form.description || undefined,
      categorie: form.categorie,
      fileUrl: form.fileUrl || undefined,
      fileType: form.fileType || undefined,
      langue: form.langue || "fr",
      version: form.version || undefined,
      visibilite: form.visibilite,
      projetId: form.projetId ? Number(form.projetId) : undefined,
      dateDocument: form.dateDocument || undefined,
      dateExpiration: form.dateExpiration || undefined,
      statut: form.statut,
      estPublic: form.estPublic,
    };
    if (editing) updateDocument.mutate({ id: editing.id, data: payload });
    else createDocument.mutate(payload);
  };

  const handleDelete = (d: any) => {
    if (window.confirm(`Supprimer définitivement le document « ${d.titre} » ?`)) {
      deleteDocument.mutate({ id: d.id });
    }
  };

  const filtered = (documents || []).filter((d: any) => {
    if (recherche && !d.titre?.toLowerCase().includes(recherche.toLowerCase())) return false;
    if (filtreCategorie && d.categorie !== filtreCategorie) return false;
    if (filtreVisibilite && d.visibilite !== filtreVisibilite) return false;
    if (filtreStatut && d.statut !== filtreStatut) return false;
    return true;
  });

  const getCategorie = (v: string) => CATEGORIES.find(c => c.value === v);
  const getVisibilite = (v: string) => VISIBILITES.find(x => x.value === v) ?? VISIBILITES[0];

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={TITRE_PAGE}>Documents & Ressources</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {filtered.length} document{filtered.length !== 1 ? "s" : ""} affiché{filtered.length !== 1 ? "s" : ""}
              {documents && filtered.length !== documents.length ? ` sur ${documents.length}` : ""}
            </p>
          </div>
          <button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:bg-[#042C53] transition-colors self-start">
            <Plus className="w-4 h-4" /> Nouveau document
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className={TITRE_MODALE}>
                {editing ? "Modifier le document" : "Nouveau document"}
              </h2>
              <button onClick={closeForm} aria-label="Fermer le formulaire"
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2 lg:col-span-3">
                  <label htmlFor="doc-titre" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Titre *</label>
                  <input id="doc-titre" required value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
                    className={inputClass} placeholder="Rapport annuel 2025" />
                </div>
                <div>
                  <label htmlFor="doc-cat" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie</label>
                  <select id="doc-cat" value={form.categorie} onChange={e => setForm(f => ({ ...f, categorie: e.target.value as any }))} className={inputClass}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="doc-vis" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Visibilité</label>
                  <select id="doc-vis" value={form.visibilite} onChange={e => setForm(f => ({ ...f, visibilite: e.target.value as any }))} className={inputClass}>
                    {VISIBILITES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="doc-statut" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
                  <select id="doc-statut" value={form.statut} onChange={e => setForm(f => ({ ...f, statut: e.target.value as any }))} className={inputClass}>
                    {STATUTS.map(s => <option key={s} value={s}>{libelleStatut(s)}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="doc-url" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">URL du fichier</label>
                  <input id="doc-url" type="url" value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))}
                    className={inputClass} placeholder="https://…/document.pdf" />
                </div>
                <div>
                  <label htmlFor="doc-type" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type de fichier</label>
                  <select id="doc-type" value={form.fileType} onChange={e => setForm(f => ({ ...f, fileType: e.target.value }))} className={inputClass}>
                    {TYPES_FICHIER.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="doc-langue" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Langue</label>
                  <select id="doc-langue" value={form.langue} onChange={e => setForm(f => ({ ...f, langue: e.target.value }))} className={inputClass}>
                    <option value="fr">Français</option>
                    <option value="ht">Créole</option>
                    <option value="en">Anglais</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="doc-version" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Version</label>
                  <input id="doc-version" value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))}
                    className={inputClass} placeholder="v1.0 – 2025" />
                </div>
                <div>
                  <label htmlFor="doc-projet" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Projet associé</label>
                  <select id="doc-projet" value={form.projetId} onChange={e => setForm(f => ({ ...f, projetId: e.target.value }))} className={inputClass}>
                    <option value="">Aucun</option>
                    {(projets || []).map((p: any) => <option key={p.id} value={p.id}>{p.titre}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="doc-date" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date du document</label>
                  <input id="doc-date" type="date" value={form.dateDocument} onChange={e => setForm(f => ({ ...f, dateDocument: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="doc-exp" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date d'expiration</label>
                  <input id="doc-exp" type="date" value={form.dateExpiration} onChange={e => setForm(f => ({ ...f, dateExpiration: e.target.value }))} className={inputClass} />
                </div>
                <div className="flex items-end">
                  <label htmlFor="doc-public" className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input id="doc-public" type="checkbox" checked={form.estPublic}
                      onChange={e => setForm(f => ({ ...f, estPublic: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-[#185FA5]" />
                    Visible publiquement
                  </label>
                </div>
              </div>
              <div>
                <label htmlFor="doc-desc" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea id="doc-desc" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className={`${inputClass} resize-none`} placeholder="Contenu et objet du document…" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={createDocument.isPending || updateDocument.isPending}
                  className="flex items-center gap-2 px-5 py-2 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:bg-[#042C53] transition-colors disabled:opacity-60">
                  <Check className="w-4 h-4" /> {editing ? "Enregistrer" : "Créer le document"}
                </button>
                <button type="button" onClick={closeForm}
                  className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filtres */}
        <div className="flex flex-wrap gap-3">
          <input value={recherche} onChange={e => setRecherche(e.target.value)} type="search" aria-label="Rechercher un document par titre"
            placeholder="Rechercher par titre…"
            className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#185FA5] outline-none" />
          <select value={filtreCategorie} onChange={e => setFiltreCategorie(e.target.value)} aria-label="Filtrer par catégorie"
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-[#185FA5] outline-none">
            <option value="">Toutes les catégories</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select value={filtreVisibilite} onChange={e => setFiltreVisibilite(e.target.value)} aria-label="Filtrer par visibilité"
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-[#185FA5] outline-none">
            <option value="">Toutes les visibilités</option>
            {VISIBILITES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
          </select>
          <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)} aria-label="Filtrer par statut"
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-[#185FA5] outline-none">
            <option value="">Tous les statuts</option>
            {STATUTS.map(s => <option key={s} value={s}>{libelleStatut(s)}</option>)}
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
              icone={FileText}
              raison={recherche || filtreCategorie || filtreVisibilite || filtreStatut ? "filtre" : "vide"}
              titre={recherche || filtreCategorie || filtreVisibilite || filtreStatut ? "Aucun résultat" : "Aucun document"}
              description={recherche || filtreCategorie || filtreVisibilite || filtreStatut
                ? "Aucun document ne correspond aux critères sélectionnés."
                : "Déposez ici vos statuts, rapports et documents de référence, en choisissant qui peut les consulter."}
              action={recherche || filtreCategorie || filtreVisibilite || filtreStatut
                ? { libelle: "Réinitialiser les filtres", onClick: () => { setRecherche(""); setFiltreCategorie(""); setFiltreVisibilite(""); setFiltreStatut(""); } }
                : { libelle: "Ajouter un document", onClick: () => { setEditing(null); setForm(emptyForm); setShowForm(true); } }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Titre</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide hidden md:table-cell">Catégorie</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Visibilité</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide hidden lg:table-cell">Version</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Statut</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide hidden lg:table-cell">Date</th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filtered.map((d: any) => {
                    const vis = getVisibilite(d.visibilite);
                    return (
                      <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-5 py-3">
                          <div className="font-medium text-gray-900 dark:text-white line-clamp-1">{d.titre}</div>
                          <div className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">{d.fileType || "—"} · {d.langue?.toUpperCase() || "FR"}</div>
                        </td>
                        <td className="px-5 py-3 hidden md:table-cell">
                          <Pastille ton="neutre">{getCategorie(d.categorie)?.label || d.categorie}</Pastille>
                        </td>
                        <td className="px-5 py-3">
                          <Pastille ton={tonDeCategorie(d.visibilite)}>{vis.label}</Pastille>
                        </td>
                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs hidden lg:table-cell">{d.version || "—"}</td>
                        <td className="px-5 py-3">
                          <Pastille ton={tonDuStatut(d.statut)}>{libelleStatut(d.statut)}</Pastille>
                        </td>
                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs hidden lg:table-cell">
                          {d.dateDocument ? new Date(d.dateDocument).toLocaleDateString("fr-HT") : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {d.fileUrl && (
                              <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" aria-label={`Ouvrir ${d.titre}`}
                                className="p-2 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 text-[#2b8f8f] dark:text-[#4DBFBF] transition-colors">
                                <Download className="w-4 h-4" />
                              </a>
                            )}
                            <button onClick={() => togglePublic.mutate({ id: d.id, estPublic: !d.estPublic })}
                              aria-label={d.estPublic ? `Dépublier ${d.titre}` : `Publier ${d.titre}`}
                              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors">
                              {d.estPublic ? <Eye className="w-4 h-4 text-[#185FA5]" /> : <EyeOff className="w-4 h-4" />}
                            </button>
                            <button onClick={() => startEdit(d)} aria-label={`Modifier ${d.titre}`}
                              className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-[#185FA5] transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(d)} aria-label={`Supprimer ${d.titre}`}
                              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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
    </AdminLayout>
  );
}
