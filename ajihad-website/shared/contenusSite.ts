/**
 * Contenus éditoriaux du site, pilotables depuis l'administration.
 *
 * Ces listes étaient écrites en dur dans les pages : impossible d'ajouter un
 * témoignage ou de retirer une valeur sans toucher au code. Elles sont
 * désormais déclarées ici une seule fois, avec leurs champs et leurs valeurs
 * par défaut, ce qui permet :
 *   - de générer l'écran d'édition automatiquement, sans formulaire sur mesure ;
 *   - de conserver l'affichage actuel tant que rien n'a été modifié ;
 *   - de n'exposer publiquement que ce qui est déclaré ici.
 *
 * Chaque liste est stockée en JSON dans la table `parametres`, sous sa clé.
 */

export type TypeChampContenu = "texte" | "texte_long";

export type ChampContenu = {
  cle: string;
  libelle: string;
  type: TypeChampContenu;
  aide?: string;
};

export type ListeContenu = {
  cle: string;
  libelle: string;
  page: string;
  description: string;
  /** Champ servant de titre dans la liste de l'éditeur. */
  champTitre: string;
  champs: ChampContenu[];
  defaut: Record<string, string>[];
};

export const LISTES_CONTENU: ListeContenu[] = [
  {
    cle: "accueil_axes",
    libelle: "Axes d'intervention",
    page: "Accueil",
    description: "Les domaines dans lesquels AJIHAD agit, présentés en grille sur la page d'accueil.",
    champTitre: "titre",
    champs: [
      { cle: "titre", libelle: "Titre", type: "texte" },
      { cle: "description", libelle: "Description", type: "texte_long" },
    ],
    defaut: [
      { titre: "Éducation & Formation", description: "Renforcer les capacités intellectuelles et professionnelles des jeunes." },
      { titre: "Leadership des Jeunes", description: "Développer des leaders responsables et engagés pour demain." },
      { titre: "Engagement Citoyen", description: "Encourager la participation communautaire et la cohésion sociale." },
      { titre: "Développement Communautaire", description: "Soutenir les initiatives qui améliorent les conditions de vie." },
      { titre: "Innovation Numérique", description: "Intégrer les technologies au service du développement." },
      { titre: "Environnement", description: "Protéger et valoriser l'environnement haïtien." },
    ],
  },
  {
    cle: "accueil_valeurs",
    libelle: "Valeurs",
    page: "Accueil",
    description: "Les valeurs affichées en pastilles. Un mot par entrée.",
    champTitre: "label",
    champs: [{ cle: "label", libelle: "Valeur", type: "texte" }],
    defaut: [
      { label: "Intégrité" },
      { label: "Solidarité" },
      { label: "Inclusion" },
      { label: "Responsabilité" },
      { label: "Innovation" },
      { label: "Transparence" },
    ],
  },
  {
    cle: "accueil_temoignages",
    libelle: "Témoignages",
    page: "Accueil",
    description: "Paroles de bénéficiaires, membres ou partenaires.",
    champTitre: "nom",
    champs: [
      { cle: "citation", libelle: "Citation", type: "texte_long" },
      { cle: "nom", libelle: "Nom ou qualité", type: "texte" },
      { cle: "role", libelle: "Rôle et lieu", type: "texte" },
    ],
    defaut: [
      {
        citation: "La formation AJIHAD m'a donné les outils et la confiance nécessaires pour lancer mon propre projet communautaire dans ma commune.",
        nom: "Participante PROJEFA",
        role: "Jeune bénéficiaire, Artibonite",
      },
      {
        citation: "Ce que j'apprécie chez AJIHAD, c'est la rigueur : des objectifs clairs, des indicateurs suivis et des comptes rendus accessibles à tous.",
        nom: "Membre du réseau",
        role: "Bénévole engagé, Gonaïves",
      },
      {
        citation: "Collaborer avec AJIHAD, c'est travailler avec une jeunesse structurée et déterminée à transformer concrètement son environnement.",
        nom: "Partenaire local",
        role: "Organisation communautaire",
      },
    ],
  },
  {
    cle: "accueil_projets_phares",
    libelle: "Projets prioritaires",
    page: "Accueil",
    description: "Les initiatives mises en avant sur la page d'accueil.",
    champTitre: "titre",
    champs: [
      { cle: "titre", libelle: "Titre", type: "texte" },
      { cle: "sousTitre", libelle: "Sous-titre", type: "texte" },
      { cle: "resume", libelle: "Résumé", type: "texte_long" },
      { cle: "etiquette", libelle: "Étiquette", type: "texte", aide: "Ex. Programme phare, Environnement…" },
      { cle: "lien", libelle: "Lien", type: "texte", aide: "Ex. /projefa-2026" },
    ],
    defaut: [
      { titre: "PROJEFA 2026", sousTitre: "Programme Estival de Formation et de Leadership Jeunesse", resume: "Programme gratuit de 8 semaines pour 250 jeunes de 15 à 30 ans. Modules : données, numérique, leadership, entrepreneuriat et arts.", etiquette: "Programme phare", lien: "/projefa-2026" },
      { titre: "Reboisement Gonaïves", sousTitre: "Projet de Reboisement Urbain", resume: "Initiative de reboisement et de verdissement urbain pour lutter contre l'érosion et améliorer le cadre de vie des Gonaïves.", etiquette: "Environnement", lien: "/nos-actions/reboisement-gonaives" },
      { titre: "Bibliothèque de l'Amitié", sousTitre: "Rénovation & Modernisation", resume: "Rénover et moderniser la Bibliothèque de l'Amitié pour en faire un espace d'apprentissage inclusif et accessible.", etiquette: "Éducation", lien: "/nos-actions/bibliotheque-amitie" },
      { titre: "AJI CONNECT", sousTitre: "Initiative de Digitalisation", resume: "Digitaliser les services d'AJIHAD et renforcer les capacités numériques de l'organisation et de ses membres.", etiquette: "Innovation", lien: "/nos-actions/aji-connect" },
    ],
  },
  {
    cle: "apropos_valeurs",
    libelle: "Valeurs détaillées",
    page: "À propos",
    description: "Les valeurs avec leur explication. Version longue de celles de l'accueil.",
    champTitre: "titre",
    champs: [
      { cle: "titre", libelle: "Valeur", type: "texte" },
      { cle: "description", libelle: "Ce qu'elle signifie", type: "texte_long" },
    ],
    defaut: [
      { titre: "Intégrité", description: "Nous rendons compte de chaque ressource reçue et de chaque décision prise." },
      { titre: "Solidarité", description: "Personne n'avance seul : l'entraide entre membres est notre première ressource." },
      { titre: "Inclusion", description: "Les jeunes filles, les zones rurales et les profils éloignés des circuits habituels ont leur place." },
      { titre: "Responsabilité", description: "Nous tenons nos engagements devant nos membres comme devant nos partenaires." },
      { titre: "Innovation", description: "Nous cherchons des réponses adaptées au terrain plutôt que des recettes importées." },
      { titre: "Transparence", description: "Nos rapports d'activités et nos comptes sont accessibles à qui veut les consulter." },
    ],
  },
  {
    cle: "apropos_equipe",
    libelle: "Structure organisationnelle",
    page: "À propos",
    description: "Les composantes de l'organisation présentées sur la page À propos.",
    champTitre: "nom",
    champs: [
      { cle: "nom", libelle: "Nom", type: "texte" },
      { cle: "role", libelle: "Rôle", type: "texte" },
      { cle: "description", libelle: "Description", type: "texte_long" },
    ],
    defaut: [
      { nom: "Comité Exécutif", role: "Direction de l'association", description: "Le Comité Exécutif assure la conduite quotidienne d'AJIHAD, la coordination des activités et la mise en œuvre des orientations." },
      { nom: "Commissions Thématiques", role: "Expertise sectorielle", description: "Chaque commission regroupe des membres spécialisés qui pilotent les projets dans leur domaine : éducation, environnement, numérique, communication." },
      { nom: "Réseau de Membres", role: "Force collective", description: "Des membres actifs répartis dans plusieurs communes de l'Artibonite et au-delà, engagés dans la mission d'AJIHAD." },
    ],
  },
  {
    cle: "gouvernance_qualites",
    libelle: "Manières d'appartenir",
    page: "Gouvernance",
    description: "Membres, bénévoles, ambassadeurs : les façons de rejoindre AJIHAD.",
    champTitre: "nom",
    champs: [
      { cle: "nom", libelle: "Qualité", type: "texte" },
      { cle: "description", libelle: "Description", type: "texte_long" },
    ],
    defaut: [
      { nom: "Membres", description: "Ils adhèrent à l'association, participent à sa vie interne et peuvent siéger dans une commission." },
      { nom: "Bénévoles", description: "Ils donnent du temps sur des activités précises, ponctuelles ou régulières, sans engagement statutaire." },
      { nom: "Ambassadeurs", description: "Ils représentent AJIHAD dans leur région ou à l'étranger et ouvrent des portes auprès de nouveaux partenaires." },
    ],
  },
  {
    cle: "impact_axes",
    libelle: "Axes d'impact",
    page: "Impact",
    description: "Les domaines sur lesquels l'impact est mesuré.",
    champTitre: "titre",
    champs: [
      { cle: "titre", libelle: "Titre", type: "texte" },
      { cle: "description", libelle: "Description", type: "texte_long" },
    ],
    defaut: [
      { titre: "Éducation & Formation", description: "Renforcement des capacités intellectuelles et professionnelles des jeunes." },
      { titre: "Leadership & Gouvernance", description: "Développement de leaders responsables et engagés." },
      { titre: "Environnement", description: "Protection et valorisation de l'environnement haïtien." },
      { titre: "Innovation numérique", description: "Intégration des technologies au service du développement." },
    ],
  },
  {
    cle: "projefa_indicateurs",
    libelle: "Chiffres clés PROJEFA",
    page: "PROJEFA",
    description: "Les quatre chiffres affichés en tête de la page programme.",
    champTitre: "label",
    champs: [
      { cle: "valeur", libelle: "Valeur", type: "texte", aide: "Ex. 250, 40%" },
      { cle: "label", libelle: "Libellé", type: "texte" },
    ],
    defaut: [
      { valeur: "250", label: "Jeunes ciblés" },
      { valeur: "8", label: "Semaines de formation" },
      { valeur: "40%", label: "Participation féminine" },
      { valeur: "5", label: "Modules thématiques" },
    ],
  },
  {
    cle: "simpliquer_formes",
    libelle: "Formes d'implication",
    page: "S'impliquer",
    description: "Les manières de s'engager proposées, avec leurs avantages.",
    champTitre: "titre",
    champs: [
      { cle: "titre", libelle: "Titre", type: "texte" },
      { cle: "description", libelle: "Description", type: "texte_long" },
      { cle: "avantages", libelle: "Avantages", type: "texte_long", aide: "Un avantage par ligne." },
    ],
    defaut: [
      { titre: "Devenir membre", description: "Rejoignez la communauté AJIHAD et participez activement à la vie associative.", avantages: "Accès à l'espace membre\nCarte de membre numérique\nAccès aux ressources exclusives\nParticipation aux assemblées\nRéseau de membres engagés" },
      { titre: "Bénévolat", description: "Offrez votre temps et vos compétences pour soutenir nos projets sur le terrain.", avantages: "Missions ponctuelles ou régulières\nFormation et accompagnement\nCertificat de bénévolat\nImpact direct sur les communautés" },
      { titre: "Ambassadeur AJIHAD", description: "Représentez AJIHAD dans votre région ou à l'international et étendez notre rayonnement.", avantages: "Rôle de représentation officiel\nMatériaux de communication\nFormation spécifique\nRéseau d'ambassadeurs" },
      { titre: "Partenariat institutionnel", description: "Établissez un partenariat stratégique avec AJIHAD pour un impact démultiplié.", avantages: "Visibilité sur nos supports\nCo-construction de projets\nAccès à notre réseau\nRapports d'impact partagés" },
    ],
  },
  {
    cle: "gouvernance_organes",
    libelle: "Organes administratifs",
    page: "Gouvernance",
    description: "Comité Exécutif, Commissions, et tout autre organe de direction.",
    champTitre: "nom",
    champs: [
      { cle: "nom", libelle: "Nom de l'organe", type: "texte" },
      { cle: "role", libelle: "Rôle (badge)", type: "texte" },
      { cle: "description", libelle: "Description", type: "texte_long" },
    ],
    defaut: [
      {
        nom: "Comité Exécutif",
        role: "Direction de l'association",
        description: "Le Comité Exécutif dirige AJIHAD au quotidien. Il arrête les orientations, valide les projets, engage l'association auprès de ses partenaires et rend compte aux membres.",
      },
      {
        nom: "Les Commissions",
        role: "Mise en œuvre par domaine",
        description: "Chaque commission porte un domaine d'action et transforme les orientations en activités concrètes. Un membre rejoint la commission qui correspond à ses compétences et à ses disponibilités.",
      },
    ],
  },
  {
    cle: "gouvernance_principes",
    libelle: "Principes de gouvernance",
    page: "Gouvernance",
    description: "Engagements de transparence, un par ligne.",
    champTitre: "texte",
    champs: [{ cle: "texte", libelle: "Principe", type: "texte_long" }],
    defaut: [
      { texte: "Séparation des pouvoirs entre les organes de gouvernance" },
      { texte: "Élections régulières et transparentes des dirigeants" },
      { texte: "Publication annuelle des rapports d'activités et financiers" },
      { texte: "Politique de prévention des conflits d'intérêts" },
      { texte: "Code d'éthique et de conduite pour tous les membres" },
      { texte: "Mécanisme de plainte et de recours accessible à tous" },
      { texte: "Audit interne et externe des comptes" },
      { texte: "Consultation des membres sur les décisions stratégiques" },
    ],
  },
  {
    cle: "projefa_calendrier",
    libelle: "Calendrier PROJEFA",
    page: "PROJEFA",
    description: "Les phases de l'édition en cours.",
    champTitre: "titre",
    champs: [
      { cle: "phase", libelle: "Phase", type: "texte" },
      { cle: "titre", libelle: "Titre", type: "texte" },
      { cle: "periode", libelle: "Période", type: "texte" },
      { cle: "description", libelle: "Description", type: "texte_long" },
    ],
    defaut: [
      { phase: "Phase 1", titre: "Appel à candidatures", periode: "Janvier – Mars 2026", description: "Diffusion des critères de sélection et collecte des candidatures." },
      { phase: "Phase 2", titre: "Sélection & Orientation", periode: "Avril 2026", description: "Évaluation des dossiers et orientation des candidats retenus." },
      { phase: "Phase 3", titre: "Programme de formation", periode: "Juillet – Août 2026", description: "8 semaines de formation intensive, ateliers et projets pratiques." },
      { phase: "Phase 4", titre: "Cérémonie de clôture", periode: "Août 2026", description: "Présentation des projets, remise de certificats et célébration." },
    ],
  },
  {
    cle: "projefa_objectifs",
    libelle: "Objectifs PROJEFA",
    page: "PROJEFA",
    description: "Ce que l'édition vise à accomplir, un objectif par ligne.",
    champTitre: "texte",
    champs: [{ cle: "texte", libelle: "Objectif", type: "texte_long" }],
    defaut: [
      { texte: "Former 250 jeunes de 15 à 30 ans dans des domaines porteurs et stratégiques" },
      { texte: "Assurer 40% de participation féminine pour garantir l'inclusivité du programme" },
      { texte: "Développer les compétences en leadership, entrepreneuriat et numérique" },
      { texte: "Favoriser l'émergence de projets communautaires portés par les participants" },
      { texte: "Renforcer la cohésion sociale et le sentiment d'appartenance communautaire" },
      { texte: "Créer un réseau d'alumni engagés pour le développement d'Haïti" },
    ],
  },
  {
    cle: "confidentialite_sections",
    libelle: "Sections de la confidentialité",
    page: "Confidentialité",
    description: "Les sections publiées sur la politique de confidentialité.",
    champTitre: "titre",
    champs: [
      { cle: "titre", libelle: "Titre", type: "texte" },
      { cle: "contenu", libelle: "Contenu", type: "texte_long" },
    ],
    defaut: [
      { titre: "Les données que nous recueillons", contenu: "Lorsque vous utilisez un formulaire du site, AJIHAD peut recevoir les informations que vous choisissez de transmettre : nom, adresse e-mail, téléphone, organisation, commune, message, motivation ou montant déclaré.\n\nLe formulaire de contribution est une déclaration d'intention. Aucune donnée bancaire n'est collectée sur le site." },
      { titre: "Pourquoi ces données sont utilisées", contenu: "Les données servent à répondre à vos demandes, traiter une candidature, suivre une proposition de partenariat, enregistrer une déclaration de contribution ou vous recontacter au sujet d'une activité AJIHAD.\n\nElles ne sont pas utilisées pour envoyer des communications commerciales non sollicitées." },
      { titre: "Accès et conservation", contenu: "Les informations sont accessibles uniquement aux personnes de l'équipe AJIHAD qui en ont besoin pour traiter votre demande. Elles sont conservées pendant la durée nécessaire au suivi, puis supprimées ou archivées selon les obligations applicables à l'association.\n\nAJIHAD ne vend pas les données personnelles reçues via ce site." },
      { titre: "Vos demandes", contenu: "Vous pouvez demander l'accès, la rectification ou la suppression des informations que vous avez transmises. Vous pouvez également demander l'arrêt d'un contact de suivi.\n\nPour toute question concernant vos données, écrivez à contact@ajihad.org en précisant l'adresse utilisée et l'objet de votre demande." },
      { titre: "Sécurité et liens externes", contenu: "AJIHAD applique des mesures raisonnables pour protéger les informations reçues. Aucun service en ligne ne pouvant garantir un risque nul, évitez de transmettre des informations sensibles dans un message public.\n\nLes liens vers les réseaux sociaux et d'autres sites sont soumis à leurs propres politiques de confidentialité. Consultez-les avant de leur transmettre des informations." },
    ],
  },
  {
    cle: "mentions_legales_sections",
    libelle: "Sections des mentions légales",
    page: "Mentions légales",
    description: "Les textes éditoriaux et légaux affichés sur la page.",
    champTitre: "titre",
    champs: [
      { cle: "titre", libelle: "Titre", type: "texte" },
      { cle: "contenu", libelle: "Contenu", type: "texte_long" },
    ],
    defaut: [
      { titre: "Éditeur du site", contenu: "Nom : Association des Jeunes Intellectuels Haïtiens (AJIHAD)\nLocalisation : Artibonite, Haïti\nContact : contact@ajihad.org\nResponsabilité éditoriale : Équipe AJIHAD" },
      { titre: "Hébergement et identification", contenu: "Les coordonnées d'enregistrement de l'association et de l'hébergeur seront complétées par AJIHAD avant la mise en production publique du site. Cette transparence permet d'éviter de publier des informations non vérifiées." },
      { titre: "Propriété et utilisation", contenu: "Les textes, logos, visuels et éléments graphiques publiés sur ce site sont destinés à présenter AJIHAD et ses activités. Toute réutilisation substantielle doit faire l'objet d'une autorisation préalable, sauf disposition contraire applicable." },
      { titre: "Liens externes et disponibilité", contenu: "Le site peut proposer des liens vers des services tiers, notamment les réseaux sociaux. AJIHAD ne contrôle pas leurs contenus ni leurs politiques. Malgré les vérifications apportées, une interruption ou une erreur ponctuelle reste possible : signalez-nous tout lien qui ne fonctionne pas." },
    ],
  },
];

/**
 * Titres et chapôs des sections, modifiables depuis l'administration.
 *
 * Ils étaient écrits en dur dans le JSX : changer « Nos axes d'intervention »
 * exigeait une intervention de développeur. Les valeurs par défaut reprennent
 * exactement le texte actuel, donc rien ne bouge tant que rien n'est modifié.
 */
export type TexteSite = {
  cle: string;
  libelle: string;
  page: string;
  type: TypeChampContenu;
  defaut: string;
};

export const TEXTES_SITE: TexteSite[] = [
  // ----- Accueil -----
  { cle: "txt_accueil_hero_badge", libelle: "Hero — badge", page: "Accueil", type: "texte", defaut: "Association haïtienne à but non lucratif" },
  { cle: "txt_accueil_hero_titre", libelle: "Hero — titre", page: "Accueil", type: "texte_long", defaut: "Former une jeunesse consciente, responsable et capable d'agir." },
  { cle: "txt_accueil_hero_chapo", libelle: "Hero — chapô", page: "Accueil", type: "texte_long", defaut: "AJIHAD renforce les capacités des jeunes haïtiens par l'éducation, le leadership, l'engagement citoyen et l'action communautaire concrète." },
  { cle: "txt_accueil_cta_actions", libelle: "Bouton — actions", page: "Accueil", type: "texte", defaut: "Découvrir nos actions" },
  { cle: "txt_accueil_cta_projefa", libelle: "Bouton — PROJEFA", page: "Accueil", type: "texte", defaut: "PROJEFA 2026" },
  { cle: "txt_accueil_cta_soutenir", libelle: "Bouton — soutien", page: "Accueil", type: "texte", defaut: "Contribuer au changement" },
  { cle: "txt_accueil_mission_badge", libelle: "Mission — badge", page: "Accueil", type: "texte", defaut: "Notre mission" },
  { cle: "txt_accueil_mission_titre", libelle: "Mission — titre", page: "Accueil", type: "texte", defaut: "Les jeunes au service du changement durable en Haïti" },
  { cle: "txt_accueil_mission_chapo", libelle: "Mission — texte", page: "Accueil", type: "texte_long", defaut: "AJIHAD est une association haïtienne à but non lucratif qui promeut le développement intégral des jeunes à travers l'éducation, le leadership et l'engagement citoyen afin de renforcer leurs capacités intellectuelles, sociales et professionnelles." },
  { cle: "txt_accueil_vision", libelle: "Mission — vision", page: "Accueil", type: "texte_long", defaut: "Notre vision : contribuer, à l'horizon 2035, à une société haïtienne où les jeunes sont éduqués, engagés, responsables et capables de participer activement à des initiatives qui améliorent durablement leur environnement social, économique et communautaire." },
  { cle: "txt_accueil_axes_titre", libelle: "Axes — titre", page: "Accueil", type: "texte", defaut: "Nos axes d'intervention" },
  { cle: "txt_accueil_axes_chapo", libelle: "Axes — chapô", page: "Accueil", type: "texte_long", defaut: "AJIHAD agit sur plusieurs fronts pour accompagner le développement intégral des jeunes haïtiens." },
  { cle: "txt_accueil_projets_titre", libelle: "Projets — titre", page: "Accueil", type: "texte", defaut: "Nos projets prioritaires" },
  { cle: "txt_accueil_projets_chapo", libelle: "Projets — chapô", page: "Accueil", type: "texte_long", defaut: "Des initiatives concrètes pour transformer les communautés haïtiennes." },
  { cle: "txt_accueil_valeurs_titre", libelle: "Valeurs — titre", page: "Accueil", type: "texte", defaut: "Nos valeurs fondamentales" },
  { cle: "txt_accueil_valeurs_chapo", libelle: "Valeurs — chapô", page: "Accueil", type: "texte_long", defaut: "Les principes qui guident chacune de nos actions et décisions." },
  { cle: "txt_accueil_partenaires_titre", libelle: "Partenaires — titre", page: "Accueil", type: "texte", defaut: "Ils nous font confiance" },
  { cle: "txt_accueil_partenaires_chapo", libelle: "Partenaires — chapô", page: "Accueil", type: "texte_long", defaut: "AJIHAD travaille aux côtés d'institutions, d'organisations locales et de partenaires techniques engagés." },
  { cle: "txt_accueil_temoignages_titre", libelle: "Témoignages — titre", page: "Accueil", type: "texte", defaut: "Ce qu'ils en disent" },
  { cle: "txt_accueil_temoignages_chapo", libelle: "Témoignages — chapô", page: "Accueil", type: "texte_long", defaut: "Les voix de celles et ceux qui vivent l'engagement AJIHAD au quotidien." },
  { cle: "txt_accueil_soutenir_titre", libelle: "Soutenir — titre", page: "Accueil", type: "texte", defaut: "Pourquoi soutenir AJIHAD ?" },
  { cle: "txt_accueil_actualites_titre", libelle: "Actualités — titre", page: "Accueil", type: "texte", defaut: "Actualités récentes" },

  // ----- Nos actions -----
  { cle: "txt_actions_hero_titre", libelle: "Hero — titre", page: "Nos actions", type: "texte", defaut: "Nos projets & initiatives" },
  { cle: "txt_actions_hero_chapo", libelle: "Hero — chapô", page: "Nos actions", type: "texte_long", defaut: "Des actions concrètes, mesurables et durables pour transformer les communautés haïtiennes et préparer la jeunesse à relever les défis de demain." },
  { cle: "txt_actions_prioritaires_titre", libelle: "Projets prioritaires — titre", page: "Nos actions", type: "texte", defaut: "Projets prioritaires 2025–2026" },
  { cle: "txt_actions_prioritaires_chapo", libelle: "Projets prioritaires — chapô", page: "Nos actions", type: "texte_long", defaut: "Les initiatives phares qui concentrent l'essentiel de nos ressources et de notre énergie." },
  { cle: "txt_actions_tous_titre", libelle: "Toutes les initiatives — titre", page: "Nos actions", type: "texte", defaut: "Toutes nos initiatives" },

  // ----- Actualités -----
  { cle: "txt_actualites_hero_titre", libelle: "Hero — titre", page: "Actualités", type: "texte", defaut: "Actualités & Événements" },
  { cle: "txt_actualites_hero_chapo", libelle: "Hero — chapô", page: "Actualités", type: "texte_long", defaut: "Restez informé des dernières nouvelles, événements et publications d'AJIHAD." },

  // ----- Ressources -----
  { cle: "txt_ressources_hero_titre", libelle: "Hero — titre", page: "Ressources", type: "texte", defaut: "Ressources & Documents" },
  { cle: "txt_ressources_hero_chapo", libelle: "Hero — chapô", page: "Ressources", type: "texte_long", defaut: "Accédez aux documents officiels, rapports, guides et formulaires d'AJIHAD. Certains documents sont réservés aux membres." },
  { cle: "txt_ressources_avis_titre", libelle: "Avis de publication — titre", page: "Ressources", type: "texte", defaut: "Publication progressive des documents" },
  { cle: "txt_ressources_avis_chapo", libelle: "Avis de publication — texte", page: "Ressources", type: "texte_long", defaut: "Les documents sans bouton de téléchargement sont en préparation ou en validation éditoriale. Leur version et leur date de publication seront indiquées ici." },

  // ----- À propos -----
  { cle: "txt_apropos_hero_badge", libelle: "Hero — badge", page: "À propos", type: "texte", defaut: "Qui sommes-nous ?" },
  { cle: "txt_apropos_hero_titre", libelle: "Hero — titre", page: "À propos", type: "texte_long", defaut: "AJIHAD : Une jeunesse au service d'Haïti" },
  { cle: "txt_apropos_hero_chapo", libelle: "Hero — chapô", page: "À propos", type: "texte_long", defaut: "Association des Jeunes Intellectuels Haïtiens pour l'Avenir et le Développement — fondée avec la conviction que la jeunesse est le principal moteur du changement durable en Haïti." },
  { cle: "txt_apropos_histoire_titre", libelle: "Histoire — titre", page: "À propos", type: "texte", defaut: "De l'idée à l'action" },
  { cle: "txt_apropos_histoire_chapo", libelle: "Histoire — texte", page: "À propos", type: "texte_long", defaut: "AJIHAD est née de la conviction profonde que les jeunes haïtiens possèdent le potentiel, la créativité et la détermination nécessaires pour contribuer au développement de leur pays — à condition de disposer des outils, des espaces et des opportunités adéquats." },
  { cle: "txt_apropos_histoire_suite", libelle: "Histoire — développement", page: "À propos", type: "texte_long", defaut: "Fondée dans la région de l'Artibonite, l'association a rapidement élargi son rayonnement pour toucher plusieurs communes et départements, en s'appuyant sur un réseau de membres engagés et de partenaires de confiance.\n\nDepuis sa création, AJIHAD a développé des programmes de formation, des initiatives de reboisement, des projets de modernisation d'infrastructures éducatives et des plateformes numériques pour renforcer les capacités de ses membres et des communautés qu'elle sert." },

  // ----- Gouvernance -----
  { cle: "txt_gouv_hero_badge", libelle: "Hero — badge", page: "Gouvernance", type: "texte", defaut: "Transparence & Redevabilité" },
  { cle: "txt_gouv_hero_titre", libelle: "Hero — titre", page: "Gouvernance", type: "texte", defaut: "Gouvernance responsable" },
  { cle: "txt_gouv_hero_chapo", libelle: "Hero — chapô", page: "Gouvernance", type: "texte_long", defaut: "AJIHAD est gouvernée par des structures démocratiques, transparentes et redevables. La confiance de nos membres, partenaires et bénéficiaires est notre bien le plus précieux." },
  { cle: "txt_gouv_principes_chapo", libelle: "Principes — texte", page: "Gouvernance", type: "texte_long", defaut: "AJIHAD adhère aux meilleures pratiques de gouvernance associative. Ces principes guident toutes nos décisions et garantissent la confiance de nos parties prenantes." },

  // ----- Pied de page -----
  { cle: "txt_footer_description", libelle: "Footer — description", page: "Pied de page", type: "texte_long", defaut: "Promouvoir le développement intégral des jeunes à travers l'éducation, le leadership et l'engagement citoyen pour transformer Haïti." },
  { cle: "txt_footer_slogan", libelle: "Footer — slogan", page: "Pied de page", type: "texte", defaut: "« Inspirer la jeunesse, transformer l'avenir. »" },
  { cle: "txt_footer_email", libelle: "Footer — e-mail", page: "Pied de page", type: "texte", defaut: "contact@ajihad.org" },
  { cle: "txt_footer_localisation", libelle: "Footer — localisation", page: "Pied de page", type: "texte", defaut: "Artibonite, Haïti" },
  { cle: "txt_footer_facebook", libelle: "Footer — lien Facebook", page: "Pied de page", type: "texte", defaut: "https://facebook.com/ajihad.haiti" },
  { cle: "txt_footer_instagram", libelle: "Footer — lien Instagram", page: "Pied de page", type: "texte", defaut: "https://instagram.com/ajihad.haiti" },

  // ----- PROJEFA -----
  { cle: "txt_projefa_objectifs_titre", libelle: "Objectifs — titre", page: "PROJEFA", type: "texte", defaut: "Objectifs du programme" },
  { cle: "txt_projefa_modules_titre", libelle: "Modules — titre", page: "PROJEFA", type: "texte", defaut: "Modules de formation" },
  { cle: "txt_projefa_calendrier_titre", libelle: "Calendrier — titre", page: "PROJEFA", type: "texte", defaut: "Calendrier du programme" },
  { cle: "txt_projefa_galerie_titre", libelle: "Galerie — titre", page: "PROJEFA", type: "texte", defaut: "En images" },
  { cle: "txt_projefa_galerie_chapo", libelle: "Galerie — chapô", page: "PROJEFA", type: "texte_long", defaut: "Découvrez les moments forts des sessions de formation PROJEFA 2026." },
  { cle: "txt_projefa_candidature_titre", libelle: "Candidature — titre", page: "PROJEFA", type: "texte", defaut: "Soumettre ma candidature" },
  { cle: "txt_projefa_candidature_chapo", libelle: "Candidature — chapô", page: "PROJEFA", type: "texte_long", defaut: "Remplissez ce formulaire pour exprimer votre intérêt pour PROJEFA 2026. Un accusé de réception avec votre numéro de référence vous sera communiqué." },

  // ----- Gouvernance -----
  { cle: "txt_gouv_structure_titre", libelle: "Structure — titre", page: "Gouvernance", type: "texte", defaut: "Comment AJIHAD s'organise" },
  { cle: "txt_gouv_structure_chapo", libelle: "Structure — chapô", page: "Gouvernance", type: "texte_long", defaut: "Deux organes administratifs conduisent l'association, et trois manières d'y appartenir." },
  { cle: "txt_gouv_principes_titre", libelle: "Principes — titre", page: "Gouvernance", type: "texte", defaut: "Principes de gouvernance" },
];

export const CLES_TEXTES = TEXTES_SITE.map(t => t.cle);

export function textesParDefaut(): Record<string, string> {
  return Object.fromEntries(TEXTES_SITE.map(t => [t.cle, t.defaut]));
}

/** Sections dont l'affichage peut être coupé depuis l'administration. */
export type SectionSite = { cle: string; libelle: string; page: string };

export const SECTIONS_SITE: SectionSite[] = [
  { cle: "section_accueil_axes", libelle: "Axes d'intervention", page: "Accueil" },
  { cle: "section_accueil_projets", libelle: "Projets phares", page: "Accueil" },
  { cle: "section_accueil_impact", libelle: "Impact en chiffres", page: "Accueil" },
  { cle: "section_accueil_valeurs", libelle: "Valeurs", page: "Accueil" },
  { cle: "section_accueil_partenaires", libelle: "Partenaires", page: "Accueil" },
  { cle: "section_accueil_temoignages", libelle: "Témoignages", page: "Accueil" },
  { cle: "section_accueil_actualites", libelle: "Dernières actualités", page: "Accueil" },
  { cle: "section_projefa_galerie", libelle: "Galerie photos", page: "PROJEFA" },
  { cle: "section_projefa_calendrier", libelle: "Calendrier", page: "PROJEFA" },
];

export const CLES_CONTENU = LISTES_CONTENU.map(l => l.cle);
export const CLES_SECTIONS = SECTIONS_SITE.map(s => s.cle);

/** Toutes les sections sont visibles tant que rien n'a été enregistré. */
export function sectionsParDefaut(): Record<string, string> {
  return Object.fromEntries(SECTIONS_SITE.map(s => [s.cle, "oui"]));
}

export function contenusParDefaut(): Record<string, string> {
  return Object.fromEntries(LISTES_CONTENU.map(l => [l.cle, JSON.stringify(l.defaut)]));
}

/**
 * Lit une liste enregistrée, en retombant sur les valeurs par défaut.
 *
 * Deux usages qu'il faut distinguer, sous peine de rendre l'édition impossible :
 *
 *   - **affichage public** (défaut) : les entrées vides sont écartées — une
 *     carte blanche sur le site n'a pas de sens — et une liste entièrement vide
 *     rétablit le contenu d'origine plutôt que de laisser un trou dans la page ;
 *
 *   - **édition** (`pourEdition: true`) : tout est conservé tel quel. Une
 *     entrée fraîchement ajoutée est vide par définition ; l'écarter la faisait
 *     disparaître avant même d'être affichée, si bien que le bouton « Ajouter »
 *     de l'écran Contenus ne pouvait pas fonctionner. De même, rétablir les
 *     valeurs par défaut dès que la liste est vide empêchait de la vider.
 */
export function lireListe(
  cle: string,
  valeur: string | undefined,
  options: { pourEdition?: boolean } = {},
): Record<string, string>[] {
  const definition = LISTES_CONTENU.find(l => l.cle === cle);
  const secours = definition?.defaut ?? [];
  // Rien d'enregistré : on part du contenu d'origine, y compris à l'édition.
  if (valeur === undefined || valeur === null || valeur === "") return secours;

  const normaliser = (e: Record<string, unknown>): Record<string, string> => {
    const ligne: Record<string, string> = {};
    for (const c of definition?.champs ?? []) ligne[c.cle] = String(e[c.cle] ?? "");
    return ligne;
  };

  try {
    const parsed = JSON.parse(valeur);
    if (!Array.isArray(parsed)) return options.pourEdition ? [] : secours;

    const lignes = parsed.filter(e => e && typeof e === "object").map(normaliser);
    if (options.pourEdition) return lignes;

    const propres = lignes.filter(e => Object.values(e).some(v => v.trim()));
    return propres.length > 0 ? propres : secours;
  } catch {
    return options.pourEdition ? [] : secours;
  }
}
