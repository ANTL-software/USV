import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack, MdAdd, MdDelete, MdEmail, MdWebhook } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import Loader from '../../components/loader/Loader';
import './alertesConfigView.scss';

interface AlerteConfig {
  id_alerte: number;
  type_alerte: string;
  seuil?: number;
  seuil_duree?: number;
  seuil_minutes?: number;
  actif: boolean;
  destinataires: Array<{ type: string; value: string }>;
}

const ALERTE_TYPES = [
  { value: 'taux_echec', label: 'Taux d\'échec élevé', description: 'Alerte si le taux d\'échec dépasse le seuil (%)', unit: '%' },
  { value: 'duree_courte', label: 'Durée moyenne courte', description: 'Alerte si la durée moyenne des appels est inférieure au seuil (secondes)', unit: 's' },
  { value: 'zero_appel', label: 'Aucun appel abouti', description: 'Alerte si aucun appel abouti depuis X minutes', unit: 'min' }
];

const AlerteCard = ({ alerte, onUpdate, onDelete }: {
  alerte: AlerteConfig;
  onUpdate: (id: number, config: Partial<AlerteConfig>) => void;
  onDelete: (id: number) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localConfig, setLocalConfig] = useState({ ...alerte });

  const handleSave = () => {
    onUpdate(alerte.id_alerte, localConfig);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalConfig({ ...alerte });
    setIsEditing(false);
  };

  const handleToggle = () => {
    onUpdate(alerte.id_alerte, { actif: !alerte.actif });
  };

  const handleAddDestinataire = () => {
    setLocalConfig((prev) => ({
      ...prev,
      destinataires: [...prev.destinataires, { type: 'email', value: '' }]
    }));
  };

  const handleRemoveDestinataire = (index: number) => {
    setLocalConfig((prev) => ({
      ...prev,
      destinataires: prev.destinataires.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateDestinataire = (index: number, field: string, value: string) => {
    setLocalConfig((prev) => ({
      ...prev,
      destinataires: prev.destinataires.map((d, i) =>
        i === index ? { ...d, [field]: value } : d
      )
    }));
  };

  const alerteType = ALERTE_TYPES.find((t) => t.value === alerte.type_alerte);

  return (
    <div className={`alerteCard ${!alerte.actif ? 'alerteCard--inactive' : ''}`}>
      <div className="alerteCard__header">
        <div className="alerteCard__title">
          <h3>{alerteType?.label}</h3>
          <p className="alerteCard__description">{alerteType?.description}</p>
        </div>
        <div className="alerteCard__actions">
          <label className="alerteCard__toggle">
            <input
              type="checkbox"
              checked={alerte.actif}
              onChange={handleToggle}
            />
            <span>{alerte.actif ? 'Actif' : 'Inactif'}</span>
          </label>
          <Button
            style="grey"
           
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Annuler' : 'Modifier'}
          </Button>
          <Button
            style="red"
           
            onClick={() => onDelete(alerte.id_alerte)}
          >
            <MdDelete />
          </Button>
        </div>
      </div>

      {isEditing ? (
        <div className="alerteCard__edit">
          <div className="alerteCard__field">
            <label>Seuil ({alerteType?.unit})</label>
            <input
              type="number"
              value={localConfig.seuil ?? localConfig.seuil_duree ?? localConfig.seuil_minutes ?? ''}
              onChange={(e) => {
                const key = alerteType?.value === 'taux_echec' ? 'seuil' :
                            alerteType?.value === 'duree_courte' ? 'seuil_duree' : 'seuil_minutes';
                setLocalConfig((prev) => ({ ...prev, [key]: Number(e.target.value) }));
              }}
              min="0"
            />
          </div>

          <div className="alerteCard__destinataires">
            <label>Destinataires</label>
            {localConfig.destinataires.map((dest, index) => (
              <div key={index} className="alerteCard__destinataire">
                <select
                  value={dest.type}
                  onChange={(e) => handleUpdateDestinataire(index, 'type', e.target.value)}
                >
                  <option value="email">Email</option>
                  <option value="webhook">Webhook</option>
                </select>
                <input
                  type="text"
                  placeholder={dest.type === 'email' ? 'email@exemple.com' : 'https://webhook.exemple.com'}
                  value={dest.value}
                  onChange={(e) => handleUpdateDestinataire(index, 'value', e.target.value)}
                />
                <Button
                  style="red"
                 
                  onClick={() => handleRemoveDestinataire(index)}
                >
                  <MdDelete />
                </Button>
              </div>
            ))}
            <Button
              style="grey"
             
              onClick={handleAddDestinataire}
            >
              <MdAdd /> Ajouter destinataire
            </Button>
          </div>

          <div className="alerteCard__edit-actions">
            <Button style="orange" onClick={handleSave}>Enregistrer</Button>
            <Button style="grey" onClick={handleCancel}>Annuler</Button>
          </div>
        </div>
      ) : (
        <div className="alerteCard__info">
          <div className="alerteCard__seuil">
            <span className="alerteCard__seuil-label">Seuil:</span>
            <span className="alerteCard__seuil-value">
              {alerte.seuil ?? alerte.seuil_duree ?? alerte.seuil_minutes} {alerteType?.unit}
            </span>
          </div>
          <div className="alerteCard__destinataires-list">
            <span className="alerteCard__destinataires-label">Destinataires:</span>
            {alerte.destinataires.length > 0 ? (
              alerte.destinataires.map((dest, index) => (
                <span key={index} className="alerteCard__destinataire-badge">
                  {dest.type === 'email' ? <MdEmail /> : <MdWebhook />}
                  {dest.value}
                </span>
              ))
            ) : (
              <span className="alerteCard__no-destinataires">Aucun destinataire configuré</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const AlertesConfigView = () => {
  const navigate = useNavigate();
  const [alertes, setAlertes] = useState<AlerteConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlertes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/alertes/config', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      const data = await response.json();
      setAlertes(data.data || []);
    } catch (err) {
      console.error('[AlertesConfig] Erreur lors du chargement:', err);
      setError('Impossible de charger la configuration des alertes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateAlerte = async (id: number, config: Partial<AlerteConfig>) => {
    try {
      const response = await fetch(`/api/alertes/config/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      await fetchAlertes();
    } catch (err) {
      console.error('[AlertesConfig] Erreur lors de la mise à jour:', err);
      setError('Erreur lors de la mise à jour de l\'alerte');
    }
  };

  const handleDeleteAlerte = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/alertes/config/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      await fetchAlertes();
    } catch (err) {
      console.error('[AlertesConfig] Erreur lors de la suppression:', err);
      setError('Erreur lors de la suppression de l\'alerte');
    }
  };

  const handleCreateAlerte = async () => {
    try {
      const response = await fetch('/api/alertes/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          type_alerte: 'taux_echec',
          seuil: 50,
          destinataires: []
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la création');
      }

      await fetchAlertes();
    } catch (err) {
      console.error('[AlertesConfig] Erreur lors de la création:', err);
      setError('Erreur lors de la création de l\'alerte');
    }
  };

  useEffect(() => {
    fetchAlertes();
  }, []);

  return (
    <div id="alertesConfigView">
      <Header />
      <SubNav />
      <main>
        <div className="alertesConfigView__container">
          <div className="alertesConfigView__header">
            <Button style="back" onClick={() => navigate('/supervision')}>
              <MdArrowBack /> Retour
            </Button>
            <h2>Configuration des alertes</h2>
            <Button style="orange" onClick={handleCreateAlerte}>
              <MdAdd /> Nouvelle alerte
            </Button>
          </div>

          {isLoading && <Loader message="Chargement de la configuration..." />}

          {error && <div className="alertesConfigView__error">{error}</div>}

          {!isLoading && alertes.length === 0 && (
            <div className="alertesConfigView__empty">
              <p>Aucune alerte configurée</p>
              <Button style="orange" onClick={handleCreateAlerte}>
                <MdAdd /> Créer la première alerte
              </Button>
            </div>
          )}

          <div className="alertesConfigView__alertes">
            {alertes.map((alerte) => (
              <AlerteCard
                key={alerte.id_alerte}
                alerte={alerte}
                onUpdate={handleUpdateAlerte}
                onDelete={handleDeleteAlerte}
              />
            ))}
          </div>
        </div>
      </main>
      <BackToTop />
    </div>
  );
};

const AlertesConfigViewWithAuth = WithAuth(AlertesConfigView);
export default AlertesConfigViewWithAuth;
