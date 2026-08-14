import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description: string;
  ogImage?: string;
  ogType?: "website" | "article";
  canonical?: string;
  noIndex?: boolean;
}

/** Crée ou met à jour une balise <meta> identifiée par `name` ou `property`. */
function setMeta(attr: "name" | "property", key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}

function setCanonical(href: string) {
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}

/**
 * Met à jour le titre et les balises meta / Open Graph de la page courante.
 * Ne rend aucun élément : le composant agit uniquement sur <head>.
 */
export function SEOHead({
  title,
  description,
  ogImage,
  ogType = "website",
  canonical,
  noIndex = false,
}: SEOHeadProps) {
  useEffect(() => {
    const titreComplet = `${title} | AJIHAD`;
    const url = canonical ?? (typeof window !== "undefined" ? window.location.href.split("#")[0] : "");

    document.title = titreComplet;

    setMeta("name", "description", description);
    setMeta("name", "robots", noIndex ? "noindex, nofollow" : "index, follow");

    setMeta("property", "og:title", titreComplet);
    setMeta("property", "og:description", description);
    setMeta("property", "og:type", ogType);
    setMeta("property", "og:site_name", "AJIHAD");
    if (url) setMeta("property", "og:url", url);
    if (ogImage) setMeta("property", "og:image", ogImage);

    setMeta("name", "twitter:card", ogImage ? "summary_large_image" : "summary");
    setMeta("name", "twitter:title", titreComplet);
    setMeta("name", "twitter:description", description);
    if (ogImage) setMeta("name", "twitter:image", ogImage);

    if (url) setCanonical(url);
  }, [title, description, ogImage, ogType, canonical, noIndex]);

  return null;
}

export default SEOHead;
