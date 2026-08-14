import { useMemo, useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";
import { UserCheck, X, Save, Mail, Phone, MapPin, GraduationCap, CheckCircle, ExternalLink, UserPlus } from "lucide-react";
import Pastille, { libelleStatut, tonDeCategorie, tonDuStatut } from "@/components/Pastille";
import EtatVide from "@/components/EtatVide";
import { TITRE_CARTE, TITRE_MODALE, TITRE_PAGE } from "@/lib/typographie";
import CarteCompteur from "@/components/CarteCompteur";

// Les couleurs sont centralisées dans Pastille ; seuls les libellés métier
// restent ici, parce qu'ils appartiennent au vocabulaire des candidatures.
const TYPES = [
  { value: "membre", label: "Membre" },
  { value: "benevole", label: "Bénévole" },
  { value: "ambassadeur", label: "Ambassadeur" },
  { value: "projefa", label: "PROJEFA" },
] as const;

const STATUTS = [
  "recue", "en_verification", "en_analyse", "approuvee", "refusee", "invitation_envoyee",
] as const;

const LIBELLES_QUESTIONS: Record<string, string> = {
  objectif: "Objectif en rejoignant AJIHAD",
  axes: "Axes d'interet",
  engagement: "Niveau d'engagement",
  missions: "Missions souhaitees",
  rythme: "Rythme de disponibilite",
  terrain: "Disponibilite terrain",
  zoneRayonnement: "Zone de representation",
  reseaux: "Reseaux mobilisables",
  representation: "Experience de representation",
};

function lireReponses(valeur: unknown): Record<string, string> {
  if (valeur && typeof valeur === "object") return valeur as Record<string, string>;
  if (typeof valeur !== "string" || !valeur.trim()) return {};
  try {
    const resultat = JSON.parse(valeur);
    return resultat && typeof resultat === "object" ? resultat : {};
  } catch {
    return {};
  }
}

type StatutValue = (typeof STATUTS)[number];

const COMPTEURS: { statuts: StatutValue[]; label: string; color: string }[] = [
  { statuts: ["recue"], label: "Reçues", color: "#185FA5" },
  { statuts: ["en_verification", "en_analyse"], label: "En analyse", color: "#F4A022" },
  { statuts: ["approuvee", "invitation_envoyee"], label: "Approuvées", color: "#4DBFBF" },
  { statuts: ["refusee"], label: "Refusées", color: "#B64926" },
];

export default function AdminCandidatures() {
  const { data: candidatures, refetch, isLoading } = trpc.admin.candidatures.list.useQuery();
  const [selected, setSelected] = useState<any>(null);
  const [edition, setEdition] = useState<any>({});
  const [notes, setNotes] = useState("");
  const [statutEdite, setStatutEdite] = useState<StatutValue>("recue");
  const [filtreType, setFiltreType] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("");
  const [filtreDepartement, setFiltreDepartement] = useState("");
  const [recherche, setRecherche] = useState("");

  const updateStatut = trpc.admin.candidatures.updateStatut.useMutation({
    onSuccess: () => { toast.success("Candidature mise à jour."); refetch(); },
    onError: (err: any) => toast.error(`Erreur : ${err.message}`),
  });

  const convertirEnMembre = trpc.admin.candidatures.convertirEnMembre.useMutation({
    onSuccess: (data) => {
      toast.success(data.dejaExistant ? "Cette personne est déjà dans le tableau des membres." : "Candidature intégrée au tableau des membres.");
      setSelected((precedente: any) => precedente ? { ...precedente, membreId: data.membreId } : precedente);
      refetch();
    },
    onError: (err: any) => toast.error(`Erreur : ${err.message}`),
  });

  const departements = useMemo(
    () => Array.from(new Set((candidatures || []).map((c: any) => c.departement).filter(Boolean))).sort(),
    [candidatures]
  );

  const filtered = (candidatures || []).filter((c: any) => {
    if (filtreType && c.type !== filtreType) return false;
    if (filtreStatut && c.statut !== filtreStatut) return false;
    if (filtreDepartement && c.departement !== filtreDepartement) return false;
    if (recherche) {
      const q = recherche.toLowerCase();
      const cible = `${c.prenom ?? ""} ${c.nom ?? ""} ${c.email ?? ""}`.toLowerCase();
      if (!cible.includes(q)) return false;
    }
    return true;
  });

  const ouvrirDetail = (c: any) => {
    setSelected(c);
    setEdition({
      type: c.type ?? "membre", prenom: c.prenom ?? "", nom: c.nom ?? "", email: c.email ?? "",
      telephone: c.telephone ?? "", adresse: c.adresse ?? "", departement: c.departement ?? "",
      commune: c.commune ?? "", niveauEtude: c.niveauEtude ?? "", competences: c.competences ?? "",
      motivation: c.motivation ?? "", disponibilite: c.disponibilite ?? "",
      experienceAssociative: c.experienceAssociative ?? "",
    });
    setNotes(c.notesInternes || "");
    setStatutEdite(c.statut || "recue");
  };

  const enregistrerStatut = () => {
    if (!selected) return;
    if (statutEdite !== selected.statut && !window.confirm(`Passer la candidature ${selected.reference} au statut « ${libelleStatut(statutEdite)} » ?`)) return;
    updateStatut.mutate({ id: selected.id, statut: statutEdite, notes: notes || undefined, data: edition });
    setSelected({ ...selected, ...edition, statut: statutEdite, notesInternes: notes });
  };

  const getType = (v: string) => TYPES.find(t => t.value === v) ?? TYPES[0];
  const aucunFiltre = !filtreType && !filtreStatut && !filtreDepartement && !recherche;

  const selectClass = "px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-[#185FA5] outline-none";
  const reponsesSelectionnees = selected ? lireReponses(selected.reponses) : {};

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div>
          <h1 className={TITRE_PAGE}>Candidatures</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Membres, bénévoles, ambassadeurs et candidatures PROJEFA.
          </p>
        </div>

        {/* Compteurs par statut */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {COMPTEURS.map(c => {
            const total = (candidatures || []).filter((x: any) => c.statuts.includes(x.statut)).length;
            return <CarteCompteur key={c.label} icone={UserCheck} couleur={c.color} valeur={total} libelle={c.label} />;
          })}
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-3">
          <input type="search" value={recherche} onChange={e => setRecherche(e.target.value)}
            placeholder="Rechercher par nom ou e-mail…" aria-label="Rechercher par nom ou e-mail"
            className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#185FA5] outline-none" />
          <select value={filtreType} onChange={e => setFiltreType(e.target.value)} aria-label="Filtrer par type" className={selectClass}>
            <option value="">Tous les types</option>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)} aria-label="Filtrer par statut" className={selectClass}>
            <option value="">Tous les statuts</option>
            {STATUTS.map(s => <option key={s} value={s}>{libelleStatut(s)}</option>)}
          </select>
          <select value={filtreDepartement} onChange={e => setFiltreDepartement(e.target.value)} aria-label="Filtrer par département" className={selectClass}>
            <option value="">Tous les départements</option>
            {departements.map(d => <option key={d} value={d}>{d}</option>)}
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
              icone={UserCheck}
              raison={aucunFiltre ? "vide" : "filtre"}
              titre={aucunFiltre ? "Aucune candidature" : "Aucun résultat"}
              description={aucunFiltre
                ? "Les candidatures déposées depuis le site apparaîtront ici dès la première soumission."
                : "Aucune candidature ne correspond aux critères sélectionnés."}
              action={aucunFiltre ? undefined : {
                libelle: "Réinitialiser les filtres",
                onClick: () => { setFiltreType(""); setFiltreStatut(""); setFiltreDepartement(""); setRecherche(""); },
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Référence</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Nom complet</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide hidden sm:table-cell">Type</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide hidden lg:table-cell">Département</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Statut</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide hidden md:table-cell">Date</th>
                    <th className="px-5 py-3 text-right font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filtered.map((c: any) => {
                    const type = getType(c.type);
                    return (
                      <tr key={c.id} onClick={() => ouvrirDetail(c)}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer">
                        <td className="px-5 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{c.reference}</td>
                        <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{c.prenom} {c.nom}</td>
                        <td className="px-5 py-3 hidden sm:table-cell">
                          <Pastille ton={tonDeCategorie(c.type)}>{type.label}</Pastille>
                        </td>
                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs hidden lg:table-cell">{c.departement || "—"}</td>
                        <td className="px-5 py-3">
                          <Pastille ton={tonDuStatut(c.statut)}>{libelleStatut(c.statut)}</Pastille>
                        </td>
                        <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs hidden md:table-cell">
                          {new Date(c.createdAt).toLocaleDateString("fr-HT")}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={e => { e.stopPropagation(); ouvrirDetail(c); }}
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
        <p className="text-gray-400 dark:text-gray-500 text-xs">{filtered.length} candidature{filtered.length !== 1 ? "s" : ""} affichée{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Panneau latéral de détail */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Détail de la candidature">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelected(null)} />
          <aside className="relative bg-white dark:bg-gray-800 w-full max-w-lg h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-start justify-between gap-4">
              <div>
                <h2 className={TITRE_MODALE}>{selected.prenom} {selected.nom}</h2>
                <p className="text-gray-400 dark:text-gray-500 text-xs font-mono mt-0.5">{selected.reference}</p>
              </div>
              <button onClick={() => setSelected(null)} aria-label="Fermer le panneau"
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Pastille ton={tonDeCategorie(selected.type)}>{getType(selected.type).label}</Pastille>
                <Pastille ton={tonDuStatut(selected.statut)}>{libelleStatut(selected.statut)}</Pastille>
                {selected.accuseEnvoye && (
                  <Pastille ton="accent"><CheckCircle className="w-3 h-3" /> Accusé envoyé</Pastille>
                )}
              </div>

              {/* Coordonnées */}
              <div className="space-y-2">
                {[
                  { icon: Mail, label: "E-mail", value: selected.email },
                  { icon: Phone, label: "Téléphone", value: selected.telephone },
                  { icon: MapPin, label: "Localisation", value: [selected.commune, selected.departement].filter(Boolean).join(", ") },
                  { icon: MapPin, label: "Adresse", value: selected.adresse },
                  { icon: GraduationCap, label: "Niveau d'étude", value: selected.niveauEtude },
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

              {(selected.cvUrl || selected.photoUrl || Object.keys(reponsesSelectionnees).length > 0) && (
                <div className="border-t border-gray-100 dark:border-gray-700 pt-5 space-y-4">
                  <h3 className={TITRE_CARTE}>Pièces et réponses de la candidature</h3>
                  <div className="flex flex-wrap gap-3">
                    {selected.cvUrl && (
                      <a href={selected.cvUrl} target="_blank" rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 px-3 py-2 text-sm font-semibold text-[#185FA5] hover:underline">
                        <ExternalLink className="w-4 h-4" /> Télécharger le CV{selected.cvNom ? ` (${selected.cvNom})` : ""}
                      </a>
                    )}
                    {selected.photoUrl && (
                      <a href={selected.photoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 px-3 py-2 text-sm font-semibold text-[#247f80] hover:underline">
                        Voir la photo
                      </a>
                    )}
                  </div>
                  {selected.photoUrl && (
                    <img src={selected.photoUrl} alt={`Photo de ${selected.prenom} ${selected.nom}`} className="h-28 w-28 rounded-xl object-cover border border-gray-200 dark:border-gray-600" />
                  )}
                  {Object.keys(reponsesSelectionnees).length > 0 && (
                    <dl className="space-y-3">
                      {Object.entries(reponsesSelectionnees).map(([id, valeur]) => (
                        <div key={id}>
                          <dt className="text-xs font-semibold text-gray-500 dark:text-gray-400">{LIBELLES_QUESTIONS[id] ?? id}</dt>
                          <dd className="text-sm text-gray-800 dark:text-gray-200 mt-0.5">{String(valeur).split("||").filter(Boolean).join(" · ")}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              )}

              <div className="border-t border-gray-100 dark:border-gray-700 pt-5 space-y-4">
                <h3 className={TITRE_CARTE}>Ajuster la fiche avant validation</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="cand-type" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                    <select id="cand-type" value={edition.type} onChange={e => setEdition((p: any) => ({ ...p, type: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none">
                      {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>
                  {[
                    { id: "prenom", label: "Prénom *", type: "text" },
                    { id: "nom", label: "Nom *", type: "text" },
                    { id: "email", label: "E-mail *", type: "email" },
                    { id: "telephone", label: "Téléphone", type: "tel" },
                    { id: "departement", label: "Département", type: "text" },
                    { id: "commune", label: "Commune", type: "text" },
                    { id: "niveauEtude", label: "Niveau d'étude", type: "text" },
                    { id: "disponibilite", label: "Disponibilités", type: "text" },
                  ].map(champ => (
                    <div key={champ.id}>
                      <label htmlFor={`cand-${champ.id}`} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">{champ.label}</label>
                      <input id={`cand-${champ.id}`} type={champ.type} value={edition[champ.id] ?? ""}
                        onChange={e => setEdition((p: any) => ({ ...p, [champ.id]: e.target.value }))}
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none" />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label htmlFor="cand-adresse" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Adresse</label>
                    <input id="cand-adresse" type="text" value={edition.adresse ?? ""}
                      onChange={e => setEdition((p: any) => ({ ...p, adresse: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none" />
                  </div>
                </div>
                {[
                  { id: "competences", titre: "Compétences", rows: 3 },
                  { id: "experienceAssociative", titre: "Expérience associative", rows: 3 },
                  { id: "motivation", titre: "Motivation *", rows: 5 },
                ].map(champ => (
                  <div key={champ.id}>
                    <label htmlFor={`cand-${champ.id}`} className={`${TITRE_CARTE} mb-1.5 block`}>{champ.titre}</label>
                    <textarea id={`cand-${champ.id}`} rows={champ.rows} value={edition[champ.id] ?? ""}
                      onChange={e => setEdition((p: any) => ({ ...p, [champ.id]: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none resize-none" />
                  </div>
                ))}
              </div>

              {/* Textes longs */}
              {[
                { titre: "Motivation", value: selected.motivation },
                { titre: "Expérience associative", value: selected.experienceAssociative },
                { titre: "Compétences", value: selected.competences },
                { titre: "Disponibilité", value: selected.disponibilite },
              ].filter(x => x.value).map((x, i) => (
                <div key={i}>
                  <h3 className={`${TITRE_CARTE} mb-1.5`}>{x.titre}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed whitespace-pre-line">{x.value}</p>
                </div>
              ))}

              {/* Statut */}
              <div>
                <label htmlFor="cand-statut" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Statut de la candidature</label>
                <select id="cand-statut" value={statutEdite} onChange={e => setStatutEdite(e.target.value as StatutValue)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none">
                  {STATUTS.map(s => <option key={s} value={s}>{libelleStatut(s)}</option>)}
                </select>
              </div>

              {/* Notes internes */}
              <div>
                <label htmlFor="cand-notes" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Notes internes</label>
                <textarea id="cand-notes" rows={4} value={notes} onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none resize-none"
                  placeholder="Observations réservées à l'équipe AJIHAD…" />
              </div>

              <button onClick={enregistrerStatut} disabled={updateStatut.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:bg-[#042C53] transition-colors disabled:opacity-60">
                <Save className="w-4 h-4" /> Enregistrer les modifications
              </button>

              {selected.membreId ? (
                <Link href={`/admin/membres?type=${edition.type}&recherche=${encodeURIComponent(edition.email)}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-[#185FA5] text-[#185FA5] rounded-xl text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                  <ExternalLink className="w-4 h-4" /> Ouvrir dans le tableau des membres
                </Link>
              ) : edition.type !== "projefa" && statutEdite === "approuvee" ? (
                <button onClick={() => convertirEnMembre.mutate({ id: selected.id })} disabled={convertirEnMembre.isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4DBFBF] text-white rounded-xl text-sm font-semibold hover:bg-[#329595] transition-colors disabled:opacity-60">
                  <UserPlus className="w-4 h-4" /> {convertirEnMembre.isPending ? "Intégration..." : "Ajouter au tableau des membres"}
                </button>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 text-xs text-center">
                  Passez la candidature au statut « Approuvée » pour l'intégrer au tableau des membres.
                </p>
              )}

              <p className="text-gray-400 dark:text-gray-500 text-xs text-center">
                Soumise le {new Date(selected.createdAt).toLocaleString("fr-HT")}
              </p>
            </div>
          </aside>
        </div>
      )}
    </AdminLayout>
  );
}
