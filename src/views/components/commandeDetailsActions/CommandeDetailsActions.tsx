import type { ReactElement } from 'react';
import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoHourglass,
  IoMailOutline,
  IoPauseCircle,
  IoPrint,
} from 'react-icons/io5';

import type { useCommandeDetails } from '../../../hooks/index.ts';
import { formatCommandeDateTime, normalizeCampaignVariant } from '../../../utils/scripts/index.ts';
import type { StatutVente } from '../../../utils/types/index.ts';
import { Button, CommercialDocumentsManager } from '../index.ts';

type CommandeDetailsViewModel = ReturnType<typeof useCommandeDetails>;

interface CommandeDetailsActionsProps {
  viewModel: CommandeDetailsViewModel;
}

const STATUS_ACTIONS: Array<{
  status: StatutVente;
  label: string;
  className: string;
  icon: ReactElement;
}> = [
  { status: 'validee', label: 'Validée', className: 'qualif-btn--validee', icon: <IoCheckmarkCircle /> },
  { status: 'en_attente', label: 'En attente', className: 'qualif-btn--attente', icon: <IoHourglass /> },
  { status: 'annulee', label: 'Annulée', className: 'qualif-btn--annulee', icon: <IoCloseCircle /> },
  { status: 'frigo', label: 'Frigo', className: 'qualif-btn--frigo', icon: <IoPauseCircle /> },
];

export function CommandeDetailsActions({ viewModel }: CommandeDetailsActionsProps): ReactElement {
  const { commande, documents, openEmailModal } = viewModel;
  if (!commande) return <></>;

  const isVenteCampaign = normalizeCampaignVariant(commande.campagne?.type_campagne) === 'vente';
  const hasSignedDocuments = documents.length > 0;
  const showEmailDispatchButton = isVenteCampaign && hasSignedDocuments;
  const campagneNom = commande.campagne?.nom_campagne || 'la campagne';

  return (
    <aside className="commandeDetails__right">
      <div className="aside-card card-style">
        <h3>Qualification</h3>
        <p className="aside-hint">Définir l'état opérationnel de la commande :</p>
        <div className="qualification-buttons">
          {STATUS_ACTIONS.map((action) => (
            <button
              key={action.status}
              onClick={() => { void viewModel.changeStatus(action.status); }}
              className={`qualif-btn ${action.className} ${commande.statut_vente === action.status ? 'active' : ''}`}
              disabled={viewModel.isUpdating}
              type="button"
            >
              {action.icon}<span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {commande.statut_vente === 'frigo' && <div className="aside-card card-style">
        <h3>Relance frigo</h3>
        <p className="aside-hint">Reporter la prochaine alerte de :</p>
        <div className="qualification-buttons">
          {([1, 2, 3, 4] as const).map((weeks) => <button key={weeks} type="button" className="qualif-btn qualif-btn--attente" onClick={() => { void viewModel.snoozeFrigoReminder(weeks); }} disabled={viewModel.isUpdating}>Rappel dans {weeks} semaine{weeks > 1 ? 's' : ''}</button>)}
        </div>
      </div>}

      <div className="aside-card card-style">
        <h3>Actions de commande</h3>
        <div className="aside-actions-list">
          <Button style="gradient" onClick={viewModel.printDocument} className="action-btn-aside">
            <IoPrint /><span>Réimprimer le bon de commande</span>
          </Button>
        </div>
        <div className="aside-divider" />
        <h4>Bon de commande signé</h4>

        <CommercialDocumentsManager
          {...viewModel}
          disabled={commande.statut_vente !== 'validee'}
          disabledMessage="L’upload du bon signé est activé uniquement lorsque la commande est validée."
          inputId={`signed-order-input-${commande.id_vente}`}
          uploadLabel="Uploader le bon signé"
        />

        {showEmailDispatchButton && (
          <div className="aside-email-dispatch">
            {commande.bon_commande_signe_envoye_at && (
              <div className="signed-order-sent-status">
                <div className="sent-status-header">
                  <IoCheckmarkCircle className="sent-status-icon" />
                  <span className="sent-status-title">Bon signé envoyé par email</span>
                </div>
                <p className="sent-status-details">
                  Le {formatCommandeDateTime(commande.bon_commande_signe_envoye_at)}
                  {commande.bon_commande_signe_envoye_a ? ` à ${commande.bon_commande_signe_envoye_a}` : ''}
                </p>
              </div>
            )}
            <Button
              style={commande.bon_commande_signe_envoye_at ? 'grey' : 'gradient'}
              onClick={openEmailModal}
              className="action-btn-aside action-btn-aside--email"
              type="button"
            >
              <IoMailOutline />
              <span>{commande.bon_commande_signe_envoye_at ? 'Renvoyer par mail à ' : 'Envoyer par mail à '}{campagneNom}</span>
            </Button>
          </div>
        )}
      </div>
    </aside>
  );
}
