import type { ReactElement } from 'react';

interface CommandesEmailLegendProps {
  isLeadCampaign: boolean;
}

interface LegendItem {
  label: string;
  tone: 'completed' | 'client-pending' | 'prospect-pending';
}

const SALE_LEGEND_ITEMS: LegendItem[] = [
  { tone: 'prospect-pending', label: 'Bon de commande à envoyer au prospect' },
  { tone: 'client-pending', label: 'Bon de commande signé à envoyer au client' },
  { tone: 'completed', label: 'Envois terminés ou commande annulée' },
];

const LEAD_LEGEND_ITEMS: LegendItem[] = [
  { tone: 'client-pending', label: 'Fiche de rendez-vous à envoyer au client' },
  { tone: 'completed', label: 'Fiche de rendez-vous envoyée au client' },
];

export function CommandesEmailLegend({ isLeadCampaign }: CommandesEmailLegendProps): ReactElement {
  const items = isLeadCampaign ? LEAD_LEGEND_ITEMS : SALE_LEGEND_ITEMS;
  return <aside className="commandesList__email-legend" aria-label="Légende des couleurs d’envoi">
    <span className="commandesList__email-legend-title">Légende :</span>
    {items.map((item) => <span key={item.tone} className="commandesList__email-legend-item"><i className={`commandesList__email-legend-swatch commandesList__email-legend-swatch--${item.tone}`} aria-hidden="true" />{item.label}</span>)}
  </aside>;
}
