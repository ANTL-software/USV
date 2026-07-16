import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAbsenceManagement } from './useAbsenceManagement.ts';

export function useAbsenceManagementView() {
  const navigate = useNavigate();
  const absenceManagement = useAbsenceManagement();
  const navigateBack = useCallback((): void => {
    navigate('/operations');
  }, [navigate]);

  return {
    ...absenceManagement,
    navigateBack,
  };
}

export type AbsenceManagementViewModel = ReturnType<typeof useAbsenceManagementView>;
