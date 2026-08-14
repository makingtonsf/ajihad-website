import { NOT_ADMIN_ERR_MSG, UNAUTHED_ERR_MSG } from '@shared/const';
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

/**
 * Traduit les erreurs de validation Zod en une phrase lisible.
 *
 * Par défaut tRPC renvoie le tableau d'erreurs Zod sérialisé en JSON, que
 * l'interface affichait tel quel : un pavé de `{"code":"invalid_format"...}`
 * incompréhensible pour l'utilisateur. On garde le détail structuré dans
 * `zodError` pour le débogage, mais `message` devient une phrase française.
 */
const LIBELLES_CHAMPS: Record<string, string> = {
  email: "L'adresse e-mail",
  motDePasse: "Le mot de passe",
  nom: "Le nom",
  prenom: "Le prénom",
  titre: "Le titre",
  telephone: "Le téléphone",
};

function messageLisible(erreur: unknown): string | null {
  const issues = (erreur as any)?.issues;
  if (!Array.isArray(issues) || issues.length === 0) return null;

  const phrases = issues.slice(0, 3).map((i: any) => {
    const champ = Array.isArray(i.path) ? String(i.path[i.path.length - 1] ?? "") : "";
    const nom = LIBELLES_CHAMPS[champ] ?? (champ ? `Le champ « ${champ} »` : "Ce champ");

    if (i.code === "invalid_format" && i.format === "email") return `${nom} n'est pas valide.`;
    if (i.code === "too_small") return `${nom} est trop court (${i.minimum} caractères minimum).`;
    if (i.code === "too_big") return `${nom} est trop long (${i.maximum} caractères maximum).`;
    if (i.code === "invalid_type" && i.received === "undefined") return `${nom} est obligatoire.`;
    return `${nom} est invalide.`;
  });

  return Array.from(new Set(phrases)).join(" ");
}

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    const lisible = error.code === "BAD_REQUEST" ? messageLisible(error.cause) : null;
    if (!lisible) return shape;
    return {
      ...shape,
      message: lisible,
      data: { ...shape.data, zodError: (error.cause as any)?.issues ?? null },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

const requireUser = t.middleware(async opts => {
  const { ctx, next } = opts;

  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

export const protectedProcedure = t.procedure.use(requireUser);

export const adminProcedure = t.procedure.use(
  t.middleware(async opts => {
    const { ctx, next } = opts;

    if (!ctx.user || ctx.user.role !== 'admin') {
      throw new TRPCError({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  }),
);
