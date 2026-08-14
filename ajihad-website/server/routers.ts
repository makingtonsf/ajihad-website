import { z } from "zod";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { publicRouter } from "./routers/public";
import { formsRouter } from "./routers/forms";
import { adminRouter } from "./routers/admin";
import { authRouter } from "./routers/auth";
import { getDb } from "./db";
import { membres, documents, notifications, users } from "../drizzle/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { modeDemo, demo } from "./_core/devFixtures";

export const appRouter = router({
  system: systemRouter,
  public: publicRouter,
  forms: formsRouter,
  admin: adminRouter,
  membre: router({
    monStatut: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) {
        return modeDemo()
          ? demo.listerMembres().find(m => m.userId === ctx.user.id) ?? null
          : null;
      }
      const result = await db.select().from(membres).where(eq(membres.userId, ctx.user.id)).limit(1);
      return result.length > 0 ? result[0] : null;
    }),

    // Documents publics + documents réservés aux membres
    mesDocuments: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      // Sans base : documents de démonstration visibles au public ou aux membres.
      if (!db) {
        return modeDemo()
          ? demo.table("documents").lister().filter((d: any) =>
              d.statut === "valide" && ["public", "membres"].includes(d.visibilite))
          : [];
      }
      return db.select().from(documents)
        .where(and(
          eq(documents.statut, "valide"),
          inArray(documents.visibilite, ["public", "membres"]),
        ))
        .orderBy(desc(documents.dateDocument), desc(documents.createdAt));
    }),

    mesNotifications: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return modeDemo() ? demo.listerNotifications(ctx.user.id) : [];
      return db.select().from(notifications)
        .where(eq(notifications.destinataireId, ctx.user.id))
        .orderBy(desc(notifications.createdAt))
        .limit(50);
    }),

    marquerNotificationLue: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) {
          if (!modeDemo()) throw new Error("Service temporairement indisponible");
          demo.marquerNotificationLue(input.id, ctx.user.id);
          return { success: true };
        }
        // La condition sur destinataireId garantit qu'un membre ne peut marquer
        // que ses propres notifications.
        await db.update(notifications)
          .set({ estLu: true })
          .where(and(
            eq(notifications.id, input.id),
            eq(notifications.destinataireId, ctx.user.id),
          ));
        return { success: true };
      }),
  }),

  // Vérification publique d'une carte de membre (scan QR)
  verifierMembre: publicProcedure
    .input(z.object({ openId: z.string().min(1).max(64), num: z.string().min(1).max(40) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { valide: false as const };

      const found = await db.select({
        id: users.id,
        name: users.name,
        createdAt: users.createdAt,
      }).from(users).where(eq(users.openId, input.openId)).limit(1);

      const compte = found[0];
      if (!compte) return { valide: false as const };

      const numeroAttendu = `AJIHAD-${String(compte.id).padStart(5, "0")}`;
      if (numeroAttendu !== input.num.trim().toUpperCase()) return { valide: false as const };

      const fiche = await db.select({
        statut: membres.statut,
        dateAdhesion: membres.dateAdhesion,
        typeMembre: membres.typeMembre,
      }).from(membres).where(eq(membres.userId, compte.id)).limit(1);

      return {
        valide: true as const,
        nom: compte.name ?? "Membre AJIHAD",
        numero: numeroAttendu,
        statut: fiche[0]?.statut ?? "en_attente",
        typeMembre: fiche[0]?.typeMembre ?? "membre",
        dateAdhesion: (fiche[0]?.dateAdhesion ?? compte.createdAt) as Date | null,
      };
    }),

  auth: authRouter,
});

export type AppRouter = typeof appRouter;
