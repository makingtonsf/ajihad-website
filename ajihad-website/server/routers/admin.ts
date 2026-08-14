import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import {
  projets, actualites, indicateurs, partenaires, membres, candidatures,
  contributions, demandesPartenariat, formulairesContact, journalAudit,
  users, parametres, documents, notifications
} from "../../drizzle/schema";
import { eq, desc, count, and, gte, sql, inArray } from "drizzle-orm";
import { modeDemo, demo } from "../_core/devFixtures";
import { genererOpenId, hacherMotDePasse } from "../_core/auth";
import { randomBytes } from "crypto";
import { estSuperviseur, peutAccederAdmin, ROLES_ATTRIBUABLES } from "@shared/roles";

/**
 * Mot de passe provisoire lisible : trois syllabes et quatre chiffres.
 * Assez simple à dicter au téléphone, assez long pour résister au hasard.
 * Le membre le change depuis son espace, onglet Sécurité.
 */
function genererMotDePasse(): string {
  const syllabes = ["ba", "ke", "li", "mo", "nu", "ra", "so", "ti", "va", "ze", "ja", "fo"];
  const octets = randomBytes(4);
  const mot = Array.from(octets.subarray(0, 3), o => syllabes[o % syllabes.length]).join("");
  const chiffres = String(1000 + (octets[3] * 31) % 9000);
  return `${mot}${chiffres}`;
}

// Middleware: only admin roles can access
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!peutAccederAdmin(ctx.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Accès refusé. Rôle insuffisant." });
  }
  return next({ ctx });
});

const superAdminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (!estSuperviseur(ctx.user.role)) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Accès réservé aux administrateurs." });
  }
  return next({ ctx });
});

async function logAudit(db: any, userId: number, nom: string, action: string, ressource: string, ressourceId?: number, details?: string) {
  try {
    await db.insert(journalAudit).values({
      utilisateurId: userId,
      utilisateurNom: nom,
      action,
      ressource,
      ressourceId,
      details,
      resultat: "succes",
    });
  } catch {}
}

export const adminRouter = router({
  // Indique au client si les données affichées sont factices.
  modeDemo: adminProcedure.query(() => ({ actif: modeDemo() })),

  // Dashboard overview
  overview: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      if (modeDemo()) {
        const candidaturesDemo = demo.table("candidatures").lister();
        const contributionsDemo = demo.table("contributions").lister();
        const projetsDemo = demo.table("projets").lister();
        const formulairesDemo = demo.table("formulaires").lister();
        const partenariatsDemo = demo.table("partenariats").lister();
        const membresDemo = demo.listerMembres();

        const compterPar = (elements: any[], champ: string) => {
          const compte = new Map<string, number>();
          for (const element of elements) {
            const valeur = String(element[champ] ?? "");
            compte.set(valeur, (compte.get(valeur) ?? 0) + 1);
          }
          return Array.from(compte, ([valeur, total]) => ({ valeur, total }));
        };

        const debutFenetre = new Date();
        debutFenetre.setDate(1);
        debutFenetre.setHours(0, 0, 0, 0);
        debutFenetre.setMonth(debutFenetre.getMonth() - 5);

        const moisDe = (date: Date | string) => {
          const d = new Date(date);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        };

        const activiteMensuelle: { mois: string; candidatures: number; contacts: number }[] = [];
        for (let i = 0; i < 6; i++) {
          const d = new Date(debutFenetre);
          d.setMonth(d.getMonth() + i);
          const mois = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          activiteMensuelle.push({
            mois,
            candidatures: candidaturesDemo.filter(e => moisDe(e.createdAt) === mois).length,
            contacts: formulairesDemo.filter(e => moisDe(e.createdAt) === mois).length,
          });
        }

        return {
          stats: {
            candidaturesEnAttente: candidaturesDemo.filter(e => e.statut === "recue").length,
            contributionsEnAttente: contributionsDemo.filter(e => e.statut === "declaree").length,
            projetsActifs: projetsDemo.filter(e => e.statut === "en_cours").length,
            formulairesNouveaux: formulairesDemo.filter(e => e.statut === "nouveau").length,
            membresActifs: membresDemo.filter(e => e.statut === "actif").length,
            partenariatsEnAttente: partenariatsDemo.filter(e => e.statut === "recue").length,
          },
          candidaturesParType: compterPar(candidaturesDemo, "type")
            .map(({ valeur, total }) => ({ type: valeur || "membre", count: total })),
          contributionsParStatut: compterPar(contributionsDemo, "statut")
            .map(({ valeur, total }) => ({ statut: valeur || "declaree", count: total })),
          activiteMensuelle,
        };
      }

      return {
        stats: {},
        candidaturesParType: [] as { type: string; count: number }[],
        contributionsParStatut: [] as { statut: string; count: number }[],
        activiteMensuelle: [] as { mois: string; candidatures: number; contacts: number }[],
      };
    }
    const [
      [{ total: totalCandidatures }],
      [{ total: totalContributions }],
      [{ total: totalProjets }],
      [{ total: totalFormulaires }],
      [{ total: totalMembres }],
      [{ total: totalPartenariats }],
    ] = await Promise.all([
      db.select({ total: count() }).from(candidatures).where(eq(candidatures.statut, "recue")),
      db.select({ total: count() }).from(contributions).where(eq(contributions.statut, "declaree")),
      db.select({ total: count() }).from(projets).where(eq(projets.statut, "en_cours")),
      db.select({ total: count() }).from(formulairesContact).where(eq(formulairesContact.statut, "nouveau")),
      db.select({ total: count() }).from(membres).where(eq(membres.statut, "actif")),
      db.select({ total: count() }).from(demandesPartenariat).where(eq(demandesPartenariat.statut, "recue")),
    ]);

    // Fenêtre glissante des 6 derniers mois (mois courant inclus)
    const debutFenetre = new Date();
    debutFenetre.setDate(1);
    debutFenetre.setHours(0, 0, 0, 0);
    debutFenetre.setMonth(debutFenetre.getMonth() - 5);

    const moisCandidatures = sql<string>`DATE_FORMAT(${candidatures.createdAt}, '%Y-%m')`;
    const moisContacts = sql<string>`DATE_FORMAT(${formulairesContact.createdAt}, '%Y-%m')`;

    const [parType, parStatut, candParMois, contactsParMois] = await Promise.all([
      db.select({ type: candidatures.type, total: count() }).from(candidatures).groupBy(candidatures.type),
      db.select({ statut: contributions.statut, total: count() }).from(contributions).groupBy(contributions.statut),
      db.select({ mois: moisCandidatures, total: count() }).from(candidatures)
        .where(gte(candidatures.createdAt, debutFenetre)).groupBy(moisCandidatures),
      db.select({ mois: moisContacts, total: count() }).from(formulairesContact)
        .where(gte(formulairesContact.createdAt, debutFenetre)).groupBy(moisContacts),
    ]);

    const activiteMensuelle: { mois: string; candidatures: number; contacts: number }[] = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(debutFenetre);
      d.setMonth(d.getMonth() + i);
      const cle = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      activiteMensuelle.push({
        mois: cle,
        candidatures: Number(candParMois.find(r => r.mois === cle)?.total ?? 0),
        contacts: Number(contactsParMois.find(r => r.mois === cle)?.total ?? 0),
      });
    }

    return {
      stats: {
        candidaturesEnAttente: totalCandidatures,
        contributionsEnAttente: totalContributions,
        projetsActifs: totalProjets,
        formulairesNouveaux: totalFormulaires,
        membresActifs: totalMembres,
        partenariatsEnAttente: totalPartenariats,
      },
      candidaturesParType: parType.map(r => ({ type: r.type ?? "membre", count: Number(r.total) })),
      contributionsParStatut: parStatut.map(r => ({ statut: r.statut ?? "declaree", count: Number(r.total) })),
      activiteMensuelle,
    };
  }),

  /**
   * Fil d'activité : les dernières entrées reçues, toutes natures confondues.
   *
   * Le tableau de bord ne montrait que les formulaires de contact. Or ce qui
   * demande une action arrive par quatre canaux distincts — candidatures,
   * partenariats, contributions, messages. Les fusionner en un seul flux
   * chronologique évite d'avoir à visiter quatre écrans pour savoir où on en est.
   */
  filActivite: adminProcedure.query(async () => {
    const db = await getDb();

    const lire = async (table: "candidatures" | "partenariats" | "contributions" | "formulaires") => {
      if (!db) return modeDemo() ? demo.table(table).lister() : [];
      const source = {
        candidatures, partenariats: demandesPartenariat,
        contributions, formulaires: formulairesContact,
      }[table];
      return db.select().from(source as any).orderBy(desc((source as any).createdAt)).limit(10);
    };

    const [cand, part, contrib, form] = await Promise.all([
      lire("candidatures"), lire("partenariats"), lire("contributions"), lire("formulaires"),
    ]);

    const evenements = [
      ...cand.map((e: any) => ({
        type: "candidature" as const, id: e.id, reference: e.reference,
        titre: `${e.prenom ?? ""} ${e.nom ?? ""}`.trim() || "Candidature",
        detail: e.type ?? "membre", statut: e.statut, createdAt: e.createdAt,
        lien: "/admin/candidatures",
      })),
      ...part.map((e: any) => ({
        type: "partenariat" as const, id: e.id, reference: e.reference,
        titre: e.nomOrganisation ?? "Demande de partenariat",
        detail: e.domaineCollaboration ?? "", statut: e.statut, createdAt: e.createdAt,
        lien: "/admin/partenariats",
      })),
      ...contrib.map((e: any) => ({
        type: "contribution" as const, id: e.id, reference: e.reference,
        titre: e.nomContributeur ?? "Contribution",
        detail: [e.montant, e.devise].filter(Boolean).join(" "), statut: e.statut, createdAt: e.createdAt,
        lien: "/admin/contributions",
      })),
      ...form.map((e: any) => ({
        type: "message" as const, id: e.id, reference: e.reference,
        titre: e.nomComplet ?? "Message",
        detail: e.objet ?? "", statut: e.statut, createdAt: e.createdAt,
        lien: "/admin/soumissions",
      })),
    ];

    // Statuts considérés comme « rien à faire » : tout le reste attend une main.
    const traites = new Set([
      "approuvee", "refusee", "invitation_envoyee", "acceptee", "archive",
      "confirmee", "annulee", "remboursee", "traite",
    ]);

    return {
      evenements: evenements
        .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
        .slice(0, 12),
      aTraiter: {
        candidatures: cand.filter((e: any) => !traites.has(e.statut)).length,
        partenariats: part.filter((e: any) => !traites.has(e.statut)).length,
        contributions: contrib.filter((e: any) => !traites.has(e.statut)).length,
        messages: form.filter((e: any) => !traites.has(e.statut)).length,
      },
    };
  }),

  // Projects CRUD
  projets: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return modeDemo() ? demo.table("projets").lister() : [];
      return db.select().from(projets).orderBy(desc(projets.updatedAt));
    }),
    create: adminProcedure
      .input(z.object({
        slug: z.string().min(2).max(200),
        titre: z.string().min(2).max(300),
        resume: z.string().optional(),
        contexte: z.string().optional(),
        objectifGeneral: z.string().optional(),
        statut: z.enum(["brouillon", "en_preparation", "en_cours", "termine", "archive"]).default("brouillon"),
        axeIntervention: z.string().max(100).optional(),
        zone: z.string().max(100).optional(),
        localisation: z.string().max(200).optional(),
        duree: z.string().max(100).optional(),
        type: z.enum(["formation", "leadership", "sensibilisation", "communautaire", "environnement", "culture", "innovation", "inclusion", "conference", "accompagnement"]).default("formation"),
        annee: z.number().optional(),
        publicCible: z.string().max(200).optional(),
        beneficiaires: z.string().optional(),
        estProjetPhare: z.boolean().default(false),
        estProjefa: z.boolean().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.table("projets").creer(input as any);
          return { success: true };
        }
        await db.insert(projets).values({ ...input });
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "create", "projets", undefined, input.slug);
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.table("projets").maj(input.id, input.data as any);
          return { success: true };
        }
        await db.update(projets).set({ ...input.data, updatedAt: new Date() }).where(eq(projets.id, input.id));
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "update", "projets", input.id);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.table("projets").supprimer(input.id);
          return { success: true };
        }
        await db.delete(projets).where(eq(projets.id, input.id));
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "delete", "projets", input.id);
        return { success: true };
      }),
  }),

  // News CRUD
  actualites: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return modeDemo() ? demo.table("actualites").lister() : [];
      return db.select().from(actualites).orderBy(desc(actualites.updatedAt));
    }),
    create: adminProcedure
      .input(z.object({
        slug: z.string(),
        titre: z.string(),
        resume: z.string().optional(),
        contenu: z.string().optional(),
        auteur: z.string().optional(),
        categorie: z.enum(["actualite","communique","evenement","conference","formation","appel_candidature","publication"]).optional(),
        statut: z.enum(["brouillon","en_revision","valide","publie","archive"]).default("brouillon"),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.table("actualites").creer(input as any);
          return { success: true };
        }
        await db.insert(actualites).values({ ...input });
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "create", "actualites");
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.table("actualites").maj(input.id, input.data as any);
          return { success: true };
        }
        await db.update(actualites).set({ ...input.data, updatedAt: new Date() }).where(eq(actualites.id, input.id));
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "update", "actualites", input.id);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.table("actualites").supprimer(input.id);
          return { success: true };
        }
        await db.delete(actualites).where(eq(actualites.id, input.id));
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "delete", "actualites", input.id);
        return { success: true };
      }),
  }),

  // Members management
  membres: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return modeDemo() ? demo.listerMembres() : [];
      return db.select().from(membres).orderBy(desc(membres.createdAt));
    }),
    updateStatut: adminProcedure
      .input(z.object({ id: z.number(), statut: z.enum(["en_attente","verifie","approuve","refuse","actif","inactif"]) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.majMembre(input.id, { statut: input.statut });
          return { success: true };
        }
        await db.update(membres).set({ statut: input.statut, updatedAt: new Date() }).where(eq(membres.id, input.id));
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "update_statut", "membres", input.id, input.statut);
        return { success: true };
      }),
    // Change la catégorie : membre, bénévole ou ambassadeur.
    updateType: adminProcedure
      .input(z.object({ id: z.number(), typeMembre: z.enum(["membre","benevole","ambassadeur"]) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.majMembre(input.id, { typeMembre: input.typeMembre });
          return { success: true };
        }
        await db.update(membres).set({ typeMembre: input.typeMembre, updatedAt: new Date() }).where(eq(membres.id, input.id));
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "update_type", "membres", input.id, input.typeMembre);
        return { success: true };
      }),
    create: adminProcedure
      .input(z.object({
        prenom: z.string().min(2).max(100),
        nom: z.string().min(2).max(100),
        email: z.string().email().max(320),
        telephone: z.string().max(30).optional(),
        adresse: z.string().max(500).optional(),
        departement: z.string().max(100).optional(),
        commune: z.string().max(100).optional(),
        niveauEtude: z.string().max(100).optional(),
        competences: z.string().max(2000).optional(),
        motivation: z.string().max(3000).optional(),
        commission: z.string().max(100).optional(),
        typeMembre: z.enum(["membre","benevole","ambassadeur"]).default("membre"),
        statut: z.enum(["en_attente","verifie","approuve","refuse","actif","inactif"]).default("en_attente"),
        notesInternes: z.string().max(3000).optional(),
        dateAdhesion: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.creerMembre(input);
          return { success: true };
        }
        const { dateAdhesion, ...reste } = input;
        await db.insert(membres).values({
          ...reste,
          dateAdhesion: dateAdhesion ? new Date(dateAdhesion) : null,
        });
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "create", "membres", undefined, `${input.prenom} ${input.nom}`);
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.majMembre(input.id, input.data);
          return { success: true };
        }
        const { dateAdhesion, ...reste } = input.data;
        await db.update(membres).set({
          ...reste,
          ...(dateAdhesion !== undefined ? { dateAdhesion: dateAdhesion ? new Date(dateAdhesion) : null } : {}),
          updatedAt: new Date(),
        }).where(eq(membres.id, input.id));
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "update", "membres", input.id);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.supprimerMembre(input.id);
          return { success: true };
        }
        await db.delete(membres).where(eq(membres.id, input.id));
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "delete", "membres", input.id);
        return { success: true };
      }),

    /**
     * Crée l'accès de connexion d'un membre et renvoie un mot de passe
     * provisoire, affiché une seule fois.
     *
     * L'inscription libre étant fermée, c'est le seul chemin de création d'un
     * compte membre. Le mot de passe n'est jamais stocké en clair : seul son
     * empreinte scrypt est conservée, comme pour tout autre compte.
     */
    creerAcces: adminProcedure
      .input(z.object({ membreId: z.number(), role: z.enum(["membre", "user"]).default("membre") }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();

        const fiche = db
          ? (await db.select().from(membres).where(eq(membres.id, input.membreId)).limit(1))[0]
          : demo.listerMembres().find(m => m.id === input.membreId);
        if (!fiche) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Fiche membre introuvable." });
        }

        const motDePasse = genererMotDePasse();
        const hash = await hacherMotDePasse(motDePasse);
        const nomComplet = `${fiche.prenom} ${fiche.nom}`.trim();

        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          if (demo.compteParEmail(fiche.email)) {
            throw new TRPCError({ code: "CONFLICT", message: "Ce membre a déjà un accès." });
          }
          const compte = demo.creerCompte({
            nom: nomComplet, email: fiche.email, motDePasseHash: hash, role: input.role,
          });
          demo.majMembre(fiche.id, { userId: compte.id });
          return { success: true, email: fiche.email, motDePasse };
        }

        const existant = await db.select({ id: users.id }).from(users)
          .where(eq(users.email, fiche.email)).limit(1);
        if (existant.length > 0) {
          throw new TRPCError({ code: "CONFLICT", message: "Un compte utilise déjà cette adresse." });
        }

        await db.insert(users).values({
          openId: genererOpenId(),
          name: nomComplet,
          email: fiche.email,
          loginMethod: "mot_de_passe",
          motDePasseHash: hash,
          role: input.role,
        });
        const cree = await db.select({ id: users.id }).from(users)
          .where(eq(users.email, fiche.email)).limit(1);
        await db.update(membres).set({ userId: cree[0].id, updatedAt: new Date() })
          .where(eq(membres.id, fiche.id));

        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "creer_acces", "membres", fiche.id, fiche.email);
        return { success: true, email: fiche.email, motDePasse };
      }),

    /** Régénère un mot de passe provisoire pour un membre ayant perdu le sien. */
    reinitialiserMotDePasse: adminProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        const motDePasse = genererMotDePasse();
        const hash = await hacherMotDePasse(motDePasse);

        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          const compte = demo.compteParEmail(input.email);
          if (!compte) throw new TRPCError({ code: "NOT_FOUND", message: "Compte introuvable." });
          demo.definirMotDePasse(compte.id, hash);
          return { success: true, email: input.email, motDePasse };
        }

        const compte = await db.select({ id: users.id }).from(users)
          .where(eq(users.email, input.email)).limit(1);
        if (compte.length === 0) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Compte introuvable." });
        }
        await db.update(users).set({ motDePasseHash: hash, echecsConnexion: 0, bloqueJusqua: null })
          .where(eq(users.id, compte[0].id));
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "reinitialiser_mdp", "users", compte[0].id, input.email);
        return { success: true, email: input.email, motDePasse };
      }),
  }),

  // Candidatures
  candidatures: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) {
        if (!modeDemo()) return [];
        const fiches = demo.listerMembres();
        return demo.table("candidatures").lister().map((c: any) => ({
          ...c,
          membreId: fiches.find(m => m.email.toLowerCase() === String(c.email ?? "").toLowerCase())?.id ?? null,
        }));
      }
      const lignes = await db.select().from(candidatures).orderBy(desc(candidatures.createdAt));
      const emails = Array.from(new Set(lignes.map(c => c.email).filter(Boolean)));
      if (emails.length === 0) return lignes.map(c => ({ ...c, membreId: null }));
      const fiches = await db.select({ id: membres.id, email: membres.email })
        .from(membres).where(inArray(membres.email, emails));
      const parEmail = new Map(fiches.map(f => [f.email.toLowerCase(), f.id]));
      return lignes.map(c => ({ ...c, membreId: parEmail.get(c.email.toLowerCase()) ?? null }));
    }),
    updateStatut: adminProcedure
      .input(z.object({
        id: z.number(),
        statut: z.enum(["recue","en_verification","en_analyse","approuvee","refusee","invitation_envoyee"]),
        notes: z.string().optional(),
        data: z.object({
          type: z.enum(["membre", "benevole", "ambassadeur", "projefa"]).optional(),
          prenom: z.string().min(2).max(100).optional(),
          nom: z.string().min(2).max(100).optional(),
          email: z.string().email().max(320).optional(),
          telephone: z.string().max(30).optional(),
          adresse: z.string().max(500).optional(),
          departement: z.string().max(100).optional(),
          commune: z.string().max(100).optional(),
          niveauEtude: z.string().max(100).optional(),
          competences: z.string().max(2000).optional(),
          motivation: z.string().max(3000).optional(),
          disponibilite: z.string().max(200).optional(),
          experienceAssociative: z.string().max(2000).optional(),
        }).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        const data = input.data ?? {};
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.table("candidatures").maj(input.id, { ...data, statut: input.statut, notesInternes: input.notes });
          return { success: true };
        }
        await db.update(candidatures).set({ ...data, statut: input.statut, notesInternes: input.notes, updatedAt: new Date() }).where(eq(candidatures.id, input.id));
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "update_statut", "candidatures", input.id, input.statut);
        return { success: true };
      }),
    convertirEnMembre: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        const candidature = db
          ? (await db.select().from(candidatures).where(eq(candidatures.id, input.id)).limit(1))[0]
          : (modeDemo() ? demo.table("candidatures").parId(input.id) : null);
        if (!candidature) throw new TRPCError({ code: "NOT_FOUND", message: "Candidature introuvable." });
        if (!["membre", "benevole", "ambassadeur"].includes(candidature.type ?? "")) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Cette candidature ne correspond pas à une fiche membre." });
        }
        if (candidature.statut !== "approuvee") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "La candidature doit être approuvée avant son intégration." });
        }

        const typeMembre = candidature.type as "membre" | "benevole" | "ambassadeur";
        const notes = [
          candidature.notesInternes,
          `Intégrée depuis la candidature ${candidature.reference}.`,
        ].filter(Boolean).join(" ");

        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          const existant = demo.listerMembres().find(m => m.email.toLowerCase() === candidature.email.toLowerCase());
          if (existant) return { success: true, membreId: existant.id, dejaExistant: true };
          const membre = demo.creerMembre({
            prenom: candidature.prenom, nom: candidature.nom, email: candidature.email,
            telephone: candidature.telephone, adresse: candidature.adresse,
            departement: candidature.departement, commune: candidature.commune,
            niveauEtude: candidature.niveauEtude, competences: candidature.competences,
            motivation: candidature.motivation, typeMembre, statut: "approuve",
            cvUrl: candidature.cvUrl, cvNom: candidature.cvNom, cvTaille: candidature.cvTaille,
            photoUrl: candidature.photoUrl, photoNom: candidature.photoNom, photoTaille: candidature.photoTaille,
            reponses: candidature.reponses, notesInternes: notes, dateAdhesion: new Date(),
          });
          return { success: true, membreId: membre.id, dejaExistant: false };
        }

        const existant = await db.select({ id: membres.id }).from(membres)
          .where(eq(membres.email, candidature.email)).limit(1);
        if (existant[0]) return { success: true, membreId: existant[0].id, dejaExistant: true };
        await db.insert(membres).values({
          prenom: candidature.prenom, nom: candidature.nom, email: candidature.email,
          telephone: candidature.telephone, adresse: candidature.adresse,
          departement: candidature.departement, commune: candidature.commune,
          niveauEtude: candidature.niveauEtude, competences: candidature.competences,
          motivation: candidature.motivation, typeMembre, statut: "approuve",
          cvUrl: candidature.cvUrl, cvNom: candidature.cvNom, cvTaille: candidature.cvTaille,
          photoUrl: candidature.photoUrl, photoNom: candidature.photoNom, photoTaille: candidature.photoTaille,
          reponses: candidature.reponses, notesInternes: notes, dateAdhesion: new Date(),
        });
        const cree = await db.select({ id: membres.id }).from(membres)
          .where(eq(membres.email, candidature.email)).orderBy(desc(membres.createdAt)).limit(1);
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "convertir", "candidatures", input.id, `${candidature.reference} → membre`);
        return { success: true, membreId: cree[0]?.id ?? null, dejaExistant: false };
      }),
  }),

  // Contributions
  contributions: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return modeDemo() ? demo.table("contributions").lister() : [];
      return db.select().from(contributions).orderBy(desc(contributions.createdAt));
    }),
    updateStatut: adminProcedure
      .input(z.object({ id: z.number(), statut: z.enum(["brouillon","declaree","en_attente_verification","confirmee","annulee","recue_nature","remboursee"]) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.table("contributions").maj(input.id, { ...input, id: undefined } as any);
          return { success: true };
        }
        await db.update(contributions).set({ statut: input.statut, updatedAt: new Date() }).where(eq(contributions.id, input.id));
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "update_statut", "contributions", input.id, input.statut);
        return { success: true };
      }),
  }),

  // Forms received
  formulaires: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return modeDemo() ? demo.table("formulaires").lister() : [];
      return db.select().from(formulairesContact).orderBy(desc(formulairesContact.createdAt));
    }),
    updateStatut: adminProcedure
      .input(z.object({ id: z.number(), statut: z.enum(["nouveau","en_traitement","traite","archive"]) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.table("formulaires").maj(input.id, { ...input, id: undefined } as any);
          return { success: true };
        }
        await db.update(formulairesContact).set({ statut: input.statut, updatedAt: new Date() }).where(eq(formulairesContact.id, input.id));
        return { success: true };
      }),
  }),

  // Partnership requests
  partenariats: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return modeDemo() ? demo.table("partenariats").lister() : [];
      return db.select().from(demandesPartenariat).orderBy(desc(demandesPartenariat.createdAt));
    }),
    updateStatut: adminProcedure
      .input(z.object({
        id: z.number(),
        statut: z.enum(["recue", "en_analyse", "en_negociation", "acceptee", "refusee", "archive"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.table("partenariats").maj(input.id, { ...input, id: undefined } as any);
          return { success: true };
        }
        await db.update(demandesPartenariat)
          .set({ statut: input.statut, notesInternes: input.notes, updatedAt: new Date() })
          .where(eq(demandesPartenariat.id, input.id));
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "update_statut", "demandes_partenariat", input.id, input.statut);
        return { success: true };
      }),
  }),

  // Partners (CRUD)
  partenaires: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return modeDemo() ? demo.table("partenaires").lister() : [];
      return db.select().from(partenaires).orderBy(desc(partenaires.updatedAt));
    }),
    create: adminProcedure
      .input(z.object({
        nom: z.string().min(2).max(200),
        type: z.enum(["bailleur", "technique", "institutionnel", "local", "diaspora", "entreprise"]).default("local"),
        logoUrl: z.string().max(2000).optional(),
        siteWeb: z.string().max(2000).optional(),
        description: z.string().max(3000).optional(),
        statut: z.enum(["brouillon", "valide", "archive"]).default("brouillon"),
        estPublic: z.boolean().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.table("partenaires").creer(input as any);
          return { success: true };
        }
        await db.insert(partenaires).values({ ...input });
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "create", "partenaires", undefined, input.nom);
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.table("partenaires").maj(input.id, input.data as any);
          return { success: true };
        }
        await db.update(partenaires).set({ ...input.data, updatedAt: new Date() }).where(eq(partenaires.id, input.id));
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "update", "partenaires", input.id);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.table("partenaires").supprimer(input.id);
          return { success: true };
        }
        await db.delete(partenaires).where(eq(partenaires.id, input.id));
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "delete", "partenaires", input.id);
        return { success: true };
      }),
    togglePublic: adminProcedure
      .input(z.object({ id: z.number(), estPublic: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.table("partenaires").maj(input.id, { ...input, id: undefined } as any);
          return { success: true };
        }
        await db.update(partenaires).set({ estPublic: input.estPublic, updatedAt: new Date() }).where(eq(partenaires.id, input.id));
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "toggle_public", "partenaires", input.id, String(input.estPublic));
        return { success: true };
      }),
  }),

  // Documents & resources (CRUD)
  documents: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return modeDemo() ? demo.table("documents").lister() : [];
      return db.select().from(documents).orderBy(desc(documents.updatedAt));
    }),
    create: adminProcedure
      .input(z.object({
        titre: z.string().min(2).max(300),
        description: z.string().max(3000).optional(),
        categorie: z.enum(["rapport_annuel", "rapport_activites", "institutionnel", "resume_projet", "note_conceptuelle", "presentation", "formulaire", "publication", "communique", "ressource_pedagogique"]).default("institutionnel"),
        fileUrl: z.string().max(2000).optional(),
        fileType: z.string().max(20).optional(),
        langue: z.string().max(10).default("fr"),
        version: z.string().max(20).optional(),
        visibilite: z.enum(["public", "membres", "gestionnaires", "admin"]).default("public"),
        projetId: z.number().optional(),
        dateDocument: z.string().optional(),
        dateExpiration: z.string().optional(),
        statut: z.enum(["brouillon", "valide", "archive"]).default("brouillon"),
        estPublic: z.boolean().default(false),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.table("documents").creer(input as any);
          return { success: true };
        }
        const { dateDocument, dateExpiration, ...rest } = input;
        await db.insert(documents).values({
          ...rest,
          dateDocument: dateDocument ? new Date(dateDocument) : undefined,
          dateExpiration: dateExpiration ? new Date(dateExpiration) : undefined,
        });
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "create", "documents", undefined, input.titre);
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.table("documents").maj(input.id, input.data as any);
          return { success: true };
        }
        const { dateDocument, dateExpiration, ...rest } = input.data;
        await db.update(documents).set({
          ...rest,
          ...(dateDocument !== undefined ? { dateDocument: dateDocument ? new Date(dateDocument) : null } : {}),
          ...(dateExpiration !== undefined ? { dateExpiration: dateExpiration ? new Date(dateExpiration) : null } : {}),
          updatedAt: new Date(),
        }).where(eq(documents.id, input.id));
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "update", "documents", input.id);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.table("documents").supprimer(input.id);
          return { success: true };
        }
        await db.delete(documents).where(eq(documents.id, input.id));
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "delete", "documents", input.id);
        return { success: true };
      }),
    togglePublic: adminProcedure
      .input(z.object({ id: z.number(), estPublic: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.table("documents").maj(input.id, { ...input, id: undefined } as any);
          return { success: true };
        }
        await db.update(documents).set({ estPublic: input.estPublic, updatedAt: new Date() }).where(eq(documents.id, input.id));
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "toggle_public", "documents", input.id, String(input.estPublic));
        return { success: true };
      }),
  }),

  // Users management (super admin only)
  users: router({
    list: superAdminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return modeDemo() ? demo.listerComptes() : [];
      return db.select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt, lastSignedIn: users.lastSignedIn }).from(users).orderBy(desc(users.createdAt));
    }),
    updateRole: superAdminProcedure
      .input(z.object({ id: z.number(), role: z.enum(["super_admin","admin","editeur_communication","responsable_projet","responsable_commission","membre","user"]) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          if (input.id === ctx.user.id) {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Vous ne pouvez pas modifier votre propre rôle." });
          }
          demo.majRole(input.id, input.role);
          return { success: true };
        }
        if (input.id === ctx.user.id) throw new TRPCError({ code: "BAD_REQUEST", message: "Vous ne pouvez pas modifier votre propre rôle." });
        await db.update(users).set({ role: input.role }).where(eq(users.id, input.id));
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "update_role", "users", input.id, input.role);
        return { success: true };
      }),

    /**
     * Crée un compte d'administration de zéro.
     *
     * Jusqu'ici, un accès ne pouvait naître que d'une fiche membre existante :
     * il était donc impossible de nommer un administrateur qui n'est pas
     * membre. Le mot de passe provisoire est renvoyé une seule fois, à
     * transmettre de vive voix ; seule son empreinte est conservée.
     */
    creer: superAdminProcedure
      .input(z.object({
        nom: z.string().min(2, "Le nom doit comporter au moins 2 caractères.").max(120),
        email: z.string().email("Adresse e-mail invalide."),
        role: z.enum(ROLES_ATTRIBUABLES),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        const motDePasse = genererMotDePasse();
        const hash = await hacherMotDePasse(motDePasse);
        const email = input.email.trim().toLowerCase();

        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          if (demo.compteParEmail(email)) {
            throw new TRPCError({ code: "CONFLICT", message: "Un compte utilise déjà cette adresse." });
          }
          demo.creerCompte({ nom: input.nom, email, role: input.role, motDePasseHash: hash });
          return { success: true, email, motDePasse };
        }

        const existant = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
        if (existant.length > 0) {
          throw new TRPCError({ code: "CONFLICT", message: "Un compte utilise déjà cette adresse." });
        }

        await db.insert(users).values({
          openId: genererOpenId(),
          name: input.nom,
          email,
          motDePasseHash: hash,
          role: input.role,
          loginMethod: "mot_de_passe",
        });
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "creer_compte", "users", undefined, `${email} (${input.role})`);
        return { success: true, email, motDePasse };
      }),

    /**
     * Réinitialise le mot de passe d'un compte et lève son éventuel blocage.
     *
     * Les mots de passe existants sont hachés : personne ne peut les relire,
     * pas même depuis la base. Réinitialiser est donc le seul moyen de
     * dépanner quelqu'un qui a oublié le sien.
     */
    reinitialiser: superAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        const motDePasse = genererMotDePasse();
        const hash = await hacherMotDePasse(motDePasse);

        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          const compte = demo.compteParId(input.id);
          if (!compte) throw new TRPCError({ code: "NOT_FOUND", message: "Compte introuvable." });
          demo.definirMotDePasse(input.id, hash);
          return { success: true, email: compte.email ?? "", motDePasse };
        }

        const compte = await db.select({ id: users.id, email: users.email }).from(users)
          .where(eq(users.id, input.id)).limit(1);
        if (compte.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Compte introuvable." });

        await db.update(users)
          .set({ motDePasseHash: hash, echecsConnexion: 0, bloqueJusqua: null })
          .where(eq(users.id, input.id));
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "reinitialiser_mdp", "users", input.id, compte[0].email ?? "");
        return { success: true, email: compte[0].email ?? "", motDePasse };
      }),

    /** Lève le verrou posé après cinq échecs de connexion. */
    debloquer: superAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          return { success: true };
        }
        await db.update(users).set({ echecsConnexion: 0, bloqueJusqua: null }).where(eq(users.id, input.id));
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "debloquer_compte", "users", input.id);
        return { success: true };
      }),
  }),

  /**
   * Demandes d'aide « mot de passe oublié », déposées depuis les écrans de
   * connexion. Elles arrivent ici sous forme de notifications de type alerte.
   */
  alertes: router({
    list: adminProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return modeDemo() ? demo.listerNotifications(ctx.user.id) : [];
      return db.select().from(notifications)
        .where(eq(notifications.destinataireId, ctx.user.id))
        .orderBy(desc(notifications.createdAt))
        .limit(100);
    }),
    marquerLue: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) return { success: true };
        await db.update(notifications).set({ estLu: true }).where(eq(notifications.id, input.id));
        return { success: true };
      }),
  }),

  // Audit log
  audit: router({
    list: superAdminProcedure
      .input(z.object({ limit: z.number().min(1).max(1000).default(500) }).optional())
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return modeDemo() ? demo.table("audit").lister() : [];
        return db.select().from(journalAudit)
          .orderBy(desc(journalAudit.createdAt))
          .limit(input?.limit ?? 500);
      }),
  }),

  // Institutional settings
  parametres: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return modeDemo() ? demo.listerParametres() : [];
      return db.select().from(parametres);
    }),
    // Upsert : la table peut être vide au premier enregistrement d'une clé.
    // Le contenu public est éditorial : les administrateurs opérationnels
    // doivent pouvoir le mettre à jour depuis « Contenus du site ».
    update: adminProcedure
      .input(z.object({ cle: z.string().min(1).max(100), valeur: z.string().max(5000), description: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.ecrireParametre(input.cle, input.valeur);
          return { success: true };
        }
        await db.insert(parametres)
          .values({ cle: input.cle, valeur: input.valeur, description: input.description })
          .onDuplicateKeyUpdate({ set: { valeur: input.valeur, updatedAt: new Date() } });
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "update_parametre", "parametres", undefined, input.cle);
        return { success: true };
      }),
    updateMany: adminProcedure
      .input(z.object({ valeurs: z.array(z.object({ cle: z.string().min(1).max(100), valeur: z.string().max(5000) })) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          for (const { cle, valeur } of input.valeurs) demo.ecrireParametre(cle, valeur);
          return { success: true };
        }
        for (const { cle, valeur } of input.valeurs) {
          await db.insert(parametres)
            .values({ cle, valeur })
            .onDuplicateKeyUpdate({ set: { valeur, updatedAt: new Date() } });
        }
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "update_parametres", "parametres", undefined, `${input.valeurs.length} clé(s)`);
        return { success: true };
      }),
  }),

  // Indicateurs
  indicateurs: router({
    list: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return modeDemo() ? demo.table("indicateurs").lister() : [];
      return db.select().from(indicateurs).orderBy(desc(indicateurs.updatedAt));
    }),
    create: adminProcedure
      .input(z.object({
        nom: z.string(),
        valeur: z.string().optional(),
        unite: z.string().optional(),
        periode: z.string().optional(),
        zone: z.string().optional(),
        axeIntervention: z.string().optional(),
        source: z.string().optional(),
        estPublic: z.boolean().default(false),
        statut: z.enum(["brouillon","a_verifier","valide"]).default("brouillon"),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.table("indicateurs").creer(input as any);
          return { success: true };
        }
        await db.insert(indicateurs).values(input);
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "create", "indicateurs");
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({ id: z.number(), data: z.record(z.string(), z.any()) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.table("indicateurs").maj(input.id, input.data as any);
          return { success: true };
        }
        await db.update(indicateurs).set({ ...input.data, updatedAt: new Date() }).where(eq(indicateurs.id, input.id));
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("DB unavailable");
          demo.table("indicateurs").supprimer(input.id);
          return { success: true };
        }
        await db.delete(indicateurs).where(eq(indicateurs.id, input.id));
        await logAudit(db, ctx.user.id, ctx.user.name ?? "inconnu", "delete", "indicateurs", input.id);
        return { success: true };
      }),
  }),
});
