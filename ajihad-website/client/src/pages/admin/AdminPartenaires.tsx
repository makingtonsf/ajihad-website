import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X, Check, Handshake, ExternalLink, Eye, EyeOff } from "lucide-react";
import Pastille, { libelleStatut, tonDeCategorie, tonDuStatut } from "@/components/Pastille";
import EtatVide from "@/components/EtatVide";
import { TITRE_CARTE, TITRE_MODALE, TITRE_PAGE } from "@/lib/typographie";

const TYPES = [
  { value: "bailleur", label: "Bailleur" },
  { value: "technique", label: "Technique" },
  { value: "institutionnel", label: "Institutionnel" },
  { value: "local", label: "Local" },
  { value: "diaspora", label: "Diaspora" },
  { value: "entreprise", label: "Entreprise" },
] as const;

const STATUTS = ["brouillon", "valide", "archive"] as const;

const emptyForm = {
  nom: "",
  type: "local" as (typeof TYPES)[number]["value"],
  description: "",
  logoUrl: "",
  siteWeb: "",
  statut: "brouillon" as (typeof STATUTS)[number],
  estPublic: false,
};

const initiales = (nom: string) =>
  nom.split(/\s+/).filter(Boolean).slice(0, 2).map(m => m[0]).join("").toUpperCase() || "?";

export default function AdminPartenaires() {
  const { data: partenaires, refetch, isLoading } = trpc.admin.partenaires.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [filtreType, setFiltreType] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("");

  const closeForm = () => { setShowForm(false); setEditing(null); setForm(emptyForm); };

  const createPartenaire = trpc.admin.partenaires.create.useMutation({
    onSuccess: () => { toast.success("Partenaire créé avec succès."); refetch(); closeForm(); },
    onError: (err: any) => toast.error(`Erreur : ${err.message}`),
  });
  const updatePartenaire = trpc.admin.partenaires.update.useMutation({
    onSuccess: () => { toast.success("Partenaire mis à jour."); refetch(); closeForm(); },
    onError: (err: any) => toast.error(`Erreur : ${err.message}`),
  });
  const deletePartenaire = trpc.admin.partenaires.delete.useMutation({
    onSuccess: () => { toast.success("Partenaire supprimé."); refetch(); },
    onError: (err: any) => toast.error(`Erreur : ${err.message}`),
  });
  const togglePublic = trpc.admin.partenaires.togglePublic.useMutation({
    onSuccess: () => { toast.success("Visibilité mise à jour."); refetch(); },
    onError: (err: any) => toast.error(`Erreur : ${err.message}`),
  });

  const startEdit = (p: any) => {
    setEditing(p);
    setForm({
      nom: p.nom || "", type: p.type || "local", description: p.description || "",
      logoUrl: p.logoUrl || "", siteWeb: p.siteWeb || "",
      statut: p.statut || "brouillon", estPublic: Boolean(p.estPublic),
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      description: form.description || undefined,
      logoUrl: form.logoUrl || undefined,
      siteWeb: form.siteWeb || undefined,
    };
    if (editing) updatePartenaire.mutate({ id: editing.id, data: payload });
    else createPartenaire.mutate(payload);
  };

  const handleDelete = (p: any) => {
    if (window.confirm(`Supprimer définitivement le partenaire « ${p.nom} » ?`)) {
      deletePartenaire.mutate({ id: p.id });
    }
  };

  const filtered = (partenaires || []).filter((p: any) =>
    (!filtreType || p.type === filtreType) && (!filtreStatut || p.statut === filtreStatut)
  );

  const getType = (v: string) => TYPES.find(t => t.value === v) ?? TYPES[3];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={TITRE_PAGE}>Partenaires</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {filtered.length} partenaire{filtered.length !== 1 ? "s" : ""} affiché{filtered.length !== 1 ? "s" : ""}
              {partenaires && filtered.length !== partenaires.length ? ` sur ${partenaires.length}` : ""}
            </p>
          </div>
          <button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:bg-[#042C53] transition-colors self-start">
            <Plus className="w-4 h-4" /> Nouveau partenaire
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className={TITRE_MODALE}>
                {editing ? "Modifier le partenaire" : "Nouveau partenaire"}
              </h2>
              <button onClick={closeForm} aria-label="Fermer le formulaire"
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="part-nom" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nom *</label>
                  <input id="part-nom" required value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none"
                    placeholder="Nom de l'organisation" />
                </div>
                <div>
                  <label htmlFor="part-type" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <select id="part-type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none">
                    {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="part-logo" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">URL du logo</label>
                  <input id="part-logo" type="url" value={form.logoUrl} onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none"
                    placeholder="https://…/logo.png" />
                </div>
                <div>
                  <label htmlFor="part-site" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Site web</label>
                  <input id="part-site" type="url" value={form.siteWeb} onChange={e => setForm(f => ({ ...f, siteWeb: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none"
                    placeholder="https://exemple.org" />
                </div>
                <div>
                  <label htmlFor="part-statut" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
                  <select id="part-statut" value={form.statut} onChange={e => setForm(f => ({ ...f, statut: e.target.value as any }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none">
                    {STATUTS.map(s => <option key={s} value={s}>{libelleStatut(s)}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <label htmlFor="part-public" className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input id="part-public" type="checkbox" checked={form.estPublic}
                      onChange={e => setForm(f => ({ ...f, estPublic: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-[#185FA5]" />
                    Visible publiquement
                  </label>
                </div>
              </div>
              <div>
                <label htmlFor="part-desc" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea id="part-desc" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none resize-none"
                  placeholder="Nature de la collaboration avec AJIHAD…" />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={createPartenaire.isPending || updatePartenaire.isPending}
                  className="flex items-center gap-2 px-5 py-2 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:bg-[#042C53] transition-colors disabled:opacity-60">
                  <Check className="w-4 h-4" /> {editing ? "Enregistrer" : "Créer le partenaire"}
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
          <select value={filtreType} onChange={e => setFiltreType(e.target.value)} aria-label="Filtrer par type"
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-[#185FA5] outline-none">
            <option value="">Tous les types</option>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)} aria-label="Filtrer par statut"
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-[#185FA5] outline-none">
            <option value="">Tous les statuts</option>
            {STATUTS.map(s => <option key={s} value={s}>{libelleStatut(s)}</option>)}
          </select>
        </div>

        {/* Grille */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2].map(i => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2" />
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <EtatVide
              icone={Handshake}
              raison={filtreType || filtreStatut ? "filtre" : "vide"}
              titre={filtreType || filtreStatut ? "Aucun résultat" : "Aucun partenaire"}
              description={filtreType || filtreStatut
                ? "Aucun partenaire ne correspond aux critères sélectionnés."
                : "Référencez vos partenaires ici : ceux que vous marquez « public » s'affichent sur le site."}
              action={filtreType || filtreStatut
                ? { libelle: "Réinitialiser les filtres", onClick: () => { setFiltreType(""); setFiltreStatut(""); } }
                : { libelle: "Ajouter un partenaire", onClick: () => { setEditing(null); setForm(emptyForm); setShowForm(true); } }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((p: any) => {
              const type = getType(p.type);
              return (
                <div key={p.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 flex flex-col">
                  <div className="flex items-start gap-4 mb-4">
                    {p.logoUrl ? (
                      <img src={p.logoUrl} alt={`Logo ${p.nom}`} className="w-14 h-14 rounded-xl object-contain bg-[#F6F8FB] dark:bg-gray-700 p-1.5 flex-shrink-0"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-[#185FA5]/10 text-[#185FA5] flex items-center justify-center font-extrabold text-lg flex-shrink-0">
                        {initiales(p.nom)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className={`${TITRE_CARTE} truncate`}>{p.nom}</h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        <Pastille ton={tonDeCategorie(p.type)} taille="sm">{type.label}</Pastille>
                        <Pastille ton={tonDuStatut(p.statut)} taille="sm">{libelleStatut(p.statut)}</Pastille>
                        {p.estPublic && (
                          <Pastille ton="accent" taille="sm">Public</Pastille>
                        )}
                      </div>
                    </div>
                  </div>

                  {p.description && (
                    <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed line-clamp-3 mb-3 flex-1">{p.description}</p>
                  )}

                  {p.siteWeb && (
                    <a href={p.siteWeb} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#185FA5] dark:text-blue-400 text-xs font-semibold hover:underline mb-4">
                      <ExternalLink className="w-3 h-3" /> Visiter le site
                    </a>
                  )}

                  <div className="flex items-center gap-1 pt-3 border-t border-gray-100 dark:border-gray-700 mt-auto">
                    <button onClick={() => startEdit(p)} aria-label={`Modifier ${p.nom}`}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-[#185FA5] text-xs font-semibold transition-colors">
                      <Pencil className="w-3.5 h-3.5" /> Modifier
                    </button>
                    <button onClick={() => togglePublic.mutate({ id: p.id, estPublic: !p.estPublic })}
                      aria-label={p.estPublic ? `Dépublier ${p.nom}` : `Publier ${p.nom}`}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20 text-[#2b8f8f] dark:text-[#4DBFBF] text-xs font-semibold transition-colors">
                      {p.estPublic ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      {p.estPublic ? "Dépublier" : "Publier"}
                    </button>
                    <button onClick={() => handleDelete(p)} aria-label={`Supprimer ${p.nom}`}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 text-xs font-semibold transition-colors ml-auto">
                      <Trash2 className="w-3.5 h-3.5" /> Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
