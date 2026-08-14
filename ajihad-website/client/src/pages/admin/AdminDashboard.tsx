import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Users, FolderOpen, MessageSquare, BarChart3, ChevronRight, Heart,
  UserCheck, Handshake, Inbox, Newspaper, Settings,
} from "lucide-react";
import { Link } from "wouter";
import AdminLayout from "./AdminLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { cheminAutorise } from "@shared/roles";
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList,
} from "recharts";
import { TITRE_CARTE, TITRE_PAGE, TITRE_SECTION } from "@/lib/typographie";

/**
 * Palettes catégorielles validées (bande de clarté, plancher de chroma,
 * séparation daltonisme et contraste sur la surface) pour chaque thème.
 * Le mode sombre n'est pas une inversion : ce sont des pas distincts des mêmes teintes.
 */
const PALETTE = {
  light: ["#185FA5", "#B64926", "#00A39B", "#C67A0C"],
  dark: ["#3E86D6", "#DD6B3E", "#00A99F", "#C4870F"],
} as const;

const NEUTRE = { light: "#94A3B8", dark: "#64748B" };

const LABELS_TYPE: Record<string, string> = {
  membre: "Membre",
  benevole: "Bénévole",
  ambassadeur: "Ambassadeur",
  projefa: "PROJEFA",
};

const LABELS_STATUT: Record<string, string> = {
  brouillon: "Brouillon",
  declaree: "Déclarée",
  en_attente_verification: "À vérifier",
  confirmee: "Confirmée",
  annulee: "Annulée",
  recue_nature: "Reçue (nature)",
  remboursee: "Remboursée",
};

/** Files d'attente affichées en tête : ce qui demande une décision. */
const FILES = [
  { cle: "candidatures", libelle: "Candidatures à examiner", href: "/admin/candidatures", icon: UserCheck, couleur: "#185FA5" },
  { cle: "partenariats", libelle: "Demandes de partenariat", href: "/admin/partenariats", icon: Handshake, couleur: "#4DBFBF" },
  { cle: "contributions", libelle: "Contributions à confirmer", href: "/admin/contributions", icon: Heart, couleur: "#B64926" },
  { cle: "messages", libelle: "Messages non traités", href: "/admin/soumissions", icon: MessageSquare, couleur: "#C67A0C" },
];

const TYPES_EVENEMENT = {
  candidature: { libelle: "Candidature", icon: UserCheck, couleur: "#185FA5" },
  partenariat: { libelle: "Partenariat", icon: Handshake, couleur: "#4DBFBF" },
  contribution: { libelle: "Contribution", icon: Heart, couleur: "#B64926" },
  message: { libelle: "Message", icon: MessageSquare, couleur: "#C67A0C" },
} as const;

/** Ancienneté en clair : « il y a 3 jours » se lit mieux qu'une date brute. */
function depuis(date: Date | string): string {
  const ms = Date.now() - new Date(date).getTime();
  const jours = Math.floor(ms / 86400000);
  if (jours === 0) {
    const heures = Math.floor(ms / 3600000);
    if (heures === 0) return "à l'instant";
    return `il y a ${heures} h`;
  }
  if (jours === 1) return "hier";
  if (jours < 31) return `il y a ${jours} j`;
  return new Date(date).toLocaleDateString("fr-HT", { day: "numeric", month: "short" });
}

const MOIS_COURTS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

function formatMois(cle: string): string {
  const [annee, mois] = cle.split("-");
  const index = Number(mois) - 1;
  return `${MOIS_COURTS[index] ?? mois} ${annee.slice(2)}`;
}

/** Encadré de graphique : titre, sous-titre et zone de tracé de hauteur fixe. */
function Carte({
  titre, sousTitre, children, vide,
}: { titre: string; sousTitre: string; children: React.ReactNode; vide: boolean }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
      <h2 className={TITRE_CARTE}>{titre}</h2>
      <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 mb-4">{sousTitre}</p>
      {vide ? (
        <div className="h-[220px] flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
          Pas encore de données à visualiser.
        </div>
      ) : (
        <div className="h-[220px]">{children}</div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const sombre = theme === "dark";
  const couleurs = sombre ? PALETTE.dark : PALETTE.light;
  const neutre = sombre ? NEUTRE.dark : NEUTRE.light;

  // Grille et axes restent en retrait : ils situent, ils n'attirent pas l'œil.
  const encre = sombre ? "#9CA3AF" : "#6B7280";
  const grille = sombre ? "#374151" : "#E5E7EB";
  const infobulleStyle = {
    backgroundColor: sombre ? "#1F2937" : "#FFFFFF",
    border: `1px solid ${grille}`,
    borderRadius: "0.75rem",
    fontSize: "0.75rem",
    color: sombre ? "#F9FAFB" : "#111827",
  };

  const { data: overview } = trpc.admin.overview.useQuery();
  const { data: fil } = trpc.admin.filActivite.useQuery();

  const cartes = [
    { titre: "Membres actifs", valeur: overview?.stats?.membresActifs ?? "—", icon: Users, color: "#185FA5", href: "/admin/membres" },
    { titre: "Projets en cours", valeur: overview?.stats?.projetsActifs ?? "—", icon: FolderOpen, color: "#4DBFBF", href: "/admin/projets" },
    { titre: "Soumissions reçues", valeur: overview?.stats?.formulairesNouveaux ?? "—", icon: MessageSquare, color: "#B64926", href: "/admin/soumissions" },
    { titre: "Candidatures en attente", valeur: overview?.stats?.candidaturesEnAttente ?? "—", icon: Heart, color: "#F4A022", href: "/admin/candidatures" },
  ];

  const donneesCandidatures = useMemo(
    () => (overview?.candidaturesParType ?? []).map(d => ({
      label: LABELS_TYPE[d.type] ?? d.type,
      total: d.count,
    })),
    [overview]
  );

  // Au-delà de quatre parts, le reste est regroupé : on ne génère jamais de teinte supplémentaire.
  const donneesContributions = useMemo(() => {
    const brut = (overview?.contributionsParStatut ?? [])
      .map(d => ({ label: LABELS_STATUT[d.statut] ?? d.statut, total: d.count }))
      .filter(d => d.total > 0)
      .sort((a, b) => b.total - a.total);
    if (brut.length <= 4) return brut;
    const autres = brut.slice(4).reduce((somme, d) => somme + d.total, 0);
    return [...brut.slice(0, 4), { label: "Autres", total: autres }];
  }, [overview]);

  const donneesActivite = useMemo(
    () => (overview?.activiteMensuelle ?? []).map(d => ({
      mois: formatMois(d.mois),
      Candidatures: d.candidatures,
      Contacts: d.contacts,
    })),
    [overview]
  );

  const totalContributions = donneesContributions.reduce((s, d) => s + d.total, 0);

  const totalATraiter = useMemo(
    () => Object.values(fil?.aTraiter ?? {}).reduce((s: number, n) => s + Number(n), 0),
    [fil]
  );

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className={`${TITRE_PAGE} mb-1`}>Tableau de bord</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Bienvenue dans l'espace d'administration AJIHAD.</p>
        </div>

        {/* File d'attente — ce qui attend une décision, avant tout chiffre.
            Un tableau de bord doit d'abord dire quoi faire, pas seulement compter. */}
        {totalATraiter > 0 && (
          <section aria-labelledby="a-traiter" className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-2 h-2 rounded-full bg-[#B64926] animate-pulse" aria-hidden="true" />
              <h2 id="a-traiter" className={TITRE_SECTION}>
                {totalATraiter} élément{totalATraiter > 1 ? "s" : ""} en attente de traitement
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {FILES.filter(f => (fil?.aTraiter as any)?.[f.cle] > 0).map(f => (
                <Link key={f.cle} href={f.href}
                  className="flex items-center gap-3 p-4 rounded-xl bg-[#F6F8FB] dark:bg-gray-700/50 hover:shadow-sm hover:-translate-y-0.5 transition-all">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${f.couleur}15` }}>
                    <f.icon className="w-5 h-5" style={{ color: f.couleur }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xl font-extrabold text-gray-900 dark:text-white leading-none">
                      {(fil?.aTraiter as any)?.[f.cle]}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs mt-1 leading-snug break-words">{f.libelle}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Cartes statistiques */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cartes.map((carte, i) => (
            <Link key={i} href={carte.href} className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${carte.color}15` }}>
                  <carte.icon className="w-5 h-5" style={{ color: carte.color }} />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600" />
              </div>
              <div>
                <div className="text-2xl font-extrabold text-gray-900 dark:text-white">{carte.valeur}</div>
                <div className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">{carte.titre}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Candidatures par type — série unique : pas de légende, valeurs en clair */}
          <Carte titre="Candidatures par type" sousTitre="Toutes périodes confondues" vide={donneesCandidatures.length === 0}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={donneesCandidatures} margin={{ top: 16, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid stroke={grille} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: encre, fontSize: 11 }} tickLine={false} axisLine={{ stroke: grille }} />
                <YAxis allowDecimals={false} tick={{ fill: encre, fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={infobulleStyle} cursor={{ fill: sombre ? "#37415155" : "#E5E7EB55" }} />
                <Bar dataKey="total" name="Candidatures" fill={couleurs[0]} radius={[4, 4, 0, 0]} maxBarSize={48}>
                  <LabelList dataKey="total" position="top" fill={encre} fontSize={11} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Carte>

          {/* Contributions par statut — identité : légende chiffrée à côté de l'anneau */}
          <Carte titre="Contributions par statut" sousTitre={`${totalContributions} contribution(s) enregistrée(s)`} vide={donneesContributions.length === 0}>
            <div className="h-full flex items-center gap-4">
              <div className="w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donneesContributions} dataKey="total" nameKey="label"
                      innerRadius="55%" outerRadius="85%" paddingAngle={2} stroke="none">
                      {donneesContributions.map((d, i) => (
                        <Cell key={d.label} fill={d.label === "Autres" ? neutre : couleurs[i % couleurs.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={infobulleStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="w-1/2 space-y-2">
                {donneesContributions.map((d, i) => (
                  <li key={d.label} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: d.label === "Autres" ? neutre : couleurs[i % couleurs.length] }} />
                    <span className="text-gray-600 dark:text-gray-300 truncate">{d.label}</span>
                    <span className="text-gray-900 dark:text-white font-semibold ml-auto">{d.total}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Carte>
        </div>

        {/* Activité mensuelle */}
        <Carte titre="Activité des 6 derniers mois" sousTitre="Candidatures et messages de contact reçus par mois" vide={donneesActivite.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={donneesActivite} margin={{ top: 16, right: 16, left: -20, bottom: 0 }}>
              <CartesianGrid stroke={grille} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mois" tick={{ fill: encre, fontSize: 11 }} tickLine={false} axisLine={{ stroke: grille }} />
              <YAxis allowDecimals={false} tick={{ fill: encre, fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={infobulleStyle} />
              <Line type="monotone" dataKey="Candidatures" stroke={couleurs[0]} strokeWidth={2}
                dot={{ r: 4, strokeWidth: 0, fill: couleurs[0] }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="Contacts" stroke={couleurs[1]} strokeWidth={2}
                dot={{ r: 4, strokeWidth: 0, fill: couleurs[1] }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </Carte>

        {/* Légende du graphique en ligne : l'identité ne repose jamais sur la seule couleur */}
        {donneesActivite.length > 0 && (
          <div className="flex flex-wrap items-center gap-5 -mt-4">
            {["Candidatures", "Contacts"].map((serie, i) => (
              <span key={serie} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                <span className="w-4 h-0.5 rounded-full" style={{ backgroundColor: couleurs[i] }} />
                {serie}
              </span>
            ))}
          </div>
        )}

        {/* Équivalent tabulaire des graphiques, pour lecteurs d'écran */}
        <table className="sr-only">
          <caption>Activité mensuelle : candidatures et contacts reçus</caption>
          <thead>
            <tr><th scope="col">Mois</th><th scope="col">Candidatures</th><th scope="col">Contacts</th></tr>
          </thead>
          <tbody>
            {donneesActivite.map(d => (
              <tr key={d.mois}><th scope="row">{d.mois}</th><td>{d.Candidatures}</td><td>{d.Contacts}</td></tr>
            ))}
          </tbody>
        </table>

        {/* Fil d'activité — les quatre canaux réunis chronologiquement */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h2 className={TITRE_SECTION}>Activité récente</h2>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                Candidatures, partenariats, contributions et messages
              </p>
            </div>
          </div>
          {!fil?.evenements?.length ? (
            <div className="p-10 text-center text-gray-400 dark:text-gray-500">
              <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Rien n'est encore arrivé.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {fil.evenements.map(e => {
                const t = TYPES_EVENEMENT[e.type];
                return (
                  <li key={`${e.type}-${e.id}`}>
                    <Link href={e.lien} className="flex items-center gap-3.5 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${t.couleur}15` }}>
                        <t.icon className="w-4 h-4" style={{ color: t.couleur }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{e.titre}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                          {t.libelle}{e.detail ? ` · ${e.detail}` : ""}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="block text-xs font-medium text-gray-600 dark:text-gray-300">{e.statut}</span>
                        <span className="block text-gray-400 dark:text-gray-500 text-xs mt-0.5">{depuis(e.createdAt)}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Actions rapides */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5">
          <h2 className={`${TITRE_SECTION} mb-4`}>Actions rapides</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { href: "/admin/actualites", label: "Publier une actualité", icon: Newspaper, color: "#185FA5" },
              { href: "/admin/membres", label: "Créer un accès membre", icon: Users, color: "#4DBFBF" },
              { href: "/admin/contenus", label: "Modifier le site", icon: BarChart3, color: "#B64926" },
              { href: "/admin/parametres", label: "Configuration", icon: Settings, color: "#C67A0C" },
            ].filter(action => cheminAutorise(user?.role, action.href)).map((action, i) => (
              <Link key={i} href={action.href} className="flex flex-col items-center gap-2 p-4 bg-[#F6F8FB] dark:bg-gray-700 rounded-xl hover:shadow-sm transition-all duration-200 hover:-translate-y-0.5 text-center">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${action.color}15` }}>
                  <action.icon className="w-5 h-5" style={{ color: action.color }} />
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
