import type { ReactElement } from 'react';
import type { ProspectEnrichmentViewModel } from '../../../hooks/index.ts';
import { formatEnrichmentValue } from '../../../utils/scripts/index.ts';

type ProspectEnrichmentSearchProps = Pick<
  ProspectEnrichmentViewModel,
  | 'results'
  | 'search'
  | 'searchError'
  | 'searchLoading'
  | 'selectedLabel'
  | 'selectedProspectId'
  | 'selectProspect'
  | 'setSearch'
>;

export function ProspectEnrichmentSearch({
  results,
  search,
  searchError,
  searchLoading,
  selectedLabel,
  selectedProspectId,
  selectProspect,
  setSearch,
}: ProspectEnrichmentSearchProps): ReactElement {
  const hasQuery = search.trim().length >= 2;

  return (
    <section className="prospectEnrichment__searchCard">
      <div className="prospectEnrichment__searchRow">
        <div className="prospectEnrichment__searchField">
          <label htmlFor="prospect-enrichment-search">Rechercher un prospect</label>
          <input
            id="prospect-enrichment-search"
            type="text"
            placeholder="Raison sociale, nom, email, SIRET, ville, ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <div className="prospectEnrichment__selected">
          <span className="prospectEnrichment__selectedLabel">Prospect chargé</span>
          <strong>{selectedLabel}</strong>
        </div>
      </div>

      {searchError && <div className="prospectEnrichment__error">{searchError}</div>}
      <div className="prospectEnrichment__results">
        {searchLoading ? (
          <p className="prospectEnrichment__muted">Recherche en cours...</p>
        ) : !hasQuery ? (
          <p className="prospectEnrichment__muted">Saisissez au moins 2 caractères pour lancer une recherche.</p>
        ) : results.length === 0 ? (
          <p className="prospectEnrichment__muted">Aucun prospect trouvé.</p>
        ) : (
          results.map((prospect) => (
            <button
              key={prospect.id_prospect}
              type="button"
              className={`prospectEnrichment__resultItem${selectedProspectId === prospect.id_prospect ? ' prospectEnrichment__resultItem--active' : ''}`}
              onClick={() => selectProspect(prospect.id_prospect)}
            >
              <span className="prospectEnrichment__resultIdentity">
                <strong>{prospect.raison_sociale || `${prospect.nom} ${prospect.prenom ?? ''}`.trim()}</strong>
                <span>#{prospect.id_prospect} · {formatEnrichmentValue(prospect.ville)} · {formatEnrichmentValue(prospect.code_postal)}</span>
              </span>
              <code>{prospect.telephone}</code>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
