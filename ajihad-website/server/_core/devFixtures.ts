import { ENV } from "./env";

/**
 * Mode démonstration local.
 *
 * Quand aucune base MySQL n'est joignable, les procédures d'administration
 * renvoient normalement des listes vides, ce qui rend l'interface impossible
 * à vérifier. Ce module fournit un jeu de données en mémoire pour exercer
 * réellement la page (filtres, onglets, création, édition, suppression).
 *
 * Actif hors production tant qu'aucune DATABASE_URL n'est configurée. Dès
 * qu'une base est branchée, il s'éteint et seules les vraies données comptent.
 *
 * Les données vivent dans le processus : elles repartent de zéro à chaque
 * redémarrage. Rien n'est jamais écrit sur disque.
 */
export function modeDemo(): boolean {
  return !ENV.isProduction && !ENV.databaseUrl;
}

export type MembreDemo = {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  telephone: string | null;
  adresse: string | null;
  departement: string | null;
  commune: string | null;
  niveauEtude: string | null;
  competences: string | null;
  motivation: string | null;
  commission: string | null;
  typeMembre: "membre" | "benevole" | "ambassadeur";
  statut: "en_attente" | "verifie" | "approuve" | "refuse" | "actif" | "inactif";
  notesInternes: string | null;
  dateAdhesion: Date | null;
  carteGeneree: boolean;
  userId: number | null;
  createdAt: Date;
  updatedAt: Date;
};

const jour = 86_400_000;
const ilYA = (n: number) => new Date(Date.now() - n * jour);

let prochainId = 9;

const membres: MembreDemo[] = [
  { id: 1, prenom: "Roseline", nom: "Jean-Baptiste", email: "roseline.jb@example.ht", telephone: "+509 3412-8890", adresse: null, departement: "Artibonite", commune: "Gonaïves", niveauEtude: "Licence en sciences sociales", competences: "Animation de groupe, rédaction", motivation: "Contribuer à la formation civique des jeunes de ma commune.", commission: "Éducation", typeMembre: "membre", statut: "actif", notesInternes: null, dateAdhesion: ilYA(420), carteGeneree: true, userId: null, createdAt: ilYA(430), updatedAt: ilYA(20) },
  { id: 2, prenom: "Wideline", nom: "Pierre", email: "wideline.pierre@example.ht", telephone: "+509 3765-2201", adresse: null, departement: "Ouest", commune: "Port-au-Prince", niveauEtude: "Master en gestion de projet", competences: "Suivi-évaluation, tableurs", motivation: "Structurer le suivi des indicateurs d'impact.", commission: "Finances", typeMembre: "membre", statut: "actif", notesInternes: "Profil à orienter vers la commission Suivi.", dateAdhesion: ilYA(300), carteGeneree: true, userId: null, createdAt: ilYA(310), updatedAt: ilYA(12) },
  { id: 3, prenom: "Jhonson", nom: "Étienne", email: "jhonson.etienne@example.ht", telephone: "+509 4488-1130", adresse: null, departement: "Artibonite", commune: "Saint-Marc", niveauEtude: "Terminale", competences: "Reboisement, mobilisation communautaire", motivation: "Participer aux campagnes environnementales.", commission: "Environnement", typeMembre: "benevole", statut: "approuve", notesInternes: null, dateAdhesion: ilYA(180), carteGeneree: false, userId: null, createdAt: ilYA(190), updatedAt: ilYA(30) },
  { id: 4, prenom: "Marie-Ange", nom: "Dorléans", email: "marieange.d@example.ht", telephone: "+509 3901-7742", adresse: null, departement: "Nord", commune: "Cap-Haïtien", niveauEtude: "Licence en communication", competences: "Réseaux sociaux, photographie", motivation: "Faire connaître AJIHAD dans le Nord.", commission: "Communication", typeMembre: "benevole", statut: "actif", notesInternes: null, dateAdhesion: ilYA(150), carteGeneree: true, userId: null, createdAt: ilYA(160), updatedAt: ilYA(8) },
  { id: 5, prenom: "Frantz", nom: "Alcindor", email: "frantz.alcindor@example.ht", telephone: "+1 305-555-0142", adresse: null, departement: "Diaspora", commune: "Miami", niveauEtude: "Master en développement international", competences: "Levée de fonds, réseau institutionnel", motivation: "Représenter AJIHAD auprès de la diaspora floridienne.", commission: "Partenariats", typeMembre: "ambassadeur", statut: "actif", notesInternes: "Contact clé pour les bailleurs nord-américains.", dateAdhesion: ilYA(500), carteGeneree: true, userId: null, createdAt: ilYA(510), updatedAt: ilYA(5) },
  { id: 6, prenom: "Nadège", nom: "Louis", email: "nadege.louis@example.ht", telephone: "+1 514-555-0198", adresse: null, departement: "Diaspora", commune: "Montréal", niveauEtude: "Doctorat en éducation", competences: "Ingénierie pédagogique", motivation: "Appuyer la conception des modules de formation.", commission: "Éducation", typeMembre: "ambassadeur", statut: "approuve", notesInternes: null, dateAdhesion: ilYA(240), carteGeneree: false, userId: null, createdAt: ilYA(250), updatedAt: ilYA(15) },
  { id: 7, prenom: "Steevenson", nom: "Charles", email: "steevenson.c@example.ht", telephone: "+509 3320-6654", adresse: null, departement: "Ouest", commune: "Croix-des-Bouquets", niveauEtude: "Licence en informatique", competences: "Développement web, maintenance", motivation: "Appuyer la digitalisation d'AJIHAD.", commission: "Numérique", typeMembre: "membre", statut: "en_attente", notesInternes: "Candidature reçue, entretien à planifier.", dateAdhesion: null, carteGeneree: false, userId: null, createdAt: ilYA(9), updatedAt: ilYA(9) },
  { id: 8, prenom: "Berlinda", nom: "Sanon", email: "berlinda.sanon@example.ht", telephone: "+509 4102-3388", adresse: null, departement: "Artibonite", commune: "Gonaïves", niveauEtude: "Licence en droit", competences: "Rédaction juridique", motivation: "Aider à la mise en conformité statutaire.", commission: null, typeMembre: "membre", statut: "verifie", notesInternes: null, dateAdhesion: null, carteGeneree: false, userId: null, createdAt: ilYA(25), updatedAt: ilYA(3) },
];

export type CompteDemo = {
  id: number;
  openId: string;
  name: string;
  email: string;
  role: string;
  motDePasseHash: string | null;
  createdAt: Date;
  lastSignedIn: Date;
};

/**
 * Comptes en mémoire, utilisés quand aucune base n'est joignable.
 *
 * Ils traversent exactement le même hachage scrypt et la même signature de
 * session que les comptes réels : ce n'est pas une simulation de
 * l'authentification, seulement un stockage différent.
 */
const comptes: CompteDemo[] = [
  { id: 1, openId: "dev-local-admin", name: "Administrateur (dev local)", email: "dev@ajihad.org", role: "admin", motDePasseHash: null, createdAt: ilYA(600), lastSignedIn: new Date() },
  { id: 5, openId: "dev-local-super-admin", name: "Super administrateur (dev local)", email: "superadmin@ajihad.org", role: "super_admin", motDePasseHash: null, createdAt: ilYA(600), lastSignedIn: new Date() },
  { id: 2, openId: "demo-wideline", name: "Wideline Pierre", email: "wideline.pierre@example.ht", role: "responsable_commission", motDePasseHash: null, createdAt: ilYA(300), lastSignedIn: ilYA(2) },
  { id: 3, openId: "demo-marieange", name: "Marie-Ange Dorléans", email: "marieange.d@example.ht", role: "editeur_communication", motDePasseHash: null, createdAt: ilYA(160), lastSignedIn: ilYA(6) },
  { id: 4, openId: "demo-frantz", name: "Frantz Alcindor", email: "frantz.alcindor@example.ht", role: "membre", motDePasseHash: null, createdAt: ilYA(510), lastSignedIn: ilYA(1) },
];

let prochainCompteId = 100;

/**
 * Collection générique en mémoire, calquée sur une table.
 *
 * Toutes les entités de l'administration partagent les mêmes opérations —
 * lister, créer, modifier, supprimer. Les écrire une fois évite 29 correctifs
 * séparés et garantit qu'aucune procédure n'est oubliée.
 */
function collection<T extends { id: number; createdAt: Date; updatedAt?: Date }>(
  initial: T[]
) {
  const items = [...initial];
  let sequence = Math.max(0, ...items.map(i => i.id)) + 1;

  return {
    lister: () => [...items].sort((a, b) => +b.createdAt - +a.createdAt),
    parId: (id: number) => items.find(i => i.id === id) ?? null,
    creer: (donnees: Record<string, any>) => {
      const item = {
        ...donnees,
        id: sequence++,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as T;
      items.push(item);
      return item;
    },
    maj: (id: number, donnees: Record<string, any>) => {
      const i = items.find(x => x.id === id);
      if (i) Object.assign(i, donnees, { updatedAt: new Date() });
      return i ?? null;
    },
    supprimer: (id: number) => {
      const i = items.findIndex(x => x.id === id);
      if (i >= 0) items.splice(i, 1);
    },
  };
}

const dateRef = (n: number) => ilYA(n);

/** Une collection par entité de l'administration. */
const collections = {
  actualites: collection<any>([
    { id: 1, slug: "lancement-projefa-2026", titre: "Lancement officiel de PROJEFA 2026", resume: "AJIHAD annonce le lancement de son programme phare de formation estivale.", contenu: "Contenu de démonstration.", auteur: "Makington SAINT-FLEUR", categorie: "actualite", statut: "publie", visibilite: "public", datePublication: dateRef(30), createdAt: dateRef(32), updatedAt: dateRef(30) },
    { id: 2, slug: "reboisement-gonaives", titre: "Campagne de reboisement à Gonaïves", resume: "Plus de 500 arbres plantés dans le cadre du verdissement urbain.", contenu: "Contenu de démonstration.", auteur: "Commission Environnement", categorie: "evenement", statut: "publie", visibilite: "public", datePublication: dateRef(75), createdAt: dateRef(78), updatedAt: dateRef(75) },
  ]),
  projets: collection<any>([
    { id: 1, slug: "projefa-2026", titre: "PROJEFA 2026", resume: "Programme estival de formation et de leadership.", statut: "en_preparation", axeIntervention: "Éducation", zone: "Artibonite", type: "formation", annee: 2026, estProjetPhare: true, estProjefa: true, createdAt: dateRef(120), updatedAt: dateRef(10) },
    { id: 2, slug: "reboisement-gonaives", titre: "Reboisement Gonaïves", resume: "Reboisement et verdissement urbain.", statut: "en_cours", axeIntervention: "Environnement", zone: "Artibonite", type: "environnement", annee: 2025, estProjetPhare: true, estProjefa: false, createdAt: dateRef(300), updatedAt: dateRef(25) },
  ]),
  indicateurs: collection<any>([
    { id: 1, nom: "Jeunes formés", valeur: "250", unite: "", periode: "2026", zone: "Artibonite", estPublic: true, statut: "valide", createdAt: dateRef(60), updatedAt: dateRef(20) },
    { id: 2, nom: "Participation féminine", valeur: "40", unite: "%", periode: "2026", zone: "National", estPublic: true, statut: "valide", createdAt: dateRef(60), updatedAt: dateRef(20) },
  ]),
  candidatures: collection<any>([
    { id: 1, reference: "MBR-DEMO-0001", type: "membre", prenom: "Steevenson", nom: "Charles", email: "steevenson.c@example.ht", telephone: "+509 3320-6654", departement: "Ouest", commune: "Croix-des-Bouquets", motivation: "Appuyer la digitalisation d'AJIHAD.", statut: "recue", accuseEnvoye: false, createdAt: dateRef(9), updatedAt: dateRef(9) },
    { id: 2, reference: "PRJ-DEMO-0002", type: "projefa", prenom: "Berlinda", nom: "Sanon", email: "berlinda.sanon@example.ht", departement: "Artibonite", motivation: "Participer à la formation 2026.", statut: "en_analyse", accuseEnvoye: true, createdAt: dateRef(4), updatedAt: dateRef(2) },
  ]),
  contributions: collection<any>([
    { id: 1, reference: "CTB-DEMO-0001", nomContributeur: "Frantz Alcindor", email: "frantz.alcindor@example.ht", pays: "États-Unis", typeContribution: "financiere", montant: "500", devise: "USD", statut: "confirmee", createdAt: dateRef(40), updatedAt: dateRef(38) },
  ]),
  formulaires: collection<any>([
    { id: 1, reference: "CTT-DEMO-0001", nomComplet: "Nadège Louis", email: "nadege.louis@example.ht", objet: "Proposition de partenariat pédagogique", message: "Message de démonstration.", type: "general", statut: "nouveau", createdAt: dateRef(3), updatedAt: dateRef(3) },
  ]),
  partenariats: collection<any>([
    { id: 1, reference: "PRT-DEMO-0001", nomOrganisation: "Fondation Lumière", nomContact: "Marie-Ange Dorléans", email: "contact@lumiere.example", pays: "Haïti", typeOrganisation: "ONG", domaineCollaboration: "Éducation", message: "Message de démonstration.", statut: "recue", createdAt: dateRef(6), updatedAt: dateRef(6) },
  ]),
  partenaires: collection<any>([
    { id: 1, nom: "Bibliothèque de l'Amitié", type: "local", siteWeb: "", description: "Partenaire historique sur l'accès au livre.", statut: "valide", estPublic: true, createdAt: dateRef(400), updatedAt: dateRef(50) },
    { id: 2, nom: "Réseau Diaspora Haïti", type: "diaspora", siteWeb: "", description: "Appui à la levée de fonds.", statut: "valide", estPublic: true, createdAt: dateRef(250), updatedAt: dateRef(30) },
  ]),
  documents: collection<any>([
    { id: 1, titre: "Statuts de l'association AJIHAD", description: "Document fondateur.", categorie: "institutionnel", fileType: "PDF", langue: "fr", version: "v2.0", visibilite: "public", statut: "valide", estPublic: true, dateDocument: dateRef(500), createdAt: dateRef(500), updatedAt: dateRef(100) },
    { id: 2, titre: "Rapport d'activités 2025", description: "Bilan annuel.", categorie: "rapport_annuel", fileType: "PDF", langue: "fr", version: "2025", visibilite: "public", statut: "valide", estPublic: true, dateDocument: dateRef(60), createdAt: dateRef(60), updatedAt: dateRef(60) },
  ]),
  audit: collection<any>([
    { id: 1, utilisateurId: 1, utilisateurNom: "Administrateur (dev local)", action: "connexion", ressource: "users", resultat: "succes", createdAt: dateRef(1), updatedAt: dateRef(1) },
  ]),
};

/**
 * Notifications de démonstration. Le destinataire est assigné au premier
 * compte qui consulte son espace : sans base, l'identifiant réel n'est connu
 * qu'à l'exécution.
 */
const notificationsDemo: any[] = [
  { id: 1, destinataireId: null, titre: "Bienvenue dans votre espace membre", message: "Votre compte est actif. Complétez votre profil pour que l'équipe puisse vous solliciter sur les activités qui vous correspondent.", type: "info", estLu: false, createdAt: ilYA(2) },
  { id: 2, destinataireId: null, titre: "PROJEFA 2026 — appel à candidatures", message: "Les inscriptions ouvrent bientôt. Consultez la page du programme pour les modalités.", type: "invitation", estLu: false, createdAt: ilYA(8) },
  { id: 3, destinataireId: null, titre: "Nouveau document disponible", message: "Le rapport d'activités 2025 est consultable dans l'onglet Documents.", type: "info", estLu: true, createdAt: ilYA(20) },
];

/** Paramètres du site en mémoire, pour piloter la configuration sans base. */
const parametresDemo = new Map<string, string>();

export const demo = {
  /** Accès direct aux collections : demo.table("actualites").creer({...}) */
  table: (nom: keyof typeof collections) => collections[nom],

  listerParametres: () =>
    Array.from(parametresDemo, ([cle, valeur], i) => ({
      id: i + 1,
      cle,
      valeur,
      description: null as string | null,
      updatedAt: new Date(),
    })),

  ecrireParametre: (cle: string, valeur: string) => {
    parametresDemo.set(cle, valeur);
  },

  listerNotifications: (destinataireId: number) => {
    // Première consultation : on rattache les notifications au lecteur.
    for (const n of notificationsDemo) {
      if (n.destinataireId === null) n.destinataireId = destinataireId;
    }
    return notificationsDemo
      .filter(n => n.destinataireId === destinataireId)
      .sort((a, b) => +b.createdAt - +a.createdAt);
  },

  marquerNotificationLue: (id: number, destinataireId: number) => {
    const n = notificationsDemo.find(x => x.id === id && x.destinataireId === destinataireId);
    if (n) n.estLu = true;
  },

  listerMembres: () => [...membres].sort((a, b) => +b.createdAt - +a.createdAt),

  creerMembre: (data: Record<string, any>) => {
    const membre = {
      ...(data as any),
      id: prochainId++,
      dateAdhesion: data.dateAdhesion ? new Date(data.dateAdhesion) : null,
      carteGeneree: false,
      userId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    membres.push(membre);
    return membre;
  },

  majMembre: (id: number, data: Record<string, any>) => {
    const m = membres.find(x => x.id === id);
    if (!m) return;
    Object.assign(m, data, {
      ...(data.dateAdhesion !== undefined
        ? { dateAdhesion: data.dateAdhesion ? new Date(data.dateAdhesion) : null }
        : {}),
      updatedAt: new Date(),
    });
  },

  supprimerMembre: (id: number) => {
    const i = membres.findIndex(x => x.id === id);
    if (i >= 0) membres.splice(i, 1);
  },

  listerComptes: () =>
    comptes.map(({ motDePasseHash, ...sur }) => sur),

  majRole: (id: number, role: string) => {
    const c = comptes.find(x => x.id === id);
    if (c) c.role = role;
  },

  // ----- authentification en mémoire -----

  compteParEmail: (email: string) =>
    comptes.find(c => c.email.toLowerCase() === email.toLowerCase()) ?? null,

  compteParId: (id: number) => comptes.find(c => c.id === id) ?? null,

  nombreComptes: () => comptes.length,

  creerCompte: (donnees: { nom: string; email: string; motDePasseHash: string; role: string }) => {
    const compte: CompteDemo = {
      id: prochainCompteId++,
      openId: `demo-${prochainCompteId}`,
      name: donnees.nom,
      email: donnees.email.toLowerCase(),
      role: donnees.role,
      motDePasseHash: donnees.motDePasseHash,
      createdAt: new Date(),
      lastSignedIn: new Date(),
    };
    comptes.push(compte);
    return compte;
  },

  definirMotDePasse: (id: number, hash: string) => {
    const c = comptes.find(x => x.id === id);
    if (c) c.motDePasseHash = hash;
  },

  marquerConnexion: (id: number) => {
    const c = comptes.find(x => x.id === id);
    if (c) c.lastSignedIn = new Date();
  },
};
