import './prospectsView.scss';

import { ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoChevronBack, IoChevronForward, IoAddCircleOutline, IoTrashOutline } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import Select from 'react-select';
import WithAuth from '../../../utils/middleware/WithAuth';

import { useCampagnes, useProspects } from '../../../hooks';
import type { Prospect } from '../../../utils/types/prospect.types';
import { ProspectDetailModal } from '../../../components/prospectDetailModal';
import { QueuePreview } from '../../../components/queuePreview/QueuePreview';

import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import { useAlert } from '../../../context/alert/AlertContext';
import { purgeProspectsService } from '../../../API/services/queue.service';

function ProspectsView(): ReactElement {
  const navigate = useNavigate();
  const { campagnes } = useCampagnes();
  const {
    prospects,
    pagination,
    isLoading,
    error,
    selectedCampagne,
    setSelectedCampagne,
    currentPage,
    setCurrentPage,
    search,
    setSearch,
    refresh,
  } = useProspects(campagnes);

  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);
  const [jumpToPage, setJumpToPage] = useState<string>('');
  const [isPurging, setIsPurging] = useState(false);
  const [queueRefreshKey, setQueueRefreshKey] = useState(0);
  const { showConfirm, showSuccess, showError } = useAlert();

  const handleRefreshAll = () => {
    refresh();
    setQueueRefreshKey(prev => prev + 1);
  };

  const handlePurge = async () => {
    if (!selectedCampagne) return;

    const confirm = await showConfirm(
      `Êtes-vous sûr de vouloir vider la table d'appel pour la campagne "${selectedCampagne.nom_campagne}" ? Tous les prospects seront retirés de la file d'appels. Cette action est irréversible.\n\n⚠️ Note : Les rendez-vous déjà pris avec ces prospects resteront visibles dans les calendriers et pourront toujours être honorés.`,
      "Vider la table d'appel"
    );

    if (confirm) {
      setIsPurging(true);
      try {
        await purgeProspectsService(selectedCampagne.id_campagne);
        await showSuccess(
          "Tous les prospects ont été retirés de la file d'appels.",
          "File d'appels vidée"
        );
        handleRefreshAll();
      } catch (err: any) {
        await showError(
          err.message || "Impossible de vider la file d'appels.",
          "Erreur"
        );
      } finally {
        setIsPurging(false);
      }
    }
  };

  const campagneOptions = [
    { value: null, label: 'Tous' },
    ...campagnes.map(c => ({ value: c, label: c.nom_campagne })),
  ];

  const selectedCampagneOption = campagneOptions.find(o => o.value === selectedCampagne);

  const handleRowClick = (prospect: Prospect) => {
    setSelectedProspect(prospect);
  };

  const handlePreviousPage = () => {
    if (pagination && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination && currentPage < pagination.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getStatutBadgeClass = (statut: string): string => {
    switch (statut) {
      case 'nouveau': return 'badge--nouveau';
      case 'contacte': return 'badge--contacte';
      case 'interesse': return 'badge--interesse';
      case 'rappel': return 'badge--rappel';
      case 'non_interesse': return 'badge--non_interesse';
      case 'vente_conclue': return 'badge--vente_conclue';
      default: return '';
    }
  };

  const getTypeBadgeClass = (type: string): string => {
    return type === 'Entreprise' ? 'badge--entreprise' : 'badge--particulier';
  };

  const getPhoneTypeBadgeClass = (type: string): string => {
    switch (type) {
      case 'mobile': return 'badge--mobile';
      case 'fixe': return 'badge--fixe';
      case 'voip': return 'badge--voip';
      default: return 'badge--inconnu';
    }
  };

  const getStatutCampagneBadgeClass = (statut: string): string => {
    switch (statut) {
      case 'en_attente': return 'badge--en_attente';
      case 'assigne': return 'badge--assigne';
      case 'en_cours': return 'badge--en_cours';
      case 'traite': return 'badge--traite';
      case 'rappeler': return 'badge--rappeler';
      case 'refuse': return 'badge--refuse';
      default: return '';
    }
  };

  const getTentativesBadgeClass = (attempts: number): string => {
    if (attempts === 0) return 'badge--interesse';
    if (attempts <= 2) return 'badge--rappel';
    return 'badge--non_interesse';
  };

  const getMaturiteBadgeClass = (maturite: string): string => {
    return maturite === 'client' ? 'badge--client' : 'badge--prospect';
  };

  return (
    <div id="prospectsView">
      <Header />
      <SubNav />
      <main>
        <div className="prospectsView__container">
          <div className="prospectsView__back">
            <Button style="back" onClick={() => navigate('/operations')}>
              <MdArrowBack />
              <span>Retour</span>
            </Button>
          </div>

          <div className="prospectsView__header">
            <div className="prospectsView__title-section">
              <h1>Prospects</h1>
              <Button style="grey" onClick={() => navigate('/operations/prospects/enrichissement')}>
                <span>Enrichissement de donnée Prospect</span>
              </Button>
              {selectedCampagne && (
                <>
                  <Button style="gradient" onClick={() => navigate(`/operations/prospect/${selectedCampagne.id_campagne}/inject`)}>
                    <IoAddCircleOutline />
                    <span>Injecter des prospects</span>
                  </Button>
                  <Button style="red" onClick={handlePurge} disabled={isPurging}>
                    <IoTrashOutline style={{ color: '#ffffff' }} />
                    <span style={{ color: '#ffffff' }}>Vider la table d'appel</span>
                  </Button>
                </>
              )}
            </div>
            <div className="prospectsView__filters">
              <div className="prospectsView__filter">
                <label htmlFor="campagne-select">Campagne :</label>
                <Select
                  inputId="campagne-select"
                  options={campagneOptions}
                  value={selectedCampagneOption}
                  onChange={opt => setSelectedCampagne(opt?.value ?? null)}
                  placeholder="Choisir..."
                  isSearchable={false}
                  classNamePrefix="reactSelect"
                />
              </div>
              <div className="prospectsView__search">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && <div className="prospectsView__error">{error}</div>}

          {selectedCampagne && (
            <QueuePreview
              idCampagne={selectedCampagne.id_campagne}
              onOpenProspect={setSelectedProspect}
              refreshKey={queueRefreshKey}
            />
          )}

          <div className="prospectsView__table-wrapper">
            {isLoading ? (
              <div className="prospectsView__loading">Chargement...</div>
            ) : prospects.length === 0 ? (
              <div className="prospectsView__empty">
                {selectedCampagne
                  ? `Aucun prospect trouvé pour la campagne "${selectedCampagne.nom_campagne}"`
                  : 'Aucun prospect trouvé'
                }
              </div>
            ) : (
              <>
                <table className="prospectsView__table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'center' }}>ID</th>
                      <th>Nom</th>
                      <th>Téléphone</th>
                      {!selectedCampagne && <th>Email</th>}
                      <th>Ville</th>
                      {!selectedCampagne && <th>Pays</th>}
                      <th>{selectedCampagne ? 'Statut Prospect' : 'Statut'}</th>
                      <th>Maturité commerciale</th>
                      {selectedCampagne && <th>Statut Appel</th>}
                      {selectedCampagne && <th style={{ textAlign: 'center' }}>Tentatives</th>}
                      {selectedCampagne && <th>Dernier appel</th>}
                      <th>Agent assigné</th>
                      {selectedCampagne && <th>Date injection</th>}
                      {!selectedCampagne && <th>Type</th>}
                      {!selectedCampagne && <th>Activité</th>}
                      {!selectedCampagne && <th>Date création</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {prospects.map(prospect => (
                      <tr
                        key={prospect.id_prospect}
                        onClick={() => handleRowClick(prospect)}
                        className={prospect.est_doublon || prospect.optout ? 'prospectsView__row--alert' : ''}
                      >
                        <td className="prospectsView__id" style={{ textAlign: 'center' }}>
                          <code>{prospect.id_prospect}</code>
                        </td>
                        <td className="prospectsView__name">
                          {prospect.type_prospect === 'Entreprise' && prospect.raison_sociale
                            ? prospect.raison_sociale
                            : `${prospect.nom.toUpperCase()}${prospect.prenom ? ` ${prospect.prenom}` : ''}`
                          }
                        </td>
                        <td className="prospectsView__phone">
                          <code>{prospect.telephone}</code>
                          <span className={`badge ${getPhoneTypeBadgeClass(prospect.type_telephone)}`}>
                            {prospect.type_telephone}
                          </span>
                        </td>
                        {!selectedCampagne && (
                          <td className="prospectsView__email">
                            {prospect.email ? (
                              <a href={`mailto:${prospect.email}`} onClick={e => e.stopPropagation()}>
                                {prospect.email}
                              </a>
                            ) : '—'}
                          </td>
                        )}
                        <td className="prospectsView__location">
                          {prospect.ville ? (
                            <>
                              {prospect.code_postal ? `${prospect.code_postal} ` : ''}
                              {prospect.ville}
                            </>
                          ) : '—'}
                        </td>
                        {!selectedCampagne && <td>{prospect.pays || '—'}</td>}
                        <td>
                          <span className={`badge ${getStatutBadgeClass(prospect.statut)}`}>
                            {prospect.statut.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td>
                          {prospect.maturite_commerciale ? (
                            <span className={`badge ${getMaturiteBadgeClass(prospect.maturite_commerciale)}`}>
                              {prospect.maturite_commerciale}
                            </span>
                          ) : '—'}
                        </td>
                        {selectedCampagne && (
                          <td>
                            <span className={`badge ${getStatutCampagneBadgeClass(prospect.statut_campagne || '')}`}>
                              {(prospect.statut_campagne || 'en_attente').replace(/_/g, ' ')}
                            </span>
                          </td>
                        )}
                        {selectedCampagne && (
                          <td style={{ textAlign: 'center' }}>
                            <span className={`badge ${getTentativesBadgeClass(prospect.nb_tentatives || 0)}`}>
                              {prospect.nb_tentatives ?? 0} / {prospect.max_tentatives ?? 5}
                            </span>
                          </td>
                        )}
                        {selectedCampagne && (
                          <td className="prospectsView__date">
                            {prospect.derniere_tentative
                              ? new Date(prospect.derniere_tentative).toLocaleString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : '—'
                            }
                          </td>
                        )}
                          <td>
                            {prospect.agent_assigne
                              ? `${prospect.agent_assigne.nom.toUpperCase()} ${prospect.agent_assigne.prenom || ''}`
                              : '—'
                            }
                          </td>
                        {selectedCampagne && (
                          <td className="prospectsView__date">
                            {prospect.date_injection
                              ? new Date(prospect.date_injection).toLocaleDateString('fr-FR')
                              : '—'
                            }
                          </td>
                        )}
                        {!selectedCampagne && (
                          <td>
                            <span className={`badge ${getTypeBadgeClass(prospect.type_prospect)}`}>
                              {prospect.type_prospect}
                            </span>
                          </td>
                        )}
                        {!selectedCampagne && <td>{prospect.activite || '—'}</td>}
                        {!selectedCampagne && (
                          <td className="prospectsView__date">
                            {new Date(prospect.created_at).toLocaleDateString('fr-FR')}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {pagination && pagination.totalPages > 1 && (
                  <div className="prospectsView__pagination">
                    <button
                      className="pagination-btn"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      <IoChevronBack />
                      Précédent
                    </button>
                    <div className="pagination-center">
                      <span className="pagination-info">
                        Page <input
                          type="number"
                          min="1"
                          max={pagination.totalPages}
                          value={jumpToPage}
                          onChange={e => setJumpToPage(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              const page = parseInt(jumpToPage, 10);
                              if (page >= 1 && page <= pagination.totalPages) {
                                setCurrentPage(page);
                                setJumpToPage('');
                              }
                            }
                          }}
                          placeholder={currentPage.toString()}
                          className="pagination-jump-input"
                        /> sur {pagination.totalPages}
                      </span>
                      <span className="pagination-total">({pagination.total} prospects)</span>
                    </div>
                    <button
                      className="pagination-btn"
                      onClick={handleNextPage}
                      disabled={currentPage === pagination.totalPages}
                    >
                      Suivant
                      <IoChevronForward />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
      <BackToTop />

      {selectedProspect && (
        <ProspectDetailModal
          prospect={selectedProspect}
          onClose={() => setSelectedProspect(null)}
          onProspectUpdated={handleRefreshAll}
        />
      )}
    </div>
  );
}

const ProspectsViewWithAuth = WithAuth(ProspectsView);
export default ProspectsViewWithAuth;
