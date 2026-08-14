import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Moon, Sun, Heart, ChevronDown, LogIn, Shield } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { useConfigSite } from "@/hooks/useConfigSite";
import { peutAccederAdmin } from "@shared/roles";

const TOUS_LES_LIENS = [
  { label: "Accueil", href: "/" },
  {
    label: "À propos",
    href: "/a-propos",
    children: [
      { label: "Notre histoire", href: "/a-propos#histoire" },
      { label: "Mission & Vision", href: "/a-propos#mission" },
      { label: "Valeurs", href: "/a-propos#valeurs" },
      { label: "Gouvernance", href: "/gouvernance" },
      { label: "Notre organisation", href: "/a-propos#equipe" },
    ],
  },
  {
    label: "Nos actions",
    href: "/nos-actions",
    children: [
      { label: "Tous les projets", href: "/nos-actions" },
      { label: "PROJEFA 2026", href: "/projefa-2026" },
      { label: "Reboisement Gonaïves", href: "/nos-actions/reboisement-gonaives" },
      { label: "Bibliothèque de l'Amitié", href: "/nos-actions/bibliotheque-amitie" },
      { label: "AJI CONNECT", href: "/nos-actions/aji-connect" },
    ],
  },
  { label: "Impact", href: "/impact" },
  { label: "Gouvernance", href: "/gouvernance" },
  { label: "Actualités", href: "/actualites" },
  {
    label: "S'impliquer",
    href: "/s-impliquer",
    children: [
      { label: "Devenir membre", href: "/s-impliquer#membre" },
      { label: "Bénévolat", href: "/s-impliquer#benevole" },
      { label: "Ambassadeur", href: "/s-impliquer#ambassadeur" },
      { label: "Partenariat", href: "/s-impliquer#partenariat" },
    ],
  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();
  // Sur mobile les sous-menus sont repliés par défaut : sans cela le panneau
  // dépassait la hauteur de l'écran et couvrait toute la page.
  const [sousMenuMobile, setSousMenuMobile] = useState<string | null>(null);
  const estAdmin = peutAccederAdmin(user?.role);

  // Visibilité pilotée depuis /admin/parametres.
  const { visible } = useConfigSite();
  const navItems = TOUS_LES_LIENS
    .filter(item => item.href !== "/actualites" || visible("afficher_actualites"))
    .map(item =>
      item.children
        ? {
            ...item,
            children: item.children.filter(
              c => !c.href.startsWith("/projefa") || visible("afficher_lien_projefa")
            ),
          }
        : item
    );

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [location]);

  // Panneau mobile ouvert : on fige la page derrière. Sans ce verrou, le
  // contenu continuait de défiler sous le panneau, ce qui donnait l'impression
  // que deux écrans se superposaient. La position de défilement est mémorisée
  // puis restaurée, sinon la fermeture ramenait brutalement en haut de page.
  useEffect(() => {
    if (!mobileOpen) return;

    const y = window.scrollY;
    const largeurBarre = window.innerWidth - document.documentElement.clientWidth;
    const { body } = document;
    const styleInitial = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      paddingRight: body.style.paddingRight,
    };

    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.width = "100%";
    // Compense la disparition de la barre de défilement, qui ferait sauter la
    // mise en page de quelques pixels sur les navigateurs de bureau.
    if (largeurBarre > 0) body.style.paddingRight = `${largeurBarre}px`;

    return () => {
      body.style.position = styleInitial.position;
      body.style.top = styleInitial.top;
      body.style.width = styleInitial.width;
      body.style.paddingRight = styleInitial.paddingRight;
      window.scrollTo(0, y);
    };
  }, [mobileOpen]);

  // Fermeture au clavier : sans cela, un utilisateur au clavier restait
  // prisonnier du panneau.
  useEffect(() => {
    if (!mobileOpen) return;
    const surTouche = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", surTouche);
    return () => window.removeEventListener("keydown", surTouche);
  }, [mobileOpen]);

  // Un lien parent reste actif sur ses sous-pages : /nos-actions couvre
  // /nos-actions/:slug, et PROJEFA 2026 est rattaché à « Nos actions ».
  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    if (href === "/nos-actions") return location.startsWith("/nos-actions") || location.startsWith("/projefa-2026");
    return location === href || location.startsWith(`${href}/`);
  };

  return (
    <>
      <a href="#main-content" className="skip-link">Aller au contenu principal</a>
      <header
        // Décalée sous le bandeau d'annonce quand il est affiché. La variable
        // vaut 0px sinon : la barre reprend alors le haut de l'écran.
        style={{ top: "var(--hauteur-bandeau, 0px)" }}
        className={`fixed left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md"
            : "bg-white dark:bg-gray-900"
        }`}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
              <img
                src={`${import.meta.env.BASE_URL}images/logo-ajihad.png`}
                alt="Logo officiel de l'AJIHAD"
                className="h-10 w-10 object-contain"
                width={40}
                height={40}
              />
              <div className="hidden sm:block">
                <span className="font-extrabold text-lg text-[#185FA5] dark:text-blue-400 leading-none block">
                  AJIHAD
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 leading-none">
                  Inspirer · Former · Agir
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Navigation principale">
              {navItems.map((item) => (
                <div
                  key={item.href}
                  className="relative"
                  onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
                      isActive(item.href)
                        ? "text-[#185FA5] dark:text-blue-400 font-bold border-b-2 border-[#185FA5] dark:border-blue-400 rounded-b-none"
                        : "font-medium text-gray-700 dark:text-gray-300 hover:text-[#185FA5] dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                    }`}
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    {item.label}
                    {item.children && <ChevronDown className="w-3.5 h-3.5 opacity-60" />}
                  </Link>

                  {/* Dropdown */}
                  {item.children && openDropdown === item.label && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-[#185FA5] dark:hover:text-blue-400 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Auth */}
              {isAuthenticated ? (
                <>
                  {estAdmin && (
                    <Link
                      href="/admin"
                      className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-[#185FA5] dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5" />
                      Administration
                    </Link>
                  )}
                  <Link
                    href="/espace-membre"
                    className="hidden sm:flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-[#185FA5] dark:hover:text-blue-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-[#185FA5] text-white flex items-center justify-center text-xs font-bold">
                      {user?.name?.charAt(0)?.toUpperCase() || "M"}
                    </div>
                    <span className="hidden md:inline">Mon espace</span>
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => startLogin()}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 border border-[#185FA5] text-[#185FA5] dark:text-blue-400 dark:border-blue-400 text-sm font-semibold rounded-lg hover:bg-[#185FA5] hover:text-white dark:hover:bg-blue-400 dark:hover:text-gray-900 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Se connecter
                </button>
              )}

              {/* CTA Soutenir — reste visible sur mobile et tablette.
                  Le libellé se raccourcit sous 640px pour tenir dans l'en-tête. */}
              {visible("afficher_bouton_soutenir") && (
              <Link
                href="/soutenir"
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#B64926] hover:bg-[#94391C] text-white text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
              >
                <Heart className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="sm:hidden">Soutenir</span>
                <span className="hidden sm:inline">Soutenir AJIHAD</span>
              </Link>
              )}

              {/* Mobile burger */}
              <button
                className="lg:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? "Fermer la navigation mobile" : "Ouvrir la navigation mobile"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation mobile — panneau latéral. Il n'occupe ni toute la
            largeur (80 % au plus, plafonné à 20rem) ni tout l'écran : la page
            reste visible derrière, et un appui à côté referme le menu. */}
        {mobileOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}
        {mobileOpen && (
          <div
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-nav-title"
            className="lg:hidden fixed top-0 right-0 z-50 h-full w-4/5 max-w-[20rem] bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto overscroll-contain"
          >
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-gray-800">
              <span id="mobile-nav-title" className="font-extrabold text-[#185FA5] dark:text-blue-400">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Fermer la navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="px-3 py-3 space-y-0.5" aria-label="Navigation mobile">
              {navItems.map((item) => {
                const deplie = sousMenuMobile === item.label;
                return (
                  <div key={item.href}>
                    <div className="flex items-center">
                      <Link
                        href={item.href}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                          isActive(item.href)
                            ? "text-[#185FA5] dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-900/20 border-l-4 border-[#185FA5] dark:border-blue-400"
                            : "font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        }`}
                        aria-current={isActive(item.href) ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                      {item.children && (
                        <button
                          type="button"
                          onClick={() => setSousMenuMobile(deplie ? null : item.label)}
                          className="p-2.5 ml-1 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          aria-expanded={deplie}
                          aria-label={`${deplie ? "Replier" : "Déplier"} le sous-menu ${item.label}`}
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${deplie ? "rotate-180" : ""}`} />
                        </button>
                      )}
                    </div>
                    {item.children && deplie && (
                      <div className="ml-4 mt-0.5 mb-1 space-y-0.5 border-l border-gray-100 dark:border-gray-800 pl-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            aria-current={isActive(child.href) ? "page" : undefined}
                            className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-[#185FA5] dark:hover:text-blue-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="pt-3 mt-1 border-t border-gray-100 dark:border-gray-800 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/espace-membre"
                      className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-[#185FA5] text-[#185FA5] dark:text-blue-400 dark:border-blue-400 text-sm font-semibold rounded-lg"
                    >
                      Mon espace membre
                    </Link>
                    {estAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-[#042C53] text-white text-sm font-semibold rounded-lg"
                      >
                        <Shield className="w-4 h-4" />
                        Administration
                      </Link>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => startLogin()}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-[#185FA5] text-[#185FA5] dark:text-blue-400 dark:border-blue-400 text-sm font-semibold rounded-lg"
                  >
                    <LogIn className="w-4 h-4" />
                    Se connecter
                  </button>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>
      {/* Réserve la place de l'en-tête fixe : bandeau d'annonce compris,
          sinon le haut de chaque page passerait dessous. */}
      <div
        className="h-16 lg:h-18"
        style={{ marginTop: "var(--hauteur-bandeau, 0px)" }}
        aria-hidden="true"
      />
    </>
  );
}
