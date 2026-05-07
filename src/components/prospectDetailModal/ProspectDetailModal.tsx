import './prospectDetailModal.scss';

import { ReactElement, useState, useEffect } from 'react';
import { IoCallOutline, IoMailOutline, IoBusiness, IoPersonOutline, IoCalendarOutline } from 'react-icons/io5';
import type { Prospect, ProspectUpdateData, TypeProspect, StatutProspect } from '../../utils/types/prospect.types';
import { updateProspectService } from '../../API/services/prospect.service';
import { useAlert } from '../../context/alert/AlertContext';

interface ProspectDetailModalProps {
  prospect: Prospect;
  onClose: () => void;
  onProspectUpdated?: (updatedProspect: Prospect) => void;
}

export default function ProspectDetailModal({ prospect, onClose, onProspectUpdated }: Readonly<ProspectDetailModalProps>): ReactElement {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editedProspect, setEditedProspect] = useState<ProspectUpdateData>({});
  const { showSuccess, showError } = useAlert();

  const formattedDate = new Date(prospect.created_at).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  useEffect(() => {
    if (isEditing) {
      setEditedProspect({
        type_prospect: prospect.type_prospect,
        nom: prospect.nom,
        prenom: prospect.prenom,
        raison_sociale: prospect.raison_sociale,
        email: prospect.email,
        telephone: prospect.telephone,
        adresse: prospect.adresse,
        code_postal: prospect.code_postal,
        ville: prospect.ville,
        pays: prospect.pays,
        statut: prospect.statut,
        notes: undefined,
        siret: prospect.siret,
        code_naf: prospect.code_naf,
        activite: prospect.activite,
        secteur: prospect.secteur,
        region: prospect.region,
        civilite: prospect.civilite,
        telephone_contact: prospect.telephone_contact,
      });
    }
  }, [isEditing, prospect]);

  const handleEdit = (): void => {
    setIsEditing(true);
  };

  const handleCancel = (): void => {
    setIsEditing(false);
    setEditedProspect({});
  };

  const handleSave = async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      // Validation des champs obligatoires
      const nomValue = editedProspect.nom ?? prospect.nom;
      if (!nomValue || nomValue.trim().length < 2) {
        await showError('Le nom est obligatoire (2-100 caractères)', 'Erreur de validation');
        return;
      }

      const telephoneValue = editedProspect.telephone ?? prospect.telephone;
      if (!telephoneValue || telephoneValue.trim().length < 6) {
        await showError('Le téléphone est obligatoire', 'Erreur de validation');
        return;
      }

      // Convertir les chaînes vides en null pour le backend
      const dataToSend = Object.fromEntries(
        Object.entries(editedProspect).map(([key, value]) => [
          key,
          value === '' ? null : value
        ])
      ) as ProspectUpdateData;

      console.log('[ProspectDetailModal] Envoi des données:', JSON.stringify(dataToSend, null, 2));

      const updatedProspect = await updateProspectService(prospect.id_prospect, dataToSend);
      await showSuccess('Prospect mis à jour avec succès', 'Succès');
      onProspectUpdated?.(updatedProspect);
      setIsEditing(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du prospect';
      await showError(message, 'Erreur');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ProspectUpdateData, value: string): void => {
    setEditedProspect(prev => ({ ...prev, [field]: value }));
  };

  const renderInput = (field: keyof ProspectUpdateData, value: string | null, type: 'text' | 'email' | 'tel' = 'text'): ReactElement => (
    <input
      type={type}
      value={editedProspect[field] ?? value ?? ''}
      onChange={e => handleChange(field, e.target.value)}
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
      onChange={e => handleChange(field, e.target.value)}
      className="detailSelect"
      disabled={!isEditing}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );

  const typeOptions: readonly { value: TypeProspect; label: string }[] = [
    { value: 'Particulier', label: 'Particulier' },
    { value: 'Entreprise', label: 'Entreprise' },
  ] as const;

  const statutOptions: readonly { value: StatutProspect; label: string }[] = [
    { value: 'nouveau', label: 'Nouveau' },
    { value: 'contacte', label: 'Contacté' },
    { value: 'interesse', label: 'Intéressé' },
    { value: 'rappel', label: 'Rappel' },
    { value: 'non_interesse', label: 'Non intéressé' },
    { value: 'vente_conclue', label: 'Vente conclue' },
  ] as const;

  return (
    <div id="prospectDetailOverlay" onClick={isEditing ? undefined : onClose}>
      <div id="prospectDetailModal" onClick={e => e.stopPropagation()}>
        <div className="modalHeader">
          <h2>Détail du prospect</h2>
          <button className="closeBtn" onClick={isEditing ? handleCancel : onClose} aria-label={isEditing ? 'Annuler' : 'Fermer'}>
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
            {(isEditing || prospect.type_prospect === 'Entreprise') && (
              <div className="detailRow">
                <span className="detailLabel">Raison sociale</span>
                <span className="detailValue">
                  {isEditing ? renderInput('raison_sociale', prospect.raison_sociale) : (prospect.raison_sociale || '—')}
                </span>
              </div>
            )}
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
            <div className="detailRow">
              <span className="detailLabel">Civilité</span>
              <span className="detailValue">
                {isEditing ? renderInput('civilite', prospect.civilite) : (prospect.civilite || '—')}
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
              <span className="detailLabel">Statut actuel</span>
              <span className="detailValue">
                {isEditing ? (
                  renderSelect('statut', prospect.statut, statutOptions)
                ) : (
                  <span className={`badge badge--statut badge--${prospect.statut}`}>
                    {prospect.statut.replace(/_/g, ' ')}
                  </span>
                )}
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
          {isEditing ? (
            <>
              <button className="btnSecondary" onClick={handleCancel} disabled={isSubmitting}>Annuler</button>
              <button className="btnPrimary" onClick={handleSave} disabled={isSubmitting}>Enregistrer</button>
            </>
          ) : (
            <>
              <button className="btnSecondary" onClick={handleEdit}>Modifier</button>
              <button className="btnSecondary" onClick={onClose}>Fermer</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
