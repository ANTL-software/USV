import type { ReactElement } from 'react';
import { MdOutlineChecklist } from 'react-icons/md';

import type { FacturationState } from '../../../hooks/index.ts';
import {
  BILLING_FIELD_SOURCE_LABELS,
  formatBillingDate,
  formatBillingPercent,
  getCampaignVariantLabel,
} from '../../../utils/scripts/index.ts';

interface FacturationConfigurationProps {
  state: FacturationState;
}

export function FacturationConfiguration({ state }: FacturationConfigurationProps): ReactElement {
  return (
    <article className="facturationView__panel">
      <div className="facturationView__panel-header"><MdOutlineChecklist /><div><h2>Configuration campagne</h2><p>Champs déjà disponibles côté back pour alimenter les documents de facturation.</p></div></div>
      {state.selectedCampagne && (
        <>
          <div className="facturationView__campaign-meta">
            <div><span>Nom campagne</span><strong>{state.selectedCampagne.nom_campagne}</strong></div>
            <div><span>Type</span><strong>{getCampaignVariantLabel(state.selectedCampagne.type_campagne)}</strong></div>
            <div><span>Début</span><strong>{formatBillingDate(state.selectedCampagne.date_debut)}</strong></div>
            <div><span>Fin</span><strong>{formatBillingDate(state.selectedCampagne.date_fin)}</strong></div>
          </div>
          <div className="facturationView__document-grid">
            {state.resolvedBillingProfile?.fields.map((field) => (
              <div key={field.label} className={`facturationView__document-item ${field.value !== 'Non renseigné' ? 'is-complete' : 'is-missing'}`}>
                <span>{field.label}{field.required ? ' *' : ''}</span><strong>{field.value}</strong><small>{BILLING_FIELD_SOURCE_LABELS[field.source]}</small>
              </div>
            ))}
            <div className="facturationView__document-item is-complete"><span>Commission antl</span><strong>{formatBillingPercent(state.selectedCampagne.taux_commission_facturation)}</strong></div>
          </div>
          {state.missingRequiredFields.length > 0 && <div className="facturationView__warning"><strong>Configuration incomplète :</strong> {state.missingRequiredFields.join(', ')}.</div>}
          {state.resolvedBillingProfile?.source === 'invoice_recipient' && <div className="facturationView__warning facturationView__warning--spaced-top"><strong>Adresse de facturation prioritaire :</strong> la facture utilisera d’abord le bloc de facturation tierce de la campagne, avec fallback automatique sur la fiche campagne pour les champs non renseignés.</div>}
        </>
      )}
    </article>
  );
}
