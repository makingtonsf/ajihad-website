import { useState } from "react";
import { Link } from "wouter";
import { FileText, Download, Lock, ChevronRight, Search, BookOpen, Shield, Mail } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import SEOHead from "@/components/SEOHead";
import EtatVide from "@/components/EtatVide";
import { trpc } from "@/lib/trpc";
import { useConfigSite } from "@/hooks/useConfigSite";

const categories = [
  { value: "", label: "Toutes" },
  { value: "rapport_annuel", label: "Rapports annuels" },
  { value: "rapport_activites", label: "Rapports d'activités" },
  { value: "institutionnel", label: "Statuts & Règlements" },
  { value: "ressource_pedagogique", label: "Guides & Manuels" },
  { value: "presentation", label: "Présentations" },
  { value: "formulaire", label: "Formulaires" },
];

// Contenu de secours affiché tant qu'aucun document n'est publié en base.
const ressourcesStatiques = [
  { id: 1, titre: "Statuts de l'association AJIHAD", description: "Document fondateur définissant la structure et les règles de fonctionnement d'AJIHAD.", categorie: "institutionnel", visibilite: "public", fileType: "PDF", version: "v2.0 – 2024" },
  { id: 2, titre: "Règlement intérieur", description: "Règles de conduite et procédures internes pour tous les membres.", categorie: "institutionnel", visibilite: "public", fileType: "PDF", version: "v1.5 – 2024" },
  { id: 3, titre: "Rapport d'activités 2024", description: "Bilan complet des activités, projets et résultats d'AJIHAD pour l'année 2024.", categorie: "rapport_activites", visibilite: "public", fileType: "PDF", version: "Édition 2024" },
  { id: 4, titre: "Plan stratégique 2025–2030", description: "Vision, orientations stratégiques et objectifs d'AJIHAD pour les cinq prochaines années.", categorie: "institutionnel", visibilite: "membres", fileType: "PDF", version: "v1.0 – 2025" },
  { id: 5, titre: "Guide du bénévole AJIHAD", description: "Manuel d'accueil et d'orientation pour les nouveaux bénévoles.", categorie: "ressource_pedagogique", visibilite: "public", fileType: "PDF", version: "v3.0 – 2025" },
  { id: 6, titre: "Présentation institutionnelle AJIHAD", description: "Présentation officielle d'AJIHAD pour les partenaires et institutions.", categorie: "presentation", visibilite: "public", fileType: "PDF", version: "2025" },
  { id: 7, titre: "Formulaire de candidature membre", description: "Formulaire officiel pour rejoindre AJIHAD en tant que membre.", categorie: "formulaire", visibilite: "public", fileType: "PDF", version: "2025" },
  { id: 8, titre: "Rapport financier 2024", description: "Rapport financier annuel avec détail des recettes et dépenses.", categorie: "rapport_annuel", visibilite: "membres", fileType: "PDF", version: "Édition 2024" },
];

function CarteSquelette() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm animate-pulse">
      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-full mb-1.5" />
      <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-2/3 mb-4" />
      <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-lg" />
    </div>
  );
}

export default function Ressources() {
  const { txt } = useConfigSite();
  const [categorie, setCategorie] = useState("");
  const [recherche, setRecherche] = useState("");
  const { data: authUser } = trpc.auth.me.useQuery();
  const { data: ressourcesDB, isLoading } = trpc.public.documents.useQuery({
    categorie: categorie || undefined,
  });

  const utiliseBase = Boolean(ressourcesDB && ressourcesDB.length > 0);
  const ressources = (utiliseBase ? ressourcesDB! : ressourcesStatiques) as any[];

  const filtrees = ressources.filter((r: any) => {
    // Le filtre catégorie est déjà appliqué côté serveur pour les données réelles.
    if (!utiliseBase && categorie && r.categorie !== categorie) return false;
    if (recherche && !r.titre.toLowerCase().includes(recherche.toLowerCase())) return false;
    return true;
  });

  return (
    <PublicLayout>
      <SEOHead
        title="Ressources & Documents"
        description="Documents officiels, rapports, guides et formulaires d'AJIHAD. Certaines ressources sont réservées aux membres."
      />

      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-[#042C53] to-[#185FA5] text-white" aria-labelledby="ressources-hero-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-blue-200/70 text-sm mb-8">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Ressources & Documents</span>
          </nav>
          <h1 id="ressources-hero-heading" className="text-4xl sm:text-5xl font-extrabold mb-6">
            {txt("txt_ressources_hero_titre")}
          </h1>
          <p className="text-xl text-blue-100/90 leading-relaxed max-w-2xl">
            {txt("txt_ressources_hero_chapo")}
          </p>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="search" placeholder="Rechercher un document..." value={recherche} onChange={e => setRecherche(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none"
                aria-label="Rechercher un document" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button key={cat.value} onClick={() => setCategorie(cat.value)}
                  aria-pressed={categorie === cat.value}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${categorie === cat.value ? "bg-[#185FA5] text-white" : "bg-[#F6F8FB] dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white mb-1">{txt("txt_ressources_avis_titre")}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">{txt("txt_ressources_avis_chapo")}</p>
            </div>
            <a href="mailto:contact@ajihad.org?subject=Demande%20de%20ressource%20AJIHAD" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#185FA5] text-white text-sm font-semibold hover:bg-[#042C53] transition-colors flex-shrink-0">
              <Mail className="w-4 h-4" /> Demander un document
            </a>
          </div>

          {/* Avertissement membres */}
          {!authUser && (
            <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
              <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-800 dark:text-amber-300 font-semibold text-sm">Certains documents sont réservés aux membres</p>
                <p className="text-amber-700 dark:text-amber-400 text-xs mt-1">
                  <Link href="/espace-membre" className="underline font-semibold">Connectez-vous</Link> ou <Link href="/s-impliquer#membre" className="underline font-semibold">devenez membre</Link> pour accéder à tous les documents.
                </p>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2, 3, 4, 5].map(i => <CarteSquelette key={i} />)}
            </div>
          ) : filtrees.length === 0 ? (
            <EtatVide
              icone={BookOpen}
              raison={recherche || categorie ? "filtre" : "vide"}
              titre={recherche || categorie ? "Aucun résultat" : "Aucun document public"}
              description={recherche || categorie
                ? "Essayez un autre mot-clé ou affichez toutes les catégories."
                : "Les documents publics d'AJIHAD — statuts, rapports, guides — seront disponibles ici."}
              action={recherche || categorie
                ? { libelle: "Voir tous les documents", onClick: () => { setRecherche(""); setCategorie(""); } }
                : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtrees.map((res: any) => {
                const reserveMembres = res.visibilite === "membres";
                const isLocked = reserveMembres && !authUser;
                const dateAffichee = res.dateDocument ? new Date(res.dateDocument).getFullYear() : null;
                return (
                  <div key={res.id} className={`bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col ${isLocked ? "opacity-75" : "hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-[#185FA5]" />
                      </div>
                      {reserveMembres ? (
                        <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                          <Lock className="w-3 h-3" /> Membres uniquement
                        </span>
                      ) : (
                        <span className="tag-pill tag-teal">Public</span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">{res.titre}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed flex-1 mb-3">{res.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500 mb-3">
                      <span>{res.fileType || "PDF"}{res.langue ? ` · ${String(res.langue).toUpperCase()}` : ""}</span>
                      <span>{res.version || dateAffichee || ""}</span>
                    </div>
                    {isLocked ? (
                      <Link href="/espace-membre" className="w-full py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-semibold text-center flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" /> Connexion requise
                      </Link>
                    ) : res.fileUrl ? (
                      <a href={res.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="w-full py-2 rounded-lg bg-[#185FA5] text-white text-xs font-semibold flex items-center justify-center gap-1 hover:bg-[#042C53] transition-colors">
                        <Download className="w-3 h-3" /> Télécharger
                      </a>
                    ) : (
                        <a href={`mailto:contact@ajihad.org?subject=Demande%20de%20document%20AJIHAD%20-%20${encodeURIComponent(res.titre)}`}
                          className="w-full py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-semibold flex items-center justify-center gap-1 hover:bg-blue-50 dark:hover:bg-gray-600 transition-colors">
                          <Mail className="w-3 h-3" /> Demander une copie
                        </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
