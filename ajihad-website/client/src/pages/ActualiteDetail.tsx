import { useState } from "react";
import { Link, useParams } from "wouter";
import { toast } from "sonner";
import {
  ArrowLeft, Calendar, ChevronRight, User, Share2, Link2, Facebook, Twitter, FileX,
} from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import SEOHead from "@/components/SEOHead";
import ArticleContent from "@/components/ArticleContent";
import { trpc } from "@/lib/trpc";
import { actualitesStatiques } from "@/data/actualitesStatiques";

const CATEGORIES: Record<string, string> = {
  actualite: "Actualité",
  communique: "Communiqué",
  evenement: "Événement",
  conference: "Conférence",
  formation: "Formation",
  appel_candidature: "Appel à candidature",
  publication: "Publication",
};

function ArticleSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8" />
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl mb-8" />
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4" />
      <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-1/2 mb-8" />
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map(i => <div key={i} className="h-4 bg-gray-100 dark:bg-gray-700 rounded" />)}
      </div>
    </div>
  );
}

export default function ActualiteDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const [partageOuvert, setPartageOuvert] = useState(false);

  const { data: articleDB, isLoading } = trpc.public.actualiteBySlug.useQuery({ slug }, { enabled: Boolean(slug) });
  const articleStatique = actualitesStatiques.find(a => a.slug === slug) ?? null;
  const article = articleDB ?? articleStatique;
  const { data: similaires } = trpc.public.actualites.useQuery(
    { limit: 12, categorie: article?.categorie ?? undefined },
    { enabled: Boolean(articleDB) }
  );

  const articlesDisponibles = similaires && similaires.length > 0 ? similaires : actualitesStatiques;
  const articlesSimilaires = articlesDisponibles
    .filter((a: any) => a.slug !== slug && a.categorie === article?.categorie)
    .slice(0, 3);

  const copierLien = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papiers.");
    } catch {
      toast.error("Impossible de copier le lien.");
    }
    setPartageOuvert(false);
  };

  const partagerSur = (reseau: "facebook" | "twitter") => {
    const url = encodeURIComponent(window.location.href);
    const texte = encodeURIComponent(article?.titre ?? "AJIHAD");
    const cible = reseau === "facebook"
      ? `https://www.facebook.com/sharer/sharer.php?u=${url}`
      : `https://twitter.com/intent/tweet?url=${url}&text=${texte}`;
    window.open(cible, "_blank", "noopener,noreferrer,width=600,height=500");
    setPartageOuvert(false);
  };

  // Un article de démonstration connu ne doit pas rester sur un squelette si
  // la connexion à la base est lente ou indisponible : le contenu statique est
  // déjà complet et peut être affiché immédiatement.
  if (isLoading && !articleStatique) {
    return <PublicLayout><ArticleSkeleton /></PublicLayout>;
  }

  if (!article) {
    return (
      <PublicLayout>
        <SEOHead title="Article introuvable" description="Cet article n'existe pas ou n'est plus publié." noIndex />
        <section className="min-h-[60vh] flex items-center justify-center py-20 px-4">
          <div className="text-center max-w-md">
            <FileX className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-5" />
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">Article introuvable</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Cet article n'existe pas, a été retiré ou n'est pas encore publié.
            </p>
            <Link href="/actualites" className="btn-primary-ajihad justify-center py-3 inline-flex">
              <ArrowLeft className="w-4 h-4" /> Toutes les actualités
            </Link>
          </div>
        </section>
      </PublicLayout>
    );
  }

  const categorieLabel = CATEGORIES[article.categorie ?? "actualite"] ?? article.categorie;

  return (
    <PublicLayout>
      <SEOHead
        title={article.seoTitre || article.titre}
        description={article.seoDescription || article.resume || "Actualité AJIHAD"}
        ogImage={article.imageUrl ?? undefined}
        ogType="article"
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#042C53] to-[#185FA5] text-white pt-12 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-2 text-blue-200/70 text-sm mb-8">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/actualites" className="hover:text-white transition-colors">Actualités</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium line-clamp-1">{article.titre}</span>
          </nav>

          <span className="inline-block px-3 py-1 rounded-full bg-[#4DBFBF]/20 text-[#4DBFBF] text-xs font-semibold mb-4">
            {categorieLabel}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-5">{article.titre}</h1>

          <div className="flex flex-wrap items-center gap-4 text-blue-100/80 text-sm">
            {article.auteur && (
              <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {article.auteur}</span>
            )}
            {article.datePublication && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(article.datePublication).toLocaleDateString("fr-HT", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            )}
          </div>
        </div>
      </section>

      <article className="py-14 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Image */}
          {article.imageUrl && (
            <img src={article.imageUrl} alt={article.titre}
              className="w-full rounded-2xl mb-10 object-cover max-h-[420px]"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}

          {/* Barre d'actions */}
          <div className="flex items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-100 dark:border-gray-800">
            <Link href="/actualites"
              className="inline-flex items-center gap-1.5 text-[#185FA5] dark:text-blue-400 text-sm font-semibold hover:gap-2.5 transition-all">
              <ArrowLeft className="w-4 h-4" /> Toutes les actualités
            </Link>

            <div className="relative">
              <button onClick={() => setPartageOuvert(o => !o)} aria-expanded={partageOuvert}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#F6F8FB] dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Share2 className="w-4 h-4" /> Partager
              </button>
              {partageOuvert && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-40">
                  <button onClick={copierLien}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                    <Link2 className="w-4 h-4" /> Copier le lien
                  </button>
                  <button onClick={() => partagerSur("facebook")}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                    <Facebook className="w-4 h-4" /> Partager sur Facebook
                  </button>
                  <button onClick={() => partagerSur("twitter")}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors">
                    <Twitter className="w-4 h-4" /> Partager sur X
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Contenu */}
          {article.resume && (
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-medium mb-8">{article.resume}</p>
          )}
          {article.contenu ? (
            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-a:text-[#185FA5]">
              <ArticleContent contenu={article.contenu} />
            </div>
          ) : (
            <p className="text-gray-400 dark:text-gray-500 italic">Le contenu complet de cet article sera publié prochainement.</p>
          )}
        </div>
      </article>

      {/* Articles similaires */}
      {articlesSimilaires.length > 0 && (
        <section className="py-16 bg-[#F6F8FB] dark:bg-gray-800/50" aria-labelledby="similaires-heading">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 id="similaires-heading" className="text-2xl font-extrabold text-gray-900 dark:text-white mb-8">
              Articles similaires
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {articlesSimilaires.map((a: any) => (
                <article key={a.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 flex flex-col">
                  <div className="h-32 bg-gradient-to-br from-[#185FA5] to-[#4DBFBF]" />
                  <div className="p-5 flex flex-col flex-1">
                    <span className="tag-pill tag-blue self-start mb-3">{CATEGORIES[a.categorie] ?? a.categorie}</span>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">{a.titre}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs line-clamp-2 flex-1 mb-4">{a.resume}</p>
                    <Link href={`/actualites/${a.slug}`}
                      className="inline-flex items-center gap-1 text-[#185FA5] dark:text-blue-400 text-sm font-semibold hover:gap-2 transition-all">
                      Lire la suite <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
