import './qualiteStats.scss';

import { ReactElement, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import type { StylesConfig } from 'react-select';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { MdArrowBack, MdRefresh, MdInsights } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import Loader from '../../components/loader/Loader';
import reactSelectStyles from '../../../utils/styles/reactSelectStyles';
import { useEmployes } from '../../../hooks/useEmployes';
import { useQualiteProgpaStats } from '../../../hooks/useQualiteProgpaStats';
import type { ProgpaCommercialStats, ProgpaSummary } from '../../../utils/types/qualite.types';

type PeriodMode = 'jour' | 'mois' | 'depuis' | 'jusquau' | 'entre';

interface SelectOption {
  value: string;
  label: string;
}

const PROGPA_COLORS = ['#ef4444', '#f97316', '#fb7185', '#f59e0b', '#84cc16', '#22c55e'];

const PERIOD_OPTIONS: SelectOption[] = [
  { value: 'jour', label: 'Jour précis' },
  { value: 'mois', label: 'Mois en cours' },
  { value: 'depuis', label: 'Depuis le' },
  { value: 'jusquau', label: 'Jusqu’au' },
  { value: 'entre', label: 'Entre deux dates' }
];

const selectStyles = reactSelectStyles as StylesConfig<SelectOption, false>;

const toIsoDate = (date: Date): string => date.toISOString().slice(0, 10);

const getToday = (): string => toIsoDate(new Date());

const getMonthBounds = (): { start: string; end: string } => {
  const now = new Date();
  return {
    start: toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1)),
    end: toIsoDate(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  };
};

const buildDateRange = (
  mode: PeriodMode,
  startDate: string,
  endDate: string
): { dateDebut: string | null; dateFin: string | null } => {
  const today = getToday();
  const monthBounds = getMonthBounds();

  if (mode === 'jour') {
    return { dateDebut: startDate || today, dateFin: startDate || today };
  }

  if (mode === 'mois') {
    return { dateDebut: monthBounds.start, dateFin: monthBounds.end };
  }

  if (mode === 'depuis') {
    return { dateDebut: startDate || today, dateFin: null };
  }

  if (mode === 'jusquau') {
    return { dateDebut: null, dateFin: endDate || today };
  }

  return {
    dateDebut: startDate || today,
    dateFin: endDate || startDate || today
  };
};

const formatPercent = (value: number): string => `${value.toFixed(1)} %`;

const formatProgpa = (value: number): string => `${value.toFixed(1)} / 5`;

const formatDateLabel = (date: string): string =>
  new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

const formatMonthLabel = (month: string): string => {
  const [year, monthIndex] = month.split('-');
  const date = new Date(Number(year), Number(monthIndex) - 1, 1);

  return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
};

const formatTooltipProgpa = (value: unknown): [string, string] => {
  const rawValue = Array.isArray(value) ? value[0] : value;
  const numericValue = typeof rawValue === 'number' ? rawValue : Number(rawValue || 0);
  return [`${numericValue.toFixed(1)} / 5`, 'Progpa moyen'];
};

const getRangeLabel = (mode: PeriodMode, dateDebut: string | null, dateFin: string | null): string => {
  if (mode === 'jour' && dateDebut) {
    return `Le ${new Date(dateDebut).toLocaleDateString('fr-FR')}`;
  }

  if (mode === 'mois') {
    return 'Mois en cours';
  }

  if (mode === 'depuis' && dateDebut) {
    return `Depuis le ${new Date(dateDebut).toLocaleDateString('fr-FR')}`;
  }

  if (mode === 'jusquau' && dateFin) {
    return `Jusqu’au ${new Date(dateFin).toLocaleDateString('fr-FR')}`;
  }

  if (dateDebut && dateFin) {
    return `Du ${new Date(dateDebut).toLocaleDateString('fr-FR')} au ${new Date(dateFin).toLocaleDateString('fr-FR')}`;
  }

  return 'Aujourd’hui';
};

const SummaryCard = ({
  title,
  value,
  subtitle
}: {
  title: string;
  value: string;
  subtitle: string;
}): ReactElement => (
  <article className="qualiteStats__summary-card">
    <span className="qualiteStats__summary-label">{title}</span>
    <strong className="qualiteStats__summary-value">{value}</strong>
    <span className="qualiteStats__summary-subtitle">{subtitle}</span>
  </article>
);

const CommercialInsight = ({ commercial }: { commercial: ProgpaCommercialStats }): ReactElement => (
  <div className="qualiteStats__commercial-focus-grid">
    <SummaryCard
      title="Moyenne commerciale"
      value={formatProgpa(commercial.moyenne_progpa)}
      subtitle={`${commercial.total_appels} appels sur la période`}
    />
    <SummaryCard
      title="Taux de saisie"
      value={formatPercent(commercial.taux_saisie_progpa)}
      subtitle={`${commercial.appels_avec_progpa} appels avec progpa`}
    />
    <SummaryCard
      title="Plus haut niveau"
      value={`${commercial.max_progpa_atteint} / 5`}
      subtitle="Plus haut progpa atteint"
    />
    <SummaryCard
      title="Max fiche moyen"
      value={formatProgpa(commercial.moyenne_max_fiche)}
      subtitle={`${commercial.prospects_uniques} prospects uniques`}
    />
  </div>
);

function QualiteStats(): ReactElement {
  const navigate = useNavigate();
  const { employes, isLoading: employesLoading } = useEmployes();

  const today = getToday();
  const monthBounds = getMonthBounds();

  const [periodMode, setPeriodMode] = useState<PeriodMode>('jour');
  const [startDate, setStartDate] = useState<string>(today);
  const [endDate, setEndDate] = useState<string>(today);
  const [selectedEmployeId, setSelectedEmployeId] = useState<number | null>(null);

  const [appliedFilters, setAppliedFilters] = useState<{
    periodMode: PeriodMode;
    dateDebut: string | null;
    dateFin: string | null;
    idEmploye: number | null;
  }>({
    periodMode: 'jour',
    dateDebut: today,
    dateFin: today,
    idEmploye: null
  });

  const commercialOptions = useMemo<SelectOption[]>(() => {
    const commerciaux = employes
      .filter((employe) => employe.actif)
      .filter((employe) => employe.poste?.type_poste === 'commercial' || (employe.id_rang_commercial !== null && employe.id_rang_commercial !== undefined))
      .sort((a, b) => `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`, 'fr'));

    return [
      { value: '', label: 'Tous les commerciaux' },
      ...commerciaux.map((employe) => ({
        value: String(employe.id_employe),
        label: `${employe.prenom} ${employe.nom.toUpperCase()} (${employe.identifiant})`
      }))
    ];
  }, [employes]);

  const { data, isLoading, error, reload } = useQualiteProgpaStats(
    appliedFilters.dateDebut,
    appliedFilters.dateFin,
    appliedFilters.idEmploye
  );

  const selectedCommercial = data?.commercial || null;
  const rankingData = useMemo(
    () => (data?.commerciaux || []).slice(0, 10).map((item) => ({
      nom: `${item.prenom} ${item.nom}`,
      moyenne: item.moyenne_progpa,
      appels: item.total_appels
    })),
    [data]
  );

  const distributionData = useMemo(
    () => (data?.repartition || []).map((item, index) => ({
      ...item,
      color: PROGPA_COLORS[index] || '#7c3aed'
    })),
    [data]
  );

  const evolutionJoursData = useMemo(
    () => (data?.evolution_jours || []).map((item) => ({
      ...item,
      label: formatDateLabel(item.date)
    })),
    [data]
  );

  const evolutionMoisData = useMemo(
    () => (data?.evolution_mois || []).map((item) => ({
      ...item,
      label: formatMonthLabel(item.mois)
    })),
    [data]
  );

  const handlePeriodModeChange = (value: PeriodMode): void => {
    setPeriodMode(value);

    if (value === 'jour') {
      setStartDate(today);
      setEndDate(today);
    }

    if (value === 'mois') {
      setStartDate(monthBounds.start);
      setEndDate(monthBounds.end);
    }

    if (value === 'depuis') {
      setStartDate(today);
    }

    if (value === 'jusquau') {
      setEndDate(today);
    }

    if (value === 'entre') {
      setStartDate(today);
      setEndDate(today);
    }
  };

  const applyFilters = (): void => {
    const range = buildDateRange(periodMode, startDate, endDate);
    setAppliedFilters({
      periodMode,
      dateDebut: range.dateDebut,
      dateFin: range.dateFin,
      idEmploye: selectedEmployeId
    });
  };

  const resetFilters = (): void => {
    setPeriodMode('jour');
    setStartDate(today);
    setEndDate(today);
    setSelectedEmployeId(null);
    setAppliedFilters({
      periodMode: 'jour',
      dateDebut: today,
      dateFin: today,
      idEmploye: null
    });
  };

  const periodeLabel = getRangeLabel(
    appliedFilters.periodMode,
    appliedFilters.dateDebut,
    appliedFilters.dateFin
  );

  const selectedEmployeOption = commercialOptions.find((option) => option.value === String(selectedEmployeId ?? '')) || commercialOptions[0];

  const selectedPeriodOption = PERIOD_OPTIONS.find((option) => option.value === periodMode) || PERIOD_OPTIONS[0];

  const periodeSummary: ProgpaSummary | null = data?.synthese?.periode || null;

  return (
    <div id="qualiteStats">
      <Header />
      <SubNav />
      <main>
        <div className="qualiteStats__back">
          <Button style="back" onClick={() => navigate('/operations/qualite')}>
            <MdArrowBack />
            <span>Retour</span>
          </Button>
        </div>

        <div className="qualiteStats__wrapper">
          <section className="qualiteStats__hero">
            <div className="qualiteStats__hero-copy">
              <span className="qualiteStats__eyebrow">Qualité</span>
              <h1>Statistiques progpa</h1>
              <p>
                Suivi moyen du plan d’appel sur la période, lecture quotidienne et focus commercial individuel.
              </p>
            </div>
            <div className="qualiteStats__hero-badge">
              <MdInsights />
            </div>
          </section>

          <section className="qualiteStats__filters">
            <div className="qualiteStats__filters-grid">
              <div className="qualiteStats__field">
                <label htmlFor="periodMode">Période</label>
                <Select<SelectOption, false>
                  inputId="periodMode"
                  options={PERIOD_OPTIONS}
                  value={selectedPeriodOption}
                  onChange={(option) => handlePeriodModeChange((option?.value as PeriodMode | undefined) || 'jour')}
                  styles={selectStyles}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  menuPortalTarget={document.body}
                />
              </div>

              {(periodMode === 'jour' || periodMode === 'depuis' || periodMode === 'entre') && (
                <div className="qualiteStats__field">
                  <label htmlFor="startDate">
                    {periodMode === 'jour' ? 'Date' : 'Date début'}
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    max={periodMode === 'entre' ? endDate || undefined : undefined}
                  />
                </div>
              )}

              {(periodMode === 'jusquau' || periodMode === 'entre') && (
                <div className="qualiteStats__field">
                  <label htmlFor="endDate">
                    {periodMode === 'jusquau' ? 'Date fin' : 'Date fin'}
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    min={periodMode === 'entre' ? startDate || undefined : undefined}
                  />
                </div>
              )}

              <div className="qualiteStats__field">
                <label htmlFor="commercialSelect">Commercial</label>
                <Select<SelectOption, false>
                  inputId="commercialSelect"
                  options={commercialOptions}
                  value={selectedEmployeOption}
                  onChange={(option) => setSelectedEmployeId(option?.value ? Number(option.value) : null)}
                  styles={selectStyles}
                  isLoading={employesLoading}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  menuPortalTarget={document.body}
                />
              </div>
            </div>

            <div className="qualiteStats__filters-actions">
              <Button style="grey" onClick={resetFilters}>
                Réinitialiser
              </Button>
              <Button style="orange" onClick={applyFilters}>
                <MdRefresh />
                <span>Appliquer</span>
              </Button>
            </div>

            <div className="qualiteStats__active-filters">
              <span>{periodeLabel}</span>
              <span>{appliedFilters.idEmploye ? 'Vue commerciale ciblée' : 'Vue globale'}</span>
            </div>
          </section>

          {isLoading && <Loader message="Chargement des statistiques qualité..." />}

          {!isLoading && error && (
            <section className="qualiteStats__panel qualiteStats__panel--error">
              <h2>Impossible de charger les statistiques</h2>
              <p>{error}</p>
              <Button style="orange" onClick={() => void reload()}>
                Réessayer
              </Button>
            </section>
          )}

          {!isLoading && !error && data && periodeSummary && (
            <>
              <section className="qualiteStats__summary-grid">
                <SummaryCard
                  title="Moyenne période"
                  value={formatProgpa(periodeSummary.moyenne_progpa)}
                  subtitle={`${periodeSummary.total_appels} appels analysés`}
                />
                <SummaryCard
                  title="Moyenne du jour"
                  value={formatProgpa(data.synthese.aujourd_hui.moyenne_progpa)}
                  subtitle={`${data.synthese.aujourd_hui.total_appels} appels aujourd’hui`}
                />
                <SummaryCard
                  title="Moyenne du mois"
                  value={formatProgpa(data.synthese.mois_en_cours.moyenne_progpa)}
                  subtitle={`${data.synthese.mois_en_cours.total_appels} appels ce mois`}
                />
                <SummaryCard
                  title="Taux de saisie"
                  value={formatPercent(periodeSummary.taux_saisie_progpa)}
                  subtitle={`${periodeSummary.prospects_uniques} prospects uniques`}
                />
              </section>

              {selectedCommercial && (
                <section className="qualiteStats__panel">
                  <div className="qualiteStats__panel-header">
                    <div>
                      <h2>
                        Focus commercial
                      </h2>
                      <p>{selectedCommercial.prenom} {selectedCommercial.nom.toUpperCase()} - {selectedCommercial.identifiant}</p>
                    </div>
                  </div>
                  <CommercialInsight commercial={selectedCommercial} />
                </section>
              )}

              <section className="qualiteStats__charts">
                <article className="qualiteStats__panel qualiteStats__panel--chart">
                  <div className="qualiteStats__panel-header">
                    <div>
                      <h2>Évolution journalière</h2>
                      <p>Moyenne progpa par jour sur la période</p>
                    </div>
                  </div>
                  <div className="qualiteStats__chart-box">
                    {evolutionJoursData.length === 0 ? (
                      <p className="qualiteStats__empty">Aucune donnée journalière disponible</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={evolutionJoursData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                          <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: '#64748b' }} />
                          <Tooltip
                            formatter={formatTooltipProgpa}
                            labelFormatter={(_, payload) => {
                              const point = payload?.[0]?.payload as { date?: string } | undefined;
                              return point?.date ? new Date(point.date).toLocaleDateString('fr-FR') : '';
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="moyenne_progpa"
                            stroke="#7c3aed"
                            strokeWidth={3}
                            dot={{ fill: '#7c3aed', r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </article>

                <article className="qualiteStats__panel qualiteStats__panel--chart">
                  <div className="qualiteStats__panel-header">
                    <div>
                      <h2>Répartition des niveaux</h2>
                      <p>Volume d’appels par étape progpa</p>
                    </div>
                  </div>
                  <div className="qualiteStats__chart-box">
                    {distributionData.length === 0 ? (
                      <p className="qualiteStats__empty">Aucune répartition disponible</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={distributionData} margin={{ left: 10, right: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} interval={0} angle={-20} textAnchor="end" height={72} />
                          <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                          <Tooltip
                            formatter={(value, _name, item) => [
                              `${Number(value || 0)} appels (${(item.payload as { pourcentage: number }).pourcentage.toFixed(1)} %)`,
                              'Volume'
                            ]}
                          />
                          <Bar dataKey="nombre" radius={[10, 10, 0, 0]}>
                            {distributionData.map((entry) => (
                              <Cell key={entry.progpa} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </article>

                <article className="qualiteStats__panel qualiteStats__panel--chart qualiteStats__panel--wide">
                  <div className="qualiteStats__panel-header">
                    <div>
                      <h2>Lecture mensuelle</h2>
                      <p>Progression moyenne consolidée par mois</p>
                    </div>
                  </div>
                  <div className="qualiteStats__chart-box">
                    {evolutionMoisData.length === 0 ? (
                      <p className="qualiteStats__empty">Aucune donnée mensuelle disponible</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={evolutionMoisData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#64748b' }} />
                          <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: '#64748b' }} />
                          <Tooltip
                            formatter={formatTooltipProgpa}
                          />
                          <Bar dataKey="moyenne_progpa" fill="#22c55e" radius={[10, 10, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </article>

                <article className="qualiteStats__panel qualiteStats__panel--chart qualiteStats__panel--wide">
                  <div className="qualiteStats__panel-header">
                    <div>
                      <h2>Top commerciaux</h2>
                      <p>Classement par moyenne progpa sur la période</p>
                    </div>
                  </div>
                  <div className="qualiteStats__chart-box">
                    {rankingData.length === 0 ? (
                      <p className="qualiteStats__empty">Aucun commercial à afficher</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={340}>
                        <BarChart data={rankingData} layout="vertical" margin={{ left: 50, right: 30 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 12, fill: '#64748b' }} />
                          <YAxis type="category" dataKey="nom" width={140} tick={{ fontSize: 12, fill: '#64748b' }} />
                          <Tooltip
                            formatter={(value, _name, item) => [
                              `${Number(value || 0).toFixed(1)} / 5`,
                              `${(item.payload as { appels: number }).appels} appels`
                            ]}
                          />
                          <Bar dataKey="moyenne" fill="#f59e0b" radius={[0, 10, 10, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </article>
              </section>

              <section className="qualiteStats__panel">
                <div className="qualiteStats__panel-header">
                  <div>
                    <h2>Détail par commercial</h2>
                    <p>Vue exploitable pour les KPI individuels et le pilotage qualité</p>
                  </div>
                </div>

                <div className="qualiteStats__table-wrap">
                  <table className="qualiteStats__table">
                    <thead>
                      <tr>
                        <th>Commercial</th>
                        <th>Moyenne</th>
                        <th>Max atteint</th>
                        <th>Appels</th>
                        <th>Prospects</th>
                        <th>Taux saisie</th>
                        <th>Max fiche moyen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.commerciaux.length === 0 && (
                        <tr>
                          <td colSpan={7} className="qualiteStats__empty-row">Aucune donnée disponible sur cette période</td>
                        </tr>
                      )}

                      {data.commerciaux.map((commercial) => (
                        <tr
                          key={commercial.id_employe}
                          className={selectedCommercial?.id_employe === commercial.id_employe ? 'is-selected' : ''}
                        >
                          <td>
                            <strong>{commercial.prenom} {commercial.nom.toUpperCase()}</strong>
                            <span>{commercial.identifiant}</span>
                          </td>
                          <td>{formatProgpa(commercial.moyenne_progpa)}</td>
                          <td>{commercial.max_progpa_atteint} / 5</td>
                          <td>{commercial.total_appels}</td>
                          <td>{commercial.prospects_uniques}</td>
                          <td>{formatPercent(commercial.taux_saisie_progpa)}</td>
                          <td>{formatProgpa(commercial.moyenne_max_fiche)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const QualiteStatsWithAuth = WithAuth(QualiteStats);
export default QualiteStatsWithAuth;
