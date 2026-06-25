import './incidents.scss';

import { FormEvent, ReactElement, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { IoBuildOutline, IoChatbubbleOutline, IoSave } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';
import { useUserContext } from '../../../hooks/useUserContext';
import { useIncident, useIncidents } from '../../../hooks/useIncidents';
import { hasAccessToSubsection } from '../../../utils/scripts/permissions';
import type {
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

function IncidentTraitement(): ReactElement {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useUserContext();
  const canTraiter = hasAccessToSubsection(user, 'incidents', 'traiter');
  const initialId = id ? Number(id) : undefined;
  const { incidents, isLoading: isLoadingList } = useIncidents({ limit: 100 });
  const { incident, isLoading, error, load, treat, addComment } = useIncident(initialId);
  const incidentsOuverts = useMemo(
    () => incidents.filter(item => item.statut !== 'resolu' && item.statut !== 'annule'),
    [incidents]
  );
  const [selectedId, setSelectedId] = useState(id ?? '');
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
      statut: incident.statut === 'resolu' || incident.statut === 'annule' ? incident.statut : 'en_traitement',
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!incident) return;

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

    const updated = await treat(incident.id_incident, payload);
    setIsSaving(false);

    if (updated) setSuccess(`${updated.reference} mis à jour.`);
  };

  const handleAddComment = async () => {
    if (!incident || !commentaireLibre.trim()) return;
    const ok = await addComment(incident.id_incident, {
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
            <h1><IoBuildOutline /> Traitement des incidents</h1>
          </div>

          {error && <div className="incidents__error">{error}</div>}
          {success && <div className="incidents__success">{success}</div>}

          <div className="incidents__layout incidents__layout--detail">
            <aside className="incidents__sidebar">
              <h2>Incident</h2>
              <select value={selectedId} onChange={event => setSelectedId(event.target.value)} disabled={isLoadingList}>
                <option value="">Sélectionner</option>
                {incidentsOuverts.map(item => (
                  <option key={item.id_incident} value={item.id_incident}>
                    {item.reference} · {item.titre}
                  </option>
                ))}
              </select>
              {incident && (
                <div className="incidents__meta-list">
                  <div><span>Statut</span><strong>{INCIDENT_STATUT_LABELS[incident.statut]}</strong></div>
                  <div><span>Secteur</span><strong>{INCIDENT_SECTEUR_LABELS[incident.secteur]}</strong></div>
                  <div><span>Priorité</span><strong>{INCIDENT_PRIORITE_LABELS[incident.priorite]}</strong></div>
                  <div><span>Criticité</span><strong>{INCIDENT_CRITICITE_LABELS[incident.criticite]}</strong></div>
                  <div><span>Intervenant</span><strong>{formatIncidentEmploye(incident.intervenant)}</strong></div>
                  <div><span>Utilisateurs impactés</span><strong>{formatIncidentUtilisateursImpactes(incident)}</strong></div>
                  <div><span>Durée</span><strong>{computeResolutionMinutes(incident.date_declaration, incident.date_resolution)}</strong></div>
                </div>
              )}
            </aside>

            <section className="incidents__panel">
              {isLoading ? (
                <div className="incidents__empty">Chargement...</div>
              ) : incident ? (
                <>
                  <div className="incidents__summary">
                    <span className={`incidents__badge incidents__badge--${incident.statut}`}>{INCIDENT_STATUT_LABELS[incident.statut]}</span>
                    <h2>{incident.reference} · {incident.titre}</h2>
                    <p>{incident.description}</p>
                    <dl>
                      <div><dt>Déclarant</dt><dd>{formatIncidentEmploye(incident.declarant)}</dd></div>
                      <div><dt>Créé le</dt><dd>{formatDate(incident.created_at)}</dd></div>
                      <div><dt>Utilisateurs impactés</dt><dd>{formatIncidentUtilisateursImpactes(incident)}</dd></div>
                      <div><dt>Classification</dt><dd>{incident.classification ?? '—'}</dd></div>
                    </dl>
                  </div>

                  {canTraiter ? (
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
                    {canTraiter && (
                      <div className="incidents__comment-form">
                        <textarea value={commentaireLibre} onChange={event => setCommentaireLibre(event.target.value)} rows={3} placeholder="Ajouter un commentaire..." />
                        <button type="button" className="incidents__btn-secondary" onClick={handleAddComment} disabled={!commentaireLibre.trim()}>
                          Ajouter
                        </button>
                      </div>
                    )}
                    <div className="incidents__comment-list">
                      {(incident.commentaires ?? []).map(commentaire => (
                        <article key={commentaire.id_commentaire}>
                          <header>
                            <strong>{formatIncidentEmploye(commentaire.auteur)}</strong>
                            <span>{formatDate(commentaire.created_at)} à {formatTime(commentaire.created_at)}</span>
                            <em>{commentaire.type_commentaire}</em>
                          </header>
                          <p>{commentaire.commentaire}</p>
                        </article>
                      ))}
                      {(incident.commentaires ?? []).length === 0 && <p>Aucun commentaire pour cet incident.</p>}
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
