import { createHash, timingSafeEqual } from "crypto";
import { parse as parseCookies } from "cookie";
import type { CookieOptions, Request, Response, NextFunction, Express } from "express";

/**
 * Verrou par mot de passe pour les préversions exposées via un tunnel public.
 *
 * Le site public reste librement accessible. Seules les zones sensibles
 * exigent le mot de passe :
 *   - les pages /admin et /espace-membre ;
 *   - les procédures tRPC admin.* et membre.*, sinon l'API livrerait les
 *     données que les pages protègent.
 *
 * L'authentification passe par un formulaire, pas par HTTP Basic : les
 * navigateurs conservent les identifiants Basic pour toute la session et les
 * rejouent automatiquement, ce qui rendait toute déconnexion illusoire.
 * Avec un cookie, la déconnexion révoque réellement l'accès.
 *
 * Actif seulement hors production ET si PREVIEW_PASSWORD est défini.
 */

export const COOKIE_PREVERSION = "preview_ok";
const CHEMIN_CONNEXION = "/preversion/connexion";

function motDePasseAttendu(): string | undefined {
  if (process.env.NODE_ENV === "production") return undefined;
  return process.env.PREVIEW_PASSWORD || undefined;
}

export function verrouActif(): boolean {
  return Boolean(motDePasseAttendu());
}

/** Empreinte du mot de passe : le cookie ne contient jamais le secret. */
function empreinte(mdp: string): string {
  return createHash("sha256").update(`preversion:${mdp}`).digest("hex").slice(0, 32);
}

function egal(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export function optionsCookiePreversion(req: Request): CookieOptions {
  const viaProxyHttps = String(req.headers["x-forwarded-proto"] ?? "")
    .split(",")
    .some(p => p.trim().toLowerCase() === "https");
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: req.protocol === "https" || viaProxyHttps,
  };
}

/** Zones exigeant le mot de passe. Tout le reste du site est ouvert. */
export function cheminProtege(chemin: string): boolean {
  if (/^\/admin(\/|$)/.test(chemin)) return true;
  if (/^\/espace-membre(\/|$)/.test(chemin)) return true;

  const prefixe = "/api/trpc/";
  if (chemin.startsWith(prefixe)) {
    let procedures: string;
    try {
      procedures = decodeURIComponent(chemin.slice(prefixe.length));
    } catch {
      procedures = chemin.slice(prefixe.length);
    }
    return procedures.split(",").some(p => /^(admin|membre)\./.test(p.trim()));
  }
  return false;
}

/**
 * La requête porte-t-elle une autorisation de préversion valide ?
 * Renvoie true si aucun verrou n'est configuré.
 *
 * L'en-tête Basic reste accepté pour les appels scriptés (curl, tests), mais
 * n'est jamais réclamé au navigateur : sans en-tête `WWW-Authenticate`, aucun
 * navigateur ne met d'identifiants en cache ni ne les rejoue.
 */
export function requeteAutorisee(req: Request): boolean {
  const attendu = motDePasseAttendu();
  if (!attendu) return true;

  const jeton = parseCookies(req.headers.cookie ?? "")[COOKIE_PREVERSION];
  if (jeton && egal(jeton, empreinte(attendu))) return true;

  const [schema, encode] = (req.headers.authorization ?? "").split(" ");
  if (schema === "Basic" && encode) {
    const decode = Buffer.from(encode, "base64").toString();
    if (egal(decode.slice(decode.indexOf(":") + 1), attendu)) return true;
  }
  return false;
}

function pageMotDePasse(destination: string, erreur = false): string {
  const dest = destination.replace(/"/g, "&quot;");
  return `<!doctype html>
<html lang="fr"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>Zone protégée — AJIHAD</title>
<style>
  *{box-sizing:border-box;margin:0}
  body{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;
       font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#F6F8FB;color:#111827}
  form{background:#fff;padding:32px;border-radius:16px;box-shadow:0 10px 40px rgba(4,44,83,.12);
       width:100%;max-width:380px}
  .marque{font-weight:800;color:#185FA5;letter-spacing:2px;font-size:20px}
  h1{font-size:18px;margin:16px 0 6px}
  p{color:#6b7280;font-size:14px;line-height:1.5;margin-bottom:20px}
  label{display:block;font-size:13px;font-weight:600;margin-bottom:6px}
  input{width:100%;padding:12px 14px;border:1px solid #e5e7eb;border-radius:10px;font-size:15px}
  input:focus{outline:none;border-color:#185FA5;box-shadow:0 0 0 3px rgba(24,95,165,.15)}
  button{width:100%;margin-top:16px;padding:12px;background:#185FA5;color:#fff;border:0;
         border-radius:10px;font-size:15px;font-weight:600;cursor:pointer}
  button:hover{background:#042C53}
  .err{background:#fef2f2;color:#991b1b;padding:10px 12px;border-radius:8px;font-size:13px;margin-bottom:16px}
  a{display:block;margin-top:18px;text-align:center;color:#6b7280;font-size:13px;text-decoration:none}
</style></head>
<body>
  <form method="POST" action="${CHEMIN_CONNEXION}">
    <div class="marque">AJIHAD</div>
    <h1>Zone protégée</h1>
    <p>Cet espace n'est pas public. Saisissez le mot de passe de préversion pour continuer.</p>
    ${erreur ? '<div class="err">Mot de passe incorrect.</div>' : ""}
    <input type="hidden" name="destination" value="${dest}" />
    <label for="mdp">Mot de passe</label>
    <input id="mdp" name="motDePasse" type="password" autofocus autocomplete="current-password" required />
    <button type="submit">Entrer</button>
    <a href="/">← Retour au site public</a>
  </form>
</body></html>`;
}

/** Empêche une redirection ouverte : seules les destinations internes passent. */
function destinationSure(valeur: unknown): string {
  const s = typeof valeur === "string" ? valeur : "";
  if (!s.startsWith("/") || s.startsWith("//")) return "/admin";
  return s;
}

export function protegerPreversion(app: Express) {
  const attendu = motDePasseAttendu();
  if (!attendu) return;

  // Traitement du formulaire. Enregistré avant le middleware de garde pour
  // rester joignable sans autorisation.
  app.post(CHEMIN_CONNEXION, (req: Request, res: Response) => {
    const fourni = String((req.body as any)?.motDePasse ?? "");
    const destination = destinationSure((req.body as any)?.destination);

    if (!egal(fourni, attendu)) {
      res.status(401).type("html").send(pageMotDePasse(destination, true));
      return;
    }
    res.cookie(COOKIE_PREVERSION, empreinte(attendu), optionsCookiePreversion(req));
    res.redirect(302, destination);
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path === CHEMIN_CONNEXION) return next();
    if (!cheminProtege(req.path)) return next();
    if (requeteAutorisee(req)) return next();

    // Une requête d'API reçoit un 401 franc ; une navigation reçoit le
    // formulaire. Aucun en-tête WWW-Authenticate : pas de mise en cache par
    // le navigateur, donc une déconnexion reste effective.
    if (req.path.startsWith("/api/")) {
      res.status(401).json({ error: "Zone protégée. Authentification requise." });
      return;
    }
    res.status(401).type("html").send(pageMotDePasse(req.originalUrl));
  });

  console.log("[Preversion] Verrou actif sur /admin, /espace-membre et l'API admin.");
}
