import { useNavigate, useParams } from 'react-router-dom';
import {
  parseCampaignRouteId,
  PROSPECT_FALLBACK_AREA_OPTIONS,
  PROSPECT_RELATION_OPTIONS,
  PROSPECT_SOURCE_OPTIONS,
  PROSPECT_TYPE_OPTIONS,
} from '../utils/scripts/index.ts';
import { useProspectInjection } from './useProspectInjection.ts';

export function useProspectInjectionPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const campagneId = parseCampaignRouteId(id);
  return {
    ...useProspectInjection(campagneId),
    campagneId,
    fallbackAreaOptions: PROSPECT_FALLBACK_AREA_OPTIONS,
    relationOptions: PROSPECT_RELATION_OPTIONS,
    navigateBack: () => void navigate('/operations/prospects'),
    sourceOptions: PROSPECT_SOURCE_OPTIONS,
    typeOptions: PROSPECT_TYPE_OPTIONS,
  };
}

export type ProspectInjectionPageViewModel = ReturnType<typeof useProspectInjectionPage>;
