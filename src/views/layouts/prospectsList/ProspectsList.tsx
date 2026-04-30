import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { MdArrowBack, MdDeleteSweep, MdDelete } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Modal from '../../components/modal/Modal';
import Button from '../../components/button/Button';
import { useProspectsCampagne } from '../../../hooks/useProspectsCampagne';
import { getCampagneByIdService } from '../../../API/services/campagne.service';
import { purgeProspectsService, getProspectsCountService } from '../../../API/services/queue.service';
import type { ProspectsCount } from '../../../API/services/queue.service';
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

const isMobilePhone = (tel: string): boolean => /^(\+33|0033|0)[67]/.test(tel);

const ProspectsList = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const campagneId = id ? parseInt(id, 10) : null;
  const [campagneNom, setCampagneNom] = useState<string>('');
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeLoading, setPurgeLoading] = useState(false);
  const [purgeError, setPurgeError] = useState<string | null>(null);
  const [counts, setCounts] = useState<ProspectsCount>({ fixe: 0, mobile: 0, total: 0 });

  // Sélection multiple pour suppression
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [prospectToDelete, setProspectToDelete] = useState<number | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState(false);

  const {
    rows, pagination, isLoading, error,
    page, setPage, statut, setStatut,
    search, setSearch, refresh, removeProspect,
  } = useProspectsCampagne(campagneId);

  useEffect(() => {
    if (!campagneId) return;
    getCampagneByIdService(campagneId)
      .then(c => setCampagneNom(c.toJSON().nom_campagne))
      .catch(() => {});
    getProspectsCountService(campagneId)
      .then(setCounts)
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
      getProspectsCountService(campagneId).then(setCounts).catch(() => {});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la purge';
      setPurgeError(msg);
    } finally {
      setPurgeLoading(false);
    }
  };

  // Gestion de la sélection/désélection d'un prospect
  const toggleSelection = useCallback((id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  }, []);

  // Gestion de la sélection/désélection de tous les prospects de la page
  const toggleSelectAll = useCallback(() => {
    const allIds = rows.map(r => r.id_prospection);
    setSelectedIds(prev => {
      const allSelected = allIds.every(id => prev.includes(id));
      return allSelected ? [] : allIds;
    });
  }, [rows]);

  // Vérifier si tous les prospects de la page sont sélectionnés
  const allSelected = rows.length > 0 && rows.every(r => selectedIds.includes(r.id_prospection));
  const someSelected = selectedIds.length > 0;

  // Ouvrir la modal de suppression individuelle
  const openSingleDeleteModal = (id: number) => {
    setProspectToDelete(id);
    setIsBulkDelete(false);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  // Ouvrir la modal de suppression groupée
  const openBulkDeleteModal = () => {
    setIsBulkDelete(true);
    setDeleteError(null);
    setShowDeleteModal(true);
  };

  // Handler de suppression
  const handleDelete = async () => {
    if (!campagneId) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      if (isBulkDelete) {
        // Suppression groupée
        await Promise.all(selectedIds.map(id => removeProspect(id)));
        setSelectedIds([]);
      } else if (prospectToDelete) {
        // Suppression individuelle
        await removeProspect(prospectToDelete);
      }
      setShowDeleteModal(false);
      setProspectToDelete(null);
      refresh();
      getProspectsCountService(campagneId).then(setCounts).catch(() => {});
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setDeleteError(msg);
    } finally {
      setDeleteLoading(false);
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
            <div className="prospectsList__counters">
              <span className="prospectsList__counter prospectsList__counter--fixe">
                {counts.fixe} ligne{counts.fixe !== 1 ? 's' : ''} fixe{counts.fixe !== 1 ? 's' : ''}
              </span>
              <span className="prospectsList__counter prospectsList__counter--mobile">
                {counts.mobile} ligne{counts.mobile !== 1 ? 's' : ''} mobile{counts.mobile !== 1 ? 's' : ''}
              </span>
              <span className="prospectsList__counter-info">
                Les lignes mobiles ne seront pas envoyées en liste d&apos;appels.
              </span>
            </div>
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
                  onChange={(option) => {
                    const val = (option as typeof STATUT_OPTIONS[number] | null)?.value ?? '';
                    setStatut(val as StatutProspection | '');
                  }}
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
              {someSelected && (
                <div className="prospectsList__filter-group">
                  <Button
                    style="orange"
                    onClick={openBulkDeleteModal}
                    disabled={isLoading}
                  >
                    <MdDelete /> Supprimer ({selectedIds.length})
                  </Button>
                </div>
              )}
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
                        <th className="prospectsList__checkbox-col">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={toggleSelectAll}
                            aria-label="Sélectionner tous les prospects"
                          />
                        </th>
                        <th>Nom</th>
                        <th>Téléphone</th>
                        <th>Statut file</th>
                        <th>Tentatives</th>
                        <th>Date injection</th>
                        <th className="prospectsList__actions-col">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(r => (
                        <tr key={r.id_prospection}>
                          <td className="prospectsList__checkbox-col">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(r.id_prospection)}
                              onChange={() => toggleSelection(r.id_prospection)}
                              aria-label={`Sélectionner ${r.prospect?.prenom} ${r.prospect?.nom}`}
                            />
                          </td>
                          <td>{r.prospect?.prenom} {r.prospect?.nom}</td>
                          <td>
                            <span className={r.prospect?.telephone && isMobilePhone(r.prospect.telephone) ? 'prospectsList__mobile' : ''}>
                              {r.prospect?.telephone}
                            </span>
                            {r.prospect?.telephone && isMobilePhone(r.prospect.telephone) && (
                              <span className="prospectsList__mobile-tag">Mobile</span>
                            )}
                          </td>
                          <td>
                            <span className={`prospectsList__badge prospectsList__badge--${r.statut}`}>
                              {STATUT_LABELS[r.statut] || r.statut}
                            </span>
                          </td>
                          <td>{r.nb_tentatives}/{r.max_tentatives}</td>
                          <td>{new Date(r.date_injection).toLocaleDateString('fr-FR')}</td>
                          <td className="prospectsList__actions-col">
                            <Button
                              style="red"
                              onClick={() => openSingleDeleteModal(r.id_prospection)}
                            >
                              <MdDelete />
                            </Button>
                          </td>
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

      <Modal
        isVisible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={isBulkDelete ? 'Supprimer les prospects sélectionnés' : 'Retirer ce prospect de la campagne'}
      >
        <div className="prospectsList__modal-delete">
          {isBulkDelete ? (
            <>
              <p>
                Cette action va retirer <strong>{selectedIds.length} prospect(s)</strong> de la campagne
                {campagneNom ? ` « ${campagneNom} »` : ` #${id}`}.
              </p>
            </>
          ) : (
            <p>
              Ce prospect sera retiré de la campagne
              {campagneNom ? ` « ${campagneNom} »` : ` #${id}`}.
            </p>
          )}
          <p className="prospectsList__purge-warning">Cette action est irréversible.</p>
          {deleteError && <p className="prospectsList__error">{deleteError}</p>}
          <div className="prospectsList__modal-actions">
            <Button style="grey" onClick={() => setShowDeleteModal(false)} disabled={deleteLoading}>
              Annuler
            </Button>
            <Button style="red" onClick={handleDelete} disabled={deleteLoading}>
              {deleteLoading ? 'Suppression...' : 'Confirmer'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const ProspectsListWithAuth = WithAuth(ProspectsList);
export default ProspectsListWithAuth;
