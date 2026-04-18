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
