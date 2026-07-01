import type { Prospect } from '../types/prospect.types';

export function isProspectGloballyFlagged(prospect: Pick<Prospect, 'est_doublon' | 'blacklist'>): boolean {
  return prospect.est_doublon || prospect.blacklist === true;
}

export function getProspectStatusHeading(hasCampaignContext: boolean): string {
  return hasCampaignContext ? 'Statut global' : 'Statut actuel';
}

export function getProspectCampaignStatusHeading(hasCampaignContext: boolean): string {
  return hasCampaignContext ? 'Statut campagne' : 'Statut d\'appel';
}

export function getLegacyOptoutLabel(): string {
  return 'Opt-out global (legacy)';
}
