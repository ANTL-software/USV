import type { ReactElement } from 'react';
import { MdArrowBack } from 'react-icons/md';
import { QUOTE_CAMPAIGN_TYPE_LABELS } from '../../../utils/scripts/index.ts';
import type { QuoteCampaignType } from '../../../utils/types/index.ts';
import { Button } from '../button/index.ts';

interface DevisHeaderProps {
  campaignType: QuoteCampaignType;
  onBack: () => void;
  progressPercent: number;
  selectedTemplateTitle: string;
}

export function DevisHeader({
  campaignType,
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
            <span>Modèle tarifaire</span>
            <strong>{QUOTE_CAMPAIGN_TYPE_LABELS[campaignType]}</strong>
          </div>
        </div>
      </section>
    </>
  );
}
