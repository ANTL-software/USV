import type { ReactElement } from 'react';
import { IoCheckmarkCircle, IoSettings, IoStatsChart, IoTime } from 'react-icons/io5';
import type { ProjetDetailsViewModel } from '../../../hooks/index.ts';
import { Button } from '../index.ts';

type ProjetQuickActionsProps = Pick<ProjetDetailsViewModel, 'applyNextStatus' | 'navigateToEdit' | 'navigateToTasks' | 'projet' | 'statusActionLabel'>;

export function ProjetQuickActions({ applyNextStatus, navigateToEdit, navigateToTasks, projet, statusActionLabel }: ProjetQuickActionsProps): ReactElement | null {
  if (!projet) return null;
  return (
    <div className="projetDetails__quick-actions">
      <h3>Actions rapides</h3>
      <div className="projetDetails__actions-grid">
        {statusActionLabel && (
          <Button style="gradient" onClick={() => void applyNextStatus()}>
            {projet.statut === 'actif' ? <IoTime /> : <IoCheckmarkCircle />}<span>{statusActionLabel}</span>
          </Button>
        )}
        {(projet.statut === 'actif' || projet.statut === 'en_pause') && <Button style="white" onClick={navigateToTasks}><IoStatsChart /><span>Voir les tâches</span></Button>}
        <Button style="white" onClick={navigateToEdit}><IoSettings /><span>Paramètres</span></Button>
      </div>
    </div>
  );
}
