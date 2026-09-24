import type { MouseEvent, ReactElement } from 'react';
import { MdClose } from 'react-icons/md';
import { IoDocumentText, IoMailOutline, IoSend } from 'react-icons/io5';
import type { StylesConfig } from 'react-select';
import CreatableSelect from 'react-select/creatable';

import type { useCommandeDetails } from '../../../hooks/index.ts';
import { reactSelectStyles } from '../../../utils/styles/index.ts';
import { Button } from '../index.ts';

interface EmailOption {
  value: string;
  label: string;
}

const emailSelectStyles: StylesConfig<EmailOption, false> = {
  ...(reactSelectStyles as StylesConfig<EmailOption, false>),
  menuPortal: (base) => ({ ...base, zIndex: 1600 }),
};

interface CommandeProspectEmailModalProps {
  viewModel: ReturnType<typeof useCommandeDetails>;
}

export function CommandeProspectEmailModal({ viewModel }: CommandeProspectEmailModalProps): ReactElement | null {
  const { commande } = viewModel;
  if (!viewModel.isProspectEmailModalOpen || !commande) return null;

  const sender = commande.prospect_email_sender;
  const prospectEmail = commande.prospect?.email?.trim() || '';
  const recipientOptions: EmailOption[] = prospectEmail
    ? [{ value: prospectEmail, label: prospectEmail }]
    : [];
  const selectedRecipient = viewModel.prospectRecipientEmail
    ? { value: viewModel.prospectRecipientEmail, label: viewModel.prospectRecipientEmail }
    : null;
  const reference = commande.reference_doc || String(600000 + commande.id_vente).padStart(7, '0');
  const canSend = Boolean(sender?.configured && viewModel.prospectRecipientEmail.trim()
    && !viewModel.prospectRecipientDraft.length
    && viewModel.prospectEmailSubject.trim() && viewModel.prospectEmailMessage.trim()
    && !viewModel.isSendingProspectEmail);
  const stopPropagation = (event: MouseEvent): void => event.stopPropagation();

  return <div className="signedOrderEmailModal__backdrop" onClick={viewModel.closeProspectEmailModal}>
    <div className="signedOrderEmailModal__card" onClick={stopPropagation}>
      <div className="signedOrderEmailModal__header">
        <div>
          <h3><IoMailOutline /> Envoyer le bon de commande au prospect</h3>
          <p>Transmettre le bon de commande à signer au prospect de cette vente.</p>
        </div>
        <button type="button" className="signedOrderEmailModal__close-btn"
          onClick={viewModel.closeProspectEmailModal} disabled={viewModel.isSendingProspectEmail} aria-label="Fermer">
          <MdClose />
        </button>
      </div>

      <div className="signedOrderEmailModal__body">
        <div className="signedOrderEmailModal__row">
          <label className="signedOrderEmailModal__field">
            <span className="field-label">Nom de l’expéditeur :</span>
            <input className="signedOrderEmailModal__input" value={sender?.name || ''} readOnly />
          </label>
          <label className="signedOrderEmailModal__field">
            <span className="field-label">Email de l’expéditeur :</span>
            <input className="signedOrderEmailModal__input" value={sender?.address || ''} readOnly />
          </label>
        </div>

        {!sender?.configured && <p className="signedOrderEmailModal__configuration-warning">
          L’expéditeur de cette campagne n’est pas encore configuré. L’envoi est indisponible.
        </p>}

        <label className="signedOrderEmailModal__field">
          <span className="field-label">Adresse email destinataire :</span>
          <CreatableSelect<EmailOption, false>
            inputId="prospectOrderRecipientEmail"
            value={selectedRecipient}
            inputValue={viewModel.prospectRecipientDraft}
            onInputChange={(value, action) => {
              if (action.action === 'input-change') viewModel.setProspectRecipientDraft(value);
            }}
            onChange={(option) => viewModel.selectProspectRecipientEmail(option?.value ?? '')}
            onCreateOption={(value) => viewModel.selectProspectRecipientEmail(value)}
            options={recipientOptions}
            placeholder="Sélectionner ou saisir une adresse email..."
            styles={emailSelectStyles}
            isClearable
            isSearchable
            createOptionPosition="first"
            formatCreateLabel={(value) => `Utiliser "${value}"`}
            noOptionsMessage={() => 'Aucune adresse proposée'}
            menuPosition="fixed"
            menuPortalTarget={document.body}
            isDisabled={viewModel.isSendingProspectEmail}
          />
        </label>
        {viewModel.prospectRecipientDraft.length > 0
          ? <p className="signedOrderEmailModal__configuration-warning">
              Nouvelle adresse en cours de saisie. Sélectionnez « Utiliser … » pour confirmer le destinataire.
            </p>
          : <p className="signedOrderEmailModal__recipient-summary">
              Destinataire de l’envoi : <strong>{viewModel.prospectRecipientEmail || 'aucune adresse sélectionnée'}</strong>
            </p>}

        <label className="signedOrderEmailModal__field">
          <span className="field-label">Objet du mail :</span>
          <input className="signedOrderEmailModal__input" value={viewModel.prospectEmailSubject}
            onChange={(event) => viewModel.setProspectEmailSubject(event.target.value)}
            disabled={viewModel.isSendingProspectEmail} />
        </label>

        <label className="signedOrderEmailModal__field">
          <span className="field-label">Message d’accompagnement :</span>
          <textarea className="signedOrderEmailModal__textarea" rows={8}
            value={viewModel.prospectEmailMessage}
            onChange={(event) => viewModel.setProspectEmailMessage(event.target.value)}
            disabled={viewModel.isSendingProspectEmail} />
          {commande.id_campagne === 7 && <small className="signedOrderEmailModal__signature-note">
            La signature ESAT Les Cigales et son liseret gris seront ajoutés automatiquement.
          </small>}
        </label>

        <div className="signedOrderEmailModal__attachments-box">
          <span className="field-label">Pièce jointe (1) :</span>
          <div className="signedOrderEmailModal__attachments-list">
            <div className="signedOrderEmailModal__attachment-item">
              <IoDocumentText className="attachment-icon" />
              <span className="attachment-name">bon_de_commande_{reference}.pdf</span>
            </div>
          </div>
        </div>
      </div>

      <div className="signedOrderEmailModal__actions">
        <Button style="grey" type="button" onClick={viewModel.closeProspectEmailModal}
          disabled={viewModel.isSendingProspectEmail}>Annuler</Button>
        <Button style={canSend ? 'gradient' : 'grey'} type="button"
          onClick={() => { void viewModel.sendOrderToProspectEmail(); }} disabled={!canSend}>
          <IoSend /><span>{viewModel.isSendingProspectEmail ? 'Envoi en cours…' : 'Envoyer par mail'}</span>
        </Button>
      </div>
    </div>
  </div>;
}
