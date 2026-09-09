export type ComparisonUnit = 'number' | 'percent' | 'duration' | 'currency' | 'hours' | 'days' | 'bytes';
export type ComparisonValues = Record<string, number | null>;
export interface ComparisonMetric { key: string; label: string; unit: ComparisonUnit; description: string; }
export interface ComparisonRow { key: string; label: string; current: ComparisonValues | null; reference: ComparisonValues | null; }
export interface ComparisonSection {
  id: string; title: string; description: string; scope: 'monthly' | 'snapshot';
  metrics: ComparisonMetric[]; chartMetric: string; error: string | null; rows: ComparisonRow[];
}
export interface ComparisonPeriod { month: string; start: string; endExclusive: string; days: number; partialDay: boolean; }
export interface ComparisonCampaign { id: number; name: string; variant: 'vente' | 'lead_b2b'; status?: string; }
export interface ComparisonOptions {
  campaigns: ComparisonCampaign[];
  agents: { id: number; name: string; campaigns: number[] }[];
  coverage: { first_call: string | null; last_call: string | null };
}
export interface ComparisonFilters { campaign: number; agent: number | null; month: string; reference: string; mode: 'aligned' | 'full'; }
export interface MonthlyComparison {
  campaign: ComparisonCampaign; agent: number | null; generatedAt: string;
  periods: { current: ComparisonPeriod; reference: ComparisonPeriod; mode: 'aligned' | 'full'; timezone: string; asOf: string };
  sections: ComparisonSection[]; limitations: string[];
}
