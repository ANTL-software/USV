import { useEffect, useState } from 'react';
import { getProspectSourcesService } from '../API/services/index.ts';
import { useNavigate, useParams } from 'react-router-dom';
import {
  parseCampaignRouteId,
  PROSPECT_FALLBACK_AREA_OPTIONS,
  PROSPECT_RELATION_OPTIONS,
  type ProspectSelectOption,
  PROSPECT_TYPE_OPTIONS,
} from '../utils/scripts/index.ts';
import { useProspectInjection } from './useProspectInjection.ts';

const DEFAULT_SOURCE_OPTIONS: ProspectSelectOption[] = [{ value: '', label: 'Tous' }];

export function useProspectInjectionPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const campagneId = parseCampaignRouteId(id);
  const injection = useProspectInjection(campagneId);
  const [sourceOptions, setSourceOptions] = useState<ProspectSelectOption[]>(DEFAULT_SOURCE_OPTIONS);
  const [availableSources, setAvailableSources] = useState<Set<string> | null>(null);

  useEffect(() => {
    let isCancelled = false;

    void getProspectSourcesService()
      .then((sources) => {
        if (isCancelled) return;
        setAvailableSources(new Set(sources.map(({ source }) => source)));
        setSourceOptions([
          ...DEFAULT_SOURCE_OPTIONS,
          ...sources.map(({ source, prospect_count }) => ({
            value: source,
            label: `${source} (${prospect_count.toLocaleString('fr-FR')})`,
          })),
        ]);
      })
      .catch(() => {
        if (!isCancelled) {
          setAvailableSources(new Set());
          setSourceOptions(DEFAULT_SOURCE_OPTIONS);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (
      availableSources
      && injection.filters.source
      && !availableSources.has(injection.filters.source)
    ) {
      injection.setFilters({ ...injection.filters, source: undefined });
    }
  }, [availableSources, injection.filters, injection.setFilters]);

  return {
    ...injection,
    campagneId,
    fallbackAreaOptions: PROSPECT_FALLBACK_AREA_OPTIONS,
    relationOptions: PROSPECT_RELATION_OPTIONS,
    navigateBack: () => void navigate('/operations/prospects'),
    sourceOptions,
    typeOptions: PROSPECT_TYPE_OPTIONS,
  };
}

export type ProspectInjectionPageViewModel = ReturnType<typeof useProspectInjectionPage>;
