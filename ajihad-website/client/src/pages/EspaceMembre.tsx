import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  User, CreditCard, FileText, Bell, Shield, LogOut, Download, Lock,
  CheckCircle, Clock, Award, ChevronRight, Save, ExternalLink, Inbox,
  KeyRound, Users, Globe, Heart,
} from "lucide-react";
import PublicLayout from "@/components/PublicLayout";
import SEOHead from "@/components/SEOHead";
import CarteMembre from "@/components/CarteMembre";
import Pastille, { tonDuStatut } from "@/components/Pastille";
import EtatVide from "@/components/EtatVide";
import { SURTITRE, TITRE_MODALE } from "@/lib/typographie";
import type { LucideIcon } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useConfigSite } from "@/hooks/useConfigSite";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const ONGLETS = [
  { id: "accueil", label: "Tableau de bord", icon: Award },
  { id: "profil", label: "Mon profil", icon: User },
  { id: "carte", label: "Ma carte", icon: CreditCard },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "securite", label: "Sécurité", icon: Shield },
];

// Libellés propres à l'espace membre : la personne lit sa propre situation,
// pas une ligne de tableau. « En attente de validation » est plus juste ici que
// le « En attente » de l'administration. Les couleurs, elles, viennent de Pastille.
const STATUTS: Record<string, { label: string }> = {
  en_attente: { label: "En attente de validation" },
  verifie: { label: "Vérifié" },
  approuve: { label: "Approuvé" },
  actif: { label: "Membre actif" },
  refuse: { label: "Refusé" },
  inactif: { label: "Inactif" },
};

const TYPES: Record<string, { label: string; icon: typeof Users }> = {
  membre: { label: "Membre", icon: Users },
  benevole: { label: "Bénévole", icon: Heart },
  ambassadeur: { label: "Ambassadeur", icon: Globe },
};

const champ =
  "w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#185FA5] outline-none";

/** Information que le membre ne peut pas modifier lui-même. */
function ChampVerrouille({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div>
      <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
        <Lock className="w-3 h-3" aria-hidden="true" />
        {label}
      </span>
      <p className="px-3.5 py-2.5 text-sm rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300">
        {valeur || "—"}
      </p>
    </div>
  );
}

/**
 * Carte de section — même langage visuel que l'administration : un en-tête
 * séparé du contenu par un filet, plutôt qu'un titre flottant. La séparation
 * rend la structure lisible d'un coup d'œil quand plusieurs sections
 * s'enchaînent.
 */
function Section({
  titre, description, action, children,
}: {
  titre: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/70 dark:border-gray-700 shadow-sm overflow-hidden">
      <header className="px-5 sm:px-7 py-4 sm:py-5 border-b border-gray-100 dark:border-gray-700 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className={TITRE_MODALE}>{titre}</h2>
          {description && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 leading-relaxed">{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </header>
      <div className="p-5 sm:p-7">{children}</div>
    </section>
  );
}

/**
 * Tuile de résumé : icône à côté de la valeur, pas au-dessus.
 * Le même choix que pour les compteurs de l'administration — le chiffre et son
 * libellé forment un bloc, au lieu d'être séparés par l'icône.
 */
function Tuile({
  icone: Icone, couleur, libelle, children,
}: {
  icone: LucideIcon;
  couleur: string;
  libelle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F6F8FB] dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${couleur}1a` }}
        aria-hidden="true"
      >
        <Icone className="w-4 h-4" style={{ color: couleur }} />
      </div>
      <div className="min-w-0">
        <p className={`${SURTITRE} mb-1`}>{libelle}</p>
        {children}
      </div>
    </div>
  );
}

export default function EspaceMembre() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { texte } = useConfigSite();
  const utils = trpc.useUtils();
  const [onglet, setOnglet] = useState("accueil");

  const connecte = isAuthenticated;
  const { data: profil } = trpc.auth.monProfil.useQuery(undefined, { enabled: connecte });
  const { data: documents } = trpc.membre.mesDocuments.useQuery(undefined, { enabled: connecte });
  const { data: notifications } = trpc.membre.mesNotifications.useQuery(undefined, { enabled: connecte });

  const [formProfil, setFormProfil] = useState({
    telephone: "", adresse: "", commune: "", niveauEtude: "", competences: "",
  });
  const [formMdp, setFormMdp] = useState({ actuel: "", nouveau: "", confirmation: "" });

  useEffect(() => {
    if (!profil) return;
    setFormProfil({
      telephone: profil.telephone ?? "",
      adresse: profil.adresse ?? "",
      commune: profil.commune ?? "",
      niveauEtude: profil.niveauEtude ?? "",
      competences: profil.competences ?? "",
    });
  }, [profil]);

  const majProfil = trpc.auth.majMonProfil.useMutation({
    onSuccess: () => { toast.success("Profil mis à jour."); utils.auth.monProfil.invalidate(); },
    onError: e => toast.error(e.message),
  });

  const changerMdp = trpc.auth.changerMotDePasse.useMutation({
    onSuccess: () => {
      toast.success("Mot de passe modifié.");
      setFormMdp({ actuel: "", nouveau: "", confirmation: "" });
    },
    onError: e => toast.error(e.message),
  });

  const marquerLue = trpc.membre.marquerNotificationLue.useMutation({
    onSuccess: () => utils.membre.mesNotifications.invalidate(),
  });

  const nonLues = useMemo(
    () => (notifications ?? []).filter((n: any) => !n.estLu).length,
    [notifications]
  );

  /**
   * Complétude du profil : les champs que le membre peut lui-même renseigner.
   * Une barre de progression vaut mieux qu'un formulaire muet — elle indique
   * ce qui manque et donne une raison de revenir.
   */
  const completude = useMemo(() => {
    const champs = [
      { cle: "telephone", libelle: "Téléphone" },
      { cle: "commune", libelle: "Commune" },
      { cle: "niveauEtude", libelle: "Niveau d'étude" },
      { cle: "adresse", libelle: "Adresse" },
      { cle: "competences", libelle: "Compétences" },
    ];
    const remplis = champs.filter(c => String((profil as any)?.[c.cle] ?? "").trim());
    return {
      pourcentage: Math.round((remplis.length / champs.length) * 100),
      manquants: champs.filter(c => !String((profil as any)?.[c.cle] ?? "").trim()),
    };
  }, [profil]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[#185FA5] border-t-transparent rounded-full animate-spin" />
        </div>
      </PublicLayout>
    );
  }

  if (!connecte) {
    return (
      <PublicLayout>
        <SEOHead title="Espace membre" description="Connectez-vous à votre espace membre AJIHAD." />
        <section className="min-h-[70vh] flex items-center justify-center bg-[#F6F8FB] dark:bg-gray-900 py-20 px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 sm:p-10 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <Shield className="w-8 h-8 text-[#185FA5]" />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">Espace membre</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Connectez-vous pour retrouver votre carte, vos documents et vos notifications.
            </p>
            <Link href="/connexion?retour=%2Fespace-membre" className="w-full btn-primary-ajihad justify-center py-3.5 text-base mb-4">
              Se connecter
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Pas encore de compte ?{" "}
              <Link href="/connexion" className="text-[#185FA5] dark:text-blue-400 font-semibold hover:underline">
                En créer un
              </Link>
            </p>
          </div>
        </section>
      </PublicLayout>
    );
  }

  const statut = STATUTS[profil?.statut ?? "en_attente"] ?? STATUTS.en_attente;
  const typeInfo = TYPES[profil?.typeMembre ?? "membre"] ?? TYPES.membre;
  const numero = `AJIHAD-${String(user?.id ?? 0).padStart(5, "0")}`;
  const annee = user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();

  return (
    <PublicLayout>
      <SEOHead title="Espace membre" description="Votre espace personnel AJIHAD." />
      <div className="bg-[#F6F8FB] dark:bg-gray-900 py-6 sm:py-10 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Bandeau d'identité */}
          {/* Bandeau d'identité. Les pastilles gardent la teinte claire sur fond
              foncé : le composant Pastille est prévu pour des surfaces claires,
              l'y plaquer ici donnerait un contraste trop faible. */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#042C53] via-[#0d4278] to-[#185FA5] rounded-2xl p-5 sm:p-7 text-white mb-6 shadow-sm">
            <div
              className="absolute -right-16 -top-20 w-64 h-64 rounded-full bg-white/[0.04] pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-white/10 ring-1 ring-white/15 flex items-center justify-center font-bold text-xl flex-shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase() || "M"}
                </div>
                <div className="min-w-0">
                  <p className="text-blue-100 text-xs font-semibold uppercase tracking-wide mb-0.5">
                    Espace membre
                  </p>
                  <h1 className="text-xl sm:text-2xl font-bold truncate leading-tight">
                    {user?.name || "Membre AJIHAD"}
                  </h1>
                  <p className="text-blue-100/95 text-sm truncate mt-0.5">{user?.email}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span className="inline-flex items-center gap-1.5 text-xs bg-white/10 ring-1 ring-white/15 px-2.5 py-1 rounded-full">
                      <typeInfo.icon className="w-3 h-3" aria-hidden="true" /> {typeInfo.label}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs bg-white/10 ring-1 ring-white/15 px-2.5 py-1 rounded-full font-mono">
                      {numero}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => logout()}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 ring-1 ring-white/15 rounded-xl text-sm font-semibold transition-colors flex-shrink-0">
                <LogOut className="w-4 h-4" aria-hidden="true" /> Déconnexion
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">
            {/* Navigation : barre défilante sur mobile, colonne sur grand écran */}
            {/* min-w-0 : sans cela l'élément de grille prend la largeur de ses
                onglets (min-width:auto) au lieu de laisser défiler l'intérieur. */}
            <nav className="lg:col-span-1 min-w-0" aria-label="Navigation de l'espace membre">
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-4 px-4 lg:mx-0 lg:px-0">
                {ONGLETS.map(o => (
                  <button key={o.id} onClick={() => setOnglet(o.id)}
                    aria-current={onglet === o.id ? "page" : undefined}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm transition-all whitespace-nowrap flex-shrink-0 lg:w-full ${
                      onglet === o.id
                        ? "bg-[#185FA5] text-white shadow-sm font-semibold ring-1 ring-[#185FA5]"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white border border-gray-200/70 dark:border-gray-700"
                    }`}>
                    <o.icon className="w-4 h-4 flex-shrink-0" />
                    {o.label}
                    {o.id === "notifications" && nonLues > 0 && (
                      <span
                        className={`ml-auto min-w-[1.25rem] text-center text-[11px] font-bold px-1.5 py-0.5 rounded-full leading-tight ${
                          onglet === o.id ? "bg-white text-[#185FA5]" : "bg-[#B64926] text-white"
                        }`}
                        aria-label={`${nonLues} non lue${nonLues > 1 ? "s" : ""}`}
                      >
                        {nonLues}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </nav>

            <div className="lg:col-span-3 min-w-0 space-y-6">

              {/* ---------------- Tableau de bord ---------------- */}
              {onglet === "accueil" && (
                <>
                  <Section titre={`Bonjour ${user?.name?.split(" ")[0] ?? ""}`.trim()}
                    description="L'essentiel de votre compte AJIHAD.">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Tuile icone={CheckCircle} couleur="#185FA5" libelle="Statut">
                        <Pastille ton={tonDuStatut(profil?.statut ?? "en_attente")} taille="sm">
                          {statut.label}
                        </Pastille>
                      </Tuile>
                      <Tuile icone={FileText} couleur="#4DBFBF" libelle="Documents">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {documents?.length ?? 0} disponible{(documents?.length ?? 0) > 1 ? "s" : ""}
                        </p>
                      </Tuile>
                      <Tuile icone={Bell} couleur="#B64926" libelle="Notifications">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {nonLues > 0 ? `${nonLues} non lue${nonLues > 1 ? "s" : ""}` : "À jour"}
                        </p>
                      </Tuile>
                    </div>

                    {!profil && (
                      <div className="mt-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                        <p className="text-amber-800 dark:text-amber-300 text-sm font-semibold mb-1">
                          Aucune fiche membre rattachée
                        </p>
                        <p className="text-amber-700 dark:text-amber-400 text-sm leading-relaxed">
                          Votre compte existe, mais l'équipe AJIHAD n'a pas encore créé votre fiche de membre.
                          Déposez une candidature pour lancer la démarche.
                        </p>
                        <Link href="/s-impliquer" className="inline-flex items-center gap-1.5 mt-3 text-amber-900 dark:text-amber-200 text-sm font-semibold hover:underline">
                          Devenir membre <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    )}
                  </Section>

                  {/* Complétude du profil : ce qu'il reste à renseigner */}
                  {profil && completude.pourcentage < 100 && (
                    <Section titre="Complétez votre profil"
                      description="Ces informations aident l'équipe à vous solliciter sur les activités qui vous correspondent.">
                      <div className="flex items-center gap-4 mb-5">
                        <div className="flex-1">
                          <div className="h-2.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
                            <div className="h-full rounded-full bg-[#185FA5] transition-all duration-500"
                              style={{ width: `${completude.pourcentage}%` }}
                              role="progressbar" aria-valuenow={completude.pourcentage}
                              aria-valuemin={0} aria-valuemax={100}
                              aria-label="Complétude du profil" />
                          </div>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white text-sm tabular-nums">
                          {completude.pourcentage} %
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-5">
                        {completude.manquants.map(c => (
                          <Pastille key={c.cle} ton="attention">{c.libelle}</Pastille>
                        ))}
                      </div>
                      <button onClick={() => setOnglet("profil")}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:bg-[#042C53] transition-colors">
                        Compléter maintenant <ChevronRight className="w-4 h-4" />
                      </button>
                    </Section>
                  )}

                  {/* Aperçu de la carte, pour éviter un aller-retour d'onglet */}
                  {profil && (
                    <Section titre="Ma carte de membre"
                      description="Votre carte officielle, à présenter lors des activités.">
                      <div className="flex flex-col lg:flex-row items-center gap-6">
                        <div className="w-full max-w-xs">
                          <CarteMembre donnees={{
                            nom: user?.name ?? "Membre AJIHAD",
                            email: user?.email ?? null,
                            numero, openId: user?.openId ?? "", annee,
                            typeMembre: profil?.typeMembre, statut: profil?.statut,
                          }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                            {texte("carte_note_verso")}
                          </p>
                          <button onClick={() => setOnglet("carte")}
                            className="flex items-center gap-2 text-[#185FA5] dark:text-blue-400 text-sm font-semibold hover:gap-3 transition-all">
                            Voir et imprimer ma carte <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </Section>
                  )}

                  <Section titre="Raccourcis">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Ma carte", icon: CreditCard, id: "carte" },
                        { label: "Mes documents", icon: FileText, id: "documents" },
                        { label: "Mon profil", icon: User, id: "profil" },
                        { label: "Sécurité", icon: KeyRound, id: "securite" },
                      ].map(r => (
                        <button key={r.id} onClick={() => setOnglet(r.id)}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl bg-[#F6F8FB] dark:bg-gray-700/50 hover:shadow-sm hover:-translate-y-0.5 transition-all text-center">
                          <r.icon className="w-5 h-5 text-[#185FA5]" />
                          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{r.label}</span>
                        </button>
                      ))}
                    </div>
                  </Section>
                </>
              )}

              {/* ---------------- Profil ---------------- */}
              {onglet === "profil" && (
                <Section titre="Mon profil"
                  description="Vous tenez à jour vos coordonnées. Les informations verrouillées relèvent de l'administration AJIHAD.">
                  <form onSubmit={e => { e.preventDefault(); majProfil.mutate(formProfil); }} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ChampVerrouille label="Nom complet" valeur={user?.name ?? ""} />
                      <ChampVerrouille label="Adresse e-mail" valeur={user?.email ?? ""} />
                      <ChampVerrouille label="Catégorie" valeur={typeInfo.label} />
                      <ChampVerrouille label="Statut" valeur={statut.label} />
                      <ChampVerrouille label="Commission" valeur={profil?.commission ?? "Non affecté"} />
                      <ChampVerrouille label="Département" valeur={profil?.departement ?? ""} />
                    </div>

                    <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                        Informations que vous gérez
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { id: "telephone", label: "Téléphone", type: "tel" },
                          { id: "commune", label: "Commune", type: "text" },
                          { id: "niveauEtude", label: "Niveau d'étude", type: "text" },
                          { id: "adresse", label: "Adresse", type: "text" },
                        ].map(c => (
                          <div key={c.id}>
                            <label htmlFor={c.id} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                              {c.label}
                            </label>
                            <input id={c.id} type={c.type} className={champ}
                              value={(formProfil as any)[c.id]}
                              onChange={e => setFormProfil(f => ({ ...f, [c.id]: e.target.value }))} />
                          </div>
                        ))}
                        <div className="sm:col-span-2">
                          <label htmlFor="competences" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Compétences
                          </label>
                          <textarea id="competences" rows={3} className={`${champ} resize-none`}
                            placeholder="Ce que vous savez faire et pouvez mettre au service d'AJIHAD."
                            value={formProfil.competences}
                            onChange={e => setFormProfil(f => ({ ...f, competences: e.target.value }))} />
                        </div>
                      </div>
                    </div>

                    <button type="submit" disabled={majProfil.isPending || !profil}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:bg-[#042C53] transition-colors disabled:opacity-60">
                      <Save className="w-4 h-4" />
                      {majProfil.isPending ? "Enregistrement..." : "Enregistrer mes informations"}
                    </button>
                    {!profil && (
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        L'enregistrement sera possible dès qu'une fiche membre sera rattachée à votre compte.
                      </p>
                    )}
                  </form>
                </Section>
              )}

              {/* ---------------- Carte ---------------- */}
              {onglet === "carte" && (
                <Section titre="Ma carte de membre"
                  description="Présentez-la lors des activités AJIHAD. Son apparence est définie par l'association.">
                  <div className="flex flex-col items-center gap-7">
                    <CarteMembre donnees={{
                      nom: user?.name ?? "Membre AJIHAD",
                      email: user?.email ?? null,
                      numero,
                      openId: user?.openId ?? "",
                      annee,
                      typeMembre: profil?.typeMembre,
                      statut: profil?.statut,
                    }} />

                    <p className="text-gray-600 dark:text-gray-400 text-sm text-center max-w-md leading-relaxed">
                      {texte("carte_note_verso")}
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:bg-[#042C53] transition-colors">
                        <Download className="w-4 h-4" /> Imprimer ou enregistrer en PDF
                      </button>
                      <Link href={`/verifier-membre?id=${user?.openId}&num=${numero}`}
                        className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <ExternalLink className="w-4 h-4" /> Vérifier ma carte
                      </Link>
                    </div>
                  </div>
                </Section>
              )}

              {/* ---------------- Documents ---------------- */}
              {onglet === "documents" && (
                <Section titre="Documents" description="Ressources publiques et documents réservés aux membres.">
                  {!documents || documents.length === 0 ? (
                    <EtatVide
                      icone={Inbox}
                      titre="Aucun document"
                      description="Les documents que l'association met à disposition de ses membres apparaîtront ici."
                    />
                  ) : (
                    <div className="space-y-3">
                      {documents.map((d: any) => (
                        <div key={d.id} className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#F6F8FB] dark:bg-gray-700/50">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-[#185FA5]" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{d.titre}</h3>
                              <p className="text-gray-500 dark:text-gray-400 text-xs">
                                {[d.fileType?.toUpperCase(), d.version, d.visibilite === "membres" ? "Réservé aux membres" : null]
                                  .filter(Boolean).join(" · ")}
                              </p>
                            </div>
                          </div>
                          {d.fileUrl ? (
                            <a href={d.fileUrl} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-2 bg-[#185FA5] text-white rounded-lg text-xs font-semibold hover:bg-[#042C53] transition-colors flex-shrink-0">
                              <Download className="w-3.5 h-3.5" /> Ouvrir
                            </a>
                          ) : (
                            <span className="text-gray-400 text-xs flex-shrink-0">Indisponible</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              )}

              {/* ---------------- Notifications ---------------- */}
              {onglet === "notifications" && (
                <Section titre="Notifications"
                  description={nonLues > 0 ? `${nonLues} message${nonLues > 1 ? "s" : ""} non lu${nonLues > 1 ? "s" : ""}.` : "Vous êtes à jour."}>
                  {!notifications || notifications.length === 0 ? (
                    <EtatVide
                      icone={Bell}
                      titre="Aucune notification"
                      description="Vous serez prévenu ici du suivi de votre dossier et des annonces de l'association."
                    />
                  ) : (
                    <div className="space-y-3">
                      {notifications.map((n: any) => (
                        <div key={n.id}
                          className={`p-4 rounded-xl border transition-colors ${
                            n.estLu
                              ? "bg-[#F6F8FB] dark:bg-gray-700/50 border-gray-100 dark:border-gray-700"
                              : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                          }`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className={`font-semibold text-sm mb-1 ${n.estLu ? "text-gray-700 dark:text-gray-300" : "text-blue-900 dark:text-blue-200"}`}>
                                {n.titre}
                              </h3>
                              {n.message && (
                                <p className={`text-sm leading-relaxed ${n.estLu ? "text-gray-500 dark:text-gray-400" : "text-blue-800 dark:text-blue-300"}`}>
                                  {n.message}
                                </p>
                              )}
                              <p className="text-gray-400 dark:text-gray-500 text-xs mt-2 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {new Date(n.createdAt).toLocaleDateString("fr-HT", { day: "numeric", month: "long", year: "numeric" })}
                              </p>
                            </div>
                            {!n.estLu && (
                              <button onClick={() => marquerLue.mutate({ id: n.id })}
                                className="text-xs font-semibold text-[#185FA5] dark:text-blue-400 hover:underline whitespace-nowrap flex-shrink-0">
                                Marquer comme lu
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Section>
              )}

              {/* ---------------- Sécurité ---------------- */}
              {onglet === "securite" && (
                <Section titre="Sécurité" description="Votre mot de passe vous est propre et n'est connu de personne d'autre.">
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      if (formMdp.nouveau !== formMdp.confirmation) {
                        toast.error("La confirmation ne correspond pas au nouveau mot de passe.");
                        return;
                      }
                      changerMdp.mutate({ actuel: formMdp.actuel, nouveau: formMdp.nouveau });
                    }}
                    className="space-y-4 max-w-md"
                  >
                    {[
                      { id: "actuel", label: "Mot de passe actuel", auto: "current-password" },
                      { id: "nouveau", label: "Nouveau mot de passe", auto: "new-password" },
                      { id: "confirmation", label: "Confirmer le nouveau mot de passe", auto: "new-password" },
                    ].map(c => (
                      <div key={c.id}>
                        <label htmlFor={c.id} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {c.label}
                        </label>
                        <input id={c.id} type="password" required autoComplete={c.auto} className={champ}
                          value={(formMdp as any)[c.id]}
                          onChange={e => setFormMdp(f => ({ ...f, [c.id]: e.target.value }))} />
                      </div>
                    ))}
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      Au moins 10 caractères, dont une lettre et un chiffre.
                    </p>
                    <button type="submit" disabled={changerMdp.isPending}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#185FA5] text-white rounded-xl text-sm font-semibold hover:bg-[#042C53] transition-colors disabled:opacity-60">
                      <KeyRound className="w-4 h-4" />
                      {changerMdp.isPending ? "Modification..." : "Changer mon mot de passe"}
                    </button>
                  </form>

                  <div className="mt-7 pt-6 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-start gap-3">
                      <Shield className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">
                        Votre compte membre est indépendant de l'administration du site. Un administrateur gère
                        votre fiche, mais ne peut ni voir ni modifier votre mot de passe.
                      </p>
                    </div>
                  </div>
                </Section>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
