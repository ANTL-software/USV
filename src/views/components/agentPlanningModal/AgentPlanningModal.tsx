import type { ReactElement } from 'react';
import type { EmployeeDetailsViewModel } from '../../../hooks/index.ts';
import { buildPlanningSlotsByDay } from '../../../utils/scripts/index.ts';
import { Button, Modal } from '../index.ts';

type AgentPlanningModalProps = Pick<
  EmployeeDetailsViewModel,
  | 'closePlanningModal'
  | 'currentPlanningAssignation'
  | 'handleAssignPlanning'
  | 'isAssigningPlanning'
  | 'isPlanningModalOpen'
  | 'planningError'
  | 'plannings'
  | 'planningsLoading'
>;

export function AgentPlanningModal({
  closePlanningModal,
  currentPlanningAssignation,
  handleAssignPlanning,
  isAssigningPlanning,
  isPlanningModalOpen,
  planningError,
  plannings,
  planningsLoading,
}: AgentPlanningModalProps): ReactElement {
  return (
    <Modal isVisible={isPlanningModalOpen} onClose={closePlanningModal} title="Assigner un planning">
      <div className="agentDetails__planning-modal">
        {currentPlanningAssignation?.planning && (
          <div className="agentDetails__planning-current">
            <p>Planning actuel</p>
            <strong>{currentPlanningAssignation.planning.nom_planning}</strong>
          </div>
        )}

        {planningsLoading ? (
          <p className="agentDetails__planning-empty">Chargement des plannings...</p>
        ) : planningError ? (
          <p className="agentDetails__planning-empty agentDetails__planning-empty--error">{planningError}</p>
        ) : plannings.length === 0 ? (
          <p className="agentDetails__planning-empty">Aucun planning disponible.</p>
        ) : (
          <div className="agentDetails__planning-list">
            {plannings.map((planning) => {
              const isCurrent = currentPlanningAssignation?.id_planning === planning.id_planning;
              const slots = buildPlanningSlotsByDay(planning.creneaux);

              return (
                <article
                  key={planning.id_planning}
                  className={`agentDetails__planning-card${isCurrent ? ' agentDetails__planning-card--current' : ''}`}
                >
                  <div className="agentDetails__planning-cardHeader">
                    <div>
                      <h4>{planning.nom_planning}</h4>
                      <p>{planning.heures_hebdo} h / semaine</p>
                    </div>
                    {isCurrent && <span className="agentDetails__planning-badge">Assigné</span>}
                  </div>
                  <div className="agentDetails__planning-slots">
                    {slots.map((slot) => (
                      <p key={slot.dayLabel}>
                        <span>{slot.dayLabel}</span>
                        <strong>{slot.ranges.join('   ')}</strong>
                      </p>
                    ))}
                  </div>
                  <Button
                    style={isCurrent ? 'grey' : 'gradient'}
                    disabled={isCurrent || isAssigningPlanning}
                    onClick={() => void handleAssignPlanning(planning.id_planning)}
                  >
                    <span>{isCurrent ? 'Déjà assigné' : 'Assigner ce planning'}</span>
                  </Button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </Modal>
  );
}
