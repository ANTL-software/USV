import type {
  BillingRhythm,
  BudgetBand,
  Engagement,
  QuoteCustomClause,
  QuotePdfPayload,
  QuoteFormState,
  QuoteCampaignType,
  QuoteTemplate,
  TemplateFamily,
  TemplateStatus,
  Timeline,
} from '../types/index.ts';

export const FAMILY_LABELS: Record<TemplateFamily, string> = {
  cycle_client: 'Cycle client',
  structuration: 'Structuration',
  marque: 'Marque & acquisition',
};

export const STATUS_LABELS: Record<TemplateStatus, string> = {
  socle: 'Socle prioritaire',
  a_structurer: 'À structurer',
};

export const BUDGET_LABELS: Record<BudgetBand, string> = {
  '<3k': 'Moins de 3 000 €',
  '3k_8k': '3 000 € à 8 000 €',
  '8k_15k': '8 000 € à 15 000 €',
  '15k+': 'Plus de 15 000 €',
};

export const TIMELINE_LABELS: Record<Timeline, string> = {
  urgent: 'Démarrage immédiat',
  '30j': 'Dans 30 jours',
  '60j': 'Dans 60 jours',
  cadre: 'Pas encore calé',
};

export const BILLING_LABELS: Record<BillingRhythm, string> = {
  mensuel: 'Facturation mensuelle',
  '50_50': '50% lancement / 50% livraison',
  acompte: 'Acompte puis échéancier',
};

export const QUOTE_CAMPAIGN_TYPE_LABELS: Record<QuoteCampaignType, string> = {
  commercial: 'Commercial',
  qualified_appointment: 'Rendez-vous qualifié',
};

export const ENGAGEMENT_LABELS: Record<Engagement, string> = {
  '1_mois_reconduction': '1 mois, reconduction tacite',
  '3_mois': '3 mois',
  '6_mois': '6 mois',
  mission_unique: 'Mission ponctuelle',
};

export const QUOTE_TEMPLATES: QuoteTemplate[] = [
  {
    id: 'conquete',
    title: 'Conquête',
    description: 'Prospection, qualification et prise de rendez-vous pour ouvrir un pipe commercial propre.',
    family: 'cycle_client',
    status: 'socle',
    promise: 'Déployer une mécanique d’acquisition claire, pilotée au volume et à la qualité des leads générés.',
    baseFee: 1850,
    setupFee: 950,
    durationLabel: 'Sprint initial de 3 mois',
    objectives: ['Générer des rendez-vous qualifiés', 'Structurer le discours', 'Mesurer le taux de transformation'],
    includedLines: [
      {
        id: 'conquete-ciblage',
        label: 'Ciblage et segmentation',
        description: 'Travail des cibles, qualification des typologies et messages d’approche.',
        amount: 350,
        mode: 'mensuel',
        selectedByDefault: true,
      },
      {
        id: 'conquete-production',
        label: 'Production commerciale',
        description: 'Campagnes d’appels, traitement des objections et remontées de terrain.',
        amount: 1100,
        mode: 'mensuel',
        selectedByDefault: true,
      },
      {
        id: 'conquete-reporting',
        label: 'Pilotage et reporting',
        description: 'Rythme de suivi, lecture des résultats et ajustements du dispositif.',
        amount: 400,
        mode: 'mensuel',
        selectedByDefault: true,
      },
    ],
    optionLines: [
      {
        id: 'conquete-linkedin',
        label: 'Relais LinkedIn',
        description: 'Appui messages et séquences complémentaires sur LinkedIn.',
        amount: 420,
        mode: 'mensuel',
      },
      {
        id: 'conquete-landing',
        label: 'Mini landing de conversion',
        description: 'Page d’atterrissage légère pour consolider la prise de contact.',
        amount: 850,
        mode: 'ponctuel',
      },
    ],
    assumptions: [
      { id: 'conquete-ass-1', label: 'Base prospects ou ciblage fournis ou validés avant lancement.' },
      { id: 'conquete-ass-2', label: 'Facturation au rendez-vous réalisé.' },
    ],
  },
  {
    id: 'fidelisation',
    title: 'Fidélisation',
    description: 'Programme de suivi client pour animer le portefeuille et réduire l’érosion relationnelle.',
    family: 'cycle_client',
    status: 'socle',
    promise: 'Installer une cadence relationnelle qui augmente la satisfaction, la récurrence et les opportunités d’upsell.',
    baseFee: 1650,
    setupFee: 700,
    durationLabel: 'Déploiement continu sur 6 mois',
    objectives: ['Réactiver le portefeuille', 'Améliorer la satisfaction', 'Détecter les opportunités commerciales'],
    includedLines: [
      {
        id: 'fidelisation-animation',
        label: 'Animation portefeuille',
        description: 'Campagnes de suivi, rappels, points de contact et remontées clients.',
        amount: 980,
        mode: 'mensuel',
        selectedByDefault: true,
      },
      {
        id: 'fidelisation-discours',
        label: 'Trame relationnelle',
        description: 'Conception des séquences et harmonisation du ton de relation client.',
        amount: 320,
        mode: 'mensuel',
        selectedByDefault: true,
      },
      {
        id: 'fidelisation-lecture',
        label: 'Tableau de bord fidélité',
        description: 'Lecture des retours, irritants et signaux d’attrition.',
        amount: 350,
        mode: 'mensuel',
        selectedByDefault: true,
      },
    ],
    optionLines: [
      {
        id: 'fidelisation-enquete',
        label: 'Enquête satisfaction',
        description: 'Collecte et synthèse d’un baromètre simple post-interaction.',
        amount: 480,
        mode: 'mensuel',
      },
      {
        id: 'fidelisation-atelier',
        label: 'Atelier expérience client',
        description: 'Session de restitution et plan d’action avec les équipes internes.',
        amount: 980,
        mode: 'ponctuel',
      },
    ],
    assumptions: [
      { id: 'fidelisation-ass-1', label: 'Base clients active et historique d’échanges exploitables.' },
      { id: 'fidelisation-ass-2', label: 'Un canal de suivi validé par la marque et les équipes internes.' },
    ],
  },
  {
    id: 'retention',
    title: 'Rétention',
    description: 'Dispositif de récupération client et d’anti-churn avec priorisation des dossiers sensibles.',
    family: 'cycle_client',
    status: 'socle',
    promise: 'Traiter les points de friction avant rupture et redonner une trajectoire aux comptes à risque.',
    baseFee: 2100,
    setupFee: 1100,
    durationLabel: 'Mission intensive sur 3 mois',
    objectives: ['Réduire le churn', 'Récupérer les comptes chauds', 'Qualifier les causes de départ'],
    includedLines: [
      {
        id: 'retention-priorisation',
        label: 'Priorisation des comptes',
        description: 'Classement des cas sensibles et définition des motifs de traitement.',
        amount: 500,
        mode: 'mensuel',
        selectedByDefault: true,
      },
      {
        id: 'retention-traitement',
        label: 'Traitement relationnel',
        description: 'Actions de rappel, négociation et résolution des cas de friction.',
        amount: 1200,
        mode: 'mensuel',
        selectedByDefault: true,
      },
      {
        id: 'retention-analyses',
        label: 'Analyses churn',
        description: 'Lecture des motifs, verbatims et recommandations correctives.',
        amount: 400,
        mode: 'mensuel',
        selectedByDefault: true,
      },
    ],
    optionLines: [
      {
        id: 'retention-scripts',
        label: 'Scripts de rétention avancés',
        description: 'Bibliothèque d’arguments et scénarios de sortie de crise.',
        amount: 650,
        mode: 'ponctuel',
      },
      {
        id: 'retention-comex',
        label: 'Restitution direction',
        description: 'Synthèse exécutive et plan correctif priorisé.',
        amount: 720,
        mode: 'ponctuel',
      },
    ],
    assumptions: [
      { id: 'retention-ass-1', label: 'Le client partage les motifs de résiliation et segments prioritaires.' },
      { id: 'retention-ass-2', label: 'Des marges de manœuvre commerciales sont définies en amont.' },
    ],
  },
  {
    id: 'conception',
    title: 'Conception',
    description: 'Conception d’outils commerciaux, de process et d’appuis opérationnels.',
    family: 'structuration',
    status: 'a_structurer',
    promise: 'Créer un cadre de travail plus lisible, plus automatisé et plus exploitable par les équipes.',
    baseFee: 2400,
    setupFee: 1400,
    durationLabel: 'Mission ponctuelle de 6 à 10 semaines',
    objectives: ['Clarifier les process', 'Outiller les équipes', 'Gagner en efficacité opérationnelle'],
    includedLines: [
      {
        id: 'conception-audit',
        label: 'Audit fonctionnel',
        description: 'Cartographie des besoins, irritants et usages métier.',
        amount: 850,
        mode: 'ponctuel',
        selectedByDefault: true,
      },
      {
        id: 'conception-cadrage',
        label: 'Cadrage de solution',
        description: 'Définition des parcours, flux et livrables attendus.',
        amount: 900,
        mode: 'ponctuel',
        selectedByDefault: true,
      },
      {
        id: 'conception-recette',
        label: 'Recette et appropriation',
        description: 'Validation métier et accompagnement à la prise en main.',
        amount: 650,
        mode: 'ponctuel',
        selectedByDefault: true,
      },
    ],
    optionLines: [
      {
        id: 'conception-ia',
        label: 'Brique IA métier',
        description: 'Exploration d’automatisations assistées par IA sur un périmètre ciblé.',
        amount: 1200,
        mode: 'ponctuel',
      },
      {
        id: 'conception-doc',
        label: 'Documentation d’exploitation',
        description: 'Guide d’usage et base de reprise pour les équipes.',
        amount: 540,
        mode: 'ponctuel',
      },
    ],
    assumptions: [
      { id: 'conception-ass-1', label: 'Un référent métier disponible pour les arbitrages hebdomadaires.' },
      { id: 'conception-ass-2', label: 'Accès aux outils et process existants pendant la phase d’audit.' },
    ],
  },
  {
    id: 'visibilite-online',
    title: 'Visibilité online',
    description: 'Dispositif de présence digitale, site et animation de canaux pour soutenir l’acquisition.',
    family: 'marque',
    status: 'a_structurer',
    promise: 'Rendre l’offre plus visible et plus compréhensible pour capter l’attention au bon endroit.',
    baseFee: 1900,
    setupFee: 1200,
    durationLabel: 'Lancement sur 4 mois',
    objectives: ['Rendre l’offre visible', 'Améliorer la crédibilité', 'Créer des points d’entrée commerciaux'],
    includedLines: [
      {
        id: 'visibilite-audit',
        label: 'Audit présence digitale',
        description: 'Lecture de l’existant et recommandations prioritaires.',
        amount: 450,
        mode: 'mensuel',
        selectedByDefault: true,
      },
      {
        id: 'visibilite-animation',
        label: 'Animation de contenus',
        description: 'Production et pilotage d’un calendrier éditorial simple.',
        amount: 980,
        mode: 'mensuel',
        selectedByDefault: true,
      },
      {
        id: 'visibilite-site',
        label: 'Optimisation pages clés',
        description: 'Travail sur les pages d’entrée, messages et conversions.',
        amount: 470,
        mode: 'mensuel',
        selectedByDefault: true,
      },
    ],
    optionLines: [
      {
        id: 'visibilite-shooting',
        label: 'Pack visuels',
        description: 'Création d’un petit socle visuel pour les supports digitaux.',
        amount: 780,
        mode: 'ponctuel',
      },
      {
        id: 'visibilite-campagne',
        label: 'Micro campagne sponsorisée',
        description: 'Pilotage d’un test d’acquisition sur un canal donné.',
        amount: 520,
        mode: 'mensuel',
      },
    ],
    assumptions: [
      { id: 'visibilite-ass-1', label: 'Le client valide les contenus et visuels dans des délais courts.' },
      { id: 'visibilite-ass-2', label: 'Les accès aux canaux et outils de publication sont disponibles.' },
    ],
  },
  {
    id: 'branding',
    title: 'Branding',
    description: 'Travail de positionnement, discours et cohérence de marque pour soutenir la vente.',
    family: 'marque',
    status: 'a_structurer',
    promise: 'Clarifier ce que la marque raconte, à qui elle parle et comment elle se différencie.',
    baseFee: 2200,
    setupFee: 1300,
    durationLabel: 'Mission de cadrage sur 8 semaines',
    objectives: ['Clarifier le positionnement', 'Harmoniser le discours', 'Renforcer la perception de valeur'],
    includedLines: [
      {
        id: 'branding-diagnostic',
        label: 'Diagnostic de marque',
        description: 'Analyse du positionnement, messages et cohérence perçue.',
        amount: 760,
        mode: 'ponctuel',
        selectedByDefault: true,
      },
      {
        id: 'branding-plateforme',
        label: 'Plateforme de discours',
        description: 'Messages clés, promesse et angles de prise de parole.',
        amount: 920,
        mode: 'ponctuel',
        selectedByDefault: true,
      },
      {
        id: 'branding-declinaison',
        label: 'Déclinaisons commerciales',
        description: 'Adaptation du discours sur les principaux supports de vente.',
        amount: 520,
        mode: 'ponctuel',
        selectedByDefault: true,
      },
    ],
    optionLines: [
      {
        id: 'branding-atelier',
        label: 'Atelier direction',
        description: 'Session de validation collective et arbitrage du territoire.',
        amount: 860,
        mode: 'ponctuel',
      },
      {
        id: 'branding-kit',
        label: 'Kit de messages',
        description: 'Trames prêtes à l’emploi pour site, mail et commercial.',
        amount: 620,
        mode: 'ponctuel',
      },
    ],
    assumptions: [
      { id: 'branding-ass-1', label: 'Disponibilité des dirigeants ou parties prenantes pour les ateliers.' },
      { id: 'branding-ass-2', label: 'Partage des supports existants et éléments de concurrence.' },
    ],
  },
];

export const DEFAULT_FORM: QuoteFormState = {
  companyName: '',
  contactName: '',
  contactRole: '',
  email: '',
  phone: '',
  needSummary: '',
  objective: '',
  budgetBand: '3k_8k',
  timeline: '30j',
  billingRhythm: 'mensuel',
  engagement: '1_mois_reconduction',
};

export function formatCurrency(value: number): string {
  return value.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  });
}

export function getStatusTone(status: TemplateStatus): 'primary' | 'warning' {
  if (status === 'socle') {
    return 'primary';
  }

  return 'warning';
}

export const filterQuoteTemplates = (
  templates: QuoteTemplate[],
  family: TemplateFamily | 'all',
): QuoteTemplate[] => (family === 'all' ? templates : templates.filter((template) => template.family === family));

export const getSelectedQuoteTemplates = (
  templates: QuoteTemplate[],
  selectedIds: string[],
): QuoteTemplate[] => templates.filter((template) => selectedIds.includes(template.id));

export const getQuoteEngagementMonths = (engagement: QuoteFormState['engagement']): number => {
  if (engagement === '1_mois_reconduction') return 1;
  if (engagement === '6_mois') return 6;
  if (engagement === 'mission_unique') return 1;
  return 3;
};

export const buildQuotePricingLines = (
  campaignType: QuoteCampaignType,
  commercialCommissionRate: number | undefined,
  appointmentRate: number | undefined,
  customClauses: QuoteCustomClause[],
): QuotePdfPayload['lines'] => {
  if (campaignType === 'commercial') {
    if (commercialCommissionRate === undefined) return [];
    return [{
      id: 'commercial-commission',
      label: 'Commission par vente',
      description: 'Commission appliquée au montant HT de chaque vente conclue.',
      mode: 'ponctuel',
      included: false,
      amount: commercialCommissionRate,
      amount_kind: 'percentage',
    }];
  }

  const appointmentLine = appointmentRate === undefined ? [] : [{
    id: 'qualified-appointment-base',
    label: 'Rendez-vous pris',
    description: 'Tarif unitaire facturé pour chaque rendez-vous qualifié réalisé.',
    mode: 'ponctuel' as const,
    included: false,
    amount: appointmentRate,
    amount_kind: 'currency' as const,
  }];
  const clauseLines = customClauses
    .filter((clause) => clause.label.trim() && (clause.amount !== undefined || clause.included))
    .map((clause) => ({
      id: clause.id,
      label: clause.label.trim(),
      description: 'Clause tarifaire personnalisée.',
      mode: 'ponctuel' as const,
      included: clause.included,
      amount: clause.amount ?? 0,
      amount_kind: 'currency' as const,
    }));

  return [...appointmentLine, ...clauseLines];
};

export const getQuoteChecklistProgress = (
  form: QuoteFormState,
  quoteLineCount: number,
): { completed: number; total: number; percent: number } => {
  const checklist = [
    form.companyName.trim(),
    form.contactName.trim(),
    form.needSummary.trim(),
    form.objective.trim(),
    quoteLineCount > 0,
  ];
  const completed = checklist.filter(Boolean).length;
  const total = checklist.length;
  return { completed, total, percent: Math.round((completed / total) * 100) };
};

export const toggleQuoteTemplateId = (selectedIds: string[], templateId: string): string[] => (
  selectedIds.includes(templateId)
    ? selectedIds.filter((selectedId) => selectedId !== templateId)
    : [...selectedIds, templateId]
);
