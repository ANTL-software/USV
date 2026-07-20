import { hasAccessToSection } from '../utils/scripts/index.ts';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from './useUserContext.ts';

export function useHomePage() {
  const navigate = useNavigate();
  const { user } = useUserContext();
  return {
    access: {
      booking: hasAccessToSection(user, 'booking'),
      commercial: hasAccessToSection(user, 'commercial'),
      commerciaux: hasAccessToSection(user, 'commerciaux'),
      incidents: hasAccessToSection(user, 'incidents'),
      mail: hasAccessToSection(user, 'mail'),
      operations: hasAccessToSection(user, 'operations'),
      projets: hasAccessToSection(user, 'projets'),
    },
    navigateTo: (path: string) => void navigate(path),
  };
}

export type HomePageViewModel = ReturnType<typeof useHomePage>;
