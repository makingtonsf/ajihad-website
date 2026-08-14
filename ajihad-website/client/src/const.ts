export { UNAUTHED_ERR_MSG } from "@shared/const";

/** Écrans de connexion du site. L'administration et l'espace membre sont deux portes distinctes. */
export const CONNEXION_MEMBRE = "/connexion";
export const CONNEXION_ADMIN = "/admin/connexion";

/** Pages de connexion : y rediriger depuis elles-mêmes créerait une boucle. */
const PAGES_CONNEXION = [CONNEXION_MEMBRE, CONNEXION_ADMIN];

/**
 * Redirige vers l'écran de connexion correspondant à la zone visitée.
 *
 * Appelée aussi bien par les composants que par le gestionnaire global
 * d'erreurs tRPC. L'aiguillage dépend du chemin courant : une session expirée
 * dans /admin ramène à la connexion d'administration, pas à celle des membres.
 */
export const startLogin = () => {
  if (typeof window === "undefined") return;

  const chemin = window.location.pathname;

  // Déjà sur un écran de connexion : ne rien faire. Sans ce garde, une requête
  // en échec relancerait la redirection en boucle, en empilant les « retour ».
  if (PAGES_CONNEXION.some(p => chemin === p || chemin.startsWith(`${p}?`))) return;

  const destination = chemin.startsWith("/admin") ? CONNEXION_ADMIN : CONNEXION_MEMBRE;
  const retour = encodeURIComponent(chemin + window.location.search);
  window.location.href = `${destination}?retour=${retour}`;
};
