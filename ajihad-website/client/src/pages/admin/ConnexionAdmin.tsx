import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { Shield, Eye, EyeOff, ArrowRight, AlertTriangle, BookOpen } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { peutAccederAdmin } from "@shared/roles";
import { toast } from "sonner";
import MotDePasseOublie from "@/components/MotDePasseOublie";

const champ =
  "w-full px-4 py-3 rounded-xl border border-white/15 bg-white/5 text-white placeholder-blue-200/40 focus:ring-2 focus:ring-[#4DBFBF] focus:border-transparent outline-none transition-shadow";

/**
 * Connexion à l'administration.
 *
 * Écran distinct de /connexion, volontairement : l'espace membre et
 * l'administration sont deux portes séparées. Aucune inscription possible ici,
 * un compte d'administration se crée depuis /admin/acces.
 */
export default function ConnexionAdmin() {
  const recherche = useSearch();
  const [, naviguer] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { data: config } = trpc.public.configSite.useQuery();

  const destination = new URLSearchParams(recherche).get("retour") || "/admin";
  const [form, setForm] = useState({ email: "", motDePasse: "" });
  const [voirMdp, setVoirMdp] = useState(false);

  const connexion = trpc.auth.connexion.useMutation({
    onSuccess: async () => {
      const moi = await utils.auth.me.fetch();
      if (!peutAccederAdmin((moi as any)?.role)) {
        // Les identifiants sont bons, mais le compte n'a pas les droits.
        // On le dit clairement plutôt que de renvoyer une erreur de connexion.
        toast.error("Ce compte n'a pas accès à l'administration.");
        naviguer("/espace-membre");
        return;
      }
      toast.success("Bienvenue dans l'administration.");
      naviguer(destination);
    },
    onError: e => toast.error(e.message),
  });

  // Déjà connecté avec les droits : inutile de redemander.
  const dejaAdmin = isAuthenticated && peutAccederAdmin((user as any)?.role);

  return (
    <div className="min-h-screen bg-[#042C53] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Motif de fond */}
      <div className="absolute inset-0 opacity-[0.07]" aria-hidden="true">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#4DBFBF]" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-[#B64926]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
            <BookOpen className="w-7 h-7 text-[#4DBFBF]" />
          </div>
          <div className="font-extrabold text-2xl text-white tracking-wider">AJIHAD</div>
          <p className="text-blue-200/60 text-sm mt-1">Espace d'administration</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-7 shadow-2xl">
          {dejaAdmin ? (
            <div className="text-center">
              <Shield className="w-10 h-10 text-[#4DBFBF] mx-auto mb-4" />
              <p className="text-white font-semibold mb-1">Vous êtes déjà connecté</p>
              <p className="text-blue-200/60 text-sm mb-6">{user?.email}</p>
              <Link href="/admin" className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#4DBFBF] text-[#042C53] rounded-xl font-bold hover:bg-[#3aa0a0] transition-colors">
                Accéder au tableau de bord <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2.5 mb-6">
                <Shield className="w-4 h-4 text-[#4DBFBF]" />
                {/* Cet écran a une palette inversée (panneau sombre en permanence) :
                    il garde sa propre couleur, mais la taille est déclarée, pas héritée. */}
                <h1 className="text-lg font-bold text-white">Connexion réservée</h1>
              </div>

              <form
                onSubmit={e => { e.preventDefault(); connexion.mutate(form); }}
                className="space-y-4"
                noValidate
              >
                <div>
                  <label htmlFor="email-admin" className="block text-xs font-semibold text-blue-200/80 mb-1.5">
                    Adresse e-mail
                  </label>
                  <input
                    id="email-admin" type="email" required autoComplete="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className={champ} placeholder="vous@ajihad.org"
                  />
                </div>

                <div>
                  <label htmlFor="mdp-admin" className="block text-xs font-semibold text-blue-200/80 mb-1.5">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="mdp-admin" type={voirMdp ? "text" : "password"} required autoComplete="current-password"
                      value={form.motDePasse}
                      onChange={e => setForm(f => ({ ...f, motDePasse: e.target.value }))}
                      className={`${champ} pr-12`}
                    />
                    <button type="button" onClick={() => setVoirMdp(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-blue-200/50 hover:text-white transition-colors"
                      aria-label={voirMdp ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                      {voirMdp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={connexion.isPending}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-[#4DBFBF] text-[#042C53] rounded-xl font-bold hover:bg-[#3aa0a0] transition-colors disabled:opacity-60">
                  {connexion.isPending ? "Vérification..." : "Se connecter"}
                  {!connexion.isPending && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              <div className="mt-4">
                <MotDePasseOublie espace="administration" variante="sombre" emailPreRempli={form.email} />
              </div>

              {config?.modeDemo && (
                <div className="mt-5 p-3.5 rounded-xl bg-[#4DBFBF]/10 border border-[#4DBFBF]/25">
                  <p className="text-[#4DBFBF] text-xs font-semibold mb-1.5">
                    Mode démonstration — aucune base de données
                  </p>
                  <p className="text-blue-200/70 text-xs leading-relaxed">
                    Identifiants de test : <span className="font-mono text-white">{config.compteDemo}</span>
                    {" "}avec le mot de passe de préversion.
                  </p>
                </div>
              )}

              <div className="flex items-start gap-2.5 mt-6 pt-5 border-t border-white/10">
                <AlertTriangle className="w-3.5 h-3.5 text-blue-200/40 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-blue-200/50 text-xs leading-relaxed">
                  Aucune inscription depuis cet écran. Les comptes d'administration sont créés
                  par un responsable depuis « Accès & rôles ».
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-center gap-5 mt-6 text-sm">
          <Link href="/" className="text-blue-200/60 hover:text-white transition-colors">
            ← Retour au site
          </Link>
          <span className="text-blue-200/20">·</span>
          <Link href="/connexion" className="text-blue-200/60 hover:text-white transition-colors">
            Espace membre
          </Link>
        </div>
      </div>
    </div>
  );
}
