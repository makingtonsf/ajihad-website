import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { MessageSquare, Eye, X, UserCheck, Handshake, Heart, ExternalLink } from "lucide-react";
import EtatVide from "@/components/EtatVide";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";
import { TITRE_MODALE, TITRE_PAGE } from "@/lib/typographie";

const typeLabels: Record<string, string> = {
  general: "Général",
  partenariat: "Partenariat",
  media: "Média",
  contribution: "Contribution",
};

const ONGLETS = [
  { id: "contacts", label: "Contacts", icon: MessageSquare },
  { id: "candidatures", label: "Candidatures", icon: UserCheck },
  { id: "partenariats", label: "Partenariats", icon: Handshake },
  { id: "contributions", label: "Contributions", icon: Heart },
] as const;

type OngletId = (typeof ONGLETS)[number]["id"];

const cellHead = "text-left px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide";

export default function AdminSoumissions() {
  const [onglet, setOnglet] = useState<OngletId>("contacts");
  const [type, setType] = useState("");
  const [statut, setStatut] = useState("");
  const [selected, setSelected] = useState<any>(null);

  const { data: contacts, refetch: refetchContacts } = trpc.admin.formulaires.list.useQuery();
  const { data: candidatures } = trpc.admin.candidatures.list.useQuery();
  const { data: partenariats } = trpc.admin.partenariats.list.useQuery();

  const updateStatut = trpc.admin.formulaires.updateStatut.useMutation({
    onSuccess: () => { toast.success("Statut mis à jour."); refetchContacts(); },
    onError: (err: any) => toast.error(`Erreur : ${err.message}`),
  });

  const contactsFiltres = (contacts || []).filter((s: any) => {
    if (type && s.type !== type) return false;
    if (statut && s.statut !== statut) return false;
    return true;
  });

  // Compteur d'entrées non traitées, affiché en pastille sur chaque onglet.
  const compteurs: Record<OngletId, number> = {
    contacts: (contacts || []).filter((s: any) => s.statut === "nouveau").length,
    candidatures: (candidatures || []).filter((c: any) => c.statut === "recue").length,
    partenariats: (partenariats || []).filter((p: any) => p.statut === "recue").length,
    contributions: 0,
  };

  const totalOnglet: Record<OngletId, number> = {
    contacts: contacts?.length ?? 0,
    candidatures: candidatures?.length ?? 0,
    partenariats: partenariats?.length ?? 0,
    contributions: 0,
  };

  // Un seul état vide pour les quatre onglets : le message suit l'onglet actif,
  // et distingue « rien reçu » de « rien qui passe les filtres ».
  const videMessage = (
    <EtatVide
      icone={MessageSquare}
      raison={type || statut ? "filtre" : "vide"}
      titre={type || statut ? "Aucun résultat" : "Aucune soumission"}
      description={type || statut
        ? "Aucune soumission ne correspond aux critères sélectionnés."
        : "Les messages envoyés depuis les formulaires du site arriveront ici."}
      action={type || statut
        ? { libelle: "Réinitialiser les filtres", onClick: () => { setType(""); setStatut(""); } }
        : undefined}
    />
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className={TITRE_PAGE}>Soumissions de formulaires</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Toutes les demandes reçues via le site public.
          </p>
        </div>

        {/* Onglets */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
          {ONGLETS.map(o => {
            const actif = onglet === o.id;
            return (
              <button key={o.id} onClick={() => setOnglet(o.id)} aria-current={actif ? "true" : undefined}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${actif
                  ? "border-[#185FA5] text-[#185FA5] dark:text-blue-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"}`}>
                <o.icon className="w-4 h-4" />
                {o.label}
                {compteurs[o.id] > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#B64926] text-white text-[10px] font-bold leading-none">
                    {compteurs[o.id]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Onglet Contacts */}
        {onglet === "contacts" && (
          <>
            <div className="flex flex-wrap gap-3">
              <select value={type} onChange={e => setType(e.target.value)} aria-label="Filtrer par type"
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-[#185FA5] outline-none">
                <option value="">Tous les types</option>
                {Object.entries(typeLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <select value={statut} onChange={e => setStatut(e.target.value)} aria-label="Filtrer par statut"
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-[#185FA5] outline-none">
                <option value="">Tous les statuts</option>
                <option value="nouveau">Nouveau</option>
                <option value="en_traitement">En traitement</option>
                <option value="traite">Traité</option>
                <option value="archive">Archivé</option>
              </select>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              {contactsFiltres.length === 0 ? videMessage : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <th className={cellHead}>Référence</th>
                        <th className={cellHead}>Nom</th>
                        <th className={`${cellHead} hidden sm:table-cell`}>Objet</th>
                        <th className={`${cellHead} hidden sm:table-cell`}>Type</th>
                        <th className={cellHead}>Statut</th>
                        <th className={`${cellHead} hidden md:table-cell`}>Date</th>
                        <th className={cellHead}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {contactsFiltres.map((s: any) => (
                        <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-5 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{s.reference}</td>
                          <td className="px-5 py-3 font-semibold text-gray-900 dark:text-white">{s.nomComplet || "—"}</td>
                          <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs hidden sm:table-cell max-w-[200px] truncate">{s.objet}</td>
                          <td className="px-5 py-3 hidden sm:table-cell">
                            <span className="tag-pill tag-blue">{typeLabels[s.type] || s.type}</span>
                          </td>
                          <td className="px-5 py-3">
                            <select value={s.statut} aria-label={`Statut de ${s.reference}`}
                              onChange={e => updateStatut.mutate({ id: s.id, statut: e.target.value as any })}
                              className={`text-xs px-2 py-1.5 rounded-lg border outline-none focus:ring-2 focus:ring-[#185FA5] ${s.statut === "nouveau" ? "border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800" : s.statut === "traite" ? "border-green-200 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800" : "border-gray-200 bg-white text-gray-700 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"}`}>
                              <option value="nouveau">Nouveau</option>
                              <option value="en_traitement">En traitement</option>
                              <option value="traite">Traité</option>
                              <option value="archive">Archivé</option>
                            </select>
                          </td>
                          <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs hidden md:table-cell">
                            {new Date(s.createdAt).toLocaleDateString("fr-HT")}
                          </td>
                          <td className="px-5 py-3">
                            <button onClick={() => setSelected(s)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Voir les détails">
                              <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Onglet Candidatures */}
        {onglet === "candidatures" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            {(candidatures || []).length === 0 ? videMessage : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <th className={cellHead}>Référence</th>
                        <th className={cellHead}>Nom complet</th>
                        <th className={`${cellHead} hidden sm:table-cell`}>Type</th>
                        <th className={`${cellHead} hidden lg:table-cell`}>Département</th>
                        <th className={cellHead}>Statut</th>
                        <th className={`${cellHead} hidden md:table-cell`}>Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {(candidatures || []).map((c: any) => (
                        <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-5 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{c.reference}</td>
                          <td className="px-5 py-3 font-semibold text-gray-900 dark:text-white">{c.prenom} {c.nom}</td>
                          <td className="px-5 py-3 hidden sm:table-cell"><span className="tag-pill tag-blue">{c.type}</span></td>
                          <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs hidden lg:table-cell">{c.departement || "—"}</td>
                          <td className="px-5 py-3 text-gray-600 dark:text-gray-300 text-xs">{c.statut}</td>
                          <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs hidden md:table-cell">
                            {new Date(c.createdAt).toLocaleDateString("fr-HT")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 text-center">
                  <Link href="/admin/candidatures" className="inline-flex items-center gap-1.5 text-[#185FA5] dark:text-blue-400 text-sm font-semibold hover:underline">
                    Gérer les candidatures <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </>
            )}
          </div>
        )}

        {/* Onglet Partenariats */}
        {onglet === "partenariats" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            {(partenariats || []).length === 0 ? videMessage : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-700">
                        <th className={cellHead}>Référence</th>
                        <th className={cellHead}>Organisation</th>
                        <th className={`${cellHead} hidden sm:table-cell`}>Contact</th>
                        <th className={`${cellHead} hidden lg:table-cell`}>Domaine</th>
                        <th className={cellHead}>Statut</th>
                        <th className={`${cellHead} hidden md:table-cell`}>Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {(partenariats || []).map((p: any) => (
                        <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <td className="px-5 py-3 font-mono text-xs text-gray-600 dark:text-gray-400">{p.reference}</td>
                          <td className="px-5 py-3 font-semibold text-gray-900 dark:text-white">{p.nomOrganisation}</td>
                          <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs hidden sm:table-cell">{p.nomContact}</td>
                          <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs hidden lg:table-cell">{p.domaineCollaboration || "—"}</td>
                          <td className="px-5 py-3 text-gray-600 dark:text-gray-300 text-xs">{p.statut}</td>
                          <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs hidden md:table-cell">
                            {new Date(p.createdAt).toLocaleDateString("fr-HT")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 text-center">
                  <Link href="/admin/partenariats" className="inline-flex items-center gap-1.5 text-[#185FA5] dark:text-blue-400 text-sm font-semibold hover:underline">
                    Gérer les demandes de partenariat <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </>
            )}
          </div>
        )}

        {/* Onglet Contributions */}
        {onglet === "contributions" && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-12 text-center">
            <Heart className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Les contributions disposent de leur propre espace de gestion.
            </p>
            <Link href="/admin/contributions"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:bg-[#042C53] transition-colors">
              Ouvrir les contributions <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        )}

        <p className="text-gray-400 dark:text-gray-500 text-xs">
          {totalOnglet[onglet]} entrée{totalOnglet[onglet] !== 1 ? "s" : ""} au total dans cet onglet.
        </p>

        {/* Modal détail (onglet Contacts) */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className={TITRE_MODALE}>Détails de la soumission</h2>
                <button onClick={() => setSelected(null)} aria-label="Fermer"
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                {Object.entries(selected).filter(([k]) => !["id", "createdAt", "updatedAt"].includes(k)).map(([k, v]) => (
                  <div key={k} className="flex gap-3">
                    <span className="text-gray-500 dark:text-gray-400 text-xs w-28 flex-shrink-0 pt-0.5 capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
                    <span className="text-gray-900 dark:text-white text-sm break-all">{String(v ?? "") || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
