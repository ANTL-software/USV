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
import AuthPage from "./views/authPage/AuthPage";
import HomeWithAuth from "./views/home/Home.tsx";
import CourriersWithAuth from "./views/courriers/Courriers.tsx";
import NouveauCourrierWithAuth from "./views/courriers/nouveauCourrier/NouveauCourrier.tsx";
import ListeCourriersWithAuth from "./views/courriers/listeCourriers/ListeCourriers.tsx";
import UpdateCourrierWithAuth from "./views/courriers/updateCourrier/UpdateCourrier.tsx";
import BookingPageWithAuth from "./views/booking/BookingPage.tsx";

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
        <Route path={"booking"} element={<BookingPageWithAuth />}></Route>
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
