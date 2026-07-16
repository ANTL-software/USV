import { useNavigate } from 'react-router-dom';
import { hasAccessToSubsection } from '../utils/scripts/index.ts';
import { useUserContext } from './useUserContext.ts';
import { useBookingCalendarView } from './useBookingCalendarView.ts';
import type { BookingCalendarViewModel } from './useBookingCalendarView.ts';

export interface CommercialPageViewModel {
  navigateBack: () => void;
  navigateToConfiguration: () => void;
  navigateToDevis: () => void;
  navigateToFacturation: () => void;
}

export interface CommerciauxPageViewModel {
  navigateBack: () => void;
  navigateToNotes: () => void;
  navigateToPlanning: () => void;
}

export interface CentreAppelsPageViewModel {
  access: {
    campagnes: boolean;
    commandes: boolean;
    employes: boolean;
    materiel: boolean;
    postes: boolean;
    produits: boolean;
    prospects: boolean;
    qualite: boolean;
    demandesAbsence: boolean;
    supervision: boolean;
  };
  navigateBack: () => void;
  navigateToCampagnes: () => void;
  navigateToCommandes: () => void;
  navigateToDemandesAbsence: () => void;
  navigateToEmployes: () => void;
  navigateToMateriel: () => void;
  navigateToPostes: () => void;
  navigateToProduits: () => void;
  navigateToProspects: () => void;
  navigateToQualite: () => void;
  navigateToSupervision: () => void;
  navigateToVigie: () => void;
}

export interface IncidentsHubPageViewModel {
  access: {
    declarer: boolean;
    liste: boolean;
    qualifier: boolean;
    traiter: boolean;
  };
  navigateBack: () => void;
  navigateToDeclaration: () => void;
  navigateToListe: () => void;
  navigateToQualification: () => void;
  navigateToTraitement: () => void;
}

export interface QualitePageViewModel {
  navigateBack: () => void;
  navigateToEcoutes: () => void;
  navigateToSignalements: () => void;
  navigateToStatistiques: () => void;
}

export interface BookingPageViewModel {
  booking: BookingCalendarViewModel;
  navigateBack: () => void;
}

export function useCommercialPage(): CommercialPageViewModel {
  const navigate = useNavigate();
  return {
    navigateBack: () => void navigate('/home'),
    navigateToConfiguration: () => void navigate('/commercial/configuration-antl'),
    navigateToDevis: () => void navigate('/commercial/devis'),
    navigateToFacturation: () => void navigate('/commercial/facturation'),
  };
}

export function useCommerciauxPage(): CommerciauxPageViewModel {
  const navigate = useNavigate();
  return {
    navigateBack: () => void navigate('/home'),
    navigateToNotes: () => void navigate('/commerciaux/notes-direction'),
    navigateToPlanning: () => void navigate('/commerciaux/mon_planning'),
  };
}

export function useCentreAppelsPage(): CentreAppelsPageViewModel {
  const navigate = useNavigate();
  const { user } = useUserContext();
  return {
    access: {
      campagnes: hasAccessToSubsection(user, 'operations', 'campagnes'),
      commandes: hasAccessToSubsection(user, 'operations', 'commandes'),
      demandesAbsence: hasAccessToSubsection(user, 'operations', 'demandes-absence'),
      employes: hasAccessToSubsection(user, 'operations', 'employes'),
      materiel: hasAccessToSubsection(user, 'operations', 'materiel'),
      postes: hasAccessToSubsection(user, 'operations', 'postes'),
      produits: hasAccessToSubsection(user, 'operations', 'produits'),
      prospects: hasAccessToSubsection(user, 'operations', 'prospects'),
      qualite: hasAccessToSubsection(user, 'operations', 'qualite'),
      supervision: hasAccessToSubsection(user, 'operations', 'supervision'),
    },
    navigateBack: () => void navigate('/home'),
    navigateToCampagnes: () => void navigate('/campagnes'),
    navigateToCommandes: () => void navigate('/operations/commandes'),
    navigateToDemandesAbsence: () => void navigate('/operations/demandes-absence'),
    navigateToEmployes: () => void navigate('/operations/employes'),
    navigateToMateriel: () => void navigate('/operations/materiel'),
    navigateToPostes: () => void navigate('/operations/postes'),
    navigateToProduits: () => void navigate('/produits'),
    navigateToProspects: () => void navigate('/operations/prospects'),
    navigateToQualite: () => void navigate('/operations/qualite'),
    navigateToSupervision: () => void navigate('/supervision'),
    navigateToVigie: () => void navigate('/operations/vigie'),
  };
}

export function useIncidentsHubPage(): IncidentsHubPageViewModel {
  const navigate = useNavigate();
  const { user } = useUserContext();
  return {
    access: {
      declarer: hasAccessToSubsection(user, 'incidents', 'declarer'),
      liste: hasAccessToSubsection(user, 'incidents', 'liste'),
      qualifier: hasAccessToSubsection(user, 'incidents', 'qualifier'),
      traiter: hasAccessToSubsection(user, 'incidents', 'traiter'),
    },
    navigateBack: () => void navigate('/home'),
    navigateToDeclaration: () => void navigate('/incidents/declarer'),
    navigateToListe: () => void navigate('/incidents/liste'),
    navigateToQualification: () => void navigate('/incidents/qualification'),
    navigateToTraitement: () => void navigate('/incidents/traitement'),
  };
}

export function useQualitePage(): QualitePageViewModel {
  const navigate = useNavigate();
  return {
    navigateBack: () => void navigate('/operations'),
    navigateToEcoutes: () => void navigate('/operations/qualite/ecoutes'),
    navigateToSignalements: () => void navigate('/operations/qualite/signalements'),
    navigateToStatistiques: () => void navigate('/operations/qualite/statistiques'),
  };
}

export function useBookingPage(): BookingPageViewModel {
  const navigate = useNavigate();
  return { booking: useBookingCalendarView(), navigateBack: () => void navigate('/home') };
}
