import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// context
import { UserProvider } from "./context/user/index.ts";
import { NotificationProvider } from "./context/notification/index.ts";
import { CourrierProvider } from "./context/courrier/index.ts";
import { BookingProvider } from "./context/booking/index.ts";
import { LoaderProvider } from "./context/loader/index.ts";
import { AlertProvider } from "./context/alert/index.ts";
import { VenteProvider } from "./context/vente/index.ts";
import { ProjetProvider } from "./context/projet/index.ts";

// PWA initialization
import {
  cleanupDevelopmentPWA,
  getEnvironment,
  initializePWA,
  shouldEnablePWA,
} from './utils/scripts/index.ts';

// Initialize PWA features only in production and compatible browsers
// En développement, l'app fonctionne normalement sans PWA
try {
  const environment = getEnvironment();
  const canUsePWA = shouldEnablePWA();
  
  if (environment === 'production' && canUsePWA) {
    initializePWA().catch((error) => {
      console.warn('[PWA] Failed to initialize:', error);
    });
  } else if (environment === 'development') {
    cleanupDevelopmentPWA().catch((error) => {
      console.warn('[PWA] Failed to clear development caches:', error);
    });
  }
  // En développement, pas d'initialisation PWA mais l'app fonctionne
} catch (error) {
  console.warn('[PWA] PWA initialization failed:', error);
}

createRoot(document.getElementById("root")!).render(
  <UserProvider>
    <NotificationProvider>
      <CourrierProvider>
        <LoaderProvider>
          <AlertProvider>
            <BookingProvider>
              <VenteProvider>
                <ProjetProvider>
                  <App />
                </ProjetProvider>
              </VenteProvider>
            </BookingProvider>
          </AlertProvider>
        </LoaderProvider>
      </CourrierProvider>
    </NotificationProvider>
  </UserProvider>,
);
