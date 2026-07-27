import type { ChangeEvent, ReactElement } from 'react';
import { Button } from '../button/index.ts';
import type { Campagne, ProspectEnrichmentRun } from '../../../utils/types/index.ts';

interface ProspectEnrichmentBatchProps {
  batchCampaignId: number | null;
  batchLimit: number;
  batchLoading: boolean;
  batchReference: string;
  batchRuns: ProspectEnrichmentRun[];
  campagnes: Campagne[];
  campagnesLoading: boolean;
  createBatchRun: () => Promise<void>;
  updateBatchRun: (id: number, action: 'start' | 'cancel' | 'delete') => Promise<void>;
  setBatchCampaignId: (id: number | null) => void;
  setBatchLimit: (limit: number) => void;
  setBatchReference: (value: string) => void;
}

const getStatusLabel = (status: ProspectEnrichmentRun['statut']): string => ({
  en_attente: 'En attente', en_cours: 'En cours', pause: 'En pause', termine: 'Terminé', echec: 'En erreur', annule: 'Annulé',
}[status]);

export function ProspectEnrichmentBatch({
  batchCampaignId, batchLimit, batchLoading, batchReference, batchRuns, campagnes, campagnesLoading,
  createBatchRun, updateBatchRun, setBatchCampaignId, setBatchLimit, setBatchReference,
}: ProspectEnrichmentBatchProps): ReactElement {
  const onCampaignChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const value = Number(event.target.value);
    setBatchCampaignId(Number.isInteger(value) && value > 0 ? value : null);
  };

  return (
    <section className="prospectEnrichment__batchCard" aria-labelledby="prospect-enrichment-batch-title">
      <div>
        <span className="prospectEnrichment__batchBadge">Lot ciblé</span>
        <h2 id="prospect-enrichment-batch-title">Enrichir les fiches d’une campagne</h2>
        <p>Seules les fiches B2B injectées dans la campagne sont prises en compte. Les fiches déjà étiquetées sont exclues ; seules les erreurs techniques restent relançables.</p>
      </div>
      <div className="prospectEnrichment__batchFields">
        <label>
          Campagne
          <select value={batchCampaignId ?? ''} onChange={onCampaignChange} disabled={campagnesLoading || batchLoading}>
            <option value="">Sélectionner une campagne</option>
            {campagnes.map((campagne) => <option key={campagne.id_campagne} value={campagne.id_campagne}>{campagne.nom_campagne}</option>)}
          </select>
        </label>
        <label>
          Référence du lot
          <input value={batchReference} onChange={(event) => setBatchReference(event.target.value)} placeholder="ex. cigales-juillet-2026" disabled={batchLoading} />
        </label>
        <label>
          Fiches maximum
          <input type="number" min="1" max="100000" value={batchLimit} onChange={(event) => setBatchLimit(Number(event.target.value) || 1)} disabled={batchLoading} />
        </label>
        <Button style="green" onClick={() => void createBatchRun()} disabled={batchLoading || !batchCampaignId}>Créer le lot</Button>
      </div>
      {batchRuns.length > 0 && (
        <div className="prospectEnrichment__batchRuns">
          {batchRuns.slice(0, 5).map((run) => <div key={run.id_enrichissement_lot}>
            <strong>{run.reference}</strong><span>{run.nom_campagne} · {getStatusLabel(run.statut)}</span>
            <small>{run.total_traite} / {run.total_cible} traitées · {run.total_echecs_techniques} échec(s) technique(s)</small>
            {(run.statut === 'termine' || run.statut === 'annule') && <div className="prospectEnrichment__batchSummary">
              <strong>Bilan {run.statut === 'annule' ? 'à l’arrêt' : 'final'}</strong>
              <span>{run.total_enrichi} enrichies · {run.total_faible_confiance} à faible confiance · {run.total_echecs_techniques} échec(s) technique(s)</span>
              <small>Limite demandée : {run.limite_prospects} fiche(s) · {run.total_traite} tentative(s) réellement effectuée(s)</small>
            </div>}
            <div className="prospectEnrichment__batchRunActions">
              {run.statut === 'en_attente' && <><Button style="green" onClick={() => void updateBatchRun(run.id_enrichissement_lot, 'start')} disabled={batchLoading}>Démarrer</Button><Button style="red" onClick={() => void updateBatchRun(run.id_enrichissement_lot, 'delete')} disabled={batchLoading}>Supprimer</Button></>}
              {run.statut === 'en_cours' && <Button style="red" onClick={() => void updateBatchRun(run.id_enrichissement_lot, 'cancel')} disabled={batchLoading}>Annuler</Button>}
            </div>
          </div>)}
        </div>
      )}
    </section>
  );
}
