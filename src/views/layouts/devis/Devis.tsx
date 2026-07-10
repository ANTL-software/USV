import './devis.scss';

import { ReactElement, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdArrowBack,
  MdAutoGraph,
  MdCheckCircle,
  MdDescription,
  MdDraw,
  MdFactCheck,
  MdHandshake,
  MdOutlineAddBusiness,
  MdSchedule,
} from 'react-icons/md';

import WithAuth from '../../../utils/middleware/WithAuth';
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

type TemplateFamily = 'cycle_client' | 'structuration' | 'marque';
type TemplateStatus = 'socle' | 'a_structurer';
type PriceMode = 'mensuel' | 'ponctuel';
type BudgetBand = '<3k' | '3k_8k' | '8k_15k' | '15k+';
type Timeline = 'urgent' | '30j' | '60j' | 'cadre';
type BillingRhythm = 'mensuel' | '50_50' | 'acompte';
type Engagement = '3_mois' | '6_mois' | 'mission_unique';

type QuoteLine = {
  id: string;
  label: string;
  description: string;
  amount: number;
  mode: PriceMode;
  selectedByDefault?: boolean;
};

type TemplateAssumption = {
  id: string;
  label: string;
};

type QuoteTemplate = {
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

type QuoteFormState = {
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

const FAMILY_LABELS: Record<TemplateFamily, string> = {
  cycle_client: 'Cycle client',
  structuration: 'Structuration',
  marque: 'Marque & acquisition',
};

const STATUS_LABELS: Record<TemplateStatus, string> = {
  socle: 'Socle prioritaire',
  a_structurer: 'À structurer',
};

const BUDGET_LABELS: Record<BudgetBand, string> = {
  '<3k': 'Moins de 3 000 €',
  '3k_8k': '3 000 € à 8 000 €',
  '8k_15k': '8 000 € à 15 000 €',
  '15k+': 'Plus de 15 000 €',
};

const TIMELINE_LABELS: Record<Timeline, string> = {
  urgent: 'Démarrage immédiat',
  '30j': 'Dans 30 jours',
  '60j': 'Dans 60 jours',
  cadre: 'Pas encore calé',
};

const BILLING_LABELS: Record<BillingRhythm, string> = {
  mensuel: 'Facturation mensuelle',
  '50_50': '50% lancement / 50% livraison',
  acompte: 'Acompte puis échéancier',
};

const ENGAGEMENT_LABELS: Record<Engagement, string> = {
  '3_mois': '3 mois',
  '6_mois': '6 mois',
  mission_unique: 'Mission ponctuelle',
};

const QUOTE_TEMPLATES: QuoteTemplate[] = [
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
      { id: 'conquete-ass-2', label: 'Validation du discours et des objections par le client en amont.' },
      { id: 'conquete-ass-3', label: 'Accès à un interlocuteur décisionnaire pour les arbitrages rapides.' },
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

const DEFAULT_FORM: QuoteFormState = {
  companyName: 'Maison Lelièvre',
  contactName: 'Claire Moreau',
  contactRole: 'Directrice commerciale',
  email: 'claire.moreau@maisonlelievre.fr',
  phone: '06 80 42 17 12',
  needSummary: 'L’équipe veut relancer l’acquisition B2B sans réinternaliser toute la prospection.',
  objective: 'Obtenir un flux régulier de rendez-vous qualifiés avec des décideurs PME.',
  budgetBand: '3k_8k',
  timeline: '30j',
  billingRhythm: 'mensuel',
  engagement: '3_mois',
};

function formatCurrency(value: number): string {
  return value.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  });
}

function getStatusTone(status: TemplateStatus): 'primary' | 'warning' {
  if (status === 'socle') {
    return 'primary';
  }

  return 'warning';
}

function buildInitialLineSelection(template: QuoteTemplate): Record<string, boolean> {
  return [...template.includedLines, ...template.optionLines].reduce<Record<string, boolean>>((accumulator, line) => {
    accumulator[line.id] = line.selectedByDefault ?? false;
    return accumulator;
  }, {});
}

function Devis(): ReactElement {
  const navigate = useNavigate();
  const [familyFilter, setFamilyFilter] = useState<TemplateFamily | 'all'>('all');
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([QUOTE_TEMPLATES[0].id]);
  const [formState, setFormState] = useState<QuoteFormState>(DEFAULT_FORM);
  const [lineSelection, setLineSelection] = useState<Record<string, boolean>>(
    buildInitialLineSelection(QUOTE_TEMPLATES[0]),
  );

  const visibleTemplates = useMemo(() => (
    familyFilter === 'all'
      ? QUOTE_TEMPLATES
      : QUOTE_TEMPLATES.filter((template) => template.family === familyFilter)
  ), [familyFilter]);

  const selectedTemplates = useMemo(
    () => QUOTE_TEMPLATES.filter((template) => selectedTemplateIds.includes(template.id)),
    [selectedTemplateIds],
  );

  const selectedIncludedLines = useMemo(
    () => selectedTemplates.flatMap((template) => (
      template.includedLines.filter((line) => lineSelection[line.id])
    )),
    [lineSelection, selectedTemplates],
  );

  const selectedOptionLines = useMemo(
    () => selectedTemplates.flatMap((template) => (
      template.optionLines.filter((line) => lineSelection[line.id])
    )),
    [lineSelection, selectedTemplates],
  );

  const monthlySubtotal = useMemo(
    () => [...selectedIncludedLines, ...selectedOptionLines]
      .filter((line) => line.mode === 'mensuel')
      .reduce((sum, line) => sum + line.amount, selectedTemplates.reduce((total, template) => total + template.baseFee, 0)),
    [selectedIncludedLines, selectedOptionLines, selectedTemplates],
  );

  const oneShotSubtotal = useMemo(
    () => [...selectedIncludedLines, ...selectedOptionLines]
      .filter((line) => line.mode === 'ponctuel')
      .reduce((sum, line) => sum + line.amount, selectedTemplates.reduce((total, template) => total + template.setupFee, 0)),
    [selectedIncludedLines, selectedOptionLines, selectedTemplates],
  );

  const engagementMonths = useMemo(() => {
    if (formState.engagement === '6_mois') {
      return 6;
    }

    if (formState.engagement === 'mission_unique') {
      return 1;
    }

    return 3;
  }, [formState.engagement]);

  const projectedTotal = oneShotSubtotal + (monthlySubtotal * engagementMonths);

  const completedChecklist = useMemo(() => {
    const items = [
      formState.companyName.trim(),
      formState.contactName.trim(),
      formState.needSummary.trim(),
      formState.objective.trim(),
      selectedIncludedLines.length > 0,
    ];

    return items.filter(Boolean).length;
  }, [formState.companyName, formState.contactName, formState.needSummary, formState.objective, selectedIncludedLines.length]);

  const progressPercent = Math.round((completedChecklist / 5) * 100);

  function handleTemplateToggle(templateId: string): void {
    const template = QUOTE_TEMPLATES.find((entry) => entry.id === templateId);

    if (!template) {
      return;
    }

    setSelectedTemplateIds((previous) => (
      previous.includes(templateId)
        ? previous.filter((entry) => entry !== templateId)
        : [...previous, templateId]
    ));
    setLineSelection((previous) => ({
      ...buildInitialLineSelection(template),
      ...previous,
    }));
  }

  function handleFormChange<Field extends keyof QuoteFormState>(field: Field, value: QuoteFormState[Field]): void {
    setFormState((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleLineToggle(lineId: string): void {
    setLineSelection((previous) => ({
      ...previous,
      [lineId]: !previous[lineId],
    }));
  }

  return (
    <div id="devisView">
      <Header />
      <SubNav />
      <main>
        <div className="devisView__container">
          <div className="devisView__back">
            <Button style="back" onClick={() => navigate('/commercial')}>
              <MdArrowBack />
              <span>Retour au commercial</span>
            </Button>
          </div>

          <section className="devisView__hero">
            <div>
              <p className="devisView__eyebrow">Commercial / Devis</p>
              <h1>Préparer un devis de bout en bout</h1>
              <p className="devisView__subtitle">
                Cette maquette montre comment la feature peut fonctionner avant la génération du document final :
                choix du modèle, cadrage du besoin, composition de l’offre et aperçu commercial immédiat.
              </p>
            </div>

            <div className="devisView__hero-kpis">
              <div>
                <span>Modèle sélectionné</span>
                <strong>{selectedTemplates.map((template) => template.title).join(' + ')}</strong>
              </div>
              <div>
                <span>Avancement</span>
                <strong>{progressPercent}% prêt</strong>
              </div>
              <div>
                <span>Projection</span>
                <strong>{formatCurrency(projectedTotal)}</strong>
              </div>
            </div>
          </section>

          <section className="devisView__summary">
            <article className="devisView__summary-card devisView__summary-card--primary">
              <span>Étape 1</span>
              <strong>Choisir le modèle adapté</strong>
            </article>
            <article className="devisView__summary-card devisView__summary-card--success">
              <span>Étape 2</span>
              <strong>Renseigner le contexte client</strong>
            </article>
            <article className="devisView__summary-card devisView__summary-card--warning">
              <span>Étape 3</span>
              <strong>Composer le périmètre</strong>
            </article>
            <article className="devisView__summary-card devisView__summary-card--muted">
              <span>Étape 4</span>
              <strong>Valider le récap avant PDF</strong>
            </article>
          </section>

          <section className="devisView__workspace">
            <div className="devisView__main">
              <article className="devisView__panel">
                <div className="devisView__panel-header">
                  <MdDraw />
                  <div>
                    <h2>1. Sélection du modèle</h2>
                    <p>On part d’un pôle d’activité, puis on affine le devis autour de son périmètre.</p>
                  </div>
                </div>

                <div className="devisView__filters-grid">
                  <div className="devisView__field">
                    <span>Famille d’expertise</span>
                    <select
                      value={familyFilter}
                      onChange={(event) => setFamilyFilter(event.target.value as TemplateFamily | 'all')}
                    >
                      <option value="all">Toutes les familles</option>
                      {Object.entries(FAMILY_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="devisView__template-grid">
                  {visibleTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      className={`devisView__template-pick ${selectedTemplateIds.includes(template.id) ? 'is-selected' : ''}`}
                      onClick={() => handleTemplateToggle(template.id)}
                    >
                      <div className="devisView__template-head">
                        <span className={`devisView__badge devisView__badge--${getStatusTone(template.status)}`}>
                          {STATUS_LABELS[template.status]}
                        </span>
                        <small>{FAMILY_LABELS[template.family]}</small>
                      </div>
                      <strong>{template.title}</strong>
                      <p>{template.description}</p>
                    </button>
                  ))}
                </div>
              </article>

              <article className="devisView__panel">
                <div className="devisView__panel-header">
                  <MdOutlineAddBusiness />
                  <div>
                    <h2>2. Contexte client</h2>
                    <p>Ce bloc aide à comprendre quelles informations il faut faire entrer dans un devis avant chiffrage.</p>
                  </div>
                </div>

                <div className="devisView__form-grid">
                  <label className="devisView__field">
                    <span>Entreprise</span>
                    <input
                      value={formState.companyName}
                      onChange={(event) => handleFormChange('companyName', event.target.value)}
                    />
                  </label>
                  <label className="devisView__field">
                    <span>Interlocuteur</span>
                    <input
                      value={formState.contactName}
                      onChange={(event) => handleFormChange('contactName', event.target.value)}
                    />
                  </label>
                  <label className="devisView__field">
                    <span>Fonction</span>
                    <input
                      value={formState.contactRole}
                      onChange={(event) => handleFormChange('contactRole', event.target.value)}
                    />
                  </label>
                  <label className="devisView__field">
                    <span>Email</span>
                    <input
                      value={formState.email}
                      onChange={(event) => handleFormChange('email', event.target.value)}
                    />
                  </label>
                  <label className="devisView__field">
                    <span>Téléphone</span>
                    <input
                      value={formState.phone}
                      onChange={(event) => handleFormChange('phone', event.target.value)}
                    />
                  </label>
                  <label className="devisView__field">
                    <span>Budget pressenti</span>
                    <select
                      value={formState.budgetBand}
                      onChange={(event) => handleFormChange('budgetBand', event.target.value as BudgetBand)}
                    >
                      {Object.entries(BUDGET_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="devisView__field devisView__field--full">
                    <span>Besoin exprimé</span>
                    <textarea
                      rows={3}
                      value={formState.needSummary}
                      onChange={(event) => handleFormChange('needSummary', event.target.value)}
                    />
                  </label>
                  <label className="devisView__field devisView__field--full">
                    <span>Objectif principal</span>
                    <textarea
                      rows={3}
                      value={formState.objective}
                      onChange={(event) => handleFormChange('objective', event.target.value)}
                    />
                  </label>
                </div>
              </article>

              <article className="devisView__panel">
                <div className="devisView__panel-header">
                  <MdFactCheck />
                  <div>
                    <h2>3. Composition de l’offre</h2>
                    <p>Le devis prend forme à partir d’un socle inclus, puis d’options activables selon le contexte.</p>
                  </div>
                </div>

                <div className="devisView__offer-columns">
                  <section>
                    <div className="devisView__section-title">
                      <strong>Inclus dans la proposition</strong>
                      <span>{selectedTemplates.map((template) => template.promise).join(' ')}</span>
                    </div>

                    <div className="devisView__line-list">
                      {selectedTemplates.flatMap((template) => template.includedLines).map((line) => (
                        <label key={line.id} className={`devisView__line-card ${lineSelection[line.id] ? 'is-active' : ''}`}>
                          <input
                            type="checkbox"
                            checked={Boolean(lineSelection[line.id])}
                            onChange={() => handleLineToggle(line.id)}
                          />
                          <div>
                            <strong>{line.label}</strong>
                            <p>{line.description}</p>
                          </div>
                          <span>{formatCurrency(line.amount)} / {line.mode}</span>
                        </label>
                      ))}
                    </div>
                  </section>

                  <section>
                    <div className="devisView__section-title">
                      <strong>Options commerciales</strong>
                      <span>Modules complémentaires à activer selon l’ambition du client.</span>
                    </div>

                    <div className="devisView__line-list">
                      {selectedTemplates.flatMap((template) => template.optionLines).map((line) => (
                        <label key={line.id} className={`devisView__line-card ${lineSelection[line.id] ? 'is-active' : ''}`}>
                          <input
                            type="checkbox"
                            checked={Boolean(lineSelection[line.id])}
                            onChange={() => handleLineToggle(line.id)}
                          />
                          <div>
                            <strong>{line.label}</strong>
                            <p>{line.description}</p>
                          </div>
                          <span>{formatCurrency(line.amount)} / {line.mode}</span>
                        </label>
                      ))}
                    </div>
                  </section>
                </div>
              </article>

              <article className="devisView__panel">
                <div className="devisView__panel-header">
                  <MdHandshake />
                  <div>
                    <h2>4. Conditions commerciales</h2>
                    <p>Ce bloc matérialise ce qui finit presque toujours dans un devis, même avant le PDF final.</p>
                  </div>
                </div>

                <div className="devisView__form-grid">
                  <label className="devisView__field">
                    <span>Délai de démarrage</span>
                    <select
                      value={formState.timeline}
                      onChange={(event) => handleFormChange('timeline', event.target.value as Timeline)}
                    >
                      {Object.entries(TIMELINE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="devisView__field">
                    <span>Engagement</span>
                    <select
                      value={formState.engagement}
                      onChange={(event) => handleFormChange('engagement', event.target.value as Engagement)}
                    >
                      {Object.entries(ENGAGEMENT_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="devisView__field">
                    <span>Rythme de facturation</span>
                    <select
                      value={formState.billingRhythm}
                      onChange={(event) => handleFormChange('billingRhythm', event.target.value as BillingRhythm)}
                    >
                      {Object.entries(BILLING_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="devisView__assumptions">
                  {selectedTemplates.flatMap((template) => template.assumptions).map((assumption) => (
                    <div key={assumption.id}>
                      <MdCheckCircle />
                      <span>{assumption.label}</span>
                    </div>
                  ))}
                </div>
              </article>
            </div>

            <aside className="devisView__sidebar devisView__sidebar--sticky">
              <article className="devisView__panel">
                <div className="devisView__panel-header">
                  <MdDescription />
                  <div>
                    <h2>Aperçu du devis</h2>
                    <p>Version de travail qui aide à se représenter le rendu métier avant export document.</p>
                  </div>
                </div>

                <div className="devisView__preview-card">
                  <span className="devisView__preview-eyebrow">Proposition commerciale</span>
                  <h3>{selectedTemplates.map((template) => template.title).join(' + ')}</h3>
                  <p>{selectedTemplates.map((template) => template.promise).join(' ')}</p>
                </div>

                <div className="devisView__preview-block">
                  <span>Client</span>
                  <strong>{formState.companyName}</strong>
                  <small>{formState.contactName} • {formState.contactRole}</small>
                  <small>{formState.email} • {formState.phone}</small>
                </div>

                <div className="devisView__preview-block">
                  <span>Objectif</span>
                  <strong>{formState.objective}</strong>
                </div>

                <div className="devisView__preview-block">
                  <span>Périmètre retenu</span>
                  <ul>
                    {selectedIncludedLines.map((line) => (
                      <li key={line.id}>{line.label}</li>
                    ))}
                    {selectedOptionLines.map((line) => (
                      <li key={line.id}>{line.label}</li>
                    ))}
                  </ul>
                </div>

                <div className="devisView__pricing">
                  <div>
                    <span>Frais de cadrage / lancement</span>
                    <strong>{formatCurrency(oneShotSubtotal)}</strong>
                  </div>
                  <div>
                    <span>Récurrence mensuelle</span>
                    <strong>{formatCurrency(monthlySubtotal)}</strong>
                  </div>
                  <div>
                    <span>Engagement estimé</span>
                    <strong>{ENGAGEMENT_LABELS[formState.engagement]}</strong>
                  </div>
                  <div className="is-total">
                    <span>Projection totale</span>
                    <strong>{formatCurrency(projectedTotal)}</strong>
                  </div>
                </div>

                <div className="devisView__timeline">
                  <div>
                    <MdSchedule />
                    <span>{TIMELINE_LABELS[formState.timeline]}</span>
                  </div>
                  <div>
                    <MdAutoGraph />
                    <span>{BUDGET_LABELS[formState.budgetBand]}</span>
                  </div>
                </div>

                <div className="devisView__sidebar-actions">
                  <Button style="gradient">
                    <span>Enregistrer le brouillon</span>
                  </Button>
                  <Button style="white">
                    <span>Préparer le futur document</span>
                  </Button>
                </div>
              </article>
            </aside>
          </section>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const DevisWithAuth = WithAuth(Devis);

export default DevisWithAuth;
