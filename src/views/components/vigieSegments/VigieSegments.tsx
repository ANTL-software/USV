import type { ReactElement } from 'react';
import { IoAnalyticsOutline } from 'react-icons/io5';

import type { VigieViewState } from '../../../hooks/index.ts';
import { VIGIE_SEGMENT_LABELS, formatVigieNumber, formatVigiePercent, formatVigiePerThousand } from '../../../utils/scripts/index.ts';
import type { VigieSegmentDimension } from '../../../utils/types/index.ts';

interface VigieSegmentsProps {
  state: VigieViewState;
}

export function VigieSegments({ state }: VigieSegmentsProps): ReactElement | null {
  if (!state.snapshot) return null;
  return (
    <section className="vigieView__panel vigieView__segments">
      <div className="vigieView__panel-title"><IoAnalyticsOutline /><div><h2>Comparer les segments</h2><p>Repérer des écarts, sans conclure lorsque l’échantillon est trop petit.</p></div></div>
      <div className="vigieView__tabs" role="tablist" aria-label="Dimensions de segmentation">
        {(Object.keys(VIGIE_SEGMENT_LABELS) as VigieSegmentDimension[]).map((dimension) => <button key={dimension} type="button" role="tab" aria-selected={state.segmentDimension === dimension} className={state.segmentDimension === dimension ? 'vigieView__tab--active' : ''} onClick={() => state.setSegmentDimension(dimension)}>{VIGIE_SEGMENT_LABELS[dimension]}</button>)}
      </div>
      <div className="vigieView__table-wrap"><table>
        <thead><tr><th>Segment</th><th>Prospects</th><th>Appels</th><th>Contact humain</th><th>{state.snapshot.resultat_metier.libelle_pluriel}</th><th>Pour 1 000 appels</th><th>File prête</th><th>Lecture</th></tr></thead>
        <tbody>{state.selectedSegments.map((segment) => <tr key={`${segment.dimension}-${segment.libelle}`}><td><strong>{segment.libelle}</strong></td><td>{formatVigieNumber(segment.prospects)}</td><td>{formatVigieNumber(segment.appels)}</td><td>{formatVigiePercent(segment.taux_contact_humain)}</td><td>{formatVigieNumber(segment.resultats)}</td><td>{formatVigiePerThousand(segment.resultats_pour_1000_appels)}</td><td>{formatVigieNumber(segment.fiches_pretes)}</td><td><span className={`vigieView__sample vigieView__sample--${segment.echantillon_suffisant ? 'ok' : 'limited'}`}>{segment.echantillon_suffisant ? 'Interprétable' : 'À confirmer'}</span></td></tr>)}</tbody>
      </table></div>
    </section>
  );
}
