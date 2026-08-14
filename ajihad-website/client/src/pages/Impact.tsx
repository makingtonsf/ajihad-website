import { Link } from "wouter";
import { BarChart3, TrendingUp, Users, TreePine, BookOpen, Wifi, ChevronRight, Target } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { useConfigSite } from "@/hooks/useConfigSite";
import SEOHead from "@/components/SEOHead";
import { trpc } from "@/lib/trpc";

const indicateursStatiques = [
  { categorie: "Formation & Éducation", items: [
    { nom: "Jeunes ciblés par PROJEFA 2026", valeur: "250", unite: "+", periode: "2026", zone: "Artibonite & Ouest" },
    { nom: "Semaines de formation prévues", valeur: "8", unite: "", periode: "2026", zone: "National" },
    { nom: "Modules thématiques", valeur: "5", unite: "", periode: "2026", zone: "National" },
  ]},
  { categorie: "Inclusion & Équité", items: [
    { nom: "Participation féminine visée", valeur: "40", unite: "%", periode: "2026", zone: "National" },
    { nom: "Communes ciblées", valeur: "8", unite: "+", periode: "2025–2026", zone: "Artibonite" },
    { nom: "Projets prioritaires actifs", valeur: "4", unite: "", periode: "2025–2026", zone: "National" },
  ]},
  { categorie: "Environnement", items: [
    { nom: "Initiative de reboisement", valeur: "1", unite: "", periode: "2025–2026", zone: "Gonaïves" },
    { nom: "Zones d'intervention environnementale", valeur: "3", unite: "+", periode: "2025–2026", zone: "Artibonite" },
  ]},
  { categorie: "Numérique & Innovation", items: [
    { nom: "Projet de digitalisation (AJI CONNECT)", valeur: "1", unite: "", periode: "2025–2026", zone: "National" },
    { nom: "Services digitalisés prévus", valeur: "5", unite: "+", periode: "2026", zone: "National" },
  ]},
];

const HABILLAGE_AXES_IMPACT = [
  { icon: BookOpen, color: "#185FA5" },
  { icon: Users, color: "#B64926" },
  { icon: TreePine, color: "#4DBFBF" },
  { icon: Wifi, color: "#F4A022" },
];

export default function Impact() {
  const { liste } = useConfigSite();
  const { data: indicateursDB } = trpc.public.indicateurs.useQuery();

  return (
    <PublicLayout>
      <SEOHead
        title="Notre impact"
        description="Indicateurs, objectifs et résultats suivis des actions d'AJIHAD auprès de la jeunesse haïtienne."
      />
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-[#042C53] to-[#185FA5] text-white" aria-labelledby="impact-hero-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-blue-200/70 text-sm mb-8">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Impact & Résultats</span>
          </nav>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6 border border-white/20">
              <BarChart3 className="w-3.5 h-3.5 text-[#4DBFBF]" />
              Mesurer pour mieux agir
            </div>
            <h1 id="impact-hero-heading" className="text-4xl sm:text-5xl font-extrabold mb-6">
              Notre impact <span className="text-[#4DBFBF]">en chiffres</span>
            </h1>
            <p className="text-xl text-blue-100/90 leading-relaxed">
              AJIHAD s'engage à rendre compte de ses résultats de manière transparente et rigoureuse. Voici les indicateurs clés qui témoignent de notre action sur le terrain.
            </p>
          </div>
        </div>
      </section>

      {/* Axes d'impact */}
      <section className="py-16 bg-white dark:bg-gray-900" aria-labelledby="axes-impact-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="axes-impact-heading" className="section-heading text-center mb-12">Nos axes d'impact</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {liste("impact_axes").map((axe, i) => {
              const style = HABILLAGE_AXES_IMPACT[i % HABILLAGE_AXES_IMPACT.length];
              const Icone = style.icon;
              return (
                <div key={i} className="text-center p-6 bg-[#F6F8FB] dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${style.color}15` }}>
                    <Icone className="w-7 h-7" style={{ color: style.color }} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">{axe.titre}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{axe.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Indicateurs */}
      <section className="py-20 bg-[#F6F8FB] dark:bg-gray-800/50" aria-labelledby="indicateurs-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 id="indicateurs-heading" className="section-heading">Indicateurs de performance</h2>
            <p className="section-subheading mx-auto mt-4">
              Indicateurs de référence et objectifs déclarés par AJIHAD. Dernière mise à jour : 2025–2026.
            </p>
          </div>

          {indicateursDB && indicateursDB.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {indicateursDB.map((ind: any) => (
                <div key={ind.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                  <div className="text-3xl font-extrabold text-[#185FA5] dark:text-blue-400 mb-2">{ind.valeur}{ind.unite}</div>
                  <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{ind.nom}</div>
                  {ind.periode && <div className="text-gray-500 dark:text-gray-400 text-xs">{ind.periode}</div>}
                  {ind.zone && <div className="text-gray-400 dark:text-gray-500 text-xs">{ind.zone}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-10">
              {indicateursStatiques.map((cat, ci) => (
                <div key={ci}>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-[#185FA5] rounded-full" />
                    {cat.categorie}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cat.items.map((ind, ii) => (
                      <div key={ii} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="text-3xl font-extrabold text-[#185FA5] dark:text-blue-400 mb-2">{ind.valeur}{ind.unite}</div>
                        <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{ind.nom}</div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{ind.periode}</span>
                          {ind.zone && <><span>·</span><span>{ind.zone}</span></>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Méthodologie */}
      <section className="py-20 bg-white dark:bg-gray-900" aria-labelledby="methodo-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 id="methodo-heading" className="section-heading mb-6">Notre approche de suivi & évaluation</h2>
              <div className="space-y-5">
                {[
                  { icon: Target, titre: "Indicateurs SMART", desc: "Chaque projet est doté d'indicateurs Spécifiques, Mesurables, Atteignables, Réalistes et Temporellement définis." },
                  { icon: TrendingUp, titre: "Suivi continu", desc: "Les données sont collectées et analysées tout au long de la mise en œuvre des projets." },
                  { icon: BarChart3, titre: "Publication progressive", desc: "Les résultats et rapports sont préparés puis ajoutés aux ressources publiques après validation éditoriale." },
                  { icon: Users, titre: "Participation communautaire", desc: "Les bénéficiaires sont impliqués dans l'évaluation de l'impact des programmes." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-[#185FA5]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.titre}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#042C53] rounded-2xl p-8 text-white">
              <h3 className="text-xl font-bold mb-6">Transparence financière</h3>
              <p className="text-blue-100/80 leading-relaxed mb-6">
                AJIHAD s'engage à documenter la gestion de ses ressources. Les documents publiés sont listés dans la page Ressources ; les versions en préparation y sont signalées clairement.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-blue-200/80 text-sm">Rapport annuel 2024</span>
                  <span className="tag-pill tag-blue">En préparation</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <span className="text-blue-200/80 text-sm">Plan stratégique 2025–2030</span>
                  <span className="tag-pill tag-blue">En préparation</span>
                </div>
              </div>
              <Link href="/ressources" className="mt-6 inline-flex items-center gap-2 text-[#4DBFBF] text-sm font-semibold hover:gap-3 transition-all">
                Accéder aux ressources <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
