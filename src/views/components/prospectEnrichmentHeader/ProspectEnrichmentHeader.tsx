import type { ReactElement } from 'react';
import { MdArrowBack } from 'react-icons/md';
import { Button } from '../index.ts';

interface ProspectEnrichmentHeaderProps {
  navigateBack: () => void;
}

export function ProspectEnrichmentHeader({ navigateBack }: ProspectEnrichmentHeaderProps): ReactElement {
  return (
    <>
      <div className="prospectEnrichment__back">
        <Button style="back" onClick={navigateBack}>
          <MdArrowBack />
          <span>Retour aux prospects</span>
        </Button>
      </div>
      <header className="prospectEnrichment__header">
        <span className="prospectEnrichment__manualBadge">Évaluation manuelle</span>
        <h1>Enrichissement de données prospect</h1>
        <p>Choisissez une fiche, lancez l’analyse et contrôlez chaque proposition. Aucune recherche ni sauvegarde ne part automatiquement.</p>
      </header>
    </>
  );
}
