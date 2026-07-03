export const LEAD_CLIENT_RENDEZ_VOUS_MOTIF = 'Prise de rendez-vous client';

export function isLeadClientRendezVous(motif: string | null | undefined): boolean {
  if (typeof motif !== 'string') {
    return false;
  }

  return motif.trim().toLowerCase() === LEAD_CLIENT_RENDEZ_VOUS_MOTIF.toLowerCase();
}

export function formatLeadClientReference(idRendezVous: number): string {
  return `L-${String(idRendezVous).padStart(5, '0')}`;
}
