import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { useCallback, useEffect, useMemo } from "react";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

/**
 * Session courante, servie par l'authentification locale du site
 * (e-mail + mot de passe). Aucun fournisseur externe n'intervient.
 */
export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath } = options ?? {};
  const utils = trpc.useUtils();

  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const deconnexionMutation = trpc.auth.deconnexion.useMutation();

  /**
   * Termine la session et ramène à l'accueil public.
   *
   * On force un rechargement complet plutôt qu'une navigation interne : le
   * cache de requêtes est ainsi entièrement vidé, sans quoi des données
   * privées déjà chargées (fiche membre, listes d'administration) resteraient
   * affichées jusqu'à leur péremption.
   */
  const logout = useCallback(async () => {
    try {
      await deconnexionMutation.mutateAsync();
    } finally {
      utils.auth.me.setData(undefined, null);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  }, [deconnexionMutation, utils]);

  const state = useMemo(
    () => ({
      user: meQuery.data ?? null,
      loading: meQuery.isLoading || deconnexionMutation.isPending,
      error: meQuery.error ?? deconnexionMutation.error ?? null,
      isAuthenticated: Boolean(meQuery.data),
    }),
    [
      meQuery.data,
      meQuery.error,
      meQuery.isLoading,
      deconnexionMutation.error,
      deconnexionMutation.isPending,
    ]
  );

  useEffect(() => {
    if (!redirectOnUnauthenticated) return;
    if (state.loading || state.user) return;
    if (typeof window === "undefined") return;
    if (redirectPath && window.location.pathname === redirectPath) return;

    if (redirectPath) {
      window.location.href = redirectPath;
    } else {
      startLogin();
    }
  }, [redirectOnUnauthenticated, redirectPath, state.loading, state.user]);

  return {
    ...state,
    refresh: () => meQuery.refetch(),
    logout,
  };
}
