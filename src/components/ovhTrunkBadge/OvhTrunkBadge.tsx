import React from 'react';
import { useOvhTrunk } from '../../hooks/useOvhTrunk';
import './ovhTrunkBadge.scss';

/**
 * Badge affichant le statut du trunk OVH
 * S'affiche dans le dashboard supervision avec un indicateur visuel de couleur
 */
const OvhTrunkBadge: React.FC = () => {
  const { status, consumption, loading } = useOvhTrunk();

  // Déterminer la couleur du badge selon le statut
  const getStatusColor = (): string => {
    switch (status.status) {
      case 'active':
        return 'green';
      case 'inactive':
      case 'unknown':
        return 'red';
      case 'disabled':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (): string => {
    switch (status.status) {
      case 'active':
        return '✓';
      case 'inactive':
      case 'unknown':
        return '✗';
      case 'disabled':
        return '○';
      default:
        return '?';
    }
  };

  const statusColor = getStatusColor();
  const statusIcon = getStatusIcon();

  return (
    <div id="ovhTrunkBadge" className="ovh-trunk-badge">
      <div className={`trunk-indicator ${statusColor}`}>
        <span className="status-icon">{statusIcon}</span>
        <span className="status-text">SIP Trunk OVH</span>
      </div>

      {!loading && status.status !== 'disabled' && (
        <div className="trunk-details">
          {status.status === 'active' && consumption.appels > 0 && (
            <div className="consumption-info">
              <span className="appels">{consumption.appels} appels</span>
              <span className="duree">{consumption.dureeFormatee}</span>
            </div>
          )}
          {consumption.limite && consumption.pourcentage > 0 && (
            <div className="consumption-bar">
              <div
                className="consumption-fill"
                style={{ width: `${Math.min(consumption.pourcentage, 100)}%` }}
                title={`${consumption.pourcentage}% du forfait utilisé`}
              />
            </div>
          )}
        </div>
      )}

      {status.message && status.status === 'disabled' && (
        <div className="trunk-message">{status.message}</div>
      )}
    </div>
  );
};

export default OvhTrunkBadge;
