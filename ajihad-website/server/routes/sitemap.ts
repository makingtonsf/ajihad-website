import type { Express, Request } from "express";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "../db";
import { actualites, projets } from "../../drizzle/schema";
import { estDomaineEphemere } from "../_core/domaineEphemere";

const PAGES_STATIQUES: { path: string; priority: string; changefreq: string }[] = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/a-propos", priority: "0.8", changefreq: "monthly" },
  { path: "/nos-actions", priority: "0.9", changefreq: "weekly" },
  { path: "/projefa-2026", priority: "0.9", changefreq: "weekly" },
  { path: "/impact", priority: "0.8", changefreq: "monthly" },
  { path: "/gouvernance", priority: "0.7", changefreq: "monthly" },
  { path: "/actualites", priority: "0.9", changefreq: "daily" },
  { path: "/ressources", priority: "0.7", changefreq: "weekly" },
  { path: "/s-impliquer", priority: "0.8", changefreq: "monthly" },
  { path: "/soutenir", priority: "0.8", changefreq: "monthly" },
  { path: "/contact", priority: "0.6", changefreq: "yearly" },
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function resolveBaseUrl(req: Request): string {
  const configured = process.env.SITE_URL || process.env.VITE_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const protocol = (req.headers["x-forwarded-proto"] as string | undefined)?.split(",")[0] || req.protocol;
  return `${protocol}://${req.get("host")}`;
}

function urlEntry(loc: string, lastmod?: Date | null, changefreq = "monthly", priority = "0.6"): string {
  return [
    "  <url>",
    `    <loc>${escapeXml(loc)}</loc>`,
    lastmod ? `    <lastmod>${new Date(lastmod).toISOString().split("T")[0]}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    "  </url>",
  ].filter(Boolean).join("\n");
}

export function registerSitemapRoute(app: Express): void {
  app.get("/sitemap.xml", async (req, res) => {
    // Pas de sitemap sur un domaine éphémère : rien à faire indexer ici.
    if (estDomaineEphemere(req.get("host"))) {
      res.status(404).type("text/plain").send("Sitemap indisponible sur cette adresse temporaire.");
      return;
    }

    const base = resolveBaseUrl(req);
    const entries: string[] = PAGES_STATIQUES.map(p =>
      urlEntry(`${base}${p.path}`, null, p.changefreq, p.priority)
    );

    try {
      const db = await getDb();
      if (db) {
        const [articles, projetsPublies] = await Promise.all([
          db.select({ slug: actualites.slug, updatedAt: actualites.updatedAt })
            .from(actualites)
            .where(and(eq(actualites.statut, "publie"), eq(actualites.visibilite, "public")))
            .orderBy(desc(actualites.updatedAt)),
          db.select({ slug: projets.slug, updatedAt: projets.updatedAt })
            .from(projets)
            .orderBy(desc(projets.updatedAt)),
        ]);

        for (const a of articles) {
          entries.push(urlEntry(`${base}/actualites/${a.slug}`, a.updatedAt, "weekly", "0.7"));
        }
        for (const p of projetsPublies) {
          entries.push(urlEntry(`${base}/nos-actions/${p.slug}`, p.updatedAt, "monthly", "0.7"));
        }
      }
    } catch (error) {
      // Le sitemap reste servi avec les pages statiques si la base est indisponible.
      console.warn("[Sitemap] Génération des URLs dynamiques impossible:", error);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>
`;

    res.header("Content-Type", "application/xml; charset=utf-8");
    res.send(xml);
  });

  app.get("/robots.txt", (req, res) => {
    res.header("Content-Type", "text/plain; charset=utf-8");

    // Mise en ligne temporaire : on interdit tout, et on ne déclare aucun
    // sitemap — l'annoncer reviendrait à inviter l'indexation d'adresses qui
    // disparaîtront avec le tunnel.
    if (estDomaineEphemere(req.get("host"))) {
      res.send(`User-agent: *\nDisallow: /\n`);
      return;
    }

    const base = resolveBaseUrl(req);
    res.send(`User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${base}/sitemap.xml\n`);
  });
}
