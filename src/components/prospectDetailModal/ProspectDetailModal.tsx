import './prospectDetailModal.scss';

import { ReactElement } from 'react';
import { IoCallOutline, IoMailOutline, IoLocationOutline, IoBusiness, IoPersonOutline, IoCalendarOutline } from 'react-icons/io5';
import type { Prospect } from '../../utils/types/prospect.types';

interface ProspectDetailModalProps {
  prospect: Prospect;
  onClose: () => void;
}

export default function ProspectDetailModal({ prospect, onClose }: Readonly<ProspectDetailModalProps>): ReactElement {
  const formattedDate = new Date(prospect.created_at).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div id="prospectDetailOverlay" onClick={onClose}>
      <div id="prospectDetailModal" onClick={e => e.stopPropagation()}>
        <div className="modalHeader">
          <h2>Détail du prospect</h2>
          <button className="closeBtn" onClick={onClose} aria-label="Fermer">✕</button>
        </div>

        <div className="modalBody">
          <div className="prospectDetail__section">
            <h3>Identité</h3>
            <div className="detailRow">
              <span className="detailLabel">Type</span>
              <span className="detailValue">
                {prospect.type_prospect === 'Entreprise' ? <IoBusiness /> : <IoPersonOutline />}
                <span className={`badge badge--${prospect.type_prospect.toLowerCase()}`}>
                  {prospect.type_prospect}
                </span>
              </span>
            </div>
            {prospect.type_prospect === 'Entreprise' && prospect.raison_sociale && (
              <div className="detailRow">
                <span className="detailLabel">Raison sociale</span>
                <span className="detailValue">{prospect.raison_sociale}</span>
              </div>
            )}
            <div className="detailRow">
              <span className="detailLabel">Nom</span>
              <span className="detailValue">{prospect.nom.toUpperCase()}</span>
            </div>
            {prospect.prenom && (
              <div className="detailRow">
                <span className="detailLabel">Prénom</span>
                <span className="detailValue">{prospect.prenom}</span>
              </div>
            )}
            {prospect.civilite && (
              <div className="detailRow">
                <span className="detailLabel">Civilité</span>
                <span className="detailValue">{prospect.civilite}</span>
              </div>
            )}
          </div>

          <div className="prospectDetail__section">
            <h3>Contact</h3>
            <div className="detailRow">
              <span className="detailLabel">Téléphone</span>
              <span className="detailValue">
                <IoCallOutline />
                <code>{prospect.telephone}</code>
                <span className={`badge badge--${prospect.type_telephone}`}>{prospect.type_telephone}</span>
              </span>
            </div>
            {prospect.email && (
              <div className="detailRow">
                <span className="detailLabel">Email</span>
                <span className="detailValue">
                  <IoMailOutline />
                  <a href={`mailto:${prospect.email}`}>{prospect.email}</a>
                </span>
              </div>
            )}
            {prospect.telephone_contact && (
              <div className="detailRow">
                <span className="detailLabel">Téléphone contact</span>
                <span className="detailValue">
                  <IoCallOutline />
                  <code>{prospect.telephone_contact}</code>
                </span>
              </div>
            )}
          </div>

          <div className="prospectDetail__section">
            <h3>Adresse</h3>
            <div className="detailRow">
              <span className="detailLabel">Adresse complète</span>
              <span className="detailValue">
                {[prospect.adresse, prospect.code_postal, prospect.ville, prospect.pays]
                  .filter(Boolean)
                  .join(', ') ? (
                    <>
                      <IoLocationOutline />
                      {[prospect.adresse, prospect.code_postal, prospect.ville, prospect.pays]
                        .filter(Boolean)
                        .join(', ')}
                    </>
                  ) : (
                    '—'
                  )}
              </span>
            </div>
            {prospect.region && (
              <div className="detailRow">
                <span className="detailLabel">Région</span>
                <span className="detailValue">{prospect.region}</span>
              </div>
            )}
          </div>

          {prospect.type_prospect === 'Entreprise' && (
            <div className="prospectDetail__section">
              <h3>Informations entreprise</h3>
              {prospect.siret && (
                <div className="detailRow">
                  <span className="detailLabel">SIRET</span>
                  <span className="detailValue"><code>{prospect.siret}</code></span>
                </div>
              )}
              {prospect.code_naf && (
                <div className="detailRow">
                  <span className="detailLabel">Code NAF</span>
                  <span className="detailValue">{prospect.code_naf}</span>
                </div>
              )}
              {prospect.activite && (
                <div className="detailRow">
                  <span className="detailLabel">Activité</span>
                  <span className="detailValue">{prospect.activite}</span>
                </div>
              )}
              {prospect.secteur && (
                <div className="detailRow">
                  <span className="detailLabel">Secteur</span>
                  <span className="detailValue">{prospect.secteur}</span>
                </div>
              )}
            </div>
          )}

          <div className="prospectDetail__section">
            <h3>Statut</h3>
            <div className="detailRow">
              <span className="detailLabel">Statut actuel</span>
              <span className="detailValue">
                <span className={`badge badge--statut badge--${prospect.statut}`}>
                  {prospect.statut.replace(/_/g, ' ')}
                </span>
              </span>
            </div>
            <div className="detailRow">
              <span className="detailLabel">Date de création</span>
              <span className="detailValue">
                <IoCalendarOutline />
                {formattedDate}
              </span>
            </div>
          </div>

          {(prospect.est_doublon || prospect.optout) && (
            <div className="prospectDetail__section prospectDetail__section--alert">
              <h3>Alertes</h3>
              {prospect.est_doublon && (
                <div className="detailRow">
                  <span className="detailLabel">Doublon</span>
                  <span className="detailValue">
                    <span className="badge badge--warning">Oui</span>
                    {prospect.doublon_date && (
                      <span className="alertDate">Depuis le {new Date(prospect.doublon_date).toLocaleDateString('fr-FR')}</span>
                    )}
                  </span>
                </div>
              )}
              {prospect.optout && (
                <div className="detailRow">
                  <span className="detailLabel">Opt-out</span>
                  <span className="detailValue">
                    <span className="badge badge--danger">Oui</span>
                    {prospect.optout_date && (
                      <span className="alertDate">Depuis le {new Date(prospect.optout_date).toLocaleDateString('fr-FR')}</span>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modalFooter">
          <button className="btnSecondary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
}
