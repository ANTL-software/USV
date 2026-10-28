import { useNavigate } from 'react-router-dom';
import { hasAccessToPath } from '../utils/scripts/index.ts';
import { useUserContext } from './useUserContext.ts';

export function useStatistiquesPage() {
  const navigate = useNavigate();
  const { user } = useUserContext();
  return {
    navigateBack: () => void navigate('/operations'),
    entries: [
      { title: 'Suivis mensuel commercial', path: '/operations/statistiques/suivi-mensuel-commercial', description: 'Consulter l’activité, le ProgPA et la prime mensuelle de chaque commercial.' },
      { title: 'Vigie', path: '/operations/statistiques/vigie', description: 'Suivre les campagnes, la joignabilité et les indicateurs de prospection.' },
      { title: 'Statistique progPA', path: '/operations/statistiques/progpa', description: 'Consulter les statistiques progPA et les résultats des agents.' },
      { title: 'Comparatif mensuel', path: '/operations/statistiques/comparatif', description: 'Comparer les mois et explorer les écarts de performance.' },
    ].filter(({ path }) => hasAccessToPath(user, path)),
    navigateTo: (path: string) => void navigate(path),
  };
}
export type StatistiquesPageViewModel = ReturnType<typeof useStatistiquesPage>;
