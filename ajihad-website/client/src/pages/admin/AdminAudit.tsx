import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";
import { ClipboardList, Download, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import Pastille from "@/components/Pastille";
import EtatVide from "@/components/EtatVide";
import { TITRE_MODALE, TITRE_PAGE } from "@/lib/typographie";

const PAR_PAGE = 50;
const ROLES_AUTORISES = ["super_admin"];

export default function AdminAudit() {
  const { user } = useAuth();
  const autorise = ROLES_AUTORISES.includes(user?.role ?? "");

  const { data: entrees, isLoading } = trpc.admin.audit.list.useQuery(undefined, { enabled: autorise });
  const [recherche, setRecherche] = useState("");
  const [ressource, setRessource] = useState("");
  const [resultat, setResultat] = useState("");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [page, setPage] = useState(0);

  const ressources = useMemo(
    () => Array.from(new Set((entrees || []).map((e: any) => e.ressource).filter(Boolean))).sort(),
    [entrees]
  );

  const filtered = useMemo(() => {
    return (entrees || []).filter((e: any) => {
      if (recherche && !e.utilisateurNom?.toLowerCase().includes(recherche.toLowerCase())) return false;
      if (ressource && e.ressource !== ressource) return false;
      if (resultat && e.resultat !== resultat) return false;
      if (dateDebut && new Date(e.createdAt) < new Date(`${dateDebut}T00:00:00`)) return false;
      if (dateFin && new Date(e.createdAt) > new Date(`${dateFin}T23:59:59`)) return false;
      return true;
    });
  }, [entrees, recherche, ressource, resultat, dateDebut, dateFin]);

  const nbPages = Math.max(1, Math.ceil(filtered.length / PAR_PAGE));
  const pageCourante = Math.min(page, nbPages - 1);
  const visibles = filtered.slice(pageCourante * PAR_PAGE, (pageCourante + 1) * PAR_PAGE);

  const exporterCSV = () => {
    if (filtered.length === 0) { toast.info("Aucune entrée à exporter."); return; }
    const entete = ["Date", "Utilisateur", "Action", "Ressource", "ID ressource", "Détails", "Résultat"];
    const echapper = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const lignes = filtered.map((e: any) => [
      new Date(e.createdAt).toLocaleString("fr-HT"),
      e.utilisateurNom ?? "",
      e.action ?? "",
      e.ressource ?? "",
      e.ressourceId ?? "",
      e.details ?? "",
      e.resultat ?? "",
    ].map(echapper).join(","));

    // BOM UTF-8 pour qu'Excel affiche correctement les accents.
    const csv = `﻿${entete.map(echapper).join(",")}\n${lignes.join("\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = `journal-audit-ajihad-${new Date().toISOString().slice(0, 10)}.csv`;
    lien.click();
    URL.revokeObjectURL(url);
    toast.success(`${filtered.length} entrée(s) exportée(s).`);
  };

  if (!autorise) {
    return (
      <AdminLayout>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-10 text-center max-w-md mx-auto">
          <Shield className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h1 className={`${TITRE_MODALE} mb-2`}>Accès réservé</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Le journal d'audit est réservé au rôle <strong>super_admin</strong>.
          </p>
        </div>
      </AdminLayout>
    );
  }

  const selectClass = "px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm focus:ring-2 focus:ring-[#185FA5] outline-none";

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className={TITRE_PAGE}>Journal d'audit</h1>
              <Pastille ton="danger"><Shield className="w-3 h-3" /> Super Admin</Pastille>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Historique des actions sensibles effectuées dans l'espace d'administration.
            </p>
          </div>
          <button onClick={exporterCSV}
            className="flex items-center gap-2 px-4 py-2 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:bg-[#042C53] transition-colors self-start">
            <Download className="w-4 h-4" /> Exporter CSV
          </button>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-3">
          <input type="search" value={recherche} onChange={e => { setRecherche(e.target.value); setPage(0); }}
            placeholder="Rechercher un utilisateur…" aria-label="Rechercher par utilisateur"
            className="flex-1 min-w-[180px] px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#185FA5] outline-none" />
          <select value={ressource} onChange={e => { setRessource(e.target.value); setPage(0); }} aria-label="Filtrer par ressource" className={selectClass}>
            <option value="">Toutes les ressources</option>
            {ressources.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={resultat} onChange={e => { setResultat(e.target.value); setPage(0); }} aria-label="Filtrer par résultat" className={selectClass}>
            <option value="">Tous les résultats</option>
            <option value="succes">Succès</option>
            <option value="echec">Échec</option>
          </select>
          <input type="date" value={dateDebut} onChange={e => { setDateDebut(e.target.value); setPage(0); }} aria-label="Date de début" className={selectClass} />
          <input type="date" value={dateFin} onChange={e => { setDateFin(e.target.value); setPage(0); }} aria-label="Date de fin" className={selectClass} />
        </div>

        {/* Tableau */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[0, 1, 2, 3].map(i => <div key={i} className="h-9 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />)}
            </div>
          ) : visibles.length === 0 ? (
            <EtatVide
              icone={ClipboardList}
              raison={recherche || ressource || resultat || dateDebut || dateFin ? "filtre" : "vide"}
              titre={recherche || ressource || resultat || dateDebut || dateFin ? "Aucun résultat" : "Journal vide"}
              description={recherche || ressource || resultat || dateDebut || dateFin
                ? "Aucune entrée ne correspond aux critères sélectionnés."
                : "Chaque action sensible effectuée dans l'administration sera consignée ici."}
              action={recherche || ressource || resultat || dateDebut || dateFin ? {
                libelle: "Réinitialiser les filtres",
                onClick: () => { setRecherche(""); setRessource(""); setResultat(""); setDateDebut(""); setDateFin(""); setPage(0); },
              } : undefined}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Date / heure</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Utilisateur</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Action</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide hidden md:table-cell">Ressource</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide hidden lg:table-cell">Détails</th>
                    <th className="px-5 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-xs uppercase tracking-wide">Résultat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {visibles.map((e: any) => (
                    <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                        {new Date(e.createdAt).toLocaleString("fr-HT")}
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{e.utilisateurNom || "—"}</td>
                      <td className="px-5 py-3">
                        <Pastille ton="info" className="font-mono">{e.action}</Pastille>
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs hidden md:table-cell">
                        {e.ressource || "—"}{e.ressourceId ? ` #${e.ressourceId}` : ""}
                      </td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400 text-xs hidden lg:table-cell max-w-xs truncate">{e.details || "—"}</td>
                      <td className="px-5 py-3">
                        <Pastille ton={e.resultat === "echec" ? "danger" : "succes"}>
                          {e.resultat === "echec" ? "Échec" : "Succès"}
                        </Pastille>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filtered.length > PAR_PAGE && (
          <div className="flex items-center justify-between">
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              {pageCourante * PAR_PAGE + 1}–{Math.min((pageCourante + 1) * PAR_PAGE, filtered.length)} sur {filtered.length} entrées
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={pageCourante === 0} aria-label="Page précédente"
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors">
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
              <span className="text-gray-600 dark:text-gray-300 text-sm">Page {pageCourante + 1} / {nbPages}</span>
              <button onClick={() => setPage(p => Math.min(nbPages - 1, p + 1))} disabled={pageCourante >= nbPages - 1} aria-label="Page suivante"
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors">
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
