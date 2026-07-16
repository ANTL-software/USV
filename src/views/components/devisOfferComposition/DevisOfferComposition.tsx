import type { ReactElement } from 'react';
import { MdFactCheck } from 'react-icons/md';
import type { QuoteLine } from '../../../utils/types/index.ts';
import { DevisLineList } from '../devisLineList/index.ts';

interface DevisOfferCompositionProps {
  includedLines: QuoteLine[];
  lineSelection: Record<string, boolean>;
  onLineToggle: (lineId: string) => void;
  optionLines: QuoteLine[];
  selectedTemplatePromise: string;
}

export function DevisOfferComposition({
  includedLines,
  lineSelection,
  onLineToggle,
  optionLines,
  selectedTemplatePromise,
}: DevisOfferCompositionProps): ReactElement {
  return (
    <article className="devisView__panel">
      <div className="devisView__panel-header">
        <MdFactCheck />
        <div>
          <h2>3. Composition de l’offre</h2>
          <p>Activez le socle et les options qui composent le périmètre commercial.</p>
        </div>
      </div>

      <div className="devisView__offer-columns">
        <section>
          <div className="devisView__section-title">
            <strong>Inclus dans la proposition</strong>
            <span>{selectedTemplatePromise || 'Sélectionnez un modèle pour composer le périmètre.'}</span>
          </div>
          <DevisLineList lines={includedLines} selection={lineSelection} onToggle={onLineToggle} />
        </section>

        <section>
          <div className="devisView__section-title">
            <strong>Options commerciales</strong>
            <span>Modules complémentaires à activer selon l’ambition du client.</span>
          </div>
          <DevisLineList lines={optionLines} selection={lineSelection} onToggle={onLineToggle} />
        </section>
      </div>
    </article>
  );
}
