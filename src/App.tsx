// styles
import "./utils/styles/global.scss";
import 'aos/dist/aos.css';

// types
import { ReactElement, useEffect } from "react";

// utils
import { logEnvironmentInfo } from "./utils/scripts/utils.ts";
import { testEnvironmentConfig } from "./utils/scripts/testEnvironment.ts";

// hooks | library
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import AOS from 'aos';

// components

// views
import AuthPage from "./views/layouts/authPage/AuthPage";
import HomeWithAuth from "./views/layouts/home/Home";
import CourriersWithAuth from "./views/layouts/courriers/Courriers";
import NouveauCourrierWithAuth from "./views/layouts/nouveauCourrier/NouveauCourrier";
import ListeCourriersWithAuth from "./views/layouts/listeCourriers/ListeCourriers";
import UpdateCourrierWithAuth from "./views/layouts/updateCourrier/UpdateCourrier";
import ConvertisseurImageWithAuth from "./views/layouts/convertisseurImage/ConvertisseurImage";
import BookingPageWithAuth from "./views/layouts/booking/BookingPage";
import CentreAppelsWithAuth from "./views/layouts/centreAppels/CentreAppels";
import AgentsListWithAuth from "./views/layouts/agentsList/AgentsList";
import AgentDetailsWithAuth from "./views/layouts/agentDetails/AgentDetails";
import AgentFormWithAuth from "./views/layouts/agentForm/AgentForm";
import PostesListWithAuth from "./views/layouts/postesList/PostesList";
import PosteFormWithAuth from "./views/layouts/posteForm/PosteForm";
import CampagnesListWithAuth from "./views/layouts/campagnesList/CampagnesList";
import CampagneFormWithAuth from "./views/layouts/campagneForm/CampagneForm";
import ProspectImportWithAuth from "./views/layouts/prospectImport/ProspectImport";
import ProspectInjectionWithAuth from "./views/layouts/prospectInjection/ProspectInjection";
import ProduitsListWithAuth from "./views/layouts/produitsList/ProduitsList";
import ProduitFormWithAuth from "./views/layouts/produitForm/ProduitForm";
import MaterielListWithAuth from "./views/layouts/materielList/MaterielList";
import SupervisionViewWithAuth from "./views/layouts/supervision/SupervisionView";
import AlertesConfigViewWithAuth from "./views/layouts/alertesConfig/AlertesConfigView";
import AlertesHistoryViewWithAuth from "./views/layouts/alertesHistory/AlertesHistoryView";
import CommandesListWithAuth from "./views/layouts/commandesList/CommandesList";
import ProspectsSignalesWithAuth from "./views/layouts/prospectsSignales/ProspectsSignales";
import ProspectsViewWithAuth from "./views/layouts/prospectsView/ProspectsView";

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
        <Route path={"operations"} element={<CentreAppelsWithAuth />}></Route>
        <Route path={"operations/employes"} element={<AgentsListWithAuth />}></Route>
        <Route path={"operations/employes/new"} element={<AgentFormWithAuth />}></Route>
        <Route path={"operations/employes/details/:id"} element={<AgentDetailsWithAuth />}></Route>
        <Route path={"operations/employes/:id"} element={<AgentFormWithAuth />}></Route>
        <Route path={"operations/postes"} element={<PostesListWithAuth />}></Route>
        <Route path={"operations/postes/new"} element={<PosteFormWithAuth />}></Route>
        <Route path={"operations/postes/:id"} element={<PosteFormWithAuth />}></Route>
        <Route path={"operations/materiel"} element={<MaterielListWithAuth />}></Route>
        <Route path={"operations/commandes"} element={<CommandesListWithAuth />}></Route>
        <Route path={"operations/signalements"} element={<ProspectsSignalesWithAuth />}></Route>
        <Route path={"operations/prospects"} element={<ProspectsViewWithAuth />}></Route>
        <Route path={"campagnes"} element={<CampagnesListWithAuth />}></Route>
        <Route path={"campagnes/new"} element={<CampagneFormWithAuth />}></Route>
        <Route path={"campagnes/:id"} element={<CampagneFormWithAuth />}></Route>
        <Route path={"operations/prospect/:id/inject"} element={<ProspectInjectionWithAuth />}></Route>
        <Route path={"supervision"} element={<SupervisionViewWithAuth />}></Route>
        <Route path={"supervision/alertes"} element={<AlertesConfigViewWithAuth />}></Route>
        <Route path={"supervision/alertes/historique"} element={<AlertesHistoryViewWithAuth />}></Route>
        <Route path={"prospects/import"} element={<ProspectImportWithAuth />}></Route>
        <Route path={"produits"} element={<ProduitsListWithAuth />}></Route>
        <Route path={"produits/new"} element={<ProduitFormWithAuth />}></Route>
        <Route path={"produits/:id"} element={<ProduitFormWithAuth />}></Route>
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
