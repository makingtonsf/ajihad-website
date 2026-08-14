import { Link } from "wouter";
import { ArrowRight, Target, Eye, Heart, Shield, Star, Users, Globe, Lightbulb, BookOpen, Award, ChevronRight } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { useConfigSite } from "@/hooks/useConfigSite";
import SEOHead from "@/components/SEOHead";


const ICONES_EQUIPE = [Award, Target, BookOpen, Users];

const HABILLAGE_VALEURS_APROPOS = [
  { icon: Shield, color: "#185FA5" },
  { icon: Heart, color: "#B64926" },
  { icon: Users, color: "#4DBFBF" },
  { icon: Star, color: "#F4A022" },
  { icon: Lightbulb, color: "#185FA5" },
  { icon: Globe, color: "#4DBFBF" },
];

export default function APropos() {
  const { liste, txt } = useConfigSite();
  return (
    <PublicLayout>
      <SEOHead
        title="À propos d'AJIHAD"
        description="Histoire, mission, vision, valeurs et équipe de l'Association des Jeunes Intellectuels Haïtiens pour l'Avenir et le Développement."
      />
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-br from-[#042C53] to-[#185FA5] text-white overflow-hidden" aria-labelledby="about-hero-heading">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/images/fond-accueil.png')", backgroundSize: "cover" }} aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-blue-200/70 text-sm mb-8">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">À propos</span>
          </nav>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-6 border border-white/20">
              <Users className="w-3.5 h-3.5 text-[#4DBFBF]" />
              {txt("txt_apropos_hero_badge")}
            </div>
            <h1 id="about-hero-heading" className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight">
              {txt("txt_apropos_hero_titre")}
            </h1>
            <p className="text-xl text-blue-100/90 leading-relaxed max-w-2xl">
              {txt("txt_apropos_hero_chapo")}
            </p>
          </div>
        </div>
      </section>

      {/* Notre histoire */}
      <section id="histoire" className="py-20 bg-white dark:bg-gray-900" aria-labelledby="histoire-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-[#185FA5] dark:text-blue-400 rounded-full text-sm font-semibold mb-6">
                <BookOpen className="w-3.5 h-3.5" />
                Notre histoire
              </div>
              <h2 id="histoire-heading" className="section-heading mb-6">{txt("txt_apropos_histoire_titre")}</h2>
              <div className="space-y-4 text-gray-600 dark:text-gray-300 leading-relaxed">
                <p>{txt("txt_apropos_histoire_chapo")}</p>
                {txt("txt_apropos_histoire_suite").split(/\n\s*\n/).map((paragraphe, i) => <p key={i}>{paragraphe}</p>)}
              </div>
            </div>
            <div className="space-y-4">
              {[
                { annee: "Origines", titre: "Création d'AJIHAD", desc: "Naissance de l'association avec un premier groupe de jeunes intellectuels déterminés à agir." },
                { annee: "Structuration", titre: "Premiers projets", desc: "Mise en place des commissions thématiques et lancement des premières initiatives communautaires." },
                { annee: "Rayonnement", titre: "Développement régional", desc: "Extension du réseau à plusieurs communes de l'Artibonite et au-delà, avec des partenariats stratégiques." },
                { annee: "2026", titre: "PROJEFA & AJI CONNECT", desc: "Lancement du programme phare PROJEFA 2026 et de la stratégie de digitalisation AJI CONNECT." },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-4 bg-[#F6F8FB] dark:bg-gray-800 rounded-xl">
                  <div className="w-16 h-10 bg-[#185FA5] text-white rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">{item.annee}</div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{item.titre}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section id="mission" className="py-20 bg-[#F6F8FB] dark:bg-gray-800/50" aria-labelledby="mission-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 id="mission-heading" className="section-heading">Mission & Vision</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-[#185FA5]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Notre Mission</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Promouvoir le développement intégral des jeunes à travers l'éducation, le leadership et l'engagement citoyen afin de renforcer leurs capacités intellectuelles, sociales et professionnelles, et les préparer à jouer un rôle actif dans la transformation positive d'Haïti.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center mb-6">
                <Eye className="w-6 h-6 text-[#4DBFBF]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Notre Vision</h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                Contribuer, à l'horizon 2035, à une société haïtienne où les jeunes sont éduqués, engagés, responsables et capables de participer activement à des initiatives qui améliorent durablement leur environnement social, économique et communautaire.
              </p>
            </div>
          </div>
          <div className="mt-8 bg-gradient-to-r from-[#042C53] to-[#185FA5] rounded-2xl p-8 text-white text-center">
            <p className="text-2xl font-bold italic text-[#4DBFBF] mb-2">« Inspirer la jeunesse, transformer l'avenir. »</p>
            <p className="text-blue-200/70 text-sm">— Devise d'AJIHAD</p>
          </div>
        </div>
      </section>

      {/* Valeurs */}
      <section id="valeurs" className="py-20 bg-white dark:bg-gray-900" aria-labelledby="valeurs-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 id="valeurs-heading" className="section-heading">Nos valeurs fondamentales</h2>
            <p className="section-subheading mx-auto mt-4">Les principes qui guident chacune de nos actions et décisions au quotidien.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {liste("apropos_valeurs").map((v, i) => {
              const style = HABILLAGE_VALEURS_APROPOS[i % HABILLAGE_VALEURS_APROPOS.length];
              const Icone = style.icon;
              return (
                <div key={i} className="p-6 bg-[#F6F8FB] dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: `${style.color}15` }}>
                    <Icone className="w-6 h-6" style={{ color: style.color }} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{v.titre}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Structure organisationnelle */}
      <section id="equipe" className="py-20 bg-[#F6F8FB] dark:bg-gray-800/50" aria-labelledby="equipe-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 id="equipe-heading" className="section-heading">Notre organisation</h2>
            <p className="section-subheading mx-auto mt-4">Les organes et équipes qui portent les projets d'AJIHAD au quotidien.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {liste("apropos_equipe").map((e, i) => {
              const Icone = ICONES_EQUIPE[i % ICONES_EQUIPE.length];
              return (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icone className="w-6 h-6 text-[#185FA5]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">{e.nom}</h3>
                    {e.role && <span className="tag-pill tag-blue mb-3 inline-block">{e.role}</span>}
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{e.description}</p>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <Link href="/gouvernance" className="btn-primary-ajihad">
              Voir la gouvernance complète
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#042C53] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-heading text-current mb-6">Rejoignez la famille AJIHAD</h2>
          <p className="text-blue-200/80 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            Que vous souhaitiez devenir membre, bénévole, partenaire ou simplement suivre nos activités, il y a une place pour vous dans notre communauté.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/s-impliquer" className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-[#185FA5] font-bold rounded-xl hover:bg-blue-50 transition-colors">
              S'impliquer <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
