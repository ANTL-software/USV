import { useMemo, useState } from 'react';
import { comparisonCsv, comparisonDisplayRow, comparisonTableRows, formatComparisonValue } from '../API/models/index.ts';
import { monthlyComparisonService } from '../API/services/index.ts';
import type { ComparisonSection, MonthlyComparison } from '../utils/types/index.ts';

export function useComparisonSection(section: ComparisonSection, report: MonthlyComparison) {
  const [metricKey, setMetricKey] = useState(section.chartMetric);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('label');
  const [page, setPage] = useState(1);
  const [details, setDetails] = useState(false);
  const metric = section.metrics.find((item) => item.key === metricKey) ?? section.metrics[0];
  const filtered = useMemo(() => comparisonTableRows(section, metric, search, sort), [section, metric, search, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / 12));
  const safePage = Math.min(page, pages);
  const pageRows = filtered.slice((safePage - 1) * 12, safePage * 12);
  const rows = pageRows.map((row) => comparisonDisplayRow(row, metric));
  const chronological = ['daily', 'order_daily', 'lead_daily', 'hours', 'weekdays', 'progpa'].includes(section.id);
  const chartRows = chronological ? comparisonTableRows(section, metric, search, 'label') : comparisonTableRows(section, metric, search, 'current').slice(0, 12);
  const chart = chartRows.map((row) => ({ name: row.label.length > 35 ? `${row.label.slice(0, 32)}…` : row.label, current: row.current?.[metric.key] ?? null, reference: row.reference?.[metric.key] ?? null }));
  const detailedRows = pageRows.flatMap((row) => section.metrics.map((item) => ({ ...comparisonDisplayRow(row, item), key: `${row.key}-${item.key}`, metric: item.label })));
  const total = section.rows.length === 1 ? section.metrics.map((item) => ({ ...comparisonDisplayRow(section.rows[0], item), key: item.key, label: item.label, description: item.description })) : [];
  return {
    section, metric, metricKey, search, sort, page: safePage, pages, rows, detailedRows, details, total, chart, chronological,
    chartLabel: `${metric.label} — ${chronological || filtered.length <= 12 ? 'tous les groupes' : '12 premiers groupes du mois analysé'}`,
    rowCount: filtered.length, snapshot: section.scope === 'snapshot',
    setMetric: (value: string) => { setMetricKey(value); setPage(1); },
    setSearch: (value: string) => { setSearch(value); setPage(1); },
    setSort: (value: string) => { setSort(value); setPage(1); },
    toggleDetails: () => setDetails((value) => !value),
    previous: () => setPage(Math.max(1, safePage - 1)), next: () => setPage(Math.min(pages, safePage + 1)),
    formatAxis: (value: number) => formatComparisonValue(value, metric.unit),
    formatTooltip: (value: unknown) => formatComparisonValue(typeof value === 'number' ? value : null, metric.unit),
    exportSection: () => monthlyComparisonService.downloadCsv(comparisonCsv(report, [section]), `${section.id}-${report.periods.current.month}-vs-${report.periods.reference.month}.csv`),
  };
}
