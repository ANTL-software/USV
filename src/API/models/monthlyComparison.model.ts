import type { ComparisonMetric, ComparisonPeriod, ComparisonRow, ComparisonSection, ComparisonUnit, MonthlyComparison } from '../../utils/types/index.ts';

const number = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
export function formatComparisonValue(value: number | null | undefined, unit: ComparisonUnit): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—';
  if (unit === 'currency') return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(value);
  if (unit === 'duration') return value >= 3600 ? `${number.format(value / 3600)} h` : value >= 60 ? `${number.format(value / 60)} min` : `${number.format(value)} s`;
  if (unit === 'bytes') return `${number.format(value / 1024 / 1024)} Mo`;
  return `${number.format(value)}${({ percent: ' %', hours: ' h', days: ' j', number: '' } as const)[unit]}`;
}

export function comparisonDelta(current: number | null | undefined, reference: number | null | undefined, unit: ComparisonUnit): string {
  if (current == null || reference == null) return 'Non comparable';
  const delta = current - reference;
  const sign = delta > 0 ? '+' : '';
  if (unit === 'percent') return `${sign}${number.format(delta)} pt`;
  if (reference === 0) return current === 0 ? 'Stable' : 'Nouvelle activité';
  return `${sign}${number.format(delta / Math.abs(reference) * 100)} %`;
}

export const comparisonMonthLabel = (month: string): string => new Date(`${month}-15T12:00:00Z`).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });
export const comparisonPeriodLabel = (period: ComparisonPeriod): string => `${comparisonMonthLabel(period.month)} · ${period.days ? `du 1 au ${period.days}` : 'aucun jour terminé'}${period.partialDay ? ' (aujourd’hui partiel)' : ''}`;
export function defaultComparisonMonths(now = new Date()) {
  const month = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit' }).format(now);
  const [year, index] = month.split('-').map(Number);
  return { month, reference: new Date(Date.UTC(year, index - 2, 15)).toISOString().slice(0, 7) };
}

export const comparisonGroups = [
  { id: 'overview', label: 'Synthèse', sections: ['activity', 'orders', 'leads', 'daily', 'order_daily', 'lead_daily'] },
  { id: 'conversion', label: 'Plan d’appel & conversion', sections: ['progpa', 'status', 'origin', 'durations', 'attempts'] },
  { id: 'team', label: 'Commerciaux & horaires', sections: ['agents', 'order_agents', 'lead_agents', 'hours', 'weekdays', 'sessions'] },
  { id: 'targeting', label: 'Fichiers & ciblage', sections: ['sources', 'sectors', 'regions', 'injections', 'portfolio', 'relations', 'enrichment'] },
  { id: 'followup', label: 'Suivi & patrimoine', sections: ['products', 'order_documents', 'reminders', 'documents', 'recordings', 'objections', 'sale_events', 'lead_events', 'invoices', 'health'] },
];

export function comparisonCards(report: MonthlyComparison) {
  const requests = [
    ['activity', 'calls'], ['activity', 'humans'], ['activity', 'contact_rate'], ['activity', 'result_rate'],
    ...(report.campaign.variant === 'vente' ? [['orders', 'orders'], ['orders', 'validated'], ['orders', 'validated_amount'], ['orders', 'validation_rate']] : [['leads', 'leads'], ['leads', 'done'], ['leads', 'sent'], ['leads', 'done_rate']]),
  ];
  return requests.flatMap(([sectionId, key]) => {
    const section = report.sections.find((item) => item.id === sectionId);
    const metric = section?.metrics.find((item) => item.key === key);
    if (!section || !metric) return [];
    const row = section.rows[0];
    return [{ key, label: metric.label, value: formatComparisonValue(row?.current?.[key], metric.unit),
      previous: formatComparisonValue(row?.reference?.[key], metric.unit),
      delta: comparisonDelta(row?.current?.[key], row?.reference?.[key], metric.unit), description: metric.description }];
  });
}

export function comparisonSignals(report: MonthlyComparison): string[] {
  const activity = report.sections.find((section) => section.id === 'activity')?.rows[0];
  const result = report.sections.find((section) => section.id === (report.campaign.variant === 'vente' ? 'orders' : 'leads'))?.rows[0];
  const signals: string[] = [];
  if (activity?.current && activity.reference) {
    const current = activity.current; const reference = activity.reference;
    if ((current.calls ?? 0) > (reference.calls ?? 0) && (current.result_rate ?? 0) < (reference.result_rate ?? 0)) signals.push('Le volume d’appels augmente mais la part de contacts avec résultat lié baisse. Examinez le plan d’appel, le ciblage et le suivi avant de conclure à un problème de cadence.');
    if ((current.humans ?? 0) < 30 || (reference.humans ?? 0) < 30) signals.push('Au moins une période compte moins de 30 contacts humains : les variations de conversion sont particulièrement sensibles à quelques appels.');
  }
  if ((result?.current?.unlinked ?? 0) > 0) signals.push(`${result?.current?.unlinked} résultat(s) du mois sans appel lié cohérent : la production totale et la conversion par appel ne recouvrent pas exactement les mêmes données.`);
  const unavailable = report.sections.filter((section) => section.error).length;
  if (unavailable) signals.push(`${unavailable} rubrique(s) indisponible(s). Leurs chiffres ne sont pas interprétables comme des zéros.`);
  if (!signals.length) signals.push('Commencez par distinguer volume de contacts, progression du discours et devenir de la production. Une variation mensuelle seule n’établit pas sa cause.');
  return signals;
}

export function comparisonTableRows(section: ComparisonSection, metric: ComparisonMetric, search: string, sort: string) {
  const rows = section.rows.filter((row) => row.label.toLocaleLowerCase('fr').includes(search.toLocaleLowerCase('fr')));
  if (sort !== 'label') rows.sort((a, b) => (b[sort === 'reference' ? 'reference' : 'current']?.[metric.key] ?? -Infinity) - (a[sort === 'reference' ? 'reference' : 'current']?.[metric.key] ?? -Infinity));
  return rows;
}

export const comparisonDisplayRow = (row: ComparisonRow, metric: ComparisonMetric) => ({
  key: row.key, label: row.label, current: formatComparisonValue(row.current?.[metric.key], metric.unit),
  reference: formatComparisonValue(row.reference?.[metric.key], metric.unit), delta: comparisonDelta(row.current?.[metric.key], row.reference?.[metric.key], metric.unit),
  absolute: row.current?.[metric.key] != null && row.reference?.[metric.key] != null
    ? metric.unit === 'percent' ? `${number.format((row.current[metric.key] ?? 0) - (row.reference[metric.key] ?? 0))} pt` : formatComparisonValue((row.current[metric.key] ?? 0) - (row.reference[metric.key] ?? 0), metric.unit) : '—',
});

const csvCell = (value: string | number | null) => {
  const text = value === null ? '' : String(value);
  return `"${(/^[=+@\-\t\r]/.test(text) && typeof value !== 'number' ? `'${text}` : text).replace(/"/g, '""')}"`;
};
export function comparisonCsv(report: MonthlyComparison, sections = report.sections): string {
  const rows: (string | number | null)[][] = [['Campagne', 'Commercial (ID)', 'Généré le', 'Mois', 'Début', 'Fin exclusive', 'Référence', 'Début référence', 'Fin référence exclusive', 'Mode', 'Rubrique', 'Périmètre', 'Source disponible', 'Groupe', 'Indicateur', 'Unité', 'Valeur', 'Référence valeur', 'Définition']];
  for (const section of sections) {
    const prefix = [report.campaign.name, report.agent, report.generatedAt, report.periods.current.month, report.periods.current.start, report.periods.current.endExclusive, report.periods.reference.month, report.periods.reference.start, report.periods.reference.endExclusive, report.periods.mode, section.title, section.scope, section.error || 'Oui'];
    if (!section.rows.length) rows.push([...prefix, '', '', '', null, null, section.error || `${section.description} Aucune ligne dans les périodes sélectionnées.`]);
    for (const row of section.rows) for (const metric of section.metrics) rows.push([...prefix, row.label, metric.label, metric.unit, row.current?.[metric.key] ?? null, row.reference?.[metric.key] ?? null, `${section.description} ${metric.description}`]);
  }
  return rows.map((row) => row.map(csvCell).join(';')).join('\r\n');
}
