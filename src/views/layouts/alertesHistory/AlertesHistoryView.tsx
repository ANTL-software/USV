import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdCheckCircle, MdWarning, MdError } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import Loader from '../../components/loader/Loader';
import './alertesHistoryView.scss';

interface AlerteHistory {
  id_alerte: number;
  type_alerte: string;
  statut: string;
  derniere_valeur: number | null;
  date_declenchement: string | null;
  date_resolution: string | null;
  commentaire: string | null;
  created_at: string;
}

const ALERTE_TYPE_LABELS: Record<string, string> = {
  taux_echec: 'Taux d\'échec élevé',
  duree_courte: 'Durée moyenne courte',
  zero_appel: 'Aucun appel abouti',
  consommation_trunk: 'Consommation trunk élevée'
};

const ALERTE_TYPE_COLORS: Record<string, string> = {
  taux_echec: '#e74c3c',
  duree_courte: '#f39c12',
  zero_appel: '#e67e22',
  consommation_trunk: '#9b59b6'
};

const STATUT_LABELS: Record<string, string> = {
  inactive: 'Inactive',
  active: 'Active',
  resolue: 'Résolue'
};

const STATUT_COLORS: Record<string, string> = {
  inactive: '#95a5a6',
  active: '#e74c3c',
  resolue: '#27ae60'
};

const AlerteRow = ({ alerte, onResolve }: {
  alerte: AlerteHistory;
  onResolve: (id: number, commentaire: string) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [commentaire, setCommentaire] = useState(alerte.commentaire || '');

  const handleResolve = () => {
    onResolve(alerte.id_alerte, commentaire);
    setIsEditing(false);
  };

  const getStatusIcon = () => {
    switch (alerte.statut) {
      case 'active':
        return <MdError className="alertesHistoryRow__status-icon alertesHistoryRow__status-icon--error" />;
      case 'resolue':
        return <MdCheckCircle className="alertesHistoryRow__status-icon alertesHistoryRow__status-icon--success" />;
      default:
        return <MdWarning className="alertesHistoryRow__status-icon alertesHistoryRow__status-icon--warning" />;
    }
  };

  return (
    <div className={`alertesHistoryRow alertesHistoryRow--${alerte.statut}`}>
      <div className="alertesHistoryRow__status">{getStatusIcon()}</div>

      <div className="alertesHistoryRow__type">
        <span
          className="alertesHistoryRow__type-badge"
          style={{ backgroundColor: ALERTE_TYPE_COLORS[alerte.type_alerte] }}
        >
          {ALERTE_TYPE_LABELS[alerte.type_alerte]}
        </span>
      </div>

      <div className="alertesHistoryRow__statut">
        <span
          className="alertesHistoryRow__statut-badge"
          style={{ backgroundColor: STATUT_COLORS[alerte.statut] }}
        >
          {STATUT_LABELS[alerte.statut]}
        </span>
      </div>

      <div className="alertesHistoryRow__valeur">
        {alerte.derniere_valeur !== null ? (
          <span className="alertesHistoryRow__valeur-value">
            {alerte.derniere_valeur.toFixed(1)}
          </span>
        ) : (
          <span className="alertesHistoryRow__valeur-na">N/A</span>
        )}
      </div>

      <div className="alertesHistoryRow__dates">
        {alerte.date_declenchement && (
          <div className="alertesHistoryRow__date">
            <span className="alertesHistoryRow__date-label">Déclenchement:</span>
            <span className="alertesHistoryRow__date-value">
              {new Date(alerte.date_declenchement).toLocaleString('fr-FR')}
            </span>
          </div>
        )}
        {alerte.date_resolution && (
          <div className="alertesHistoryRow__date">
            <span className="alertesHistoryRow__date-label">Résolution:</span>
            <span className="alertesHistoryRow__date-value">
              {new Date(alerte.date_resolution).toLocaleString('fr-FR')}
            </span>
          </div>
        )}
      </div>

      <div className="alertesHistoryRow__commentaire">
        {isEditing ? (
          <div className="alertesHistoryRow__commentaire-edit">
            <input
              type="text"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="Ajouter un commentaire..."
            />
            <div className="alertesHistoryRow__commentaire-actions">
              <Button
                style="orange"
               
                onClick={handleResolve}
              >
                Enregistrer
              </Button>
              <Button
                style="grey"
               
                onClick={() => {
                  setCommentaire(alerte.commentaire || '');
                  setIsEditing(false);
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <div className="alertesHistoryRow__commentaire-display">
            {alerte.commentaire ? (
              <p>{alerte.commentaire}</p>
            ) : (
              <span className="alertesHistoryRow__no-commentaire">Aucun commentaire</span>
            )}
          </div>
        )}
      </div>

      <div className="alertesHistoryRow__actions">
        {alerte.statut === 'active' && !isEditing && (
          <Button
            style="green"
           
            onClick={() => setIsEditing(true)}
          >
            <MdCheckCircle /> Résoudre
          </Button>
        )}
      </div>
    </div>
  );
};

const AlertesHistoryView = () => {
  const navigate = useNavigate();
  const [alertes, setAlertes] = useState<AlerteHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({ statut: '', type_alerte: '' });

  const fetchAlertes = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.statut) params.append('statut', filters.statut);
      if (filters.type_alerte) params.append('type_alerte', filters.type_alerte);

      const response = await fetch(`/api/alertes/historique?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });

      const data = await response.json();
      setAlertes(data.data || []);
    } catch (err) {
      console.error('[AlertesHistory] Erreur lors du chargement:', err);
      setError('Impossible de charger l\'historique des alertes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveAlerte = async (id: number, commentaire: string) => {
    try {
      const response = await fetch(`/api/alertes/${id}/resolve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ commentaire })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la résolution');
      }

      await fetchAlertes();
    } catch (err) {
      console.error('[AlertesHistory] Erreur lors de la résolution:', err);
      setError('Erreur lors de la résolution de l\'alerte');
    }
  };

  useEffect(() => {
    fetchAlertes();
  }, [filters]);

  return (
    <div id="alertesHistoryView">
      <Header />
      <SubNav />
      <main>
        <div className="alertesHistoryView__container">
          <div className="alertesHistoryView__header">
            <Button style="back" onClick={() => navigate('/supervision')}>
              <MdArrowBack /> Retour
            </Button>
            <h2>Historique des alertes</h2>
          </div>

          <div className="alertesHistoryView__filters">
            <div className="alertesHistoryView__filter">
              <label>Statut</label>
              <select
                value={filters.statut}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
              >
                <option value="">Tous</option>
                <option value="active">Actives</option>
                <option value="resolue">Résolues</option>
                <option value="inactive">Inactives</option>
              </select>
            </div>

            <div className="alertesHistoryView__filter">
              <label>Type</label>
              <select
                value={filters.type_alerte}
                onChange={(e) => setFilters({ ...filters, type_alerte: e.target.value })}
              >
                <option value="">Tous</option>
                <option value="taux_echec">Taux d'échec</option>
                <option value="duree_courte">Durée courte</option>
                <option value="zero_appel">Aucun appel abouti</option>
                <option value="consommation_trunk">Consommation trunk</option>
              </select>
            </div>
          </div>

          {isLoading && <Loader message="Chargement de l'historique..." />}

          {error && <div className="alertesHistoryView__error">{error}</div>}

          {!isLoading && alertes.length === 0 && (
            <div className="alertesHistoryView__empty">
              <p>Aucune alerte trouvée</p>
            </div>
          )}

          <div className="alertesHistoryView__list">
            {alertes.map((alerte) => (
              <AlerteRow
                key={alerte.id_alerte}
                alerte={alerte}
                onResolve={handleResolveAlerte}
              />
            ))}
          </div>
        </div>
      </main>
      <BackToTop />
    </div>
  );
};

const AlertesHistoryViewWithAuth = WithAuth(AlertesHistoryView);
export default AlertesHistoryViewWithAuth;
