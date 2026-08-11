import type { ReactElement } from 'react';
import {
  IoAddOutline,
  IoCheckmarkCircleOutline,
  IoCloudDoneOutline,
  IoKeyOutline,
  IoRefreshOutline,
  IoSaveOutline,
  IoServerOutline,
  IoTrashOutline,
  IoWarningOutline,
} from 'react-icons/io5';

import type { TelephonyTrunkConfigurationViewModel } from '../../../hooks/index.ts';
import type { TelephonyTrunkApplyStatus } from '../../../utils/types/index.ts';

interface TelephonyTrunkConfigurationProps {
  viewModel: TelephonyTrunkConfigurationViewModel;
}

const APPLY_STATUS_LABELS: Record<TelephonyTrunkApplyStatus, string> = {
  not_configured: 'Non configuré',
  pending: 'Modifications en attente',
  applying: 'Application en cours',
  applied: 'Appliqué',
  failed: 'Échec de l’application',
};

const formatDateTime = (value: string | null): string => value
  ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))
  : 'Jamais';

export function TelephonyTrunkConfiguration({ viewModel }: TelephonyTrunkConfigurationProps): ReactElement {
  const { configuration, form } = viewModel;
  const canAddAccount = form.authMode === 'registration'
    && (form.distributionMode === 'credential_pool' || form.accounts.length === 0);

  return (
    <section className="telephonyManagement__trunk" aria-label="Configuration du trunk Asterisk">
      <div className="telephonyManagement__telephony-heading">
        <IoServerOutline />
        <div>
          <h2>Trunk opérateur et canaux partagés</h2>
          <p>Les comptes SIP appartiennent au centre d’appels. Asterisk attribue le premier canal libre, indépendamment du commercial connecté.</p>
        </div>
      </div>

      {viewModel.isLoading && <p className="telephonyManagement__telephony-loading">Chargement de la configuration trunk…</p>}

      {!viewModel.isLoading && (
        <>
          <div className="telephonyManagement__activation-steps" aria-label="Étapes d’activation">
            <strong>Activation en trois étapes</strong>
            <ol>
              <li>Recopiez les paramètres communiqués par l’opérateur puis enregistrez-les.</li>
              <li>Activez le trunk et appliquez-le : Asterisk contrôle réellement son enregistrement.</li>
              <li>Lorsque l’état passe à « Appliqué », utilisez le switch Asterisk ci-dessus.</li>
            </ol>
            <p>Twilio reste actif jusqu’à la troisième étape. En cas d’échec, la configuration Asterisk précédente est restaurée automatiquement.</p>
          </div>

          <div className="telephonyManagement__trunk-statuses">
            <span className={`telephonyManagement__trunk-status telephonyManagement__trunk-status--${configuration?.applyStatus || 'not_configured'}`}>
              {configuration?.applyStatus === 'applied' ? <IoCheckmarkCircleOutline /> : <IoWarningOutline />}
              {APPLY_STATUS_LABELS[configuration?.applyStatus || 'not_configured']}
            </span>
            <span className={configuration?.runtime?.healthy ? 'telephonyManagement__trunk-status telephonyManagement__trunk-status--applied' : 'telephonyManagement__trunk-status'}>
              <IoCloudDoneOutline />
              {configuration?.runtime?.message || 'État Asterisk indisponible'}
            </span>
            <span className="telephonyManagement__trunk-status">
              {configuration?.runtime?.activeChannels || 0} / {viewModel.totalChannels} canal/canaux occupé(s)
            </span>
          </div>

          <div className="telephonyManagement__trunk-grid">
            <label>
              <span>Fournisseur</span>
              <select value={form.provider} onChange={(event) => viewModel.selectProvider(event.target.value as typeof form.provider)}>
                <option value="boxip">boxIP</option>
                <option value="evenmedia">Evenmedia</option>
                <option value="custom">Autre fournisseur</option>
              </select>
            </label>
            <label>
              <span>Mode de credentials</span>
              <select value={form.distributionMode} onChange={(event) => viewModel.selectDistributionMode(event.target.value as typeof form.distributionMode)}>
                <option value="single_account">Un compte, plusieurs canaux</option>
                <option value="credential_pool">Pool de comptes</option>
              </select>
            </label>
            <label>
              <span>Authentification</span>
              <select value={form.authMode} onChange={(event) => viewModel.updateField('authMode', event.target.value as typeof form.authMode)}>
                <option value="registration">Identifiant / mot de passe</option>
                <option value="ip">Adresse IP autorisée</option>
              </select>
            </label>
            {form.authMode === 'ip' && (
              <div className="telephonyManagement__trunk-ip-help">
                <strong>IP publique à faire autoriser par l’opérateur</strong>
                <code>46.225.98.62</code>
                <small>Cette autorisation est réalisée côté boxIP ou Evenmedia lors de la souscription. Aucun mot de passe SIP n’est ensuite nécessaire dans l’USV.</small>
              </div>
            )}
            <label>
              <span>Serveur SIP</span>
              <input value={form.sipServer} onChange={(event) => viewModel.updateField('sipServer', event.target.value)} placeholder="sip.operateur.fr" />
            </label>
            <label>
              <span>Port SIP</span>
              <input type="number" min={1} max={65535} value={form.sipPort} onChange={(event) => viewModel.updateField('sipPort', Number(event.target.value))} />
            </label>
            <label>
              <span>Domaine SIP</span>
              <input value={form.fromDomain} onChange={(event) => viewModel.updateField('fromDomain', event.target.value)} placeholder={form.sipServer} />
            </label>
            <label>
              <span>Numéro présenté</span>
              <input value={form.callerId} onChange={(event) => viewModel.updateField('callerId', event.target.value)} placeholder="+331…" />
              <small>Utilisez un numéro fourni ou explicitement validé par votre opérateur.</small>
            </label>
            <label>
              <span>Contact entrant</span>
              <input value={form.contactUser} onChange={(event) => viewModel.updateField('contactUser', event.target.value)} placeholder="SDA ou identifiant" />
            </label>
            {form.authMode === 'ip' && (
              <label>
                <span>Canaux simultanés</span>
                <input type="number" min={1} max={100} value={form.maxChannels} onChange={(event) => viewModel.updateField('maxChannels', Number(event.target.value))} />
              </label>
            )}
          </div>

          <div className="telephonyManagement__provider-guidance">
            {form.provider === 'boxip' && (
              <p><strong>boxIP :</strong> recopiez le serveur, le port, l’identifiant trunk, le mot de passe, le nombre de canaux et le numéro autorisé exactement comme indiqués dans votre espace client.</p>
            )}
            {form.provider === 'evenmedia' && (
              <p><strong>Evenmedia :</strong> demandez une livraison compatible Asterisk en UDP / G.711 A-law, avec le registrar SIP, le mode d’authentification, le numéro présenté et le nombre de canaux.</p>
            )}
            {form.provider === 'custom' && (
              <p><strong>Autre opérateur :</strong> cette configuration prend en charge SIP/UDP, G.711 A-law et une authentification par enregistrement ou adresse IP.</p>
            )}
          </div>

          {form.authMode === 'registration' && (
            <div className="telephonyManagement__trunk-accounts">
              <div className="telephonyManagement__trunk-subheading">
                <div>
                  <strong><IoKeyOutline /> Comptes SIP mutualisés</strong>
                  <small>{viewModel.totalChannels} communication(s) simultanée(s) au total</small>
                </div>
                {canAddAccount && (
                  <button type="button" onClick={viewModel.addAccount}><IoAddOutline /> Ajouter un compte</button>
                )}
              </div>

              {form.accounts.length === 0 && (
                <p className="telephonyManagement__trunk-empty">Aucun credential pour le moment. Vous pouvez enregistrer le socle désactivé et ajouter le compte lors de la souscription.</p>
              )}

              {form.accounts.map((account, index) => (
                <div className="telephonyManagement__trunk-account" key={account.id}>
                  <span className="telephonyManagement__trunk-account-number">{index + 1}</span>
                  <label>
                    <span>Libellé</span>
                    <input value={account.label} onChange={(event) => viewModel.updateAccount(account.id, 'label', event.target.value)} />
                  </label>
                  <label>
                    <span>Identifiant SIP</span>
                    <input autoComplete="off" value={account.username} onChange={(event) => viewModel.updateAccount(account.id, 'username', event.target.value)} />
                  </label>
                  <label>
                    <span>Mot de passe</span>
                    <input
                      type="password"
                      autoComplete="new-password"
                      value={account.password || ''}
                      placeholder={account.hasPassword ? 'Mot de passe enregistré' : 'À renseigner à la souscription'}
                      onChange={(event) => viewModel.updateAccount(account.id, 'password', event.target.value)}
                    />
                  </label>
                  <label>
                    <span>Canaux</span>
                    <input type="number" min={1} max={100} value={account.channelLimit} onChange={(event) => viewModel.updateAccount(account.id, 'channelLimit', Number(event.target.value))} />
                  </label>
                  <button type="button" className="telephonyManagement__trunk-delete" aria-label={`Supprimer ${account.label}`} onClick={() => viewModel.removeAccount(account.id)}>
                    <IoTrashOutline />
                  </button>
                </div>
              ))}
            </div>
          )}

          <label className="telephonyManagement__trunk-enable">
            <input type="checkbox" checked={form.enabled} onChange={(event) => viewModel.updateField('enabled', event.target.checked)} />
            <span>
              <strong>Activer le trunk lors de la prochaine application</strong>
              <small>Cette option ouvre le port SIP et exige des credentials valides. Elle ne bascule pas le Script, qui reste sur Twilio tant que le switch supérieur n’est pas modifié.</small>
            </span>
          </label>

          {configuration?.lastError && (
            <div className="telephonyManagement__telephony-feedback telephonyManagement__telephony-feedback--error">{configuration.lastError}</div>
          )}
          {viewModel.validationMessage && viewModel.isDirty && (
            <div className="telephonyManagement__telephony-feedback telephonyManagement__telephony-feedback--warning">
              {viewModel.validationMessage}
            </div>
          )}
          {viewModel.error && <div className="telephonyManagement__telephony-feedback telephonyManagement__telephony-feedback--error">{viewModel.error}</div>}
          {viewModel.successMessage && <div className="telephonyManagement__telephony-feedback telephonyManagement__telephony-feedback--success">{viewModel.successMessage}</div>}

          <div className="telephonyManagement__trunk-actions">
            <button type="button" className="telephonyManagement__trunk-secondary" disabled={viewModel.isLoading || viewModel.isSaving || viewModel.isApplying} onClick={() => { void viewModel.load(); }}>
              <IoRefreshOutline /> Actualiser
            </button>
            <button type="button" className="telephonyManagement__trunk-primary" disabled={!viewModel.isDirty || Boolean(viewModel.validationMessage) || viewModel.isSaving || viewModel.isApplying} onClick={() => { void viewModel.save(); }}>
              <IoSaveOutline /> {viewModel.isSaving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
            <button type="button" className="telephonyManagement__trunk-apply" disabled={viewModel.isDirty || viewModel.isSaving || viewModel.isApplying || configuration?.applyStatus === 'not_configured'} onClick={() => { void viewModel.apply(); }}>
              <IoCloudDoneOutline /> {viewModel.isApplying ? 'Application…' : 'Appliquer à Asterisk'}
            </button>
          </div>

          <div className="telephonyManagement__trunk-audit">
            <strong>Dernière application : {formatDateTime(configuration?.lastAppliedAt || null)}</strong>
            {(configuration?.events || []).slice(0, 5).map((event) => (
              <div key={event.id}>
                <time dateTime={event.createdAt}>{formatDateTime(event.createdAt)}</time>
                <span>{event.message}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
