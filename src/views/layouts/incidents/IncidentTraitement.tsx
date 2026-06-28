import './incidents.scss';

import { FormEvent, ReactElement, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoBuildOutline, IoChatbubbleOutline, IoSave } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';
import { useUserContext } from '../../../hooks/useUserContext';
import { useIncident, useIncidents } from '../../../hooks/useIncidents';
import { hasAccessToSubsection } from '../../../utils/scripts/permissions';
import { confirm as confirmAlert } from '../../../utils/services/alertService';
import type {
  IncidentCommentaire,
  IncidentStatut,
  TraiterIncidentPayload,
} from '../../../utils/types/incident.types';
import {
  formatIncidentEmploye,
  formatIncidentUtilisateursImpactes,
  INCIDENT_CLASSIFICATION_OPTIONS,
  INCIDENT_CRITICITE_LABELS,
  INCIDENT_PRIORITE_LABELS,
  INCIDENT_SECTEUR_LABELS,
  INCIDENT_STATUT_LABELS,
} from '../../../utils/types/incident.types';
import { formatDate, formatTime } from '../../../utils/scripts/formatters';

import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

type TraitementStatut = Extract<IncidentStatut, 'en_traitement' | 'en_attente' | 'resolu' | 'annule'>;

interface TraitementFormState {
  statut: TraitementStatut;
  classification: string;
  cause_racine: string;
  solution: string;
  actions_correctives: string;
  commentaire_traitement: string;
  commentaire_cloture: string;
  temps_passe_minutes: string;
}

const TRAITEMENT_STATUTS: { value: TraitementStatut; label: string }[] = [
  { value: 'en_traitement', label: 'En traitement' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'resolu', label: 'Résolu' },
  { value: 'annule', label: 'Annulé' },
];

const computeResolutionMinutes = (start?: string | null, end?: string | null): string => {
  if (!start || !end) return '—';
  const minutes = Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest > 0 ? `${hours}h${String(rest).padStart(2, '0')}` : `${hours}h`;
};

const matchesStructuredComment = (commentaire: IncidentCommentaire, expected?: string | null): boolean => {
  return Boolean(expected && commentaire.commentaire.trim() === expected.trim());
};

function IncidentTraitement(): ReactElement {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isReadOnlyHistoryView = Boolean(id);
  const { user } = useUserContext();
  const canTraiter = hasAccessToSubsection(user, 'incidents', 'traiter');
  const initialId = id ? Number(id) : undefined;
  const { incidents, isLoading: isLoadingList, refresh } = useIncidents({ limit: 100 });
  const { incident, isLoading, error, load, treat, addComment } = useIncident(initialId);
  const incidentsOuverts = useMemo(
    () => incidents.filter(item => ['qualifie', 'en_traitement', 'en_attente'].includes(item.statut)),
    [incidents]
  );
  const [selectedId, setSelectedId] = useState(id ?? '');
  const activeIncident = selectedId && incident?.id_incident === Number(selectedId) ? incident : null;
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [commentaireLibre, setCommentaireLibre] = useState('');
  const [form, setForm] = useState<TraitementFormState>({
    statut: 'en_traitement',
    classification: '',
    cause_racine: '',
    solution: '',
    actions_correctives: '',
    commentaire_traitement: '',
    commentaire_cloture: '',
    temps_passe_minutes: '',
  });

  useEffect(() => {
    if (id) setSelectedId(id);
  }, [id]);

  useEffect(() => {
    if (!selectedId) return;
    load(Number(selectedId));
  }, [load, selectedId]);

  useEffect(() => {
    if (!incident) return;
    setForm({
      statut: incident.statut === 'resolu' || incident.statut === 'annule' || incident.statut === 'en_attente'
        ? incident.statut
        : 'en_traitement',
      classification: incident.classification ?? '',
      cause_racine: incident.cause_racine ?? '',
      solution: incident.solution ?? '',
      actions_correctives: incident.actions_correctives ?? '',
      commentaire_traitement: incident.commentaire_traitement ?? '',
      commentaire_cloture: incident.commentaire_cloture ?? '',
      temps_passe_minutes: '',
    });
    setSuccess(null);
  }, [incident]);

  const updateField = <K extends keyof TraitementFormState>(field: K, value: TraitementFormState[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSuccess(null);
  };

  const declarationComments = useMemo(
    () => (activeIncident?.commentaires ?? []).filter(commentaire => commentaire.type_commentaire === 'declaration'),
    [activeIncident]
  );
  const qualificationComments = useMemo(
    () => (activeIncident?.commentaires ?? []).filter(
      commentaire => commentaire.type_commentaire === 'qualification' && !matchesStructuredComment(commentaire, activeIncident?.commentaire_qualification)
    ),
    [activeIncident]
  );
  const traitementComments = useMemo(
    () => (activeIncident?.commentaires ?? []).filter(
      commentaire => commentaire.type_commentaire === 'traitement' && !matchesStructuredComment(commentaire, activeIncident?.commentaire_traitement)
    ),
    [activeIncident]
  );
  const clotureComments = useMemo(
    () => (activeIncident?.commentaires ?? []).filter(commentaire => {
      if (!['resolution', 'annulation'].includes(commentaire.type_commentaire)) return false;
      return !matchesStructuredComment(commentaire, activeIncident?.commentaire_cloture);
    }),
    [activeIncident]
  );
  const freeComments = useMemo(
    () => (activeIncident?.commentaires ?? []).filter(commentaire => commentaire.type_commentaire === 'commentaire'),
    [activeIncident]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeIncident) return;

    if (form.statut === 'resolu' || form.statut === 'annule') {
      const isResolution = form.statut === 'resolu';
      const confirmed = await confirmAlert(
        isResolution
          ? 'Confirmer la résolution de cet incident ?'
          : 'Confirmer l’annulation de cet incident ?',
        isResolution ? 'Confirmer la résolution' : 'Confirmer l’annulation',
        isResolution ? 'Résoudre' : 'Annuler',
        'Retour'
      );
      if (!confirmed) return;
    }

    setIsSaving(true);
    const tempsPasse = form.temps_passe_minutes.trim() ? Number(form.temps_passe_minutes) : undefined;
    const payload: TraiterIncidentPayload = {
      statut: form.statut,
      classification: form.classification.trim() || undefined,
      cause_racine: form.cause_racine.trim() || undefined,
      solution: form.solution.trim() || undefined,
      actions_correctives: form.actions_correctives.trim() || undefined,
      commentaire_traitement: form.commentaire_traitement.trim() || undefined,
      commentaire_cloture: form.commentaire_cloture.trim() || undefined,
      temps_passe_minutes: tempsPasse,
    };

    const updated = await treat(activeIncident.id_incident, payload);
    setIsSaving(false);

    if (updated) {
      setSuccess(`${updated.reference} mis à jour.`);
      setSelectedId('');
      await refresh();
    }
  };

  const handleAddComment = async () => {
    if (!activeIncident || !commentaireLibre.trim()) return;
    const ok = await addComment(activeIncident.id_incident, {
      commentaire: commentaireLibre.trim(),
      type_commentaire: 'commentaire',
    });
    if (ok) setCommentaireLibre('');
  };

  return (
    <div id="incidentTraitement">
      <Header />
      <SubNav />
      <main>
        <div className="incidents__container incidents__container--wide">
          <div className="incidents__header">
            <Button style="back" onClick={() => navigate('/incidents')}>
              <MdArrowBack />
              <span>Retour</span>
            </Button>
            <h1><IoBuildOutline /> {isReadOnlyHistoryView ? "Historique de l'incident" : 'Traitement des incidents'}</h1>
          </div>

          {error && <div className="incidents__error">{error}</div>}
          {success && <div className="incidents__success">{success}</div>}

          <div className="incidents__layout incidents__layout--detail">
            <aside className="incidents__sidebar">
              <h2>Incident</h2>
              {!isReadOnlyHistoryView && (
                <select value={selectedId} onChange={event => setSelectedId(event.target.value)} disabled={isLoadingList}>
                  <option value="">Sélectionner</option>
                  {incidentsOuverts.map(item => (
                    <option key={item.id_incident} value={item.id_incident}>
                      {item.reference} · {item.titre}
                    </option>
                  ))}
                </select>
              )}
              {activeIncident && (
                <div className="incidents__meta-list">
                  <div><span>Statut</span><strong>{INCIDENT_STATUT_LABELS[activeIncident.statut]}</strong></div>
                  <div><span>Secteur</span><strong>{INCIDENT_SECTEUR_LABELS[activeIncident.secteur]}</strong></div>
                  <div><span>Priorité</span><strong>{INCIDENT_PRIORITE_LABELS[activeIncident.priorite]}</strong></div>
                  <div><span>Criticité</span><strong>{INCIDENT_CRITICITE_LABELS[activeIncident.criticite]}</strong></div>
                  <div><span>Intervenant</span><strong>{formatIncidentEmploye(activeIncident.intervenant)}</strong></div>
                  <div><span>Utilisateurs impactés</span><strong>{formatIncidentUtilisateursImpactes(activeIncident)}</strong></div>
                  <div><span>Durée</span><strong>{computeResolutionMinutes(activeIncident.date_declaration, activeIncident.date_resolution)}</strong></div>
                </div>
              )}
            </aside>

            <section className="incidents__panel">
              {isLoading ? (
                <div className="incidents__empty">Chargement...</div>
              ) : activeIncident ? (
                <>
                  <div className="incidents__summary">
                    <span className={`incidents__badge incidents__badge--${activeIncident.statut}`}>{INCIDENT_STATUT_LABELS[activeIncident.statut]}</span>
                    <h2>{activeIncident.reference} · {activeIncident.titre}</h2>
                    <p>{activeIncident.description}</p>
                    <dl>
                      <div><dt>Déclarant</dt><dd>{formatIncidentEmploye(activeIncident.declarant)}</dd></div>
                      <div><dt>Créé le</dt><dd>{formatDate(activeIncident.created_at)}</dd></div>
                      <div><dt>Utilisateurs impactés</dt><dd>{formatIncidentUtilisateursImpactes(activeIncident)}</dd></div>
                      <div><dt>Classification</dt><dd>{activeIncident.classification ?? '—'}</dd></div>
                    </dl>
                  </div>

                  {canTraiter && !isReadOnlyHistoryView ? (
                    <form className="incidents__form" onSubmit={handleSubmit}>
                      <div className="incidents__grid">
                        <div className="incidents__field">
                          <label htmlFor="statut">Statut</label>
                          <select id="statut" value={form.statut} onChange={event => updateField('statut', event.target.value as TraitementStatut)} disabled={isSaving}>
                            {TRAITEMENT_STATUTS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        </div>
                        <div className="incidents__field">
                          <label htmlFor="classification-traitement">Classification</label>
                          <input id="classification-traitement" list="classification-traitement-options" value={form.classification} onChange={event => updateField('classification', event.target.value)} disabled={isSaving} />
                          <datalist id="classification-traitement-options">
                            {INCIDENT_CLASSIFICATION_OPTIONS.map(option => <option key={option} value={option} />)}
                          </datalist>
                        </div>
                        <div className="incidents__field">
                          <label htmlFor="temps">Temps passé (min)</label>
                          <input id="temps" type="number" min="0" value={form.temps_passe_minutes} onChange={event => updateField('temps_passe_minutes', event.target.value)} disabled={isSaving} />
                        </div>
                      </div>

                      <div className="incidents__field incidents__field--wide">
                        <label htmlFor="commentaire_traitement">Commentaire de traitement</label>
                        <textarea id="commentaire_traitement" rows={3} value={form.commentaire_traitement} onChange={event => updateField('commentaire_traitement', event.target.value)} disabled={isSaving} />
                      </div>
                      <div className="incidents__field incidents__field--wide">
                        <label htmlFor="cause_racine">Cause racine</label>
                        <textarea id="cause_racine" rows={3} value={form.cause_racine} onChange={event => updateField('cause_racine', event.target.value)} disabled={isSaving} />
                      </div>
                      <div className="incidents__field incidents__field--wide">
                        <label htmlFor="solution">Solution</label>
                        <textarea id="solution" rows={4} value={form.solution} onChange={event => updateField('solution', event.target.value)} disabled={isSaving} />
                      </div>
                      <div className="incidents__field incidents__field--wide">
                        <label htmlFor="actions_correctives">Actions correctives</label>
                        <textarea id="actions_correctives" rows={3} value={form.actions_correctives} onChange={event => updateField('actions_correctives', event.target.value)} disabled={isSaving} />
                      </div>
                      <div className="incidents__field incidents__field--wide">
                        <label htmlFor="commentaire_cloture">Commentaire de clôture</label>
                        <textarea id="commentaire_cloture" rows={3} value={form.commentaire_cloture} onChange={event => updateField('commentaire_cloture', event.target.value)} disabled={isSaving} />
                      </div>

                      <div className="incidents__actions">
                        <button type="submit" className="incidents__btn-primary" disabled={isSaving}>
                          <IoSave />
                          {isSaving ? 'Enregistrement...' : 'Enregistrer le traitement'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="incidents__empty">Consultation seule pour ce poste.</div>
                  )}

                  <section className="incidents__comments">
                    <h2><IoChatbubbleOutline /> Commentaires</h2>
                    {canTraiter && !isReadOnlyHistoryView && (
                      <div className="incidents__comment-form">
                        <textarea value={commentaireLibre} onChange={event => setCommentaireLibre(event.target.value)} rows={3} placeholder="Ajouter un commentaire..." />
                        <button type="button" className="incidents__btn-secondary" onClick={handleAddComment} disabled={!commentaireLibre.trim() || isSaving}>
                          Ajouter
                        </button>
                      </div>
                    )}
                    <div className="incidents__timeline">
                      <article className="incidents__timeline-step">
                        <header className="incidents__timeline-header">
                          <div>
                            <h3>Déclaration</h3>
                          <p>{formatDate(activeIncident.date_declaration)} à {formatTime(activeIncident.date_declaration)}</p>
                          </div>
                          <span className="incidents__badge incidents__badge--declare">Déclaré</span>
                        </header>
                        <div className="incidents__timeline-body">
                          <div className="incidents__timeline-card">
                            <strong>Description initiale</strong>
                            <p>{activeIncident.description}</p>
                          </div>
                          {declarationComments.length > 0 && (
                            <div className="incidents__comment-list">
                              {declarationComments.map(commentaire => (
                                <article key={commentaire.id_commentaire}>
                                  <header>
                                    <strong>{formatIncidentEmploye(commentaire.auteur)}</strong>
                                    <span>{formatDate(commentaire.created_at)} à {formatTime(commentaire.created_at)}</span>
                                    <em>Déclaration</em>
                                  </header>
                                  <p>{commentaire.commentaire}</p>
                                </article>
                              ))}
                            </div>
                          )}
                        </div>
                      </article>

                      {(activeIncident.date_qualification || activeIncident.commentaire_qualification || qualificationComments.length > 0 || activeIncident.statut !== 'declare') && (
                        <article className="incidents__timeline-step">
                          <header className="incidents__timeline-header">
                            <div>
                              <h3>Qualification</h3>
                              <p>{activeIncident.date_qualification ? `${formatDate(activeIncident.date_qualification)} à ${formatTime(activeIncident.date_qualification)}` : 'En attente de qualification complète'}</p>
                            </div>
                            <span className="incidents__badge incidents__badge--qualifie">Qualifié</span>
                          </header>
                          <div className="incidents__timeline-body">
                            <div className="incidents__timeline-grid">
                              <div className="incidents__timeline-card">
                                <strong>Classification</strong>
                                <p>{activeIncident.classification ?? '—'}</p>
                              </div>
                              <div className="incidents__timeline-card">
                                <strong>Intervenant</strong>
                                <p>{formatIncidentEmploye(activeIncident.intervenant)}</p>
                              </div>
                            </div>
                            {activeIncident.commentaire_qualification && (
                              <div className="incidents__timeline-card">
                                <strong>Commentaire de qualification</strong>
                                <p>{activeIncident.commentaire_qualification}</p>
                              </div>
                            )}
                            {qualificationComments.length > 0 && (
                              <div className="incidents__comment-list">
                                {qualificationComments.map(commentaire => (
                                  <article key={commentaire.id_commentaire}>
                                    <header>
                                      <strong>{formatIncidentEmploye(commentaire.auteur)}</strong>
                                      <span>{formatDate(commentaire.created_at)} à {formatTime(commentaire.created_at)}</span>
                                      <em>Qualification</em>
                                    </header>
                                    <p>{commentaire.commentaire}</p>
                                  </article>
                                ))}
                              </div>
                            )}
                          </div>
                        </article>
                      )}

                      {(activeIncident.date_debut_traitement || activeIncident.commentaire_traitement || activeIncident.cause_racine || activeIncident.solution || activeIncident.actions_correctives || traitementComments.length > 0 || ['en_traitement', 'en_attente', 'resolu', 'annule'].includes(activeIncident.statut)) && (
                        <article className="incidents__timeline-step">
                          <header className="incidents__timeline-header">
                            <div>
                              <h3>Traitement</h3>
                              <p>{activeIncident.date_debut_traitement ? `${formatDate(activeIncident.date_debut_traitement)} à ${formatTime(activeIncident.date_debut_traitement)}` : 'Traitement non démarré'}</p>
                            </div>
                            <span className={`incidents__badge incidents__badge--${activeIncident.statut === 'en_attente' ? 'en_attente' : 'en_traitement'}`}>
                              {activeIncident.statut === 'en_attente' ? 'En attente' : 'En traitement'}
                            </span>
                          </header>
                          <div className="incidents__timeline-body">
                            {activeIncident.commentaire_traitement && (
                              <div className="incidents__timeline-card">
                                <strong>Commentaire de traitement</strong>
                                <p>{activeIncident.commentaire_traitement}</p>
                              </div>
                            )}
                            <div className="incidents__timeline-grid">
                              <div className="incidents__timeline-card">
                                <strong>Cause racine</strong>
                                <p>{activeIncident.cause_racine ?? '—'}</p>
                              </div>
                              <div className="incidents__timeline-card">
                                <strong>Solution</strong>
                                <p>{activeIncident.solution ?? '—'}</p>
                              </div>
                            </div>
                            <div className="incidents__timeline-card">
                              <strong>Actions correctives</strong>
                              <p>{activeIncident.actions_correctives ?? '—'}</p>
                            </div>
                            {traitementComments.length > 0 && (
                              <div className="incidents__comment-list">
                                {traitementComments.map(commentaire => (
                                  <article key={commentaire.id_commentaire}>
                                    <header>
                                      <strong>{formatIncidentEmploye(commentaire.auteur)}</strong>
                                      <span>{formatDate(commentaire.created_at)} à {formatTime(commentaire.created_at)}</span>
                                      <em>Traitement</em>
                                    </header>
                                    <p>{commentaire.commentaire}</p>
                                  </article>
                                ))}
                              </div>
                            )}
                          </div>
                        </article>
                      )}

                      {(activeIncident.statut === 'resolu' || activeIncident.statut === 'annule' || activeIncident.date_resolution || activeIncident.date_annulation || activeIncident.commentaire_cloture || clotureComments.length > 0) && (
                        <article className="incidents__timeline-step">
                          <header className="incidents__timeline-header">
                            <div>
                              <h3>{activeIncident.statut === 'annule' ? 'Annulation' : 'Résolution'}</h3>
                              <p>
                                {activeIncident.statut === 'annule'
                                  ? (activeIncident.date_annulation ? `${formatDate(activeIncident.date_annulation)} à ${formatTime(activeIncident.date_annulation)}` : 'Annulation en cours')
                                  : (activeIncident.date_resolution ? `${formatDate(activeIncident.date_resolution)} à ${formatTime(activeIncident.date_resolution)}` : 'Résolution en cours')}
                              </p>
                            </div>
                            <span className={`incidents__badge incidents__badge--${activeIncident.statut === 'annule' ? 'annule' : 'resolu'}`}>
                              {activeIncident.statut === 'annule' ? 'Annulé' : 'Résolu'}
                            </span>
                          </header>
                          <div className="incidents__timeline-body">
                            {activeIncident.commentaire_cloture && (
                              <div className="incidents__timeline-card">
                                <strong>Commentaire de clôture</strong>
                                <p>{activeIncident.commentaire_cloture}</p>
                              </div>
                            )}
                            {clotureComments.length > 0 && (
                              <div className="incidents__comment-list">
                                {clotureComments.map(commentaire => (
                                  <article key={commentaire.id_commentaire}>
                                    <header>
                                      <strong>{formatIncidentEmploye(commentaire.auteur)}</strong>
                                      <span>{formatDate(commentaire.created_at)} à {formatTime(commentaire.created_at)}</span>
                                      <em>{commentaire.type_commentaire === 'annulation' ? 'Annulation' : 'Résolution'}</em>
                                    </header>
                                    <p>{commentaire.commentaire}</p>
                                  </article>
                                ))}
                              </div>
                            )}
                          </div>
                        </article>
                      )}
                    </div>

                    <div className="incidents__comment-list">
                      {freeComments.map(commentaire => (
                        <article key={commentaire.id_commentaire}>
                          <header>
                            <strong>{formatIncidentEmploye(commentaire.auteur)}</strong>
                            <span>{formatDate(commentaire.created_at)} à {formatTime(commentaire.created_at)}</span>
                            <em>Commentaire libre</em>
                          </header>
                          <p>{commentaire.commentaire}</p>
                        </article>
                      ))}
                      {freeComments.length === 0 && <p>Aucun commentaire libre pour cet incident.</p>}
                    </div>
                  </section>
                </>
              ) : (
                <div className="incidents__empty">Sélectionnez un incident à traiter.</div>
              )}
            </section>
          </div>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const IncidentTraitementWithAuth = WithAuth(IncidentTraitement);
export default IncidentTraitementWithAuth;
