import './tacheForm.scss';
import { ReactElement, useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoArrowBack, IoSave, IoTrash } from 'react-icons/io5';
import WithAuth from '../../../utils/middleware/WithAuth';

import Header from '../../../components/header/Header';
import SubNav from '../../../components/subNav/SubNav';
import BackToTop from '../../../components/backToTop/BackToTop';
import Button from '../../../components/button/Button';

import { useTache } from '../../../hooks/useTache';
import { useEmployes } from '../../../hooks/useEmployes';
import { useAlert } from '../../../context/alert/AlertContext';
import type { StatutTache, Priorite } from '../../../utils/types/projet.types';

function TacheForm(): ReactElement {
  const navigate = useNavigate();
  const { id: projectId, tacheId } = useParams<{ id: string; tacheId?: string }>();
  const isEditing = !!tacheId;

  const { employes } = useEmployes();
  const { tache } = useTache(tacheId ? parseInt(tacheId) : null);
  const { showConfirm } = useAlert();

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    id_assigne: 0,
    statut: 'a_faire' as StatutTache,
    priorite: 'normale' as Priorite,
    date_echeance: '',
    temps_esthe: 0,
    progression: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger la tâche en mode édition
  useEffect(() => {
    if (isEditing && tache) {
      setFormData({
        titre: tache.titre,
        description: tache.description || '',
        id_assigne: tache.id_assigne || 0,
        statut: tache.statut,
        priorite: tache.priorite,
        date_echeance: tache.date_echeance ? tache.date_echeance.split('T')[0] : '',
        temps_esthe: tache.temps_esthe || 0,
        progression: tache.progression || 0,
      });
    }
  }, [isEditing, tache]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    let processedValue: string | number = value;
    if (name === 'id_assigne' || name === 'temps_esthe' || name === 'progression') {
      processedValue = value === '' ? 0 : parseInt(value);
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectId) {
      setError('ID de projet manquant');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { createTacheService, updateTacheService } = await import('../../../API/services/tache.service');

      const data = {
        ...formData,
        id_projet: parseInt(projectId),
      };

      if (isEditing) {
        await updateTacheService(parseInt(tacheId!), data);
      } else {
        await createTacheService(data);
      }

      navigate(`/projets/${projectId}/taches`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [formData, isEditing, tacheId, projectId, navigate]);

  const handleDelete = useCallback(async () => {
    const confirmed = await showConfirm(
      'Êtes-vous sûr de vouloir supprimer cette tâche ?',
      'Confirmation de suppression'
    );

    if (!confirmed) return;

    setIsLoading(true);
    setError(null);

    try {
      const { deleteTacheService } = await import('../../../API/services/tache.service');
      await deleteTacheService(parseInt(tacheId!));
      navigate(`/projets/${projectId}/taches`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [tacheId, projectId, navigate, showConfirm]);

  const statutOptions: { value: StatutTache; label: string }[] = [
    { value: 'a_faire', label: 'À faire' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'en_attente', label: 'En attente' },
    { value: 'termine', label: 'Terminé' },
    { value: 'annule', label: 'Annulé' },
  ];

  const prioriteOptions: { value: Priorite; label: string }[] = [
    { value: 'critique', label: 'Critique' },
    { value: 'haute', label: 'Haute' },
    { value: 'normale', label: 'Normale' },
    { value: 'basse', label: 'Basse' },
  ];

  return (
    <div id="tacheForm">
      <Header />
      <SubNav />
      <main>
        <div className="tacheForm__container">
          {/* Header */}
          <div className="tacheForm__header">
            <Button style="back" onClick={() => navigate(`/projets/${projectId}/taches`)}>
              <IoArrowBack />
              <span>Retour</span>
            </Button>
            <h1>{isEditing ? 'Modifier la tâche' : 'Nouvelle tâche'}</h1>
            {isEditing && (
              <Button style="red" onClick={handleDelete}>
                <IoTrash />
                <span>Supprimer</span>
              </Button>
            )}
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="tacheForm__form">
            {/* Informations générales */}
            <div className="tacheForm__section">
              <h2>Informations générales</h2>

              <div className="tacheForm__field">
                <label htmlFor="titre">Titre *</label>
                <input
                  type="text"
                  id="titre"
                  name="titre"
                  value={formData.titre}
                  onChange={handleInputChange}
                  required
                  placeholder="Titre de la tâche"
                />
              </div>

              <div className="tacheForm__field">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Description de la tâche..."
                />
              </div>

              <div className="tacheForm__row">
                <div className="tacheForm__field">
                  <label htmlFor="statut">Statut *</label>
                  <select
                    id="statut"
                    name="statut"
                    value={formData.statut}
                    onChange={handleInputChange}
                    required
                  >
                    {statutOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="tacheForm__field">
                  <label htmlFor="priorite">Priorité *</label>
                  <select
                    id="priorite"
                    name="priorite"
                    value={formData.priorite}
                    onChange={handleInputChange}
                    required
                  >
                    {prioriteOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Assignation et planning */}
            <div className="tacheForm__section">
              <h2>Assignation et planning</h2>

              <div className="tacheForm__field">
                <label htmlFor="id_assigne">Assigné à</label>
                <select
                  id="id_assigne"
                  name="id_assigne"
                  value={formData.id_assigne}
                  onChange={handleInputChange}
                >
                  <option value="">Non assigné</option>
                  {employes.map((employe) => (
                    <option key={employe.id_employe} value={employe.id_employe}>
                      {employe.prenom} {employe.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="tacheForm__row">
                <div className="tacheForm__field">
                  <label htmlFor="date_echeance">Date d'échéance</label>
                  <input
                    type="date"
                    id="date_echeance"
                    name="date_echeance"
                    value={formData.date_echeance}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="tacheForm__field">
                  <label htmlFor="temps_esthe">Temps estimé (minutes)</label>
                  <input
                    type="number"
                    id="temps_esthe"
                    name="temps_esthe"
                    value={formData.temps_esthe}
                    onChange={handleInputChange}
                    min="0"
                    step="15"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="tacheForm__field">
                <label htmlFor="progression">Progression (%)</label>
                <input
                  type="range"
                  id="progression"
                  name="progression"
                  value={formData.progression}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="5"
                />
                <span className="tacheForm__progression-value">{formData.progression}%</span>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="tacheForm__error">
                <p>{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="tacheForm__actions">
              <Button
                type="button"
                style="white"
                onClick={() => navigate(`/projets/${projectId}/taches`)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                style="gradient"
                disabled={isLoading}
              >
                <IoSave />
                <span>{isLoading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer la tâche'}</span>
              </Button>
            </div>
          </form>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const TacheFormWithAuth = WithAuth(TacheForm);
export default TacheFormWithAuth;
