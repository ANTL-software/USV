import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { QualiteStatsPageViewModel } from '../../../hooks/index.ts';
import { QUALITE_FOLLOWUP_COLOR, getQualiteStepColor } from '../../../utils/scripts/index.ts';

type QualiteStatsChartsProps = Pick<
  QualiteStatsPageViewModel,
  'commercialData' | 'dailyData' | 'data' | 'distributionData'
>;

export function QualiteStatsCharts({
  commercialData,
  dailyData,
  data,
  distributionData,
}: QualiteStatsChartsProps): ReactElement | null {
  if (!data) return null;
  const commercialChartHeight = Math.max(320, commercialData.length * 52);

  return (
    <section className="qualiteStats__charts">
      <article className="qualiteStats__panel qualiteStats__panel--chart">
        <div className="qualiteStats__panel-header">
          <div><h2>Répartition des étapes</h2><p>Nombre d’appels clôturés pour chaque niveau exact.</p></div>
        </div>
        <div className="qualiteStats__chart-box">
          {data.synthese.total_appels === 0 ? <p className="qualiteStats__empty">Aucun appel clôturé sur cette période.</p> : (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={distributionData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-18} textAnchor="end" height={76} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="nombre" name="Appels" radius={[8, 8, 0, 0]}>
                  {distributionData.map((entry) => <Cell key={entry.progpa} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </article>

      <article className="qualiteStats__panel qualiteStats__panel--chart">
        <div className="qualiteStats__panel-header">
          <div><h2>Détail par jour</h2><p>Composition quotidienne de tous les appels clôturés.</p></div>
        </div>
        <div className="qualiteStats__chart-box">
          {dailyData.length === 0 ? <p className="qualiteStats__empty">Aucune donnée journalière disponible.</p> : (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={dailyData} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {data.etapes.map((step) => (
                  <Bar
                    key={step.progpa}
                    dataKey={`niveau_${step.progpa}`}
                    name={step.label}
                    stackId="progpa"
                    fill={getQualiteStepColor(step.progpa)}
                  />
                ))}
                <Bar dataKey="suivis_en_cours" name={data.suivi_en_cours.label} stackId="progpa" fill={QUALITE_FOLLOWUP_COLOR} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </article>

      <article className="qualiteStats__panel qualiteStats__panel--chart qualiteStats__panel--wide">
        <div className="qualiteStats__panel-header">
          <div><h2>Détail par commercial</h2><p>Volume et répartition des étapes pour chaque TLV.</p></div>
        </div>
        <div className="qualiteStats__chart-box qualiteStats__chart-box--commercial">
          {commercialData.length === 0 ? <p className="qualiteStats__empty">Aucun commercial à afficher.</p> : (
            <ResponsiveContainer width="100%" height={commercialChartHeight}>
              <BarChart data={commercialData} layout="vertical" margin={{ top: 10, right: 20, bottom: 5, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis type="category" dataKey="label" width={145} tick={{ fontSize: 12, fill: '#475569' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {data.etapes.map((step) => (
                  <Bar
                    key={step.progpa}
                    dataKey={`niveau_${step.progpa}`}
                    name={step.label}
                    stackId="progpa"
                    fill={getQualiteStepColor(step.progpa)}
                  />
                ))}
                <Bar dataKey="suivis_en_cours" name={data.suivi_en_cours.label} stackId="progpa" fill={QUALITE_FOLLOWUP_COLOR} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </article>
    </section>
  );
}
