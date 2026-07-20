import type { ReactElement } from 'react';
import { IoEarOutline } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import { Button } from '../button/index.ts';

interface QualiteEcoutesHeaderProps {
  onBack: () => void;
  totalCount: number;
}

export function QualiteEcoutesHeader({ onBack, totalCount }: QualiteEcoutesHeaderProps): ReactElement {
  return (
    <div className="qualiteEcoutes__header">
      <Button style="back" onClick={onBack}><MdArrowBack /><span>Retour</span></Button>
      <div className="qualiteEcoutes__title-wrap"><IoEarOutline className="qualiteEcoutes__title-icon" /><h1>Écoutes des appels</h1></div>
      <span className="qualiteEcoutes__count">
        {totalCount} appel{totalCount !== 1 ? 's' : ''} enregistré{totalCount !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
