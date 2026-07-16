import type { ReactElement } from 'react';
import { IoChatbubbleOutline } from 'react-icons/io5';
import type { IncidentTreatmentViewModel } from '../../../hooks/index.ts';
import { formatDate, formatTime } from '../../../utils/scripts/index.ts';
import { formatIncidentEmploye } from '../../../utils/types/index.ts';
import { IncidentTimeline } from '../index.ts';

type IncidentTreatmentCommentsProps = Pick<
  IncidentTreatmentViewModel,
  | 'activeIncident'
  | 'addFreeComment'
  | 'canTraiter'
  | 'commentGroups'
  | 'commentaireLibre'
  | 'isReadOnlyHistoryView'
  | 'isSaving'
  | 'setCommentaireLibre'
  | 'timelineVisibility'
>;

export function IncidentTreatmentComments({
  activeIncident,
  addFreeComment,
  canTraiter,
  commentGroups,
  commentaireLibre,
  isReadOnlyHistoryView,
  isSaving,
  setCommentaireLibre,
  timelineVisibility,
}: IncidentTreatmentCommentsProps): ReactElement | null {
  if (!activeIncident || !timelineVisibility) return null;

  return (
    <section className="incidents__comments">
      <h2><IoChatbubbleOutline /> Commentaires</h2>
      {canTraiter && !isReadOnlyHistoryView && (
        <div className="incidents__comment-form">
          <textarea value={commentaireLibre} onChange={(event) => setCommentaireLibre(event.target.value)} rows={3} placeholder="Ajouter un commentaire..." />
          <button type="button" className="incidents__btn-secondary" onClick={() => void addFreeComment()} disabled={!commentaireLibre.trim() || isSaving}>
            Ajouter
          </button>
        </div>
      )}

      <IncidentTimeline incident={activeIncident} commentGroups={commentGroups} visibility={timelineVisibility} />

      <div className="incidents__comment-list">
        {commentGroups.libres.map((comment) => (
          <article key={comment.id_commentaire}>
            <header>
              <strong>{formatIncidentEmploye(comment.auteur)}</strong>
              <span>{formatDate(comment.created_at)} à {formatTime(comment.created_at)}</span>
              <em>Commentaire libre</em>
            </header>
            <p>{comment.commentaire}</p>
          </article>
        ))}
        {commentGroups.libres.length === 0 && <p>Aucun commentaire libre pour cet incident.</p>}
      </div>
    </section>
  );
}
