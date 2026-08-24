import { useEffect, useState, type ReactElement } from 'react';
import {
  MdCancel,
  MdCheckCircleOutline,
  MdDeleteOutline,
  MdFactCheck,
  MdInventory2,
  MdOpenInNew,
  MdOutlineImage,
  MdOutlineSchedule,
  MdRefresh,
  MdSend,
} from 'react-icons/md';
import { useAlert, type SocialPublicationState } from '../../../hooks/index.ts';
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

interface ApiErrorPayload {
  message?: unknown;
}

interface ApiRequestError {
  response?: {
    data?: ApiErrorPayload;
  };
  message?: string;
}

const getActionErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const requestError = error as ApiRequestError;
    if (typeof requestError.response?.data?.message === 'string') return requestError.response.data.message;
    if (typeof requestError.message === 'string') return requestError.message;
  }
  return error instanceof Error ? error.message : 'Action impossible.';
};

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
        {draft.visuel_apercu_url && <a href={draft.visuel_apercu_url} target="_blank" rel="noreferrer" className="socialPublicationView__draft-visual-preview"><img src={draft.visuel_apercu_url} alt={`Visuel de ${draft.sujet}`} /></a>}
        {(draft.visuel_apercu_url || draft.visuel_url) && <a href={draft.visuel_apercu_url || draft.visuel_url || undefined} target="_blank" rel="noreferrer"><MdOpenInNew /> Ouvrir le visuel</a>}
      </div>
    </details>
  );
}

export function SocialDrafts({ state }: { state: SocialPublicationState }): ReactElement {
  const { showConfirm, showError, showSuccess } = useAlert();
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
      void showSuccess(success, 'Publications réseaux sociaux');
    } catch (error: unknown) {
      const message = getActionErrorMessage(error);
      setFeedback((current) => ({
        ...current,
        [draftId]: { error: true, message },
      }));
      void showError(message, 'Action impossible');
    } finally {
      setBusyDraftId(null);
    }
  };

  const schedule = async (draft: SocialEditorialDraft, reschedule: boolean) => {
    const draftId = draft.id_brouillon_reseau_social;
    const value = scheduleValues[draftId] ?? '';
    if (reschedule && !await showConfirm('Confirmer la modification de l’horaire de publication ?', 'Modifier l’horaire', 'Modifier', 'Conserver')) return;
    await perform(
      draftId,
      () => reschedule
        ? state.rescheduleDraft(draftId, localDateTimeToIso(value))
        : state.scheduleDraft(draftId, localDateTimeToIso(value)),
      reschedule ? 'Horaire de publication modifié.' : 'Publication programmée.',
    );
  };

  const cancel = async (draft: SocialEditorialDraft, label: string) => {
    const confirmed = await showConfirm(
      `Annuler ${label} ? Le brouillon restera dans le registre interne.`,
      'Confirmer l’annulation',
      'Annuler le brouillon',
      'Conserver',
    );
    if (!confirmed) return;
    await perform(
      draft.id_brouillon_reseau_social,
      () => state.cancelDraft(draft.id_brouillon_reseau_social),
      'Brouillon annulé et conservé dans le registre.',
    );
  };

  const retryFailed = async (draft: SocialEditorialDraft) => {
    const confirmed = await showConfirm(
      `Relancer immédiatement la publication de « ${draft.sujet} » sur les réseaux encore en échec ?`,
      'Retenter la publication',
      'Publier maintenant',
      'Annuler',
    );
    if (!confirmed) return;
    await perform(
      draft.id_brouillon_reseau_social,
      () => state.retryFailedDraft(draft.id_brouillon_reseau_social),
      'Nouvelle tentative de publication lancée.',
    );
  };

  const deleteFailed = async (draft: SocialEditorialDraft) => {
    const confirmed = await showConfirm(
      `Supprimer définitivement le brouillon en échec « ${draft.sujet} » et ses packages associés ? Cette action est irréversible.`,
      'Supprimer le brouillon',
      'Supprimer définitivement',
      'Conserver',
    );
    if (!confirmed) return;
    await perform(
      draft.id_brouillon_reseau_social,
      () => state.deleteFailedDraft(draft.id_brouillon_reseau_social),
      'Brouillon supprimé.',
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
          const packagePlatforms = draft.plateformes.filter((platform: SocialPlatform) => ['facebook', 'instagram', 'linkedin'].includes(platform));
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
                    <Button style="gradient" disabled={isBusy} onClick={() => void schedule(draft, false)}>
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
                    <Button style="white" disabled={isBusy} onClick={() => void schedule(draft, true)}>
                      <MdOutlineSchedule />
                      Modifier l’horaire
                    </Button>
                    <Button style="red" disabled={isBusy} onClick={() => void cancel(draft, 'la programmation')}>
                      <MdCancel />
                      Annuler la programmation
                    </Button>
                  </>
                )}
                {draft.statut === 'echec_publication' && (
                  <>
                    <Button style="gradient" disabled={isBusy} onClick={() => void retryFailed(draft)}>
                      <MdSend />
                      Publier maintenant
                    </Button>
                    <Button style="red" disabled={isBusy} onClick={() => void deleteFailed(draft)}>
                      <MdDeleteOutline />
                      Supprimer le brouillon
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
                  <Button style="red" disabled={isBusy} onClick={() => void cancel(draft, 'ce brouillon')}>
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
