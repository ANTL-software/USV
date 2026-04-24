import { ReactElement } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { TauxAbouti } from '../../utils/types/graphiques.types';
import './tauxAboutiChart.scss';

interface TauxAboutiChartProps {
  data: TauxAbouti;
}

const COLORS = {
  aboutis: '#27ae60',
  nonAboutis: '#e74c3c'
};

/**
 * Composant graphique Taux d'abouti (Pie Chart)
 * Affiche la proportion d'appels aboutis vs non aboutis
 */
function TauxAboutiChart({ data }: TauxAboutiChartProps): ReactElement {
  const chartData = [
    { name: 'Aboutis', value: data.aboutis, color: COLORS.aboutis },
    { name: 'Non aboutis', value: data.non_aboutis, color: COLORS.nonAboutis }
  ];

  return (
    <div id="tauxAboutiChart">
      <div className="tauxAboutiChart__container">
        <div className="tauxAboutiChart__header">
          <h3>Taux d&#39;abouti</h3>
          <span className="tauxAboutiChart__taux">{data.taux_abouti}%</span>
        </div>
        <div className="tauxAboutiChart__chart">
          {data.aboutis === 0 && data.non_aboutis === 0 ? (
            <p className="tauxAboutiChart__empty">Aucune donnée disponible</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) =>
                    `${name || ''} ${percent ? (percent * 100).toFixed(0) : '0'}%`
                  }
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
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
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="tauxAboutiChart__details">
          <div className="tauxAboutiChart__detail">
            <span className="tauxAboutiChart__dot tauxAboutiChart__dot--aboutis" />
            <span>Aboutis: {data.aboutis}</span>
          </div>
          <div className="tauxAboutiChart__detail">
            <span className="tauxAboutiChart__dot tauxAboutiChart__dot--nonAboutis" />
            <span>Non aboutis: {data.non_aboutis}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TauxAboutiChart;
