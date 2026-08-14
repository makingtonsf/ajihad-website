import type { Request, Response, NextFunction } from "express";

/**
 * Détection des domaines éphémères (tunnels de test, préversions, local).
 *
 * Pourquoi : lors d'une mise en ligne temporaire via tunnel, le site répondait
 * avec `robots: index, follow` et publiait un sitemap listant l'URL du tunnel.
 * Un moteur qui passe pendant ces quelques jours indexe des adresses qui
 * mourront avec le tunnel — liens morts, puis contenu dupliqué en concurrence
 * du vrai domaine le jour de la mise en production.
 *
 * Le garde repose sur le nom d'hôte de la requête, jamais sur un interrupteur
 * manuel : un interrupteur s'oublie, un nom d'hôte non.
 */

const HOTES_EPHEMERES = [
  /\.trycloudflare\.com$/i,
  /\.ngrok(-free)?\.(io|app|dev)$/i,
  /\.loca\.lt$/i,
  /\.serveo\.net$/i,
  /\.localhost\.run$/i,
  /^localhost(:\d+)?$/i,
  /^127\.0\.0\.1(:\d+)?$/,
  /^\[?::1\]?(:\d+)?$/,
  /^192\.168\./,
  /^10\./,
];

/** Vrai si l'hôte n'est pas le domaine définitif du site. */
export function estDomaineEphemere(hote: string | undefined): boolean {
  if (!hote) return true; // sans hôte lisible, on choisit la prudence
  // Un SITE_URL explicite désigne le domaine de production : s'il correspond,
  // l'hôte est définitif quoi qu'en disent les motifs ci-dessus.
  const officiel = process.env.SITE_URL || process.env.VITE_SITE_URL;
  if (officiel) {
    try {
      if (new URL(officiel).host.toLowerCase() === hote.toLowerCase()) return false;
    } catch {
      // SITE_URL malformée : on ignore et on retombe sur les motifs.
    }
  }
  return HOTES_EPHEMERES.some(motif => motif.test(hote));
}

/**
 * Ajoute `X-Robots-Tag: noindex, nofollow` sur les domaines éphémères.
 *
 * L'en-tête HTTP est utilisé plutôt que la seule balise `<meta>` : la balise
 * est posée par JavaScript après le rendu, alors que l'en-tête est lu par tous
 * les robots, y compris ceux qui n'exécutent pas de script.
 */
export function bloquerIndexationEphemere(req: Request, res: Response, next: NextFunction): void {
  if (estDomaineEphemere(req.get("host"))) {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
  }
  next();
}
