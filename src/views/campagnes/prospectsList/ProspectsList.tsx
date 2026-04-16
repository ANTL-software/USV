import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { MdArrowBack, MdDeleteSweep } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';
import Header from '../../../components/header/Header';
import SubNav from '../../../components/subNav/SubNav';
import BackToTop from '../../../components/backToTop/BackToTop';
import Modal from '../../../components/modal/Modal';
import Button from '../../../components/button/Button';
import { useProspectsCampagne } from '../../../hooks/useProspectsCampagne';
import { getCampagneByIdService } from '../../../API/services/campagne.service';
import { purgeProspectsService } from '../../../API/services/queue.service';
import reactSelectStyles from '../../../utils/styles/reactSelectStyles';
import type { StatutProspection } from '../../../utils/types/queue.types';
import './prospectsList.scss';

const STATUT_LABELS: Record<StatutProspection, string> = {
  en_attente: 'En attente',
  assigne: 'Assigné',
  en_cours: 'En cours',
  traite: 'Traité',
  rappeler: 'À rappeler',
  refuse: 'Refusé',
};

const STATUT_OPTIONS: { value: StatutProspection | ''; label: string }[] = [
  { value: '', label: 'Tous les statuts' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'assigne', label: 'Assigné' },
  { value: 'en_cours', label: 'En cours' },
  { value: 'traite', label: 'Traité' },
  { value: 'rappeler', label: 'À rappeler' },
  { value: 'refuse', label: 'Refusé' },
];

const ProspectsList = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const campagneId = id ? parseInt(id, 10) : null;
  const [campagneNom, setCampagneNom] = useState<string>('');
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeLoading, setPurgeLoading] = useState(false);
  const [purgeError, setPurgeError] = useState<string | null>(null);

  const {
    rows, pagination, isLoading, error,
    page, setPage, statut, setStatut,
    search, setSearch, refresh,
  } = useProspectsCampagne(campagneId);

  useEffect(() => {
    if (!campagneId) return;
    getCampagneByIdService(campagneId)
      .then(c => setCampagneNom(c.toJSON().nom_campagne))
      .catch(() => {});
  }, [campagneId]);

  const handlePurge = async () => {
    if (!campagneId) return;
    setPurgeLoading(true);
    setPurgeError(null);
    try {
      await purgeProspectsService(campagneId);
      setShowPurgeModal(false);
      refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la purge';
      setPurgeError(msg);
    } finally {
      setPurgeLoading(false);
    }
  };

  return (
    <div id="prospectsList">
      <Header />
      <SubNav />
      <main>
        <div className="prospectsList__container">
          <div className="prospectsList__header">
            <Button style="back" onClick={() => navigate(`/campagnes/${id}`)}>
              <MdArrowBack /> Retour
            </Button>
            <h2>Prospects injectés — Campagne #{id}{campagneNom ? ` — ${campagneNom}` : ''}</h2>
          </div>

          <div className="prospectsList__content">
            <div className="prospectsList__filters">
              <div className="prospectsList__filter-group">
                <input
                  type="text"
                  className="prospectsList__search"
                  placeholder="Rechercher nom, prénom, téléphone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="prospectsList__filter-group">
                <Select
                  options={STATUT_OPTIONS}
                  value={STATUT_OPTIONS.find(o => o.value === statut) || STATUT_OPTIONS[0]}
                  onChange={(option) => setStatut((option?.value ?? '') as StatutProspection | '')}
                  styles={reactSelectStyles}
                  placeholder="Tous les statuts"
                  isSearchable={false}
                />
              </div>
              <div className="prospectsList__filter-group">
                <Button style="grey" onClick={refresh} disabled={isLoading}>
                  {isLoading ? 'Chargement...' : 'Rafraîchir'}
                </Button>
              </div>
              <div className="prospectsList__filter-group">
                <Button
                  style="red"
                  onClick={() => setShowPurgeModal(true)}
                  disabled={isLoading || rows.length === 0}
                >
                  <MdDeleteSweep /> Vider la liste
                </Button>
              </div>
            </div>

            {error && <p className="prospectsList__error">{error}</p>}

            {isLoading && rows.length === 0 ? (
              <p className="prospectsList__loading">Chargement...</p>
            ) : rows.length === 0 ? (
              <p className="prospectsList__empty">Aucun prospect trouvé.</p>
            ) : (
              <>
                <div className="prospectsList__table-wrap">
                  <table className="prospectsList__table">
                    <thead>
                      <tr>
                        <th>Nom</th>
                        <th>Téléphone</th>
                        <th>Statut file</th>
                        <th>Tentatives</th>
                        <th>Date injection</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(r => (
                        <tr key={r.id_prospection}>
                          <td>{r.prospect?.prenom} {r.prospect?.nom}</td>
                          <td>{r.prospect?.telephone}</td>
                          <td>
                            <span className={`prospectsList__badge prospectsList__badge--${r.statut}`}>
                              {STATUT_LABELS[r.statut] || r.statut}
                            </span>
                          </td>
                          <td>{r.nb_tentatives}/{r.max_tentatives}</td>
                          <td>{new Date(r.date_injection).toLocaleDateString('fr-FR')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {pagination && pagination.totalPages > 1 && (
                  <div className="prospectsList__pagination">
                    <Button
                      style="grey"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                    >
                      Précédent
                    </Button>
                    <span className="prospectsList__page-info">
                      Page {pagination.page}/{pagination.totalPages} — {pagination.total} résultats
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
        </div>
      </main>
      <BackToTop />

      <Modal
        isVisible={showPurgeModal}
        onClose={() => setShowPurgeModal(false)}
        title="Vider la liste des prospects"
      >
        <div className="prospectsList__modal-purge">
          <p>
            Cette action va retirer <strong>tous les prospects</strong> de la campagne
            {campagneNom ? ` « ${campagneNom} »` : ` #${id}`}.
          </p>
          <p className="prospectsList__purge-warning">Cette action est irréversible.</p>
          {purgeError && <p className="prospectsList__error">{purgeError}</p>}
          <div className="prospectsList__modal-actions">
            <Button style="grey" onClick={() => setShowPurgeModal(false)} disabled={purgeLoading}>
              Annuler
            </Button>
            <Button style="red" onClick={handlePurge} disabled={purgeLoading}>
              {purgeLoading ? 'Purge en cours...' : 'Confirmer la purge'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const ProspectsListWithAuth = WithAuth(ProspectsList);
export default ProspectsListWithAuth;
