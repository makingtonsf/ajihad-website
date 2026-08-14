import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { FolderOpen, Plus, Edit2, Trash2, X, Save } from "lucide-react";
import EtatVide from "@/components/EtatVide";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";
import { TITRE_MODALE, TITRE_PAGE } from "@/lib/typographie";

const STATUTS = [
  { value: "brouillon", label: "Brouillon" },
  { value: "en_preparation", label: "En préparation" },
  { value: "en_cours", label: "En cours" },
  { value: "termine", label: "Terminé" },
  { value: "archive", label: "Archivé" },
] as const;

const TYPES = [
  { value: "formation", label: "Formation" },
  { value: "leadership", label: "Leadership" },
  { value: "sensibilisation", label: "Sensibilisation" },
  { value: "communautaire", label: "Communautaire" },
  { value: "environnement", label: "Environnement" },
  { value: "culture", label: "Culture" },
  { value: "innovation", label: "Innovation" },
  { value: "inclusion", label: "Inclusion" },
  { value: "conference", label: "Conférence" },
  { value: "accompagnement", label: "Accompagnement" },
] as const;

const emptyForm = {
  slug: "",
  titre: "",
  resume: "",
  contexte: "",
  objectifGeneral: "",
  statut: "brouillon" as (typeof STATUTS)[number]["value"],
  type: "formation" as (typeof TYPES)[number]["value"],
  axeIntervention: "",
  zone: "",
  localisation: "",
  duree: "",
  annee: "",
  publicCible: "",
  beneficiaires: "",
  estProjetPhare: false,
  estProjefa: false,
};

const slugifier = (valeur: string) =>
  valeur
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function AdminProjets() {
  const { data: projets, refetch } = trpc.admin.projets.list.useQuery();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(emptyForm);
  // Tant que l'utilisateur n'a pas édité le slug manuellement, il suit le titre.
  const [slugManuel, setSlugManuel] = useState(false);

  const closeForm = () => { setShowForm(false); setEditing(null); setForm(emptyForm); setSlugManuel(false); };

  const createProjet = trpc.admin.projets.create.useMutation({
    onSuccess: () => { toast.success("Projet créé."); refetch(); closeForm(); },
    onError: (err: any) => toast.error(`Erreur : ${err.message}`),
  });
  const updateProjet = trpc.admin.projets.update.useMutation({
    onSuccess: () => { toast.success("Projet mis à jour."); refetch(); closeForm(); },
    onError: (err: any) => toast.error(`Erreur : ${err.message}`),
  });
  const deleteProjet = trpc.admin.projets.delete.useMutation({
    onSuccess: () => { toast.success("Projet supprimé."); refetch(); },
    onError: (err: any) => toast.error(`Erreur : ${err.message}`),
  });

  const setTitre = (titre: string) =>
    setForm(p => ({ ...p, titre, slug: slugManuel ? p.slug : slugifier(titre) }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      slug: form.slug,
      titre: form.titre,
      resume: form.resume || undefined,
      contexte: form.contexte || undefined,
      objectifGeneral: form.objectifGeneral || undefined,
      statut: form.statut,
      type: form.type,
      axeIntervention: form.axeIntervention || undefined,
      zone: form.zone || undefined,
      localisation: form.localisation || undefined,
      duree: form.duree || undefined,
      annee: form.annee ? Number(form.annee) : undefined,
      publicCible: form.publicCible || undefined,
      beneficiaires: form.beneficiaires || undefined,
      estProjetPhare: form.estProjetPhare,
      estProjefa: form.estProjefa,
    };
    if (editing) updateProjet.mutate({ id: editing.id, data: payload });
    else createProjet.mutate(payload);
  };

  const startEdit = (p: any) => {
    setEditing(p);
    setSlugManuel(true);
    setForm({
      slug: p.slug || "", titre: p.titre || "", resume: p.resume || "",
      contexte: p.contexte || "", objectifGeneral: p.objectifGeneral || "",
      statut: p.statut || "brouillon", type: p.type || "formation",
      axeIntervention: p.axeIntervention || "", zone: p.zone || "",
      localisation: p.localisation || "", duree: p.duree || "",
      annee: p.annee ? String(p.annee) : "", publicCible: p.publicCible || "",
      beneficiaires: p.beneficiaires || "",
      estProjetPhare: Boolean(p.estProjetPhare), estProjefa: Boolean(p.estProjefa),
    });
    setShowForm(true);
  };

  const handleDelete = (p: any) => {
    if (window.confirm(`Supprimer définitivement le projet « ${p.titre} » ?`)) {
      deleteProjet.mutate({ id: p.id });
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none text-sm";
  const labelClass = "block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1";

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={TITRE_PAGE}>Projets</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{projets?.length ?? 0} projet(s)</p>
          </div>
          <button onClick={() => { setEditing(null); setForm(emptyForm); setSlugManuel(false); setShowForm(true); }}
            className="btn-primary-ajihad py-2 px-4 text-sm">
            <Plus className="w-4 h-4" /> Nouveau projet
          </button>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className={TITRE_MODALE}>{editing ? "Modifier le projet" : "Nouveau projet"}</h2>
              <button onClick={closeForm} aria-label="Fermer le formulaire"
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="proj-titre" className={labelClass}>Titre *</label>
                <input id="proj-titre" type="text" required value={form.titre}
                  onChange={e => setTitre(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label htmlFor="proj-slug" className={labelClass}>Slug (URL) *</label>
                <input id="proj-slug" type="text" required value={form.slug}
                  onChange={e => { setSlugManuel(true); setForm(p => ({ ...p, slug: slugifier(e.target.value) })); }}
                  className={`${inputClass} font-mono`} placeholder="mon-projet-2026" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="proj-resume" className={labelClass}>Résumé</label>
                <textarea id="proj-resume" rows={2} value={form.resume}
                  onChange={e => setForm(p => ({ ...p, resume: e.target.value }))}
                  className={`${inputClass} resize-none`} placeholder="Présentation courte affichée dans les listes." />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="proj-contexte" className={labelClass}>Contexte</label>
                <textarea id="proj-contexte" rows={3} value={form.contexte}
                  onChange={e => setForm(p => ({ ...p, contexte: e.target.value }))}
                  className={`${inputClass} resize-none`} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="proj-objectif" className={labelClass}>Objectif général</label>
                <textarea id="proj-objectif" rows={2} value={form.objectifGeneral}
                  onChange={e => setForm(p => ({ ...p, objectifGeneral: e.target.value }))}
                  className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label htmlFor="proj-statut" className={labelClass}>Statut</label>
                <select id="proj-statut" value={form.statut}
                  onChange={e => setForm(p => ({ ...p, statut: e.target.value as any }))} className={inputClass}>
                  {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="proj-type" className={labelClass}>Type</label>
                <select id="proj-type" value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value as any }))} className={inputClass}>
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="proj-axe" className={labelClass}>Axe d'intervention</label>
                <input id="proj-axe" type="text" value={form.axeIntervention}
                  onChange={e => setForm(p => ({ ...p, axeIntervention: e.target.value }))}
                  className={inputClass} placeholder="ex : education, environnement" />
              </div>
              <div>
                <label htmlFor="proj-zone" className={labelClass}>Zone</label>
                <input id="proj-zone" type="text" value={form.zone}
                  onChange={e => setForm(p => ({ ...p, zone: e.target.value }))}
                  className={inputClass} placeholder="ex : Artibonite" />
              </div>
              <div>
                <label htmlFor="proj-loc" className={labelClass}>Localisation précise</label>
                <input id="proj-loc" type="text" value={form.localisation}
                  onChange={e => setForm(p => ({ ...p, localisation: e.target.value }))}
                  className={inputClass} placeholder="ex : Gonaïves, Artibonite" />
              </div>
              <div>
                <label htmlFor="proj-duree" className={labelClass}>Durée</label>
                <input id="proj-duree" type="text" value={form.duree}
                  onChange={e => setForm(p => ({ ...p, duree: e.target.value }))}
                  className={inputClass} placeholder="ex : 8 semaines" />
              </div>
              <div>
                <label htmlFor="proj-annee" className={labelClass}>Année</label>
                <input id="proj-annee" type="number" min="2000" max="2100" value={form.annee}
                  onChange={e => setForm(p => ({ ...p, annee: e.target.value }))}
                  className={inputClass} placeholder="2026" />
              </div>
              <div>
                <label htmlFor="proj-public" className={labelClass}>Public cible</label>
                <input id="proj-public" type="text" value={form.publicCible}
                  onChange={e => setForm(p => ({ ...p, publicCible: e.target.value }))}
                  className={inputClass} placeholder="ex : jeunes de 15 à 30 ans" />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="proj-benef" className={labelClass}>Bénéficiaires</label>
                <textarea id="proj-benef" rows={2} value={form.beneficiaires}
                  onChange={e => setForm(p => ({ ...p, beneficiaires: e.target.value }))}
                  className={`${inputClass} resize-none`} />
              </div>
              <div className="sm:col-span-2 flex flex-wrap gap-6">
                <label htmlFor="proj-phare" className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input id="proj-phare" type="checkbox" checked={form.estProjetPhare}
                    onChange={e => setForm(p => ({ ...p, estProjetPhare: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-[#185FA5]" />
                  Projet phare
                </label>
                <label htmlFor="proj-projefa" className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input id="proj-projefa" type="checkbox" checked={form.estProjefa}
                    onChange={e => setForm(p => ({ ...p, estProjefa: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-300 text-[#185FA5]" />
                  Rattaché à PROJEFA
                </label>
              </div>
              <div className="sm:col-span-2 flex gap-3 justify-end">
                <button type="button" onClick={closeForm}
                  className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={createProjet.isPending || updateProjet.isPending}
                  className="btn-primary-ajihad py-2 px-4 text-sm disabled:opacity-60">
                  <Save className="w-4 h-4" /> {editing ? "Mettre à jour" : "Créer"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Liste */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          {!projets || projets.length === 0 ? (
            <EtatVide
              icone={FolderOpen}
              titre="Aucun projet"
              description="Les projets créés ici alimentent la page « Nos actions » du site public."
              action={{ libelle: "Créer un projet", onClick: () => { setEditing(null); setForm(emptyForm); setShowForm(true); } }}
            />
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {projets.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="min-w-0">
                    <h3 className={TITRE_MODALE}>{p.titre}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1">
                      <span className={`tag-pill ${p.statut === "en_cours" ? "tag-teal" : p.statut === "termine" ? "tag-blue" : "tag-red"}`}>
                        {STATUTS.find(s => s.value === p.statut)?.label ?? p.statut}
                      </span>
                      {p.zone && <span className="text-gray-500 dark:text-gray-400 text-xs">{p.zone}</span>}
                      <span className="text-gray-400 dark:text-gray-500 text-xs font-mono">{p.slug}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => startEdit(p)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label={`Modifier ${p.titre}`}>
                      <Edit2 className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                    <button onClick={() => handleDelete(p)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" aria-label={`Supprimer ${p.titre}`}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
