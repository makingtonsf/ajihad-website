import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";
import {
  Users, Search, Plus, Pencil, Trash2, X, Check, Shield, Globe, Heart, UserCheck, TriangleAlert,
  KeyRound, RotateCcw, ExternalLink,
} from "lucide-react";
import { classesTon, libelleStatut, tonDeCategorie, tonDuStatut } from "@/components/Pastille";
import EtatVide from "@/components/EtatVide";
import { TITRE_MODALE, TITRE_PAGE, TITRE_SECTION } from "@/lib/typographie";
import CarteCompteur from "@/components/CarteCompteur";

// `icon` et `couleur` restent ici : ils habillent les vignettes de comptage et
// les avatars, pas les pastilles. Les teintes de pastille viennent de Pastille.
const TYPES = [
  { value: "membre", label: "Membre", icon: Users, couleur: "#185FA5" },
  { value: "benevole", label: "Bénévole", icon: Heart, couleur: "#4DBFBF" },
  { value: "ambassadeur", label: "Ambassadeur", icon: Globe, couleur: "#B64926" },
];

const STATUTS = ["en_attente", "verifie", "approuve", "actif", "refuse", "inactif"];

// Les 7 rôles de la table users. Seul « admin » franchit aujourd'hui le garde
// de AdminLayout — voir le commentaire dans Navbar.tsx.
const ROLES = [
  { value: "super_admin", label: "Super administrateur" },
  { value: "admin", label: "Administrateur" },
  { value: "editeur_communication", label: "Éditeur communication" },
  { value: "responsable_projet", label: "Responsable de projet" },
  { value: "responsable_commission", label: "Responsable de commission" },
  { value: "membre", label: "Membre" },
  { value: "user", label: "Utilisateur" },
];

const formulaireVide = {
  prenom: "", nom: "", email: "", telephone: "", adresse: "",
  departement: "", commune: "", niveauEtude: "", competences: "",
  motivation: "", commission: "", notesInternes: "", dateAdhesion: "",
  typeMembre: "membre", statut: "en_attente",
};

const champSaisie =
  "w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none";

export default function AdminMembres() {
  const { data: membres, refetch } = trpc.admin.membres.list.useQuery();
  const { data: comptes, refetch: refetchComptes } = trpc.admin.users.list.useQuery();
  const { data: demo } = trpc.admin.modeDemo.useQuery();

  const parametresLien = new URLSearchParams(window.location.search);
  const typeDepuisCandidature = TYPES.some(t => t.value === parametresLien.get("type")) ? parametresLien.get("type")! : "tous";
  const [onglet, setOnglet] = useState(typeDepuisCandidature);
  const [statutFiltre, setStatutFiltre] = useState("");
  const [departementFiltre, setDepartementFiltre] = useState("");
  const [recherche, setRecherche] = useState(parametresLien.get("recherche") ?? "");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(formulaireVide);

  const surSucces = (message: string) => () => {
    toast.success(message);
    refetch();
    fermerForm();
  };
  const surErreur = (err: any) => toast.error(`Erreur : ${err.message}`);

  const creer = trpc.admin.membres.create.useMutation({ onSuccess: surSucces("Membre créé."), onError: surErreur });
  const modifier = trpc.admin.membres.update.useMutation({ onSuccess: surSucces("Membre mis à jour."), onError: surErreur });
  const supprimer = trpc.admin.membres.delete.useMutation({
    onSuccess: () => { toast.success("Membre supprimé."); refetch(); }, onError: surErreur,
  });
  const changerStatut = trpc.admin.membres.updateStatut.useMutation({
    onSuccess: () => { toast.success("Statut mis à jour."); refetch(); }, onError: surErreur,
  });
  const changerType = trpc.admin.membres.updateType.useMutation({
    onSuccess: () => { toast.success("Catégorie mise à jour."); refetch(); }, onError: surErreur,
  });
  const changerRole = trpc.admin.users.updateRole.useMutation({
    onSuccess: () => { toast.success("Rôle mis à jour."); refetchComptes(); }, onError: surErreur,
  });

  // Identifiants fraîchement créés, affichés une seule fois : le mot de passe
  // n'est stocké nulle part en clair, il n'est plus récupérable ensuite.
  const [acces, setAcces] = useState<{ email: string; motDePasse: string } | null>(null);

  const creerAcces = trpc.admin.membres.creerAcces.useMutation({
    onSuccess: d => { setAcces({ email: d.email, motDePasse: d.motDePasse }); refetch(); refetchComptes(); },
    onError: surErreur,
  });
  const reinitialiser = trpc.admin.membres.reinitialiserMotDePasse.useMutation({
    onSuccess: d => setAcces({ email: d.email, motDePasse: d.motDePasse }),
    onError: surErreur,
  });

  const fermerForm = () => { setShowForm(false); setEditing(null); setForm(formulaireVide); };

  const ouvrirCreation = () => { setEditing(null); setForm(formulaireVide); setShowForm(true); };

  const ouvrirEdition = (m: any) => {
    setEditing(m);
    setForm({
      ...formulaireVide,
      ...Object.fromEntries(Object.entries(m).filter(([k]) => k in formulaireVide).map(([k, v]) => [k, v ?? ""])),
      dateAdhesion: m.dateAdhesion ? new Date(m.dateAdhesion).toISOString().slice(0, 10) : "",
    });
    setShowForm(true);
  };

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) modifier.mutate({ id: editing.id, data: form });
    else creer.mutate(form);
  };

  const confirmerSuppression = (m: any) => {
    if (window.confirm(`Supprimer définitivement ${m.prenom} ${m.nom} ? Cette action est irréversible.`)) {
      supprimer.mutate({ id: m.id });
    }
  };

  const departements = useMemo(
    () => Array.from(new Set((membres ?? []).map((m: any) => m.departement).filter(Boolean))).sort(),
    [membres]
  );

  const compteurs = useMemo(() => {
    const liste = membres ?? [];
    return {
      tous: liste.length,
      ...Object.fromEntries(TYPES.map(t => [t.value, liste.filter((m: any) => m.typeMembre === t.value).length])),
    } as Record<string, number>;
  }, [membres]);

  const filtres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    return (membres ?? []).filter((m: any) => {
      if (onglet !== "tous" && m.typeMembre !== onglet) return false;
      if (statutFiltre && m.statut !== statutFiltre) return false;
      if (departementFiltre && m.departement !== departementFiltre) return false;
      if (q && ![m.prenom, m.nom, m.email, m.commune].some((v: string) => v?.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [membres, onglet, statutFiltre, departementFiltre, recherche]);

  const infoType = (v: string) => TYPES.find(t => t.value === v) ?? TYPES[0];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {demo?.actif && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <TriangleAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-800 dark:text-amber-300 font-semibold text-sm">Mode démonstration — données factices</p>
              <p className="text-amber-700 dark:text-amber-400 text-xs mt-1">
                Aucune base de données n'est connectée. Ces personnes sont inventées et vivent en mémoire :
                toute modification disparaît au redémarrage du serveur. Renseigne <code className="font-mono">DATABASE_URL</code> pour piloter les vraies données.
              </p>
            </div>
          </div>
        )}

        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={TITRE_PAGE}>Membres, bénévoles & ambassadeurs</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {compteurs.tous} personne{compteurs.tous !== 1 ? "s" : ""} enregistrée{compteurs.tous !== 1 ? "s" : ""}.
            </p>
          </div>
          <button onClick={ouvrirCreation}
            className="flex items-center gap-2 px-4 py-2 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:bg-[#042C53] transition-colors self-start">
            <Plus className="w-4 h-4" /> Nouveau membre
          </button>
        </div>

        {/* Compteurs par catégorie */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <CarteCompteur icone={UserCheck} couleur="#6B7280" valeur={compteurs.tous} libelle="Total"
            actif={onglet === "tous"} onClick={() => setOnglet("tous")} />
          {TYPES.map(t => (
            <CarteCompteur key={t.value} icone={t.icon} couleur={t.couleur}
              valeur={compteurs[t.value] ?? 0} libelle={`${t.label}s`}
              actif={onglet === t.value} onClick={() => setOnglet(t.value)} />
          ))}
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className={TITRE_MODALE}>
                {editing ? `Modifier ${editing.prenom} ${editing.nom}` : "Nouveau membre"}
              </h2>
              <button onClick={fermerForm} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Fermer le formulaire">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            {editing && (editing.cvUrl || editing.photoUrl || editing.reponses) && (
              <div className="mb-5 rounded-xl border border-gray-100 dark:border-gray-700 bg-[#F6F8FB] dark:bg-gray-700/40 p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Dossier de candidature</p>
                <div className="flex flex-wrap gap-3">
                  {editing.cvUrl && <a href={editing.cvUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#185FA5] hover:underline"><ExternalLink className="w-4 h-4" /> {editing.cvNom || "Ouvrir le CV"}</a>}
                  {editing.photoUrl && <a href={editing.photoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-[#247f80] hover:underline"><ExternalLink className="w-4 h-4" /> Ouvrir la photo</a>}
                </div>
                {editing.photoUrl && <img src={editing.photoUrl} alt={`Photo de ${editing.prenom} ${editing.nom}`} className="h-24 w-24 rounded-lg object-cover border border-gray-200 dark:border-gray-600" />}
              </div>
            )}
            <form onSubmit={soumettre} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { id: "prenom", label: "Prénom *", type: "text", requis: true },
                  { id: "nom", label: "Nom *", type: "text", requis: true },
                  { id: "email", label: "Email *", type: "email", requis: true },
                  { id: "telephone", label: "Téléphone", type: "tel" },
                  { id: "departement", label: "Département", type: "text" },
                  { id: "commune", label: "Commune", type: "text" },
                  { id: "niveauEtude", label: "Niveau d'étude", type: "text" },
                  { id: "commission", label: "Commission", type: "text" },
                  { id: "dateAdhesion", label: "Date d'adhésion", type: "date" },
                ].map(c => (
                  <div key={c.id}>
                    <label htmlFor={`membre-${c.id}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{c.label}</label>
                    <input id={`membre-${c.id}`} type={c.type} required={c.requis} value={form[c.id]}
                      onChange={e => setForm((f: any) => ({ ...f, [c.id]: e.target.value }))} className={champSaisie} />
                  </div>
                ))}
                <div>
                  <label htmlFor="membre-type" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Catégorie</label>
                  <select id="membre-type" value={form.typeMembre} onChange={e => setForm((f: any) => ({ ...f, typeMembre: e.target.value }))} className={champSaisie}>
                    {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="membre-statut" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Statut</label>
                  <select id="membre-statut" value={form.statut} onChange={e => setForm((f: any) => ({ ...f, statut: e.target.value }))} className={champSaisie}>
                    {STATUTS.map(s => <option key={s} value={s}>{libelleStatut(s)}</option>)}
                  </select>
                </div>
              </div>
              {[
                { id: "adresse", label: "Adresse", rows: 2 },
                { id: "competences", label: "Compétences", rows: 2 },
                { id: "motivation", label: "Motivation", rows: 3 },
                { id: "notesInternes", label: "Notes internes (non visibles par le membre)", rows: 2 },
              ].map(c => (
                <div key={c.id}>
                  <label htmlFor={`membre-${c.id}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{c.label}</label>
                  <textarea id={`membre-${c.id}`} rows={c.rows} value={form[c.id]}
                    onChange={e => setForm((f: any) => ({ ...f, [c.id]: e.target.value }))} className={`${champSaisie} resize-none`} />
                </div>
              ))}
              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={creer.isPending || modifier.isPending}
                  className="flex items-center gap-2 px-5 py-2 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:bg-[#042C53] transition-colors disabled:opacity-60">
                  <Check className="w-4 h-4" /> {editing ? "Enregistrer" : "Créer le membre"}
                </button>
                <button type="button" onClick={fermerForm} className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="search" value={recherche} onChange={e => setRecherche(e.target.value)}
              placeholder="Rechercher par nom, email ou commune..." aria-label="Rechercher un membre"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none text-sm" />
          </div>
          <select value={statutFiltre} onChange={e => setStatutFiltre(e.target.value)} aria-label="Filtrer par statut"
            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-[#185FA5] outline-none">
            <option value="">Tous les statuts</option>
            {STATUTS.map(s => <option key={s} value={s}>{libelleStatut(s)}</option>)}
          </select>
          <select value={departementFiltre} onChange={e => setDepartementFiltre(e.target.value)} aria-label="Filtrer par département"
            className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-[#185FA5] outline-none">
            <option value="">Tous les départements</option>
            {departements.map((d: any) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Tableau */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          {filtres.length === 0 ? (
            <EtatVide
              icone={Users}
              raison={compteurs.tous === 0 ? "vide" : "filtre"}
              titre={compteurs.tous === 0 ? "Aucun membre" : "Aucun résultat"}
              description={compteurs.tous === 0
                ? "Les membres ne s'inscrivent pas eux-mêmes : c'est ici que vous créez leur fiche et leurs accès."
                : `Aucune des ${compteurs.tous} personnes enregistrées ne correspond à ces filtres.`}
              action={compteurs.tous === 0
                ? { libelle: "Ajouter un membre", onClick: ouvrirCreation }
                : { libelle: "Réinitialiser les filtres", onClick: () => { setOnglet("tous"); setStatutFiltre(""); setDepartementFiltre(""); setRecherche(""); } }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Personne</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Catégorie</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Statut</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide hidden lg:table-cell">Localisation</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide hidden xl:table-cell">Commission</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filtres.map((m: any) => (
                    <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                            style={{ backgroundColor: infoType(m.typeMembre).couleur }}>
                            {(m.prenom?.[0] ?? "?").toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 dark:text-white truncate">{m.prenom} {m.nom}</div>
                            <div className="text-gray-400 dark:text-gray-500 text-xs truncate">{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <select value={m.typeMembre} onChange={e => changerType.mutate({ id: m.id, typeMembre: e.target.value as any })}
                          aria-label={`Catégorie de ${m.prenom} ${m.nom}`}
                          className={`text-xs px-2 py-1.5 rounded-lg border-0 font-medium outline-none focus:ring-2 focus:ring-[#185FA5] ${classesTon(tonDeCategorie(m.typeMembre))}`}>
                          {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-3">
                        <select value={m.statut} onChange={e => changerStatut.mutate({ id: m.id, statut: e.target.value as any })}
                          aria-label={`Statut de ${m.prenom} ${m.nom}`}
                          className={`text-xs px-2 py-1.5 rounded-lg border-0 font-medium outline-none focus:ring-2 focus:ring-[#185FA5] ${classesTon(tonDuStatut(m.statut))}`}>
                          {STATUTS.map(s => <option key={s} value={s}>{libelleStatut(s)}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs hidden lg:table-cell">
                        {[m.commune, m.departement].filter(Boolean).join(", ") || "—"}
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs hidden xl:table-cell">{m.commission || "—"}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {m.userId ? (
                            <button onClick={() => reinitialiser.mutate({ email: m.email })}
                              disabled={reinitialiser.isPending}
                              aria-label={`Réinitialiser le mot de passe de ${m.prenom} ${m.nom}`}
                              title="Réinitialiser le mot de passe"
                              className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-600 transition-colors disabled:opacity-50">
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          ) : (
                            <button onClick={() => creerAcces.mutate({ membreId: m.id })}
                              disabled={creerAcces.isPending}
                              aria-label={`Créer l'accès de ${m.prenom} ${m.nom}`}
                              title="Créer l'accès de connexion"
                              className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 transition-colors disabled:opacity-50">
                              <KeyRound className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => ouvrirEdition(m)} aria-label={`Modifier ${m.prenom} ${m.nom}`}
                            className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-[#185FA5] transition-colors">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => confirmerSuppression(m)} aria-label={`Supprimer ${m.prenom} ${m.nom}`}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <p className="text-gray-400 dark:text-gray-500 text-xs">
          {filtres.length} sur {compteurs.tous} affiché{filtres.length !== 1 ? "s" : ""}
        </p>

        {/* Identifiants fraîchement créés — affichés une seule fois */}
        {acces && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="titre-acces">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <KeyRound className="w-5 h-5 text-green-600" />
                <h2 id="titre-acces" className={TITRE_SECTION}>Identifiants créés</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-5 leading-relaxed">
                Transmettez-les au membre. <strong>Ce mot de passe ne sera plus affiché</strong> :
                il n'est pas conservé en clair. Le membre pourra le changer depuis son espace.
              </p>
              <div className="space-y-3 mb-5">
                <div className="p-3 rounded-xl bg-[#F6F8FB] dark:bg-gray-700/50">
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Adresse e-mail</p>
                  <p className="font-mono text-sm text-gray-900 dark:text-white break-all">{acces.email}</p>
                </div>
                <div className="p-3 rounded-xl bg-[#F6F8FB] dark:bg-gray-700/50">
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">Mot de passe provisoire</p>
                  <p className="font-mono text-lg font-bold text-[#185FA5] dark:text-blue-400">{acces.motDePasse}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(`Email : ${acces.email}\nMot de passe : ${acces.motDePasse}`);
                    toast.success("Identifiants copiés.");
                  }}
                  className="flex-1 px-4 py-2.5 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:bg-[#042C53] transition-colors">
                  Copier
                </button>
                <button onClick={() => setAcces(null)}
                  className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Comptes de connexion & rôles */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#185FA5]" />
              <h2 className={TITRE_SECTION}>Comptes de connexion & rôles</h2>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
              Comptes créés à la première connexion. Le rôle commande l'accès à l'administration ; il est distinct de la catégorie de membre ci-dessus.
            </p>
          </div>
          {!comptes || comptes.length === 0 ? (
            <EtatVide
              icone={Shield}
              titre="Aucun compte d'accès"
              description="Les comptes se créent à la première connexion d'un membre avec les identifiants que vous lui avez transmis."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Compte</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide hidden md:table-cell">Dernière connexion</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Rôle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {comptes.map((c: any) => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-semibold text-gray-900 dark:text-white">{c.name || "—"}</div>
                        <div className="text-gray-400 dark:text-gray-500 text-xs">{c.email || "—"}</div>
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs hidden md:table-cell">
                        {c.lastSignedIn ? new Date(c.lastSignedIn).toLocaleDateString("fr-HT") : "—"}
                      </td>
                      <td className="px-5 py-3">
                        <select value={c.role} onChange={e => changerRole.mutate({ id: c.id, role: e.target.value as any })}
                          aria-label={`Rôle de ${c.name || c.email}`}
                          className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-[#185FA5] outline-none">
                          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
