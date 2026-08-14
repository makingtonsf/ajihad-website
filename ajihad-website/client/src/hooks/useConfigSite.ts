import { trpc } from "@/lib/trpc";
import {
  configParDefaut, estVrai, lireModules, MODULES_PROJEFA_DEFAUT,
  type ModuleProjefa,
} from "@shared/configSite";
import { LISTES_CONTENU, TEXTES_SITE, lireListe } from "@shared/contenusSite";

/**
 * Configuration publique du site, pilotée depuis /admin/parametres.
 *
 * Tant que la requête n'a pas abouti, les valeurs par défaut s'appliquent :
 * aucune page ne clignote et le site reste utilisable si la base est absente.
 */
export function useConfigSite() {
  // 5 s au lieu de 60 : un réglage enregistré dans l'administration doit se
  // voir tout de suite sur le site, sinon on croit que le bouton n'a rien fait.
  const { data, isLoading } = trpc.public.configSite.useQuery(undefined, {
    staleTime: 5_000,
    refetchOnWindowFocus: true,
  });

  const config = data?.config ?? configParDefaut();
  const modules: ModuleProjefa[] = data?.modules
    ?? lireModules(config.projefa_modules)
    ?? MODULES_PROJEFA_DEFAUT;

  return {
    config,
    modules,
    chargement: isLoading,
    /** Calculé côté serveur : l'horloge du visiteur n'entre pas en jeu. */
    inscriptionsProjefaOuvertes: data?.inscriptionsProjefaOuvertes ?? false,
    visible: (cle: string) => estVrai(config[cle]),
    texte: (cle: string) => config[cle] ?? "",
    /**
     * Liste éditoriale, servie par l'administration. Retombe sur le contenu
     * d'origine tant que la requête n'a pas abouti : aucune page ne clignote.
     */
    liste: (cle: string): Record<string, string>[] =>
      data?.contenus?.[cle] ?? lireListe(cle, config[cle]),
    /** Une section est visible tant qu'elle n'a pas été explicitement coupée. */
    sectionVisible: (cle: string) => config[cle] === undefined || estVrai(config[cle]),
    /**
     * Titre ou chapô de section. Un champ vidé dans l'administration rétablit
     * le texte d'origine plutôt que d'afficher un blanc.
     */
    txt: (cle: string): string => {
      const saisi = (config[cle] ?? "").trim();
      if (saisi) return saisi;
      return TEXTES_SITE.find(t => t.cle === cle)?.defaut ?? "";
    },
  };
}
