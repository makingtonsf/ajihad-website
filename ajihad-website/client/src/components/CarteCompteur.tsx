import type { LucideIcon } from "lucide-react";

/**
 * Compteur d'un tableau de bord.
 *
 * Mesuré avant : la version empilée (icône, puis nombre, puis libellé, le tout
 * en `p-5`) occupait 143 px de hauteur pour afficher un seul chiffre. Sur les
 * écrans qui en alignent quatre, cela repoussait les données d'autant.
 *
 * En plaçant l'icône à côté du nombre plutôt qu'au-dessus, le même contenu
 * tient en ~76 px, sans rien retirer. La lecture y gagne aussi : le chiffre et
 * son libellé forment un bloc, au lieu d'être séparés par l'icône.
 *
 * Rendu comme un `<button>` si `onClick` est fourni — les compteurs servent
 * souvent de filtres — et comme un `<div>` sinon, pour ne pas annoncer aux
 * lecteurs d'écran un bouton qui ne fait rien.
 */
export default function CarteCompteur({
  icone: Icone,
  couleur,
  valeur,
  libelle,
  actif = false,
  onClick,
}: {
  icone: LucideIcon;
  couleur: string;
  valeur: number | string;
  libelle: string;
  actif?: boolean;
  onClick?: () => void;
}) {
  const classes = [
    // gap et icône resserrés sous 640px : à deux colonnes sur mobile, « Ambassadeurs »
    // dépassait de 3 px et se faisait tronquer.
    "flex items-center gap-2.5 sm:gap-3 text-left w-full bg-white dark:bg-gray-800 rounded-xl p-4 border shadow-sm transition-all",
    onClick ? "hover:border-[#185FA5]/40" : "",
    actif
      ? "border-[#185FA5] ring-2 ring-[#185FA5]/20"
      : "border-gray-100 dark:border-gray-700",
  ]
    .filter(Boolean)
    .join(" ");

  const contenu = (
    <>
      <div
        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${couleur}1a` }}
        aria-hidden="true"
      >
        <Icone className="w-4 h-4" style={{ color: couleur }} />
      </div>
      <div className="min-w-0">
        <div className="text-xl font-bold text-gray-900 dark:text-white leading-none">
          {valeur}
        </div>
        <div className="text-gray-500 dark:text-gray-400 text-xs mt-1 truncate">
          {libelle}
        </div>
      </div>
    </>
  );

  if (!onClick) return <div className={classes}>{contenu}</div>;

  return (
    <button type="button" onClick={onClick} aria-pressed={actif} className={classes}>
      {contenu}
    </button>
  );
}
