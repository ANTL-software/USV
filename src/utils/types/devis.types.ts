export type TemplateFamily = 'cycle_client' | 'structuration' | 'marque';
export type TemplateStatus = 'socle' | 'a_structurer';
export type PriceMode = 'mensuel' | 'ponctuel';
export type BudgetBand = '<3k' | '3k_8k' | '8k_15k' | '15k+';
export type Timeline = 'urgent' | '30j' | '60j' | 'cadre';
export type BillingRhythm = 'mensuel' | '50_50' | 'acompte';
export type Engagement = '3_mois' | '6_mois' | 'mission_unique';

export type QuoteLine = {
  id: string;
  label: string;
  description: string;
  amount: number;
  mode: PriceMode;
  selectedByDefault?: boolean;
};

export type TemplateAssumption = {
  id: string;
  label: string;
};

export type QuoteTemplate = {
  id: string;
  title: string;
  description: string;
  family: TemplateFamily;
  status: TemplateStatus;
  promise: string;
  baseFee: number;
  setupFee: number;
  durationLabel: string;
  objectives: string[];
  includedLines: QuoteLine[];
  optionLines: QuoteLine[];
  assumptions: TemplateAssumption[];
};

export type QuoteFormState = {
  companyName: string;
  contactName: string;
  contactRole: string;
  email: string;
  phone: string;
  needSummary: string;
  objective: string;
  budgetBand: BudgetBand;
  timeline: Timeline;
  billingRhythm: BillingRhythm;
  engagement: Engagement;
};

export type QuoteFormChangeHandler = <Field extends keyof QuoteFormState>(
  field: Field,
  value: QuoteFormState[Field],
) => void;
