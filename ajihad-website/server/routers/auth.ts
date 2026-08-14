import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { count, eq, inArray } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users, membres, notifications } from "../../drizzle/schema";
import {
  COOKIE_SESSION, authentifierRequete, genererOpenId, hacherMotDePasse,
  optionsCookieSession, signerSession, validerMotDePasse, verifierMotDePasse,
} from "../_core/auth";
import { COOKIE_PREVERSION, optionsCookiePreversion, verrouActif } from "../_core/previewAuth";
import { COMPTE_DEMO, COMPTE_SUPER_ADMIN_DEMO, COOKIE_DEV_DECONNECTE, modeDevAdmin } from "../_core/context";
import { modeDemo, demo } from "../_core/devFixtures";

const MAX_ECHECS = 5;
const DUREE_BLOCAGE_MS = 15 * 60 * 1000;

const emailSchema = z.string().trim().toLowerCase().email().max(320);

function indisponible(): never {
  throw new TRPCError({
    code: "SERVICE_UNAVAILABLE",
    message: "Base de données indisponible. Réessayez dans un instant.",
  });
}

export const authRouter = router({
  /** Utilisateur courant, ou null. Jamais d'erreur : appelé sur chaque page. */
  me: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) return null;
    const { motDePasseHash, jetonAcces, jetonExpiration, ...sur } = ctx.user as any;
    return sur;
  }),

  /**
   * Création du tout premier compte, uniquement quand la base est vierge.
   *
   * L'inscription libre est fermée : les comptes membres sont créés par
   * l'administration, qui transmet les identifiants. Cette procédure ne sert
   * qu'à l'amorçage — sans elle, une base neuve n'aurait aucun administrateur
   * et personne ne pourrait jamais entrer.
   */
  inscription: publicProcedure
    .input(
      z.object({
        nom: z.string().trim().min(2).max(150),
        email: emailSchema,
        motDePasse: z.string().min(1).max(200),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const probleme = validerMotDePasse(input.motDePasse);
      if (probleme) throw new TRPCError({ code: "BAD_REQUEST", message: probleme });

      const db = await getDb();

      // Verrou d'amorçage : dès qu'un compte existe, cette porte se referme.
      const dejaDesComptes = db
        ? (await db.select({ total: count() }).from(users))[0].total > 0
        : modeDemo() && demo.nombreComptes() > 0;
      if (dejaDesComptes) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "La création de compte est réservée à l'administration AJIHAD. Contactez un responsable pour obtenir vos identifiants.",
        });
      }


      // Sans base : création dans le magasin de démonstration, avec le même
      // hachage et la même session que la production.
      if (!db && modeDemo()) {
        if (demo.compteParEmail(input.email)) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Un compte existe déjà avec cette adresse e-mail.",
          });
        }
        const compte = demo.creerCompte({
          nom: input.nom,
          email: input.email,
          motDePasseHash: await hacherMotDePasse(input.motDePasse),
          role: demo.nombreComptes() === 0 ? "super_admin" : "user",
        });
        ctx.res.cookie(COOKIE_SESSION, await signerSession(compte.id), optionsCookieSession(ctx.req));
        ctx.res.clearCookie(COOKIE_DEV_DECONNECTE, { ...optionsCookieSession(ctx.req), maxAge: undefined });
        return { success: true, nom: compte.name };
      }

      if (!db) indisponible();

      const existant = await db.select({ id: users.id }).from(users)
        .where(eq(users.email, input.email)).limit(1);
      if (existant.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Un compte existe déjà avec cette adresse e-mail.",
        });
      }

      // Amorçage : le tout premier compte devient super administrateur, sans
      // quoi personne ne pourrait entrer dans /admin sur une base neuve. Une
      // adresse peut aussi être désignée d'avance par ADMIN_EMAIL.
      const [{ total }] = await db.select({ total: count() }).from(users);
      const emailAdmin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
      const role =
        total === 0 || (emailAdmin && input.email === emailAdmin) ? "super_admin" : "user";

      await db.insert(users).values({
        openId: genererOpenId(),
        name: input.nom,
        email: input.email,
        loginMethod: "mot_de_passe",
        motDePasseHash: await hacherMotDePasse(input.motDePasse),
        role,
      });

      const cree = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      const utilisateur = cree[0];
      if (!utilisateur) indisponible();

      const jeton = await signerSession(utilisateur.id);
      ctx.res.cookie(COOKIE_SESSION, jeton, optionsCookieSession(ctx.req));
      return { success: true, nom: utilisateur.name };
    }),

  connexion: publicProcedure
    .input(z.object({ email: emailSchema, motDePasse: z.string().min(1).max(200) }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      // Sans base : on authentifie contre le magasin de démonstration. Le
      // compte administrateur intégré accepte le mot de passe de préversion ;
      // les comptes créés depuis l'inscription ont leur propre mot de passe.
      if (!db && modeDemo()) {
        const compte = demo.compteParEmail(input.email);
        const refusDemo = new TRPCError({
          code: "UNAUTHORIZED",
          message: "Adresse e-mail ou mot de passe incorrect.",
        });
        if (!compte) throw refusDemo;

        const mdpAdminIntegre = process.env.DEMO_PASSWORD ?? "ajihad2026admin";
        const compteDemoAutorise = compte.email === COMPTE_DEMO || compte.email === COMPTE_SUPER_ADMIN_DEMO;
        const valide = compte.motDePasseHash
          ? await verifierMotDePasse(input.motDePasse, compte.motDePasseHash)
          : compteDemoAutorise && input.motDePasse === mdpAdminIntegre;
        if (!valide) throw refusDemo;

        demo.marquerConnexion(compte.id);
        ctx.res.cookie(COOKIE_SESSION, await signerSession(compte.id), optionsCookieSession(ctx.req));
        // maxAge doit être retiré : il écraserait la date d'expiration passée
        // que clearCookie utilise pour supprimer le cookie.
        ctx.res.clearCookie(COOKIE_DEV_DECONNECTE, {
          ...optionsCookieSession(ctx.req),
          maxAge: undefined,
        });
        return { success: true, nom: compte.name };
      }

      if (!db) indisponible();

      const lignes = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
      const utilisateur = lignes[0];

      // Message unique quel que soit le cas : ne pas révéler quelles adresses
      // possèdent un compte.
      const refus = new TRPCError({
        code: "UNAUTHORIZED",
        message: "Adresse e-mail ou mot de passe incorrect.",
      });

      if (!utilisateur) {
        // Coût comparable à une vraie vérification, pour que la durée de
        // réponse ne distingue pas un compte inexistant d'un mot de passe faux.
        await verifierMotDePasse(input.motDePasse, `scrypt$${"00".repeat(16)}$${"00".repeat(64)}`);
        throw refus;
      }

      const blocageActif = Boolean(utilisateur.bloqueJusqua && utilisateur.bloqueJusqua > new Date());
      if (blocageActif) {
        const minutes = Math.ceil((+utilisateur.bloqueJusqua! - Date.now()) / 60000);
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Trop de tentatives. Réessayez dans ${minutes} minute${minutes > 1 ? "s" : ""}.`,
        });
      }

      // Un blocage expiré purge le compteur : la personne repart avec ses
      // MAX_ECHECS tentatives.
      //
      // Sans cette remise à zéro, le compteur restait à 5 après l'expiration :
      // la faute suivante le portait à 6, donc au-dessus du seuil, et
      // re-bloquait aussitôt pour 15 minutes. Chaque erreur de frappe coûtait
      // alors un quart d'heure, indéfiniment, sans jamais rendre la main.
      const echecsAnterieurs = utilisateur.bloqueJusqua ? 0 : (utilisateur.echecsConnexion ?? 0);

      const valide = await verifierMotDePasse(input.motDePasse, utilisateur.motDePasseHash);
      if (!valide) {
        const echecs = echecsAnterieurs + 1;
        await db.update(users).set({
          echecsConnexion: echecs,
          bloqueJusqua: echecs >= MAX_ECHECS ? new Date(Date.now() + DUREE_BLOCAGE_MS) : null,
        }).where(eq(users.id, utilisateur.id));
        throw refus;
      }

      await db.update(users).set({
        echecsConnexion: 0,
        bloqueJusqua: null,
        lastSignedIn: new Date(),
      }).where(eq(users.id, utilisateur.id));

      const jeton = await signerSession(utilisateur.id);
      ctx.res.cookie(COOKIE_SESSION, jeton, optionsCookieSession(ctx.req));
      return { success: true, nom: utilisateur.name };
    }),

  /**
   * Demande d'aide « mot de passe oublié ».
   *
   * Aucun envoi automatique de lien : les mots de passe sont hachés et
   * l'association n'a pas encore de service d'e-mail sortant. La demande
   * arrive donc en alerte dans l'administration, à charge d'un responsable de
   * réinitialiser puis de transmettre les identifiants de vive voix.
   *
   * La réponse est volontairement identique que le compte existe ou non :
   * répondre « adresse inconnue » permettrait d'énumérer vos membres.
   */
  motDePasseOublie: publicProcedure
    .input(z.object({
      email: emailSchema,
      espace: z.enum(["administration", "membre"]).default("membre"),
    }))
    .mutation(async ({ input }) => {
      const confirmation = {
        success: true as const,
        message:
          "Demande enregistrée. Un responsable AJIHAD vous recontactera pour vous " +
          "transmettre de nouveaux identifiants.",
      };

      const db = await getDb();
      if (!db) return confirmation;

      const compte = await db.select({ id: users.id, name: users.name })
        .from(users).where(eq(users.email, input.email)).limit(1);

      // Compte inconnu : on s'arrête ici, sans le dire à l'appelant et sans
      // créer d'alerte — sinon n'importe qui pourrait inonder l'administration.
      if (compte.length === 0) return confirmation;

      const destinataires = await db.select({ id: users.id }).from(users)
        .where(inArray(users.role, ["super_admin", "admin"]));

      const nom = compte[0].name ?? input.email;
      const espace = input.espace === "administration" ? "l'administration" : "l'espace membre";

      for (const d of destinataires) {
        await db.insert(notifications).values({
          destinataireId: d.id,
          titre: "Mot de passe oublié",
          message: `${nom} (${input.email}) ne parvient plus à se connecter à ${espace}.`,
          type: "alerte",
          lien: "/admin/acces",
        });
      }

      return confirmation;
    }),

  deconnexion: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie(COOKIE_SESSION, { ...optionsCookieSession(ctx.req), maxAge: undefined });

    // En préversion, la session administrateur de développement est accordée
    // par le cookie de préversion, pas par le cookie de session. Sans révoquer
    // aussi celui-ci, la déconnexion serait sans effet : le contexte
    // réattribuerait immédiatement l'utilisateur au coup d'après.
    if (verrouActif()) {
      ctx.res.clearCookie(COOKIE_PREVERSION, optionsCookiePreversion(ctx.req));
    }

    // En mode démonstration, marquer la déconnexion : sans base de données, le
    // contexte réattribuerait sinon la session factice à la requête suivante
    // et l'écran de connexion resterait inatteignable.
    if (modeDevAdmin()) {
      ctx.res.cookie(COOKIE_DEV_DECONNECTE, "1", optionsCookieSession(ctx.req));
    }
    return { success: true };
  }),

  changerMotDePasse: protectedProcedure
    .input(z.object({ actuel: z.string().min(1).max(200), nouveau: z.string().min(1).max(200) }))
    .mutation(async ({ input, ctx }) => {
      const probleme = validerMotDePasse(input.nouveau);
      if (probleme) throw new TRPCError({ code: "BAD_REQUEST", message: probleme });

      const db = await getDb();
      if (!db) indisponible();

      const frais = await authentifierRequete(ctx.req);
      const ok = await verifierMotDePasse(input.actuel, frais?.motDePasseHash);
      if (!ok) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Mot de passe actuel incorrect." });
      }

      await db.update(users)
        .set({ motDePasseHash: await hacherMotDePasse(input.nouveau) })
        .where(eq(users.id, ctx.user.id));
      return { success: true };
    }),

  /**
   * Profil du membre lié au compte. Le membre ne peut modifier qu'un
   * sous-ensemble de champs : nom, statut, commission et type restent la
   * prérogative de l'administration.
   */
  monProfil: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    // Sans base, la fiche vient du magasin de démonstration : l'espace membre
    // doit rester exerçable, sinon il s'affiche vide et paraît cassé.
    if (!db) {
      if (!modeDemo()) return null;
      return demo.listerMembres().find(m => m.userId === ctx.user.id) ?? null;
    }
    const lignes = await db.select().from(membres).where(eq(membres.userId, ctx.user.id)).limit(1);
    return lignes[0] ?? null;
  }),

  majMonProfil: protectedProcedure
    .input(
      z.object({
        telephone: z.string().trim().max(30).optional(),
        adresse: z.string().trim().max(500).optional(),
        commune: z.string().trim().max(100).optional(),
        niveauEtude: z.string().trim().max(100).optional(),
        competences: z.string().trim().max(2000).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();

      if (!db && modeDemo()) {
        const fiche = demo.listerMembres().find(m => m.userId === ctx.user.id);
        if (!fiche) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Aucune fiche membre n'est rattachée à votre compte.",
          });
        }
        demo.majMembre(fiche.id, input);
        return { success: true };
      }

      if (!db) indisponible();

      const lignes = await db.select({ id: membres.id }).from(membres)
        .where(eq(membres.userId, ctx.user.id)).limit(1);
      if (lignes.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Aucune fiche membre n'est rattachée à votre compte.",
        });
      }

      // Seuls les champs listés ci-dessus sont acceptés : le schéma d'entrée
      // fait office de liste blanche, un envoi de `statut` serait ignoré.
      await db.update(membres)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(membres.id, lignes[0].id));
      return { success: true };
    }),
});
