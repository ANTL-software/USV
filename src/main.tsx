import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// context
import { UserProvider } from "./context/user/UserProvider.tsx";
import { CourrierProvider } from "./context/courrier/CourrierProvider.tsx";
import { BookingProvider } from "./context/booking/BookingProvider.tsx";
import LoaderProvider from "./context/loader/LoaderProvider.tsx";
import { AlertProvider } from "./context/alert/AlertProvider.tsx";

// PWA initialization
import { initializePWA } from "./utils/scripts/serviceWorker.ts";
import { getEnvironment, shouldEnablePWA } from "./utils/scripts/browserDetection.ts";

// Initialize PWA features only in production and compatible browsers
// En développement, l'app fonctionne normalement sans PWA
try {
  const environment = getEnvironment();
  const canUsePWA = shouldEnablePWA();
  
  if (environment === 'production' && canUsePWA) {
    initializePWA().catch((error) => {
      console.warn('[PWA] Failed to initialize:', error);
    });
  }
  // En développement, pas d'initialisation PWA mais l'app fonctionne
} catch (error) {
  console.warn('[PWA] PWA initialization failed:', error);
}

createRoot(document.getElementById("root")!).render(
  <UserProvider>
    <CourrierProvider>
      <LoaderProvider>
        <AlertProvider>
          <BookingProvider>
            <App />
          </BookingProvider>
        </AlertProvider>
      </LoaderProvider>
    </CourrierProvider>
  </UserProvider>,
);
