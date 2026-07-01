import './queuePreview.scss';

import { ReactElement, useState, useEffect, useCallback } from 'react';
import { IoRefreshOutline, IoLayersOutline, IoEyeOutline } from 'react-icons/io5';
import { getProspectsCampagneService } from '../../API/services/queue.service';
import type { Prospect } from '../../utils/types/prospect.types';
import type { ProspectCampagneRow } from '../../utils/types/queue.types';

interface QueuePreviewProps {
  idCampagne: number;
  onOpenProspect: (prospect: Prospect) => void;
  refreshKey?: number;
}

const mapRowToProspect = (row: ProspectCampagneRow): Prospect => ({
  id_prospect: row.prospect.id_prospect,
  type_prospect: row.prospect.type_prospect,
  nom: row.prospect.nom,
  prenom: row.prospect.prenom,
  raison_sociale: row.prospect.raison_sociale,
  email: row.prospect.email,
  telephone: row.prospect.telephone,
  type_telephone: row.prospect.type_telephone,
  adresse: row.prospect.adresse,
  code_postal: row.prospect.code_postal,
  ville: row.prospect.ville,
  pays: row.prospect.pays,
  statut: (row.prospect.statut_global ?? row.prospect.statut) as Prospect['statut'],
  statut_global: (row.prospect.statut_global ?? row.prospect.statut) as Prospect['statut'],
  siret: row.prospect.siret,
  code_naf: row.prospect.code_naf,
  activite: row.prospect.activite,
  secteur: row.prospect.secteur,
  region: row.prospect.region,
  civilite: row.prospect.civilite,
  telephone_contact: row.prospect.telephone_contact,
  est_doublon: row.prospect.est_doublon,
  optout: row.prospect.optout,
  doublon_date: null,
  optout_date: null,
  doublon_signale_par: null,
  optout_signale_par: null,
  maturite_commerciale: row.prospect.maturite_commerciale,
  created_at: row.prospect.created_at,
  updated_at: row.prospect.updated_at,
  id_prospection: row.id_prospection,
  statut_campagne: row.statut_file ?? row.statut,
  statut_prospect_campagne: (row.statut_prospect_campagne ?? null) as Prospect['statut_prospect_campagne'],
  statut_file: row.statut_file ?? row.statut,
  nb_tentatives: row.nb_tentatives,
  max_tentatives: row.max_tentatives,
  derniere_tentative: row.derniere_tentative,
  id_agent_assigne: row.id_agent_assigne,
  agent_assigne: row.agentAssignee ? {
    id_employe: row.agentAssignee.id_employe,
    nom: row.agentAssignee.nom,
    prenom: row.agentAssignee.prenom,
  } : null,
  date_injection: row.date_injection,
  date_traitement: row.date_traitement,
});

export function QueuePreview({ idCampagne, onOpenProspect, refreshKey = 0 }: QueuePreviewProps): ReactElement {
  const [prospects, setProspects] = useState<ProspectCampagneRow[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localRefresh, setLocalRefresh] = useState(0);

  const fetchQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // On récupère les 6 premières fiches prioritaires de la file en attente
      const res = await getProspectsCampagneService(idCampagne, {
        page: 1,
        limit: 6,
        statut: 'en_attente',
        sort: 'queue_priority',
        order: 'ASC',
      });
      setProspects(res.data);
      setTotal(res.pagination.total);
    } catch (err: any) {
      setError(err.message || 'Erreur de chargement de la file');
    } finally {
      setIsLoading(false);
    }
  }, [idCampagne]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue, refreshKey, localRefresh]);

  const handleRefresh = () => {
    setLocalRefresh(prev => prev + 1);
  };

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
          onClick={handleRefresh}
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
      ) : prospects.length === 0 ? (
        <div className="queue-preview__empty">
          <p>Aucune fiche prête à être appelée dans la file d'attente pour cette campagne.</p>
          <span className="queue-preview__empty-hint">
            (Vérifiez que des fiches sont injectées et que le délai de rappel de 24h est respecté)
          </span>
        </div>
      ) : (
        <div className="queue-preview__grid">
          {prospects.map((row, index) => {
            const isPrioritaire = row.nb_tentatives === 0;
            return (
              <div
                key={row.id_prospection}
                className="queue-preview-card"
                onClick={() => onOpenProspect(mapRowToProspect(row))}
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
