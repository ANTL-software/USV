import type { MouseEvent, ReactElement } from 'react';
import { MdClose } from 'react-icons/md';
import CreatableSelect from 'react-select/creatable';
import type { SingleValue, StylesConfig } from 'react-select';

import type { FacturationState } from '../../../hooks/index.ts';
import { formatBillingCurrency, formatBillingDate } from '../../../utils/scripts/index.ts';
import { reactSelectStyles } from '../../../utils/styles/index.ts';
import type { InvoiceEmailOption } from '../../../utils/types/index.ts';
import { Button } from '../index.ts';

const baseInvoiceEmailSelectStyles = reactSelectStyles as StylesConfig<InvoiceEmailOption, false>;
const invoiceEmailSelectStyles: StylesConfig<InvoiceEmailOption, false> = {
  ...baseInvoiceEmailSelectStyles,
  control: (provided, state) => ({ ...(baseInvoiceEmailSelectStyles.control?.(provided, state) ?? provided), minHeight: '48px', height: '48px' }),
  valueContainer: (provided, state) => ({ ...(baseInvoiceEmailSelectStyles.valueContainer?.(provided, state) ?? provided), minHeight: '44px', height: '44px', padding: '0 12px', display: 'flex', alignItems: 'center' }),
  input: (provided, state) => ({ ...(baseInvoiceEmailSelectStyles.input?.(provided, state) ?? provided), margin: '0', padding: '0' }),
  placeholder: (provided, state) => ({ ...(baseInvoiceEmailSelectStyles.placeholder?.(provided, state) ?? provided), margin: '0' }),
  singleValue: (provided, state) => ({ ...(baseInvoiceEmailSelectStyles.singleValue?.(provided, state) ?? provided), margin: '0' }),
  indicatorsContainer: (provided, state) => ({ ...(baseInvoiceEmailSelectStyles.indicatorsContainer?.(provided, state) ?? provided), height: '44px' }),
  menuPortal: (provided, state) => ({ ...(baseInvoiceEmailSelectStyles.menuPortal?.(provided, state) ?? provided), zIndex: 1600 }),
  menu: (provided, state) => ({ ...(baseInvoiceEmailSelectStyles.menu?.(provided, state) ?? provided), zIndex: 1600 }),
};

interface FacturationEmailModalProps {
  state: FacturationState;
}

export function FacturationEmailModal({ state }: FacturationEmailModalProps): ReactElement | null {
  if (!state.isEmailModalOpen) return null;
  const selectedOption = state.emailOptions.find(({ value }) => value === state.selectedRecipientEmail)
    ?? (state.selectedRecipientEmail ? { value: state.selectedRecipientEmail, label: state.selectedRecipientEmail } : null);
  const stopPropagation = (event: MouseEvent): void => event.stopPropagation();

  return (
    <div className="facturationView__modal-backdrop" onClick={state.closeEmailModal}>
      <div className="facturationView__modal" onClick={stopPropagation}>
        <div className="facturationView__modal-header"><div><h2>Envoyer la facture</h2><p>Sélectionne un email proposé ou renseigne un destinataire personnalisé.</p></div><button type="button" onClick={state.closeEmailModal} disabled={state.isSendingInvoiceEmail}><MdClose /></button></div>
        <div className="facturationView__modal-content">
          <label className="facturationView__field"><span>Destinataire</span>
            <CreatableSelect<InvoiceEmailOption, false>
              inputId="facturationEmailRecipient"
              value={selectedOption}
              onChange={(option: SingleValue<InvoiceEmailOption>) => state.setSelectedRecipientEmail(option?.value ?? '')}
              onCreateOption={(inputValue) => state.setSelectedRecipientEmail(inputValue.trim())}
              options={state.emailOptions}
              placeholder="Sélectionner ou saisir un email"
              styles={invoiceEmailSelectStyles}
              isClearable isSearchable createOptionPosition="first"
              formatCreateLabel={(inputValue) => `Utiliser "${inputValue}"`}
              noOptionsMessage={() => 'Aucune adresse proposée'}
              menuPosition="fixed" menuPortalTarget={document.body}
              className="react-select-container" classNamePrefix="react-select"
            />
          </label>
          <div className="facturationView__todo">
            <div><span>Expéditeur</span><strong>contact@antl.fr</strong></div>
            <div><span>Objet</span><strong>{`antl – Facture ${formatBillingDate(state.resolvedPeriod.start)} → ${formatBillingDate(state.resolvedPeriod.end)}`}</strong></div>
            <div><span>Total CA HT</span><strong>{formatBillingCurrency(state.previewTotals.totalHt)}</strong></div>
          </div>
        </div>
        <div className="facturationView__modal-actions">
          <Button style="grey" type="button" onClick={state.closeEmailModal} disabled={state.isSendingInvoiceEmail}>Annuler</Button>
          <Button style={state.canSendInvoiceEmail ? 'gradient' : 'grey'} type="button" onClick={() => { void state.sendInvoiceEmail(); }} disabled={!state.canSendInvoiceEmail}>{state.isSendingInvoiceEmail ? 'Envoi...' : 'Envoyer la facture'}</Button>
        </div>
      </div>
    </div>
  );
}
