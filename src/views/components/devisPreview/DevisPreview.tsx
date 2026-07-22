import type { ReactElement } from 'react';
import { MdAutoGraph, MdDescription, MdSchedule } from 'react-icons/md';
import {
  BUDGET_LABELS,
  ENGAGEMENT_LABELS,
  TIMELINE_LABELS,
  formatCurrency,
  QUOTE_CAMPAIGN_TYPE_LABELS,
} from '../../../utils/scripts/index.ts';
import type { QuoteCampaignType, QuoteFormState, QuotePdfPayload } from '../../../utils/types/index.ts';
import { Button } from '../button/index.ts';

interface DevisPreviewProps {
  form: QuoteFormState;
  campaignType: QuoteCampaignType;
  quoteLines: QuotePdfPayload['lines'];
  selectedTemplatePromise: string;
  selectedTemplateTitle: string;
  isGeneratingQuote: boolean;
  onGenerateQuote: () => void;
}

export function DevisPreview({
  form,
  campaignType,
  quoteLines,
  selectedTemplatePromise,
  selectedTemplateTitle,
  isGeneratingQuote,
  onGenerateQuote,
}: DevisPreviewProps): ReactElement {
  return (
    <aside className="devisView__sidebar devisView__sidebar--sticky">
      <article className="devisView__panel">
        <div className="devisView__panel-header">
          <MdDescription />
          <div>
            <h2>Aperçu du devis</h2>
            <p>Récapitulatif du périmètre et des conditions commerciales retenues.</p>
          </div>
        </div>

        <div className="devisView__preview-card">
          <span className="devisView__preview-eyebrow">Proposition commerciale</span>
          <h3>{selectedTemplateTitle || 'Aucun modèle sélectionné'}</h3>
          <p>{selectedTemplatePromise || 'Sélectionnez au moins un modèle pour construire la proposition.'}</p>
        </div>

        <div className="devisView__preview-block">
          <span>Client</span>
          <strong>{form.companyName}</strong>
          <small>{form.contactName} • {form.contactRole}</small>
          <small>{form.email} • {form.phone}</small>
        </div>

        <div className="devisView__preview-block">
          <span>Objectif</span>
          <strong>{form.objective}</strong>
        </div>

        <div className="devisView__preview-block">
          <span>Périmètre retenu</span>
          <ul>
            {quoteLines.map((line) => (
              <li key={line.id}>{line.label}</li>
            ))}
          </ul>
        </div>

        <div className="devisView__pricing">
          <div><span>Type de campagne</span><strong>{QUOTE_CAMPAIGN_TYPE_LABELS[campaignType]}</strong></div>
          {quoteLines.map((line) => (
            <div key={`price-${line.id}`} className={line.included ? '' : 'is-total'}>
              <span>{line.label}</span>
              <strong>{line.included ? 'Inclus' : line.amount_kind === 'percentage' ? `${line.amount} %` : formatCurrency(line.amount)}</strong>
            </div>
          ))}
          <div><span>Engagement</span><strong>{ENGAGEMENT_LABELS[form.engagement]}</strong></div>
        </div>

        <div className="devisView__timeline">
          <div>
            <MdSchedule />
            <span>{TIMELINE_LABELS[form.timeline]}</span>
          </div>
          <div>
            <MdAutoGraph />
            <span>{BUDGET_LABELS[form.budgetBand]}</span>
          </div>
        </div>

        <div className="devisView__sidebar-actions">
          <Button style="gradient" onClick={onGenerateQuote} disabled={isGeneratingQuote}>
            <span>{isGeneratingQuote ? 'Génération...' : 'Éditer le devis'}</span>
          </Button>
        </div>

      </article>
    </aside>
  );
}
