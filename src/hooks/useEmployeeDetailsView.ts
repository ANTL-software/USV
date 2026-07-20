import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployeeDetails } from './useEmployeeDetails.ts';

export function useEmployeeDetailsView() {
  const navigate = useNavigate();
  const employeeDetails = useEmployeeDetails();
  const navigateBack = useCallback((): void => {
    navigate('/operations/employes');
  }, [navigate]);

  return {
    ...employeeDetails,
    navigateBack,
  };
}

export type EmployeeDetailsViewModel = ReturnType<typeof useEmployeeDetailsView>;
