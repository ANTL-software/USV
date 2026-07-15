import './projetForm.scss';
import { ReactElement, useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoArrowBack, IoSave, IoTrash } from 'react-icons/io5';
import WithAuth from '../../../utils/middleware/WithAuth';

import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

import { useProjet } from '../../../hooks/useProjet';
import { useEmployes } from '../../../hooks/useEmployes';
import { useAlert } from '../../../context/alert/AlertContext';
import type { TypeProjet, StatutProjet, Priorite, CreateProjetData, UpdateProjetData } from '../../../utils/types/projet.types';

function ProjetForm(): ReactElement {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;

  const { employes } = useEmployes();
  const { projet } = useProjet(isEditing ? parseInt(id!) : null);
  const { showConfirm } = useAlert();

  const [formData, setFormData] = useState<Partial<CreateProjetData>>({
    titre: '',
    description: '',
    type_projet: 'developpement',
    statut: 'brouillon',
    id_pilote: 0,
    priorite: 'normale',
    date_debut: '',
    date_fin: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger le projet en mode édition
  useEffect(() => {
    if (isEditing && projet) {
      setFormData({
        titre: projet.titre,
        description: projet.description || '',
        type_projet: projet.type_projet,
        statut: projet.statut,
        id_pilote: projet.id_pilote,
        priorite: projet.priorite,
        date_debut: projet.date_debut ? projet.date_debut.split('T')[0] : '',
        date_fin: projet.date_fin ? projet.date_fin.split('T')[0] : '',
      });
    }
  }, [isEditing, projet]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    let processedValue: string | number = value;
    if (name === 'id_pilote') {
      processedValue = value === '' ? 0 : parseInt(value);
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { createProjetService, updateProjetService } = await import('../../../API/services/projet.service');

      if (isEditing) {
        await updateProjetService(parseInt(id!), formData as UpdateProjetData);
      } else {
        await createProjetService(formData as CreateProjetData);
      }

      navigate('/projets');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [formData, isEditing, id, navigate]);

  const handleDelete = useCallback(async () => {
    const confirmed = await showConfirm(
      'Êtes-vous sûr de vouloir supprimer ce projet ?',
      'Confirmation de suppression'
    );

    if (!confirmed) return;

    setIsLoading(true);
    setError(null);

    try {
      const { deleteProjetService } = await import('../../../API/services/projet.service');
      await deleteProjetService(parseInt(id!));
      navigate('/projets');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate, showConfirm]);

  const typeProjetOptions: { value: TypeProjet; label: string }[] = [
    { value: 'developpement', label: 'Développement' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'administratif', label: 'Administratif' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'rh', label: 'RH' },
    { value: 'technique', label: 'Technique' },
    { value: 'autre', label: 'Autre' },
  ];

  const statutOptions: { value: StatutProjet; label: string }[] = [
    { value: 'brouillon', label: 'Brouillon' },
    { value: 'actif', label: 'Actif' },
    { value: 'en_pause', label: 'En pause' },
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
    <div id="projetForm">
      <Header />
      <SubNav />
      <main>
        <div className="projetForm__container">
          {/* Header */}
          <div className="projetForm__header">
            <Button style="back" onClick={() => navigate('/projets')}>
              <IoArrowBack />
              <span>Retour</span>
            </Button>
            <h1>{isEditing ? 'Modifier le projet' : 'Nouveau projet'}</h1>
            {isEditing && (
              <Button style="red" onClick={handleDelete}>
                <IoTrash />
                <span>Supprimer</span>
              </Button>
            )}
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="projetForm__form">
            {/* Informations générales */}
            <div className="projetForm__section">
              <h2>Informations générales</h2>

              <div className="projetForm__field">
                <label htmlFor="titre">Titre *</label>
                <input
                  type="text"
                  id="titre"
                  name="titre"
                  value={formData.titre}
                  onChange={handleInputChange}
                  required
                  placeholder="Titre du projet"
                />
              </div>

              <div className="projetForm__field">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Description du projet..."
                />
              </div>

              <div className="projetForm__row">
                <div className="projetForm__field">
                  <label htmlFor="type_projet">Type de projet *</label>
                  <select
                    id="type_projet"
                    name="type_projet"
                    value={formData.type_projet}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Sélectionner...</option>
                    {typeProjetOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="projetForm__field">
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

                <div className="projetForm__field">
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

            {/* Responsable et dates */}
            <div className="projetForm__section">
              <h2>Responsable et planning</h2>

              <div className="projetForm__field">
                <label htmlFor="id_pilote">Pilote du projet *</label>
                <select
                  id="id_pilote"
                  name="id_pilote"
                  value={formData.id_pilote}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Sélectionner un pilote...</option>
                  {employes.map((employe) => (
                    <option key={employe.id_employe} value={employe.id_employe}>
                      {employe.prenom} {employe.nom} - {employe.poste?.libelle_poste}
                    </option>
                  ))}
                </select>
              </div>

              <div className="projetForm__row">
                <div className="projetForm__field">
                  <label htmlFor="date_debut">Date de début</label>
                  <input
                    type="date"
                    id="date_debut"
                    name="date_debut"
                    value={formData.date_debut}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="projetForm__field">
                  <label htmlFor="date_fin">Date de fin</label>
                  <input
                    type="date"
                    id="date_fin"
                    name="date_fin"
                    value={formData.date_fin}
                    onChange={handleInputChange}
                    min={formData.date_debut}
                  />
                </div>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="projetForm__error">
                <p>{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="projetForm__actions">
              <Button
                type="button"
                style="white"
                onClick={() => navigate('/projets')}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                style="gradient"
                disabled={isLoading}
              >
                <IoSave />
                <span>{isLoading ? 'Enregistrement...' : isEditing ? 'Mettre à jour' : 'Créer le projet'}</span>
              </Button>
            </div>
          </form>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const ProjetFormWithAuth = WithAuth(ProjetForm);
export default ProjetFormWithAuth;
