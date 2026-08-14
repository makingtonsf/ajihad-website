CREATE TABLE `actualites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(200) NOT NULL,
	`titre` varchar(300) NOT NULL,
	`resume` text,
	`contenu` text,
	`auteur` varchar(150),
	`categorie` enum('actualite','communique','evenement','conference','formation','appel_candidature','publication') DEFAULT 'actualite',
	`imageUrl` text,
	`datePublication` timestamp,
	`dateFin` timestamp,
	`statut` enum('brouillon','en_revision','valide','publie','archive') NOT NULL DEFAULT 'brouillon',
	`visibilite` enum('public','membres','admin') DEFAULT 'public',
	`seoTitre` varchar(200),
	`seoDescription` text,
	`projetId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `actualites_id` PRIMARY KEY(`id`),
	CONSTRAINT `actualites_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `candidatures` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reference` varchar(30) NOT NULL,
	`type` enum('membre','benevole','ambassadeur','projefa') DEFAULT 'membre',
	`prenom` varchar(100) NOT NULL,
	`nom` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`telephone` varchar(30),
	`adresse` text,
	`departement` varchar(100),
	`commune` varchar(100),
	`niveauEtude` varchar(100),
	`competences` text,
	`motivation` text,
	`disponibilite` varchar(200),
	`experienceAssociative` text,
	`statut` enum('recue','en_verification','en_analyse','approuvee','refusee','invitation_envoyee') DEFAULT 'recue',
	`assigneA` int,
	`notesInternes` text,
	`accuseEnvoye` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `candidatures_id` PRIMARY KEY(`id`),
	CONSTRAINT `candidatures_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `contributions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reference` varchar(30) NOT NULL,
	`nomContributeur` varchar(200),
	`email` varchar(320),
	`pays` varchar(100),
	`typeContribution` enum('financiere','nature','partenariat','promesse') DEFAULT 'financiere',
	`projetSoutenu` varchar(200),
	`montant` varchar(50),
	`devise` varchar(10) DEFAULT 'USD',
	`moyenContribution` varchar(100),
	`commentaire` text,
	`souhaitRecu` boolean DEFAULT false,
	`statut` enum('brouillon','declaree','en_attente_verification','confirmee','annulee','recue_nature','remboursee') DEFAULT 'declaree',
	`referenceTransaction` varchar(200),
	`recuEnvoye` boolean DEFAULT false,
	`accuseEnvoye` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contributions_id` PRIMARY KEY(`id`),
	CONSTRAINT `contributions_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `demandes_partenariat` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reference` varchar(30) NOT NULL,
	`nomOrganisation` varchar(200) NOT NULL,
	`nomContact` varchar(200) NOT NULL,
	`fonction` varchar(200),
	`email` varchar(320) NOT NULL,
	`telephone` varchar(30),
	`pays` varchar(100),
	`typeOrganisation` varchar(100),
	`domaineCollaboration` varchar(200),
	`projetConcerne` varchar(200),
	`message` text,
	`statut` enum('recue','en_analyse','en_negociation','acceptee','refusee','archive') DEFAULT 'recue',
	`assigneA` int,
	`notesInternes` text,
	`accuseEnvoye` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `demandes_partenariat_id` PRIMARY KEY(`id`),
	CONSTRAINT `demandes_partenariat_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titre` varchar(300) NOT NULL,
	`description` text,
	`categorie` enum('rapport_annuel','rapport_activites','institutionnel','resume_projet','note_conceptuelle','presentation','formulaire','publication','communique','ressource_pedagogique') DEFAULT 'institutionnel',
	`fileUrl` text,
	`fileType` varchar(20),
	`langue` varchar(10) DEFAULT 'fr',
	`version` varchar(20),
	`visibilite` enum('public','membres','gestionnaires','admin') DEFAULT 'public',
	`projetId` int,
	`dateDocument` timestamp,
	`dateExpiration` timestamp,
	`statut` enum('brouillon','valide','archive') DEFAULT 'brouillon',
	`estPublic` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `formulaires_contact` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reference` varchar(30) NOT NULL,
	`nomComplet` varchar(200) NOT NULL,
	`email` varchar(320) NOT NULL,
	`telephone` varchar(30),
	`organisation` varchar(200),
	`objet` varchar(300) NOT NULL,
	`message` text NOT NULL,
	`type` enum('general','partenariat','media','contribution') DEFAULT 'general',
	`statut` enum('nouveau','en_traitement','traite','archive') DEFAULT 'nouveau',
	`assigneA` int,
	`notesInternes` text,
	`accuseEnvoye` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `formulaires_contact_id` PRIMARY KEY(`id`),
	CONSTRAINT `formulaires_contact_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `indicateurs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nom` varchar(200) NOT NULL,
	`valeur` varchar(50),
	`unite` varchar(50),
	`periode` varchar(100),
	`projetId` int,
	`zone` varchar(100),
	`axeIntervention` varchar(100),
	`source` text,
	`responsableValidation` varchar(150),
	`dateVerification` timestamp,
	`estPublic` boolean DEFAULT false,
	`statut` enum('brouillon','a_verifier','valide') DEFAULT 'brouillon',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `indicateurs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journal_audit` (
	`id` int AUTO_INCREMENT NOT NULL,
	`utilisateurId` int,
	`utilisateurNom` varchar(200),
	`action` varchar(100) NOT NULL,
	`ressource` varchar(100),
	`ressourceId` int,
	`details` text,
	`resultat` enum('succes','echec') DEFAULT 'succes',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `journal_audit_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `membres` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`prenom` varchar(100) NOT NULL,
	`nom` varchar(100) NOT NULL,
	`email` varchar(320) NOT NULL,
	`telephone` varchar(30),
	`adresse` text,
	`departement` varchar(100),
	`commune` varchar(100),
	`niveauEtude` varchar(100),
	`competences` text,
	`motivation` text,
	`statut` enum('en_attente','verifie','approuve','refuse','actif','inactif') NOT NULL DEFAULT 'en_attente',
	`commission` varchar(100),
	`typeMembre` enum('membre','benevole','ambassadeur') NOT NULL DEFAULT 'membre',
	`carteToken` varchar(64),
	`carteGeneree` boolean DEFAULT false,
	`dateAdhesion` timestamp,
	`dateExpiration` timestamp,
	`notesInternes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `membres_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`destinataireId` int NOT NULL,
	`titre` varchar(200) NOT NULL,
	`message` text,
	`type` enum('info','alerte','confirmation','invitation') DEFAULT 'info',
	`estLu` boolean DEFAULT false,
	`lien` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `parametres` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cle` varchar(100) NOT NULL,
	`valeur` text,
	`description` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parametres_id` PRIMARY KEY(`id`),
	CONSTRAINT `parametres_cle_unique` UNIQUE(`cle`)
);
--> statement-breakpoint
CREATE TABLE `partenaires` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nom` varchar(200) NOT NULL,
	`type` enum('bailleur','technique','institutionnel','local','diaspora','entreprise') DEFAULT 'local',
	`logoUrl` text,
	`siteWeb` text,
	`description` text,
	`statut` enum('brouillon','valide','archive') DEFAULT 'brouillon',
	`estPublic` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `partenaires_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(200) NOT NULL,
	`titre` varchar(300) NOT NULL,
	`resume` text,
	`contexte` text,
	`objectifGeneral` text,
	`objectifsSpecifiques` text,
	`beneficiaires` text,
	`localisation` varchar(200),
	`duree` varchar(100),
	`activitesPrincipales` text,
	`methodologie` text,
	`resultatsAttendus` text,
	`axeIntervention` varchar(100),
	`zone` varchar(100),
	`type` enum('formation','leadership','sensibilisation','communautaire','environnement','culture','innovation','inclusion','conference','accompagnement') DEFAULT 'formation',
	`statut` enum('brouillon','en_preparation','en_cours','termine','archive') NOT NULL DEFAULT 'brouillon',
	`annee` int,
	`publicCible` varchar(200),
	`imageUrl` text,
	`estProjetPhare` boolean DEFAULT false,
	`estProjefa` boolean DEFAULT false,
	`besoinsFinancement` text,
	`partenaires` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projets_id` PRIMARY KEY(`id`),
	CONSTRAINT `projets_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('super_admin','admin','editeur_communication','responsable_projet','responsable_commission','membre','user') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `membres` ADD CONSTRAINT `membres_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;