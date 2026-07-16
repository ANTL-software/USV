import { ReactElement } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { RaisonEchec } from '../../../utils/types/index.ts';
import { STATUT_LABELS, STATUT_COLORS } from '../../../utils/types/index.ts';
import './topRaisonsChart.scss';

interface TopRaisonsChartProps {
  data: RaisonEchec[];
}

/**
 * Composant graphique Top 5 raisons d'échec (Bar Chart horizontal)
 * Affiche les 5 raisons d'échec les plus fréquentes
 */
function TopRaisonsChart({ data }: TopRaisonsChartProps): ReactElement {
  // Formatter les données pour le graphique
  const chartData = data.map((item) => ({
    raison: STATUT_LABELS[item.raison] || item.raison,
    nombre: item.nombre,
    color: STATUT_COLORS[item.raison] || '#95a5a6'
  }));

  return (
    <div id="topRaisonsChart">
      <div className="topRaisonsChart__container">
        <div className="topRaisonsChart__header">
          <h3>Top 5 raisons d&#39;échec</h3>
        </div>
        <div className="topRaisonsChart__chart">
          {data.length === 0 ? (
            <p className="topRaisonsChart__empty">Aucune donnée disponible</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                layout="vertical"
                margin={{ left: 120, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: '#5a6c7d' }}
                  stroke="#5a6c7d"
                />
                <YAxis
                  type="category"
                  dataKey="raison"
                  tick={{ fontSize: 12, fill: '#5a6c7d' }}
                  stroke="#5a6c7d"
                  width={110}
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
                <Bar dataKey="nombre" radius={[0, 8, 8, 0]} fill="#7c3aed">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default TopRaisonsChart;
