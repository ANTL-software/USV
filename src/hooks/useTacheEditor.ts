import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createTacheService,
  deleteTacheService,
  getTacheByIdService,
  updateTacheService,
} from '../API/services/index.ts';
import type { CreateTacheData, Priorite, StatutTache, UpdateTacheData } from '../utils/types/index.ts';
import { PROJECT_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from '../utils/scripts/index.ts';
import { useAlert } from './useAlert.ts';
import { useEmployes } from './useEmployes.ts';

interface TaskEditorFormData {
  titre: string;
  description: string;
  id_assigne: number;
  statut: StatutTache;
  priorite: Priorite;
  date_echeance: string;
  temps_esthe: number;
  progression: number;
}

const INITIAL_TASK_FORM: TaskEditorFormData = {
  titre: '',
  description: '',
  id_assigne: 0,
  statut: 'a_faire',
  priorite: 'normale',
  date_echeance: '',
  temps_esthe: 0,
  progression: 0,
};

export function useTacheEditor() {
  const navigate = useNavigate();
  const { id: projectIdParam, tacheId: taskIdParam } = useParams<{ id: string; tacheId?: string }>();
  const { showConfirm } = useAlert();
  const { employes } = useEmployes();
  const projectId = projectIdParam ? Number.parseInt(projectIdParam, 10) : null;
  const taskId = taskIdParam ? Number.parseInt(taskIdParam, 10) : null;
  const isEditing = taskId !== null;
  const [formData, setFormData] = useState<TaskEditorFormData>(INITIAL_TASK_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const taskListPath = projectId ? `/projets/${projectId}/taches` : '/projets';

  useEffect(() => {
    if (!taskId) return;
    let isCancelled = false;
    const loadTask = async (): Promise<void> => {
      try {
        setIsLoading(true);
        const task = await getTacheByIdService(taskId);
        if (!isCancelled) setFormData({
          titre: task.titre,
          description: task.description || '',
          id_assigne: task.id_assigne || 0,
          statut: task.statut,
          priorite: task.priorite,
          date_echeance: task.date_echeance?.split('T')[0] || '',
          temps_esthe: task.temps_esthe || 0,
          progression: task.progression || 0,
        });
      } catch (loadError) {
        if (!isCancelled) setError(loadError instanceof Error ? loadError.message : 'Erreur lors du chargement');
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };
    void loadTask();
    return () => { isCancelled = true; };
  }, [taskId]);

  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = event.target;
    const numericFields = new Set(['id_assigne', 'temps_esthe', 'progression']);
    setFormData((previous) => ({
      ...previous,
      [name]: numericFields.has(name) ? (value === '' ? 0 : Number.parseInt(value, 10)) : value,
    }));
  }, []);

  const submit = useCallback(async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!projectId) {
      setError('ID de projet manquant');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const data = { ...formData, id_projet: projectId };
      if (taskId) await updateTacheService(taskId, data as UpdateTacheData);
      else await createTacheService(data as CreateTacheData);
      navigate(taskListPath);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Erreur lors de l’enregistrement');
    } finally {
      setIsLoading(false);
    }
  }, [formData, navigate, projectId, taskId, taskListPath]);

  const deleteTask = useCallback(async (): Promise<void> => {
    if (!taskId || !await showConfirm('Êtes-vous sûr de vouloir supprimer cette tâche ?', 'Confirmation de suppression')) return;
    try {
      setIsLoading(true);
      setError(null);
      await deleteTacheService(taskId);
      navigate(taskListPath);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
    }
  }, [navigate, showConfirm, taskId, taskListPath]);

  return {
    deleteTask,
    employes,
    error,
    formData,
    goBack: () => navigate(taskListPath),
    handleInputChange,
    isEditing,
    isLoading,
    prioriteOptions: PROJECT_PRIORITY_OPTIONS,
    projectId,
    statutOptions: TASK_STATUS_OPTIONS,
    submit,
  };
}

export type TacheEditorViewModel = ReturnType<typeof useTacheEditor>;
