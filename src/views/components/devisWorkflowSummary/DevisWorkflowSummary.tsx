import type { ReactElement } from 'react';

const WORKFLOW_STEPS = [
  { label: 'Étape 1', title: 'Renseigner le contexte client', tone: 'primary' },
  { label: 'Étape 2', title: 'Composer les prestations', tone: 'success' },
  { label: 'Étape 3', title: 'Définir les conditions', tone: 'warning' },
  { label: 'Étape 4', title: 'Valider le récap avant PDF', tone: 'muted' },
] as const;

export function DevisWorkflowSummary(): ReactElement {
  return (
    <section className="devisView__summary" aria-label="Étapes de préparation du devis">
      {WORKFLOW_STEPS.map((step) => (
        <article
          key={step.label}
          className={`devisView__summary-card devisView__summary-card--${step.tone}`}
        >
          <span>{step.label}</span>
          <strong>{step.title}</strong>
        </article>
      ))}
    </section>
  );
}
