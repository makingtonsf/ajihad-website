import { Link } from "wouter";
import { Building2, ChevronRight } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import SEOHead from "@/components/SEOHead";
import { useConfigSite } from "@/hooks/useConfigSite";

export default function MentionsLegales() {
  const { liste } = useConfigSite();
  const sections = liste("mentions_legales_sections");
  return (
    <PublicLayout>
      <SEOHead
        title="Mentions légales"
        description="Informations éditoriales et légales du site de l'Association des Jeunes Intellectuels Haïtiens."
      />
      <section className="py-20 bg-gradient-to-br from-[#042C53] to-[#185FA5] text-white" aria-labelledby="mentions-heading">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-blue-200/70 text-sm mb-8">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Mentions légales</span>
          </nav>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-[#4DBFBF]" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-[#4DBFBF] mb-3">Informations du site</p>
              <h1 id="mentions-heading" className="text-4xl sm:text-5xl font-extrabold mb-5">Mentions légales</h1>
              <p className="text-lg text-blue-100/90 leading-relaxed">Les informations essentielles pour identifier l'éditeur, comprendre les règles d'utilisation et nous contacter.</p>
            </div>
          </div>
        </div>
      </section>

      <article className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 text-gray-600 dark:text-gray-300 leading-relaxed">
          {sections.map((section, index) => (
            <section key={`${section.titre}-${index}`} aria-labelledby={`legal-section-${index}`}>
              <h2 id={`legal-section-${index}`} className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4">{section.titre}</h2>
              {String(section.contenu ?? "").split(/\n\s*\n/).map((paragraphe, i) => <p key={i}>{paragraphe}</p>)}
            </section>
          ))}

          <div className="rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Signaler une correction</h2>
            <p className="mb-4">Vous avez repéré une information incomplète ou un lien incorrect ?</p>
            <Link href="/contact" className="btn-primary-ajihad inline-flex">Écrire à AJIHAD</Link>
          </div>
        </div>
      </article>
    </PublicLayout>
  );
}
