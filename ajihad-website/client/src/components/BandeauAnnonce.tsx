import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { Megaphone, X } from "lucide-react";
import { useConfigSite } from "@/hooks/useConfigSite";

/**
 * Bandeau d'information temporaire, activé et rédigé depuis /admin/parametres.
 * Refermable par le visiteur pour la session en cours.
 *
 * Il est en position fixe, au-dessus de la barre de navigation.
 *
 * Pourquoi : la barre de navigation est `fixed top-0 z-50`. Le bandeau, placé
 * avant elle en flux normal, se retrouvait donc intégralement recouvert — mesuré
 * à l'écran, `elementFromPoint` au centre du bandeau renvoyait la barre. Il
 * existait bien dans la page, occupait sa hauteur, mais restait invisible.
 *
 * Sa hauteur est republiée dans la variable CSS `--hauteur-bandeau`, que la
 * barre de navigation utilise pour se décaler et le layout pour réserver la
 * place. Elle est mesurée plutôt que codée en dur : un message long passe à la
 * ligne sur mobile et le bandeau grandit.
 */
export default function BandeauAnnonce() {
  const { visible, texte } = useConfigSite();
  const [ferme, setFerme] = useState(false);
  const boite = useRef<HTMLDivElement>(null);

  const message = texte("bandeau_message").trim();
  const affiche = visible("bandeau_actif") && Boolean(message) && !ferme;

  // useLayoutEffect : la variable doit être posée avant la peinture, sinon la
  // barre de navigation saute visiblement d'une position à l'autre.
  useLayoutEffect(() => {
    const racine = document.documentElement;

    if (!affiche) {
      racine.style.setProperty("--hauteur-bandeau", "0px");
      return;
    }

    const mesurer = () => {
      const h = boite.current?.offsetHeight ?? 0;
      racine.style.setProperty("--hauteur-bandeau", `${h}px`);
    };
    mesurer();

    const observateur = new ResizeObserver(mesurer);
    if (boite.current) observateur.observe(boite.current);
    window.addEventListener("resize", mesurer);

    return () => {
      observateur.disconnect();
      window.removeEventListener("resize", mesurer);
    };
  }, [affiche, message]);

  // Au démontage de la page, la variable ne doit pas rester à une hauteur
  // fantôme : sans cela, un écran sans bandeau garderait un décalage en haut.
  useEffect(() => () => {
    document.documentElement.style.setProperty("--hauteur-bandeau", "0px");
  }, []);

  if (!affiche) return null;

  const lien = texte("bandeau_lien").trim();
  // Un lien interne commence par « / ». Toute autre saisie serait résolue
  // relativement à la page courante et mènerait n'importe où.
  const lienInterne = lien.startsWith("/") ? lien : "";

  return (
    <div
      ref={boite}
      className="fixed top-0 left-0 right-0 z-[60] bg-[#042C53] text-white shadow-sm"
      role="region"
      aria-label="Annonce"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-start gap-3">
        <Megaphone className="w-4 h-4 text-[#4DBFBF] flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p className="flex-1 text-sm leading-relaxed">
          {message}
          {lienInterne && (
            <Link
              href={lienInterne}
              className="ml-2 underline font-semibold hover:text-[#4DBFBF] transition-colors whitespace-nowrap"
            >
              En savoir plus
            </Link>
          )}
        </p>
        <button
          onClick={() => setFerme(true)}
          className="p-1 rounded hover:bg-white/10 transition-colors flex-shrink-0"
          aria-label="Fermer l'annonce"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
