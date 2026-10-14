import type { ReactElement } from 'react';
import { MdArrowBack } from 'react-icons/md';
import { QUOTE_CAMPAIGN_TYPE_LABELS } from '../../../utils/scripts/index.ts';
import type { QuoteCampaignType } from '../../../utils/types/index.ts';
import { Button } from '../button/index.ts';

interface DevisHeaderProps {
  isEditing: boolean;
  campaignType: QuoteCampaignType;
  onBack: () => void;
  progressPercent: number;
  selectedTemplateTitle: string;
}

export function DevisHeader({
  isEditing,
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

      <section className={`devisView__hero${isEditing ? '' : ' devisView__hero--browse'}`}>
        <div>
          <p className="devisView__eyebrow">Commercial / Devis</p>
          <h1>{isEditing ? 'Préparer un devis de bout en bout' : 'Créer ou reprendre un devis'}</h1>
          <p className="devisView__subtitle">
            {isEditing ? 'Sélectionnez les expertises, qualifiez le besoin client et composez une proposition commerciale chiffrée.' : 'Commencez une nouvelle proposition ou retrouvez vos devis en cours.'}
          </p>
        </div>

        {isEditing && <div className="devisView__hero-kpis">
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
        </div>}
      </section>
    </>
  );
}
