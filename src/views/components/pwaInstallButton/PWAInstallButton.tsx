// hooks | libraries
import { ReactElement, useState, useEffect } from "react";
import { MdDownload, MdPhoneIphone } from "react-icons/md";

// hooks
import { usePWAInstall } from "../../../hooks/index.ts";

interface PWAInstallButtonProps {
  className?: string;
  variant?: "mobile" | "desktop";
  compact?: boolean;
}

function PWAInstallButton({ 
  className = "", 
  variant = "mobile",
  compact = true
}: PWAInstallButtonProps): ReactElement | null {
  const { isInstalled } = usePWAInstall();
  const [deferredPrompt, setDeferredPrompt] = useState<{ prompt: () => void; userChoice: Promise<{ outcome: string }> } | null>(null);
  const [showButton, setShowButton] = useState<boolean>(false);

  // Écouter l'événement beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as unknown as typeof deferredPrompt);
      setShowButton(true);
    };

    const handleAppInstalled = () => {
      setShowButton(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowButton(false);
      }
      setDeferredPrompt(null);
    }
  };
  
  // Ne pas afficher si déjà installé ou pas installable
  if (isInstalled || !showButton || !deferredPrompt) {
    return null;
  }

  if (compact) {
    return (
      <button
        className={`pwa-install-btn compact ${variant} ${className}`}
        onClick={handleInstallClick}
        title="Installer l'application"
      >
        <MdDownload />
        {variant === "mobile" && <span>Installer l'app</span>}
      </button>
    );
  }

  return (
    <button
      className={`pwa-install-btn full ${variant} ${className}`}
      onClick={handleInstallClick}
    >
      <MdPhoneIphone />
      <div className="install-text">
        <span className="install-title">Installer l'application</span>
        <span className="install-subtitle">Pour une meilleure expérience</span>
      </div>
    </button>
  );
}

export default PWAInstallButton;
