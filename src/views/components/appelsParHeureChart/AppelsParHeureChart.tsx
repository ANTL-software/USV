import { ReactElement } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { AppelsParHeure } from '../../../utils/types/graphiques.types';
import './appelsParHeureChart.scss';

interface AppelsParHeureChartProps {
  data: AppelsParHeure[];
}

/**
 * Composant graphique Appels par heure (Bar Chart 24h)
 * Affiche le nombre d'appels pour chaque heure de la journée
 */
function AppelsParHeureChart({ data }: AppelsParHeureChartProps): ReactElement {
  // Formatter les données pour le graphique
  const chartData = data.map((item) => ({
    heure: `${item.heure}h`,
    appels: item.nb_appels
  }));

  return (
    <div id="appelsParHeureChart">
      <div className="appelsParHeureChart__container">
        <div className="appelsParHeureChart__header">
          <h3>Appels par heure (24h)</h3>
        </div>
        <div className="appelsParHeureChart__chart">
          {data.length === 0 ? (
            <p className="appelsParHeureChart__empty">Aucune donnée disponible</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="heure"
                  tick={{ fontSize: 12, fill: '#5a6c7d' }}
                  stroke="#5a6c7d"
                />
                <YAxis
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
                <Bar dataKey="appels" fill="#7c3aed" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default AppelsParHeureChart;
