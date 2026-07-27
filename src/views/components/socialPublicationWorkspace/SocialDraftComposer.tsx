import { useMemo, useState, type FormEvent, type ReactElement } from 'react';
import Select from 'react-select';
import type { MultiValue, SingleValue } from 'react-select';
import { MdAdd, MdOpenInNew, MdOutlineImage, MdRefresh } from 'react-icons/md';
import type { SocialPublicationState } from '../../../hooks/index.ts';
import type { SocialDraftInput, SocialPlatform } from '../../../utils/types/index.ts';
import { Button } from '../index.ts';
import {
  categoryOptions,
  emptySocialText,
  platformLabels,
  platformOptions,
  type SocialSelectOption,
} from './socialPublication.constants.ts';

export function SocialDraftComposer({ state }: { state: SocialPublicationState }): ReactElement {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SocialDraftInput['categorie']>('valeur');
  const [desiredDate, setDesiredDate] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>(['facebook', 'instagram', 'linkedin']);
  const [textes, setTextes] = useState<Record<SocialPlatform, string>>({ ...emptySocialText });
  const [visualId, setVisualId] = useState<string | null>(null);
  const [visualUrl, setVisualUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState<{ error: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const visualOptions = useMemo<SocialSelectOption<string>[]>(
    () => state.visuals.map((visual) => ({
      value: visual.fileId,
      label: visual.folder ? `${visual.folder} · ${visual.name}` : visual.name,
    })),
    [state.visuals],
  );
  const selectedVisual = state.visuals.find((visual) => visual.fileId === visualId) ?? null;

  const selectVisual = (option: SingleValue<SocialSelectOption<string>>) => {
    const visual = state.visuals.find((item) => item.fileId === option?.value);
    setVisualId(visual?.fileId ?? null);
    if (!visual) return;
    setVisualUrl(visual.directViewUrl || visual.webViewLink);
    if (!notes.trim()) setNotes(`Bibliothèque Drive · ${visual.name}`);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPlatforms.length) {
      setFeedback({ error: true, message: 'Sélectionnez au moins un réseau social.' });
      return;
    }
    setIsSaving(true);
    setFeedback(null);
    try {
      await state.createDraft({
        sujet: subject,
        categorie: category,
        plateformes: selectedPlatforms,
        textes,
        date_souhaitee: desiredDate ? new Date(desiredDate).toISOString() : null,
        visuel_drive_id: visualId,
        visuel_url: visualUrl.trim() || null,
        visuel_notes: notes.trim() || null,
      });
      setSubject('');
      setCategory('valeur');
      setDesiredDate('');
      setSelectedPlatforms(['facebook', 'instagram', 'linkedin']);
      setTextes({ ...emptySocialText });
      setVisualId(null);
      setVisualUrl('');
      setNotes('');
      setFeedback({ error: false, message: 'Brouillon enregistré. Il attend maintenant la validation Mehdi.' });
    } catch (error: unknown) {
      setFeedback({ error: true, message: error instanceof Error ? error.message : 'Création impossible.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="socialPublicationView__panel">
      <div className="socialPublicationView__panel-header">
        <div className="socialPublicationView__heading-copy">
          <MdAdd />
          <div>
            <span className="socialPublicationView__section-kicker">Création</span>
            <h2>Nouveau brouillon</h2>
            <p>Préparez les variantes, la date souhaitée et le visuel qui seront relus avant programmation.</p>
          </div>
        </div>
      </div>
      <form onSubmit={(event) => void submit(event)} className="socialPublicationView__form">
        <label className="socialPublicationView__field">
          <span>Sujet</span>
          <input value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={120} placeholder="Ex. Retour sur notre expertise terrain" required />
        </label>
        <label className="socialPublicationView__field">
          <span>Catégorie</span>
          <Select<SocialSelectOption<SocialDraftInput['categorie']>, false>
            options={categoryOptions}
            value={categoryOptions.find((option) => option.value === category) ?? null}
            onChange={(option) => setCategory(option?.value ?? 'valeur')}
            isSearchable={false}
            classNamePrefix="socialSelect"
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </label>
        <label className="socialPublicationView__field">
          <span>Date souhaitée</span>
          <input type="datetime-local" value={desiredDate} onChange={(event) => setDesiredDate(event.target.value)} />
        </label>
        <label className="socialPublicationView__field">
          <span>Réseaux actifs</span>
          <Select<SocialSelectOption<SocialPlatform>, true>
            options={platformOptions}
            value={platformOptions.filter((option) => selectedPlatforms.includes(option.value))}
            onChange={(options: MultiValue<SocialSelectOption<SocialPlatform>>) => setSelectedPlatforms(options.map((option) => option.value))}
            isMulti
            classNamePrefix="socialSelect"
            menuPortalTarget={document.body}
            menuPosition="fixed"
          />
        </label>
        {selectedPlatforms.map((platform) => (
          <label className="socialPublicationView__field socialPublicationView__wide" key={platform}>
            <span>Texte {platformLabels[platform]}</span>
            <textarea
              value={textes[platform]}
              onChange={(event) => setTextes((current) => ({ ...current, [platform]: event.target.value }))}
              placeholder={`Version ${platformLabels[platform]} de la publication`}
              rows={4}
            />
          </label>
        ))}
        <div className="socialPublicationView__visual socialPublicationView__wide">
          <div className="socialPublicationView__visual-header">
            <div>
              <MdOutlineImage />
              <span>Bibliothèque Google Drive</span>
            </div>
            <Button style="white" onClick={() => void state.refreshVisuals()} disabled={state.isRefreshingVisuals}>
              <MdRefresh />
              {state.isRefreshingVisuals ? 'Actualisation…' : 'Actualiser la bibliothèque'}
            </Button>
          </div>
          <label className="socialPublicationView__field">
            <span>Visuel sélectionné</span>
            <Select<SocialSelectOption<string>, false>
              options={visualOptions}
              value={visualOptions.find((option) => option.value === visualId) ?? null}
              onChange={selectVisual}
              placeholder="Rechercher un visuel dans la bibliothèque"
              noOptionsMessage={() => 'Aucun visuel disponible'}
              isClearable
              classNamePrefix="socialSelect"
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </label>
          <p className={`socialPublicationView__field-help${state.visualError ? ' socialPublicationView__field-help--error' : ''}`}>
            {state.visualError || `${state.visuals.length} visuel(s) disponible(s) dans Drive.`}
          </p>
          {selectedVisual && (
            <a href={selectedVisual.webViewLink} target="_blank" rel="noreferrer" className="socialPublicationView__drive-link">
              <MdOpenInNew />
              Ouvrir le visuel dans Drive
            </a>
          )}
        </div>
        <label className="socialPublicationView__field socialPublicationView__wide">
          <span>Lien du visuel Google Drive</span>
          <input
            type="url"
            value={visualUrl}
            onChange={(event) => {
              setVisualUrl(event.target.value);
              if (event.target.value !== selectedVisual?.directViewUrl && event.target.value !== selectedVisual?.webViewLink) setVisualId(null);
            }}
            placeholder="https://drive.google.com/..."
          />
        </label>
        <label className="socialPublicationView__field socialPublicationView__wide">
          <span>Note visuelle</span>
          <input value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={240} placeholder="Direction artistique ou version du visuel" />
        </label>
        <div className="socialPublicationView__form-actions">
          <Button style="gradient" type="submit" disabled={isSaving}>
            <MdAdd />
            {isSaving ? 'Enregistrement…' : 'Enregistrer le brouillon'}
          </Button>
        </div>
        {feedback && <p className={`socialPublicationView__feedback socialPublicationView__wide${feedback.error ? ' socialPublicationView__feedback--error' : ''}`}>{feedback.message}</p>}
      </form>
    </section>
  );
}
