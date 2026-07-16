import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createProjetService,
  deleteProjetService,
  getProjetByIdService,
  updateProjetService,
} from '../API/services/index.ts';
import type { CreateProjetData, UpdateProjetData } from '../utils/types/index.ts';
import {
  PROJECT_PRIORITY_OPTIONS,
  PROJECT_STATUS_OPTIONS,
  PROJECT_TYPE_OPTIONS,
} from '../utils/scripts/index.ts';
import { useAlert } from './useAlert.ts';
import { useEmployes } from './useEmployes.ts';

const INITIAL_PROJECT_FORM: Partial<CreateProjetData> = {
  titre: '',
  description: '',
  type_projet: 'developpement',
  statut: 'brouillon',
  id_pilote: 0,
  priorite: 'normale',
  date_debut: '',
  date_fin: '',
};

export function useProjetEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { showConfirm } = useAlert();
  const { employes } = useEmployes();
  const projectId = id ? Number.parseInt(id, 10) : null;
  const isEditing = projectId !== null;
  const [formData, setFormData] = useState<Partial<CreateProjetData>>(INITIAL_PROJECT_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    let isCancelled = false;
    const loadProject = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const project = await getProjetByIdService(projectId);
        if (!isCancelled) {
          setFormData({
            titre: project.titre,
            description: project.description || '',
            type_projet: project.type_projet,
            statut: project.statut,
            id_pilote: project.id_pilote,
            priorite: project.priorite,
            date_debut: project.date_debut?.split('T')[0] || '',
            date_fin: project.date_fin?.split('T')[0] || '',
          });
        }
      } catch (loadError) {
        if (!isCancelled) setError(loadError instanceof Error ? loadError.message : 'Erreur lors du chargement');
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };
    void loadProject();
    return () => { isCancelled = true; };
  }, [projectId]);

  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: name === 'id_pilote' ? (value === '' ? 0 : Number.parseInt(value, 10)) : value,
    }));
  }, []);

  const submit = useCallback(async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      if (projectId) await updateProjetService(projectId, formData as UpdateProjetData);
      else await createProjetService(formData as CreateProjetData);
      navigate('/projets');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Erreur lors de l’enregistrement');
    } finally {
      setIsLoading(false);
    }
  }, [formData, navigate, projectId]);

  const deleteProject = useCallback(async (): Promise<void> => {
    if (!projectId || !await showConfirm('Êtes-vous sûr de vouloir supprimer ce projet ?', 'Confirmation de suppression')) return;
    try {
      setIsLoading(true);
      setError(null);
      await deleteProjetService(projectId);
      navigate('/projets');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, projectId, showConfirm]);

  return {
    deleteProject,
    employes,
    error,
    formData,
    goBack: () => navigate('/projets'),
    handleInputChange,
    isEditing,
    isLoading,
    prioriteOptions: PROJECT_PRIORITY_OPTIONS,
    statutOptions: PROJECT_STATUS_OPTIONS,
    submit,
    typeProjetOptions: PROJECT_TYPE_OPTIONS,
  };
}

export type ProjetEditorViewModel = ReturnType<typeof useProjetEditor>;
