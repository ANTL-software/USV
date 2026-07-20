import type { ReactElement } from 'react';
import { IoSave } from 'react-icons/io5';
import type { IncidentTreatmentViewModel } from '../../../hooks/index.ts';
import {
  INCIDENT_TREATMENT_STATUS_OPTIONS,
} from '../../../utils/scripts/index.ts';
import type { IncidentTreatmentStatus } from '../../../utils/scripts/index.ts';
import { INCIDENT_CLASSIFICATION_OPTIONS } from '../../../utils/types/index.ts';

type IncidentTreatmentFormProps = Pick<
  IncidentTreatmentViewModel,
  'form' | 'isSaving' | 'submit' | 'updateField'
>;

export function IncidentTreatmentForm({
  form,
  isSaving,
  submit,
  updateField,
}: IncidentTreatmentFormProps): ReactElement {
  return (
    <form className="incidents__form" onSubmit={(event) => void submit(event)}>
      <div className="incidents__grid">
        <div className="incidents__field">
          <label htmlFor="statut">Statut</label>
          <select
            id="statut"
            value={form.statut}
            onChange={(event) => updateField('statut', event.target.value as IncidentTreatmentStatus)}
            disabled={isSaving}
          >
            {INCIDENT_TREATMENT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="incidents__field">
          <label htmlFor="classification-traitement">Classification</label>
          <input
            id="classification-traitement"
            list="classification-traitement-options"
            value={form.classification}
            onChange={(event) => updateField('classification', event.target.value)}
            disabled={isSaving}
          />
          <datalist id="classification-traitement-options">
            {INCIDENT_CLASSIFICATION_OPTIONS.map((option) => <option key={option} value={option} />)}
          </datalist>
        </div>
        <div className="incidents__field">
          <label htmlFor="temps">Temps passé (min)</label>
          <input
            id="temps"
            type="number"
            min="0"
            value={form.temps_passe_minutes}
            onChange={(event) => updateField('temps_passe_minutes', event.target.value)}
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="incidents__field incidents__field--wide">
        <label htmlFor="commentaire_traitement">Commentaire de traitement</label>
        <textarea id="commentaire_traitement" rows={3} value={form.commentaire_traitement} onChange={(event) => updateField('commentaire_traitement', event.target.value)} disabled={isSaving} />
      </div>
      <div className="incidents__field incidents__field--wide">
        <label htmlFor="cause_racine">Cause racine</label>
        <textarea id="cause_racine" rows={3} value={form.cause_racine} onChange={(event) => updateField('cause_racine', event.target.value)} disabled={isSaving} />
      </div>
      <div className="incidents__field incidents__field--wide">
        <label htmlFor="solution">Solution</label>
        <textarea id="solution" rows={4} value={form.solution} onChange={(event) => updateField('solution', event.target.value)} disabled={isSaving} />
      </div>
      <div className="incidents__field incidents__field--wide">
        <label htmlFor="actions_correctives">Actions correctives</label>
        <textarea id="actions_correctives" rows={3} value={form.actions_correctives} onChange={(event) => updateField('actions_correctives', event.target.value)} disabled={isSaving} />
      </div>
      <div className="incidents__field incidents__field--wide">
        <label htmlFor="commentaire_cloture">Commentaire de clôture</label>
        <textarea id="commentaire_cloture" rows={3} value={form.commentaire_cloture} onChange={(event) => updateField('commentaire_cloture', event.target.value)} disabled={isSaving} />
      </div>

      <div className="incidents__actions">
        <button type="submit" className="incidents__btn-primary" disabled={isSaving}>
          <IoSave /> {isSaving ? 'Enregistrement...' : 'Enregistrer le traitement'}
        </button>
      </div>
    </form>
  );
}
