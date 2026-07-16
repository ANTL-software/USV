// styles
import "./utils/styles/global.scss";
import 'aos/dist/aos.css';

// types
import { ReactElement, useEffect } from "react";

// utils
import { logEnvironmentInfo, testEnvironmentConfig } from "./utils/scripts/index.ts";

// hooks | library
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import AOS from 'aos';

import {
  AbsenceDemandes as AbsenceDemandesWithAuth,
  AgentDetails as AgentDetailsWithAuth,
  AgentForm as AgentFormWithAuth,
  AgentsList as AgentsListWithAuth,
  AlertesConfigView as AlertesConfigViewWithAuth,
  AlertesHistoryView as AlertesHistoryViewWithAuth,
  AntlConfiguration as AntlConfigurationWithAuth,
  AuthPage,
  BookingPage as BookingPageWithAuth,
  CampagneForm as CampagneFormWithAuth,
  CampagnesList as CampagnesListWithAuth,
  CentreAppels as CentreAppelsWithAuth,
  CommandeDetails as CommandeDetailsWithAuth,
  CommandesList as CommandesListWithAuth,
  Commercial as CommercialWithAuth,
  Commerciaux as CommerciauxWithAuth,
  ConvertisseurImage as ConvertisseurImageWithAuth,
  Courriers as CourriersWithAuth,
  Devis as DevisWithAuth,
  Facturation as FacturationWithAuth,
  Home as HomeWithAuth,
  IncidentDeclaration as IncidentDeclarationWithAuth,
  IncidentList as IncidentListWithAuth,
  IncidentQualification as IncidentQualificationWithAuth,
  IncidentTraitement as IncidentTraitementWithAuth,
  IncidentsHub as IncidentsHubWithAuth,
  ListeCourriers as ListeCourriersWithAuth,
  MaterielList as MaterielListWithAuth,
  MesTaches as MesTachesWithAuth,
  MonPlanning as MonPlanningWithAuth,
  NotesDirection as NotesDirectionWithAuth,
  NouveauCourrier as NouveauCourrierWithAuth,
  PanierProduitsList as PanierProduitsListWithAuth,
  PaniersList as PaniersListWithAuth,
  PosteForm as PosteFormWithAuth,
  PostesList as PostesListWithAuth,
  ProduitForm as ProduitFormWithAuth,
  ProduitsList as ProduitsListWithAuth,
  ProjetDetails as ProjetDetailsWithAuth,
  ProjetForm as ProjetFormWithAuth,
  ProjetsList as ProjetsListWithAuth,
  ProspectEnrichment as ProspectEnrichmentWithAuth,
  ProspectImport as ProspectImportWithAuth,
  ProspectInjection as ProspectInjectionWithAuth,
  ProspectsSignales as ProspectsSignalesWithAuth,
  ProspectsView as ProspectsViewWithAuth,
  Qualite as QualiteWithAuth,
  QualiteEcoutes as QualiteEcoutesWithAuth,
  QualiteStats as QualiteStatsWithAuth,
  SupervisionView as SupervisionViewWithAuth,
  TacheForm as TacheFormWithAuth,
  TachesKanban as TachesKanbanWithAuth,
  UpdateCourrier as UpdateCourrierWithAuth,
  VigieView as VigieViewWithAuth,
} from "./views/layouts/index.ts";

// Component to manage body classes based on current route
function BodyClassManager(): ReactElement | null {
  const location = useLocation();

  useEffect(() => {
    // Remove all existing nav-related classes
    document.body.classList.remove('has-subnav', 'section-webdev', 'section-utils', 'section-home');

    // Determine current section and add appropriate classes
    if (location.pathname === '/' || location.pathname === '/home') {
      document.body.classList.add('section-home');
    } else if (location.pathname.includes('/web_dev')) {
      document.body.classList.add('section-webdev');
    } else if (location.pathname.includes('/utils')) {
      document.body.classList.add('section-utils');

      // Add subnav class if we're in a sub-application
      if (location.pathname !== '/utils') {
        document.body.classList.add('hasSubnav');
      }
    }
  }, [location.pathname]);

  return null;
}

function App(): ReactElement {
  useEffect(() => {
    // Initialize AOS
    AOS.init({
      duration: 600,
      easing: 'ease-in-out',
      once: true,
      offset: 100
    });

    // Log environment information on app start
    logEnvironmentInfo();

    // Test environment configuration in development
    if (import.meta.env.DEV) {
      testEnvironmentConfig();
    }
  }, []);

  return (
    <Router>
      <BodyClassManager />
      <Routes>
        <Route path="/" element={<Navigate to="/auth" />}></Route>
        <Route path={"auth"} element={<AuthPage />}></Route>
        <Route path={"home"} element={<HomeWithAuth />}></Route>
        <Route path={"mail"} element={<CourriersWithAuth />}></Route>
        <Route path={"mail/list"} element={<ListeCourriersWithAuth />}></Route>
        <Route path={"mail/new"} element={<NouveauCourrierWithAuth />}></Route>
        <Route path={"mail/update/:id"} element={<UpdateCourrierWithAuth />}></Route>
        <Route path={"mail/convert"} element={<ConvertisseurImageWithAuth />}></Route>
        <Route path={"booking"} element={<BookingPageWithAuth />}></Route>
        <Route path={"commerciaux"} element={<CommerciauxWithAuth />}></Route>
        <Route path={"commerciaux/notes-direction"} element={<NotesDirectionWithAuth />}></Route>
        <Route path={"commerciaux/mon_planning"} element={<MonPlanningWithAuth />}></Route>
        <Route path={"commercial"} element={<CommercialWithAuth />}></Route>
        <Route path={"commercial/facturation"} element={<FacturationWithAuth />}></Route>
        <Route path={"commercial/devis"} element={<DevisWithAuth />}></Route>
        <Route path={"commercial/configuration-antl"} element={<AntlConfigurationWithAuth />}></Route>
        <Route path={"operations"} element={<CentreAppelsWithAuth />}></Route>
        <Route path={"operations/vigie"} element={<VigieViewWithAuth />}></Route>
        <Route path={"operations/demandes-absence"} element={<AbsenceDemandesWithAuth />}></Route>
        <Route path={"operations/employes"} element={<AgentsListWithAuth />}></Route>
        <Route path={"operations/employes/new"} element={<AgentFormWithAuth />}></Route>
        <Route path={"operations/employes/details/:id"} element={<AgentDetailsWithAuth />}></Route>
        <Route path={"operations/employes/:id"} element={<AgentFormWithAuth />}></Route>
        <Route path={"operations/postes"} element={<PostesListWithAuth />}></Route>
        <Route path={"operations/postes/new"} element={<PosteFormWithAuth />}></Route>
        <Route path={"operations/postes/:id"} element={<PosteFormWithAuth />}></Route>
        <Route path={"operations/materiel"} element={<MaterielListWithAuth />}></Route>
        <Route path={"operations/commandes"} element={<CommandesListWithAuth />}></Route>
        <Route path={"operations/commandes/details/:id"} element={<CommandeDetailsWithAuth />}></Route>
        <Route path={"operations/qualite/signalements"} element={<ProspectsSignalesWithAuth />}></Route>
        <Route path={"operations/qualite/statistiques"} element={<QualiteStatsWithAuth />}></Route>
        <Route path={"operations/qualite/ecoutes"} element={<QualiteEcoutesWithAuth />}></Route>
        <Route path={"operations/qualite"} element={<QualiteWithAuth />}></Route>
        <Route path={"operations/prospects"} element={<ProspectsViewWithAuth />}></Route>
        <Route path={"operations/prospects/enrichissement"} element={<ProspectEnrichmentWithAuth />}></Route>
        <Route path={"campagnes"} element={<CampagnesListWithAuth />}></Route>
        <Route path={"campagnes/new"} element={<CampagneFormWithAuth />}></Route>
        <Route path={"campagnes/:id"} element={<CampagneFormWithAuth />}></Route>
        <Route path={"operations/prospect/:id/inject"} element={<ProspectInjectionWithAuth />}></Route>
        <Route path={"incidents"} element={<IncidentsHubWithAuth />}></Route>
        <Route path={"incidents/declarer"} element={<IncidentDeclarationWithAuth />}></Route>
        <Route path={"incidents/qualification"} element={<IncidentQualificationWithAuth />}></Route>
        <Route path={"incidents/traitement"} element={<IncidentTraitementWithAuth />}></Route>
        <Route path={"incidents/traitement/:id"} element={<IncidentTraitementWithAuth />}></Route>
        <Route path={"incidents/liste"} element={<IncidentListWithAuth />}></Route>
        <Route path={"supervision"} element={<SupervisionViewWithAuth />}></Route>
        <Route path={"supervision/alertes"} element={<AlertesConfigViewWithAuth />}></Route>
        <Route path={"supervision/alertes/historique"} element={<AlertesHistoryViewWithAuth />}></Route>
        <Route path={"prospects/import"} element={<ProspectImportWithAuth />}></Route>
        <Route path={"produits"} element={<ProduitsListWithAuth />}></Route>
        <Route path={"produits/new"} element={<ProduitFormWithAuth />}></Route>
        <Route path={"produits/:id"} element={<ProduitFormWithAuth />}></Route>
        <Route path={"paniers"} element={<PaniersListWithAuth />}></Route>
        <Route path={"paniers/:idPanier/produits"} element={<PanierProduitsListWithAuth />}></Route>
        <Route path={"projets/new"} element={<ProjetFormWithAuth />}></Route>
        <Route path={"projets/mes_taches"} element={<MesTachesWithAuth />}></Route>
        <Route path={"projets/:id/edit"} element={<ProjetFormWithAuth />}></Route>
        <Route path={"projets/:id/taches/new"} element={<TacheFormWithAuth />}></Route>
        <Route path={"projets/:id/taches/:tacheId"} element={<TacheFormWithAuth />}></Route>
        <Route path={"projets/:id/taches/:tacheId/edit"} element={<TacheFormWithAuth />}></Route>
        <Route path={"projets/:id/taches"} element={<TachesKanbanWithAuth />}></Route>
        <Route path={"projets"} element={<ProjetsListWithAuth />}></Route>
        <Route path={"projets/:id"} element={<ProjetDetailsWithAuth />}></Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Notification hors ligne globale */}
      <div className="offline-notice">
        📱 Mode hors ligne - Fonctionnalités limitées
      </div>
    </Router>
  );
}

export default App;
