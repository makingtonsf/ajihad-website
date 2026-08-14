import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import GestionDefilement from "./components/GestionDefilement";
import { ThemeProvider } from "./contexts/ThemeContext";
// The home page is the only public route loaded immediately. The other pages
// are loaded when visited so a public visitor does not download admin screens,
// the article Markdown renderer, or page-specific code unnecessarily.
import Accueil from "./pages/Accueil";
const APropos = lazy(() => import("./pages/APropos"));
const NosActions = lazy(() => import("./pages/NosActions"));
const Projefa2026 = lazy(() => import("./pages/Projefa2026"));
const Impact = lazy(() => import("./pages/Impact"));
const Gouvernance = lazy(() => import("./pages/Gouvernance"));
const Actualites = lazy(() => import("./pages/Actualites"));
const ActualiteDetail = lazy(() => import("./pages/ActualiteDetail"));
const ProjetDetail = lazy(() => import("./pages/ProjetDetail"));
const Ressources = lazy(() => import("./pages/Ressources"));
const SImpliquer = lazy(() => import("./pages/SImpliquer"));
const Soutenir = lazy(() => import("./pages/Soutenir"));
const Contact = lazy(() => import("./pages/Contact"));
const EspaceMembre = lazy(() => import("./pages/EspaceMembre"));
const VerifierMembre = lazy(() => import("./pages/VerifierMembre"));
const Connexion = lazy(() => import("./pages/Connexion"));
const Confidentialite = lazy(() => import("./pages/Confidentialite"));
const MentionsLegales = lazy(() => import("./pages/MentionsLegales"));
const ConnexionAdmin = lazy(() => import("./pages/admin/ConnexionAdmin"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Pages d'administration : elles restent séparées du bundle public et ne sont
// téléchargées qu'après ouverture d'une route /admin.
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminMembres = lazy(() => import("./pages/admin/AdminMembres"));
const AdminSoumissions = lazy(() => import("./pages/admin/AdminSoumissions"));
const AdminProjets = lazy(() => import("./pages/admin/AdminProjets"));
const AdminActualites = lazy(() => import("./pages/admin/AdminActualites"));
const AdminIndicateurs = lazy(() => import("./pages/admin/AdminIndicateurs"));
const AdminContributions = lazy(() => import("./pages/admin/AdminContributions"));
const AdminPartenaires = lazy(() => import("./pages/admin/AdminPartenaires"));
const AdminRessources = lazy(() => import("./pages/admin/AdminRessources"));
const AdminParametres = lazy(() => import("./pages/admin/AdminParametres"));
const AdminContenus = lazy(() => import("./pages/admin/AdminContenus"));
const AdminAudit = lazy(() => import("./pages/admin/AdminAudit"));
const AdminCandidatures = lazy(() => import("./pages/admin/AdminCandidatures"));
const AdminPartenariats = lazy(() => import("./pages/admin/AdminPartenariats"));
const AdminAcces = lazy(() => import("./pages/admin/AdminAcces"));

function ChargementPage() {
  return (
    <div className="min-h-screen bg-[#F6F8FB] dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#185FA5] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 text-sm">Chargement...</p>
      </div>
    </div>
  );
}

function AppRouter() {
  const routeBase = import.meta.env.BASE_URL === "/"
    ? ""
    : import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <WouterRouter base={routeBase}>
      <Switch>
      {/* Pages publiques */}
      <Route path="/" component={Accueil} />
      <Route path="/a-propos" component={APropos} />
      <Route path="/nos-actions" component={NosActions} />
      <Route path="/projefa-2026" component={Projefa2026} />
      <Route path="/nos-actions/:slug" component={ProjetDetail} />
      <Route path="/impact" component={Impact} />
      <Route path="/gouvernance" component={Gouvernance} />
      <Route path="/actualites" component={Actualites} />
      <Route path="/actualites/:slug" component={ActualiteDetail} />
      <Route path="/ressources" component={Ressources} />
      <Route path="/s-impliquer" component={SImpliquer} />
      <Route path="/soutenir" component={Soutenir} />
      <Route path="/contact" component={Contact} />
      <Route path="/espace-membre" component={EspaceMembre} />
      <Route path="/verifier-membre" component={VerifierMembre} />
      <Route path="/connexion" component={Connexion} />
      <Route path="/confidentialite" component={Confidentialite} />
      <Route path="/mentions-legales" component={MentionsLegales} />
      {/* Administration */}
      <Route path="/admin/connexion" component={ConnexionAdmin} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/projets" component={AdminProjets} />
      <Route path="/admin/actualites" component={AdminActualites} />
      <Route path="/admin/indicateurs" component={AdminIndicateurs} />
      <Route path="/admin/membres" component={AdminMembres} />
      <Route path="/admin/contributions" component={AdminContributions} />
      <Route path="/admin/soumissions" component={AdminSoumissions} />
      <Route path="/admin/candidatures" component={AdminCandidatures} />
      <Route path="/admin/partenaires" component={AdminPartenaires} />
      <Route path="/admin/partenariats" component={AdminPartenariats} />
      <Route path="/admin/ressources" component={AdminRessources} />
      <Route path="/admin/contenus" component={AdminContenus} />
      <Route path="/admin/parametres" component={AdminParametres} />
      <Route path="/admin/audit" component={AdminAudit} />
      <Route path="/admin/acces" component={AdminAcces} />
      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" switchable>
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <GestionDefilement />
          <Suspense fallback={<ChargementPage />}>
            <AppRouter />
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
