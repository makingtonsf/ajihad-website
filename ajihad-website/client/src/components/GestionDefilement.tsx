import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

/**
 * Remet le défilement en haut à chaque changement de page.
 *
 * Sans cela, une application à page unique conserve la position d'une page à
 * l'autre : en cliquant un lien depuis le bas d'une page longue, on atterrit
 * au milieu — ou plus bas encore — de la suivante, titre hors écran. Mesuré
 * sur ce site : clic à 4021 px sur l'accueil, arrivée à 5241 px sur
 * « Nos actions ».
 *
 * Trois comportements distincts :
 *   - lien normal      → on remonte en haut ;
 *   - ancre (#section) → on va à l'élément visé ;
 *   - retour arrière   → on restaure la position quittée, ce qu'attend un
 *                        visiteur qui revient d'un article vers une liste.
 *
 * Pourquoi estampiller l'historique plutôt qu'écouter `popstate` :
 * wouter s'abonne à l'historique en phase de layout, donc son gestionnaire est
 * enregistré avant tout écouteur posé dans un `useEffect`. Il déclenche un
 * rendu synchrone qui vide les effets AVANT que notre écouteur ne soit appelé —
 * vérifié par instrumentation : au moment où l'effet de route s'exécutait, le
 * `popstate` n'était pas encore survenu. Un drapeau posé par un écouteur arrive
 * donc systématiquement trop tard. L'index stocké dans `history.state`, lui, est
 * déjà à jour quand l'effet lit l'état : il ne dépend d'aucun ordre d'exécution.
 */

const CLE_INDEX = "__ajihadIdx";

/** Index de l'entrée d'historique courante. */
function indexCourant(): number {
  const etat = history.state as Record<string, unknown> | null;
  const valeur = etat?.[CLE_INDEX];
  return typeof valeur === "number" ? valeur : 0;
}

/**
 * Fait porter un index croissant à chaque nouvelle entrée d'historique.
 * Sans cela, toutes les entrées sont indiscernables et l'on ne peut pas dire
 * si l'on avance ou si l'on recule.
 */
function estampillerHistorique(): void {
  const h = history as History & { [k: string]: unknown };
  if (h.__ajihadEstampille) return;
  h.__ajihadEstampille = true;

  const pushOrigine = history.pushState.bind(history);
  history.pushState = function (etat: unknown, titre: string, url?: string | URL | null) {
    const suivant = indexCourant() + 1;
    pushOrigine({ ...(etat as object | null), [CLE_INDEX]: suivant }, titre, url ?? null);
  } as typeof history.pushState;

  const replaceOrigine = history.replaceState.bind(history);
  history.replaceState = function (etat: unknown, titre: string, url?: string | URL | null) {
    // Un remplacement reste sur la même entrée : l'index ne bouge pas.
    replaceOrigine({ ...(etat as object | null), [CLE_INDEX]: indexCourant() }, titre, url ?? null);
  } as typeof history.replaceState;

  // L'entrée d'arrivée n'a pas encore d'index : on le lui pose.
  if (typeof (history.state as Record<string, unknown> | null)?.[CLE_INDEX] !== "number") {
    replaceOrigine({ ...(history.state as object | null), [CLE_INDEX]: 0 }, "", location.href);
  }
}

// Positions mémorisées par entrée d'historique. Hors du composant : elles
// doivent survivre à ses remontages. Indexées par position dans la pile, pas
// par chemin — un même chemin peut occuper plusieurs entrées.
const positions = new Map<number, number>();

export default function GestionDefilement() {
  const [location] = useLocation();
  const indexPrecedent = useRef<number | null>(null);

  useEffect(() => {
    estampillerHistorique();
    // On reprend la main, sinon le navigateur restaure sa propre position et
    // entre en conflit avec la restauration ci-dessous.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (indexPrecedent.current === null) indexPrecedent.current = indexCourant();
  }, []);

  useEffect(() => {
    const index = indexCourant();
    const precedent = indexPrecedent.current;
    indexPrecedent.current = index;

    // Un index qui décroît signifie que l'on revient en arrière.
    const enArriere = precedent !== null && index < precedent;

    if (enArriere && positions.has(index)) {
      const cible = positions.get(index) ?? 0;

      // Restaurer en une seule frame ne suffit pas : au retour, le document
      // est d'abord court, et un scrollTo prématuré est écrêté à la hauteur
      // du moment. Mesuré : avec 20 frames (~330 ms), la restauration tombait
      // à 0 puis à 2697 px au lieu de 3000 — la liste attendait ses données.
      //
      // On réessaie donc sur une fenêtre de temps, pas sur un nombre de
      // frames, et l'on s'arrête dès que la position est atteinte.
      const echeance = performance.now() + 1500;
      let annule = false;

      // Si le visiteur reprend la main pendant ce temps, on lui laisse : rien
      // n'est plus déroutant qu'une page qui se repositionne sous les doigts.
      const abandonner = () => { annule = true; };
      const evenements = ["wheel", "touchstart", "keydown", "pointerdown"] as const;
      evenements.forEach(e => window.addEventListener(e, abandonner, { passive: true, once: true }));

      const restaurer = () => {
        if (annule) return terminer();
        window.scrollTo({ top: cible, behavior: "instant" });
        if (Math.abs(window.scrollY - cible) <= 2 || performance.now() > echeance) return terminer();
        requestAnimationFrame(restaurer);
      };
      const terminer = () => {
        evenements.forEach(e => window.removeEventListener(e, abandonner));
      };
      requestAnimationFrame(restaurer);
    } else {
      const ancre = window.location.hash.slice(1);
      if (ancre) {
        // Les pages publiques sont chargées en lazy et certaines sections
        // arrivent après le premier rendu. Un scroll unique passait donc
        // parfois à côté de #histoire, #membre ou #ethique. On attend la
        // section puis on compense la hauteur de l'en-tête fixe.
        const echeance = performance.now() + 1800;
        let annule = false;
        let animation = 0;

        const alignerAncre = () => {
          if (annule) return;
          const cible = document.getElementById(ancre);
          if (cible) {
            const hauteurEntete = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
            const marge = 16;
            const position = cible.getBoundingClientRect().top + window.scrollY - hauteurEntete - marge;
            window.scrollTo({ top: Math.max(0, position), left: 0, behavior: "instant" });
            return;
          }
          if (performance.now() < echeance) animation = requestAnimationFrame(alignerAncre);
        };

        animation = requestAnimationFrame(alignerAncre);
        return () => {
          annule = true;
          cancelAnimationFrame(animation);
          positions.set(index, window.scrollY);
        };
      } else {
        // `behavior: "instant"` est indispensable : `html { scroll-behavior:
        // smooth }` transformerait sinon chaque navigation en une remontée
        // animée de plusieurs milliers de pixels.
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
    }

    // En quittant cette entrée, on note où le visiteur en était.
    return () => {
      positions.set(index, window.scrollY);
    };
  }, [location]);

  return null;
}
