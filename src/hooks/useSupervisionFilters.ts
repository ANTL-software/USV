import { useEffect, useState } from 'react';
import {
  getEmployeGraphiquesService,
  getSupervisionAgentsService,
} from '../API/services/index.ts';
import type { AllGraphiquesStats, SupervisionAgentOption } from '../utils/types/index.ts';

interface UseSupervisionAgentsResult {
  agents: SupervisionAgentOption[];
  isLoading: boolean;
}

export function useSupervisionAgents(
  idCampagne: number | null,
): UseSupervisionAgentsResult {
  const [agents, setAgents] = useState<SupervisionAgentOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    if (!idCampagne) {
      queueMicrotask(() => {
        if (isCurrent) setAgents([]);
      });
      return () => {
        isCurrent = false;
      };
    }

    const loadAgents = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const result = await getSupervisionAgentsService(idCampagne);
        if (isCurrent) setAgents(result);
      } catch (error) {
        console.error('[useSupervisionAgents] Erreur chargement agents:', error);
        if (isCurrent) setAgents([]);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    void loadAgents();
    return () => {
      isCurrent = false;
    };
  }, [idCampagne]);

  return { agents, isLoading };
}

interface UseEmployeGraphiquesResult {
  stats: AllGraphiquesStats | null;
  isLoading: boolean;
}

export function useEmployeGraphiques(
  idCampagne: number | null,
  idEmploye: number | null,
  dateDebut?: string,
  dateFin?: string,
): UseEmployeGraphiquesResult {
  const [stats, setStats] = useState<AllGraphiquesStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isCurrent = true;

    if (!idCampagne || !idEmploye) {
      queueMicrotask(() => {
        if (isCurrent) setStats(null);
      });
      return () => {
        isCurrent = false;
      };
    }

    const loadStats = async (): Promise<void> => {
      setIsLoading(true);
      try {
        const result = await getEmployeGraphiquesService(
          idCampagne,
          idEmploye,
          dateDebut,
          dateFin,
        );
        if (isCurrent) setStats(result);
      } catch (error) {
        console.error('[useEmployeGraphiques] Erreur chargement stats employé:', error);
        if (isCurrent) setStats(null);
      } finally {
        if (isCurrent) setIsLoading(false);
      }
    };

    void loadStats();
    return () => {
      isCurrent = false;
    };
  }, [dateDebut, dateFin, idCampagne, idEmploye]);

  return { stats, isLoading };
}
