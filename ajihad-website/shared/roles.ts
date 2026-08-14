/**
 * Rôles et droits d'accès — source unique de vérité.
 *
 * Ces listes étaient auparavant recopiées à quatre endroits (garde du serveur,
 * AdminLayout, Navbar, écran de connexion) et avaient divergé : le serveur
 * acceptait cinq rôles, l'interface un seul. Un « super_admin », pourtant le
 * rôle le plus élevé, se retrouvait bloqué à l'entrée de l'administration.
 * Tout part désormais d'ici.
 */

export type RoleUtilisateur =
  | "super_admin"
  | "admin"
  | "editeur_communication"
  | "responsable_projet"
  | "responsable_commission"
  | "membre"
  | "user";

/** Rôles autorisés à entrer dans l'administration. */
export const ROLES_ADMINISTRATION: RoleUtilisateur[] = [
  "super_admin",
  "admin",
  "editeur_communication",
  "responsable_projet",
  "responsable_commission",
];

/** Rôle autorisé sur les opérations sensibles : rôles, paramètres, audit. */
export const ROLES_SUPERVISION: RoleUtilisateur[] = ["super_admin"];

/**
 * Rôles qu'un super administrateur peut attribuer en créant un compte.
 *
 * Déclaré en tuple `as const` parce que Zod exige une liste littérale pour
 * bâtir son énumération : le serveur refuse ainsi tout rôle inventé, sans
 * qu'on ait à recopier la liste dans la validation.
 */
export const ROLES_ATTRIBUABLES = [
  "super_admin",
  "admin",
  "editeur_communication",
  "responsable_projet",
  "responsable_commission",
  "membre",
  "user",
] as const;

/**
 * Description courte de ce que chaque rôle permet, affichée à la création
 * d'un compte : nommer quelqu'un sans savoir ce qu'on lui ouvre est le
 * meilleur moyen de donner trop de droits.
 */
export const DESCRIPTIONS_ROLES: Record<RoleUtilisateur, string> = {
  super_admin: "Accès total, y compris les rôles, les paramètres et le journal d'audit.",
  admin: "Gère tout le contenu et les membres, sans toucher aux rôles ni aux paramètres.",
  editeur_communication: "Rédige et publie actualités, contenus et documents.",
  responsable_projet: "Gère les projets et les indicateurs d'impact.",
  responsable_commission: "Suit les membres et les candidatures de sa commission.",
  membre: "Accès au seul espace membre, aucun accès à l'administration.",
  user: "Compte sans droit particulier.",
};

export const LIBELLES_ROLES: Record<RoleUtilisateur, string> = {
  super_admin: "Super administrateur",
  admin: "Administrateur",
  editeur_communication: "Éditeur communication",
  responsable_projet: "Responsable de projet",
  responsable_commission: "Responsable de commission",
  membre: "Membre",
  user: "Utilisateur",
};

export function peutAccederAdmin(role: string | null | undefined): boolean {
  return Boolean(role && ROLES_ADMINISTRATION.includes(role as RoleUtilisateur));
}

export function estSuperviseur(role: string | null | undefined): boolean {
  return Boolean(role && ROLES_SUPERVISION.includes(role as RoleUtilisateur));
}

/**
 * Sections de l'administration ouvertes à chaque rôle.
 *
 * Le garde d'entrée laisse passer cinq rôles, mais tous n'ont pas à voir la
 * même chose : un éditeur de communication n'a rien à faire dans le journal
 * d'audit. `null` signifie « toutes les sections ».
 */
export const SECTIONS_PAR_ROLE: Record<RoleUtilisateur, string[] | null> = {
  super_admin: null,
  admin: [
    "/admin",
    "/admin/projets",
    "/admin/actualites",
    "/admin/indicateurs",
    "/admin/membres",
    "/admin/candidatures",
    "/admin/contributions",
    "/admin/partenaires",
    "/admin/partenariats",
    "/admin/ressources",
    "/admin/soumissions",
    "/admin/contenus",
  ],
  editeur_communication: [
    "/admin",
    "/admin/actualites",
    "/admin/ressources",
    "/admin/contenus",
    "/admin/partenaires",
  ],
  responsable_projet: [
    "/admin",
    "/admin/projets",
    "/admin/indicateurs",
    "/admin/partenaires",
    "/admin/partenariats",
  ],
  responsable_commission: [
    "/admin",
    "/admin/membres",
    "/admin/candidatures",
    "/admin/soumissions",
  ],
  membre: [],
  user: [],
};

export function sectionsAutorisees(role: string | null | undefined): string[] | null {
  if (!role || !(role in SECTIONS_PAR_ROLE)) return [];
  // `null` signifie « toutes les sections » et doit être renvoyé tel quel.
  // Un `?? []` le confondrait avec un rôle inconnu et masquerait tout le menu.
  return SECTIONS_PAR_ROLE[role as RoleUtilisateur];
}

/** Ce rôle peut-il ouvrir ce chemin d'administration ? */
export function cheminAutorise(role: string | null | undefined, chemin: string): boolean {
  if (!peutAccederAdmin(role)) return false;
  const permis = sectionsAutorisees(role);
  if (permis === null) return true;

  return permis.some(p => {
    if (chemin === p) return true;
    // « /admin » est le tableau de bord, pas un préfixe : sans cette exclusion
    // il autoriserait /admin/audit et /admin/parametres à tous les rôles,
    // puisque tout chemin d'administration commence par « /admin/ ».
    if (p === "/admin") return false;
    return chemin.startsWith(`${p}/`);
  });
}
