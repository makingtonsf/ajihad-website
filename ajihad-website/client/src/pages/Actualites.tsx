import { Link } from "wouter";
import { Calendar, ChevronRight, Search, BookOpen } from "lucide-react";
import EtatVide from "@/components/EtatVide";
import PublicLayout from "@/components/PublicLayout";
import SEOHead from "@/components/SEOHead";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { actualitesStatiques } from "@/data/actualitesStatiques";
import { useConfigSite } from "@/hooks/useConfigSite";
const categories = [
  { value: "", label: "Toutes" },
  { value: "actualite", label: "Actualités" },
  { value: "evenement", label: "Événements" },
  { value: "communique", label: "Communiqués" },
  { value: "formation", label: "Formations" },
  { value: "appel_candidature", label: "Appels à candidature" },
];

export default function Actualites() {
  const { txt } = useConfigSite();
  const [categorie, setCategorie] = useState("");
  const [recherche, setRecherche] = useState("");
  const { data: actualitesDB } = trpc.public.actualites.useQuery({ limit: 20 });
  const actualites = (actualitesDB && actualitesDB.length > 0 ? actualitesDB : actualitesStatiques) as any[];
  const filtrees = actualites.filter((a: any) => {
    if (categorie && a.categorie !== categorie) return false;
    if (recherche && !a.titre.toLowerCase().includes(recherche.toLowerCase()) && !a.resume?.toLowerCase().includes(recherche.toLowerCase())) return false;
    return true;
  });

  return (
    <PublicLayout>
      <SEOHead
        title="Actualités & Événements"
        description="Les dernières nouvelles, événements, communiqués et publications d'AJIHAD."
      />
      <section className="py-20 bg-gradient-to-br from-[#042C53] to-[#185FA5] text-white" aria-labelledby="actu-hero-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-blue-200/70 text-sm mb-8">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Actualités & Événements</span>
          </nav>
          <h1 id="actu-hero-heading" className="text-4xl sm:text-5xl font-extrabold mb-6">
            {txt("txt_actualites_hero_titre")}
          </h1>
          <p className="text-xl text-blue-100/90 leading-relaxed max-w-2xl">
            {txt("txt_actualites_hero_chapo")}
          </p>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="search" placeholder="Rechercher une actualité..." value={recherche} onChange={e => setRecherche(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none"
                aria-label="Rechercher" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button key={cat.value} onClick={() => setCategorie(cat.value)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${categorie === cat.value ? "bg-[#185FA5] text-white" : "bg-[#F6F8FB] dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {filtrees.length === 0 ? (
            <EtatVide
              icone={BookOpen}
              raison={recherche || categorie ? "filtre" : "vide"}
              titre={recherche || categorie ? "Aucun résultat" : "Aucune actualité publiée"}
              description={recherche || categorie
                ? "Essayez un autre mot-clé ou affichez toutes les catégories."
                : "Les prochaines nouvelles d'AJIHAD paraîtront sur cette page."}
              action={recherche || categorie
                ? { libelle: "Voir toutes les actualités", onClick: () => { setRecherche(""); setCategorie(""); } }
                : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtrees.map((actu: any) => (
                <article key={actu.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 border border-gray-100 dark:border-gray-700 flex flex-col">
                  <div className="h-40 bg-gradient-to-br from-[#185FA5] to-[#4DBFBF]" />
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="tag-pill tag-blue">{categories.find(cat => cat.value === actu.categorie)?.label ?? actu.categorie}</span>
                      {actu.datePublication && (
                        <span className="text-gray-400 dark:text-gray-500 text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(actu.datePublication).toLocaleDateString("fr-HT", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{actu.titre}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-3 flex-1 mb-4">{actu.resume}</p>
                    <Link href={`/actualites/${actu.slug}`} className="inline-flex items-center gap-1 text-[#185FA5] dark:text-blue-400 text-sm font-semibold hover:gap-2 transition-all">
                      Lire la suite <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
