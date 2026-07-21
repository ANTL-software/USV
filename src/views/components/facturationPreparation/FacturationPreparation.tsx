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
        <div><span>Statut VosFactures</span><strong>{state.isLoadingPaInvoice ? 'Chargement...' : state.paInvoice ? (state.paInvoice.invoice_number || state.paInvoice.internal_reference) : 'Non émise'}</strong></div>
        <div><span>Document test VosFactures</span><strong>{state.testPaInvoice ? (state.testPaInvoice.invoice_number || state.testPaInvoice.internal_reference) : 'Aucun test effectué'}</strong></div>
        <div><span>N° réel prévu</span><strong>{state.testPaInvoice?.expected_invoice_number || 'Calculé lors du test ou de l’émission'}</strong></div>
      </div>
      <div className="facturationView__placeholder">
        <p>Le PDF s’appuie sur la campagne active, le type de campagne et la période affichée. Le document test VosFactures utilise obligatoirement une numérotation isolée avec le suffixe <code>_TEST</code>; l’émission réelle applique la nomenclature campagne.</p>
        <div className="facturationView__placeholder-actions">
          <Button style={state.canTestInvoiceThroughPa ? 'seaGreen' : 'grey'} onClick={() => { void state.testInvoiceThroughPa(); }} disabled={!state.canTestInvoiceThroughPa}>{state.isTestingPaInvoice ? 'Test...' : 'Créer un document test'}</Button>
          <Button style={state.canIssueInvoiceThroughPa ? 'gradient' : 'grey'} onClick={() => { void state.issueInvoiceThroughPa(); }} disabled={!state.canIssueInvoiceThroughPa}>{state.isIssuingPaInvoice ? 'Émission...' : state.paInvoice ? 'Facture réelle émise' : 'Émettre la facture réelle'}</Button>
          <Button style={state.canGenerateInvoice ? 'gradient' : 'grey'} onClick={() => { void state.generateInvoice(); }} disabled={!state.canGenerateInvoice || state.isGeneratingInvoice}>{state.isGeneratingInvoice ? 'Génération...' : 'Télécharger la facture PDF'}</Button>
          <Button style={state.canGenerateInvoice ? 'seaGreen' : 'grey'} onClick={state.openEmailModal} disabled={!state.canGenerateInvoice}>Envoyer la facture par email</Button>
        </div>
      </div>
    </article>
  );
}
