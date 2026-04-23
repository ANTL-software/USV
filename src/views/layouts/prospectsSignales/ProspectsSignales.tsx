// styles
import './prospectsSignales.scss';

// hooks | library
import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import Select from 'react-select';
import WithAuth from '../../../utils/middleware/WithAuth';

// components
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

// hooks
import { useProspectsSignales } from '../../../hooks/useProspectsSignales';

// types
import type { SignalementType } from '../../../utils/types/prospect.types';
import reactSelectStyles from '../../../utils/styles/reactSelectStyles';

const TYPE_OPTIONS: { value: SignalementType | ''; label: string }[] = [
  { value: '', label: 'Tous les signalements' },
  { value: 'doublon', label: 'Doublons' },
  { value: 'optout', label: 'Opt-out' },
];

function ProspectsSignales(): ReactElement {
  const navigate = useNavigate();
  const {
    rows, pagination, isLoading, error,
    page, setPage, type, setType, refresh,
  } = useProspectsSignales();

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div id="prospectsSignales">
      <Header />
      <SubNav />
      <main>
        <div className="prospectsSignales__container">
          <div className="prospectsSignales__header">
            <Button style="back" onClick={() => navigate('/operations')}>
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
                options={TYPE_OPTIONS}
                value={TYPE_OPTIONS.find(o => o.value === type) || TYPE_OPTIONS[0]}
                onChange={(option) => {
                  const val = (option as typeof TYPE_OPTIONS[number] | null)?.value ?? '';
                  setType(val as SignalementType | '');
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
                      <th>Nom</th>
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
                          <td>
                            {row.prenom ? `${row.prenom} ` : ''}{row.nom}
                          </td>
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

const ProspectsSignalesWithAuth = WithAuth(ProspectsSignales);
export default ProspectsSignalesWithAuth;
