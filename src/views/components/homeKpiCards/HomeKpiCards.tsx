import type { ReactElement } from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import type { HomeKpisState } from '../../../hooks/index.ts';
import type { SparklinePoint } from '../../../utils/types/index.ts';
import './homeKpiCards.scss';

interface HomeKpiCardsProps {
  kpisState: HomeKpisState;
}

interface SparklineProps {
  data?: SparklinePoint[];
  color: string;
}

function MiniSparkline({ data, color }: SparklineProps): ReactElement {
  const chartData = data && data.length > 0
    ? data
    : [{ date: '1', value: 0 }, { date: '2', value: 0 }];

  return (
    <div className="homeKpiCards__sparkline">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 2, right: 1, bottom: 2, left: 1 }}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function HomeKpiCards({ kpisState }: HomeKpiCardsProps): ReactElement {
  const { kpis, isLoading } = kpisState;

  const cards = [
    {
      id: 'commandes',
      label: 'Commandes validées',
      value: isLoading ? '...' : (kpis?.commandesValidees?.total ?? 0).toLocaleString('fr-FR'),
      trend: kpis?.commandesValidees?.trend ?? [],
      color: '#7c3aed',
      isAmount: false,
    },
    {
      id: 'ca',
      label: 'CA du mois (Ventes)',
      value: isLoading ? '...' : (kpis?.caMoisVentes?.formatted ?? '0,00 €'),
      trend: kpis?.caMoisVentes?.trend ?? [],
      color: '#8b5cf6',
      isAmount: true,
    },
    {
      id: 'rdv',
      label: 'RDV lead B2B',
      value: isLoading ? '...' : (kpis?.rdvClientsPlanifies?.total ?? 0).toLocaleString('fr-FR'),
      trend: kpis?.rdvClientsPlanifies?.trend ?? [],
      color: '#a78bfa',
      isAmount: false,
    },
    {
      id: 'commerciaux',
      label: 'Commerciaux en ligne',
      value: isLoading ? '...' : (kpis?.commerciauxActifsJour?.total ?? 0).toLocaleString('fr-FR'),
      trend: kpis?.commerciauxActifsJour?.trend ?? [],
      color: '#10b981',
      isAmount: false,
    },
    {
      id: 'incidents',
      label: 'Incidents ouverts',
      value: isLoading ? '...' : (kpis?.incidentsOuverts?.total ?? 0).toLocaleString('fr-FR'),
      trend: kpis?.incidentsOuverts?.trend ?? [],
      color: '#ef4444',
      isAmount: false,
    },
    {
      id: 'projets',
      label: 'Projets en cours',
      value: isLoading ? '...' : (kpis?.projetsEnCours?.total ?? 0).toLocaleString('fr-FR'),
      trend: kpis?.projetsEnCours?.trend ?? [],
      color: '#0284c7',
      isAmount: false,
    },
    {
      id: 'rdv-agenda',
      label: 'RDV Agenda aujourd’hui',
      value: isLoading ? '...' : (kpis?.rdvAgendaJour?.total ?? 0).toLocaleString('fr-FR'),
      trend: kpis?.rdvAgendaJour?.trend ?? [],
      color: '#f59e0b',
      isAmount: false,
    },
  ];

  return (
    <section id="homeKpiCards" aria-label="Aperçu global et KPI clés">
      <h2 className="homeKpiCards__title">Aperçu Global et KPI Clés</h2>
      <div className="homeKpiCards__grid">
        {cards.map((card) => (
          <article
            key={card.id}
            className={`homeKpiCards__card ${card.isAmount ? 'homeKpiCards__card--amount' : ''}`}
          >
            <div className="homeKpiCards__card-header">
              <span>{card.label}</span>
            </div>
            <div className="homeKpiCards__card-body">
              <strong>{card.value}</strong>
              <MiniSparkline data={card.trend} color={card.color} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
