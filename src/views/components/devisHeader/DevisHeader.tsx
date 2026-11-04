import type { ReactElement } from 'react';
import { MdArrowBack } from 'react-icons/md';
import { Button } from '../button/index.ts';

interface DevisHeaderProps {
  isEditing: boolean;
  onBack: () => void;
  progressPercent: number;
  selectedTemplateTitle: string;
}

export function DevisHeader({
  isEditing,
  onBack,
  progressPercent,
  selectedTemplateTitle,
}: DevisHeaderProps): ReactElement {
  return (
    <>
      <div className="devisView__back">
        <Button style="back" onClick={onBack}>
          <MdArrowBack />
          <span>Retour au commercial</span>
        </Button>
      </div>

      <section className={`devisView__hero${isEditing ? '' : ' devisView__hero--browse'}`}>
        <div>
          <p className="devisView__eyebrow">Commercial / Devis</p>
          <h1>{isEditing ? 'Préparer un devis de bout en bout' : 'Créer ou reprendre un devis'}</h1>
          <p className="devisView__subtitle">
            {isEditing ? 'Renseignez le besoin client, composez les prestations et définissez vos conditions de rémunération.' : 'Commencez une nouvelle proposition ou retrouvez vos devis en cours.'}
          </p>
        </div>

        {isEditing && <div className="devisView__hero-kpis">
          <div>
            <span>Sections renseignées</span>
            <strong>{selectedTemplateTitle || 'Aucune prestation'}</strong>
          </div>
          <div>
            <span>Avancement</span>
            <strong>{progressPercent}% prêt</strong>
          </div>
          <div>
            <span>Composition</span>
            <strong>Sections combinables</strong>
          </div>
        </div>}
      </section>
    </>
  );
}
