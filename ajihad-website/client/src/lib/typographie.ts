/**
 * Échelle typographique de l'administration.
 *
 * Constat avant cette échelle : les 17 écrans utilisaient trois tailles pour un
 * même niveau de titre — 5 `h2` en `text-lg`, 6 en `text-sm`, et 9 sans aucune
 * classe de taille, qui héritaient donc silencieusement de leur parent. Deux
 * cartes voisines pouvaient avoir des titres de tailles différentes.
 *
 * Quatre niveaux suffisent, et chacun correspond à un rôle précis :
 *
 *   TITRE_PAGE     24px  — un seul par écran, en haut
 *   TITRE_MODALE   18px  — titre d'une fenêtre ou d'un panneau latéral
 *   TITRE_SECTION  16px  — regroupement au sein d'un écran
 *   TITRE_CARTE    14px  — en-tête d'une carte ou d'une ligne de liste
 *
 * Le niveau HTML (`h1`, `h2`, `h3`) reste choisi selon la structure du document,
 * pour les lecteurs d'écran ; ces constantes ne décident que de l'apparence.
 * Les deux ne coïncident pas toujours, et c'est normal.
 */

const ENCRE = "text-gray-900 dark:text-white";

export const TITRE_PAGE = `text-2xl font-bold ${ENCRE}`;
export const TITRE_MODALE = `text-lg font-bold ${ENCRE}`;
export const TITRE_SECTION = `text-base font-semibold ${ENCRE}`;
export const TITRE_CARTE = `text-sm font-semibold ${ENCRE}`;

/** Étiquette au-dessus d'un groupe de champs ou d'une colonne de tableau. */
export const SURTITRE =
  "text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400";

/** Texte d'accompagnement sous un titre. */
export const SOUS_TEXTE = "text-sm text-gray-500 dark:text-gray-400";
