import './absenceDemandes.scss';

import { ReactElement, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdArrowBack } from 'react-icons/md';
import Select from 'react-select';
import WithAuth from '../../../utils/middleware/WithAuth';

import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import Modal from '../../components/modal/Modal';
import {
  getActiveAbsenceRequestsService,
  getAllAbsenceRequestsService,
  getPendingAbsenceRequestsService,
  updateAbsenceRequestStatusService
} from '../../../API/services/absence.service';
import { getAllEmployesService } from '../../../API/services/user.service';
import type { AbsenceRequest } from '../../../utils/types/absence.types';
import { showError, showSuccess } from '../../../utils/services/alertService';
import type { UserModel } from '../../../API/models/user.model';
import { useNotifications } from '../../../hooks/useNotifications';

const formatPeriod = (request: AbsenceRequest): string => {
  if (request.type_demande === 'heures') {
    return `${request.date_debut} • ${request.heure_debut?.slice(0, 5)} - ${request.heure_fin?.slice(0, 5)}`;
  }
  return request.date_debut === request.date_fin
    ? request.date_debut
    : `${request.date_debut} au ${request.date_fin}`;
};

const getReturnDate = (request: AbsenceRequest): string => {
  const returnDate = new Date(`${request.date_fin}T00:00:00`);
  returnDate.setDate(returnDate.getDate() + 1);
  return returnDate.toLocaleDateString('fr-FR');
};

const formatDateTime = (value?: string | null): string => {
  if (!value) return 'Non renseigné';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('fr-FR');
};

function AbsenceDemandes(): ReactElement {
  const navigate = useNavigate();
  const { refreshNotifications } = useNotifications();
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'all'>('active');
  const [activeRequests, setActiveRequests] = useState<AbsenceRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<AbsenceRequest[]>([]);
  const [allRequests, setAllRequests] = useState<AbsenceRequest[]>([]);
  const [employes, setEmployes] = useState<UserModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'demandee' | 'validee' | 'refusee'>('all');
  const [selectedEmployeId, setSelectedEmployeId] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<AbsenceRequest | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [activeData, pendingData, allData, employesData] = await Promise.all([
        getActiveAbsenceRequestsService(),
        getPendingAbsenceRequestsService(),
        getAllAbsenceRequestsService(),
        getAllEmployesService(),
      ]);
      setActiveRequests(activeData);
      setPendingRequests(pendingData);
      setAllRequests(allData);
      setEmployes(employesData);
    } catch (error) {
      await showError(error instanceof Error ? error.message : 'Impossible de charger les demandes d’absence', 'Erreur');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleStatusUpdate = async (requestId: number, statut: 'validee' | 'refusee') => {
    try {
      setIsUpdating(requestId);
      await updateAbsenceRequestStatusService(requestId, statut);
      await showSuccess(`Demande ${statut === 'validee' ? 'validée' : 'refusée'} avec succès.`, 'Absence');
      await loadData();
      void refreshNotifications();
    } catch (error) {
      await showError(error instanceof Error ? error.message : 'Impossible de mettre à jour la demande', 'Erreur');
    } finally {
      setIsUpdating(null);
    }
  };

  const employeOptions = useMemo(() => [
    { value: null, label: 'Tous les employés' },
    ...employes
      .filter((employe) => employe.actif)
      .sort((a, b) => {
        const prenomCompare = a.prenom.localeCompare(b.prenom, 'fr', { sensitivity: 'base' });
        if (prenomCompare !== 0) return prenomCompare;
        return a.nom.localeCompare(b.nom, 'fr', { sensitivity: 'base' });
      })
      .map((employe) => ({
        value: employe.id_employe,
        label: `(${employe.id_employe}) ${employe.prenom} ${employe.nom}`,
      })),
  ], [employes]);

  const statusOptions = useMemo(() => ([
    { value: 'all', label: 'Tous les statuts' },
    { value: 'demandee', label: 'Demandée' },
    { value: 'validee', label: 'Validée' },
    { value: 'refusee', label: 'Refusée' },
  ]), []);

  const baseRequests = useMemo(() => {
    if (activeTab === 'active') return activeRequests;
    if (activeTab === 'pending') return pendingRequests;
    return allRequests;
  }, [activeRequests, activeTab, allRequests, pendingRequests]);

  const requests = useMemo(() => {
    return baseRequests.filter((request) => {
      if (statusFilter !== 'all' && request.statut !== statusFilter) return false;
      if (selectedEmployeId !== null && request.id_employe !== selectedEmployeId) return false;
      if (dateFrom && request.date_fin < dateFrom) return false;
      if (dateTo && request.date_debut > dateTo) return false;
      return true;
    });
  }, [baseRequests, dateFrom, dateTo, selectedEmployeId, statusFilter]);

  const detailTitle = selectedRequest
    ? `Demande d’absence - ${selectedRequest.employe
      ? `${selectedRequest.employe.prenom} ${selectedRequest.employe.nom}`
      : `Employé #${selectedRequest.id_employe}`}`
    : 'Détail de la demande';

  return (
    <div id="absenceDemandes">
      <Header />
      <SubNav />
      <main>
        <div className="absenceDemandes__container">
          <div className="absenceDemandes__back">
            <Button style="back" onClick={() => navigate('/operations')}>
              <MdArrowBack />
              <span>Retour</span>
            </Button>
          </div>

          <div className="absenceDemandes__header">
            <div>
              <h1>Demandes d&apos;absence</h1>
              <p>Suivi des absences en cours et traitement des nouvelles demandes.</p>
            </div>
            <div className="absenceDemandes__tabs">
              <button
                type="button"
                className={activeTab === 'active' ? 'is-active' : ''}
                onClick={() => setActiveTab('active')}
              >
                Absences en cours
              </button>
              <button
                type="button"
                className={activeTab === 'pending' ? 'is-active' : ''}
                onClick={() => setActiveTab('pending')}
              >
                Demandes à traiter
              </button>
              <button
                type="button"
                className={activeTab === 'all' ? 'is-active' : ''}
                onClick={() => setActiveTab('all')}
              >
                Toutes les demandes
              </button>
            </div>
          </div>

          <div className="absenceDemandes__filters">
            <label className="absenceDemandes__filter">
              <span>Statut</span>
              <Select
                classNamePrefix="reactSelect"
                options={statusOptions}
                value={statusOptions.find((option) => option.value === statusFilter) ?? statusOptions[0]}
                onChange={(option) => setStatusFilter((option?.value ?? 'all') as 'all' | 'demandee' | 'validee' | 'refusee')}
                isSearchable={false}
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 100000 }),
                }}
              />
            </label>

            <label className="absenceDemandes__filter">
              <span>Employé</span>
              <Select
                classNamePrefix="reactSelect"
                options={employeOptions}
                value={employeOptions.find((option) => option.value === selectedEmployeId) ?? employeOptions[0]}
                onChange={(option) => setSelectedEmployeId(option?.value ?? null)}
                isSearchable
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 100000 }),
                }}
              />
            </label>

            <label className="absenceDemandes__filter">
              <span>Du</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
              />
            </label>

            <label className="absenceDemandes__filter">
              <span>Au</span>
              <input
                type="date"
                value={dateTo}
                onChange={(event) => setDateTo(event.target.value)}
              />
            </label>
          </div>

          {isLoading ? (
            <div className="absenceDemandes__state">Chargement...</div>
          ) : requests.length === 0 ? (
            <div className="absenceDemandes__state">
              {activeTab === 'active'
                ? 'Aucune absence en cours.'
                : activeTab === 'pending'
                  ? 'Aucune demande en attente de validation.'
                  : 'Aucune demande ne correspond aux filtres.'}
            </div>
          ) : (
            <div className="absenceDemandes__tableWrapper">
              <table className="absenceDemandes__table">
                <thead>
                  <tr>
                    <th>Qui</th>
                    <th>Période</th>
                    <th>Motif</th>
                    <th>Date de retour</th>
                    {(activeTab === 'pending' || activeTab === 'all') && <th>Statut</th>}
                    {activeTab === 'pending' && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr
                      key={request.id_demande}
                      className="absenceDemandes__row"
                      onClick={() => setSelectedRequest(request)}
                    >
                      <td>
                        {('employe' in request && request.employe)
                          ? `${request.employe.prenom} ${request.employe.nom}`
                          : `Employé #${request.id_employe}`}
                      </td>
                      <td>{formatPeriod(request)}</td>
                      <td>
                        <div className="absenceDemandes__motif">
                          <strong>{request.motif_label}</strong>
                          <span>{request.description}</span>
                        </div>
                      </td>
                      <td>{getReturnDate(request)}</td>
                      {(activeTab === 'pending' || activeTab === 'all') && (
                        <td>
                          <span className={`absenceDemandes__status absenceDemandes__status--${request.statut}`}>
                            {request.statut === 'demandee' ? 'Demandée' : request.statut === 'validee' ? 'Validée' : 'Refusée'}
                          </span>
                        </td>
                      )}
                      {activeTab === 'pending' && (
                        <td>
                          <div className="absenceDemandes__actions">
                            <Button
                              style="green"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleStatusUpdate(request.id_demande, 'validee');
                              }}
                              disabled={isUpdating === request.id_demande}
                            >
                              <span>Valider</span>
                            </Button>
                            <Button
                              style="red"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleStatusUpdate(request.id_demande, 'refusee');
                              }}
                              disabled={isUpdating === request.id_demande}
                            >
                              <span>Refuser</span>
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <BackToTop />

      <Modal
        isVisible={selectedRequest !== null}
        onClose={() => setSelectedRequest(null)}
        title={detailTitle}
      >
        {selectedRequest && (
          <div className="absenceDemandes__detail">
            <div className="absenceDemandes__detailGrid">
              <div className="absenceDemandes__detailCard">
                <span>Employé</span>
                <strong>
                  {selectedRequest.employe
                    ? `${selectedRequest.employe.prenom} ${selectedRequest.employe.nom}`
                    : `Employé #${selectedRequest.id_employe}`}
                </strong>
              </div>

              <div className="absenceDemandes__detailCard">
                <span>Statut</span>
                <strong className={`absenceDemandes__status absenceDemandes__status--${selectedRequest.statut}`}>
                  {selectedRequest.statut === 'demandee'
                    ? 'Demandée'
                    : selectedRequest.statut === 'validee'
                      ? 'Validée'
                      : 'Refusée'}
                </strong>
              </div>

              <div className="absenceDemandes__detailCard">
                <span>Période</span>
                <strong>{formatPeriod(selectedRequest)}</strong>
              </div>

              <div className="absenceDemandes__detailCard">
                <span>Date de retour</span>
                <strong>{getReturnDate(selectedRequest)}</strong>
              </div>

              <div className="absenceDemandes__detailCard">
                <span>Créée le</span>
                <strong>{formatDateTime(selectedRequest.created_at)}</strong>
              </div>

              <div className="absenceDemandes__detailCard">
                <span>Traitée le</span>
                <strong>{formatDateTime(selectedRequest.date_traitement)}</strong>
              </div>
            </div>

            <div className="absenceDemandes__detailBlock">
              <span>Motif</span>
              <strong>{selectedRequest.motif_label}</strong>
            </div>

            <div className="absenceDemandes__detailBlock">
              <span>Commentaire de la demande</span>
              <p>{selectedRequest.description}</p>
            </div>

            {selectedRequest.commentaire_validation && (
              <div className="absenceDemandes__detailBlock">
                <span>Commentaire de validation</span>
                <p>{selectedRequest.commentaire_validation}</p>
              </div>
            )}

            {selectedRequest.traitant && (
              <div className="absenceDemandes__detailBlock">
                <span>Traitée par</span>
                <p>{selectedRequest.traitant.prenom} {selectedRequest.traitant.nom}</p>
              </div>
            )}

            {activeTab === 'pending' && selectedRequest.statut === 'demandee' && (
              <div className="absenceDemandes__detailActions">
                <Button
                  style="green"
                  onClick={async () => {
                    await handleStatusUpdate(selectedRequest.id_demande, 'validee');
                    setSelectedRequest(null);
                  }}
                  disabled={isUpdating === selectedRequest.id_demande}
                >
                  <span>Valider</span>
                </Button>
                <Button
                  style="red"
                  onClick={async () => {
                    await handleStatusUpdate(selectedRequest.id_demande, 'refusee');
                    setSelectedRequest(null);
                  }}
                  disabled={isUpdating === selectedRequest.id_demande}
                >
                  <span>Refuser</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

const AbsenceDemandesWithAuth = WithAuth(AbsenceDemandes);
export default AbsenceDemandesWithAuth;
