import { useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { LogIn, Eye, EyeOff, ShieldCheck, ArrowRight, Shield } from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import SEOHead from "@/components/SEOHead";
import { trpc } from "@/lib/trpc";
import { CONNEXION_ADMIN } from "@/const";
import { toast } from "sonner";
import MotDePasseOublie from "@/components/MotDePasseOublie";

const champ =
  "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none";

export default function Connexion() {
  const recherche = useSearch();
  const [, naviguer] = useLocation();
  const utils = trpc.useUtils();
  const { data: config } = trpc.public.configSite.useQuery();

  const retour = new URLSearchParams(recherche).get("retour") || "/espace-membre";
  const [form, setForm] = useState({ email: "", motDePasse: "" });
  const [voirMdp, setVoirMdp] = useState(false);

  const apresSucces = async (nom: string | null) => {
    await utils.auth.me.invalidate();
    toast.success(`Bienvenue${nom ? `, ${nom}` : ""} !`);
    naviguer(retour);
  };

  const connexion = trpc.auth.connexion.useMutation({
    onSuccess: d => apresSucces(d.nom),
    onError: e => toast.error(e.message),
  });

  const enCours = connexion.isPending;

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault();
    connexion.mutate(form);
  };

  return (
    <PublicLayout>
      <SEOHead
        title="Connexion"
        description="Accédez à votre espace membre AJIHAD."
      />
      <section className="min-h-[70vh] flex items-center justify-center bg-[#F6F8FB] dark:bg-gray-900 py-12 sm:py-20 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
            <div className="text-center mb-7">
              <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-7 h-7 text-[#185FA5]" />
              </div>
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                Connexion
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                Accédez à votre espace membre AJIHAD.
              </p>
            </div>

            {config?.modeDemo && (
              <div className="mb-5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-amber-800 dark:text-amber-300 text-xs font-semibold mb-1">
                  Mode démonstration — aucune base de données
                </p>
                <p className="text-amber-700 dark:text-amber-400 text-xs leading-relaxed">
                  Les comptes créés depuis l'administration vivent en mémoire et repartent
                  à zéro au redémarrage du serveur.
                </p>
              </div>
            )}

            <form onSubmit={soumettre} className="space-y-4" noValidate>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Adresse e-mail
                </label>
                <input id="email" type="email" required autoComplete="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className={champ} placeholder="vous@exemple.com" />
              </div>

              <div>
                <label htmlFor="motdepasse" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="motdepasse"
                    type={voirMdp ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={form.motDePasse}
                    onChange={e => setForm(f => ({ ...f, motDePasse: e.target.value }))}
                    className={`${champ} pr-12`}
                    placeholder="Votre mot de passe"
                                      />
                  <button type="button" onClick={() => setVoirMdp(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    aria-label={voirMdp ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                    {voirMdp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={enCours}
                className="w-full btn-primary-ajihad justify-center py-3.5 text-base disabled:opacity-60">
                {enCours ? "Connexion..." : "Se connecter"}
                {!enCours && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>

            <div className="mt-4">
              <MotDePasseOublie espace="membre" emailPreRempli={form.email} />
            </div>

            {/* Aucune inscription libre : les comptes membres sont créés par
                l'administration, qui transmet les identifiants. */}
            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 text-sm text-center leading-relaxed">
                Pas encore de compte ? Les accès sont délivrés par l'équipe AJIHAD.{" "}
                <Link href="/s-impliquer" className="text-[#185FA5] dark:text-blue-400 font-semibold hover:underline">
                  Déposez votre candidature
                </Link>{" "}
                ou <Link href="/contact" className="text-[#185FA5] dark:text-blue-400 font-semibold hover:underline">contactez-nous</Link>.
              </p>
            </div>

            {/* Accès à l'administration. Seule porte d'entrée visible vers
                /admin/connexion : sans ce lien, l'écran n'était atteignable
                qu'en saisissant l'URL de mémoire. */}
            <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
              <Link
                href={CONNEXION_ADMIN}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-[#042C53]/20 dark:border-white/15 text-[#042C53] dark:text-blue-200 text-sm font-semibold hover:bg-[#042C53] hover:text-white hover:border-[#042C53] dark:hover:bg-white/10 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Connexion administration
              </Link>
              <p className="text-gray-400 dark:text-gray-500 text-xs text-center mt-2.5">
                Réservé à l'équipe AJIHAD.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 mt-5 px-2">
            <ShieldCheck className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">
              Votre mot de passe est chiffré et n'est jamais stocké en clair. Il vous est propre :
              votre compte membre est indépendant de tout compte d'administration.
            </p>
          </div>

          <p className="text-center mt-5">
            <Link href="/" className="text-gray-500 dark:text-gray-400 text-sm hover:text-[#185FA5] transition-colors">
              ← Retour à l'accueil
            </Link>
          </p>
        </div>
      </section>
    </PublicLayout>
  );
}
