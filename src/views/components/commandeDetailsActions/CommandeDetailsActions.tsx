import type { ReactElement } from 'react';
import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoCloudUpload,
  IoDocumentText,
  IoHourglass,
  IoInformationCircle,
  IoPauseCircle,
  IoPrint,
  IoTrash,
} from 'react-icons/io5';

import type { useCommandeDetails } from '../../../hooks/index.ts';
import { formatFileSize } from '../../../utils/scripts/index.ts';
import type { StatutVente } from '../../../utils/types/index.ts';
import { Button } from '../index.ts';

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
  const { commande } = viewModel;
  if (!commande) return <></>;

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

        {commande.statut_vente === 'validee' ? (
          <>
            <input
              key={viewModel.fileInputVersion}
              type="file"
              id="signed-order-input"
              onChange={viewModel.handleFileSelect}
              hidden
              accept=".pdf,image/*"
            />
            <label
              htmlFor="signed-order-input"
              className={`upload-zone ${viewModel.dragging ? 'dragging' : ''}`}
              onDragOver={viewModel.handleDragOver}
              onDragLeave={viewModel.handleDragLeave}
              onDrop={viewModel.handleDrop}
            >
              {viewModel.uploadProgress !== null ? (
                <div className="upload-progress-container">
                  <div className="progress-bar" style={{ width: `${viewModel.uploadProgress}%` }} />
                  <span>Téléchargement... {viewModel.uploadProgress}%</span>
                </div>
              ) : (
                <>
                  <IoCloudUpload className="upload-icon" />
                  <p className="upload-title">Uploader le bon signé</p>
                  <span className="upload-hint">Glissez un fichier ou cliquez ici (PDF, JPG, PNG)</span>
                </>
              )}
            </label>
          </>
        ) : (
          <div className="upload-zone-disabled">
            <IoInformationCircle className="info-icon" />
            <p>L'upload du bon signé est activé uniquement lorsque la commande est <strong>Validée</strong>.</p>
          </div>
        )}

        {viewModel.mockDocs.length > 0 && (
          <div className="signed-docs-list">
            <h5>Fichiers liés :</h5>
            {viewModel.mockDocs.map((document) => (
              <div key={document.id} className="signed-doc-item">
                <div className="doc-info"><IoDocumentText className="doc-icon" /><span className="doc-name" title={document.name}>{document.name}</span><span className="doc-size">({formatFileSize(document.size)})</span></div>
                <button className="doc-delete-btn" title="Supprimer" onClick={() => { void viewModel.deleteMockDocument(document.id); }} type="button"><IoTrash /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
