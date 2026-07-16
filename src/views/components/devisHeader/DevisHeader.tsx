import type { ReactElement } from 'react';
import { MdArrowBack } from 'react-icons/md';
import { formatCurrency } from '../../../utils/scripts/index.ts';
import { Button } from '../button/index.ts';

interface DevisHeaderProps {
  onBack: () => void;
  progressPercent: number;
  projectedTotal: number;
  selectedTemplateTitle: string;
}

export function DevisHeader({
  onBack,
  progressPercent,
  projectedTotal,
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

      <section className="devisView__hero">
        <div>
          <p className="devisView__eyebrow">Commercial / Devis</p>
          <h1>Préparer un devis de bout en bout</h1>
          <p className="devisView__subtitle">
            Sélectionnez les expertises, qualifiez le besoin client et composez une proposition commerciale chiffrée.
          </p>
        </div>

        <div className="devisView__hero-kpis">
          <div>
            <span>Modèle sélectionné</span>
            <strong>{selectedTemplateTitle || 'Aucun modèle'}</strong>
          </div>
          <div>
            <span>Avancement</span>
            <strong>{progressPercent}% prêt</strong>
          </div>
          <div>
            <span>Projection</span>
            <strong>{formatCurrency(projectedTotal)}</strong>
          </div>
        </div>
      </section>
    </>
  );
}
