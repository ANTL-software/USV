import { ReactElement } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { AppelsParOrigine } from '../../utils/types/graphiques.types';
import './appelsParOrigineChart.scss';

// Constantes locales pour les origines d'appels
const ORIGINE_LABELS: Record<string, string> = {
  auto: 'File',
  manuel: 'Manuel',
  rappel: 'Rappel',
};

const ORIGINE_COLORS: Record<string, string> = {
  auto: '#3498db',
  manuel: '#6366f1',
  rappel: '#f39c12',
};

interface AppelsParOrigineChartProps {
  data: AppelsParOrigine[];
}

/**
 * Composant graphique Appels par origine (Pie Chart)
 * Affiche la répartition des appels par origine: auto, manuel, rappel
 */
function AppelsParOrigineChart({ data }: AppelsParOrigineChartProps): ReactElement {
  // Calculer le total
  const total = data.reduce((sum, item) => sum + item.nombre, 0);

  // Formatter les données pour le graphique
  const chartData = data.map((item) => ({
    name: ORIGINE_LABELS[item.origine] || item.origine,
    value: item.nombre,
    color: ORIGINE_COLORS[item.origine] || '#95a5a6',
    origine: item.origine,
    percentage: total > 0 ? (item.nombre / total) * 100 : 0
  }));

  // Custom tooltip pour afficher le nombre et le pourcentage
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const entry = payload[0].payload;
      return (
        <div className="appelsParOrigineChart__tooltip">
          <span className="appelsParOrigineChart__tooltip-label">{entry.name}</span>
          <span className="appelsParOrigineChart__tooltip-value">
            {entry.value.toLocaleString('fr-FR')} appels
          </span>
          <span className="appelsParOrigineChart__tooltip-percentage">
            ({entry.percentage.toFixed(1)}%)
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div id="appelsParOrigineChart">
      <div className="appelsParOrigineChart__container">
        <div className="appelsParOrigineChart__header">
          <h3>Appels par origine</h3>
          <span className="appelsParOrigineChart__total">
            Total: {total.toLocaleString('fr-FR')} appels
          </span>
        </div>
        <div className="appelsParOrigineChart__chart">
          {data.length === 0 ? (
            <p className="appelsParOrigineChart__empty">Aucune donnée disponible</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={100}
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
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="appelsParOrigineChart__details">
          {chartData.map((entry) => (
            <div key={entry.origine} className="appelsParOrigineChart__detail">
              <span
                className="appelsParOrigineChart__dot"
                style={{ backgroundColor: entry.color }}
              />
              <span className="appelsParOrigineChart__detail-label">
                {entry.name}
              </span>
              <span className="appelsParOrigineChart__detail-value">
                {entry.value.toLocaleString('fr-FR')} ({entry.percentage.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AppelsParOrigineChart;
