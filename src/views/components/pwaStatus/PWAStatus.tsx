// hooks | libraries
import { useState } from "react";
import type { ReactElement } from "react";
import { MdWifi, MdWifiOff, MdUpdate, MdClear } from "react-icons/md";

// hooks
import { usePWAStatus } from "../../../hooks/index.ts";

// components
import { Button } from "../button/index.ts";

interface PWAStatusProps {
  className?: string;
}

function PWAStatus({ className = "" }: PWAStatusProps): ReactElement {
  const {
    applyUpdate,
    clearCache,
    isOnline,
    isRegistered,
    isSupported,
    updateAvailable,
  } = usePWAStatus();
  
  const [showFullStatus, setShowFullStatus] = useState<boolean>(false);

  // Si PWA n'est pas supportée, ne rien afficher
  if (!isSupported) {
    return <></>;
  }

  return (
    <div className={`pwa-status ${className}`} data-aos="fade-in">
      {/* Indicateur de connexion toujours visible */}
      <div className="connection-indicator">
        {isOnline ? (
          <div className="online-indicator" title="En ligne">
            <MdWifi />
          </div>
        ) : (
          <div className="offline-indicator" title="Hors ligne">
            <MdWifiOff />
            <span className="offline-text">Hors ligne</span>
          </div>
        )}
      </div>

      {/* Notification de mise à jour disponible */}
      {updateAvailable && (
        <div className="update-prompt">
          <Button
            style="orange"
            onClick={() => void applyUpdate()}
            type="button"
          >
            <MdUpdate />
            <span>Mise à jour disponible</span>
          </Button>
        </div>
      )}

      {/* Statut détaillé (masqué par défaut) */}
      {showFullStatus && (
        <div className="pwa-details">
          <h3>État PWA</h3>
          <ul>
            <li>Supporté: {isSupported ? '✅' : '❌'}</li>
            <li>Service Worker: {isRegistered ? '✅' : '❌'}</li>
            <li>En ligne: {isOnline ? '✅' : '❌'}</li>
            <li>Mise à jour: {updateAvailable ? '⚠️ Disponible' : '✅ À jour'}</li>
          </ul>
          
          <div className="pwa-actions">
            <Button
              style="grey"
              onClick={() => void clearCache()}
              type="button"
            >
              <MdClear />
              <span>Vider le cache</span>
            </Button>
          </div>
        </div>
      )}

      {/* Bouton pour afficher/masquer les détails (dev mode) */}
      {import.meta.env.DEV && (
        <button
          className="toggle-details"
          onClick={() => setShowFullStatus(!showFullStatus)}
          title="Afficher les détails PWA (dev mode)"
        >
          PWA
        </button>
      )}
    </div>
  );
}

export default PWAStatus;
