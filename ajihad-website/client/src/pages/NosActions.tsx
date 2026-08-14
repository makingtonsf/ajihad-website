import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, BookOpen, TreePine, Library, Wifi, Filter, ChevronRight } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import SEOHead from "@/components/SEOHead";
import EtatVide from "@/components/EtatVide";
import { trpc } from "@/lib/trpc";
import { useConfigSite } from "@/hooks/useConfigSite";

const projetsStatiques = [
  {
    slug: "projefa-2026",
    titre: "PROJEFA 2026",
    sous_titre: "Programme Estival de Formation et de Leadership Jeunesse",
    resume: "Programme gratuit de 8 semaines pour 250 jeunes de 15 à 30 ans. Modules : données, numérique, leadership, entrepreneuriat et arts.",
    axe: "education",
    zone: "Artibonite",
    statut: "en_cours",
    tag: "Programme phare",
    tagColor: "tag-blue",
    icon: BookOpen,
    href: "/projefa-2026",
    phare: true,
  },
  {
    slug: "reboisement-gonaives",
    titre: "Reboisement Gonaïves",
    sous_titre: "Projet de Reboisement Urbain",
    resume: "Initiative de reboisement et de verdissement urbain pour lutter contre l'érosion et améliorer le cadre de vie des Gonaïves.",
    axe: "environnement",
    zone: "Artibonite",
    statut: "en_cours",
    tag: "Environnement",
    tagColor: "tag-teal",
    icon: TreePine,
    href: "/nos-actions/reboisement-gonaives",
    phare: true,
  },
  {
    slug: "bibliotheque-amitie",
    titre: "Bibliothèque de l'Amitié",
    sous_titre: "Rénovation & Modernisation",
    resume: "Rénover et moderniser la Bibliothèque de l'Amitié pour en faire un espace d'apprentissage inclusif et accessible à tous.",
    axe: "education",
    zone: "Artibonite",
    statut: "planifie",
    tag: "Éducation",
    tagColor: "tag-gold",
    icon: Library,
    href: "/nos-actions/bibliotheque-amitie",
    phare: true,
  },
  {
    slug: "aji-connect",
    titre: "AJI CONNECT",
    sous_titre: "Initiative de Digitalisation",
    resume: "Digitaliser les services d'AJIHAD et renforcer les capacités numériques de l'organisation et de ses membres.",
    axe: "numerique",
    zone: "National",
    statut: "planifie",
    tag: "Innovation numérique",
    tagColor: "tag-red",
    icon: Wifi,
    href: "/nos-actions/aji-connect",
    phare: true,
  },
];

const axes = [
  { value: "", label: "Tous les axes" },
  { value: "education", label: "Éducation & Formation" },
  { value: "environnement", label: "Environnement" },
  { value: "numerique", label: "Innovation numérique" },
  { value: "leadership", label: "Leadership" },
  { value: "communautaire", label: "Développement communautaire" },
];

const statuts = [
  { value: "", label: "Tous les statuts" },
  { value: "en_cours", label: "En cours" },
  { value: "planifie", label: "Planifié" },
  { value: "termine", label: "Terminé" },
];

const HABILLAGE_PROJETS = [
  { icon: BookOpen, tagColor: "tag-blue" },
  { icon: TreePine, tagColor: "tag-teal" },
  { icon: Library, tagColor: "tag-gold" },
  { icon: Wifi, tagColor: "tag-red" },
];

const cleFiltre = (valeur: unknown) => String(valeur ?? "")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().replace(/[^a-z0-9]+/g, "_");

function normaliserProjet(projet: any, index: number) {
  const habillage = HABILLAGE_PROJETS[index % HABILLAGE_PROJETS.length];
  return {
    ...projet,
    sous_titre: projet.sous_titre ?? projet.sousTitre ?? projet.type ?? "Projet AJIHAD",
    axe: projet.axe ?? projet.axeIntervention,
    tag: projet.tag ?? projet.axeIntervention ?? "Projet",
    tagColor: projet.tagColor ?? habillage.tagColor,
    icon: projet.icon ?? habillage.icon,
    href: projet.href ?? `/nos-actions/${projet.slug}`,
    phare: Boolean(projet.phare ?? projet.estProjetPhare),
  };
}

export default function NosActions() {
  const { txt } = useConfigSite();
  const [filtreAxe, setFiltreAxe] = useState("");
  const [filtreStatut, setFiltreStatut] = useState("");

  // On charge le catalogue complet : l'administration peut utiliser des
  // libellés d'axes (« Éducation ») alors que le filtre public utilise des
  // identifiants (« education »). Le filtrage normalisé ci-dessous évite de
  // masquer un projet administré à cause de cette différence d'écriture.
  const { data: projetsDB } = trpc.public.projets.useQuery();

  const projets = (projetsDB && projetsDB.length > 0 ? projetsDB : projetsStatiques)
    .map(normaliserProjet);
  const projetsFiltres = projets.filter((p: any) => {
    if (filtreAxe && cleFiltre(p.axeIntervention ?? p.axe) !== cleFiltre(filtreAxe)) return false;
    if (filtreStatut && p.statut !== filtreStatut) return false;
    return true;
  });
  const projetVedette = projets.find((p: any) => p.phare) ?? projets[0];

  return (
    <PublicLayout>
      <SEOHead
        title="Nos actions"
        description="Découvrez les projets d'AJIHAD en éducation, leadership, environnement et innovation numérique en Haïti."
      />
      {/* Hero */}
      <section className="py-20 bg-gradient-to-br from-[#042C53] to-[#185FA5] text-white" aria-labelledby="actions-hero-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-blue-200/70 text-sm mb-8">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Nos actions</span>
          </nav>
          <div className="max-w-3xl">
            <h1 id="actions-hero-heading" className="text-4xl sm:text-5xl font-extrabold mb-6">
              {txt("txt_actions_hero_titre")}
            </h1>
            <p className="text-xl text-blue-100/90 leading-relaxed">
              {txt("txt_actions_hero_chapo")}
            </p>
          </div>
        </div>
      </section>

      {/* Projets phares */}
      <section className="py-20 bg-white dark:bg-gray-900" aria-labelledby="phares-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 id="phares-heading" className="section-heading">{txt("txt_actions_prioritaires_titre")}</h2>
            <p className="section-subheading mt-3">{txt("txt_actions_prioritaires_chapo")}</p>
          </div>

          {projetVedette ? [projetVedette].map((projet: any) => (
            <div key={projet.slug} className="mb-8 bg-gradient-to-r from-[#042C53] to-[#185FA5] rounded-2xl p-8 text-white flex flex-col lg:flex-row items-center gap-8">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <projet.icon className="w-10 h-10 text-[#4DBFBF]" />
              </div>
              <div className="flex-1">
                <span className="tag-pill tag-teal mb-3 inline-block">{projet.tag}</span>
                <h3 className="text-2xl font-bold mb-2">{projet.titre}</h3>
                <p className="text-blue-100/90 leading-relaxed mb-4">{[projet.sous_titre, projet.resume].filter(Boolean).join(" — ")}</p>
                <Link href={projet.href} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#4DBFBF] text-white font-semibold rounded-xl hover:bg-[#3aa0a0] transition-colors">
                  Découvrir le projet <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )) : null}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {projets.filter(p => p.slug !== projetVedette?.slug).slice(0, 3).map((projet: any) => (
              <article key={projet.slug} className="bg-[#F6F8FB] dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1 border border-gray-100 dark:border-gray-700 flex flex-col">
                <div className="h-32 bg-gradient-to-br from-[#042C53] to-[#185FA5] flex items-center justify-center">
                  <projet.icon className="w-10 h-10 text-white/60" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <span className={`tag-pill ${projet.tagColor} mb-3 self-start`}>{projet.tag}</span>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{projet.titre}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs mb-3">{projet.sous_titre}</p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-1 mb-4">{projet.resume}</p>
                  <Link href={projet.href} className="inline-flex items-center gap-1 text-[#185FA5] dark:text-blue-400 text-sm font-semibold hover:gap-2 transition-all">
                    En savoir plus <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Tous les projets avec filtres */}
      <section className="py-20 bg-[#F6F8FB] dark:bg-gray-800/50" aria-labelledby="tous-projets-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
            <h2 id="tous-projets-heading" className="section-heading">{txt("txt_actions_tous_titre")}</h2>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filtreAxe}
                  onChange={(e) => setFiltreAxe(e.target.value)}
                  className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  aria-label="Filtrer par axe d'intervention"
                >
                  {axes.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
              <select
                value={filtreStatut}
                onChange={(e) => setFiltreStatut(e.target.value)}
                className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                aria-label="Filtrer par statut"
              >
                {statuts.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>

          {projetsFiltres.length === 0 ? (
            <EtatVide
              icone={Filter}
              raison={filtreAxe || filtreStatut ? "filtre" : "vide"}
              titre={filtreAxe || filtreStatut ? "Aucun résultat" : "Aucun projet publié"}
              description={filtreAxe || filtreStatut
                ? "Aucun projet ne correspond à la combinaison choisie."
                : "Les projets d'AJIHAD seront présentés ici au fur et à mesure de leur lancement."}
              action={filtreAxe || filtreStatut
                ? { libelle: "Voir tous les projets", onClick: () => { setFiltreAxe(""); setFiltreStatut(""); } }
                : undefined}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {projetsFiltres.map((projet: any, i: number) => {
                const Icon = projet.icon || BookOpen;
                return (
                  <article key={projet.slug || i} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-1 border border-gray-100 dark:border-gray-700 flex flex-col">
                    <div className="h-28 bg-gradient-to-br from-[#185FA5] to-[#4DBFBF] flex items-center justify-center">
                      <Icon className="w-8 h-8 text-white/60" />
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`tag-pill ${projet.tagColor || "tag-blue"}`}>{projet.tag || projet.axeIntervention || "Projet"}</span>
                        {projet.statut === "en_cours" && <span className="tag-pill tag-green">En cours</span>}
                        {projet.statut === "planifie" && <span className="tag-pill tag-gray">Planifié</span>}
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">{projet.titre}</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed flex-1 mb-4">{projet.resume}</p>
                      <Link href={projet.href || `/nos-actions/${projet.slug}`} className="inline-flex items-center gap-1 text-[#185FA5] dark:text-blue-400 text-sm font-semibold hover:gap-2 transition-all">
                        En savoir plus <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white dark:bg-gray-900 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-[#042C53] dark:text-white mb-4">Vous souhaitez contribuer à nos projets ?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Que ce soit par votre temps, vos compétences ou vos ressources, chaque contribution compte.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/s-impliquer" className="btn-primary-ajihad">S'impliquer <ArrowRight className="w-4 h-4" /></Link>
            <Link href="/soutenir" className="btn-accent-ajihad">Soutenir AJIHAD</Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
