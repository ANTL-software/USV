import type { ComparisonCampaign, ComparisonMetric, ComparisonPeriod, ComparisonRow, ComparisonSection, ComparisonUnit, MonthlyComparison } from '../../utils/types/index.ts';

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
export const comparisonPeriodLabel = (period: ComparisonPeriod): string => {
  if (!period.days) return `${comparisonMonthLabel(period.month)} · aucun jour comparable`;
  const first = period.includedDates?.[0] ?? period.start;
  const last = period.includedDates?.[period.includedDates.length - 1] ?? period.endExclusive;
  const firstDay = Number(first.slice(8));
  const lastDay = Number(last.slice(8));
  const range = firstDay === lastDay ? `le ${firstDay}` : `du ${firstDay} au ${lastDay}`;
  const unit = period.basis === 'business'
    ? period.days > 1 ? 'jours ouvrés' : 'jour ouvré'
    : period.days > 1 ? 'jours calendaires' : 'jour calendaire';
  return `${comparisonMonthLabel(period.month)} · ${period.days} ${unit} (${range})${period.partialDay ? ` · dernier jour arrêté à ${period.cutoffTime ?? 'l’heure du calcul'}` : ''}`;
};
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

export const defaultComparisonCampaign = (campaigns: ComparisonCampaign[], requested?: number): number =>
  campaigns.find((campaign) => campaign.id === requested)?.id
  ?? campaigns.find((campaign) => campaign.id === 7 && campaign.status === 'active')?.id
  ?? campaigns.find((campaign) => campaign.status === 'active')?.id
  ?? campaigns[0]?.id ?? 0;

export function comparisonDimension(id: string) {
  const labels: Record<string, [string, string]> = {
    daily: ['Jour comparable', 'jours comparables'], order_daily: ['Jour comparable', 'jours comparables'], lead_daily: ['Jour comparable', 'jours comparables'],
    progpa: ['Étape du plan d’appel', 'étapes du plan d’appel'], status: ['Statut de closing', 'statuts de closing'], origin: ['Origine de l’appel', 'origines d’appel'],
    hours: ['Créneau horaire', 'créneaux horaires'], weekdays: ['Jour de la semaine', 'jours de la semaine'],
    agents: ['Commercial', 'commerciaux'], order_agents: ['Commercial', 'commerciaux'], lead_agents: ['Commercial', 'commerciaux'],
    sources: ['Source de fichier', 'sources de fichiers'], sectors: ['Secteur / activité', 'secteurs et activités'], regions: ['Région', 'régions'],
    durations: ['Tranche de durée', 'tranches de durée'], attempts: ['Nombre d’appels par prospect', 'niveaux de sollicitation'],
    products: ['Produit / panier', 'produits et paniers'], order_documents: ['Document / paiement', 'types de documents et paiements'],
    reminders: ['Motif de rappel', 'motifs de rappel'], documents: ['Type de document', 'types de documents'], recordings: ['Statut de l’appel enregistré', 'statuts d’appels enregistrés'],
    sessions: ['Statut du dialer', 'statuts du dialer'], objections: ['Objection', 'objections'], injections: ['État de la file', 'états de la file'], portfolio: ['État de la file', 'états de la file'],
    sale_events: ['Événement commercial', 'événements commerciaux'], lead_events: ['Événement client', 'événements client'], relations: ['Relation / origine', 'relations et origines'],
    enrichment: ['Statut d’enrichissement', 'statuts d’enrichissement'], invoices: ['Statut / devise', 'statuts et devises'],
  };
  const [singular, plural] = labels[id] ?? ['Indicateur', 'indicateurs'];
  return { singular, plural, search: `Rechercher : ${singular.toLocaleLowerCase('fr')}` };
}

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
      delta: comparisonDelta(row?.current?.[key], row?.reference?.[key], metric.unit), description: metric.description,
      deltaClass: ['contact_rate', 'result_rate', 'validation_rate', 'done_rate', 'validated', 'validated_amount', 'done'].includes(key) && row?.current?.[key] != null && row.reference?.[key] != null
        ? row.current[key]! > row.reference[key]! ? 'comparison__delta--up' : row.current[key]! < row.reference[key]! ? 'comparison__delta--down' : '' : '' }];
  });
}

export function comparisonSignals(report: MonthlyComparison): { title: string; message: string; tone: 'warning' | 'error' | 'info' }[] {
  const activity = report.sections.find((section) => section.id === 'activity')?.rows[0];
  const result = report.sections.find((section) => section.id === (report.campaign.variant === 'vente' ? 'orders' : 'leads'))?.rows[0];
  const signals: { title: string; message: string; tone: 'warning' | 'error' | 'info' }[] = [];
  if (activity?.current && activity.reference) {
    const current = activity.current; const reference = activity.reference;
    if ((current.calls ?? 0) > (reference.calls ?? 0) && (current.result_rate ?? 0) < (reference.result_rate ?? 0)) signals.push({ title: 'Plus d’appels, moins de conversion', tone: 'warning', message: 'Le volume d’appels augmente mais la part de contacts avec résultat lié baisse. Examinez le plan d’appel, le ciblage et le suivi avant de conclure à un problème de cadence.' });
    if ((current.humans ?? 0) < 30 || (reference.humans ?? 0) < 30) signals.push({ title: 'Échantillon limité', tone: 'warning', message: 'Au moins une période compte moins de 30 contacts humains : les variations de conversion sont particulièrement sensibles à quelques appels.' });
  }
  if (report.campaign.variant === 'vente' && result?.current?.validated != null && result.current.emitted_validated != null
    && result.current.validated !== result.current.emitted_validated) {
    signals.push({
      title: 'Validations et cohorte d’émission distinctes',
      tone: 'info',
      message: `${result.current.validated} commande(s) ont été validées dans la période ; ${result.current.emitted_validated} commande(s) émises dans la période sont aujourd’hui validées. L’écart vient des validations intervenues dans un autre mois que l’émission.`,
    });
  }
  if ((result?.current?.unlinked ?? 0) > 0) signals.push({ title: 'Traçabilité à vérifier', tone: 'warning', message: `${result?.current?.unlinked} résultat(s) du mois sans appel lié cohérent : la production totale et la conversion par appel ne recouvrent pas exactement les mêmes données.` });
  const unavailable = report.sections.filter((section) => section.error).length;
  if (unavailable) signals.push({ title: 'Rapport partiel', tone: 'error', message: `${unavailable} rubrique(s) indisponible(s). Leurs chiffres ne sont pas interprétables comme des zéros.` });
  if (!signals.length) signals.push({ title: 'Clé de lecture', tone: 'info', message: 'Commencez par distinguer volume de contacts, progression du discours et devenir de la production. Une variation mensuelle seule n’établit pas sa cause.' });
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
  const rows: (string | number | null)[][] = [['Campagne', 'Commercial (ID)', 'Généré le', 'Mois', 'Début', 'Fin exclusive', 'Référence', 'Début référence', 'Fin référence exclusive', 'Mode', 'Rubrique', 'Périmètre', 'Source disponible', 'Ligne de ventilation (voir rubrique)', 'Indicateur', 'Unité', 'Valeur', 'Référence valeur', 'Définition']];
  for (const section of sections) {
    const prefix = [report.campaign.name, report.agent, report.generatedAt, report.periods.current.month, report.periods.current.start, report.periods.current.endExclusive, report.periods.reference.month, report.periods.reference.start, report.periods.reference.endExclusive, report.periods.mode, section.title, section.scope, section.error || 'Oui'];
    if (!section.rows.length) rows.push([...prefix, '', '', '', null, null, section.error || `${section.description} Aucune ligne dans les périodes sélectionnées.`]);
    for (const row of section.rows) for (const metric of section.metrics) rows.push([...prefix, row.label, metric.label, metric.unit, row.current?.[metric.key] ?? null, row.reference?.[metric.key] ?? null, `${section.description} ${metric.description}`]);
  }
  return rows.map((row) => row.map(csvCell).join(';')).join('\r\n');
}
