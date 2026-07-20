import type { ReactElement } from 'react';
import type { AbsenceManagementViewModel } from '../../../hooks/index.ts';
import { Button, Modal } from '../index.ts';

interface AbsenceRequestModalProps {
  viewModel: AbsenceManagementViewModel;
}

function AbsenceEditForm({ viewModel }: AbsenceRequestModalProps): ReactElement {
  const {
    editDateDebut,
    editDateFin,
    editHeureDebut,
    editHeureFin,
    saveModifications,
    selectedRequest,
    setEditDateDebut,
    setEditDateFin,
    setEditHeureDebut,
    setEditHeureFin,
    setIsEditingMode,
  } = viewModel;

  if (!selectedRequest) {
    return <></>;
  }

  const isHourly = selectedRequest.type_demande === 'heures';

  return (
    <div className="absenceDemandes__editForm">
      <div className="absenceDemandes__formGrid">
        <label className="absenceDemandes__formField">
          <span>Date de début</span>
          <input
            type="date"
            value={editDateDebut}
            onChange={(event) => {
              setEditDateDebut(event.target.value);
              if (isHourly) {
                setEditDateFin(event.target.value);
              }
            }}
          />
        </label>
        <label className="absenceDemandes__formField">
          <span>{isHourly ? 'Date concernée' : 'Date de fin'}</span>
          <input
            type="date"
            value={isHourly ? editDateDebut : editDateFin}
            onChange={(event) => setEditDateFin(event.target.value)}
            disabled={isHourly}
          />
        </label>
      </div>

      {isHourly && (
        <div className="absenceDemandes__formGrid">
          <label className="absenceDemandes__formField">
            <span>Heure de début</span>
            <input type="time" value={editHeureDebut} onChange={(event) => setEditHeureDebut(event.target.value)} />
          </label>
          <label className="absenceDemandes__formField">
            <span>Heure de fin</span>
            <input type="time" value={editHeureFin} onChange={(event) => setEditHeureFin(event.target.value)} />
          </label>
        </div>
      )}

      <div className="absenceDemandes__detailActions absenceDemandes__detailActions--spaced">
        <Button style="grey" onClick={() => setIsEditingMode(false)}>
          <span>Annuler</span>
        </Button>
        <Button style="gradient" onClick={() => void saveModifications()}>
          <span>Enregistrer</span>
        </Button>
      </div>
    </div>
  );
}

function AbsenceCancellationForm({ viewModel }: AbsenceRequestModalProps): ReactElement {
  const {
    confirmCancellation,
    motifAnnulation,
    setIsCancellingMode,
    setMotifAnnulation,
  } = viewModel;

  return (
    <div className="absenceDemandes__cancelForm">
      <label className="absenceDemandes__formField">
        <span>Motif d&apos;annulation</span>
        <textarea
          rows={4}
          value={motifAnnulation}
          onChange={(event) => setMotifAnnulation(event.target.value)}
          placeholder="Veuillez renseigner le motif d'annulation de cette absence..."
        />
      </label>

      <div className="absenceDemandes__detailActions absenceDemandes__detailActions--spaced">
        <Button style="grey" onClick={() => setIsCancellingMode(false)}>
          <span>Retour</span>
        </Button>
        <Button style="red" onClick={() => void confirmCancellation()}>
          <span>Confirmer l&apos;annulation</span>
        </Button>
      </div>
    </div>
  );
}

function AbsenceRequestDetails({ viewModel }: AbsenceRequestModalProps): ReactElement {
  const {
    activeTab,
    closeRequest,
    isUpdating,
    selectedRequestView,
    setIsCancellingMode,
    setIsEditingMode,
    updateStatus,
  } = viewModel;

  if (!selectedRequestView) {
    return <></>;
  }

  const { request } = selectedRequestView;
  const updateAndClose = async (status: 'validee' | 'refusee'): Promise<void> => {
    await updateStatus(request.id_demande, status);
    closeRequest();
  };

  return (
    <>
      <div className="absenceDemandes__detailGrid">
        <div className="absenceDemandes__detailCard">
          <span>Employé</span>
          <strong>{selectedRequestView.employeeName}</strong>
        </div>
        <div className="absenceDemandes__detailCard">
          <span>Statut</span>
          <strong className={`absenceDemandes__status absenceDemandes__status--${request.statut}`}>
            {selectedRequestView.statusLabel}
          </strong>
        </div>
        <div className="absenceDemandes__detailCard">
          <span>Période</span>
          <strong>{selectedRequestView.period}</strong>
        </div>
        <div className="absenceDemandes__detailCard">
          <span>Date de retour</span>
          <strong>{selectedRequestView.returnDate}</strong>
        </div>
        <div className="absenceDemandes__detailCard">
          <span>Créée le</span>
          <strong>{selectedRequestView.createdAt}</strong>
        </div>
        <div className="absenceDemandes__detailCard">
          <span>Traitée le</span>
          <strong>{selectedRequestView.processedAt}</strong>
        </div>
      </div>

      <div className="absenceDemandes__detailBlock">
        <span>Motif</span>
        <strong>{request.motif_label}</strong>
      </div>
      <div className="absenceDemandes__detailBlock">
        <span>Commentaire de la demande</span>
        <p>{request.description}</p>
      </div>

      {request.commentaire_validation && (
        <div className="absenceDemandes__detailBlock">
          <span>Commentaire de validation</span>
          <p>{request.commentaire_validation}</p>
        </div>
      )}
      {selectedRequestView.treatedBy && (
        <div className="absenceDemandes__detailBlock">
          <span>Traitée par</span>
          <p>{selectedRequestView.treatedBy}</p>
        </div>
      )}
      {request.motif_annulation && (
        <div className="absenceDemandes__detailBlock">
          <span>Motif d&apos;annulation</span>
          <p className="absenceDemandes__dangerText">{request.motif_annulation}</p>
        </div>
      )}

      <div className="absenceDemandes__detailActions absenceDemandes__detailActions--large">
        {activeTab === 'pending' && request.statut === 'demandee' && (
          <>
            <Button
              style="green"
              onClick={() => void updateAndClose('validee')}
              disabled={isUpdating === request.id_demande}
            >
              <span>Valider</span>
            </Button>
            <Button
              style="red"
              onClick={() => void updateAndClose('refusee')}
              disabled={isUpdating === request.id_demande}
            >
              <span>Refuser</span>
            </Button>
          </>
        )}
        <Button style="seaGreen" onClick={() => setIsEditingMode(true)}>
          <span>Modifier les dates</span>
        </Button>
        <Button style="red" onClick={() => setIsCancellingMode(true)}>
          <span>Annuler l&apos;absence</span>
        </Button>
      </div>
    </>
  );
}

export function AbsenceRequestModal({ viewModel }: AbsenceRequestModalProps): ReactElement {
  const {
    closeRequest,
    detailTitle,
    isCancellingMode,
    isEditingMode,
    selectedRequest,
  } = viewModel;

  return (
    <Modal isVisible={selectedRequest !== null} onClose={closeRequest} title={detailTitle}>
      {selectedRequest && (
        <div className="absenceDemandes__detail">
          {isEditingMode ? (
            <AbsenceEditForm viewModel={viewModel} />
          ) : isCancellingMode ? (
            <AbsenceCancellationForm viewModel={viewModel} />
          ) : (
            <AbsenceRequestDetails viewModel={viewModel} />
          )}
        </div>
      )}
    </Modal>
  );
}
