import type { ReactNode } from "react";

interface ArticleContentProps {
  contenu: string;
}

function lienAutorise(url: string) {
  const valeur = url.trim();
  if (/^(https?:\/\/|\/|#)/i.test(valeur)) return valeur;
  return null;
}

function contenuEnLigne(texte: string): ReactNode[] {
  const morceaux = texte.split(
    /(\[[^\]]+\]\([^\)]+\)|\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_)/g
  );

  return morceaux.filter(Boolean).map((morceau, index) => {
    const lien = morceau.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
    if (lien) {
      const href = lienAutorise(lien[2]);
      return href ? (
        <a
          key={index}
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          className="text-[#185FA5] underline hover:text-[#042C53] dark:text-blue-400"
        >
          {lien[1]}
        </a>
      ) : (
        <span key={index}>{morceau}</span>
      );
    }

    if ((morceau.startsWith("**") && morceau.endsWith("**")) || (morceau.startsWith("__") && morceau.endsWith("__"))) {
      return <strong key={index}>{morceau.slice(2, -2)}</strong>;
    }
    if (morceau.startsWith("`") && morceau.endsWith("`")) {
      return <code key={index} className="rounded bg-gray-100 px-1.5 py-0.5 text-[0.9em] dark:bg-gray-800">{morceau.slice(1, -1)}</code>;
    }
    if ((morceau.startsWith("*") && morceau.endsWith("*")) || (morceau.startsWith("_") && morceau.endsWith("_"))) {
      return <em key={index}>{morceau.slice(1, -1)}</em>;
    }
    return <span key={index}>{morceau}</span>;
  });
}

/**
 * Rendu volontairement limité et sans HTML injecté pour les articles AJIHAD.
 * Le formulaire de publication ne nécessite pas Mermaid, KaTeX ni les
 * centaines de langages embarqués par un renderer généraliste.
 */
export default function ArticleContent({ contenu }: ArticleContentProps) {
  const lignes = contenu.replace(/\r\n?/g, "\n").split("\n");
  const blocs: ReactNode[] = [];
  let paragraphe: string[] = [];

  const viderParagraphe = () => {
    if (!paragraphe.length) return;
    blocs.push(
      <p key={`p-${blocs.length}`}>
        {paragraphe.flatMap((ligne, index) => [
          ...(index ? [<br key={`br-${index}`} />] : []),
          ...contenuEnLigne(ligne),
        ])}
      </p>
    );
    paragraphe = [];
  };

  for (let index = 0; index < lignes.length; index += 1) {
    const ligne = lignes[index];
    const titre = ligne.match(/^(#{1,3})\s+(.+)$/);
    const code = ligne.match(/^```(?:[\w-]+)?\s*$/);

    if (code) {
      viderParagraphe();
      const codeLignes: string[] = [];
      index += 1;
      while (index < lignes.length && !/^```\s*$/.test(lignes[index])) {
        codeLignes.push(lignes[index]);
        index += 1;
      }
      blocs.push(
        <pre key={`code-${blocs.length}`} className="overflow-x-auto rounded-xl bg-gray-900 p-4 text-sm text-gray-100">
          <code>{codeLignes.join("\n")}</code>
        </pre>
      );
      continue;
    }

    if (titre) {
      viderParagraphe();
      const Niveau = titre[1].length === 1 ? "h2" : "h3";
      blocs.push(
        <Niveau key={`h-${blocs.length}`} className="font-extrabold text-gray-900 dark:text-white">
          {contenuEnLigne(titre[2])}
        </Niveau>
      );
      continue;
    }

    if (/^\s*[-*]\s+/.test(ligne)) {
      viderParagraphe();
      const elements: string[] = [];
      while (index < lignes.length && /^\s*[-*]\s+/.test(lignes[index])) {
        elements.push(lignes[index].replace(/^\s*[-*]\s+/, ""));
        index += 1;
      }
      index -= 1;
      blocs.push(
        <ul key={`ul-${blocs.length}`} className="list-disc space-y-2 pl-6">
          {elements.map((element, itemIndex) => <li key={itemIndex}>{contenuEnLigne(element)}</li>)}
        </ul>
      );
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(ligne)) {
      viderParagraphe();
      const elements: string[] = [];
      while (index < lignes.length && /^\s*\d+[.)]\s+/.test(lignes[index])) {
        elements.push(lignes[index].replace(/^\s*\d+[.)]\s+/, ""));
        index += 1;
      }
      index -= 1;
      blocs.push(
        <ol key={`ol-${blocs.length}`} className="list-decimal space-y-2 pl-6">
          {elements.map((element, itemIndex) => <li key={itemIndex}>{contenuEnLigne(element)}</li>)}
        </ol>
      );
      continue;
    }

    if (!ligne.trim()) {
      viderParagraphe();
      continue;
    }
    paragraphe.push(ligne);
  }

  viderParagraphe();
  return <div className="space-y-5 leading-relaxed">{blocs}</div>;
}
