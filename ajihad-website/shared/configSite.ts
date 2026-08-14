/**
 * Configuration éditable du site AJIHAD.
 *
 * Chaque clé vit dans la table `parametres` (cle/valeur). Ce fichier définit
 * la liste canonique, les valeurs par défaut et le typage, pour trois raisons :
 *   - le site fonctionne avant tout enregistrement en base ;
 *   - seules ces clés sont exposées publiquement, le reste de `parametres`
 *     (coordonnées internes, etc.) ne fuite pas ;
 *   - l'écran d'administration se génère à partir de cette liste.
 *
 * Partagé entre le serveur et le client : une seule source de vérité.
 */

export type TypeChamp = "texte" | "texte_long" | "booleen" | "date" | "modules";

export type DefinitionParametre = {
  cle: string;
  libelle: string;
  aide?: string;
  type: TypeChamp;
  defaut: string;
  groupe: string;
};

export type ModuleProjefa = {
  titre: string;
  description: string;
};

/** Modules PROJEFA 2026 tels que définis par AJIHAD. */
export const MODULES_PROJEFA_DEFAUT: ModuleProjefa[] = [
  {
    titre: "Analyse de données avec Excel",
    description:
      "Maîtriser le tableur pour collecter, trier et interpréter des données utiles à un projet communautaire.",
  },
  {
    titre: "Google Workspace et introduction à la cybersécurité",
    description:
      "Travailler à plusieurs sur des outils collaboratifs, et adopter les réflexes de base pour protéger ses comptes et ses données.",
  },
  {
    titre: "Leadership communautaire",
    description:
      "Animer un groupe, porter une initiative locale et fédérer autour d'un objectif commun.",
  },
  {
    titre: "Arts plastiques",
    description:
      "Explorer l'expression visuelle comme moyen d'engagement citoyen et de valorisation culturelle.",
  },
  {
    titre: "Entrepreneuriat",
    description:
      "Transformer une idée en projet viable : modèle économique, plan d'action et présentation.",
  },
];

export const PARAMETRES_SITE: DefinitionParametre[] = [
  // ----- Bandeau d'information temporaire -----
  {
    cle: "bandeau_actif",
    libelle: "Afficher le bandeau d'annonce",
    aide: "Bandeau en haut de toutes les pages publiques.",
    type: "booleen",
    defaut: "non",
    groupe: "Annonce temporaire",
  },
  {
    cle: "bandeau_message",
    libelle: "Message du bandeau",
    type: "texte_long",
    defaut: "",
    groupe: "Annonce temporaire",
  },
  {
    cle: "bandeau_lien",
    libelle: "Lien du bandeau",
    aide: "Optionnel. Ex. /projefa-2026",
    type: "texte",
    defaut: "",
    groupe: "Annonce temporaire",
  },

  // ----- Visibilité des liens et boutons -----
  {
    cle: "afficher_bouton_soutenir",
    libelle: "Bouton « Soutenir AJIHAD » dans l'en-tête",
    type: "booleen",
    defaut: "oui",
    groupe: "Visibilité des liens",
  },
  {
    cle: "afficher_lien_projefa",
    libelle: "Lien PROJEFA dans le menu",
    type: "booleen",
    defaut: "oui",
    groupe: "Visibilité des liens",
  },
  {
    cle: "afficher_espace_membre",
    libelle: "Accès à l'espace membre",
    type: "booleen",
    defaut: "oui",
    groupe: "Visibilité des liens",
  },
  {
    cle: "afficher_actualites",
    libelle: "Rubrique Actualités",
    type: "booleen",
    defaut: "oui",
    groupe: "Visibilité des liens",
  },

  // ----- Carte de membre -----
  {
    cle: "carte_couleur_debut",
    libelle: "Couleur de départ du dégradé",
    aide: "Code hexadécimal, ex. #042C53",
    type: "texte",
    defaut: "#042C53",
    groupe: "Carte de membre",
  },
  {
    cle: "carte_couleur_fin",
    libelle: "Couleur de fin du dégradé",
    type: "texte",
    defaut: "#185FA5",
    groupe: "Carte de membre",
  },
  {
    cle: "carte_couleur_accent",
    libelle: "Couleur d'accent",
    aide: "Numéro de membre, nom de l'association.",
    type: "texte",
    defaut: "#4DBFBF",
    groupe: "Carte de membre",
  },
  {
    cle: "carte_mention",
    libelle: "Mention portée sur la carte",
    type: "texte",
    defaut: "Carte de membre officielle",
    groupe: "Carte de membre",
  },
  {
    cle: "carte_afficher_qr",
    libelle: "Afficher le QR de vérification",
    type: "booleen",
    defaut: "oui",
    groupe: "Carte de membre",
  },
  {
    cle: "carte_afficher_photo",
    libelle: "Afficher les initiales du membre",
    type: "booleen",
    defaut: "oui",
    groupe: "Carte de membre",
  },
  {
    cle: "carte_note_verso",
    libelle: "Texte explicatif sous la carte",
    type: "texte_long",
    defaut:
      "Cette carte atteste de l'appartenance de son titulaire à l'AJIHAD. Le QR code permet d'en vérifier la validité à tout moment.",
    groupe: "Carte de membre",
  },

  // ----- PROJEFA -----
  {
    cle: "projefa_annee",
    libelle: "Édition en cours",
    type: "texte",
    defaut: "2026",
    groupe: "PROJEFA",
  },
  {
    cle: "projefa_inscriptions",
    libelle: "État des inscriptions",
    aide: "« auto » suit les dates ci-dessous. « oui » force l'ouverture, « non » force la fermeture.",
    type: "texte",
    defaut: "auto",
    groupe: "PROJEFA",
  },
  {
    cle: "projefa_inscription_debut",
    libelle: "Ouverture des inscriptions",
    type: "date",
    defaut: "",
    groupe: "PROJEFA",
  },
  {
    cle: "projefa_inscription_fin",
    libelle: "Clôture des inscriptions",
    type: "date",
    defaut: "",
    groupe: "PROJEFA",
  },
  {
    cle: "projefa_message_ferme",
    libelle: "Message hors période d'inscription",
    type: "texte_long",
    defaut:
      "Les inscriptions pour l'édition 2026 sont closes. Le programme se déroule de juillet à août 2026. Laissez-nous vos coordonnées pour recevoir le bilan de l'édition et les informations de la prochaine session.",
    groupe: "PROJEFA",
  },
  {
    cle: "projefa_modules",
    libelle: "Modules de formation",
    aide: "Ajoutez, renommez, réordonnez ou supprimez les modules de l'édition.",
    type: "modules",
    defaut: JSON.stringify(MODULES_PROJEFA_DEFAUT),
    groupe: "PROJEFA",
  },
];

export const CLES_PUBLIQUES = PARAMETRES_SITE.map(p => p.cle);

/** Valeurs par défaut, utilisées tant que rien n'est enregistré en base. */
export function configParDefaut(): Record<string, string> {
  return Object.fromEntries(PARAMETRES_SITE.map(p => [p.cle, p.defaut]));
}

export function estVrai(valeur: string | undefined): boolean {
  return valeur === "oui" || valeur === "true" || valeur === "1";
}

export function lireModules(valeur: string | undefined): ModuleProjefa[] {
  if (!valeur) return MODULES_PROJEFA_DEFAUT;
  try {
    const parsed = JSON.parse(valeur);
    if (!Array.isArray(parsed)) return MODULES_PROJEFA_DEFAUT;
    const modules = parsed
      .filter(m => m && typeof m.titre === "string" && m.titre.trim())
      .map(m => ({ titre: String(m.titre), description: String(m.description ?? "") }));
    return modules.length > 0 ? modules : MODULES_PROJEFA_DEFAUT;
  } catch {
    return MODULES_PROJEFA_DEFAUT;
  }
}

/**
 * Les inscriptions PROJEFA sont-elles ouvertes ?
 * Le forçage manuel l'emporte ; sinon on compare aux dates de la fenêtre.
 * Une borne vide signifie « pas de limite de ce côté ».
 */
export function inscriptionsOuvertes(
  config: Record<string, string>,
  maintenant: Date = new Date()
): boolean {
  const etat = (config.projefa_inscriptions ?? "auto").trim();
  if (etat === "oui") return true;
  if (etat === "non") return false;

  const debut = config.projefa_inscription_debut?.trim();
  const fin = config.projefa_inscription_fin?.trim();
  if (!debut && !fin) return false; // aucune fenêtre définie : fermé par défaut

  const jour = maintenant.getTime();
  if (debut) {
    const d = new Date(`${debut}T00:00:00`).getTime();
    if (!Number.isNaN(d) && jour < d) return false;
  }
  if (fin) {
    const f = new Date(`${fin}T23:59:59`).getTime();
    if (!Number.isNaN(f) && jour > f) return false;
  }
  return true;
}
