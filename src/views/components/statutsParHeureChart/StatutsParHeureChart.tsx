import { ReactElement } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { StatutAppelParHeure } from '../../../utils/types/graphiques.types';
import { STATUT_LABELS, STATUT_COLORS } from '../../../utils/types/graphiques.types';
import './statutsParHeureChart.scss';

interface StatutsParHeureChartProps {
  data: StatutAppelParHeure[];
}

interface StatutsParHeureTooltipProps {
  active?: boolean;
  payload?: readonly unknown[];
  label?: string | number;
}

/**
 * Composant graphique Statuts d'appels par heure (Stacked Bar Chart)
 * Affiche l'évolution des statuts d'appels heure par heure
 */
function StatutsParHeureChart({ data }: StatutsParHeureChartProps): ReactElement {
  // Protection contre data undefined ou vide
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div id="statutsParHeureChart">
        <div className="statutsParHeureChart__container">
          <div className="statutsParHeureChart__header">
            <h3>Statuts d'appels par heure (24h)</h3>
          </div>
          <div className="statutsParHeureChart__chart">
            <p className="statutsParHeureChart__empty">Aucune donnée disponible</p>
          </div>
        </div>
      </div>
    );
  }

  // Obtenir tous les statuts uniques présents dans les données
  const allStatuts = new Set<string>();
  data.forEach(hourData => {
    if (hourData && hourData.statuts && typeof hourData.statuts === 'object') {
      Object.keys(hourData.statuts).forEach(statut => allStatuts.add(statut));
    }
  });

  // Filtrer pour ne garder que les statuts les plus importants
  const importantStatuts = ['abouti', 'non_abouti', 'en_cours', 'rdv_pris', 'vente_conclue', 'refus_definitif', 'occupe', 'pas_de_reponse', 'rendez_vous_pris'];
  const displayStatuts = Array.from(allStatuts).filter(s => importantStatuts.includes(s));

  // Formatter les données pour le graphique (stacked bar chart)
  const chartData = data.map(hourData => {
    const hourObj: Record<string, number | string> = { heure: `${hourData?.heure || 0}h` };
    if (hourData && hourData.statuts && typeof hourData.statuts === 'object') {
      displayStatuts.forEach(statut => {
        hourObj[statut] = hourData.statuts[statut] || 0;
      });
    }
    return hourObj;
  });

  // Custom tooltip pour afficher les détails
  const CustomTooltip = ({ active, payload, label }: StatutsParHeureTooltipProps): ReactElement | null => {
    if (active && payload && payload.length) {
      const tooltipHour = typeof label === 'number' ? label : Number.parseInt(label ?? '', 10);
      const hourData = data.find(d => d.heure === tooltipHour);
      if (!hourData) return null;

      return (
        <div className="statutsParHeureChart__tooltip">
          <span className="statutsParHeureChart__tooltip-hour">Heure: {label}h</span>
          <div className="statutsParHeureChart__tooltip-statuts">
            {displayStatuts.map(statut => {
              const count = hourData?.statuts?.[statut] ?? 0;
              if (count === 0) return null;
              return (
                <div key={statut} className="statutsParHeureChart__tooltip-statut">
                  <span
                    className="statutsParHeureChart__tooltip-dot"
                    style={{ backgroundColor: STATUT_COLORS[statut] || '#95a5a6' }}
                  />
                  <span className="statutsParHeureChart__tooltip-label">
                    {STATUT_LABELS[statut] || statut}
                  </span>
                  <span className="statutsParHeureChart__tooltip-value">
                    {count.toLocaleString('fr-FR')}
                  </span>
                </div>
              );
            })}
          </div>
          <span className="statutsParHeureChart__tooltip-total">
            Total: {Object.values(hourData?.statuts || {}).reduce((a, b) => a + b, 0).toLocaleString('fr-FR')}
          </span>
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const CustomLegend = () => (
    <div className="statutsParHeureChart__legend">
      {displayStatuts.map(statut => (
        <div key={statut} className="statutsParHeureChart__legend-item">
          <span
            className="statutsParHeureChart__legend-dot"
            style={{ backgroundColor: STATUT_COLORS[statut] || '#95a5a6' }}
          />
          <span>{STATUT_LABELS[statut] || statut}</span>
        </div>
      ))}
    </div>
  );

  return (
    <div id="statutsParHeureChart">
      <div className="statutsParHeureChart__container">
        <div className="statutsParHeureChart__header">
          <h3>Statuts d'appels par heure (24h)</h3>
        </div>
        <div className="statutsParHeureChart__chart">
          {data.length === 0 ? (
            <p className="statutsParHeureChart__empty">Aucune donnée disponible</p>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} stackOffset="sign">
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="heure"
                  tick={{ fontSize: 11, fill: '#5a6c7d' }}
                  stroke="#5a6c7d"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#5a6c7d' }}
                  stroke="#5a6c7d"
                  tickFormatter={(value) => value.toLocaleString('fr-FR')}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  height={40}
                  content={<CustomLegend />}
                />
                {displayStatuts.map(statut => (
                  <Bar
                    key={statut}
                    dataKey={statut}
                    stackId="a"
                    fill={STATUT_COLORS[statut] || '#95a5a6'}
                    name={STATUT_LABELS[statut] || statut}
                    radius={[0, 0, 4, 4]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatutsParHeureChart;
