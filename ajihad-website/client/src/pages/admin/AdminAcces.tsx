import { useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import AdminLayout from "./AdminLayout";
import { toast } from "sonner";
import {
  ShieldCheck, UserPlus, KeyRound, Copy, Check, X, Bell, Unlock, Info,
} from "lucide-react";
import Pastille, { tonDeCategorie } from "@/components/Pastille";
import EtatVide from "@/components/EtatVide";
import { TITRE_PAGE, TITRE_SECTION, TITRE_CARTE, SOUS_TEXTE } from "@/lib/typographie";
import {
  DESCRIPTIONS_ROLES, LIBELLES_ROLES, ROLES_ATTRIBUABLES, ROLES_ADMINISTRATION,
  type RoleUtilisateur,
} from "@shared/roles";

const champCss =
  "w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 " +
  "text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#185FA5] focus:border-transparent";

/** Un rôle d'administration se distingue d'un simple accès membre. */
function tonDuRole(role: string) {
  if (role === "super_admin") return "danger" as const;
  if (ROLES_ADMINISTRATION.includes(role as RoleUtilisateur)) return "info" as const;
  return "neutre" as const;
}

/**
 * Identifiants affichés une seule fois.
 *
 * Les mots de passe sont hachés en scrypt : ni le site, ni la base, ni un
 * administrateur ne peuvent les relire. Ce panneau est donc l'unique moment
 * où le mot de passe existe en clair — d'où l'avertissement explicite.
 */
function PanneauIdentifiants({
  acces, onFermer,
}: { acces: { email: string; motDePasse: string }; onFermer: () => void }) {
  const [copie, setCopie] = useState(false);

  const copier = async () => {
    const texte = `Espace AJIHAD\nAdresse : ${acces.email}\nMot de passe provisoire : ${acces.motDePasse}`;
    try {
      await navigator.clipboard.writeText(texte);
      setCopie(true);
      setTimeout(() => setCopie(false), 2500);
    } catch {
      toast.error("Copie impossible. Notez le mot de passe à la main.");
    }
  };

  return (
    <section
      role="alert"
      className="rounded-2xl border-2 border-[#4DBFBF] bg-teal-50/60 dark:bg-teal-900/20 overflow-hidden"
    >
      <header className="flex items-start justify-between gap-4 px-5 py-4 border-b border-teal-200 dark:border-teal-800">
        <div className="flex items-start gap-3 min-w-0">
          <KeyRound className="w-5 h-5 text-[#2b8f8f] dark:text-[#4DBFBF] flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <h2 className={TITRE_SECTION}>Identifiants créés</h2>
            <p className="text-teal-800 dark:text-teal-200 text-sm mt-1 leading-relaxed">
              Notez-les maintenant : ce mot de passe ne sera plus jamais affiché.
              Il est enregistré sous forme chiffrée et personne ne peut le relire.
            </p>
          </div>
        </div>
        <button
          onClick={onFermer}
          className="p-1.5 rounded-lg hover:bg-teal-100 dark:hover:bg-teal-800/40 transition-colors flex-shrink-0"
          aria-label="Fermer"
        >
          <X className="w-4 h-4 text-teal-700 dark:text-teal-300" />
        </button>
      </header>

      <div className="px-5 py-4 grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">Adresse</p>
          <p className="font-mono text-sm text-gray-900 dark:text-white mt-1 break-all">{acces.email}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700 dark:text-teal-400">Mot de passe provisoire</p>
          <p className="font-mono text-lg font-bold text-[#185FA5] dark:text-blue-300 mt-1">{acces.motDePasse}</p>
        </div>
      </div>

      <div className="px-5 pb-4">
        <button
          onClick={copier}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#185FA5] text-white text-sm font-semibold hover:bg-[#042C53] transition-colors"
        >
          {copie ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copie ? "Copié" : "Copier les identifiants"}
        </button>
      </div>
    </section>
  );
}

export default function AdminAcces() {
  const utils = trpc.useUtils();
  const { data: comptes, refetch } = trpc.admin.users.list.useQuery();
  const { data: alertes, refetch: refetchAlertes } = trpc.admin.alertes.list.useQuery();

  const [acces, setAcces] = useState<{ email: string; motDePasse: string } | null>(null);
  const [ouvert, setOuvert] = useState(false);
  const [form, setForm] = useState({ nom: "", email: "", role: "admin" as (typeof ROLES_ATTRIBUABLES)[number] });

  const creer = trpc.admin.users.creer.useMutation({
    onSuccess: d => {
      setAcces({ email: d.email, motDePasse: d.motDePasse });
      setForm({ nom: "", email: "", role: "admin" });
      setOuvert(false);
      toast.success("Compte créé.");
      refetch();
    },
    onError: e => toast.error(e.message),
  });

  const reinitialiser = trpc.admin.users.reinitialiser.useMutation({
    onSuccess: d => {
      setAcces({ email: d.email, motDePasse: d.motDePasse });
      toast.success("Mot de passe réinitialisé.");
      refetch();
    },
    onError: e => toast.error(e.message),
  });

  const debloquer = trpc.admin.users.debloquer.useMutation({
    onSuccess: () => { toast.success("Compte débloqué."); refetch(); },
    onError: e => toast.error(e.message),
  });

  const majRole = trpc.admin.users.updateRole.useMutation({
    onSuccess: () => { toast.success("Rôle mis à jour."); refetch(); },
    onError: e => toast.error(e.message),
  });

  const marquerLue = trpc.admin.alertes.marquerLue.useMutation({
    onSuccess: () => { refetchAlertes(); utils.admin.alertes.list.invalidate(); },
  });

  const alertesNonLues = useMemo(
    () => (alertes ?? []).filter((a: any) => !a.estLu),
    [alertes],
  );

  const soumettre = (e: React.FormEvent) => {
    e.preventDefault();
    creer.mutate(form);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-5xl">
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className={TITRE_PAGE}>Accès &amp; rôles</h1>
            <p className={`${SOUS_TEXTE} mt-1`}>
              Créez les comptes d'administration, attribuez les droits et dépannez
              ceux qui ont perdu leur mot de passe.
            </p>
          </div>
          <button
            onClick={() => setOuvert(o => !o)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#185FA5] text-white text-sm font-semibold hover:bg-[#042C53] transition-colors flex-shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            {ouvert ? "Fermer" : "Nouvel administrateur"}
          </button>
        </header>

        {acces && <PanneauIdentifiants acces={acces} onFermer={() => setAcces(null)} />}

        {/* ---- Alertes « mot de passe oublié » ---- */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#B64926]" />
            <h2 className={TITRE_SECTION}>Demandes d'aide</h2>
            {alertesNonLues.length > 0 && (
              <Pastille ton="danger" taille="sm">{alertesNonLues.length}</Pastille>
            )}
          </header>

          {alertesNonLues.length === 0 ? (
            <EtatVide
              icone={Bell}
              titre="Aucune demande en attente"
              description="Quand quelqu'un déclare avoir oublié son mot de passe depuis un écran de connexion, la demande apparaît ici."
            />
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {alertesNonLues.map((a: any) => (
                <li key={a.id} className="px-5 py-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className={TITRE_CARTE}>{a.titre}</p>
                    <p className={`${SOUS_TEXTE} mt-0.5`}>{a.message}</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                      {new Date(a.createdAt).toLocaleString("fr-HT")}
                    </p>
                  </div>
                  <button
                    onClick={() => marquerLue.mutate({ id: a.id })}
                    className="text-sm font-semibold text-[#185FA5] hover:underline flex-shrink-0"
                  >
                    Traitée
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* ---- Création d'un compte ---- */}
        {ouvert && (
          <form
            onSubmit={soumettre}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 space-y-4"
          >
            <h2 className={TITRE_SECTION}>Nouveau compte</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="acc-nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Nom complet
                </label>
                <input
                  id="acc-nom" required value={form.nom}
                  onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                  className={champCss} placeholder="Marie Joseph"
                />
              </div>
              <div>
                <label htmlFor="acc-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Adresse e-mail
                </label>
                <input
                  id="acc-email" type="email" required value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className={champCss} placeholder="marie@ajihad.org"
                />
              </div>
            </div>

            <div>
              <label htmlFor="acc-role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Rôle
              </label>
              <select
                id="acc-role" value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value as typeof f.role }))}
                className={champCss}
              >
                {ROLES_ATTRIBUABLES.map(r => (
                  <option key={r} value={r}>{LIBELLES_ROLES[r]}</option>
                ))}
              </select>
              <p className="flex items-start gap-1.5 text-gray-500 dark:text-gray-400 text-xs mt-2 leading-relaxed">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-px" aria-hidden="true" />
                {DESCRIPTIONS_ROLES[form.role]}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit" disabled={creer.isPending}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#185FA5] text-white text-sm font-semibold hover:bg-[#042C53] transition-colors disabled:opacity-60"
              >
                <Check className="w-4 h-4" />
                {creer.isPending ? "Création…" : "Créer le compte"}
              </button>
              <p className="text-gray-500 dark:text-gray-400 text-xs">
                Un mot de passe provisoire sera affiché une seule fois.
              </p>
            </div>
          </form>
        )}

        {/* ---- Comptes existants ---- */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#185FA5]" />
            <h2 className={TITRE_SECTION}>Comptes</h2>
            <span className={SOUS_TEXTE}>{comptes?.length ?? 0}</span>
          </header>

          {!comptes || comptes.length === 0 ? (
            <EtatVide
              icone={ShieldCheck}
              titre="Aucun compte"
              description="Créez le premier compte d'administration."
              action={{ libelle: "Nouvel administrateur", onClick: () => setOuvert(true) }}
            />
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {comptes.map((c: any) => {
                const bloque = c.bloqueJusqua && new Date(c.bloqueJusqua) > new Date();
                return (
                  <li key={c.id} className="px-5 py-4 flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={TITRE_CARTE}>{c.name || "Sans nom"}</p>
                        <Pastille ton={tonDuRole(c.role)} taille="sm">
                          {LIBELLES_ROLES[c.role as RoleUtilisateur] ?? c.role}
                        </Pastille>
                        {bloque && <Pastille ton="danger" taille="sm">Bloqué</Pastille>}
                      </div>
                      <p className={`${SOUS_TEXTE} mt-0.5 break-all`}>{c.email}</p>
                      <p className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                        {c.lastSignedIn
                          ? `Dernière connexion le ${new Date(c.lastSignedIn).toLocaleDateString("fr-HT")}`
                          : "Jamais connecté"}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                      <select
                        value={c.role}
                        onChange={e => majRole.mutate({ id: c.id, role: e.target.value as any })}
                        aria-label={`Rôle de ${c.name || c.email}`}
                        className="text-xs px-2.5 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#185FA5]"
                      >
                        {ROLES_ATTRIBUABLES.map(r => (
                          <option key={r} value={r}>{LIBELLES_ROLES[r]}</option>
                        ))}
                      </select>

                      {bloque && (
                        <button
                          onClick={() => debloquer.mutate({ id: c.id })}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                        >
                          <Unlock className="w-3.5 h-3.5" /> Débloquer
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (!window.confirm(`Réinitialiser le mot de passe de ${c.email} ?\n\nL'ancien deviendra inutilisable.`)) return;
                          reinitialiser.mutate({ id: c.id });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#185FA5] border border-[#185FA5]/30 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <KeyRound className="w-3.5 h-3.5" /> Réinitialiser
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <p className="flex items-start gap-2 text-gray-500 dark:text-gray-400 text-xs leading-relaxed">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          Les mots de passe sont enregistrés sous forme chiffrée et ne peuvent être
          affichés, y compris depuis cet écran. Pour dépanner quelqu'un, réinitialisez
          son mot de passe : le nouveau s'affiche une fois, à lui transmettre.
        </p>
      </div>
    </AdminLayout>
  );
}
