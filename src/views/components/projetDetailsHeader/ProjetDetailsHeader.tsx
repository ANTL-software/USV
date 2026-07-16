import type { ReactElement } from 'react';
import { IoArrowBack, IoCreate, IoStatsChart } from 'react-icons/io5';
import type { Projet } from '../../../utils/types/index.ts';
import { getProjectStatusBadgeClass } from '../../../utils/scripts/index.ts';
import { Button } from '../index.ts';

interface ProjetDetailsHeaderProps {
  navigateToEdit: () => void;
  navigateToProjects: () => void;
  navigateToTasks: () => void;
  projet: Projet;
}

export function ProjetDetailsHeader({
  navigateToEdit,
  navigateToProjects,
  navigateToTasks,
  projet,
}: ProjetDetailsHeaderProps): ReactElement {
  return (
    <div className="projetDetails__header">
      <Button style="back" onClick={navigateToProjects}><IoArrowBack /><span>Retour</span></Button>
      <div className="projetDetails__title">
        <h1>{projet.titre}</h1>
        <span className={getProjectStatusBadgeClass(projet.statut)}>{projet.statut}</span>
      </div>
      <div className="projetDetails__actions">
        <Button style="white" onClick={navigateToTasks}><IoStatsChart /><span>Tâches</span></Button>
        <Button style="gradient" onClick={navigateToEdit}><IoCreate /><span>Modifier</span></Button>
      </div>
    </div>
  );
}
