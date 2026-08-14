import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

/**
 * État vide — brique unique du site.
 *
 * Le projet comptait 19 formulations différentes, chacune avec sa propre mise
 * en forme : « Aucune soumission. » ici, « Aucun projet pour le moment. » là,
 * tailles et marges variables. Deux situations pourtant distinctes étaient
 * traitées de la même façon.
 *
 * Ce composant les sépare explicitement :
 *   - `raison="vide"` : il n'y a rien parce que rien n'a encore été créé.
 *     On propose alors une action pour démarrer.
 *   - `raison="filtre"` : il y a des données, mais aucune ne passe les
 *     filtres. Proposer « créer » serait absurde ; on propose de réinitialiser.
 *
 * Confondre les deux est le défaut le plus courant : l'utilisateur qui a mal
 * filtré croit avoir perdu ses données.
 */
export default function EtatVide({
  icone: Icone = Inbox,
  titre,
  description,
  raison = "vide",
  action,
}: {
  icone?: LucideIcon;
  titre: string;
  description?: string;
  raison?: "vide" | "filtre";
  action?: { libelle: string; onClick: () => void };
}) {
  return (
    <div className="py-14 px-6 text-center">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
          raison === "filtre"
            ? "bg-amber-50 dark:bg-amber-900/20"
            : "bg-gray-50 dark:bg-gray-700/50"
        }`}
        aria-hidden="true"
      >
        <Icone
          className={`w-6 h-6 ${
            raison === "filtre"
              ? "text-amber-600 dark:text-amber-400"
              : "text-gray-400 dark:text-gray-500"
          }`}
        />
      </div>

      <p className="font-semibold text-gray-900 dark:text-white text-sm">{titre}</p>

      {description && (
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1.5 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}

      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:bg-[#042C53] transition-colors"
        >
          {action.libelle}
        </button>
      )}
    </div>
  );
}
