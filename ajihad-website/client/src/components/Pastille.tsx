import type { ReactNode } from "react";

/**
 * Pastille d'état — brique unique du site.
 *
 * Le projet comptait 84 pastilles écrites à la main dans 22 fichiers, chacune
 * avec ses propres couleurs : deux écrans affichaient le même statut dans deux
 * teintes différentes. Tout passe désormais par ce composant.
 *
 * Trois règles de conception :
 *   - la couleur ne porte jamais l'information seule, le libellé est toujours
 *     écrit en clair — un daltonien lit le même contenu ;
 *   - chaque ton est décliné explicitement en clair et en sombre, ce n'est pas
 *     une inversion mécanique ;
 *   - les contrastes texte/fond respectent le seuil AA à cette taille.
 */

export type TonPastille =
  | "neutre"
  | "info"
  | "succes"
  | "attention"
  | "danger"
  | "accent"
  | "violet"
  | "orange";

const TONS: Record<TonPastille, string> = {
  neutre:
    "bg-gray-100 text-gray-700 ring-gray-200 dark:bg-gray-700/60 dark:text-gray-200 dark:ring-gray-600",
  info:
    "bg-blue-50 text-blue-800 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-800",
  succes:
    "bg-green-50 text-green-800 ring-green-200 dark:bg-green-900/30 dark:text-green-200 dark:ring-green-800",
  attention:
    "bg-amber-50 text-amber-900 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-800",
  danger:
    "bg-red-50 text-red-800 ring-red-200 dark:bg-red-900/30 dark:text-red-200 dark:ring-red-800",
  accent:
    "bg-teal-50 text-teal-800 ring-teal-200 dark:bg-teal-900/30 dark:text-teal-200 dark:ring-teal-800",
  violet:
    "bg-violet-50 text-violet-800 ring-violet-200 dark:bg-violet-900/30 dark:text-violet-200 dark:ring-violet-800",
  orange:
    "bg-orange-50 text-orange-900 ring-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:ring-orange-800",
};

const TAILLES = {
  sm: "text-[11px] px-2 py-0.5",
  md: "text-xs px-2.5 py-1",
};

/**
 * Classes d'un ton, sans l'enveloppe `<span>`.
 *
 * Nécessaire pour les `<select>` d'édition en ligne, qui doivent porter la
 * teinte du statut sans pouvoir être un `Pastille`. Passer par cette fonction
 * plutôt que par des classes recopiées garde une seule source de vérité.
 */
export function classesTon(ton: TonPastille): string {
  return TONS[ton];
}

export default function Pastille({
  children,
  ton = "neutre",
  taille = "md",
  className = "",
}: {
  children: ReactNode;
  ton?: TonPastille;
  taille?: keyof typeof TAILLES;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset whitespace-nowrap ${TONS[ton]} ${TAILLES[taille]} ${className}`}
    >
      {children}
    </span>
  );
}

/**
 * Correspondance statut → ton, définie une seule fois.
 *
 * Chaque écran d'administration redéfinissait sa propre table de couleurs.
 * Un même statut pouvait donc apparaître bleu ici et gris là. Cette fonction
 * couvre les statuts des membres, candidatures, contributions, documents,
 * projets, actualités et partenariats.
 */
export function tonDuStatut(statut: string | null | undefined): TonPastille {
  switch (statut) {
    // en cours de traitement
    case "nouveau":
    case "recue":
    case "declaree":
    case "en_attente":
    case "brouillon":
      return "attention";

    // avancement intermédiaire
    case "en_traitement":
    case "en_verification":
    case "en_analyse":
    case "en_revision":
    case "en_negociation":
    case "en_preparation":
    case "a_verifier":
    case "en_attente_verification":
      return "info";

    // aboutissement favorable
    case "actif":
    case "approuve":
    case "approuvee":
    case "acceptee":
    case "confirmee":
    case "traite":
    case "publie":
    case "valide":
    case "termine":
      return "succes";

    // état vérifié mais non final
    case "verifie":
    case "en_cours":
    case "invitation_envoyee":
    case "recue_nature":
      return "accent";

    // refus ou annulation
    case "refuse":
    case "refusee":
    case "annulee":
      return "danger";

    // sorti du flux
    case "inactif":
    case "archive":
    case "remboursee":
      return "neutre";

    default:
      return "neutre";
  }
}

/** Libellés lisibles des statuts, également centralisés. */
export const LIBELLES_STATUT: Record<string, string> = {
  nouveau: "Nouveau",
  recue: "Reçue",
  declaree: "Déclarée",
  en_attente: "En attente",
  en_traitement: "En traitement",
  en_verification: "En vérification",
  en_analyse: "En analyse",
  en_revision: "En révision",
  en_negociation: "En négociation",
  en_preparation: "En préparation",
  en_attente_verification: "En vérification",
  a_verifier: "À vérifier",
  verifie: "Vérifié",
  approuve: "Approuvé",
  approuvee: "Approuvée",
  acceptee: "Acceptée",
  confirmee: "Confirmée",
  traite: "Traité",
  publie: "Publié",
  valide: "Validé",
  actif: "Actif",
  en_cours: "En cours",
  termine: "Terminé",
  invitation_envoyee: "Invitation envoyée",
  recue_nature: "Reçue en nature",
  refuse: "Refusé",
  refusee: "Refusée",
  annulee: "Annulée",
  inactif: "Inactif",
  archive: "Archivé",
  remboursee: "Remboursée",
  brouillon: "Brouillon",
};

export function libelleStatut(statut: string | null | undefined): string {
  if (!statut) return "—";
  return LIBELLES_STATUT[statut] ?? statut.replace(/_/g, " ");
}

/**
 * Correspondance catégorie → ton.
 *
 * Une catégorie (Bénévole, Bailleur, Diaspora…) n'est pas un statut : elle ne
 * porte aucun jugement. La couleur sert uniquement à distinguer, jamais à
 * dire « bien » ou « mal » — d'où l'absence de rouge et de vert ici, sauf
 * pour les niveaux de visibilité, où la restriction d'accès est justement
 * l'information à signaler.
 */
const TONS_CATEGORIE: Record<string, TonPastille> = {
  // Types de personne
  membre: "info",
  benevole: "accent",
  ambassadeur: "orange",
  projefa: "violet",

  // Types de partenaire
  bailleur: "violet",
  technique: "info",
  institutionnel: "accent",
  local: "succes",
  diaspora: "orange",
  entreprise: "neutre",

  // Niveaux de visibilité d'un document : du plus ouvert au plus restreint
  public: "succes",
  membres: "info",
  gestionnaires: "attention",
  admin: "danger",
};

export function tonDeCategorie(valeur: string | null | undefined): TonPastille {
  if (!valeur) return "neutre";
  return TONS_CATEGORIE[valeur] ?? "neutre";
}
