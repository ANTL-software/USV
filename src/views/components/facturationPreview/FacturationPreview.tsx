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
import { STATUT_VENTE_LABELS } from '../../../utils/types/index.ts';
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
          <div className="facturationView__kpi"><span>Total commandes validées</span><strong>{preview.rows.length}</strong></div>
          <div className="facturationView__kpi"><span>Assiette des ventes</span><strong>{formatBillingCurrency(state.previewTotals.assietteHt)} HT</strong></div>
          <div className="facturationView__kpi"><span>Taux de commission</span><strong>{state.selectedCampagne?.taux_commission_facturation && state.selectedCampagne.taux_commission_facturation > 0 ? state.selectedCampagne.taux_commission_facturation : 100} %</strong></div>
          <div className="facturationView__kpi"><span>Montant facturé</span><strong>{formatBillingCurrency(state.previewTotals.totalHt)} HT<br />{formatBillingCurrency(state.previewTotals.totalTtc)} TTC</strong></div>
          <div className="facturationView__kpi"><span>Période de validation</span><strong>{formatBillingDate(state.resolvedPeriod.start)} → {formatBillingDate(state.resolvedPeriod.end)}</strong></div>
          <div className="facturationView__kpi"><span>TVA appliquée</span><strong>{(state.billingSettings.vatRate * 100).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} %</strong></div>
        </div>
        <div className="facturationView__table-wrapper">
          <table><thead><tr><th>Référence</th><th>Client</th><th>Date validation</th><th>Date création</th><th>Montant</th><th>Statut</th></tr></thead>
            <tbody>{preview.rows.length === 0 ? <tr><td colSpan={6} className="facturationView__table-empty">Aucune commande validée sur la période.</td></tr> : preview.rows.map((vente) => {
              const amounts = state.getVenteAmounts(vente);
              return <tr key={vente.id_vente}><td>{vente.reference_doc ?? `#${vente.id_vente}`}</td><td>{venteBillingProspectLabel(vente)}</td><td>{venteBillingDateLabel(vente)}</td><td>{formatBillingDateTime(vente.date_vente)}</td><td>Assiette : {formatBillingCurrency(amounts.assietteHt)} HT<br />Facturé : {formatBillingCurrency(amounts.totalHt)} HT<br />{formatBillingCurrency(amounts.totalTtc)} TTC</td><td>{STATUT_VENTE_LABELS[vente.statut_vente]}</td></tr>;
            })}</tbody>
          </table>
        </div>
      </>
    );
  } else {
    const smallCompanyCount = preview.rows.filter((lead) => !lead.entreprise_plus_de_cinq_salaries).length;
    const largeCompanyCount = preview.rows.length - smallCompanyCount;
    content = (
      <>
        <div className="facturationView__warning facturationView__warning--spaced-bottom"><strong>Règle de facturation MMA :</strong> seuls les rendez-vous au statut effectué, dont la date de passage au statut effectué est comprise dans la période, sont retenus.</div>
        <div className="facturationView__kpis">
          <div className="facturationView__kpi"><span>Rendez-vous facturables</span><strong>{preview.rows.length}</strong></div>
          <div className="facturationView__kpi"><span>Entreprises de 5 salariés ou moins</span><strong>{smallCompanyCount} × 75 € HT</strong></div>
          <div className="facturationView__kpi"><span>Entreprises de plus de 5 salariés</span><strong>{largeCompanyCount} × 150 € HT</strong></div>
          <div className="facturationView__kpi"><span>CA facturable</span><strong>{formatBillingCurrency(state.previewTotals.totalHt)} HT<br />{formatBillingCurrency(state.previewTotals.totalTtc)} TTC</strong></div>
        </div>
        <div className="facturationView__table-wrapper">
          <table><thead><tr><th>Lead</th><th>Client</th><th>Date effectuée</th><th>Catégorie</th><th>Montant</th></tr></thead>
            <tbody>{preview.rows.length === 0 ? <tr><td colSpan={5} className="facturationView__table-empty">Aucun rendez-vous effectué sur la période.</td></tr> : preview.rows.map((lead) => {
              const amounts = state.getLeadAmounts(lead);
              return <tr key={lead.id_lead}><td>Lead #{lead.id_lead}</td><td>{leadBillingProspectLabel(lead)}</td><td>{formatBillingDateTime(lead.date_effectue)}</td><td>{lead.entreprise_plus_de_cinq_salaries ? 'Plus de 5 salariés' : '5 salariés ou moins'}</td><td>{formatBillingCurrency(amounts.totalHt)} HT<br />{formatBillingCurrency(amounts.totalTtc)} TTC</td></tr>;
            })}</tbody>
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
