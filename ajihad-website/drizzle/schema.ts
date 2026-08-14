import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
} from "drizzle-orm/mysql-core";

// ===== USERS & AUTH =====
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  // Identifiant public stable : sert au QR de la carte membre. Il ne dépend
  // plus d'un fournisseur externe, il est généré à la création du compte.
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  // Authentification locale (scrypt). Nul pour les comptes créés par un
  // administrateur qui n'ont pas encore défini leur mot de passe.
  motDePasseHash: varchar("motDePasseHash", { length: 255 }),
  // Jeton d'invitation / réinitialisation, à usage unique et daté.
  jetonAcces: varchar("jetonAcces", { length: 128 }),
  jetonExpiration: timestamp("jetonExpiration"),
  // Verrouillage après échecs répétés.
  echecsConnexion: int("echecsConnexion").default(0).notNull(),
  bloqueJusqua: timestamp("bloqueJusqua"),
  role: mysqlEnum("role", [
    "super_admin",
    "admin",
    "editeur_communication",
    "responsable_projet",
    "responsable_commission",
    "membre",
    "user",
  ]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ===== MEMBRES =====
export const membres = mysqlTable("membres", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").references(() => users.id),
  prenom: varchar("prenom", { length: 100 }).notNull(),
  nom: varchar("nom", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  telephone: varchar("telephone", { length: 30 }),
  adresse: text("adresse"),
  departement: varchar("departement", { length: 100 }),
  commune: varchar("commune", { length: 100 }),
  niveauEtude: varchar("niveauEtude", { length: 100 }),
  competences: text("competences"),
  motivation: text("motivation"),
  cvUrl: text("cvUrl"),
  cvNom: varchar("cvNom", { length: 255 }),
  cvTaille: int("cvTaille"),
  photoUrl: text("photoUrl"),
  photoNom: varchar("photoNom", { length: 255 }),
  photoTaille: int("photoTaille"),
  reponses: text("reponses"),
  statut: mysqlEnum("statut", ["en_attente", "verifie", "approuve", "refuse", "actif", "inactif"]).default("en_attente").notNull(),
  commission: varchar("commission", { length: 100 }),
  typeMembre: mysqlEnum("typeMembre", ["membre", "benevole", "ambassadeur"]).default("membre").notNull(),
  carteToken: varchar("carteToken", { length: 64 }),
  carteGeneree: boolean("carteGeneree").default(false),
  dateAdhesion: timestamp("dateAdhesion"),
  dateExpiration: timestamp("dateExpiration"),
  notesInternes: text("notesInternes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Membre = typeof membres.$inferSelect;

// ===== PROJETS =====
export const projets = mysqlTable("projets", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  titre: varchar("titre", { length: 300 }).notNull(),
  resume: text("resume"),
  contexte: text("contexte"),
  objectifGeneral: text("objectifGeneral"),
  objectifsSpecifiques: text("objectifsSpecifiques"),
  beneficiaires: text("beneficiaires"),
  localisation: varchar("localisation", { length: 200 }),
  duree: varchar("duree", { length: 100 }),
  activitesPrincipales: text("activitesPrincipales"),
  methodologie: text("methodologie"),
  resultatsAttendus: text("resultatsAttendus"),
  axeIntervention: varchar("axeIntervention", { length: 100 }),
  zone: varchar("zone", { length: 100 }),
  type: mysqlEnum("type", ["formation", "leadership", "sensibilisation", "communautaire", "environnement", "culture", "innovation", "inclusion", "conference", "accompagnement"]).default("formation"),
  statut: mysqlEnum("statut", ["brouillon", "en_preparation", "en_cours", "termine", "archive"]).default("brouillon").notNull(),
  annee: int("annee"),
  publicCible: varchar("publicCible", { length: 200 }),
  imageUrl: text("imageUrl"),
  estProjetPhare: boolean("estProjetPhare").default(false),
  estProjefa: boolean("estProjefa").default(false),
  besoinsFinancement: text("besoinsFinancement"),
  partenaires: text("partenaires"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Projet = typeof projets.$inferSelect;

// ===== ACTUALITES =====
export const actualites = mysqlTable("actualites", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  titre: varchar("titre", { length: 300 }).notNull(),
  resume: text("resume"),
  contenu: text("contenu"),
  auteur: varchar("auteur", { length: 150 }),
  categorie: mysqlEnum("categorie", ["actualite", "communique", "evenement", "conference", "formation", "appel_candidature", "publication"]).default("actualite"),
  imageUrl: text("imageUrl"),
  datePublication: timestamp("datePublication"),
  dateFin: timestamp("dateFin"),
  statut: mysqlEnum("statut", ["brouillon", "en_revision", "valide", "publie", "archive"]).default("brouillon").notNull(),
  visibilite: mysqlEnum("visibilite", ["public", "membres", "admin"]).default("public"),
  seoTitre: varchar("seoTitre", { length: 200 }),
  seoDescription: text("seoDescription"),
  projetId: int("projetId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Actualite = typeof actualites.$inferSelect;

// ===== INDICATEURS D'IMPACT =====
export const indicateurs = mysqlTable("indicateurs", {
  id: int("id").autoincrement().primaryKey(),
  nom: varchar("nom", { length: 200 }).notNull(),
  valeur: varchar("valeur", { length: 50 }),
  unite: varchar("unite", { length: 50 }),
  periode: varchar("periode", { length: 100 }),
  projetId: int("projetId"),
  zone: varchar("zone", { length: 100 }),
  axeIntervention: varchar("axeIntervention", { length: 100 }),
  source: text("source"),
  responsableValidation: varchar("responsableValidation", { length: 150 }),
  dateVerification: timestamp("dateVerification"),
  estPublic: boolean("estPublic").default(false),
  statut: mysqlEnum("statut", ["brouillon", "a_verifier", "valide"]).default("brouillon"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Indicateur = typeof indicateurs.$inferSelect;

// ===== PARTENAIRES =====
export const partenaires = mysqlTable("partenaires", {
  id: int("id").autoincrement().primaryKey(),
  nom: varchar("nom", { length: 200 }).notNull(),
  type: mysqlEnum("type", ["bailleur", "technique", "institutionnel", "local", "diaspora", "entreprise"]).default("local"),
  logoUrl: text("logoUrl"),
  siteWeb: text("siteWeb"),
  description: text("description"),
  statut: mysqlEnum("statut", ["brouillon", "valide", "archive"]).default("brouillon"),
  estPublic: boolean("estPublic").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Partenaire = typeof partenaires.$inferSelect;

// ===== DOCUMENTS =====
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  titre: varchar("titre", { length: 300 }).notNull(),
  description: text("description"),
  categorie: mysqlEnum("categorie", ["rapport_annuel", "rapport_activites", "institutionnel", "resume_projet", "note_conceptuelle", "presentation", "formulaire", "publication", "communique", "ressource_pedagogique"]).default("institutionnel"),
  fileUrl: text("fileUrl"),
  fileType: varchar("fileType", { length: 20 }),
  langue: varchar("langue", { length: 10 }).default("fr"),
  version: varchar("version", { length: 20 }),
  visibilite: mysqlEnum("visibilite", ["public", "membres", "gestionnaires", "admin"]).default("public"),
  projetId: int("projetId"),
  dateDocument: timestamp("dateDocument"),
  dateExpiration: timestamp("dateExpiration"),
  statut: mysqlEnum("statut", ["brouillon", "valide", "archive"]).default("brouillon"),
  estPublic: boolean("estPublic").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Document = typeof documents.$inferSelect;

// ===== FORMULAIRES DE CONTACT =====
export const formulairesContact = mysqlTable("formulaires_contact", {
  id: int("id").autoincrement().primaryKey(),
  reference: varchar("reference", { length: 30 }).notNull().unique(),
  nomComplet: varchar("nomComplet", { length: 200 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  telephone: varchar("telephone", { length: 30 }),
  organisation: varchar("organisation", { length: 200 }),
  objet: varchar("objet", { length: 300 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["general", "partenariat", "media", "contribution"]).default("general"),
  statut: mysqlEnum("statut", ["nouveau", "en_traitement", "traite", "archive"]).default("nouveau"),
  assigneA: int("assigneA"),
  notesInternes: text("notesInternes"),
  accuseEnvoye: boolean("accuseEnvoye").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FormulaireContact = typeof formulairesContact.$inferSelect;

// ===== CANDIDATURES (membres, bénévoles, ambassadeurs) =====
export const candidatures = mysqlTable("candidatures", {
  id: int("id").autoincrement().primaryKey(),
  reference: varchar("reference", { length: 30 }).notNull().unique(),
  type: mysqlEnum("type", ["membre", "benevole", "ambassadeur", "projefa"]).default("membre"),
  prenom: varchar("prenom", { length: 100 }).notNull(),
  nom: varchar("nom", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  telephone: varchar("telephone", { length: 30 }),
  adresse: text("adresse"),
  departement: varchar("departement", { length: 100 }),
  commune: varchar("commune", { length: 100 }),
  niveauEtude: varchar("niveauEtude", { length: 100 }),
  competences: text("competences"),
  motivation: text("motivation"),
  cvUrl: text("cvUrl"),
  cvNom: varchar("cvNom", { length: 255 }),
  cvTaille: int("cvTaille"),
  photoUrl: text("photoUrl"),
  photoNom: varchar("photoNom", { length: 255 }),
  photoTaille: int("photoTaille"),
  reponses: text("reponses"),
  disponibilite: varchar("disponibilite", { length: 200 }),
  experienceAssociative: text("experienceAssociative"),
  statut: mysqlEnum("statut", ["recue", "en_verification", "en_analyse", "approuvee", "refusee", "invitation_envoyee"]).default("recue"),
  assigneA: int("assigneA"),
  notesInternes: text("notesInternes"),
  accuseEnvoye: boolean("accuseEnvoye").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Candidature = typeof candidatures.$inferSelect;

// ===== CONTRIBUTIONS =====
export const contributions = mysqlTable("contributions", {
  id: int("id").autoincrement().primaryKey(),
  reference: varchar("reference", { length: 30 }).notNull().unique(),
  nomContributeur: varchar("nomContributeur", { length: 200 }),
  email: varchar("email", { length: 320 }),
  pays: varchar("pays", { length: 100 }),
  typeContribution: mysqlEnum("typeContribution", ["financiere", "nature", "partenariat", "promesse"]).default("financiere"),
  projetSoutenu: varchar("projetSoutenu", { length: 200 }),
  montant: varchar("montant", { length: 50 }),
  devise: varchar("devise", { length: 10 }).default("USD"),
  moyenContribution: varchar("moyenContribution", { length: 100 }),
  commentaire: text("commentaire"),
  souhaitRecu: boolean("souhaitRecu").default(false),
  statut: mysqlEnum("statut", ["brouillon", "declaree", "en_attente_verification", "confirmee", "annulee", "recue_nature", "remboursee"]).default("declaree"),
  referenceTransaction: varchar("referenceTransaction", { length: 200 }),
  reçuEnvoye: boolean("recuEnvoye").default(false),
  accuseEnvoye: boolean("accuseEnvoye").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contribution = typeof contributions.$inferSelect;

// ===== DEMANDES DE PARTENARIAT =====
export const demandesPartenariat = mysqlTable("demandes_partenariat", {
  id: int("id").autoincrement().primaryKey(),
  reference: varchar("reference", { length: 30 }).notNull().unique(),
  nomOrganisation: varchar("nomOrganisation", { length: 200 }).notNull(),
  nomContact: varchar("nomContact", { length: 200 }).notNull(),
  fonction: varchar("fonction", { length: 200 }),
  email: varchar("email", { length: 320 }).notNull(),
  telephone: varchar("telephone", { length: 30 }),
  pays: varchar("pays", { length: 100 }),
  typeOrganisation: varchar("typeOrganisation", { length: 100 }),
  domaineCollaboration: varchar("domaineCollaboration", { length: 200 }),
  projetConcerne: varchar("projetConcerne", { length: 200 }),
  message: text("message"),
  statut: mysqlEnum("statut", ["recue", "en_analyse", "en_negociation", "acceptee", "refusee", "archive"]).default("recue"),
  assigneA: int("assigneA"),
  notesInternes: text("notesInternes"),
  accuseEnvoye: boolean("accuseEnvoye").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DemandePartenariat = typeof demandesPartenariat.$inferSelect;

// ===== JOURNAL D'AUDIT =====
export const journalAudit = mysqlTable("journal_audit", {
  id: int("id").autoincrement().primaryKey(),
  utilisateurId: int("utilisateurId"),
  utilisateurNom: varchar("utilisateurNom", { length: 200 }),
  action: varchar("action", { length: 100 }).notNull(),
  ressource: varchar("ressource", { length: 100 }),
  ressourceId: int("ressourceId"),
  details: text("details"),
  resultat: mysqlEnum("resultat", ["succes", "echec"]).default("succes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type JournalAudit = typeof journalAudit.$inferSelect;

// ===== NOTIFICATIONS =====
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  destinataireId: int("destinataireId").notNull(),
  titre: varchar("titre", { length: 200 }).notNull(),
  message: text("message"),
  type: mysqlEnum("type", ["info", "alerte", "confirmation", "invitation"]).default("info"),
  estLu: boolean("estLu").default(false),
  lien: text("lien"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;

// ===== PARAMÈTRES INSTITUTIONNELS =====
export const parametres = mysqlTable("parametres", {
  id: int("id").autoincrement().primaryKey(),
  cle: varchar("cle", { length: 100 }).notNull().unique(),
  valeur: text("valeur"),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Parametre = typeof parametres.$inferSelect;
