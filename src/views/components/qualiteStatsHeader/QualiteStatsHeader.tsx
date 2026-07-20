import type { ReactElement } from 'react';
import { MdArrowBack, MdInsights } from 'react-icons/md';
import { Button } from '../index.ts';

interface QualiteStatsHeaderProps {
  navigateBack: () => void;
}

export function QualiteStatsHeader({ navigateBack }: QualiteStatsHeaderProps): ReactElement {
  return (
    <>
      <div className="qualiteStats__back">
        <Button style="back" onClick={navigateBack}><MdArrowBack /><span>Retour</span></Button>
      </div>
      <section className="qualiteStats__hero">
        <div className="qualiteStats__hero-copy">
          <span className="qualiteStats__eyebrow">Qualité</span>
          <h1>Statistiques progpa</h1>
          <p>Suivi moyen du plan d’appel sur la période, lecture quotidienne et focus commercial individuel.</p>
        </div>
        <div className="qualiteStats__hero-badge"><MdInsights /></div>
      </section>
    </>
  );
}
