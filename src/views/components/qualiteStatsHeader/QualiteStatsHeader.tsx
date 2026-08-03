import type { ReactElement } from 'react';
import { MdArrowBack } from 'react-icons/md';
import { Button } from '../index.ts';

interface QualiteStatsHeaderProps {
  navigateBack: () => void;
}

export function QualiteStatsHeader({ navigateBack }: QualiteStatsHeaderProps): ReactElement {
  return (
    <header className="qualiteStats__page-header">
      <Button style="back" onClick={navigateBack}><MdArrowBack /><span>Retour</span></Button>
      <div>
        <span className="qualiteStats__eyebrow">Pilotage commercial</span>
        <h1>Statistiques ProgPA</h1>
        <p>Nombre d’appels clôturés à chaque étape du plan d’appel, par commercial et par jour.</p>
      </div>
    </header>
  );
}
