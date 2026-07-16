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
        <h1>Enrichissement de donnée Prospect</h1>
        <p>Consultez la fiche interne et les champs réservés à l’enrichissement public, sans écraser les données terrain.</p>
      </header>
    </>
  );
}
