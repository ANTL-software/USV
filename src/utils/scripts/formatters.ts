/**
 * Formate une date ISO en format français court (ex: "15/01/2024")
 * Retourne "N/A" si la chaîne est vide/undefined.
 */
export function formatDate(dateString?: string | null): string {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('fr-FR');
}

/**
 * Retourne la classe CSS de badge pour une direction de courrier.
 */
export function getDirectionBadge(direction: string): string {
  const map: Record<string, string> = {
    entrant: 'badge-entrant',
    sortant: 'badge-sortant',
    interne: 'badge-interne',
  };
  return map[direction] ?? '';
}

/**
 * Formate une durée en secondes en chaîne lisible (ex: "5:30", "1:05:00")
 */
export function formatCallDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Formate un temps écoulé depuis une date ISO en chaîne lisible (ex: "2h05", "15min 30s", "45s")
 */
export function formatSince(isoDate: string | null): string {
  if (!isoDate) return '';
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (seconds < 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h${m.toString().padStart(2, '0')}`;
  if (m > 0) return `${m}min ${s}s`;
  return `${s}s`;
}

/**
 * Formate une date au format court français (ex: 15/01/2024)
 */
export function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
}

/**
 * Formate l'heure au format HH:MM à partir d'une date ISO
 */
export function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formate une durée en secondes en "Xm Ys" ou "N/A"
 */
export function formatDurationFromSeconds(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return 'N/A';
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}

/**
 * Retourne la classe CSS de badge pour un statut d'appel
 */
export function getStatutAppelClass(statut: string): string {
  switch (statut) {
    case 'abouti':
    case 'vente_conclue':
    case 'rdv_pris':
    case 'rendez_vous_pris':
    case 'relance':
      return 'success';
    case 'non_abouti':
    case 'fax':
    case 'repondeur':
    case 'amd_repondeur_auto':
    case 'amd_fax_auto':
      return 'warning';
    case 'refus_definitif':
    case 'doublon':
    case 'optout':
      return 'danger';
    default:
      return 'info';
  }
}

const STATUT_APPEL_LABELS: Record<string, string> = {
  abouti: 'Abouti',
  non_abouti: 'Non abouti',
  rendez_vous_pris: 'Rendez-vous pris',
  rdv_pris: 'Commande à établir',
  vente_conclue: 'Vente conclue',
  refus_definitif: 'Refus définitif',
  en_cours: 'En cours',
  fax: 'Fax',
  siege: 'Siège',
  faillite: 'Faillite',
  pas_attribue: 'Pas attribué',
  particulier: 'Particulier',
  pas_disponible: 'Pas disponible',
  doublon: 'Doublon',
  optout: 'Opt-out',
  repondeur: 'Répondeur',
  relance: 'Relance',
  amd_repondeur_auto: 'Répondeur auto coupé',
  amd_fax_auto: 'Fax auto coupé',
};

/**
 * Retourne le label français d'un statut d'appel
 */
export function getStatutAppelLabel(statut: string): string {
  return STATUT_APPEL_LABELS[statut] || statut;
}

const STATUT_PROSPECT_LABELS: Record<string, string> = {
  nouveau: 'Nouveau',
  contacte: 'Contacté',
  interesse: 'Intéressé',
  rappel: 'Rappel',
  non_interesse: 'Non intéressé',
  vente_conclue: 'Vente conclue',
};

export function getStatutProspectLabel(statut: string): string {
  return STATUT_PROSPECT_LABELS[statut] || statut;
}

