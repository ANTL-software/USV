import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { StatutProjet } from '../utils/types/index.ts';
import {
  buildAvailableProjectMemberOptions,
  getProjectNextStatus,
  getProjectPilotId,
  getProjectStatusActionLabel,
} from '../utils/scripts/index.ts';
import { useEmployes } from './useEmployes.ts';
import { useProjet, useProjetDashboard, useProjetMembres, useProjets } from './useProjet.ts';

export function useProjetDetailsView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const projectId = id ? Number.parseInt(id, 10) : null;
  const projectState = useProjet(projectId);
  const dashboardState = useProjetDashboard(projectId);
  const memberState = useProjetMembres(projectId);
  const { updateStatutProjet } = useProjets();
  const { employes } = useEmployes();
  const [showMembreForm, setShowMembreForm] = useState(false);
  const [newMembreId, setNewMembreId] = useState('');
  const [newRole, setNewRole] = useState<'membre' | 'observateur'>('membre');

  const availableMemberOptions = useMemo(
    () => buildAvailableProjectMemberOptions(employes, memberState.membres, getProjectPilotId(projectState.projet)),
    [employes, memberState.membres, projectState.projet],
  );
  const nextStatus = projectState.projet ? getProjectNextStatus(projectState.projet.statut) : null;
  const statusActionLabel = projectState.projet ? getProjectStatusActionLabel(projectState.projet.statut) : null;

  const navigateToProjects = useCallback((): void => { void navigate('/projets'); }, [navigate]);
  const navigateToTasks = useCallback((): void => {
    if (projectId) void navigate(`/projets/${projectId}/taches`);
  }, [navigate, projectId]);
  const navigateToEdit = useCallback((): void => {
    if (projectId) void navigate(`/projets/${projectId}/edit`);
  }, [navigate, projectId]);

  const changeStatus = useCallback(async (status: StatutProjet): Promise<void> => {
    if (!projectId || !projectState.projet) return;
    try {
      await updateStatutProjet(projectId, status);
      await projectState.load();
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  }, [projectId, projectState, updateStatutProjet]);

  const applyNextStatus = useCallback(async (): Promise<void> => {
    if (nextStatus) await changeStatus(nextStatus);
  }, [changeStatus, nextStatus]);

  const addMember = useCallback(async (): Promise<void> => {
    if (!projectId || !newMembreId) return;
    try {
      await memberState.addMembre({ id_employe: Number.parseInt(newMembreId, 10), role: newRole });
      setNewMembreId('');
      setNewRole('membre');
      setShowMembreForm(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout du membre:", error);
    }
  }, [memberState, newMembreId, newRole, projectId]);

  const removeMember = useCallback(async (memberId: number): Promise<void> => {
    if (!projectId) return;
    try {
      await memberState.removeMembre(memberId);
    } catch (error) {
      console.error('Erreur lors du retrait du membre:', error);
    }
  }, [memberState, projectId]);

  return {
    addMember,
    applyNextStatus,
    availableMemberOptions,
    dashboard: dashboardState.dashboard,
    membres: memberState.membres,
    membresLoading: memberState.isLoading,
    navigateToEdit,
    navigateToProjects,
    navigateToTasks,
    newMembreId,
    newRole,
    projet: projectState.projet,
    projetError: projectState.error,
    projetLoading: projectState.isLoading,
    removeMember,
    setNewMembreId,
    setNewRole,
    setShowMembreForm,
    showMembreForm,
    statusActionLabel,
  };
}

export type ProjetDetailsViewModel = ReturnType<typeof useProjetDetailsView>;
