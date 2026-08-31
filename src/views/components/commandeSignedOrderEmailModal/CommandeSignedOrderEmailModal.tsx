import type { MouseEvent, ReactElement } from 'react';
import { MdClose } from 'react-icons/md';
import { IoDocumentText, IoMailOutline, IoSend } from 'react-icons/io5';
import Select, { type SingleValue, type StylesConfig } from 'react-select';
import CreatableSelect from 'react-select/creatable';

import type { useCommandeDetails } from '../../../hooks/index.ts';
import { formatFileSize } from '../../../utils/scripts/index.ts';
import { reactSelectStyles } from '../../../utils/styles/index.ts';
import { Button } from '../index.ts';

interface EmailSelectOption {
  value: string;
  label: string;
}

const baseEmailSelectStyles = reactSelectStyles as StylesConfig<EmailSelectOption, false>;
const emailSelectStyles: StylesConfig<EmailSelectOption, false> = {
  ...baseEmailSelectStyles,
  control: (provided, state) => ({
    ...(baseEmailSelectStyles.control?.(provided, state) ?? provided),
    minHeight: '44px',
    height: '44px',
  }),
  valueContainer: (provided, state) => ({
    ...(baseEmailSelectStyles.valueContainer?.(provided, state) ?? provided),
    minHeight: '40px',
    height: '40px',
    padding: '0 12px',
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'nowrap',
    overflow: 'hidden',
  }),
  input: (provided) => ({
    ...(baseEmailSelectStyles.input?.(provided) ?? provided),
    margin: 0,
    padding: 0,
  }),
  placeholder: (provided, state) => ({
    ...(baseEmailSelectStyles.placeholder?.(provided, state) ?? provided),
    margin: '0',
  }),
  singleValue: (provided) => ({
    ...(baseEmailSelectStyles.singleValue?.(provided) ?? provided),
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
    margin: '0',
  }),
  indicatorsContainer: (provided, state) => ({
    ...(baseEmailSelectStyles.indicatorsContainer?.(provided, state) ?? provided),
    height: '40px',
  }),
  menuPortal: (provided) => ({
    ...(baseEmailSelectStyles.menuPortal?.(provided) ?? provided),
    zIndex: 9999,
  }),
  menu: (provided, state) => ({
    ...(baseEmailSelectStyles.menu?.(provided, state) ?? provided),
    zIndex: 1600,
  }),
};

interface CommandeSignedOrderEmailModalProps {
  viewModel: ReturnType<typeof useCommandeDetails>;
}

export function CommandeSignedOrderEmailModal({
  viewModel,
}: CommandeSignedOrderEmailModalProps): ReactElement | null {
  const {
    commande,
    documents,
    isEmailModalOpen,
    closeEmailModal,
    senderName,
    setSenderName,
    senderNameOptions,
    senderEmail,
    setSenderEmail,
    senderEmailOptions,
    emailSubject,
    setEmailSubject,
    selectedRecipientEmail,
    setSelectedRecipientEmail,
    emailMessage,
    setEmailMessage,
    isSendingEmail,
    emailOptions,
    sendSignedOrderEmail,
  } = viewModel;

  if (!isEmailModalOpen || !commande) return null;

  const campagneNom = commande.campagne?.nom_campagne || 'la campagne';
  const selectedRecipientOption: EmailSelectOption | null = emailOptions.find(
    ({ value }) => value === selectedRecipientEmail,
  ) ?? (selectedRecipientEmail ? { value: selectedRecipientEmail, label: selectedRecipientEmail } : null);

  const selectedSenderNameOption: EmailSelectOption | null = senderNameOptions.find(
    ({ value }) => value === senderName,
  ) ?? (senderName ? { value: senderName, label: senderName } : null);

  const selectedSenderOption: EmailSelectOption | null = senderEmailOptions.find(
    ({ value }) => value.toLowerCase() === senderEmail.toLowerCase(),
  ) ?? (senderEmailOptions[0] ?? null);

  const canSend = Boolean(
    selectedRecipientEmail.trim() &&
    emailMessage.trim() &&
    documents.length > 0 &&
    !isSendingEmail,
  );

  const stopPropagation = (event: MouseEvent): void => event.stopPropagation();

  return (
    <div className="signedOrderEmailModal__backdrop" onClick={closeEmailModal}>
      <div className="signedOrderEmailModal__card" onClick={stopPropagation}>
        <div className="signedOrderEmailModal__header">
          <div>
            <h3><IoMailOutline /> Envoyer par mail à {campagneNom}</h3>
            <p>Transmettre le bon de commande signé et personnalisé au client / partenaire.</p>
          </div>
          <button
            type="button"
            className="signedOrderEmailModal__close-btn"
            onClick={closeEmailModal}
            disabled={isSendingEmail}
            aria-label="Fermer"
          >
            <MdClose />
          </button>
        </div>

        <div className="signedOrderEmailModal__body">
          <div className="signedOrderEmailModal__row">
            <label className="signedOrderEmailModal__field">
              <span className="field-label">Nom de l'expéditeur :</span>
              <CreatableSelect<EmailSelectOption, false>
                inputId="signedOrderSenderName"
                value={selectedSenderNameOption}
                onChange={(option: SingleValue<EmailSelectOption>) => {
                  setSenderName(option?.value ?? '');
                }}
                onCreateOption={(inputValue) => {
                  setSenderName(inputValue.trim());
                }}
                options={senderNameOptions}
                placeholder="Sélectionner ou saisir un nom..."
                styles={emailSelectStyles}
                isClearable
                isSearchable
                createOptionPosition="first"
                formatCreateLabel={(inputValue) => `Utiliser "${inputValue}"`}
                noOptionsMessage={() => 'Aucun nom proposé'}
                menuPosition="fixed"
                menuPortalTarget={document.body}
                className="react-select-container"
                classNamePrefix="react-select"
                isDisabled={isSendingEmail}
              />
            </label>

            <label className="signedOrderEmailModal__field">
              <span className="field-label">Email de l'expéditeur :</span>
              <Select<EmailSelectOption, false>
                inputId="signedOrderSenderEmail"
                value={selectedSenderOption}
                onChange={(option: SingleValue<EmailSelectOption>) => {
                  setSenderEmail(option?.value ?? '');
                }}
                options={senderEmailOptions}
                placeholder="Sélectionner une adresse email..."
                styles={emailSelectStyles}
                isSearchable={false}
                noOptionsMessage={() => 'Aucune adresse configurée'}
                menuPosition="fixed"
                menuPortalTarget={document.body}
                className="react-select-container"
                classNamePrefix="react-select"
                isDisabled={isSendingEmail}
              />
            </label>
          </div>

          <label className="signedOrderEmailModal__field">
            <span className="field-label">Objet du mail :</span>
            <input
              type="text"
              className="signedOrderEmailModal__input"
              value={emailSubject}
              onChange={(event) => setEmailSubject(event.target.value)}
              placeholder="ex: Bon de commande signé"
              disabled={isSendingEmail}
            />
          </label>

          <label className="signedOrderEmailModal__field">
            <span className="field-label">Adresse email destinataire :</span>
            <CreatableSelect<EmailSelectOption, false>
              inputId="signedOrderRecipientEmail"
              value={selectedRecipientOption}
              onChange={(option: SingleValue<EmailSelectOption>) => {
                setSelectedRecipientEmail(option?.value ?? '');
              }}
              onCreateOption={(inputValue) => {
                setSelectedRecipientEmail(inputValue.trim());
              }}
              options={emailOptions}
              placeholder="Sélectionner ou saisir une adresse email..."
              styles={emailSelectStyles}
              isClearable
              isSearchable
              createOptionPosition="first"
              formatCreateLabel={(inputValue) => `Utiliser "${inputValue}"`}
              noOptionsMessage={() => 'Aucune adresse proposée'}
              menuPosition="fixed"
              menuPortalTarget={document.body}
              className="react-select-container"
              classNamePrefix="react-select"
              isDisabled={isSendingEmail}
            />
          </label>

          <label className="signedOrderEmailModal__field">
            <span className="field-label">Message d'accompagnement :</span>
            <textarea
              className="signedOrderEmailModal__textarea"
              rows={8}
              value={emailMessage}
              onChange={(event) => setEmailMessage(event.target.value)}
              placeholder="Rédigez le message qui accompagnera le bon de commande..."
              disabled={isSendingEmail}
            />
            <small style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
              ℹ️ La signature HTML officielle de Sonia HADID (ANTL) sera automatiquement intégrée au bas de l'email.
            </small>
          </label>

          <div className="signedOrderEmailModal__attachments-box">
            <span className="field-label">Pièce(s) jointe(s) ({documents.length}) :</span>
            <div className="signedOrderEmailModal__attachments-list">
              {documents.map((doc) => (
                <div key={doc.id_document_commercial} className="signedOrderEmailModal__attachment-item">
                  <IoDocumentText className="attachment-icon" />
                  <span className="attachment-name" title={doc.nom_fichier}>{doc.nom_fichier}</span>
                  <span className="attachment-size">({formatFileSize(doc.taille_octets)})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="signedOrderEmailModal__actions">
          <Button
            style="grey"
            type="button"
            onClick={closeEmailModal}
            disabled={isSendingEmail}
          >
            Annuler
          </Button>
          <Button
            style={canSend ? 'gradient' : 'grey'}
            type="button"
            onClick={() => { void sendSignedOrderEmail(); }}
            disabled={!canSend}
          >
            <IoSend />
            <span>{isSendingEmail ? 'Envoi en cours…' : 'Envoyer par mail'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
