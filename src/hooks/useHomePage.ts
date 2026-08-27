import { useNavigate } from 'react-router-dom';
import { hasAccessToSection, hasAccessToSubsection } from '../utils/scripts/index.ts';
import { useHomeKpis } from './useHomeKpis.ts';
import { useUserContext } from './useUserContext.ts';
import { useVigieView } from './useVigieView.ts';

export function useHomePage() {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const kpis = useHomeKpis();
  const vigie = useVigieView({ light: true });

  const access = {
    booking: hasAccessToSection(user, 'booking'),
    commercial: hasAccessToSection(user, 'commercial'),
    commerciaux: hasAccessToSection(user, 'commerciaux'),
    incidents: hasAccessToSection(user, 'incidents'),
    mail: hasAccessToSection(user, 'mail'),
    operations: hasAccessToSection(user, 'operations'),
    projets: hasAccessToSection(user, 'projets'),
    vigie: hasAccessToSubsection(user, 'operations', 'vigie'),
    // Droits pour l'affichage conditionnel des cartes KPI
    kpiCommandes: hasAccessToSubsection(user, 'operations', 'commandes'),
    kpiCommerciaux: hasAccessToSubsection(user, 'operations', 'supervision') || hasAccessToSubsection(user, 'operations', 'vigie'),
    kpiIncidents: hasAccessToSection(user, 'incidents'),
    kpiProjets: hasAccessToSection(user, 'projets'),
    kpiBooking: hasAccessToSection(user, 'booking'),
  };

  return {
    access,
    kpis,
    navigateTo: (path: string) => void navigate(path),
    vigie,
  };
}

export type HomePageViewModel = ReturnType<typeof useHomePage>;
