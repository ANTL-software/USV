import type { ReactElement } from 'react';
import { MdAutoGraph, MdDescription, MdSchedule } from 'react-icons/md';
import {
  BUDGET_LABELS,
  ENGAGEMENT_LABELS,
  TIMELINE_LABELS,
  formatCurrency,
} from '../../../utils/scripts/index.ts';
import type { QuoteFormState, QuoteLine } from '../../../utils/types/index.ts';
import { Button } from '../button/index.ts';

interface DevisPreviewProps {
  form: QuoteFormState;
  monthlySubtotal: number;
  oneShotSubtotal: number;
  projectedTotal: number;
  selectedIncludedLines: QuoteLine[];
  selectedOptionLines: QuoteLine[];
  selectedTemplatePromise: string;
  selectedTemplateTitle: string;
}

export function DevisPreview({
  form,
  monthlySubtotal,
  oneShotSubtotal,
  projectedTotal,
  selectedIncludedLines,
  selectedOptionLines,
  selectedTemplatePromise,
  selectedTemplateTitle,
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
            {[...selectedIncludedLines, ...selectedOptionLines].map((line) => (
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
            <strong>{ENGAGEMENT_LABELS[form.engagement]}</strong>
          </div>
          <div className="is-total">
            <span>Projection totale</span>
            <strong>{formatCurrency(projectedTotal)}</strong>
          </div>
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
          <Button style="gradient">
            <span>Enregistrer le brouillon</span>
          </Button>
          <Button style="white">
            <span>Préparer le futur document</span>
          </Button>
        </div>

      </article>
    </aside>
  );
}
