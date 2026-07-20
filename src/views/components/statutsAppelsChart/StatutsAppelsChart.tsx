import { ReactElement } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { StatutAppelCount } from '../../../utils/types/index.ts';
import { STATUT_LABELS, STATUT_COLORS } from '../../../utils/types/index.ts';
import './statutsAppelsChart.scss';

interface StatutsAppelsChartProps {
  data: StatutAppelCount[];
}

interface StatutChartEntry {
  name: string;
  value: number;
  color: string;
  statut: string;
  percentage: number;
}

interface StatutTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: StatutChartEntry }>;
}

function StatutTooltip({ active, payload }: StatutTooltipProps): ReactElement | null {
  if (!active || !payload?.length) return null;
  const entry = payload[0].payload;
  return (
    <div className="statutsAppelsChart__tooltip">
      <span className="statutsAppelsChart__tooltip-label">{entry.name}</span>
      <span className="statutsAppelsChart__tooltip-value">{entry.value.toLocaleString('fr-FR')} appels</span>
      <span className="statutsAppelsChart__tooltip-percentage">({entry.percentage.toFixed(1)}%)</span>
    </div>
  );
}

/**
 * Composant graphique Répartition des appels par statut (Pie Chart)
 * Affiche la répartition de tous les statuts d'appels
 */
function StatutsAppelsChart({ data }: StatutsAppelsChartProps): ReactElement {
  // Calculer le total
  const total = data.reduce((sum, item) => sum + item.nombre, 0);

  // Formatter les données pour le graphique
  const chartData: StatutChartEntry[] = data.map((item) => ({
    name: STATUT_LABELS[item.statut] || item.statut,
    value: item.nombre,
    color: STATUT_COLORS[item.statut] || '#95a5a6',
    statut: item.statut,
    percentage: total > 0 ? (item.nombre / total) * 100 : 0
  }));

  return (
    <div id="statutsAppelsChart">
      <div className="statutsAppelsChart__container">
        <div className="statutsAppelsChart__header">
          <h3>Répartition des appels par statut</h3>
          <span className="statutsAppelsChart__total">
            Total: {total.toLocaleString('fr-FR')} appels
          </span>
        </div>
        <div className="statutsAppelsChart__chart">
          {data.length === 0 ? (
            <p className="statutsAppelsChart__empty">Aucune donnée disponible</p>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    percent && percent > 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                  }
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<StatutTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={40}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="statutsAppelsChart__details">
          {chartData.map((entry) => (
            <div key={entry.statut} className="statutsAppelsChart__detail">
              <span
                className="statutsAppelsChart__dot"
                style={{ backgroundColor: entry.color }}
              />
              <span className="statutsAppelsChart__detail-label">
                {entry.name}
              </span>
              <span className="statutsAppelsChart__detail-value">
                {entry.value.toLocaleString('fr-FR')} ({entry.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StatutsAppelsChart;
