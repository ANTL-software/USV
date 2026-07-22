export type TemplateFamily = 'cycle_client' | 'structuration' | 'marque';
export type TemplateStatus = 'socle' | 'a_structurer';
export type PriceMode = 'mensuel' | 'ponctuel';
export type BudgetBand = '<3k' | '3k_8k' | '8k_15k' | '15k+';
export type Timeline = 'urgent' | '30j' | '60j' | 'cadre';
export type BillingRhythm = 'mensuel' | '50_50' | 'acompte';
export type Engagement = '1_mois_reconduction' | '3_mois' | '6_mois' | 'mission_unique';
export type QuoteCampaignType = 'commercial' | 'qualified_appointment';

export type QuoteCustomClause = {
  id: string;
  label: string;
  amount: number | undefined;
  included: boolean;
};

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

export type QuotePdfPayload = {
  pricing_model: QuoteCampaignType;
  client: {
    company_name: string;
    contact_name: string;
    contact_role: string;
    email: string;
    phone: string;
  };
  context: {
    need_summary: string;
    objective: string;
  };
  terms: {
    timeline_label: string;
    engagement_label: string;
    engagement_months: number;
    billing_label: string;
  };
  lines: Array<{
    id: string;
    label: string;
    description: string;
    mode: PriceMode;
    included: boolean;
    amount: number;
    amount_kind: 'currency' | 'percentage';
  }>;
  assumptions: string[];
};
