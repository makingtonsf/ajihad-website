import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { projets, actualites, indicateurs, partenaires, parametres, documents } from "../../drizzle/schema";
import { eq, and, desc, lte } from "drizzle-orm";
import {
  CLES_PUBLIQUES, configParDefaut, inscriptionsOuvertes, lireModules,
} from "@shared/configSite";
import {
  CLES_CONTENU, CLES_SECTIONS, CLES_TEXTES, LISTES_CONTENU, contenusParDefaut,
  lireListe, sectionsParDefaut, textesParDefaut,
} from "@shared/contenusSite";
import { modeDemo, demo } from "../_core/devFixtures";

/**
 * Les écrans publics doivent lire le même magasin que l'administration en
 * prévisualisation. Sans ce pont, un enregistrement réussi dans l'admin
 * restait invisible tant qu'une base MySQL n'était pas branchée.
 */
function demoCollection<T extends keyof typeof demoCollections>(nom: T) {
  return modeDemo() ? demo.table(nom).lister() as any[] : [];
}

const demoCollections = {
  actualites: true,
  projets: true,
  indicateurs: true,
  partenaires: true,
  documents: true,
} as const;

const dateNombre = (valeur: unknown) => {
  const date = valeur instanceof Date ? valeur : new Date(String(valeur ?? ""));
  return Number.isNaN(+date) ? 0 : +date;
};

const actualitePublique = (article: any) =>
  article?.statut === "publie" && (article.visibilite ?? "public") === "public";

const projetPublic = (projet: any) =>
  projet?.statut !== "brouillon" && projet?.statut !== "archive";

const indicateurPublic = (indicateur: any) =>
  Boolean(indicateur?.estPublic) && indicateur?.statut === "valide";

const partenairePublic = (partenaire: any) =>
  Boolean(partenaire?.estPublic) && partenaire?.statut === "valide";

const documentPublic = (document: any) =>
  Boolean(document?.estPublic) && document?.statut === "valide";

export const publicRouter = router({
  // Get validated public indicators
  indicateurs: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return demoCollection("indicateurs")
        .filter(indicateurPublic)
        .sort((a, b) => dateNombre(b.createdAt) - dateNombre(a.createdAt))
        .slice(0, 8);
    }
    return db.select().from(indicateurs)
      .where(and(eq(indicateurs.estPublic, true), eq(indicateurs.statut, "valide")))
      .orderBy(desc(indicateurs.createdAt))
      .limit(8);
  }),

  // Get published news
  actualites: publicProcedure
    .input(z.object({ limit: z.number().default(6), categorie: z.string().optional() }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return demoCollection("actualites")
          .filter(actualitePublique)
          .filter(article => !input?.categorie || article.categorie === input.categorie)
          .sort((a, b) => dateNombre(b.datePublication ?? b.createdAt) - dateNombre(a.datePublication ?? a.createdAt))
          .slice(0, input?.limit ?? 6);
      }
      return db.select().from(actualites)
        .where(and(
          eq(actualites.statut, "publie"),
          eq(actualites.visibilite, "public"),
          ...(input?.categorie ? [eq(actualites.categorie, input.categorie as any)] : []),
        ))
        .orderBy(desc(actualites.datePublication))
        .limit(input?.limit ?? 6);
    }),

  // Get single news item by slug
  actualiteBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return demoCollection("actualites").find(article =>
          article.slug === input.slug && actualitePublique(article)
        ) ?? null;
      }
      const result = await db.select().from(actualites)
        .where(and(
          eq(actualites.slug, input.slug),
          eq(actualites.statut, "publie"),
          eq(actualites.visibilite, "public"),
        ))
        .limit(1);
      return result[0] ?? null;
    }),

  // Get all projects (public)
  projets: publicProcedure
    .input(z.object({
      axe: z.string().optional(),
      zone: z.string().optional(),
      type: z.string().optional(),
      statut: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return demoCollection("projets")
          .filter(projetPublic)
          .filter(projet => !input?.axe || projet.axeIntervention === input.axe)
          .filter(projet => !input?.zone || projet.zone === input.zone)
          .filter(projet => !input?.type || projet.type === input.type)
          .filter(projet => !input?.statut || projet.statut === input.statut)
          .sort((a, b) => Number(Boolean(b.estProjetPhare)) - Number(Boolean(a.estProjetPhare)) || dateNombre(b.createdAt) - dateNombre(a.createdAt));
      }
      return db.select().from(projets)
        .where(and(
          ...(input?.axe ? [eq(projets.axeIntervention, input.axe)] : []),
          ...(input?.zone ? [eq(projets.zone, input.zone)] : []),
          ...(input?.type ? [eq(projets.type, input.type as any)] : []),
          ...(input?.statut ? [eq(projets.statut, input.statut as any)] : []),
        ))
        .orderBy(desc(projets.estProjetPhare), desc(projets.createdAt));
    }),

  // Get single project by slug
  projetBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return demoCollection("projets").find(projet =>
          projet.slug === input.slug && projetPublic(projet)
        ) ?? null;
      }
      const result = await db.select().from(projets)
        .where(eq(projets.slug, input.slug))
        .limit(1);
      return result[0] ?? null;
    }),

  // Get validated public partners
  partenaires: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return demoCollection("partenaires")
        .filter(partenairePublic)
        .sort((a, b) => dateNombre(b.createdAt) - dateNombre(a.createdAt));
    }
    return db.select().from(partenaires)
      .where(and(eq(partenaires.estPublic, true), eq(partenaires.statut, "valide")));
  }),

  // Get published documents (public catalogue)
  documents: publicProcedure
    .input(z.object({
      categorie: z.string().optional(),
      visibilite: z.enum(["public", "membres"]).optional(),
    }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        return demoCollection("documents")
          .filter(documentPublic)
          .filter(document => !input?.categorie || document.categorie === input.categorie)
          .filter(document => !input?.visibilite || document.visibilite === input.visibilite)
          .sort((a, b) => dateNombre(b.dateDocument ?? b.createdAt) - dateNombre(a.dateDocument ?? a.createdAt));
      }
      const conditions = [eq(documents.statut, "valide"), eq(documents.estPublic, true)];
      if (input?.categorie) conditions.push(eq(documents.categorie, input.categorie as any));
      if (input?.visibilite) conditions.push(eq(documents.visibilite, input.visibilite));
      return db.select().from(documents)
        .where(and(...conditions))
        .orderBy(desc(documents.dateDocument), desc(documents.createdAt));
    }),

  // Get institutional settings
  parametres: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return modeDemo() ? demo.listerParametres() : [];
    return db.select().from(parametres);
  }),

  /**
   * Configuration publique du site : bandeau d'annonce, visibilité des liens,
   * paramètres PROJEFA. Seules les clés déclarées dans shared/configSite.ts
   * sont renvoyées — le reste de la table `parametres` (coordonnées, notes
   * internes) ne sort jamais.
   */
  configSite: publicProcedure.query(async () => {
    // Les trois familles de clés partagent la même table `parametres`.
    const config = {
      ...configParDefaut(), ...sectionsParDefaut(),
      ...contenusParDefaut(), ...textesParDefaut(),
    };
    const clesAutorisees = [...CLES_PUBLIQUES, ...CLES_SECTIONS, ...CLES_CONTENU, ...CLES_TEXTES];

    const db = await getDb();
    // Sans base, on relit le magasin de démonstration : sinon les réglages
    // enregistrés depuis l'administration resteraient sans effet sur le site.
    const lignes = db
      ? await db.select().from(parametres)
      : modeDemo()
        ? demo.listerParametres()
        : [];

    for (const l of lignes) {
      if (l.cle && clesAutorisees.includes(l.cle) && l.valeur !== null) {
        config[l.cle] = l.valeur;
      }
    }

    return {
      config,
      // Indique aux écrans de connexion qu'aucune base n'est branchée, afin
      // qu'ils affichent les identifiants de démonstration plutôt que de
      // laisser l'utilisateur buter sur des comptes inexistants.
      modeDemo: !db && modeDemo(),
      compteDemo: !db && modeDemo() ? "dev@ajihad.org" : null,
      modules: lireModules(config.projefa_modules),
      // Listes éditoriales, déjà analysées : les pages n'ont plus qu'à les afficher.
      contenus: Object.fromEntries(
        LISTES_CONTENU.map(l => [l.cle, lireListe(l.cle, config[l.cle])])
      ) as Record<string, Record<string, string>[]>,
      // Calculé côté serveur : le client ne doit pas pouvoir ouvrir les
      // inscriptions en trichant sur l'horloge de sa machine.
      inscriptionsProjefaOuvertes: inscriptionsOuvertes(config),
    };
  }),
});
