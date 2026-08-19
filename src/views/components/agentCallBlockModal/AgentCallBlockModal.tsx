import './agentCallBlockModal.scss';

import type { ReactElement } from 'react';
import { IoLockClosed, IoTimeOutline } from 'react-icons/io5';
import type { EmployeeDetailsViewModel } from '../../../hooks/index.ts';
import { Button, Modal } from '../index.ts';

type AgentCallBlockModalProps = Pick<
  EmployeeDetailsViewModel,
  | 'closeScriptCallBlockModal'
  | 'currentEmploye'
  | 'handleScriptCallBlockModeChange'
  | 'isScriptCallBlockModalOpen'
  | 'isUpdatingScriptCallAccess'
  | 'scriptCallBlockError'
  | 'scriptCallBlockMinDateTime'
  | 'scriptCallBlockMode'
  | 'scriptCallBlockReason'
  | 'scriptCallBlockUntil'
  | 'setScriptCallBlockReason'
  | 'setScriptCallBlockUntil'
  | 'submitScriptCallBlock'
>;

export function AgentCallBlockModal({
  closeScriptCallBlockModal,
  currentEmploye,
  handleScriptCallBlockModeChange,
  isScriptCallBlockModalOpen,
  isUpdatingScriptCallAccess,
  scriptCallBlockError,
  scriptCallBlockMinDateTime,
  scriptCallBlockMode,
  scriptCallBlockReason,
  scriptCallBlockUntil,
  setScriptCallBlockReason,
  setScriptCallBlockUntil,
  submitScriptCallBlock,
}: AgentCallBlockModalProps): ReactElement {
  const employeeName = currentEmploye
    ? `${currentEmploye.prenom} ${currentEmploye.nom}`
    : 'ce commercial';

  return (
    <Modal
      isVisible={isScriptCallBlockModalOpen}
      onClose={closeScriptCallBlockModal}
      title="Bloquer les appels Script"
      variant="confirm"
    >
      <div className="agentCallBlockModal">
        <div className="agentCallBlockModal__warning">
          <IoLockClosed aria-hidden="true" />
          <p>
            <strong>{employeeName}</strong> ne pourra plus passer disponible ni lancer de nouvel appel.
            Le motif ci-dessous lui sera affiché avant sa déconnexion du Script.
          </p>
        </div>

        <label className="agentCallBlockModal__field" htmlFor="script-call-block-reason">
          <span>Motif du blocage *</span>
          <textarea
            id="script-call-block-reason"
            value={scriptCallBlockReason}
            onChange={(event) => setScriptCallBlockReason(event.target.value)}
            placeholder="Ex. Repos demandé par la direction jusqu'à nouvel ordre."
            rows={5}
            maxLength={1000}
            disabled={isUpdatingScriptCallAccess}
            autoFocus
          />
          <small>{scriptCallBlockReason.length}/1000 caractères</small>
        </label>

        <fieldset className="agentCallBlockModal__duration">
          <legend>Durée du blocage</legend>
          <label className="agentCallBlockModal__duration-option">
            <input
              type="radio"
              name="script-call-block-mode"
              value="manual"
              checked={scriptCallBlockMode === 'manual'}
              onChange={() => handleScriptCallBlockModeChange('manual')}
              disabled={isUpdatingScriptCallAccess}
            />
            <span>
              <strong>Jusqu’au déblocage manuel</strong>
              <small>Aucune échéance automatique.</small>
            </span>
          </label>
          <label className="agentCallBlockModal__duration-option">
            <input
              type="radio"
              name="script-call-block-mode"
              value="scheduled"
              checked={scriptCallBlockMode === 'scheduled'}
              onChange={() => handleScriptCallBlockModeChange('scheduled')}
              disabled={isUpdatingScriptCallAccess}
            />
            <span>
              <strong>Déblocage automatique</strong>
              <small>Le déblocage manuel anticipé restera possible.</small>
            </span>
          </label>
        </fieldset>

        {scriptCallBlockMode === 'scheduled' && (
          <label className="agentCallBlockModal__field" htmlFor="script-call-block-until">
            <span><IoTimeOutline aria-hidden="true" /> Date et heure de reprise</span>
            <input
              id="script-call-block-until"
              type="datetime-local"
              min={scriptCallBlockMinDateTime}
              value={scriptCallBlockUntil}
              onChange={(event) => setScriptCallBlockUntil(event.target.value)}
              disabled={isUpdatingScriptCallAccess}
            />
          </label>
        )}

        {scriptCallBlockError && (
          <p className="agentCallBlockModal__error" role="alert">{scriptCallBlockError}</p>
        )}

        <div className="agentCallBlockModal__actions">
          <Button style="grey" onClick={closeScriptCallBlockModal} disabled={isUpdatingScriptCallAccess}>
            Annuler
          </Button>
          <Button
            style="red"
            onClick={() => { void submitScriptCallBlock(); }}
            disabled={isUpdatingScriptCallAccess}
          >
            {isUpdatingScriptCallAccess ? 'Blocage...' : 'Bloquer les appels'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
