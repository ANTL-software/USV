import type { ReactElement } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { QualiteStatsPageViewModel } from '../../../hooks/index.ts';
import {
  formatQualiteChartDateLabel,
  formatQualiteCommercialRankingTooltip,
  formatQualiteDistributionTooltip,
  formatQualiteTooltipProgpa,
} from '../../../utils/scripts/index.ts';

type QualiteStatsChartsProps = Pick<
  QualiteStatsPageViewModel,
  'distributionData' | 'evolutionJoursData' | 'evolutionMoisData' | 'rankingData'
>;

export function QualiteStatsCharts({
  distributionData,
  evolutionJoursData,
  evolutionMoisData,
  rankingData,
}: QualiteStatsChartsProps): ReactElement {
  return (
    <section className="qualiteStats__charts">
      <article className="qualiteStats__panel qualiteStats__panel--chart">
        <div className="qualiteStats__panel-header"><div><h2>Évolution journalière</h2><p>Moyenne progpa par jour sur la période</p></div></div>
        <div className="qualiteStats__chart-box">
          {evolutionJoursData.length === 0 ? <p className="qualiteStats__empty">Aucune donnée journalière disponible</p> : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={evolutionJoursData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip formatter={formatQualiteTooltipProgpa} labelFormatter={(_, payload) => formatQualiteChartDateLabel(payload?.[0]?.payload)} />
                <Line type="monotone" dataKey="moyenne_progpa" stroke="#7c3aed" strokeWidth={3} dot={{ fill: '#7c3aed', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </article>

      <article className="qualiteStats__panel qualiteStats__panel--chart">
        <div className="qualiteStats__panel-header"><div><h2>Répartition des niveaux</h2><p>Volume d’appels par étape progpa</p></div></div>
        <div className="qualiteStats__chart-box">
          {distributionData.length === 0 ? <p className="qualiteStats__empty">Aucune répartition disponible</p> : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={distributionData} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} interval={0} angle={-20} textAnchor="end" height={72} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip formatter={(value, _name, item) => formatQualiteDistributionTooltip(value, item.payload)} />
                <Bar dataKey="nombre" radius={[10, 10, 0, 0]}>
                  {distributionData.map((entry) => <Cell key={entry.progpa} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </article>

      <article className="qualiteStats__panel qualiteStats__panel--chart qualiteStats__panel--wide">
        <div className="qualiteStats__panel-header"><div><h2>Lecture mensuelle</h2><p>Progression moyenne consolidée par mois</p></div></div>
        <div className="qualiteStats__chart-box">
          {evolutionMoisData.length === 0 ? <p className="qualiteStats__empty">Aucune donnée mensuelle disponible</p> : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={evolutionMoisData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip formatter={formatQualiteTooltipProgpa} />
                <Bar dataKey="moyenne_progpa" fill="#22c55e" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </article>

      <article className="qualiteStats__panel qualiteStats__panel--chart qualiteStats__panel--wide">
        <div className="qualiteStats__panel-header"><div><h2>Top commerciaux</h2><p>Classement par moyenne progpa sur la période</p></div></div>
        <div className="qualiteStats__chart-box">
          {rankingData.length === 0 ? <p className="qualiteStats__empty">Aucun commercial à afficher</p> : (
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={rankingData} layout="vertical" margin={{ left: 50, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis type="category" dataKey="nom" width={140} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip formatter={(value, _name, item) => formatQualiteCommercialRankingTooltip(value, item.payload)} />
                <Bar dataKey="moyenne" fill="#f59e0b" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </article>
    </section>
  );
}
