import type { ReactElement } from 'react';
import { IoAdd, IoArrowBack, IoCheckmarkDone } from 'react-icons/io5';
import { Button } from '../button/index.ts';

interface ProjetsListHeaderProps {
  onBack: () => void;
  onCreate: () => void;
  onMyTasks: () => void;
}

export function ProjetsListHeader({ onBack, onCreate, onMyTasks }: ProjetsListHeaderProps): ReactElement {
  return (
    <div className="projetsList__header">
      <Button style="back" onClick={onBack}><IoArrowBack /><span>Retour</span></Button>
      <h1>Projets</h1>
      <div className="projetsList__header-actions">
        <Button style="white" onClick={onMyTasks}><IoCheckmarkDone /><span>Mes tâches</span></Button>
        <Button style="gradient" onClick={onCreate}><IoAdd /><span>Nouveau projet</span></Button>
      </div>
    </div>
  );
}
