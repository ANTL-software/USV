import type { ComparisonSection, MonthlyComparison } from '../../src/utils/types/index.ts';

export function comparisonFixture(campaign = 7, month = '2026-09', reference = '2026-08'): MonthlyComparison {
  const activity: ComparisonSection = {
    id: 'activity', title: 'Vue d’ensemble des appels', description: 'Appels terminés de la période.', scope: 'monthly', chartMetric: 'calls', error: null,
    metrics: [
      { key: 'calls', label: 'Appels terminés', unit: 'number', description: 'Nombre d’appels terminés' },
      { key: 'humans', label: 'Contacts humains', unit: 'number', description: 'ProgPA ≥ 1' },
      { key: 'contact_rate', label: 'Taux de contact humain', unit: 'percent', description: 'Contacts / appels' },
      { key: 'result_rate', label: 'Appels avec résultat / contacts', unit: 'percent', description: 'Résultats liés / contacts' },
    ],
    rows: [{ key: 'total', label: 'Total', current: { calls: 2229, humans: 820, contact_rate: 36.8, result_rate: .6 }, reference: { calls: 1323, humans: 473, contact_rate: 35.8, result_rate: 1.1 } }],
  };
  const daily = { ...activity, id: 'daily', title: 'Rythme quotidien', rows: Array.from({ length: 8 }, (_, index) => ({ key: String(index + 1), label: String(index + 1), current: { calls: 200 + index * 30, humans: 90 + index * 8 }, reference: { calls: 130 + index * 20, humans: 40 + index * 5 } })) };
  const sources = { ...activity, id: 'sources', title: 'Origine des fichiers prospect', rows: Array.from({ length: 25 }, (_, index) => ({ key: String(index), label: `Source ${index}`, current: { calls: index + 2, humans: index }, reference: { calls: 10, humans: 5 } })) };
  const result: ComparisonSection = campaign === 7 ? {
    id: 'orders', title: 'Commandes : émissions, validations et devenir', description: 'Les émissions et validations suivent chacune leur date métier.', scope: 'monthly', chartMetric: 'orders', error: null,
    metrics: [
      { key: 'orders', label: 'Commandes émises', unit: 'number', description: '' },
      { key: 'validated', label: 'Commandes validées', unit: 'number', description: '' },
      { key: 'validated_amount', label: 'Montant validé', unit: 'currency', description: '' },
      { key: 'emitted_validated', label: 'Commandes émises désormais validées', unit: 'number', description: '' },
      { key: 'validation_rate', label: 'Validation de la cohorte émise', unit: 'percent', description: '' },
    ], rows: [{ key: 'total', label: 'Commandes', current: { orders: 6, validated: 4, validated_amount: 1166.65, emitted_validated: 3, validation_rate: 50 }, reference: { orders: 5, validated: 3, validated_amount: 629.2, emitted_validated: 3, validation_rate: 60 } }],
  } : {
    id: 'leads', title: 'Rendez-vous client : créations, événements et devenir', description: 'Leads distincts des rappels.', scope: 'monthly', chartMetric: 'leads', error: null,
    metrics: [{ key: 'leads', label: 'Rendez-vous client créés', unit: 'number', description: '' }],
    rows: [{ key: 'total', label: 'RDV client', current: { leads: 8 }, reference: { leads: 1 } }],
  };
  return { campaign: { id: campaign, name: campaign === 7 ? 'Les Cigales' : 'MMA', variant: campaign === 7 ? 'vente' : 'lead_b2b' }, agent: null, generatedAt: '2026-09-10T15:30:00Z',
    periods: {
      current: { month, start: `${month}-01`, endExclusive: `${month}-11`, cutoffExclusive: `${month}-10T17:30:00.000`, cutoffTime: '17:30', days: 8, includedDates: [`${month}-01`, `${month}-02`, `${month}-03`, `${month}-04`, `${month}-07`, `${month}-08`, `${month}-09`, `${month}-10`], basis: 'business', partialDay: true },
      reference: { month: reference, start: `${reference}-03`, endExclusive: `${reference}-13`, cutoffExclusive: `${reference}-12T17:30:00.000`, cutoffTime: '17:30', days: 8, includedDates: [`${reference}-03`, `${reference}-04`, `${reference}-05`, `${reference}-06`, `${reference}-07`, `${reference}-10`, `${reference}-11`, `${reference}-12`], basis: 'business', partialDay: true },
      mode: 'business', timezone: 'Europe/Paris', asOf: '2026-09-10T15:30:00Z',
    },
    sections: [activity, result, daily, sources, { ...sources, id: 'portfolio', title: 'Portefeuille actuel', scope: 'snapshot', rows: [{ key: 'waiting', label: 'En attente', current: { calls: 42 }, reference: null }] }, { ...sources, id: 'recordings', title: 'Patrimoine audio', rows: [], error: 'Source indisponible' }],
    limitations: ['Les contacts humains correspondent à un ProgPA ≥ 1.', 'Les statuts de cohortes sont actuels, pas reconstitués.'],
  };
}
