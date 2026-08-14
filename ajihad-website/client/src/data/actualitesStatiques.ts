export type ActualiteStatique = {
  id: number;
  slug: string;
  titre: string;
  resume: string;
  categorie: string;
  datePublication: string;
  imageUrl?: string | null;
  auteur: string;
  seoTitre: string;
  seoDescription: string;
  contenu: string;
};

/**
 * Contenu de démonstration autonome : les cartes et leurs pages de détail
 * restent cohérentes même lorsqu'aucune base de données n'est branchée.
 */
export const actualitesStatiques: ActualiteStatique[] = [
  {
    id: 1,
    slug: "lancement-projefa-2026",
    titre: "Lancement officiel de PROJEFA 2026",
    resume:
      "AJIHAD annonce le lancement de son programme phare de formation estivale pour les jeunes haïtiens de 15 à 30 ans.",
    categorie: "actualite",
    datePublication: "2025-12-01",
    auteur: "Équipe AJIHAD",
    seoTitre: "Lancement officiel de PROJEFA 2026 | AJIHAD",
    seoDescription:
      "AJIHAD présente PROJEFA 2026, un programme de formation et de leadership destiné aux jeunes haïtiens.",
    contenu: `## Un programme pour passer de l'idée à l'action

AJIHAD a annoncé le lancement de PROJEFA 2026, son programme estival de formation et de leadership destiné aux jeunes haïtiens de 15 à 30 ans.

Pendant huit semaines, les participantes et participants pourront renforcer leurs compétences en numérique, leadership, entrepreneuriat et arts. Le programme est conçu pour relier les apprentissages à des initiatives concrètes au service des communautés.

## Une édition placée sous le signe de l'engagement

PROJEFA 2026 vise à rassembler 250 jeunes de l'Artibonite, de l'Ouest et des zones d'intervention d'AJIHAD. Une attention particulière est accordée à l'inclusion et à la participation des jeunes femmes.

Les informations pratiques, le calendrier et les modalités de candidature sont disponibles sur la page dédiée au programme.`,
  },
  {
    id: 2,
    slug: "reboisement-gonaives-2025",
    titre: "Campagne de reboisement à Gonaïves",
    resume:
      "L'équipe d'AJIHAD a planté plus de 500 arbres dans le cadre de son initiative de verdissement urbain.",
    categorie: "evenement",
    datePublication: "2025-11-15",
    auteur: "Équipe AJIHAD",
    seoTitre: "Campagne de reboisement à Gonaïves | AJIHAD",
    seoDescription:
      "Retour sur la campagne de reboisement et de verdissement urbain menée par AJIHAD à Gonaïves.",
    contenu: `## Agir pour le cadre de vie

Dans le cadre de son initiative de verdissement urbain, AJIHAD a organisé une campagne de reboisement à Gonaïves. Plus de 500 arbres ont été plantés avec la participation de jeunes et de membres de la communauté.

Cette action contribue à sensibiliser les habitantes et habitants aux enjeux environnementaux tout en améliorant progressivement les espaces de vie.

## Une mobilisation qui se poursuit

Le projet associe plantation, entretien et sensibilisation. AJIHAD souhaite documenter les prochaines étapes et partager les résultats de l'initiative dans ses ressources publiques.`,
  },
  {
    id: 3,
    slug: "aji-connect-digitalisation",
    titre: "AJI CONNECT : vers la digitalisation d'AJIHAD",
    resume:
      "Présentation de la stratégie numérique d'AJIHAD pour les années 2025–2027.",
    categorie: "communique",
    datePublication: "2025-10-20",
    auteur: "Équipe AJIHAD",
    seoTitre: "AJI CONNECT : la stratégie numérique d'AJIHAD",
    seoDescription:
      "AJIHAD présente AJI CONNECT, une initiative de digitalisation de ses services et de ses ressources.",
    contenu: `## Une transformation numérique au service de la mission

AJI CONNECT présente la stratégie numérique d'AJIHAD pour la période 2025–2027. L'objectif est de faciliter l'accès aux informations, de mieux accompagner les membres et de renforcer les capacités numériques de l'organisation.

La démarche porte notamment sur la structuration des ressources, la simplification des parcours et la mise à disposition progressive de services en ligne.

## Une démarche progressive

La digitalisation est menée par étapes, en tenant compte des besoins des membres et des réalités du terrain. Les prochaines publications préciseront les services déployés et les modalités d'accès.`,
  },
];
