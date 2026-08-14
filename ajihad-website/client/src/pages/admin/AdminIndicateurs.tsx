import { useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";
import { Plus, Pencil, BarChart3, X, Check, TrendingUp } from "lucide-react";
import Pastille, { libelleStatut, tonDuStatut } from "@/components/Pastille";
import EtatVide from "@/components/EtatVide";
import { TITRE_CARTE, TITRE_MODALE, TITRE_PAGE } from "@/lib/typographie";

const AXES = [
  "Éducation & Formation", "Leadership & Gouvernance", "Environnement",
  "Innovation Numérique", "Développement Communautaire", "Inclusion & Équité",
];

const STATUTS_IND = ["brouillon", "a_verifier", "valide"];

const emptyForm = {
  nom: "", valeur: "", unite: "", periode: "", zone: "",
  axeIntervention: "", source: "", estPublic: false,
  statut: "brouillon" as const,
};

export default function AdminIndicateurs() {
  const { data: indicateurs, refetch } = trpc.admin.indicateurs.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  const [filtreAxe, setFiltreAxe] = useState("");

  const createIndicateur = trpc.admin.indicateurs.create.useMutation({
    onSuccess: () => { toast.success("Indicateur créé."); refetch(); closeForm(); },
    onError: (err: any) => toast.error(`Erreur : ${err.message}`),
  });
  const updateIndicateur = trpc.admin.indicateurs.update.useMutation({
    onSuccess: () => { toast.success("Indicateur mis à jour."); refetch(); closeForm(); },
    onError: (err: any) => toast.error(`Erreur : ${err.message}`),
  });

  const closeForm = () => { setShowForm(false); setEditing(null); setForm(emptyForm); };

  const startEdit = (ind: any) => {
    setEditing(ind);
    setForm({ nom: ind.nom || "", valeur: ind.valeur || "", unite: ind.unite || "", periode: ind.periode || "", zone: ind.zone || "", axeIntervention: ind.axeIntervention || "", source: ind.source || "", estPublic: ind.estPublic || false, statut: ind.statut || "brouillon" });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateIndicateur.mutate({ id: editing.id, data: form });
    } else {
      createIndicateur.mutate(form);
    }
  };

  const filtered = (indicateurs || []).filter((ind: any) =>
    !filtreAxe || ind.axeIntervention === filtreAxe
  );


  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={TITRE_PAGE}>Indicateurs d'impact</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Suivez et publiez les indicateurs de performance d'AJIHAD.</p>
          </div>
          <button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:bg-[#042C53] transition-colors">
            <Plus className="w-4 h-4" /> Nouvel indicateur
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className={TITRE_MODALE}>{editing ? "Modifier l'indicateur" : "Nouvel indicateur"}</h2>
              <button type="button" onClick={closeForm} aria-label="Fermer le formulaire" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"><X className="w-4 h-4 text-gray-500" aria-hidden="true" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="sm:col-span-2 lg:col-span-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nom de l'indicateur *</label>
                  <input required value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none" placeholder="Ex: Jeunes formés par PROJEFA 2026" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Valeur</label>
                  <input value={form.valeur} onChange={e => setForm(f => ({ ...f, valeur: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none" placeholder="Ex: 250" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Unité</label>
                  <input value={form.unite} onChange={e => setForm(f => ({ ...f, unite: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none" placeholder="jeunes, %, projets..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Période</label>
                  <input value={form.periode} onChange={e => setForm(f => ({ ...f, periode: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none" placeholder="2025–2026" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Zone géographique</label>
                  <input value={form.zone} onChange={e => setForm(f => ({ ...f, zone: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none" placeholder="Artibonite, National..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Axe d'intervention</label>
                  <select value={form.axeIntervention} onChange={e => setForm(f => ({ ...f, axeIntervention: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none">
                    <option value="">Sélectionner un axe</option>
                    {AXES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Source</label>
                  <input value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none" placeholder="Rapport interne, Enquête..." />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
                  <select value={form.statut} onChange={e => setForm(f => ({ ...f, statut: e.target.value as any }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none">
                    {STATUTS_IND.map(s => <option key={s} value={s}>{libelleStatut(s)}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input type="checkbox" id="estPublic" checked={form.estPublic} onChange={e => setForm(f => ({ ...f, estPublic: e.target.checked }))}
                    className="w-4 h-4 accent-[#185FA5]" />
                  <label htmlFor="estPublic" className="text-sm text-gray-700 dark:text-gray-300">Visible publiquement</label>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={createIndicateur.isPending || updateIndicateur.isPending}
                  className="flex items-center gap-2 px-5 py-2 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:bg-[#042C53] transition-colors disabled:opacity-60">
                  <Check className="w-4 h-4" /> {editing ? "Enregistrer" : "Créer l'indicateur"}
                </button>
                <button type="button" onClick={closeForm} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">Annuler</button>
              </div>
            </form>
          </div>
        )}

        {/* Filtre axe */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button onClick={() => setFiltreAxe("")} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!filtreAxe ? "bg-[#185FA5] text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"}`}>Tous</button>
          {AXES.map(axe => (
            <button key={axe} onClick={() => setFiltreAxe(axe)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filtreAxe === axe ? "bg-[#185FA5] text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"}`}>{axe}</button>
          ))}
        </div>

        {/* Grille d'indicateurs */}
        {!filtered || filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <EtatVide
              icone={BarChart3}
              raison={filtreAxe ? "filtre" : "vide"}
              titre={filtreAxe ? "Aucun indicateur sur cet axe" : "Aucun indicateur"}
              description={filtreAxe
                ? `Aucun indicateur n'est rattaché à l'axe « ${filtreAxe} ».`
                : "Les indicateurs mesurent l'impact de vos actions et alimentent les chiffres affichés publiquement."}
              action={filtreAxe
                ? { libelle: "Voir tous les axes", onClick: () => setFiltreAxe("") }
                : { libelle: "Créer un indicateur", onClick: () => { setEditing(null); setForm(emptyForm); setShowForm(true); } }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((ind: any) => {
              return (
                <div key={ind.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-4 h-4 text-[#185FA5]" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Pastille ton={tonDuStatut(ind.statut)} taille="sm">{libelleStatut(ind.statut)}</Pastille>
                      {ind.estPublic && <Pastille ton="accent" taille="sm">Public</Pastille>}
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="text-2xl font-extrabold text-[#185FA5]">{ind.valeur || "—"}<span className="text-base font-medium text-gray-500 ml-1">{ind.unite}</span></div>
                    <h3 className={`${TITRE_CARTE} mt-1 leading-tight`}>{ind.nom}</h3>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                    {ind.axeIntervention && <div>Axe : {ind.axeIntervention}</div>}
                    {ind.periode && <div>Période : {ind.periode}</div>}
                    {ind.zone && <div>Zone : {ind.zone}</div>}
                  </div>
                  <button onClick={() => startEdit(ind)} className="mt-3 flex items-center gap-1.5 text-xs text-[#185FA5] font-medium hover:underline">
                    <Pencil className="w-3 h-3" /> Modifier
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <p className="text-gray-400 dark:text-gray-500 text-xs mt-3">{filtered.length} indicateur{filtered.length !== 1 ? "s" : ""}</p>
      </div>
    </AdminLayout>
  );
}
