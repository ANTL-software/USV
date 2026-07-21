import './prospectDetailModal.scss';

import type { ReactElement } from 'react';
import { IoCallOutline, IoMailOutline, IoBusiness, IoPersonOutline, IoCalendarOutline } from 'react-icons/io5';
import type { ProspectDetailViewModel } from '../../../hooks/index.ts';
import type { ProspectUpdateData } from '../../../utils/types/index.ts';
import { formatProspectStatusText, getProspectRelationBadgeClass, getProspectRelationLabel } from '../../../utils/scripts/index.ts';

interface ProspectDetailModalProps {
  viewModel: ProspectDetailViewModel;
}

export default function ProspectDetailModal({ viewModel }: Readonly<ProspectDetailModalProps>): ReactElement | null {
  const {
    isEditing,
    isSubmitting,
    editedProspect,
    startEditing,
    cancelEditing,
    changeField,
    save,
    close,
    presentation,
    prospect,
    statusOptions,
    typeOptions,
  } = viewModel;
  if (!prospect || !presentation) return null;

  const renderInput = (field: keyof ProspectUpdateData, value: string | null, type: 'text' | 'email' | 'tel' = 'text'): ReactElement => (
    <input
      type={type}
      value={editedProspect[field] ?? value ?? ''}
      onChange={e => changeField(field, e.target.value)}
      className="detailInput"
      disabled={!isEditing}
    />
  );

  const renderSelect = (
    field: keyof ProspectUpdateData,
    value: string,
    options: readonly { value: string; label: string }[]
  ): ReactElement => (
    <select
      value={editedProspect[field] ?? value}
      onChange={e => changeField(field, e.target.value)}
      className="detailSelect"
      disabled={!isEditing}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );

  return (
    <div id="prospectDetailOverlay" onClick={isEditing ? undefined : close}>
      <div id="prospectDetailModal" onClick={e => e.stopPropagation()}>
        <div className="modalHeader">
          <h2>Détail du prospect</h2>
          <button className="closeBtn" onClick={close} aria-label={isEditing ? 'Annuler' : 'Fermer'}>
            {isEditing ? '✕' : '✕'}
          </button>
        </div>

        <div className="modalBody">
          <div className="prospectDetail__section">
            <h3>Identité</h3>
            <div className="detailRow">
              <span className="detailLabel">Type</span>
              <span className="detailValue">
                {isEditing ? (
                  renderSelect('type_prospect', prospect.type_prospect, typeOptions)
                ) : (
                  <>
                    {prospect.type_prospect === 'Entreprise' ? <IoBusiness /> : <IoPersonOutline />}
                    <span className={`badge badge--${prospect.type_prospect.toLowerCase()}`}>
                      {prospect.type_prospect}
                    </span>
                  </>
                )}
              </span>
            </div>
            <div className="detailRow">
              <span className="detailLabel">Relation commerciale</span>
              <span className="detailValue">
                {prospect.relation_commerciale_campagne ? (
                  <span className={`badge ${getProspectRelationBadgeClass(prospect.relation_commerciale_campagne)}`}>{getProspectRelationLabel(prospect.relation_commerciale_campagne)}</span>
                ) : prospect.relations_commerciales?.length ? (
                  <span>{prospect.relations_commerciales.map((relation) => `${getProspectRelationLabel(relation)}${relation.campagne ? ` · ${relation.campagne.nom_campagne}` : ''}`).join(', ')}</span>
                ) : <span className="badge badge--prospect">Prospect</span>}
              </span>
            </div>
            {(isEditing || prospect.type_prospect === 'Entreprise') && (
              <div className="detailRow">
                <span className="detailLabel">Raison sociale</span>
                <span className="detailValue">
                  {isEditing ? renderInput('raison_sociale', prospect.raison_sociale) : (prospect.raison_sociale || '—')}
                </span>
              </div>
            )}
            <div className="detailRow">
              <span className="detailLabel">Civilité</span>
              <span className="detailValue">
                {isEditing ? renderInput('civilite', prospect.civilite) : (prospect.civilite || '—')}
              </span>
            </div>
            <div className="detailRow">
              <span className="detailLabel">Nom <span className="required">*</span></span>
              <span className="detailValue">
                {isEditing ? renderInput('nom', prospect.nom) : prospect.nom.toUpperCase()}
              </span>
            </div>
            <div className="detailRow">
              <span className="detailLabel">Prénom</span>
              <span className="detailValue">
                {isEditing ? renderInput('prenom', prospect.prenom) : (prospect.prenom || '—')}
              </span>
            </div>
          </div>

          <div className="prospectDetail__section">
            <h3>Contact</h3>
            <div className="detailRow">
              <span className="detailLabel">Téléphone <span className="required">*</span></span>
              <span className="detailValue">
                <IoCallOutline />
                {isEditing ? renderInput('telephone', prospect.telephone, 'tel') : (
                  <>
                    <code>{prospect.telephone}</code>
                    <span className={`badge badge--${prospect.type_telephone}`}>{prospect.type_telephone}</span>
                  </>
                )}
              </span>
            </div>
            <div className="detailRow">
              <span className="detailLabel">Email</span>
              <span className="detailValue">
                <IoMailOutline />
                {isEditing ? renderInput('email', prospect.email, 'email') : (
                  prospect.email ? <a href={`mailto:${prospect.email}`}>{prospect.email}</a> : '—'
                )}
              </span>
            </div>
            <div className="detailRow">
              <span className="detailLabel">Téléphone contact</span>
              <span className="detailValue">
                <IoCallOutline />
                {isEditing ? renderInput('telephone_contact', prospect.telephone_contact, 'tel') : (
                  prospect.telephone_contact ? <code>{prospect.telephone_contact}</code> : '—'
                )}
              </span>
            </div>
          </div>

          <div className="prospectDetail__section">
            <h3>Adresse</h3>
            <div className="detailRow">
              <span className="detailLabel">Adresse</span>
              <span className="detailValue">
                {isEditing ? renderInput('adresse', prospect.adresse) : (prospect.adresse || '—')}
              </span>
            </div>
            <div className="detailRow">
              <span className="detailLabel">Code postal</span>
              <span className="detailValue">
                {isEditing ? renderInput('code_postal', prospect.code_postal) : (prospect.code_postal || '—')}
              </span>
            </div>
            <div className="detailRow">
              <span className="detailLabel">Ville</span>
              <span className="detailValue">
                {isEditing ? renderInput('ville', prospect.ville) : (prospect.ville || '—')}
              </span>
            </div>
            <div className="detailRow">
              <span className="detailLabel">Pays</span>
              <span className="detailValue">
                {isEditing ? renderInput('pays', prospect.pays) : (prospect.pays || '—')}
              </span>
            </div>
            <div className="detailRow">
              <span className="detailLabel">Région</span>
              <span className="detailValue">
                {isEditing ? renderInput('region', prospect.region) : (prospect.region || '—')}
              </span>
            </div>
          </div>

          <div className="prospectDetail__section">
            <h3>Informations entreprise</h3>
            <div className="detailRow">
              <span className="detailLabel">SIRET</span>
              <span className="detailValue">
                {isEditing ? renderInput('siret', prospect.siret) : (prospect.siret ? <code>{prospect.siret}</code> : '—')}
              </span>
            </div>
            <div className="detailRow">
              <span className="detailLabel">Code NAF</span>
              <span className="detailValue">
                {isEditing ? renderInput('code_naf', prospect.code_naf) : (prospect.code_naf || '—')}
              </span>
            </div>
            <div className="detailRow">
              <span className="detailLabel">Activité</span>
              <span className="detailValue">
                {isEditing ? renderInput('activite', prospect.activite) : (prospect.activite || '—')}
              </span>
            </div>
            <div className="detailRow">
              <span className="detailLabel">Secteur</span>
              <span className="detailValue">
                {isEditing ? renderInput('secteur', prospect.secteur) : (prospect.secteur || '—')}
              </span>
            </div>
          </div>

          <div className="prospectDetail__section">
            <h3>Statut</h3>
            <div className="detailRow">
              <span className="detailLabel">{presentation.statusHeading}</span>
              <span className="detailValue">
                {isEditing ? (
                  renderSelect('statut', prospect.statut, statusOptions)
                ) : (
                  <span className={`badge badge--statut badge--${prospect.statut}`}>
                    {formatProspectStatusText(prospect.statut)}
                  </span>
                )}
              </span>
            </div>
            <div className="detailRow">
              <span className="detailLabel">Date de création</span>
              <span className="detailValue">
                <IoCalendarOutline />
                {presentation.createdAt}
              </span>
            </div>
          </div>

          {prospect.id_prospection !== undefined && (
            <div className="prospectDetail__section">
              <h3>Détails d'appel (Campagne)</h3>
              <div className="detailRow">
                <span className="detailLabel">{presentation.campaignStatusHeading}</span>
                <span className="detailValue">
                  <span className={`badge badge--statut badge--${prospect.statut_prospect_campagne || 'nouveau'}`}>
                    {formatProspectStatusText(prospect.statut_prospect_campagne || 'nouveau')}
                  </span>
                </span>
              </div>
              <div className="detailRow">
                <span className="detailLabel">État file</span>
                <span className="detailValue">
                  <span className={`badge badge--${prospect.statut_file || prospect.statut_campagne || 'en_attente'}`}>
                    {formatProspectStatusText(prospect.statut_file || prospect.statut_campagne || 'en_attente')}
                  </span>
                </span>
              </div>
              <div className="detailRow">
                <span className="detailLabel">Tentatives d'appel</span>
                <span className="detailValue">
                  <code>{prospect.nb_tentatives ?? 0}</code> / <code>{prospect.max_tentatives ?? 5}</code>
                </span>
              </div>
              {presentation.lastAttemptAt && (
                <div className="detailRow">
                  <span className="detailLabel">Dernier appel</span>
                  <span className="detailValue">
                    <IoCalendarOutline />
                    {presentation.lastAttemptAt}
                  </span>
                </div>
              )}
              <div className="detailRow">
                <span className="detailLabel">Agent assigné</span>
                <span className="detailValue">
                  {presentation.agentLabel}
                </span>
              </div>
              {presentation.injectedAt && (
                <div className="detailRow">
                  <span className="detailLabel">Date d'injection</span>
                  <span className="detailValue">
                    <IoCalendarOutline />
                    {presentation.injectedAt}
                  </span>
                </div>
              )}
            </div>
          )}

          {presentation.showGlobalAlerts && (
            <div className="prospectDetail__section prospectDetail__section--alert">
              <h3>Alertes globales</h3>
              {prospect.est_doublon && (
                <div className="detailRow">
                  <span className="detailLabel">Doublon</span>
                  <span className="detailValue">
                    <span className="badge badge--warning">Oui</span>
                    {presentation.duplicateSince && (
                      <span className="alertDate">Depuis le {presentation.duplicateSince}</span>
                    )}
                  </span>
                </div>
              )}
              {prospect.optout && (
                <div className="detailRow">
                  <span className="detailLabel">{presentation.optoutLabel}</span>
                  <span className="detailValue">
                    <span className="badge badge--danger">Oui</span>
                    {presentation.optoutSince && (
                      <span className="alertDate">Depuis le {presentation.optoutSince}</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modalFooter">
          {isEditing ? (
            <>
              <button className="btnSecondary" onClick={cancelEditing} disabled={isSubmitting}>Annuler</button>
              <button className="btnPrimary" onClick={() => void save()} disabled={isSubmitting}>Enregistrer</button>
            </>
          ) : (
            <>
              <button className="btnSecondary" onClick={startEditing}>Modifier</button>
              <button className="btnSecondary" onClick={close}>Fermer</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
