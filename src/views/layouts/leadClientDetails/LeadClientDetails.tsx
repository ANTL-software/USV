import { ReactElement, useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IoArrowBack,
  IoBusiness,
  IoCall,
  IoCalendarClear,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoHourglass,
  IoInformationCircle,
  IoPauseCircle,
  IoPerson,
  IoPrint,
} from 'react-icons/io5';
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import Loader from '../../components/loader/Loader';
import {
  getLeadClientByIdService,
  getLeadClientsByProspectService,
  getLeadClientDocumentUrl,
  updateLeadClientStatusService
} from '../../../API/services/lead.service.ts';
import { getProspectAppelsService } from '../../../API/services/prospect.service.ts';
import type { Appel, LeadClient, StatutRendezVous } from '../../../utils/types/index.ts';
import { STATUT_RENDEZ_VOUS_COLORS, STATUT_RENDEZ_VOUS_LABELS } from '../../../utils/types/index.ts';
import {
  formatDateShort,
  formatDurationFromSeconds,
  formatTime,
  getStatutAppelClass,
  getStatutAppelLabel,
} from '../../../utils/scripts/formatters.ts';
import { formatLeadClientReference, isLeadClientRendezVous } from '../../../utils/scripts/leadClients.ts';
import { showError, showSuccess } from '../../../utils/services/alertService.ts';

function formatDateTime(dateValue?: string | null, timeValue?: string | null): string {
  if (!dateValue) {
    return '—';
  }

  const isoCandidate = timeValue ? `${dateValue}T${timeValue}` : dateValue;
  const parsedDate = new Date(isoCandidate);

  if (Number.isNaN(parsedDate.getTime())) {
    return timeValue ? `${dateValue} ${timeValue}` : dateValue;
  }

  return parsedDate.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: timeValue ? '2-digit' : undefined,
    minute: timeValue ? '2-digit' : undefined,
  });
}

function formatProspectLabel(lead: LeadClient | null): string {
  if (!lead?.prospect) {
    return '—';
  }

  const raisonSociale = lead.prospect.raison_sociale?.trim();
  if (raisonSociale) {
    return raisonSociale;
  }

  const fullName = [lead.prospect.nom?.toUpperCase(), lead.prospect.prenom]
    .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    .join(' ');

  return fullName || `Prospect #${lead.prospect.id_prospect}`;
}

function formatAgentLabel(lead: LeadClient | null): string {
  if (!lead?.agent) {
    return '—';
  }

  return `${lead.agent.prenom} ${lead.agent.nom.toUpperCase()}`;
}

function resolveInterlocuteurNom(lead: LeadClient | null): string {
  return lead?.interlocuteur_nom
    ?? lead?.prospect?.decisionnaire_nom
    ?? lead?.prospect?.nom_contact
    ?? '—';
}

function resolveInterlocuteurRole(lead: LeadClient | null): string {
  return lead?.interlocuteur_role
    ?? lead?.prospect?.decisionnaire_fonction
    ?? '—';
}

function resolveInterlocuteurTelephone(lead: LeadClient | null): string {
  return lead?.telephone_contact_snapshot
    ?? lead?.prospect?.telephone_contact
    ?? lead?.prospect?.telephone
    ?? '—';
}

function resolveInterlocuteurEmail(lead: LeadClient | null): string {
  return lead?.email_contact_snapshot
    ?? lead?.prospect?.decisionnaire_email_pro
    ?? lead?.prospect?.email
    ?? '—';
}

function formatProspectAddress(lead: LeadClient | null): string {
  const adresse = lead?.prospect?.adresse_facturation?.trim();
  const codePostal = lead?.prospect?.code_postal?.trim();
  const ville = lead?.prospect?.ville?.trim();
  const pays = lead?.prospect?.pays?.trim();

  const locality = [codePostal, ville]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(' ');

  return [adresse, locality, pays]
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .join(', ') || '—';
}

function resolveAppelAgent(appel: Appel): string {
  const agent = appel.agent ?? appel.Employe;
  if (!agent) {
    return '—';
  }

  return `${agent.prenom} ${agent.nom.toUpperCase()}`;
}

function getLeadQualificationButtonClass(statut: StatutRendezVous): string {
  switch (statut) {
    case 'planifie':
      return 'qualif-btn--planifie';
    case 'effectue':
      return 'qualif-btn--effectue';
    case 'annule':
      return 'qualif-btn--annule';
    case 'reporte':
      return 'qualif-btn--reporte';
    case 'non_honore':
      return 'qualif-btn--non-honore';
    default:
      return '';
  }
}

function renderLeadQualificationIcon(statut: StatutRendezVous): ReactElement {
  switch (statut) {
    case 'planifie':
      return <IoHourglass />;
    case 'effectue':
      return <IoCheckmarkCircle />;
    case 'annule':
      return <IoCloseCircle />;
    case 'reporte':
      return <IoCalendarClear />;
    case 'non_honore':
      return <IoPauseCircle />;
    default:
      return <IoInformationCircle />;
  }
}

const LEAD_QUALIFICATION_OPTIONS: StatutRendezVous[] = [
  'effectue',
  'planifie',
  'reporte',
  'annule',
  'non_honore',
];

export default function LeadClientDetails(): ReactElement {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const idLead = Number(id);

  const [lead, setLead] = useState<LeadClient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [appels, setAppels] = useState<Appel[]>([]);
  const [appelsLoading, setAppelsLoading] = useState(false);
  const [appelsError, setAppelsError] = useState<string | null>(null);
  const [appelsPage, setAppelsPage] = useState(1);
  const [appelsTotalPages, setAppelsTotalPages] = useState(1);
  const [appelsTotal, setAppelsTotal] = useState(0);

  const [leadHistory, setLeadHistory] = useState<LeadClient[]>([]);
  const [leadHistoryLoading, setLeadHistoryLoading] = useState(false);
  const [leadHistoryError, setLeadHistoryError] = useState<string | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<StatutRendezVous | null>(null);

  const loadLead = useCallback(async () => {
    if (Number.isNaN(idLead)) {
      setError('ID de rendez-vous client invalide');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getLeadClientByIdService(idLead);

      if (!isLeadClientRendezVous(result.motif)) {
        throw new Error('Ce rendez-vous ne correspond pas à un rendez-vous client MMA');
      }

      setLead(result);
    } catch (loadError) {
      console.error(loadError);
      setError(loadError instanceof Error ? loadError.message : 'Impossible de récupérer le rendez-vous client');
    } finally {
      setLoading(false);
    }
  }, [idLead]);

  const loadAppels = useCallback(async (page: number = 1, currentLead?: LeadClient | null) => {
    const leadToUse = currentLead ?? lead;
    const prospectId = leadToUse?.prospect?.id_prospect;
    const campagneId = leadToUse?.id_campagne;

    if (!prospectId || !campagneId) {
      return;
    }

    setAppelsLoading(true);
    setAppelsError(null);

    try {
      const result = await getProspectAppelsService(prospectId, {
        page,
        limit: 5,
        campagne: campagneId,
      });
      setAppels(result.appels);
      setAppelsPage(result.page);
      setAppelsTotalPages(result.totalPages);
      setAppelsTotal(result.total);
    } catch (loadError) {
      console.error(loadError);
      setAppelsError(loadError instanceof Error ? loadError.message : 'Erreur lors du chargement des appels');
    } finally {
      setAppelsLoading(false);
    }
  }, [lead]);

  const loadLeadHistory = useCallback(async (currentLead?: LeadClient | null) => {
    const leadToUse = currentLead ?? lead;
    const prospectId = leadToUse?.prospect?.id_prospect;
    const campagneId = leadToUse?.id_campagne;

    if (!prospectId || !campagneId) {
      return;
    }

    setLeadHistoryLoading(true);
    setLeadHistoryError(null);

    try {
      const result = await getLeadClientsByProspectService(prospectId, {
        limit: 100,
        campagne: campagneId,
      });

      const filteredHistory = result
        .filter((rendezVous) =>
          rendezVous.id_lead !== leadToUse?.id_lead
          && isLeadClientRendezVous(rendezVous.motif)
        )
        .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime());

      setLeadHistory(filteredHistory);
    } catch (loadError) {
      console.error(loadError);
      setLeadHistoryError(loadError instanceof Error ? loadError.message : 'Erreur lors du chargement des rendez-vous');
    } finally {
      setLeadHistoryLoading(false);
    }
  }, [lead]);

  useEffect(() => {
    loadLead();
  }, [loadLead]);

  useEffect(() => {
    if (!lead) {
      return;
    }

    loadAppels(1, lead);
    loadLeadHistory(lead);
  }, [lead, loadAppels, loadLeadHistory]);

  const handleLeadStatusUpdate = useCallback(async (statut: StatutRendezVous) => {
    if (!lead || lead.statut === statut || statusUpdateLoading !== null) {
      return;
    }

    setStatusUpdateLoading(statut);

    try {
      const updatedLead = await updateLeadClientStatusService(lead.id_lead, statut);
      setLead(updatedLead);
      showSuccess(`Rendez-vous client passé en "${STATUT_RENDEZ_VOUS_LABELS[statut]}".`);
    } catch (updateError) {
      console.error(updateError);
      showError(updateError instanceof Error ? updateError.message : 'Erreur lors de la mise à jour du statut');
    } finally {
      setStatusUpdateLoading(null);
    }
  }, [lead, statusUpdateLoading]);

  const handlePrintLeadDocument = useCallback(() => {
    if (!lead) {
      return;
    }

    window.open(getLeadClientDocumentUrl(lead.id_lead), '_blank', 'noopener,noreferrer');
  }, [lead]);

  if (loading) {
    return (
      <div id="commandeDetails">
        <Header />
        <SubNav />
        <main className="commandeDetails__loading">
          <Loader message="Chargement du rendez-vous client..." />
        </main>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div id="commandeDetails">
        <Header />
        <SubNav />
        <main>
          <div className="commandeDetails__container">
            <div className="commandeDetails__header">
              <Button style="back" onClick={() => navigate('/operations/commandes')}>
                <IoArrowBack /> Retour
              </Button>
            </div>
            <div className="commandeDetails__error">
              <h3>Erreur de chargement</h3>
              <p>{error || 'Rendez-vous introuvable'}</p>
              <Button style="gradient" onClick={() => navigate('/operations/commandes')}>
                Retour aux rendez-vous
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div id="commandeDetails">
      <Header />
      <SubNav />
      <main>
        <div className="commandeDetails__container">
          <div className="commandeDetails__header">
            <Button style="back" onClick={() => navigate('/operations/commandes')}>
              <IoArrowBack /> Retour
            </Button>
            <h2>Rendez-vous client {formatLeadClientReference(lead.id_lead)}</h2>
            <span
              className={`statut-badge statut-badge--${lead.statut}`}
              style={{ backgroundColor: STATUT_RENDEZ_VOUS_COLORS[lead.statut] }}
            >
              {STATUT_RENDEZ_VOUS_LABELS[lead.statut]}
            </span>
          </div>

          <div className="commandeDetails__content">
            <div className="commandeDetails__left">
              <section className="details-section card-style">
                <h3 className="section-title"><IoBusiness /> Client & contact</h3>
                <div className="details-grid">
                  <div className="grid-item full-width">
                    <span className="grid-label">Client</span>
                    <span className="grid-value grid-value--bold">{formatProspectLabel(lead)}</span>
                  </div>
                  <div className="grid-item">
                    <span className="grid-label">Interlocuteur</span>
                    <span className="grid-value"><IoPerson style={{ fontSize: '0.9em', marginRight: '4px' }} />{resolveInterlocuteurNom(lead)}</span>
                  </div>
                  <div className="grid-item">
                    <span className="grid-label">Fonction</span>
                    <span className="grid-value">{resolveInterlocuteurRole(lead)}</span>
                  </div>
                  <div className="grid-item">
                    <span className="grid-label">Téléphone</span>
                    <span className="grid-value">{resolveInterlocuteurTelephone(lead)}</span>
                  </div>
                  <div className="grid-item">
                    <span className="grid-label">Email</span>
                    <span className="grid-value">{resolveInterlocuteurEmail(lead)}</span>
                  </div>
                  <div className="grid-item full-width">
                    <span className="grid-label">Adresse</span>
                    <span className="grid-value">{formatProspectAddress(lead)}</span>
                  </div>
                </div>
              </section>

              <section className="details-section card-style">
                <h3 className="section-title"><IoInformationCircle /> Informations du rendez-vous</h3>
                <div className="details-grid">
                  <div className="grid-item">
                    <span className="grid-label">Date de prise</span>
                    <span className="grid-value">{formatDateTime(lead.created_at)}</span>
                  </div>
                  <div className="grid-item">
                    <span className="grid-label">Rendez-vous client</span>
                    <span className="grid-value">{formatDateTime(lead.date_rdv, lead.heure_rdv)}</span>
                  </div>
                  <div className="grid-item">
                    <span className="grid-label">Commercial</span>
                    <span className="grid-value">{formatAgentLabel(lead)}</span>
                  </div>
                  <div className="grid-item">
                    <span className="grid-label">Campagne</span>
                    <span className="grid-value">{lead.campagne?.nom_campagne ?? '—'}</span>
                  </div>
                  <div className="grid-item full-width">
                    <span className="grid-label">Motif</span>
                    <span className="grid-value">{lead.motif ?? '—'}</span>
                  </div>
                  {lead.notes && (
                    <div className="grid-item full-width">
                      <span className="grid-label">Notes du rendez-vous</span>
                      <p className="notes-text">{lead.notes}</p>
                    </div>
                  )}
                  {lead.derniere_note_closing && (
                    <div className="grid-item full-width">
                      <span className="grid-label">Dernière note de closing (campagne)</span>
                      <p className="notes-text">{lead.derniere_note_closing}</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="details-section card-style">
                <h3 className="section-title"><IoCall /> Historique des appels campagne ({appelsTotal})</h3>
                {appelsLoading && <Loader message="Chargement des appels..." />}
                {appelsError && <p className="history-error">{appelsError}</p>}
                {!appelsLoading && !appelsError && appels.length === 0 && (
                  <p className="history-empty">Aucun appel enregistré pour ce prospect sur cette campagne.</p>
                )}
                {!appelsLoading && !appelsError && appels.length > 0 && (
                  <div className="appels-history-list">
                    {appels.map((appel) => (
                      <div key={appel.id_appel} className="appel-history-item">
                        <div className="appel-history-header">
                          <div className="appel-history-meta">
                            <span className="appel-history-date">{formatDateShort(appel.created_at)}</span>
                            <span className="appel-history-time">{formatTime(appel.created_at)}</span>
                          </div>
                          <span className={`appel-history-status status-badge-${getStatutAppelClass(appel.statut_appel)}`}>
                            {getStatutAppelLabel(appel.statut_appel)}
                          </span>
                        </div>
                        <div className="appel-history-body">
                          <div className="appel-history-details">
                            <span><strong>Durée :</strong> {formatDurationFromSeconds(appel.duree_secondes)}</span>
                            <span><strong>Agent :</strong> {resolveAppelAgent(appel)}</span>
                          </div>
                          {appel.notes && (
                            <p className="appel-history-notes">{appel.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}

                    {appelsTotalPages > 1 && (
                      <div className="appels-history-pagination">
                        <button
                          className="pag-btn"
                          onClick={() => loadAppels(appelsPage - 1)}
                          disabled={appelsPage === 1}
                        >
                          Précédent
                        </button>
                        <span className="pag-info">Page {appelsPage} sur {appelsTotalPages}</span>
                        <button
                          className="pag-btn"
                          onClick={() => loadAppels(appelsPage + 1)}
                          disabled={appelsPage === appelsTotalPages}
                        >
                          Suivant
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </section>

              <section className="details-section card-style">
                <h3 className="section-title"><IoCall /> Historique des rendez-vous client ({leadHistory.length})</h3>
                {leadHistoryLoading && <Loader message="Chargement des rendez-vous..." />}
                {leadHistoryError && <p className="history-error">{leadHistoryError}</p>}
                {!leadHistoryLoading && !leadHistoryError && leadHistory.length === 0 && (
                  <p className="history-empty">Aucun autre rendez-vous client sur cette campagne pour ce prospect.</p>
                )}
                {!leadHistoryLoading && !leadHistoryError && leadHistory.length > 0 && (
                  <div className="ventes-history-list">
                    {leadHistory.map((historyItem) => (
                      <div key={historyItem.id_lead} className="vente-history-item">
                        <div className="vente-history-header">
                          <div className="vente-history-info">
                            <span className="vente-history-date">{formatDateShort(historyItem.created_at)}</span>
                            <span className="vente-history-ref">{formatLeadClientReference(historyItem.id_lead)}</span>
                            <span className="vente-history-amount">{formatDateTime(historyItem.date_rdv, historyItem.heure_rdv)}</span>
                          </div>
                          <div className="vente-history-actions">
                            <span
                              className="statut-badge statut-badge--mini"
                              style={{ backgroundColor: STATUT_RENDEZ_VOUS_COLORS[historyItem.statut] }}
                            >
                              {STATUT_RENDEZ_VOUS_LABELS[historyItem.statut]}
                            </span>
                          </div>
                        </div>
                        <div className="vente-history-details-expanded">
                          <p className="vente-history-agent">
                            <strong>Commercial :</strong> {historyItem.agent ? `${historyItem.agent.prenom} ${historyItem.agent.nom.toUpperCase()}` : '—'}
                          </p>
                          <p className="vente-history-notes">
                            <strong>Interlocuteur :</strong> {historyItem.interlocuteur_nom ?? '—'}
                          </p>
                          {historyItem.notes && (
                            <p className="vente-history-notes">
                              <strong>Notes :</strong> {historyItem.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <aside className="commandeDetails__right">
              <div className="aside-card card-style">
                <h3>Qualification</h3>
                <p className="aside-hint">Définir l'état opérationnel du rendez-vous client :</p>
                <div className="qualification-buttons">
                  {LEAD_QUALIFICATION_OPTIONS.map((statut) => (
                    <button
                      key={statut}
                      type="button"
                      onClick={() => void handleLeadStatusUpdate(statut)}
                      className={`qualif-btn ${getLeadQualificationButtonClass(statut)} ${lead.statut === statut ? 'active' : ''}`}
                      disabled={statusUpdateLoading !== null}
                    >
                      {renderLeadQualificationIcon(statut)}
                      <span>
                        {STATUT_RENDEZ_VOUS_LABELS[statut]}
                        {statusUpdateLoading === statut ? '...' : ''}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="aside-card card-style">
                <h3>Actions du rendez-vous</h3>
                <div className="aside-actions-list">
                  <Button
                    style="gradient"
                    onClick={handlePrintLeadDocument}
                    className="action-btn-aside"
                  >
                    <IoPrint />
                    <span>Réimprimer la fiche du rendez-vous</span>
                  </Button>
                </div>

                <div className="aside-divider"></div>

                <h4>Document du rendez-vous</h4>
                <div className="upload-zone-disabled">
                  <IoInformationCircle className="info-icon" />
                  <p>L'upload d'un document lié sera activé dans une prochaine itération.</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}
