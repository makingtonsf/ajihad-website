import { Link } from "wouter";
import { ChevronRight, LockKeyhole } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import SEOHead from "@/components/SEOHead";
import { useConfigSite } from "@/hooks/useConfigSite";

const sectionsParDefaut = [
  {
    titre: "Les données que nous recueillons",
    contenu: [
      "Lorsque vous utilisez un formulaire du site, AJIHAD peut recevoir les informations que vous choisissez de transmettre : nom, adresse e-mail, téléphone, organisation, commune, message, motivation ou montant déclaré.",
      "Le formulaire de contribution est une déclaration d'intention. Aucune donnée bancaire n'est collectée sur le site.",
    ],
  },
  {
    titre: "Pourquoi ces données sont utilisées",
    contenu: [
      "Les données servent à répondre à vos demandes, traiter une candidature, suivre une proposition de partenariat, enregistrer une déclaration de contribution ou vous recontacter au sujet d'une activité AJIHAD.",
      "Elles ne sont pas utilisées pour envoyer des communications commerciales non sollicitées.",
    ],
  },
  {
    titre: "Accès et conservation",
    contenu: [
      "Les informations sont accessibles uniquement aux personnes de l'équipe AJIHAD qui en ont besoin pour traiter votre demande. Elles sont conservées pendant la durée nécessaire au suivi, puis supprimées ou archivées selon les obligations applicables à l'association.",
      "AJIHAD ne vend pas les données personnelles reçues via ce site.",
    ],
  },
  {
    titre: "Vos demandes",
    contenu: [
      "Vous pouvez demander l'accès, la rectification ou la suppression des informations que vous avez transmises. Vous pouvez également demander l'arrêt d'un contact de suivi.",
      "Pour toute question concernant vos données, écrivez à contact@ajihad.org en précisant l'adresse utilisée et l'objet de votre demande.",
    ],
  },
  {
    titre: "Sécurité et liens externes",
    contenu: [
      "AJIHAD applique des mesures raisonnables pour protéger les informations reçues. Aucun service en ligne ne pouvant garantir un risque nul, évitez de transmettre des informations sensibles dans un message public.",
      "Les liens vers les réseaux sociaux et d'autres sites sont soumis à leurs propres politiques de confidentialité. Consultez-les avant de leur transmettre des informations.",
    ],
  },
];

export default function Confidentialite() {
  const { liste } = useConfigSite();
  const sections = liste("confidentialite_sections").length > 0
    ? liste("confidentialite_sections")
    : sectionsParDefaut;
  return (
    <PublicLayout>
      <SEOHead
        title="Politique de confidentialité"
        description="Découvrez comment AJIHAD collecte, utilise et protège les données transmises via son site."
      />
      <section className="py-20 bg-gradient-to-br from-[#042C53] to-[#185FA5] text-white" aria-labelledby="confidentialite-heading">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-blue-200/70 text-sm mb-8">
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium">Politique de confidentialité</span>
          </nav>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <LockKeyhole className="w-6 h-6 text-[#4DBFBF]" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-[#4DBFBF] mb-3">Données & confiance</p>
              <h1 id="confidentialite-heading" className="text-4xl sm:text-5xl font-extrabold mb-5">Politique de confidentialité</h1>
              <p className="text-lg text-blue-100/90 leading-relaxed">AJIHAD explique ici, en termes simples, ce qui se passe lorsque vous utilisez un formulaire ou demandez un contact.</p>
            </div>
          </div>
        </div>
      </section>

      <article className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-10">Dernière mise à jour : août 2026</p>
          <div className="space-y-10">
            {sections.map((section, index) => (
              <section key={section.titre} aria-labelledby={`conf-section-${index}`}>
                <h2 id={`conf-section-${index}`} className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">{section.titre}</h2>
                <div className="space-y-3 text-gray-600 dark:text-gray-300 leading-relaxed">
                  {String(section.contenu ?? "").split(/\n\s*\n/).map((paragraphe, i) => <p key={i}>{paragraphe}</p>)}
                </div>
              </section>
            ))}
          </div>
          <div className="mt-12 rounded-2xl border border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 p-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Une question ?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Notre équipe peut vous préciser l'usage d'une information liée à votre demande.</p>
            <Link href="/contact" className="btn-primary-ajihad inline-flex">Contacter AJIHAD</Link>
          </div>
        </div>
      </article>
    </PublicLayout>
  );
}
