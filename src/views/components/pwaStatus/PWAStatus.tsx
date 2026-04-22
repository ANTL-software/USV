// hooks | libraries
import { ReactElement, useState } from "react";
import { MdWifi, MdWifiOff, MdUpdate, MdClear } from "react-icons/md";

// hooks
import { usePWA, useOnlineStatus } from "../../../hooks/usePWA";

// Alert service
import { confirm } from "../../../utils/services/alertService";

// components
import Button from "../button/Button";

interface PWAStatusProps {
  className?: string;
}

function PWAStatus({ className = "" }: PWAStatusProps): ReactElement {
  const { 
    isSupported, 
    isRegistered, 
    updateAvailable,
    checkForUpdates,
    clearAppCache
  } = usePWA();
  
  const isOnline = useOnlineStatus();
  
  const [showFullStatus, setShowFullStatus] = useState<boolean>(false);

  const handleUpdateClick = async () => {
    await checkForUpdates();
    // Recharger la page après la mise à jour
    window.location.reload();
  };

  const handleClearCache = async () => {
    const confirmed = await confirm(
      'Êtes-vous sûr de vouloir vider le cache ? Cela rechargera l\'application.',
      'Vider le cache'
    );
    
    if (confirmed) {
      await clearAppCache();
    }
  };

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
            onClick={handleUpdateClick}
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
              onClick={handleClearCache}
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