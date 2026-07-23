import type { ReactElement } from 'react';
import type { ProspectEnrichmentViewModel } from '../../../hooks/index.ts';
import {
  buildEnrichmentComparisonFieldViews,
  formatEnrichmentKeyLabel,
  formatEnrichmentSourceOrigin,
} from '../../../utils/scripts/index.ts';
import { Button } from '../index.ts';

type ProspectEnrichmentPreviewProps = Pick<
  ProspectEnrichmentViewModel,
  | 'applyEnrichment'
  | 'applyLoading'
  | 'clearPreview'
  | 'preview'
  | 'previewEnrichment'
  | 'previewLoading'
  | 'snapshot'
>;

export function ProspectEnrichmentPreview({
  applyEnrichment,
  applyLoading,
  clearPreview,
  preview,
  previewEnrichment,
  previewLoading,
  snapshot,
}: ProspectEnrichmentPreviewProps): ReactElement | null {
  if (!snapshot) {
    return null;
  }

  const comparisonFields = preview
    ? buildEnrichmentComparisonFieldViews(snapshot, preview.proposed_snapshot)
    : [];

  return (
    <>
      <section className="prospectEnrichment__actionBar">
        <div className="prospectEnrichment__actionText">
          <strong>Déclencher une recherche d’enrichissement</strong>
          <span>L’action génère une proposition. Rien n’est sauvegardé tant que vous ne l’avez pas validée.</span>
        </div>
        <div className="prospectEnrichment__actionButtons">
          <Button style="gradient" onClick={() => void previewEnrichment()} disabled={previewLoading || applyLoading}>
            <span>{previewLoading ? 'Analyse en cours...' : 'Enrichir'}</span>
          </Button>
          {preview && (
            <Button style="white" onClick={clearPreview} disabled={applyLoading}>
              <span>Annuler la proposition</span>
            </Button>
          )}
        </div>
      </section>

      {preview && (
        <section className="prospectEnrichment__previewCard">
          <div className="prospectEnrichment__previewHeader">
            <div>
              <h2>Contrôle humain avant enregistrement</h2>
              <p>Vérifiez les données proposées avant de les sauvegarder dans les champs d’enrichissement.</p>
            </div>
            <div className="prospectEnrichment__previewButtons">
              <Button style="green" onClick={() => void applyEnrichment()} disabled={applyLoading}>
                <span>{applyLoading ? 'Enregistrement...' : 'Valider et enregistrer'}</span>
              </Button>
            </div>
          </div>

          <div className="prospectEnrichment__previewMeta">
            <span><strong>Champs modifiés :</strong> {preview.changed_fields.length}</span>
            {preview.metadata.official_company_resolved_by && (
              <span><strong>Résolution légale :</strong> {formatEnrichmentSourceOrigin(preview.metadata.official_company_resolved_by)}</span>
            )}
            {typeof preview.metadata.official_company_match_score === 'number' && (
              <span><strong>Score match société :</strong> {preview.metadata.official_company_match_score}</span>
            )}
          </div>

          <div className="prospectEnrichment__previewDiff">
            <div className="prospectEnrichment__previewColumn">
              <h3>État actuel</h3>
              <dl>
                {comparisonFields.map((field) => (
                  <div key={field.label}><dt>{field.label}</dt><dd>{field.currentValue}</dd></div>
                ))}
              </dl>
            </div>
            <div className="prospectEnrichment__previewColumn prospectEnrichment__previewColumn--proposed">
              <h3>Proposition à enregistrer</h3>
              <dl>
                {comparisonFields.map((field) => (
                  <div key={field.label}><dt>{field.label}</dt><dd>{field.proposedValue}</dd></div>
                ))}
              </dl>
            </div>
          </div>

          <div className="prospectEnrichment__validationGrid">
            <div className="prospectEnrichment__validationCard">
              <h3>Pourquoi ce score ?</h3>
              {preview.metadata.evidence_breakdown && Object.keys(preview.metadata.evidence_breakdown).length > 0 ? (
                <ul className="prospectEnrichment__scoreList">
                  {Object.entries(preview.metadata.evidence_breakdown).map(([key, value]) => (
                    <li key={key}><span>{formatEnrichmentKeyLabel(key)}</span><strong>{value}</strong></li>
                  ))}
                </ul>
              ) : (
                <p className="prospectEnrichment__muted">Aucun détail de score disponible.</p>
              )}
            </div>
            <div className="prospectEnrichment__validationCard">
              <h3>Signaux de sourcing</h3>
              <ul className="prospectEnrichment__scoreList">
                <li><span>Candidats site web</span><strong>{preview.metadata.website_candidates_count ?? 0}</strong></li>
                <li><span>Candidats LinkedIn entreprise</span><strong>{preview.metadata.linkedin_company_candidates_count ?? 0}</strong></li>
                <li><span>Candidats LinkedIn décideur</span><strong>{preview.metadata.linkedin_decision_maker_candidates_count ?? 0}</strong></li>
              </ul>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
