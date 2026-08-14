import { useState } from "react";
import { Link, Redirect, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { CONNEXION_ADMIN } from "@/const";
import { LIBELLES_ROLES, cheminAutorise, peutAccederAdmin } from "@shared/roles";
import {
  LayoutDashboard, Users, FolderOpen, Newspaper, BarChart3, Handshake,
  FileText, MessageSquare, Settings, LogOut, ChevronDown, Menu, X,
  Shield, ShieldCheck, Bell, BookOpen, Heart, UserCheck, ClipboardList, LayoutList
} from "lucide-react";
import { TITRE_CARTE, TITRE_PAGE } from "@/lib/typographie";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Tableau de bord", exact: true },
  { href: "/admin/projets", icon: FolderOpen, label: "Projets" },
  { href: "/admin/actualites", icon: Newspaper, label: "Actualités" },
  { href: "/admin/indicateurs", icon: BarChart3, label: "Indicateurs d'impact" },
  { href: "/admin/membres", icon: Users, label: "Membres" },
  { href: "/admin/candidatures", icon: UserCheck, label: "Candidatures" },
  { href: "/admin/contributions", icon: Heart, label: "Contributions" },
  { href: "/admin/partenaires", icon: Handshake, label: "Partenaires" },
  { href: "/admin/partenariats", icon: Handshake, label: "Demandes de partenariat" },
  { href: "/admin/ressources", icon: FileText, label: "Documents & Ressources" },
  { href: "/admin/soumissions", icon: MessageSquare, label: "Soumissions de formulaires" },
  { href: "/admin/acces", icon: ShieldCheck, label: "Accès & rôles" },
  { href: "/admin/audit", icon: ClipboardList, label: "Journal d'audit" },
  { href: "/admin/contenus", icon: LayoutList, label: "Contenus du site" },
  { href: "/admin/parametres", icon: Settings, label: "Paramètres" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#185FA5] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  // Non connecté : on envoie vers l'écran de connexion de l'administration,
  // pas vers celui de l'espace membre. Les deux portes restent distinctes.
  if (!isAuthenticated) {
    // `location` vaut déjà "/admin/connexion" quand on y est : on ne se
    // redirige pas vers soi-même.
    if (location.startsWith(CONNEXION_ADMIN)) return <>{children}</>;
    return <Redirect to={`${CONNEXION_ADMIN}?retour=${encodeURIComponent(location)}`} replace />;
  }

  // Connecté, mais sans les droits : message explicite, et sortie vers
  // l'espace qui lui correspond plutôt qu'un cul-de-sac.
  if (!peutAccederAdmin(user?.role)) {
    return (
      <div className="min-h-screen bg-[#F6F8FB] dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
          <h1 className={`${TITRE_PAGE} mb-2`}>Accès non autorisé</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Vous êtes connecté en tant que <strong>{user?.email}</strong>, mais ce compte n'a pas
            les droits d'administration.
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Contactez un responsable AJIHAD si vous pensez qu'il s'agit d'une erreur.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/espace-membre" className="flex-1 btn-primary-ajihad justify-center py-3">
              Mon espace membre
            </Link>
            <button onClick={() => logout()}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Changer de compte
            </button>
          </div>
        </div>
      </div>
    );
  }

  // La visibilité du menu ne suffit pas : un rôle peut aussi saisir une URL
  // sensible directement. Le serveur protège les mutations, et cette garde
  // évite maintenant d'afficher une page vide ou en erreur côté interface.
  if (!cheminAutorise(user?.role, location)) {
    return <Redirect to="/admin" replace />;
  }

  // Chaque rôle ne voit que ses sections : un éditeur de communication n'a
  // rien à faire dans le journal d'audit. Les administrateurs voient tout.
  const sectionsVisibles = navItems.filter(item => cheminAutorise(user?.role, item.href));

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location === href;
    return location.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] dark:bg-gray-900 flex">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#042C53] text-white z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 lg:static lg:z-auto`}>
        {/* Logo */}
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-[#4DBFBF]" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white">AJIHAD</span>
              <p className="text-blue-300/70 text-xs">Administration</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto" aria-label="Navigation administration">
          <ul className="space-y-1">
            {sectionsVisibles.map((item) => (
              <li key={item.href}>
                <Link href={item.href}
                  aria-current={isActive(item.href, item.exact) ? "page" : undefined}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${isActive(item.href, item.exact) ? "bg-white/15 text-white" : "text-blue-200/70 hover:bg-white/10 hover:text-white"}`}>
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#185FA5] flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name || "Administrateur"}</p>
              <p className="text-blue-300/70 text-xs truncate">{LIBELLES_ROLES[(user?.role ?? "user") as keyof typeof LIBELLES_ROLES] ?? user?.role}</p>
            </div>
          </div>
          <button onClick={() => logout()} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-300/80 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm">
            <LogOut className="w-4 h-4" /> Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors" aria-label="Ouvrir le menu">
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="flex-1 lg:flex-none">
            {/* Repère de navigation, pas un titre : il répète le <h1> de la page
                et le précède dans le DOM. En faire un <h2> plaçait une
                sous-section avant le titre de page pour les lecteurs d'écran. */}
            <div className={`${TITRE_CARTE} hidden lg:block`}>
              {sectionsVisibles.find(n => isActive(n.href, n.exact))?.label || "Administration"}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-gray-500 dark:text-gray-400 hover:text-[#185FA5] transition-colors hidden sm:block">
              ← Voir le site
            </Link>
            <div className="w-8 h-8 rounded-full bg-[#185FA5] flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
