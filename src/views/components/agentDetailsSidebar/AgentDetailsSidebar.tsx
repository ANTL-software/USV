import type { ReactElement } from 'react';
import { useRef } from 'react';
import { IoCalendar, IoCall, IoCloudUpload, IoDocumentText, IoLockClosed, IoLockOpen, IoPencil } from 'react-icons/io5';
import { MdDelete, MdDownload } from 'react-icons/md';
import type { EmployeeDetailsViewModel } from '../../../hooks/index.ts';
import { getEmployePhotoUrl } from '../../../utils/scripts/index.ts';
import { formatScriptCallBlockUntil } from '../../../utils/scripts/index.ts';
import { Button } from '../index.ts';

type AgentDetailsSidebarProps = Pick<
  EmployeeDetailsViewModel,
  | 'currentEmploye'
  | 'handleAddDocument'
  | 'handleExportData'
  | 'handlePhotoDelete'
  | 'handlePhotoFileChange'
  | 'isPhotoUploading'
  | 'canManageScriptCallAccess'
  | 'isUpdatingScriptCallAccess'
  | 'handleToggleScriptCallAccess'
  | 'openPlanningModal'
  | 'photoError'
>;

interface AgentActionProps {
  description: string;
  icon: ReactElement;
  label: string;
  onClick: () => void;
}

function AgentAction({ description, icon, label, onClick }: AgentActionProps): ReactElement {
  return (
    <div className="agentDetails__action-item">
      <Button style="grey" className="agentDetails__action-btn" onClick={onClick}>
        <span className="agentDetails__action-icon">{icon}</span>
        <span className="agentDetails__action-label">{label}</span>
      </Button>
      <p className="agentDetails__action-description">{description}</p>
    </div>
  );
}

export function AgentDetailsSidebar({
  currentEmploye,
  handleAddDocument,
  handleExportData,
  handlePhotoDelete,
  handlePhotoFileChange,
  isPhotoUploading,
  canManageScriptCallAccess,
  isUpdatingScriptCallAccess,
  handleToggleScriptCallAccess,
  openPlanningModal,
  photoError,
}: AgentDetailsSidebarProps): ReactElement {
  const formattedAutomaticUnlock = formatScriptCallBlockUntil(
    currentEmploye?.appels_script_bloques_jusqu_au,
  );

  const photoInputRef = useRef<HTMLInputElement>(null);
  const openPhotoPicker = (): void => photoInputRef.current?.click();

  return (
    <aside className="agentDetails__aside">
      <section className="agentDetails__photo-section">
        <h2>Photo de l&apos;employé</h2>
        <div className="agentDetails__photo-container">
          {currentEmploye?.photo_path ? (
            <div className="agentDetails__photo-wrapper">
              <img
                src={getEmployePhotoUrl(currentEmploye.id_employe, currentEmploye.photo_path) || ''}
                alt={`${currentEmploye.prenom} ${currentEmploye.nom}`}
                className="agentDetails__photo-img"
              />
              <div className="agentDetails__photo-overlay">
                <button
                  type="button"
                  className="photoBtn edit"
                  onClick={openPhotoPicker}
                  title="Modifier la photo"
                  disabled={isPhotoUploading}
                >
                  <IoPencil />
                </button>
                <button
                  type="button"
                  className="photoBtn delete"
                  onClick={() => void handlePhotoDelete()}
                  title="Supprimer la photo"
                  disabled={isPhotoUploading}
                >
                  <MdDelete />
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="agentDetails__photo-placeholder" onClick={openPhotoPicker}>
              <span className="placeholder-icon"><IoCloudUpload /></span>
              <span>Ajouter une photo</span>
            </button>
          )}

          {isPhotoUploading && <div className="agentDetails__photo-status">Téléchargement...</div>}
          {photoError && <div className="agentDetails__photo-error">{photoError}</div>}
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoFileChange}
            className="agentDetails__hiddenInput"
            disabled={isPhotoUploading}
          />
        </div>
      </section>

      <section className="agentDetails__actions-section">
        <h2>Actions</h2>
        <div className="agentDetails__actions-list">
          {canManageScriptCallAccess && (
            <div className="agentDetails__action-item agentDetails__action-item--call-access">
              <button
                type="button"
                className={`agentDetails__call-access${currentEmploye?.appels_script_bloques ? ' agentDetails__call-access--blocked' : ''}`}
                onClick={() => { void handleToggleScriptCallAccess(); }}
                disabled={!currentEmploye || isUpdatingScriptCallAccess}
                role="switch"
                aria-checked={!currentEmploye?.appels_script_bloques}
              >
                <span className="agentDetails__action-icon">
                  {currentEmploye?.appels_script_bloques ? <IoLockClosed /> : <IoCall />}
                </span>
                <span className="agentDetails__action-label">
                  {currentEmploye?.appels_script_bloques ? 'Débloquer les appels' : 'Bloquer les appels'}
                </span>
                <span className="agentDetails__call-access-toggle" aria-hidden="true">
                  <span className="agentDetails__call-access-knob" />
                  <strong>{currentEmploye?.appels_script_bloques ? 'OFF' : 'ON'}</strong>
                </span>
                <span className="agentDetails__call-access-state" aria-hidden="true">
                  {currentEmploye?.appels_script_bloques ? <IoLockClosed /> : <IoLockOpen />}
                </span>
              </button>
              <p className="agentDetails__action-description">
                {currentEmploye?.appels_script_bloques
                  ? `Production verrouillée${formattedAutomaticUnlock ? ` jusqu’au ${formattedAutomaticUnlock}` : ' sans échéance automatique'}.`
                  : 'Le commercial peut passer des appels dans le Script.'}
              </p>
            </div>
          )}
          <AgentAction
            label="Ajouter un document"
            icon={<IoDocumentText />}
            description="Ajouter un nouveau document à l'employé"
            onClick={handleAddDocument}
          />
          <AgentAction
            label="Assigner un planning"
            icon={<IoCalendar />}
            description="Affecter un planning hebdomadaire à cet employé"
            onClick={() => void openPlanningModal()}
          />
          <AgentAction
            label="Export données"
            icon={<MdDownload />}
            description="Exporter les données de l'employé"
            onClick={() => void handleExportData()}
          />
        </div>
      </section>
    </aside>
  );
}
