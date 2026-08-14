import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { authentifierRequete } from "./auth";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

/**
 * Compte d'administration fourni en mode démonstration, quand aucune base
 * n'est branchée. Il se connecte par l'écran normal, avec DEMO_PASSWORD.
 */
export const COMPTE_DEMO = "dev@ajihad.org";
/** Compte super-administrateur réservé aux essais locaux sans base. */
export const COMPTE_SUPER_ADMIN_DEMO = "superadmin@ajihad.org";

/**
 * Ancien marqueur de déconnexion du contournement administrateur.
 * Conservé le temps que les navigateurs déjà passés par l'ancienne version
 * cessent de l'envoyer ; la déconnexion continue de le supprimer.
 */
export const COOKIE_DEV_DECONNECTE = "dev_deconnecte";

/**
 * Le contournement qui accordait automatiquement une session administrateur a
 * été supprimé : le site dispose désormais d'une authentification réelle, avec
 * ses propres écrans de connexion. Cette fonction ne subsiste que pour ne pas
 * disperser des conditions dans les appelants, et renvoie toujours false.
 */
export function modeDevAdmin(): boolean {
  return false;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await authentifierRequete(opts.req);
  } catch (error) {
    // L'authentification est optionnelle : les procédures publiques doivent
    // continuer de répondre même si la session est invalide.
    console.warn("[Auth] Échec de lecture de session :", String(error));
    user = null;
  }

  return { req: opts.req, res: opts.res, user };
}
