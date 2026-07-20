import type { ReactElement } from 'react';
import { MdArrowBack } from 'react-icons/md';
import Select from 'react-select';
import type { ProspectsSignalesPageViewModel } from '../../../hooks/index.ts';
import type { SignalementType } from '../../../utils/types/index.ts';
import { reactSelectStyles } from '../../../utils/styles/index.ts';
import { BackToTop, Button, Header, SubNav } from '../index.ts';

interface ProspectsSignalesContentProps { viewModel: ProspectsSignalesPageViewModel; }

export function ProspectsSignalesContent({ viewModel }: ProspectsSignalesContentProps): ReactElement {
  const {
    error, formatDate, isLoading, navigateBack, page, pagination, refresh,
    rows, setPage, setType, type, typeOptions,
  } = viewModel;

  return (
    <div id="prospectsSignales">
      <Header />
      <SubNav />
      <main>
        <div className="prospectsSignales__container">
          <div className="prospectsSignales__header">
            <Button style="back" onClick={navigateBack}>
              <MdArrowBack />
              <span>Retour</span>
            </Button>
            <h1>Prospects signalés</h1>
            {pagination && (
              <span className="prospectsSignales__count">
                {pagination.total} résultat{pagination.total !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="prospectsSignales__filters">
            <div className="prospectsSignales__filter-group">
              <Select
                options={typeOptions}
                value={typeOptions.find(o => o.value === type) || typeOptions[0]}
                onChange={(option) => {
                  const value = (option as typeof typeOptions[number] | null)?.value ?? '';
                  setType(value as SignalementType | '');
                }}
                styles={reactSelectStyles}
                placeholder="Tous les signalements"
                isSearchable={false}
              />
            </div>
            <div className="prospectsSignales__filter-group">
              <Button style="grey" onClick={refresh} disabled={isLoading}>
                {isLoading ? 'Chargement...' : 'Rafraîchir'}
              </Button>
            </div>
          </div>

          {error && <p className="prospectsSignales__error">{error}</p>}

          {isLoading && rows.length === 0 ? (
            <p className="prospectsSignales__loading">Chargement...</p>
          ) : rows.length === 0 ? (
            <div className="prospectsSignales__empty">
              <p>Aucun prospect signalé.</p>
            </div>
          ) : (
            <>
              <div className="prospectsSignales__table-wrap">
                <table className="prospectsSignales__table">
                  <thead>
                    <tr>
                      <th>Raison sociale</th>
                      <th>Téléphone</th>
                      <th>Type</th>
                      <th>Date signalement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(row => {
                      const isDoublon = row.est_doublon;
                      const dateSignalement = isDoublon ? row.doublon_date : row.optout_date;

                      return (
                        <tr key={row.id_prospect}>
                          <td>{row.raison_sociale || '—'}</td>
                          <td>{row.telephone}</td>
                          <td>
                            <span className={`prospectsSignales__badge ${isDoublon ? 'prospectsSignales__badge--doublon' : 'prospectsSignales__badge--optout'}`}>
                              {isDoublon ? 'Doublon' : 'Opt-out'}
                            </span>
                          </td>
                          <td>{formatDate(dateSignalement)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="prospectsSignales__pagination">
                  <Button
                    style="grey"
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                  >
                    Précédent
                  </Button>
                  <span className="prospectsSignales__page-info">
                    Page {pagination.page}/{pagination.totalPages}
                  </span>
                  <Button
                    style="grey"
                    onClick={() => setPage(page + 1)}
                    disabled={page >= pagination.totalPages}
                  >
                    Suivant
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <BackToTop />
    </div>
  );
}
