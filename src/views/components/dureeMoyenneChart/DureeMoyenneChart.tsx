import { ReactElement } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DureeMoyenneParJour } from '../../../utils/types/graphiques.types';
import './dureeMoyenneChart.scss';

interface DureeMoyenneChartProps {
  data: DureeMoyenneParJour[];
}

/**
 * Composant graphique Durée moyenne des appels (Line Chart 7j)
 * Affiche l'évolution de la durée moyenne des appels sur 7 jours
 */
function DureeMoyenneChart({ data }: DureeMoyenneChartProps): ReactElement {
  // Formatter les données pour le graphique
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
    duree: Math.round(item.duree_moyenne)
  }));

  // Formatter la durée en minutes:secondes
  const formatDuree = (secondes: number): string => {
    const minutes = Math.floor(secondes / 60);
    const secs = secondes % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div id="dureeMoyenneChart">
      <div className="dureeMoyenneChart__container">
        <div className="dureeMoyenneChart__header">
          <h3>Durée moyenne des appels (7 jours)</h3>
        </div>
        <div className="dureeMoyenneChart__chart">
          {data.length === 0 ? (
            <p className="dureeMoyenneChart__empty">Aucune donnée disponible</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#5a6c7d' }}
                  stroke="#5a6c7d"
                />
                <YAxis
                  tickFormatter={formatDuree}
                  tick={{ fontSize: 12, fill: '#5a6c7d' }}
                  stroke="#5a6c7d"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#2c3e50',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff'
                  }}
                  labelStyle={{ color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="duree"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  dot={{ fill: '#7c3aed', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default DureeMoyenneChart;
