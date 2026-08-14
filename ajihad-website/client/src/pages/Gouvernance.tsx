import { Link } from "wouter";
import { Shield, FileText, Users, ChevronRight, Award, Scale, Eye, CheckCircle, Download, Heart, Globe } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import SEOHead from "@/components/SEOHead";
import { trpc } from "@/lib/trpc";
import { useConfigSite } from "@/hooks/useConfigSite";

// Habillage des organes : icône et couleur par position. Les textes viennent
// de l'administration (Contenus du site → Gouvernance).
const HABILLAGE_ORGANES = [
  { icon: Award, color: "#185FA5" },
  { icon: Users, color: "#4DBFBF" },
  { icon: Shield, color: "#B64926" },
];

const HABILLAGE_QUALITES = [
  { icon: Users, color: "#185FA5" },
  { icon: Heart, color: "#4DBFBF" },
  { icon: Globe, color: "#B64926" },
];


const documentsStatiques = [
  "Statuts de l'association",
  "Règlement intérieur",
  "Politique de confidentialité",
  "Rapport annuel 2024",
];

export default function Gouvernance() {
  const { txt, liste } = useConfigSite();
  const { data: documentsOfficiels } = trpc.public.documents.useQuery({ categorie: "institutionnel" });
  const aDesDocuments = Boolean(documentsOfficiels && documentsOfficiels.length > 0);

  return (
    <PublicLayout>
      <SEOHead
        title="Gouvernance & Transparence"
        description="Structure de gouvernance, principes de transparence et documents officiels de l'AJIHAD."
      />
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-[#042C53] to-[#185FA5] text-white" aria-labelledby="gouv-hero-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-blue-200/70 text-sm mb-8">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Gouvernance & Transparence</span>
          </nav>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6 border border-white/20">
              <Shield className="w-3.5 h-3.5 text-[#4DBFBF]" />
              {txt("txt_gouv_hero_badge")}
            </div>
            <h1 id="gouv-hero-heading" className="text-4xl sm:text-5xl font-extrabold mb-6">
              {txt("txt_gouv_hero_titre")}
            </h1>
            <p className="text-xl text-blue-100/90 leading-relaxed">
              {txt("txt_gouv_hero_chapo")}
            </p>
          </div>
        </div>
      </section>

      {/* Structure */}
      <section className="py-20 bg-white dark:bg-gray-900" aria-labelledby="structure-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 id="structure-heading" className="section-heading">{txt("txt_gouv_structure_titre")}</h2>
            <p className="section-subheading mx-auto mt-4">
              {txt("txt_gouv_structure_chapo")}
            </p>
          </div>
          <div className="space-y-6">
            {liste("gouvernance_organes").map((organe, i) => {
              const style = HABILLAGE_ORGANES[i % HABILLAGE_ORGANES.length];
              const Icone = style.icon;
              return (
                <div key={i} className="bg-[#F6F8FB] dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-5">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${style.color}15` }}>
                    <Icone className="w-7 h-7" style={{ color: style.color }} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="font-bold text-gray-900 dark:text-white">{organe.nom}</h3>
                      {organe.role && <span className="tag-pill tag-blue">{organe.role}</span>}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{organe.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Les trois qualités d'appartenance */}
          <div className="mt-14">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Appartenir à AJIHAD</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-7 max-w-2xl">
              On rejoint l'association de trois façons. Elles ne se valent pas en engagement, mais toutes
              comptent.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {liste("gouvernance_qualites").map((q, i) => {
                const style = HABILLAGE_QUALITES[i % HABILLAGE_QUALITES.length];
                const Icone = style.icon;
                return (
                  <div key={i} className="bg-[#F6F8FB] dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${style.color}15` }}>
                      <Icone className="w-5 h-5" style={{ color: style.color }} />
                    </div>
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">{q.nom}</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{q.description}</p>
                  </div>
                );
              })}
            </div>
            <Link href="/s-impliquer" className="inline-flex items-center gap-1.5 mt-6 text-[#185FA5] dark:text-blue-400 font-semibold text-sm hover:gap-2.5 transition-all">
              Rejoindre AJIHAD <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Principes */}
      <section id="ethique" className="py-20 bg-[#F6F8FB] dark:bg-gray-800/50" aria-labelledby="principes-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <h2 id="principes-heading" className="section-heading mb-6">{txt("txt_gouv_principes_titre")}</h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                {txt("txt_gouv_principes_chapo")}
              </p>
              <div className="space-y-3">
                {liste("gouvernance_principes").map((p, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#4DBFBF] flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{p.texte}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <Scale className="w-6 h-6 text-[#185FA5]" />
                  <h3 className="font-bold text-gray-900 dark:text-white">Code d'éthique</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                  Tous les membres d'AJIHAD s'engagent à respecter un code d'éthique strict qui définit les standards de comportement, d'intégrité et de responsabilité attendus.
                </p>
                <Link href="/ressources" className="text-[#185FA5] dark:text-blue-400 text-sm font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
                  Consulter les ressources d'éthique <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="w-6 h-6 text-[#B64926]" />
                  <h3 className="font-bold text-gray-900 dark:text-white">Documents officiels</h3>
                </div>
                <div className="space-y-2">
                  {aDesDocuments ? (
                    documentsOfficiels!.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between gap-3 p-2.5 bg-[#F6F8FB] dark:bg-gray-700 rounded-lg">
                        <div className="min-w-0">
                          <p className="text-gray-700 dark:text-gray-300 text-sm truncate">{doc.titre}</p>
                          <p className="text-gray-400 dark:text-gray-500 text-xs">
                            {[doc.version, doc.dateDocument ? new Date(doc.dateDocument).getFullYear() : null]
                              .filter(Boolean).join(" · ") || (doc.fileType ?? "PDF")}
                          </p>
                        </div>
                        {doc.fileUrl ? (
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                            aria-label={`Télécharger ${doc.titre}`}
                            className="flex items-center gap-1 text-[#185FA5] dark:text-blue-400 text-xs font-semibold hover:underline flex-shrink-0">
                            <Download className="w-3.5 h-3.5" /> Télécharger
                          </a>
                        ) : (
                          <Link href="/ressources" className="text-[#185FA5] dark:text-blue-400 text-xs font-semibold hover:underline flex-shrink-0">Voir</Link>
                        )}
                      </div>
                    ))
                  ) : (
                    documentsStatiques.map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-2.5 bg-[#F6F8FB] dark:bg-gray-700 rounded-lg">
                        <span className="text-gray-700 dark:text-gray-300 text-sm">{doc}</span>
                        <Link href={doc === "Politique de confidentialité" ? "/confidentialite" : "/ressources"} className="text-[#185FA5] dark:text-blue-400 text-xs font-semibold hover:underline">Consulter</Link>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
