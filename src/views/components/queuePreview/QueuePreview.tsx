import './queuePreview.scss';

import type { ReactElement } from 'react';
import { IoRefreshOutline, IoLayersOutline, IoEyeOutline } from 'react-icons/io5';
import { useQueuePreview } from '../../../hooks/index.ts';
import type { Prospect } from '../../../utils/types/index.ts';

interface QueuePreviewProps {
  idCampagne: number;
  onOpenProspect: (prospect: Prospect) => void;
  refreshKey?: number;
}

export function QueuePreview({ idCampagne, onOpenProspect, refreshKey = 0 }: QueuePreviewProps): ReactElement {
  const { items, total, isLoading, error, refresh } = useQueuePreview(idCampagne, refreshKey);

  const formatObfuscatedPhone = (phone: string) => {
    if (!phone) return '—';
    const digits = phone.replace(/\s/g, '');
    if (digits.length >= 10) {
      return `${digits.substring(0, 2)} ${digits.substring(2, 4)} •• •• ${digits.substring(8)}`;
    }
    return phone;
  };

  const getTentativesColorClass = (attempts: number) => {
    if (attempts === 0) return 'attempts-badge--zero';
    if (attempts <= 2) return 'attempts-badge--low';
    return 'attempts-badge--high';
  };

  return (
    <div className="queue-preview">
      <div className="queue-preview__header">
        <div className="queue-preview__title-wrapper">
          <IoLayersOutline className="queue-preview__icon" />
          <h2>File d'attente du Script (Dialer)</h2>
          <span className="queue-preview__badge">
            {isLoading ? '...' : `${total} fiche${total > 1 ? 's' : ''} en attente`}
          </span>
        </div>
        <button
          className={`queue-preview__refresh-btn ${isLoading ? 'queue-preview__refresh-btn--loading' : ''}`}
          onClick={refresh}
          disabled={isLoading}
          title="Rafraîchir la file"
        >
          <IoRefreshOutline />
        </button>
      </div>

      {error && <div className="queue-preview__error">{error}</div>}

      {isLoading ? (
        <div className="queue-preview__grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="queue-preview-card queue-preview-card--skeleton">
              <div className="skeleton-line skeleton-line--title" />
              <div className="skeleton-line skeleton-line--subtitle" />
              <div className="skeleton-line skeleton-line--footer" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="queue-preview__empty">
          <p>Aucune fiche prête à être appelée dans la file d'attente pour cette campagne.</p>
          <span className="queue-preview__empty-hint">
            (Vérifiez que des fiches sont injectées et que le délai de rappel de 24h est respecté)
          </span>
        </div>
      ) : (
        <div className="queue-preview__grid">
          {items.map(({ row, prospect }, index) => {
            const isPrioritaire = row.nb_tentatives === 0;
            return (
              <div
                key={row.id_prospection}
                className="queue-preview-card"
                onClick={() => onOpenProspect(prospect)}
              >
                <div className="queue-preview-card__index">#{index + 1}</div>
                <div className="queue-preview-card__body">
                  <div className="queue-preview-card__name">
                    {row.prospect.type_prospect === 'Entreprise' && row.prospect.raison_sociale
                      ? row.prospect.raison_sociale
                      : `${row.prospect.nom.toUpperCase()} ${row.prospect.prenom || ''}`}
                  </div>
                  <div className="queue-preview-card__phone">
                    <code>{formatObfuscatedPhone(row.prospect.telephone)}</code>
                  </div>
                  <div className="queue-preview-card__meta">
                    <span className={`attempts-badge ${getTentativesColorClass(row.nb_tentatives)}`}>
                      {row.nb_tentatives} / {row.max_tentatives} appels
                    </span>
                    {isPrioritaire ? (
                      <span className="priority-tag priority-tag--new">Nouveau</span>
                    ) : (
                      <span className="priority-tag priority-tag--retry">Relance</span>
                    )}
                  </div>
                </div>
                <div className="queue-preview-card__actions">
                  <button className="queue-preview-card__action-btn" title="Inspecter le prospect">
                    <IoEyeOutline />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
