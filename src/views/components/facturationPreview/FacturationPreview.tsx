import type { ReactElement } from 'react';
import { MdOutlineInsights } from 'react-icons/md';

import type { FacturationState } from '../../../hooks/index.ts';
import {
  formatBillingCurrency,
  formatBillingDate,
  formatBillingDateTime,
  leadBillingProspectLabel,
  venteBillingDateLabel,
  venteBillingProspectLabel,
} from '../../../utils/scripts/index.ts';
import { STATUT_RENDEZ_VOUS_LABELS, STATUT_VENTE_LABELS } from '../../../utils/types/index.ts';
import { Loader } from '../index.ts';

interface FacturationPreviewProps {
  state: FacturationState;
}

export function FacturationPreview({ state }: FacturationPreviewProps): ReactElement {
  const { preview } = state;
  let content: ReactElement;
  if (state.previewLoading) content = <Loader />;
  else if (!preview) content = <div className="facturationView__empty facturationView__empty--inline">Aucun aperçu disponible pour cette période.</div>;
  else if (preview.source === 'ventes') {
    content = (
      <>
        <div className="facturationView__warning facturationView__warning--spaced-bottom"><strong>Règle de facturation ventes :</strong> seules les commandes au statut validée avec une date de validation comprise dans la période sont retenues.</div>
        <div className="facturationView__kpis">
          <div className="facturationView__kpi"><span>Total commandes validées</span><strong>{preview.stats.total.count}</strong></div>
          <div className="facturationView__kpi"><span>CA validé</span><strong>{formatBillingCurrency(state.previewTotals.totalHt)} HT</strong></div>
          <div className="facturationView__kpi"><span>CA validé TTC</span><strong>{formatBillingCurrency(state.previewTotals.totalTtc)}</strong></div>
          <div className="facturationView__kpi"><span>Période de validation</span><strong>{formatBillingDate(state.resolvedPeriod.start)} → {formatBillingDate(state.resolvedPeriod.end)}</strong></div>
          <div className="facturationView__kpi"><span>TVA appliquée</span><strong>{(state.billingSettings.vatRate * 100).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} %</strong></div>
        </div>
        <div className="facturationView__table-wrapper">
          <table><thead><tr><th>Référence</th><th>Client</th><th>Date validation</th><th>Date création</th><th>Montant</th><th>Statut</th></tr></thead>
            <tbody>{preview.rows.length === 0 ? <tr><td colSpan={6} className="facturationView__table-empty">Aucune commande validée sur la période.</td></tr> : preview.rows.map((vente) => {
              const amounts = state.getVenteAmounts(vente);
              return <tr key={vente.id_vente}><td>{vente.reference_doc ?? `#${vente.id_vente}`}</td><td>{venteBillingProspectLabel(vente)}</td><td>{venteBillingDateLabel(vente)}</td><td>{formatBillingDateTime(vente.date_vente)}</td><td>{formatBillingCurrency(amounts.totalHt)} HT<br />{formatBillingCurrency(amounts.totalTtc)} TTC</td><td>{STATUT_VENTE_LABELS[vente.statut_vente]}</td></tr>;
            })}</tbody>
          </table>
        </div>
      </>
    );
  } else {
    content = (
      <>
        <div className="facturationView__kpis">
          <div className="facturationView__kpi"><span>Total leads</span><strong>{preview.stats.total}</strong></div>
          <div className="facturationView__kpi"><span>Planifiés</span><strong>{preview.stats.planifies}</strong></div>
          <div className="facturationView__kpi"><span>Effectués</span><strong>{preview.stats.effectues}</strong></div>
          <div className="facturationView__kpi"><span>Annulés</span><strong>{preview.stats.annules}</strong></div>
        </div>
        <div className="facturationView__table-wrapper">
          <table><thead><tr><th>Lead</th><th>Client</th><th>Créneau</th><th>Statut</th><th>Interlocuteur</th></tr></thead>
            <tbody>{preview.rows.length === 0 ? <tr><td colSpan={5} className="facturationView__table-empty">Aucun rendez-vous client sur la période.</td></tr> : preview.rows.map((lead) => <tr key={lead.id_lead}><td>Lead #{lead.id_lead}</td><td>{leadBillingProspectLabel(lead)}</td><td>{formatBillingDateTime(lead.date_rdv, lead.heure_rdv)}</td><td>{STATUT_RENDEZ_VOUS_LABELS[lead.statut]}</td><td>{lead.interlocuteur_nom ?? lead.prospect?.nom_contact ?? '—'}</td></tr>)}</tbody>
          </table>
        </div>
      </>
    );
  }

  return (
    <section className="facturationView__panel">
      <div className="facturationView__panel-header"><MdOutlineInsights /><div><h2>Aperçu de période</h2><p>Lecture directe des éléments facturables sur la période sélectionnée.</p></div></div>
      {state.previewError && <div className="facturationView__error facturationView__error--inline">{state.previewError}</div>}
      {content}
    </section>
  );
}
