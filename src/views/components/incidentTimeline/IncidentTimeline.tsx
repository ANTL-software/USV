import type { ReactElement } from 'react';
import type {
  Incident,
  IncidentCommentaire,
} from '../../../utils/types/index.ts';
import { formatIncidentEmploye } from '../../../utils/types/index.ts';
import type {
  IncidentCommentGroups,
  IncidentTimelineVisibility,
} from '../../../utils/scripts/index.ts';
import { formatDate, formatTime } from '../../../utils/scripts/index.ts';

interface IncidentTimelineProps {
  commentGroups: IncidentCommentGroups;
  incident: Incident;
  visibility: IncidentTimelineVisibility;
}

interface TimelineCommentListProps {
  comments: IncidentCommentaire[];
  fallbackLabel: string;
}

function TimelineCommentList({ comments, fallbackLabel }: TimelineCommentListProps): ReactElement | null {
  if (comments.length === 0) return null;

  return (
    <div className="incidents__comment-list">
      {comments.map((comment) => (
        <article key={comment.id_commentaire}>
          <header>
            <strong>{formatIncidentEmploye(comment.auteur)}</strong>
            <span>{formatDate(comment.created_at)} à {formatTime(comment.created_at)}</span>
            <em>{comment.type_commentaire === 'annulation' ? 'Annulation' : fallbackLabel}</em>
          </header>
          <p>{comment.commentaire}</p>
        </article>
      ))}
    </div>
  );
}

export function IncidentTimeline({
  commentGroups,
  incident,
  visibility,
}: IncidentTimelineProps): ReactElement {
  const isCancelled = incident.statut === 'annule';
  const closureDate = isCancelled ? incident.date_annulation : incident.date_resolution;

  return (
    <div className="incidents__timeline">
      <article className="incidents__timeline-step">
        <header className="incidents__timeline-header">
          <div>
            <h3>Déclaration</h3>
            <p>{formatDate(incident.date_declaration)} à {formatTime(incident.date_declaration)}</p>
          </div>
          <span className="incidents__badge incidents__badge--declare">Déclaré</span>
        </header>
        <div className="incidents__timeline-body">
          <div className="incidents__timeline-card"><p>{incident.description}</p></div>
          <TimelineCommentList comments={commentGroups.declaration} fallbackLabel="Déclaration" />
        </div>
      </article>

      {visibility.qualification && (
        <article className="incidents__timeline-step">
          <header className="incidents__timeline-header">
            <div>
              <h3>Qualification</h3>
              <p>{incident.date_qualification ? `${formatDate(incident.date_qualification)} à ${formatTime(incident.date_qualification)}` : 'En attente de qualification complète'}</p>
            </div>
            <span className="incidents__badge incidents__badge--qualifie">Qualifié</span>
          </header>
          <div className="incidents__timeline-body">
            <div className="incidents__timeline-grid">
              <div className="incidents__timeline-card"><strong>Classification</strong><p>{incident.classification ?? '—'}</p></div>
              <div className="incidents__timeline-card"><strong>Intervenant</strong><p>{formatIncidentEmploye(incident.intervenant)}</p></div>
            </div>
            {incident.commentaire_qualification && (
              <div className="incidents__timeline-card"><strong>Commentaire de qualification</strong><p>{incident.commentaire_qualification}</p></div>
            )}
            <TimelineCommentList comments={commentGroups.qualification} fallbackLabel="Qualification" />
          </div>
        </article>
      )}

      {visibility.treatment && (
        <article className="incidents__timeline-step">
          <header className="incidents__timeline-header">
            <div>
              <h3>Traitement</h3>
              <p>{incident.date_debut_traitement ? `${formatDate(incident.date_debut_traitement)} à ${formatTime(incident.date_debut_traitement)}` : 'Traitement non démarré'}</p>
            </div>
            <span className={`incidents__badge incidents__badge--${incident.statut === 'en_attente' ? 'en_attente' : 'en_traitement'}`}>
              {incident.statut === 'en_attente' ? 'En attente' : 'En traitement'}
            </span>
          </header>
          <div className="incidents__timeline-body">
            {incident.commentaire_traitement && (
              <div className="incidents__timeline-card"><strong>Commentaire de traitement</strong><p>{incident.commentaire_traitement}</p></div>
            )}
            <div className="incidents__timeline-grid">
              <div className="incidents__timeline-card"><strong>Cause racine</strong><p>{incident.cause_racine ?? '—'}</p></div>
              <div className="incidents__timeline-card"><strong>Solution</strong><p>{incident.solution ?? '—'}</p></div>
            </div>
            <div className="incidents__timeline-card"><strong>Actions correctives</strong><p>{incident.actions_correctives ?? '—'}</p></div>
            <TimelineCommentList comments={commentGroups.traitement} fallbackLabel="Traitement" />
          </div>
        </article>
      )}

      {visibility.closure && (
        <article className="incidents__timeline-step">
          <header className="incidents__timeline-header">
            <div>
              <h3>{isCancelled ? 'Annulation' : 'Résolution'}</h3>
              <p>{closureDate ? `${formatDate(closureDate)} à ${formatTime(closureDate)}` : `${isCancelled ? 'Annulation' : 'Résolution'} en cours`}</p>
            </div>
            <span className={`incidents__badge incidents__badge--${isCancelled ? 'annule' : 'resolu'}`}>
              {isCancelled ? 'Annulé' : 'Résolu'}
            </span>
          </header>
          <div className="incidents__timeline-body">
            {incident.commentaire_cloture && (
              <div className="incidents__timeline-card"><strong>Commentaire de clôture</strong><p>{incident.commentaire_cloture}</p></div>
            )}
            <TimelineCommentList comments={commentGroups.cloture} fallbackLabel="Résolution" />
          </div>
        </article>
      )}
    </div>
  );
}
