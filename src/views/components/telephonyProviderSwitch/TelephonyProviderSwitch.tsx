import type { ReactElement } from 'react';
import { IoCallOutline, IoCheckmarkCircleOutline, IoWarningOutline } from 'react-icons/io5';

import type { TelephonyProviderConfigurationViewModel } from '../../../hooks/index.ts';

interface TelephonyProviderSwitchProps {
  viewModel: TelephonyProviderConfigurationViewModel;
}

export function TelephonyProviderSwitch({ viewModel }: TelephonyProviderSwitchProps): ReactElement {
  const configuration = viewModel.configuration;

  return (
    <section className="telephonyManagement__telephony" aria-label="Fournisseur de téléphonie">
      <div className="telephonyManagement__telephony-heading">
        <IoCallOutline />
        <div>
          <h2>Téléphonie du centre d’appels</h2>
          <p>Choisissez le moteur utilisé par le Script vendeur, avec reprise automatique des sessions disponibles.</p>
        </div>
      </div>

      {viewModel.isLoading && <p className="telephonyManagement__telephony-loading">Chargement de la configuration…</p>}

      {!viewModel.isLoading && configuration && (
        <>
          <div className="telephonyManagement__provider-grid">
            <article className={!viewModel.isAsteriskSelected ? 'telephonyManagement__provider-card telephonyManagement__provider-card--active' : 'telephonyManagement__provider-card'}>
              <span>Cloud historique</span>
              <strong>Twilio</strong>
              <small>Voice SDK et infrastructure Twilio existante.</small>
              <em className={configuration.providers.twilio.configured ? 'telephonyManagement__provider-ready' : 'telephonyManagement__provider-warning'}>
                {configuration.providers.twilio.configured ? <IoCheckmarkCircleOutline /> : <IoWarningOutline />}
                {configuration.providers.twilio.configured ? 'Configuration prête' : 'Configuration serveur incomplète'}
              </em>
            </article>

            <label className="telephonyManagement__provider-toggle">
              <span>Twilio</span>
              <input
                type="checkbox"
                role="switch"
                aria-label="Utiliser Asterisk à la place de Twilio"
                aria-checked={viewModel.isAsteriskSelected}
                checked={viewModel.isAsteriskSelected}
                disabled={viewModel.isSwitchDisabled}
                onChange={(event) => {
                  void viewModel.selectProvider(event.target.checked ? 'asterisk' : 'twilio');
                }}
              />
              <i aria-hidden="true" />
              <span>Asterisk</span>
            </label>

            <article className={viewModel.isAsteriskSelected ? 'telephonyManagement__provider-card telephonyManagement__provider-card--active' : 'telephonyManagement__provider-card'}>
              <span>Auto-hébergé</span>
              <strong>Asterisk + boxIP / Evenmedia</strong>
              <small>WebRTC via SIP/WSS et média via TURN, puis sortie par le trunk choisi.</small>
              <em className={configuration.providers.asterisk.configured ? 'telephonyManagement__provider-ready' : 'telephonyManagement__provider-warning'}>
                {configuration.providers.asterisk.configured ? <IoCheckmarkCircleOutline /> : <IoWarningOutline />}
                {viewModel.asteriskStatusLabel}
              </em>
            </article>
          </div>

          {(!configuration.providers.asterisk.configured || configuration.providers.asterisk.simulationMode) && (
            <div className="telephonyManagement__telephony-notice telephonyManagement__telephony-notice--warning">
              <IoWarningOutline />
              <div>
                <strong>{viewModel.asteriskNoticeTitle}</strong>
                <p>{viewModel.asteriskNoticeMessage}</p>
              </div>
            </div>
          )}

          <div className="telephonyManagement__telephony-notice">
            <IoCallOutline />
            <p>Le changement ne coupe aucun appel en cours. Il est repris automatiquement sous 15 secondes par les agents disponibles ; un agent en appel bascule après son raccrochage. Le trunk boxIP ou Evenmedia reste configuré séparément sur le serveur Asterisk.</p>
          </div>
        </>
      )}

      {viewModel.error && (
        <div className="telephonyManagement__telephony-feedback telephonyManagement__telephony-feedback--error">
          <span>{viewModel.error}</span>
          <button type="button" onClick={() => { void viewModel.reload(); }}>Réessayer</button>
        </div>
      )}
      {viewModel.successMessage && <p className="telephonyManagement__telephony-feedback telephonyManagement__telephony-feedback--success">{viewModel.successMessage}</p>}
      {viewModel.isUpdating && <p className="telephonyManagement__telephony-updating">Application du changement…</p>}
    </section>
  );
}
