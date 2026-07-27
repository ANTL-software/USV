import { useEffect, useState, type ReactElement } from 'react';
import {
  MdCancel,
  MdCheckCircleOutline,
  MdFactCheck,
  MdInventory2,
  MdOpenInNew,
  MdOutlineImage,
  MdOutlineSchedule,
  MdRefresh,
} from 'react-icons/md';
import type { SocialPublicationState } from '../../../hooks/index.ts';
import type { SocialEditorialDraft, SocialPlatform } from '../../../utils/types/index.ts';
import { Button } from '../index.ts';
import {
  categoryLabels,
  formatSocialDate,
  localDateTimeToIso,
  platformLabels,
  statusLabels,
  toLocalDateTimeValue,
} from './socialPublication.constants.ts';

interface DraftFeedback {
  error: boolean;
  message: string;
}

function SocialDraftDetails({ draft }: { draft: SocialEditorialDraft }): ReactElement {
  return (
    <details className="socialPublicationView__draft-details">
      <summary>Voir le détail du brouillon</summary>
      <div className="socialPublicationView__draft-detail-grid">
        {draft.plateformes.map((platform) => (
          <article key={platform}>
            <strong>{platformLabels[platform]}</strong>
            <p>{draft.textes[platform] || 'Aucun texte renseigné.'}</p>
            {draft.resultats_publication?.[platform] && (
              <small className={draft.resultats_publication[platform]?.success ? 'socialPublicationView__result-ok' : 'socialPublicationView__result-error'}>
                {draft.resultats_publication[platform]?.success
                  ? `Publié${draft.resultats_publication[platform]?.postId ? ` · ${draft.resultats_publication[platform]?.postId}` : ''}`
                  : draft.resultats_publication[platform]?.error || 'Échec de publication'}
              </small>
            )}
          </article>
        ))}
      </div>
      <div className="socialPublicationView__visual-detail">
        <span>Visuel</span>
        <p>{draft.visuel_notes || 'Aucune note visuelle.'}</p>
        {draft.visuel_url && <a href={draft.visuel_url} target="_blank" rel="noreferrer"><MdOpenInNew /> Ouvrir le visuel</a>}
      </div>
    </details>
  );
}

export function SocialDrafts({ state }: { state: SocialPublicationState }): ReactElement {
  const [scheduleValues, setScheduleValues] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, DraftFeedback>>({});
  const [busyDraftId, setBusyDraftId] = useState<string | null>(null);

  useEffect(() => {
    setScheduleValues((current) => Object.fromEntries(state.drafts.map((draft) => [
      draft.id_brouillon_reseau_social,
      current[draft.id_brouillon_reseau_social]
        ?? toLocalDateTimeValue(draft.programme_pour || draft.date_souhaitee),
    ])));
  }, [state.drafts]);

  const perform = async (draftId: string, action: () => Promise<void>, success: string) => {
    setBusyDraftId(draftId);
    setFeedback((current) => {
      const next = { ...current };
      delete next[draftId];
      return next;
    });
    try {
      await action();
      setFeedback((current) => ({ ...current, [draftId]: { error: false, message: success } }));
    } catch (error: unknown) {
      setFeedback((current) => ({
        ...current,
        [draftId]: { error: true, message: error instanceof Error ? error.message : 'Action impossible.' },
      }));
    } finally {
      setBusyDraftId(null);
    }
  };

  const schedule = (draft: SocialEditorialDraft, reschedule: boolean) => {
    const draftId = draft.id_brouillon_reseau_social;
    const value = scheduleValues[draftId] ?? '';
    if (reschedule && !window.confirm('Confirmer la modification de l’horaire ?')) return;
    void perform(
      draftId,
      () => reschedule
        ? state.rescheduleDraft(draftId, localDateTimeToIso(value))
        : state.scheduleDraft(draftId, localDateTimeToIso(value)),
      reschedule ? 'Horaire de publication modifié.' : 'Publication programmée.',
    );
  };

  const cancel = (draft: SocialEditorialDraft, label: string) => {
    if (!window.confirm(`Annuler ${label} ? Le brouillon restera dans le registre interne.`)) return;
    void perform(
      draft.id_brouillon_reseau_social,
      () => state.cancelDraft(draft.id_brouillon_reseau_social),
      'Brouillon annulé et conservé dans le registre.',
    );
  };

  return (
    <section className="socialPublicationView__panel">
      <div className="socialPublicationView__panel-header socialPublicationView__panel-header--actions">
        <div className="socialPublicationView__heading-copy">
          <MdFactCheck />
          <div>
            <span className="socialPublicationView__section-kicker">Validation</span>
            <h2>Brouillons éditoriaux</h2>
            <p>{state.isLoading ? 'Chargement des brouillons…' : `${state.drafts.length} brouillon(s) dans le registre partagé.`}</p>
          </div>
        </div>
        <Button style="white" onClick={() => void state.refresh()} disabled={state.isLoading}>
          <MdRefresh />
          Actualiser
        </Button>
      </div>
      <div className="socialPublicationView__drafts">
        {state.drafts.map((draft) => {
          const draftId = draft.id_brouillon_reseau_social;
          const isBusy = busyDraftId === draftId;
          const packagePlatforms = draft.plateformes.filter((platform: SocialPlatform) => ['facebook', 'linkedin'].includes(platform));
          return (
            <article className="socialPublicationView__draft" key={draftId}>
              <div className="socialPublicationView__draft-header">
                <div>
                  <span className={`socialPublicationView__badge socialPublicationView__badge--${draft.statut}`}>{statusLabels[draft.statut]}</span>
                  <h3>{draft.sujet}</h3>
                  <p>{categoryLabels[draft.categorie]} · {draft.plateformes.map((platform) => platformLabels[platform]).join(' · ')}</p>
                </div>
                <div className="socialPublicationView__draft-dates">
                  <span>Date souhaitée<strong>{formatSocialDate(draft.date_souhaitee)}</strong></span>
                  {draft.programme_pour && <span>Programmée<strong>{formatSocialDate(draft.programme_pour)}</strong></span>}
                </div>
              </div>

              <SocialDraftDetails draft={draft} />

              {draft.dernier_controle && (
                <p className={`socialPublicationView__readiness${draft.dernier_controle.success ? '' : ' socialPublicationView__readiness--error'}`}>
                  <MdFactCheck />
                  {draft.dernier_controle.success
                    ? `Accès contrôlés le ${formatSocialDate(draft.dernier_controle.checkedAt)}`
                    : draft.dernier_controle.error || 'Le dernier contrôle technique a échoué.'}
                </p>
              )}
              {draft.derniere_erreur && <p className="socialPublicationView__feedback socialPublicationView__feedback--error">{draft.derniere_erreur}</p>}
              {feedback[draftId] && (
                <p className={`socialPublicationView__feedback${feedback[draftId].error ? ' socialPublicationView__feedback--error' : ''}`}>
                  {feedback[draftId].message}
                </p>
              )}

              <div className="socialPublicationView__draft-actions">
                {draft.statut === 'brouillon' && (
                  <Button style="green" disabled={isBusy} onClick={() => void perform(draftId, () => state.validateDraft(draftId), 'Validation Mehdi enregistrée.')}>
                    <MdCheckCircleOutline />
                    Valider Mehdi
                  </Button>
                )}
                {draft.statut === 'valide' && (
                  <>
                    <input
                      aria-label={`Date de publication de ${draft.sujet}`}
                      type="datetime-local"
                      value={scheduleValues[draftId] ?? ''}
                      onChange={(event) => setScheduleValues((current) => ({ ...current, [draftId]: event.target.value }))}
                      disabled={isBusy}
                    />
                    <Button style="gradient" disabled={isBusy} onClick={() => schedule(draft, false)}>
                      <MdOutlineSchedule />
                      Programmer
                    </Button>
                  </>
                )}
                {draft.statut === 'programme' && (
                  <>
                    <input
                      aria-label={`Modifier la date de publication de ${draft.sujet}`}
                      type="datetime-local"
                      value={scheduleValues[draftId] ?? ''}
                      onChange={(event) => setScheduleValues((current) => ({ ...current, [draftId]: event.target.value }))}
                      disabled={isBusy}
                    />
                    <Button style="white" disabled={isBusy} onClick={() => schedule(draft, true)}>
                      <MdOutlineSchedule />
                      Modifier l’horaire
                    </Button>
                    <Button style="red" disabled={isBusy} onClick={() => cancel(draft, 'la programmation')}>
                      <MdCancel />
                      Annuler la programmation
                    </Button>
                  </>
                )}
                {packagePlatforms.length > 0 && ['valide', 'programme', 'publie', 'echec_publication'].includes(draft.statut) && (
                  <Button style="white" disabled={isBusy} onClick={() => void perform(draftId, () => state.preparePackages(draftId), 'Packages de publication préparés.')}>
                    <MdInventory2 />
                    Préparer les packages
                  </Button>
                )}
                {draft.statut !== 'annule' && (
                  <Button style="white" disabled={isBusy} onClick={() => void perform(draftId, () => state.verifyReadiness(draftId), 'Tous les accès nécessaires ont été contrôlés.')}>
                    <MdFactCheck />
                    Contrôler les accès
                  </Button>
                )}
                {draft.statut === 'brouillon' && (
                  <Button style="red" disabled={isBusy} onClick={() => cancel(draft, 'ce brouillon')}>
                    <MdCancel />
                    Annuler le brouillon
                  </Button>
                )}
              </div>
              {draft.statut === 'annule' && <p className="socialPublicationView__archived">Conservé dans le registre interne.</p>}
            </article>
          );
        })}
      </div>
      {!state.isLoading && state.drafts.length === 0 && (
        <div className="socialPublicationView__empty">
          <MdOutlineImage />
          <p>Aucun brouillon en cours. Préparez votre première publication ci-dessus.</p>
        </div>
      )}
    </section>
  );
}
