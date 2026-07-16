import { useNavigate } from 'react-router-dom';
import { formatProspectSignalDate, PROSPECT_SIGNALEMENT_TYPE_OPTIONS } from '../utils/scripts/index.ts';
import { useProspectsSignales } from './useProspectsSignales.ts';

export function useProspectsSignalesPage() {
  const navigate = useNavigate();
  return {
    ...useProspectsSignales(),
    formatDate: formatProspectSignalDate,
    navigateBack: () => void navigate('/operations/qualite'),
    typeOptions: PROSPECT_SIGNALEMENT_TYPE_OPTIONS,
  };
}

export type ProspectsSignalesPageViewModel = ReturnType<typeof useProspectsSignalesPage>;
