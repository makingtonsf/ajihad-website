import { Link, useParams } from "wouter";
import {
  ArrowLeft, ChevronRight, MapPin, Calendar, Clock, Activity, Heart, Users, FolderX, Sparkles,
} from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import SEOHead from "@/components/SEOHead";
import { trpc } from "@/lib/trpc";
import { libelleStatut } from "@/components/Pastille";

// Contenu de secours affiché tant que les projets ne sont pas saisis en base.
const PROJETS_STATIQUES: Record<string, any> = {
  "reboisement-gonaives": {
    slug: "reboisement-gonaives",
    titre: "Reboisement Gonaïves",
    resume: "Initiative de reboisement et de verdissement urbain pour lutter contre l'érosion et améliorer le cadre de vie des Gonaïves.",
    contexte: "Les Gonaïves subissent une érosion accélérée et des inondations récurrentes liées à la déforestation du bassin versant. Le couvert végétal urbain y est aujourd'hui très réduit.",
    objectifGeneral: "Restaurer le couvert végétal urbain des Gonaïves et sensibiliser la population à la protection de l'environnement.",
    objectifsSpecifiques: "Planter et entretenir des arbres dans les espaces publics ; former des jeunes relais environnementaux ; mettre en place un suivi de la reprise des plants.",
    beneficiaires: "Habitants des quartiers ciblés des Gonaïves, écoles partenaires et jeunes bénévoles AJIHAD.",
    methodologie: "Diagnostic des sites, mobilisation communautaire, campagnes de plantation encadrées, puis suivi trimestriel des plants.",
    resultatsAttendus: "Un couvert végétal renforcé sur les sites ciblés, des jeunes formés au suivi environnemental et une communauté sensibilisée.",
    axeIntervention: "environnement",
    zone: "Artibonite",
    localisation: "Gonaïves, Artibonite",
    statut: "en_cours",
    estProjefa: false,
  },
  "bibliotheque-amitie": {
    slug: "bibliotheque-amitie",
    titre: "Bibliothèque de l'Amitié",
    resume: "Rénover et moderniser la Bibliothèque de l'Amitié pour en faire un espace d'apprentissage inclusif et accessible à tous.",
    contexte: "La Bibliothèque de l'Amitié est l'un des rares espaces de lecture publics de la zone, mais ses infrastructures et ses collections sont vieillissantes.",
    objectifGeneral: "Faire de la Bibliothèque de l'Amitié un espace d'apprentissage moderne, inclusif et ouvert à toute la jeunesse.",
    objectifsSpecifiques: "Réhabiliter les locaux ; enrichir le fonds documentaire ; créer un espace numérique ; animer un programme d'activités culturelles.",
    beneficiaires: "Élèves, étudiants et jeunes lecteurs de la zone d'intervention.",
    methodologie: "Évaluation des besoins, travaux de rénovation par étapes, dotation en ouvrages et équipements, puis programmation d'activités.",
    resultatsAttendus: "Un espace rénové et fréquenté, un fonds documentaire actualisé et une programmation culturelle régulière.",
    axeIntervention: "education",
    zone: "Artibonite",
    statut: "en_preparation",
    estProjefa: false,
  },
  "aji-connect": {
    slug: "aji-connect",
    titre: "AJI CONNECT",
    resume: "Digitaliser les services d'AJIHAD et renforcer les capacités numériques de l'organisation et de ses membres.",
    contexte: "La croissance d'AJIHAD impose des outils de gestion fiables et un accès numérique simplifié pour ses membres, partenaires et bénéficiaires.",
    objectifGeneral: "Doter AJIHAD d'une infrastructure numérique intégrée au service de ses membres et de ses projets.",
    objectifsSpecifiques: "Déployer la plateforme institutionnelle ; former les responsables aux outils numériques ; structurer la gestion des données de suivi.",
    beneficiaires: "Membres, responsables de commissions et partenaires d'AJIHAD.",
    methodologie: "Cadrage des besoins, développement itératif de la plateforme, formation des utilisateurs et accompagnement au changement.",
    resultatsAttendus: "Une plateforme opérationnelle, des équipes formées et un pilotage des projets appuyé sur des données fiables.",
    axeIntervention: "numerique",
    zone: "National",
    statut: "en_preparation",
    estProjefa: false,
  },
};

function ProjetSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-8" />
      <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-10" />
      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-4">
          {[0, 1, 2, 3, 4, 5].map(i => <div key={i} className="h-4 bg-gray-100 dark:bg-gray-700 rounded" />)}
        </div>
        <div className="h-56 bg-gray-100 dark:bg-gray-700 rounded-2xl" />
      </div>
    </div>
  );
}

export default function ProjetDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";

  const { data: projetDB, isLoading } = trpc.public.projetBySlug.useQuery({ slug }, { enabled: Boolean(slug) });
  const projet = projetDB ?? PROJETS_STATIQUES[slug] ?? null;

  if (isLoading) {
    return <PublicLayout><ProjetSkeleton /></PublicLayout>;
  }

  if (!projet) {
    return (
      <PublicLayout>
        <SEOHead title="Projet introuvable" description="Ce projet n'existe pas ou n'est plus disponible." noIndex />
        <section className="min-h-[60vh] flex items-center justify-center py-20 px-4">
          <div className="text-center max-w-md">
            <FolderX className="w-14 h-14 text-gray-300 dark:text-gray-600 mx-auto mb-5" />
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">Projet introuvable</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              Ce projet n'existe pas ou n'est plus disponible sur le site.
            </p>
            <Link href="/nos-actions" className="btn-primary-ajihad justify-center py-3 inline-flex">
              <ArrowLeft className="w-4 h-4" /> Tous les projets
            </Link>
          </div>
        </section>
      </PublicLayout>
    );
  }


  const sections = [
    { titre: "Contexte", contenu: projet.contexte },
    { titre: "Objectif général", contenu: projet.objectifGeneral },
    { titre: "Objectifs spécifiques", contenu: projet.objectifsSpecifiques },
    { titre: "Bénéficiaires", contenu: projet.beneficiaires },
    { titre: "Méthodologie", contenu: projet.methodologie },
    { titre: "Activités principales", contenu: projet.activitesPrincipales },
    { titre: "Résultats attendus", contenu: projet.resultatsAttendus },
    { titre: "Partenaires", contenu: projet.partenaires },
  ].filter(s => s.contenu);

  const infosSidebar = [
    { icon: Activity, label: "Statut", valeur: libelleStatut(projet.statut) },
    { icon: Clock, label: "Durée", valeur: projet.duree },
    { icon: MapPin, label: "Zone", valeur: projet.localisation || projet.zone },
    { icon: Calendar, label: "Année", valeur: projet.annee ? String(projet.annee) : null },
    { icon: Users, label: "Public cible", valeur: projet.publicCible },
  ].filter(i => i.valeur);

  return (
    <PublicLayout>
      <SEOHead
        title={projet.titre}
        description={projet.resume || `Projet AJIHAD : ${projet.titre}`}
        ogImage={projet.imageUrl ?? undefined}
        ogType="article"
      />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#042C53] to-[#185FA5] text-white pt-12 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-2 text-blue-200/70 text-sm mb-8">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/nos-actions" className="hover:text-white transition-colors">Nos actions</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium line-clamp-1">{projet.titre}</span>
          </nav>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            {projet.axeIntervention && (
              <span className="px-3 py-1 rounded-full bg-[#4DBFBF]/20 text-[#4DBFBF] text-xs font-semibold capitalize">
                {projet.axeIntervention}
              </span>
            )}
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">{libelleStatut(projet.statut)}</span>
            {(projet.localisation || projet.zone) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
                <MapPin className="w-3 h-3" /> {projet.localisation || projet.zone}
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-5">{projet.titre}</h1>
          {projet.resume && (
            <p className="text-lg text-blue-100/90 leading-relaxed max-w-3xl">{projet.resume}</p>
          )}
        </div>
      </section>

      <section className="py-14 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {projet.imageUrl && (
            <img src={projet.imageUrl} alt={projet.titre}
              className="w-full rounded-2xl mb-10 object-cover max-h-[420px]"
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
          )}

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Contenu */}
            <div className="lg:col-span-2 space-y-10">
              {sections.length > 0 ? sections.map((s, i) => (
                <div key={i}>
                  <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-3">{s.titre}</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{s.contenu}</p>
                </div>
              )) : (
                <p className="text-gray-400 dark:text-gray-500 italic">
                  La description détaillée de ce projet sera publiée prochainement.
                </p>
              )}

              <Link href="/nos-actions"
                className="inline-flex items-center gap-1.5 text-[#185FA5] dark:text-blue-400 text-sm font-semibold hover:gap-2.5 transition-all">
                <ArrowLeft className="w-4 h-4" /> Tous les projets
              </Link>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="bg-[#F6F8FB] dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="font-bold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wide">
                  Fiche du projet
                </h2>
                <div className="space-y-4">
                  {infosSidebar.map((info, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <info.icon className="w-4 h-4 text-[#185FA5] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-gray-400 dark:text-gray-500 text-xs">{info.label}</p>
                        <p className="text-gray-900 dark:text-white text-sm font-medium">{info.valeur}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {projet.estProjefa && (
                  <Link href="/projefa-2026"
                    className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#4DBFBF] text-white text-sm font-semibold hover:bg-[#3aa0a0] transition-colors">
                    <Sparkles className="w-4 h-4" /> Découvrir PROJEFA 2026
                  </Link>
                )}
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-[#042C53] to-[#185FA5] rounded-2xl p-6 text-white">
                <h2 className="font-bold mb-2">Agir avec nous</h2>
                <p className="text-blue-100/80 text-sm leading-relaxed mb-5">
                  Votre soutien permet de financer et d'étendre ce projet sur le terrain.
                </p>
                <div className="space-y-2.5">
                  <Link href="/soutenir"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#B64926] hover:bg-[#94391C] text-white text-sm font-semibold transition-colors">
                    <Heart className="w-4 h-4" /> Soutenir ce projet
                  </Link>
                  <Link href="/s-impliquer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-semibold transition-colors">
                    <Users className="w-4 h-4" /> S'impliquer
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
