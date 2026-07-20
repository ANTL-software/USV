import { useNavigate } from 'react-router-dom';
import { useCampagnes } from './useCampagnes.ts';

export function useCampagnesListPage() {
  const navigate = useNavigate();
  return {
    ...useCampagnes(),
    navigateBack: () => void navigate('/operations'),
    navigateToCampaign: (id: number) => void navigate(`/campagnes/${id}`),
    navigateToCreate: () => void navigate('/campagnes/new'),
  };
}

export type CampagnesListPageViewModel = ReturnType<typeof useCampagnesListPage>;
