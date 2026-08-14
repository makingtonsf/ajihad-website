import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight, Heart, BookOpen, Users, Globe, Lightbulb, Shield, Star,
  ChevronRight, Award, Target, Handshake, TreePine, Library, Wifi, Quote
} from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import { useConfigSite } from "@/hooks/useConfigSite";
import SEOHead from "@/components/SEOHead";
import EtatVide from "@/components/EtatVide";
import { trpc } from "@/lib/trpc";

const TYPES_PARTENAIRE = [
  { value: "", label: "Tous" },
  { value: "bailleur", label: "Bailleurs" },
  { value: "technique", label: "Techniques" },
  { value: "institutionnel", label: "Institutionnels" },
];

// Placeholders textuels affichés tant qu'aucun partenaire n'est publié en base.
const PARTENAIRES_PLACEHOLDER = [
  "Institutions éducatives",
  "Collectivités locales",
  "Organisations de la diaspora",
  "Partenaires techniques",
];


const initiales = (nom: string) =>
  nom.split(/\s+/).filter(Boolean).slice(0, 2).map(m => m[0]).join("").toUpperCase();

const HABILLAGE_VALEURS = [
  { icon: Shield, label: "Intégrité", color: "text-[#185FA5]", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { icon: Heart, label: "Solidarité", color: "text-[#B64926]", bg: "bg-orange-50 dark:bg-orange-900/20" },
  { icon: Users, label: "Inclusion", color: "text-[#4DBFBF]", bg: "bg-teal-50 dark:bg-teal-900/20" },
  { icon: Star, label: "Responsabilité", color: "text-[#F4A022]", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
  { icon: Lightbulb, label: "Innovation", color: "text-[#185FA5]", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { icon: Globe, label: "Transparence", color: "text-[#4DBFBF]", bg: "bg-teal-50 dark:bg-teal-900/20" },
];

const HABILLAGE_AXES = [
  { icon: BookOpen, titre: "Éducation & Formation", desc: "Renforcer les capacités intellectuelles et professionnelles des jeunes.", color: "#185FA5" },
  { icon: Star, titre: "Leadership des Jeunes", desc: "Développer des leaders responsables et engagés pour demain.", color: "#B64926" },
  { icon: Globe, titre: "Engagement Citoyen", desc: "Encourager la participation communautaire et la cohésion sociale.", color: "#4DBFBF" },
  { icon: Users, titre: "Développement Communautaire", desc: "Soutenir les initiatives qui améliorent les conditions de vie.", color: "#F4A022" },
  { icon: Lightbulb, titre: "Innovation Numérique", desc: "Intégrer les technologies au service du développement.", color: "#185FA5" },
  { icon: TreePine, titre: "Environnement", desc: "Protéger et valoriser l'environnement haïtien.", color: "#4DBFBF" },
];

const HABILLAGE_PROJETS = [
  { icon: BookOpen, tagColor: "tag-blue" },
  { icon: TreePine, tagColor: "tag-teal" },
  { icon: Library, tagColor: "tag-gold" },
  { icon: Wifi, tagColor: "tag-red" },
];

export default function Accueil() {
  const { liste, sectionVisible, txt } = useConfigSite();
  const { data: indicateurs } = trpc.public.indicateurs.useQuery();
  const { data: actualites } = trpc.public.actualites.useQuery({ limit: 3 });
  const { data: partenaires } = trpc.public.partenaires.useQuery();
  const [typePartenaire, setTypePartenaire] = useState("");

  const partenairesAffiches = (partenaires || []).filter(
    (p: any) => !typePartenaire || p.type === typePartenaire
  );
  const aDesPartenaires = (partenaires || []).length > 0;

  return (
    <PublicLayout>
      <SEOHead
        title="Inspirer la jeunesse, transformer l'avenir"
        description="AJIHAD renforce les capacités des jeunes haïtiens par l'éducation, le leadership, l'engagement citoyen et l'action communautaire concrète."
      />
      {/* ===== HERO ===== */}
      <section
        className="relative min-h-[85vh] flex items-center overflow-hidden"
        aria-labelledby="hero-heading"
        style={{
          background: "linear-gradient(135deg, #042C53 0%, #185FA5 55%, #1a7a7a 100%)",
        }}
      >
        {/* Background image overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url('/images/fond-accueil.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden="true"
        />
        {/* Decorative circles */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#4DBFBF]/10 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-1/4 left-1/6 w-64 h-64 bg-[#185FA5]/20 rounded-full blur-2xl" aria-hidden="true" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium mb-8 border border-white/20">
              <span className="w-2 h-2 bg-[#4DBFBF] rounded-full animate-pulse" />
              {txt("txt_accueil_hero_badge")}
            </div>

            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6"
            >
              {txt("txt_accueil_hero_titre")}
            </h1>

            <p className="text-lg sm:text-xl text-blue-100/90 leading-relaxed mb-10 max-w-2xl">
              {txt("txt_accueil_hero_chapo")}
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/nos-actions"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-[#185FA5] font-bold rounded-xl hover:bg-blue-50 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 text-base"
              >
                {txt("txt_accueil_cta_actions")}
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/projefa-2026"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#4DBFBF] text-white font-bold rounded-xl hover:bg-[#3aa0a0] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 text-base"
              >
                <BookOpen className="w-4 h-4" />
                {txt("txt_accueil_cta_projefa")}
              </Link>
              <Link
                href="/soutenir"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#B64926]/90 text-white font-bold rounded-xl hover:bg-[#B64926] transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 text-base"
              >
                <Heart className="w-4 h-4" />
                {txt("txt_accueil_cta_soutenir")}
              </Link>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0" aria-hidden="true">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 60L1440 60L1440 20C1200 60 960 0 720 20C480 40 240 0 0 20L0 60Z" fill="white" className="dark:fill-gray-900" />
          </svg>
        </div>
      </section>

      {/* ===== MISSION ===== */}
      <section className="py-20 bg-white dark:bg-gray-900" aria-labelledby="mission-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-[#185FA5] dark:text-blue-400 rounded-full text-sm font-semibold mb-6">
                <Target className="w-3.5 h-3.5" />
                {txt("txt_accueil_mission_badge")}
              </div>
              <h2 id="mission-heading" className="section-heading mb-6">
                {txt("txt_accueil_mission_titre")}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                {txt("txt_accueil_mission_chapo")}
              </p>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                {txt("txt_accueil_vision")}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/a-propos" className="btn-primary-ajihad">
                  En savoir plus sur AJIHAD
                  <ChevronRight className="w-4 h-4" />
                </Link>
                <Link href="/gouvernance" className="btn-outline-ajihad">
                  Transparence & Gouvernance
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                {/* Cette image porte du texte : elle doit rester entière.
                    Une hauteur fixe avec object-cover rognait 48 % de la
                    largeur sur mobile et coupait la citation. On conserve
                    donc ses proportions (1804×872) à toutes les tailles. */}
                <img
                  src="/images/citation-jeunesse.png"
                  alt="Citation AJIHAD : la jeunesse d'aujourd'hui est l'intelligence de demain"
                  width={1804}
                  height={872}
                  className="w-full h-auto block"
                  loading="lazy"
                />
              </div>

              {/* Sous l'image sur mobile — la superposer masquerait le texte
                  qu'elle contient — puis flottante à partir de sm. */}
              <div className="mt-4 sm:mt-0 sm:absolute sm:-bottom-6 sm:-left-6 bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-5 shadow-xl border border-gray-100 dark:border-gray-700 sm:max-w-xs">
                <p className="text-[#185FA5] dark:text-blue-400 font-bold text-sm italic">
                  « Inspirer la jeunesse, transformer l'avenir. »
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">— AJIHAD</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== AXES D'INTERVENTION ===== */}
      {sectionVisible("section_accueil_axes") && (
      <section className="py-20 bg-[#F6F8FB] dark:bg-gray-800/50" aria-labelledby="axes-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 id="axes-heading" className="section-heading">{txt("txt_accueil_axes_titre")}</h2>
            <p className="section-subheading mx-auto mt-4">
              {txt("txt_accueil_axes_chapo")}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {liste("accueil_axes").map((axe, i) => {
              const style = HABILLAGE_AXES[i % HABILLAGE_AXES.length];
              const Icone = style.icon;
              return (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 border border-gray-100 dark:border-gray-700 group"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${axe.color}15` }}
                >
                  <Icone className="w-6 h-6" style={{ color: style.color }} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-[#185FA5] dark:group-hover:text-blue-400 transition-colors">
                  {axe.titre}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{axe.description}</p>
              </div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* ===== PROJETS PHARES ===== */}
      {sectionVisible("section_accueil_projets") && (
      <section className="py-20 bg-white dark:bg-gray-900" aria-labelledby="projets-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <h2 id="projets-heading" className="section-heading">{txt("txt_accueil_projets_titre")}</h2>
              <p className="section-subheading mt-3">
                {txt("txt_accueil_projets_chapo")}
              </p>
            </div>
            <Link href="/nos-actions" className="btn-outline-ajihad whitespace-nowrap">
              Voir tous les projets
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {liste("accueil_projets_phares").map((projet, i) => {
              const style = HABILLAGE_PROJETS[i % HABILLAGE_PROJETS.length];
              const Icone = style.icon;
              return (
              <article
                key={i}
                className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1 flex flex-col"
              >
                <div className="h-36 bg-gradient-to-br from-[#042C53] to-[#185FA5] flex items-center justify-center">
                  <Icone className="w-12 h-12 text-white/60" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  {projet.etiquette && (
                    <span className={`tag-pill ${style.tagColor} mb-3 self-start`}>{projet.etiquette}</span>
                  )}
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{projet.titre}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-3">{projet.sousTitre}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-1 mb-4">{projet.resume}</p>
                  <Link
                    href={projet.lien || "/nos-actions"}
                    className="inline-flex items-center gap-1 text-[#185FA5] dark:text-blue-400 text-sm font-semibold hover:gap-2 transition-all"
                  >
                    Découvrir le projet
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* ===== IMPACT ===== */}
      {sectionVisible("section_accueil_impact") && (
      <section className="py-20 bg-[#042C53] text-white" aria-labelledby="impact-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 id="impact-heading" className="section-heading text-white mb-4">
              Notre impact en chiffres
            </h2>
            <p className="text-blue-200/80 text-lg max-w-2xl mx-auto">
              Des indicateurs de suivi et des objectifs publiés pour rendre visible le travail concret d'AJIHAD sur le terrain.
            </p>
          </div>

          {indicateurs && indicateurs.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {indicateurs.slice(0, 4).map((ind: any) => (
                <div key={ind.id} className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-4xl font-extrabold text-[#4DBFBF] mb-2">
                    {ind.valeur}{ind.unite}
                  </div>
                  <div className="text-blue-100/80 text-sm">{ind.nom}</div>
                  {ind.periode && <div className="text-blue-200/50 text-xs mt-1">{ind.periode}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Jeunes ciblés en 2026", valeur: "250+", note: "PROJEFA 2026" },
                { label: "Zones d'intervention", valeur: "8+", note: "Artibonite & Ouest" },
                { label: "Projets prioritaires", valeur: "4", note: "En cours & planifiés" },
                { label: "Femmes participantes", valeur: "40%", note: "Objectif inclusif" },
              ].map((stat, i) => (
                <div key={i} className="text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                  <div className="text-4xl font-extrabold text-[#4DBFBF] mb-2">{stat.valeur}</div>
                  <div className="text-blue-100/80 text-sm font-medium">{stat.label}</div>
                  <div className="text-blue-200/50 text-xs mt-1">{stat.note}</div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/impact" className="inline-flex items-center gap-2 px-6 py-3 bg-[#4DBFBF] text-white font-semibold rounded-xl hover:bg-[#3aa0a0] transition-colors">
              Voir tous nos indicateurs
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
      )}

      {/* ===== VALEURS ===== */}
      {sectionVisible("section_accueil_valeurs") && (
      <section className="py-20 bg-[#F6F8FB] dark:bg-gray-800/50" aria-labelledby="valeurs-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="valeurs-heading" className="section-heading">{txt("txt_accueil_valeurs_titre")}</h2>
            <p className="section-subheading mx-auto mt-4">
              {txt("txt_accueil_valeurs_chapo")}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {liste("accueil_valeurs").map((v, i) => {
              const style = HABILLAGE_VALEURS[i % HABILLAGE_VALEURS.length];
              const Icone = style.icon;
              return (
              <div key={i} className={`${style.bg} rounded-xl p-5 text-center hover:shadow-md transition-all duration-200 hover:-translate-y-1`}>
                <Icone className={`w-7 h-7 ${style.color} mx-auto mb-3`} />
                <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{v.label}</span>
              </div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* ===== PARTENAIRES ===== */}
      {sectionVisible("section_accueil_partenaires") && (
      <section className="py-20 bg-white dark:bg-gray-900" aria-labelledby="partenaires-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 id="partenaires-heading" className="section-heading">{txt("txt_accueil_partenaires_titre")}</h2>
            <p className="section-subheading mx-auto mt-4">
              {txt("txt_accueil_partenaires_chapo")}
            </p>
          </div>

          {aDesPartenaires ? (
            <>
              <div className="flex justify-center flex-wrap gap-2 mb-10">
                {TYPES_PARTENAIRE.map(t => (
                  <button key={t.value} onClick={() => setTypePartenaire(t.value)}
                    aria-pressed={typePartenaire === t.value}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${typePartenaire === t.value ? "bg-[#185FA5] text-white" : "bg-[#F6F8FB] dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {partenairesAffiches.length === 0 ? (
                <EtatVide
                  icone={Handshake}
                  raison={typePartenaire ? "filtre" : "vide"}
                  titre={typePartenaire ? "Aucun partenaire dans cette catégorie" : "Aucun partenaire"}
                  description={typePartenaire ? undefined : "Les organisations qui soutiennent AJIHAD seront présentées ici."}
                  action={typePartenaire ? { libelle: "Voir tous les partenaires", onClick: () => setTypePartenaire("") } : undefined}
                />
              ) : (
                <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                  {partenairesAffiches.map((p: any) => {
                    const contenu = (
                      <>
                        {p.logoUrl ? (
                          <img src={p.logoUrl} alt={`Logo ${p.nom}`} className="h-12 max-w-full object-contain mb-3"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <span className="w-12 h-12 rounded-xl bg-[#185FA5]/10 text-[#185FA5] flex items-center justify-center font-extrabold mb-3">
                            {initiales(p.nom)}
                          </span>
                        )}
                        <span className="text-gray-700 dark:text-gray-300 text-xs font-semibold text-center line-clamp-2">{p.nom}</span>
                      </>
                    );
                    return (
                      <li key={p.id}>
                        {p.siteWeb ? (
                          <a href={p.siteWeb} target="_blank" rel="noopener noreferrer"
                            className="h-full flex flex-col items-center justify-center p-5 bg-[#F6F8FB] dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                            {contenu}
                          </a>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center p-5 bg-[#F6F8FB] dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                            {contenu}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-5">
              {PARTENAIRES_PLACEHOLDER.map((label, i) => (
                <li key={i} className="flex flex-col items-center justify-center p-6 bg-[#F6F8FB] dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  <Handshake className="w-7 h-7 text-gray-300 dark:text-gray-600 mb-2" />
                  <span className="text-gray-500 dark:text-gray-400 text-xs font-medium text-center">{label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
      )}

      {/* ===== TEMOIGNAGES ===== */}
      {sectionVisible("section_accueil_temoignages") && (
      <section className="py-20 bg-[#F6F8FB] dark:bg-gray-800/50" aria-labelledby="temoignages-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="temoignages-heading" className="section-heading">{txt("txt_accueil_temoignages_titre")}</h2>
            <p className="section-subheading mx-auto mt-4">
              {txt("txt_accueil_temoignages_chapo")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {liste("accueil_temoignages").map((t, i) => (
              <figure key={i} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 border-l-4 border-l-[#4DBFBF] shadow-sm flex flex-col">
                <Quote className="w-6 h-6 text-[#4DBFBF] mb-4" aria-hidden="true" />
                <blockquote className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-1">
                  {t.citation}
                </blockquote>
                <figcaption className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-100 dark:border-gray-700">
                  <span className="w-10 h-10 rounded-full bg-[#185FA5]/10 text-[#185FA5] flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {initiales(t.nom)}
                  </span>
                  <span>
                    <span className="block font-bold text-gray-900 dark:text-white text-sm">{t.nom}</span>
                    <span className="block text-gray-500 dark:text-gray-400 text-xs">{t.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ===== POURQUOI SOUTENIR ===== */}
      <section className="py-20 bg-white dark:bg-gray-900" aria-labelledby="soutenir-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 id="soutenir-heading" className="section-heading mb-6">
                {txt("txt_accueil_soutenir_titre")}
              </h2>
              <div className="space-y-5">
                {[
                  { icon: Award, titre: "Impact mesurable", desc: "Chaque contribution est orientée vers des activités concrètes avec des indicateurs de suivi validés." },
                  { icon: Shield, titre: "Gestion documentée", desc: "Gouvernance, ressources et informations financières sont publiées progressivement." },
                  { icon: Handshake, titre: "Partenariat de confiance", desc: "AJIHAD collabore avec des partenaires locaux et internationaux pour maximiser l'impact de chaque initiative." },
                  { icon: Users, titre: "Jeunesse au cœur", desc: "Nos actions sont conçues pour renforcer l'autonomie et l'avenir des jeunes haïtiens." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-[#185FA5] dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">{item.titre}</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#042C53] to-[#185FA5] rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-4">Soutenez notre mission</h3>
              <p className="text-blue-100/90 leading-relaxed mb-8">
                Votre contribution aide AJIHAD à créer davantage d'espaces de formation, d'accompagnement et d'action pour les jeunes haïtiens. Chaque geste compte.
              </p>
              <div className="space-y-3">
                <Link href="/soutenir" className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-white text-[#185FA5] font-bold rounded-xl hover:bg-blue-50 transition-colors">
                  <Heart className="w-4 h-4" />
                  Faire une contribution
                </Link>
                <Link href="/s-impliquer#partenariat" className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20">
                  <Handshake className="w-4 h-4" />
                  Proposer un partenariat
                </Link>
                <Link href="/s-impliquer#benevole" className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-[#4DBFBF]/20 text-[#4DBFBF] font-semibold rounded-xl hover:bg-[#4DBFBF]/30 transition-colors border border-[#4DBFBF]/30">
                  <Users className="w-4 h-4" />
                  Devenir bénévole
                </Link>
              </div>
              <p className="text-blue-200/60 text-xs mt-6 text-center">
                Aucune donnée bancaire n'est stockée sur ce site. Les contributions sont traitées de manière sécurisée.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ACTUALITES ===== */}
      {actualites && actualites.length > 0 && (
        <section className="py-20 bg-[#F6F8FB] dark:bg-gray-800/50" aria-labelledby="actu-heading">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
              <div>
                <h2 id="actu-heading" className="section-heading">{txt("txt_accueil_actualites_titre")}</h2>
              </div>
              <Link href="/actualites" className="btn-outline-ajihad whitespace-nowrap">
                Toutes les actualités
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {actualites.map((actu: any) => (
                <article key={actu.id} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
                  <div className="h-40 bg-gradient-to-br from-[#185FA5] to-[#4DBFBF]" />
                  <div className="p-5">
                    <span className="tag-pill tag-blue mb-3 inline-block">{actu.categorie}</span>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">{actu.titre}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">{actu.resume}</p>
                    <Link href={`/actualites/${actu.slug}`} className="text-[#185FA5] dark:text-blue-400 text-sm font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all">
                      Lire la suite <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA FINAL ===== */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#4DBFBF]/10 text-[#2a9090] dark:text-[#4DBFBF] rounded-full text-sm font-semibold mb-6">
            <Star className="w-3.5 h-3.5" />
            Rejoignez le mouvement
          </div>
          <h2 className="section-heading mb-6">
            Ensemble, construisons l'avenir d'Haïti
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
            Que vous soyez jeune, professionnel, membre de la diaspora ou partenaire institutionnel, il existe une façon de contribuer au développement durable d'Haïti avec AJIHAD.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/s-impliquer" className="btn-primary-ajihad text-base px-8 py-4">
              S'impliquer maintenant
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/contact" className="btn-outline-ajihad text-base px-8 py-4">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
