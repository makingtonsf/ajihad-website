import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { parse as parseCookieHeader } from "cookie";
import type { CookieOptions, Request } from "express";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { ENV } from "./env";
import { modeDemo, demo } from "./devFixtures";

const scrypt = promisify(scryptCb) as (
  mdp: string | Buffer,
  sel: string | Buffer,
  longueur: number
) => Promise<Buffer>;

export const COOKIE_SESSION = "ajihad_session";
const DUREE_SESSION_MS = 30 * 24 * 60 * 60 * 1000; // 30 jours

// ---------------------------------------------------------------- mots de passe

const LONGUEUR_CLE = 64;
const LONGUEUR_SEL = 16;

/**
 * Hache un mot de passe avec scrypt, la fonction de dérivation intégrée à
 * Node. Volontairement sans dépendance externe (bcrypt, argon2) : scrypt est
 * conçu pour résister au calcul massivement parallèle et suffit ici.
 *
 * Format stocké : scrypt$<sel hex>$<empreinte hex>
 */
export async function hacherMotDePasse(motDePasse: string): Promise<string> {
  const sel = randomBytes(LONGUEUR_SEL);
  const empreinte = await scrypt(motDePasse.normalize("NFKC"), sel, LONGUEUR_CLE);
  return `scrypt$${sel.toString("hex")}$${empreinte.toString("hex")}`;
}

/** Comparaison à temps constant : la durée ne révèle rien sur le mot de passe. */
export async function verifierMotDePasse(
  motDePasse: string,
  stocke: string | null | undefined
): Promise<boolean> {
  if (!stocke) return false;
  const [algo, selHex, empreinteHex] = stocke.split("$");
  if (algo !== "scrypt" || !selHex || !empreinteHex) return false;

  // Buffer.from(x, "hex") ne lève pas sur une entrée invalide : il tronque
  // silencieusement, et "zz" donne un tampon VIDE. Sans les contrôles de
  // longueur ci-dessous, un hachage corrompu produirait une comparaison
  // entre deux tampons vides — donc `true` pour n'importe quel mot de passe.
  const sel = Buffer.from(selHex, "hex");
  const attendu = Buffer.from(empreinteHex, "hex");
  if (sel.length !== LONGUEUR_SEL || attendu.length !== LONGUEUR_CLE) return false;

  try {
    const calcule = await scrypt(motDePasse.normalize("NFKC"), sel, LONGUEUR_CLE);
    return timingSafeEqual(calcule, attendu);
  } catch {
    return false;
  }
}

/**
 * Règles minimales. Volontairement sobres : imposer des symboles pousse aux
 * mots de passe notés sur un papier. La longueur est le facteur dominant.
 */
export function validerMotDePasse(motDePasse: string): string | null {
  if (motDePasse.length < 10) return "Le mot de passe doit contenir au moins 10 caractères.";
  if (motDePasse.length > 200) return "Le mot de passe est trop long.";
  if (!/[a-zA-Z]/.test(motDePasse)) return "Le mot de passe doit contenir au moins une lettre.";
  if (!/[0-9]/.test(motDePasse)) return "Le mot de passe doit contenir au moins un chiffre.";
  return null;
}

// ---------------------------------------------------------------- sessions

function cleSession(): Uint8Array {
  const secret = ENV.cookieSecret;
  if (!secret || secret.length < 16) {
    throw new Error(
      "JWT_SECRET absent ou trop court. Définissez-le (32 caractères aléatoires minimum) avant de démarrer."
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signerSession(userId: number): Promise<string> {
  return new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(Math.floor((Date.now() + DUREE_SESSION_MS) / 1000))
    .sign(cleSession());
}

export async function verifierSession(jeton: string | undefined): Promise<number | null> {
  if (!jeton) return null;
  try {
    const { payload } = await jwtVerify(jeton, cleSession(), { algorithms: ["HS256"] });
    const uid = (payload as Record<string, unknown>).uid;
    return typeof uid === "number" ? uid : null;
  } catch {
    return null;
  }
}

/**
 * Cookie de session. `sameSite: lax` convient à un site premier plan : le
 * cookie accompagne la navigation normale mais pas les requêtes tierces.
 * `secure` suit le protocole réel, pour que le développement en http marche.
 */
export function optionsCookieSession(req: Request): CookieOptions {
  const viaProxyHttps = String(req.headers["x-forwarded-proto"] ?? "")
    .split(",")
    .some(p => p.trim().toLowerCase() === "https");

  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: req.protocol === "https" || viaProxyHttps,
    maxAge: DUREE_SESSION_MS,
  };
}

// ---------------------------------------------------------------- requêtes

/** Utilisateur authentifié pour une requête, ou null. Ne lève jamais. */
export async function authentifierRequete(req: Request): Promise<User | null> {
  const cookies = parseCookieHeader(req.headers.cookie ?? "");
  const userId = await verifierSession(cookies[COOKIE_SESSION]);
  if (userId === null) return null;

  const db = await getDb();

  // Sans base, on résout la session dans le magasin de démonstration : la
  // session est signée et vérifiée par le même code, seul le stockage diffère.
  if (!db) {
    if (!modeDemo()) return null;
    const compte = demo.compteParId(userId);
    if (!compte) return null;
    return {
      id: compte.id,
      openId: compte.openId,
      name: compte.name,
      email: compte.email,
      loginMethod: "mot_de_passe",
      motDePasseHash: compte.motDePasseHash,
      jetonAcces: null,
      jetonExpiration: null,
      echecsConnexion: 0,
      bloqueJusqua: null,
      role: compte.role as User["role"],
      createdAt: compte.createdAt,
      updatedAt: compte.createdAt,
      lastSignedIn: compte.lastSignedIn,
    };
  }

  const lignes = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return lignes[0] ?? null;
}

/** Identifiant public stable, utilisé notamment par le QR de la carte membre. */
export function genererOpenId(): string {
  return randomBytes(16).toString("base64url");
}
