import type { ReactElement } from 'react';
import { MdOutlineInsights } from 'react-icons/md';

import type { FacturationState } from '../../../hooks/index.ts';
import { formatBillingDate } from '../../../utils/scripts/index.ts';
import { Button } from '../index.ts';

interface FacturationPreparationProps {
  state: FacturationState;
}

export function FacturationPreparation({ state }: FacturationPreparationProps): ReactElement {
  return (
    <article className="facturationView__panel">
      <div className="facturationView__panel-header"><MdOutlineInsights /><div><h2>Préparation de facture</h2><p>Zone prête pour brancher les règles de calcul, la numérotation et l’export.</p></div></div>
      <div className="facturationView__todo">
        <div><span>Campagne ciblée</span><strong>{state.selectedCampagne?.nom_campagne ?? '—'}</strong></div>
        <div><span>Période retenue</span><strong>{formatBillingDate(state.resolvedPeriod.start)} → {formatBillingDate(state.resolvedPeriod.end)}</strong></div>
        <div><span>Facturé à</span><strong>{state.resolvedBillingProfile?.fields.find((field) => field.label === 'Société facturée')?.value ?? '—'}</strong></div>
        <div><span>Source identité</span><strong>{state.resolvedBillingProfile?.sourceLabel ?? '—'}</strong></div>
      </div>
      <div className="facturationView__placeholder">
        <p>La génération PDF s’appuie sur la campagne active, le type de campagne et la période affichée ci-dessus. Le backend choisit automatiquement le bon modèle de facture.</p>
        <div className="facturationView__placeholder-actions">
          <Button style={state.canGenerateInvoice ? 'gradient' : 'grey'} onClick={() => { void state.generateInvoice(); }} disabled={!state.canGenerateInvoice || state.isGeneratingInvoice}>{state.isGeneratingInvoice ? 'Génération...' : 'Télécharger la facture PDF'}</Button>
          <Button style={state.canGenerateInvoice ? 'seaGreen' : 'grey'} onClick={state.openEmailModal} disabled={!state.canGenerateInvoice}>Envoyer la facture par email</Button>
        </div>
      </div>
    </article>
  );
}
