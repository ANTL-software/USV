import './incidents.scss';

import { FormEvent, ReactElement, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoClipboardOutline, IoSave } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';
import { useEmployes } from '../../../hooks/useEmployes';
import { useIncident, useIncidents } from '../../../hooks/useIncidents';
import type {
  IncidentCriticite,
  IncidentEnvironnement,
  IncidentImpact,
  IncidentImpactUtilisateurs,
  IncidentPriorite,
  IncidentSecteur,
  IncidentSource,
  IncidentUrgence,
  QualifierIncidentPayload,
} from '../../../utils/types/incident.types';
import {
  formatIncidentEmploye,
  INCIDENT_CLASSIFICATION_OPTIONS,
  INCIDENT_CRITICITE_OPTIONS,
  INCIDENT_ENVIRONNEMENT_OPTIONS,
  INCIDENT_IMPACT_OPTIONS,
  INCIDENT_IMPACT_UTILISATEURS_OPTIONS,
  INCIDENT_PRIORITE_OPTIONS,
  INCIDENT_SECTEUR_LABELS,
  INCIDENT_SECTEUR_OPTIONS,
  INCIDENT_SOURCE_OPTIONS,
  INCIDENT_STATUT_LABELS,
  INCIDENT_URGENCE_OPTIONS,
} from '../../../utils/types/incident.types';
import { formatDate } from '../../../utils/scripts/formatters';
import IncidentSelect from './IncidentSelect';

import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

interface QualificationFormState {
  secteur: IncidentSecteur;
  sous_secteur: string;
  impact: IncidentImpact;
  criticite: IncidentCriticite;
  priorite: IncidentPriorite;
  urgence: IncidentUrgence;
  classification: string;
  source: IncidentSource;
  environnement: IncidentEnvironnement;
  impact_utilisateurs: IncidentImpactUtilisateurs;
  id_utilisateur_impacte: string;
  id_intervenant: string;
  commentaire_qualification: string;
  tags: string;
}

const parseTags = (value: string): string[] => value
  .split(',')
  .map(tag => tag.trim())
  .filter(Boolean);

function IncidentQualification(): ReactElement {
  const navigate = useNavigate();
  const { employes } = useEmployes();
  const { incidents, isLoading, error, refresh } = useIncidents({ limit: 100 });
  const { qualify } = useIncident();
  const incidentsAQualifier = useMemo(
    () => incidents.filter(incident => incident.statut === 'declare' || incident.statut === 'qualifie'),
    [incidents]
  );
  const [selectedId, setSelectedId] = useState('');
  const selectedIncident = incidentsAQualifier.find(incident => String(incident.id_incident) === selectedId) ?? null;
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<QualificationFormState>({
    secteur: 'software',
    sous_secteur: '',
    impact: 'interne',
    criticite: 'mineure',
    priorite: 'normale',
    urgence: 'moyenne',
    classification: '',
    source: 'usv',
    environnement: 'production',
    impact_utilisateurs: 'tous',
    id_utilisateur_impacte: '',
    id_intervenant: '',
    commentaire_qualification: '',
    tags: '',
  });

  useEffect(() => {
    if (!selectedId && incidentsAQualifier.length > 0) {
      setSelectedId(String(incidentsAQualifier[0].id_incident));
    }
  }, [incidentsAQualifier, selectedId]);

  useEffect(() => {
    if (!selectedIncident) return;
    setForm({
      secteur: selectedIncident.secteur,
      sous_secteur: selectedIncident.sous_secteur ?? '',
      impact: selectedIncident.impact,
      criticite: selectedIncident.criticite,
      priorite: selectedIncident.priorite,
      urgence: selectedIncident.urgence,
      classification: selectedIncident.classification ?? '',
      source: selectedIncident.source,
      environnement: selectedIncident.environnement,
      impact_utilisateurs: selectedIncident.impact_utilisateurs,
      id_utilisateur_impacte: selectedIncident.id_utilisateur_impacte ? String(selectedIncident.id_utilisateur_impacte) : '',
      id_intervenant: selectedIncident.id_intervenant ? String(selectedIncident.id_intervenant) : '',
      commentaire_qualification: selectedIncident.commentaire_qualification ?? '',
      tags: selectedIncident.tags.join(', '),
    });
    setSuccess(null);
  }, [selectedIncident]);

  const updateField = <K extends keyof QualificationFormState>(field: K, value: QualificationFormState[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setSuccess(null);
    setFormError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedIncident) return;
    if (form.impact_utilisateurs === 'specifique' && !form.id_utilisateur_impacte) {
      setFormError('Sélectionnez l’utilisateur impacté.');
      return;
    }

    setIsSaving(true);
    const payload: QualifierIncidentPayload = {
      secteur: form.secteur,
      sous_secteur: form.sous_secteur.trim() || undefined,
      impact: form.impact,
      criticite: form.criticite,
      priorite: form.priorite,
      urgence: form.urgence,
      classification: form.classification.trim() || undefined,
      source: form.source,
      environnement: form.environnement,
      impact_utilisateurs: form.impact_utilisateurs,
      id_utilisateur_impacte: form.impact_utilisateurs === 'specifique'
        ? Number(form.id_utilisateur_impacte)
        : null,
      id_intervenant: form.id_intervenant ? Number(form.id_intervenant) : null,
      commentaire_qualification: form.commentaire_qualification.trim() || undefined,
      tags: parseTags(form.tags),
    };

    const updated = await qualify(selectedIncident.id_incident, payload);
    setIsSaving(false);

    if (updated) {
      setSuccess(`${updated.reference} qualifié.`);
      await refresh();
    }
  };

  const employeOptions = employes
    .filter(employe => employe.actif)
    .map(employe => ({ value: String(employe.id_employe), label: `${employe.prenom} ${employe.nom.toUpperCase()} (${employe.identifiant})` }));

  return (
    <div id="incidentQualification">
      <Header />
      <SubNav />
      <main>
        <div className="incidents__container">
          <div className="incidents__header">
            <Button style="back" onClick={() => navigate('/incidents')}>
              <MdArrowBack />
              <span>Retour</span>
            </Button>
            <h1><IoClipboardOutline /> Qualification des incidents</h1>
          </div>

          {error && <div className="incidents__error">{error}</div>}
          {formError && <div className="incidents__error">{formError}</div>}
          {success && <div className="incidents__success">{success}</div>}

          <div className="incidents__layout">
            <aside className="incidents__sidebar">
              <h2>À qualifier</h2>
              {isLoading ? (
                <p>Chargement...</p>
              ) : incidentsAQualifier.length === 0 ? (
                <p>Aucun incident à qualifier.</p>
              ) : (
                <div className="incidents__selection-list">
                  {incidentsAQualifier.map(incident => (
                    <button
                      key={incident.id_incident}
                      type="button"
                      className={selectedId === String(incident.id_incident) ? 'active' : ''}
                      onClick={() => setSelectedId(String(incident.id_incident))}
                    >
                      <strong>{incident.reference}</strong>
                      <span>{incident.titre}</span>
                      <small>{INCIDENT_SECTEUR_LABELS[incident.secteur]} · {INCIDENT_STATUT_LABELS[incident.statut]}</small>
                    </button>
                  ))}
                </div>
              )}
            </aside>

            <section className="incidents__panel">
              {selectedIncident ? (
                <>
                  <div className="incidents__summary">
                    <span className={`incidents__badge incidents__badge--${selectedIncident.statut}`}>{INCIDENT_STATUT_LABELS[selectedIncident.statut]}</span>
                    <h2>{selectedIncident.titre}</h2>
                    <p>{selectedIncident.description}</p>
                    <dl>
                      <div><dt>Déclarant</dt><dd>{formatIncidentEmploye(selectedIncident.declarant)}</dd></div>
                      <div><dt>Date</dt><dd>{formatDate(selectedIncident.created_at)}</dd></div>
                      <div><dt>Référence</dt><dd>{selectedIncident.reference}</dd></div>
                    </dl>
                  </div>

                  <form className="incidents__form" onSubmit={handleSubmit}>
                    <div className="incidents__grid">
                      <div className="incidents__field">
                        <label htmlFor="secteur">Secteur</label>
                        <IncidentSelect inputId="secteur" options={INCIDENT_SECTEUR_OPTIONS} value={form.secteur} onChange={value => updateField('secteur', (value ?? 'software') as IncidentSecteur)} disabled={isSaving} />
                      </div>
                      <div className="incidents__field">
                        <label htmlFor="sous_secteur">Sous-secteur</label>
                        <input id="sous_secteur" value={form.sous_secteur} onChange={event => updateField('sous_secteur', event.target.value)} disabled={isSaving} />
                      </div>
                      <div className="incidents__field">
                        <label htmlFor="source">Source</label>
                        <IncidentSelect inputId="source" options={INCIDENT_SOURCE_OPTIONS} value={form.source} onChange={value => updateField('source', (value ?? 'usv') as IncidentSource)} disabled={isSaving} />
                      </div>
                      <div className="incidents__field">
                        <label htmlFor="environnement">Environnement</label>
                        <IncidentSelect inputId="environnement" options={INCIDENT_ENVIRONNEMENT_OPTIONS} value={form.environnement} onChange={value => updateField('environnement', (value ?? 'production') as IncidentEnvironnement)} disabled={isSaving} />
                      </div>
                      <div className="incidents__field">
                        <label htmlFor="impact">Impact</label>
                        <IncidentSelect inputId="impact" options={INCIDENT_IMPACT_OPTIONS} value={form.impact} onChange={value => updateField('impact', (value ?? 'interne') as IncidentImpact)} disabled={isSaving} />
                      </div>
                      <div className="incidents__field">
                        <label htmlFor="impact_utilisateurs">Utilisateurs impactés</label>
                        <IncidentSelect
                          inputId="impact_utilisateurs"
                          options={INCIDENT_IMPACT_UTILISATEURS_OPTIONS}
                          value={form.impact_utilisateurs}
                          onChange={value => {
                            const next = (value ?? 'tous') as IncidentImpactUtilisateurs;
                            setForm(prev => ({
                              ...prev,
                              impact_utilisateurs: next,
                              id_utilisateur_impacte: next === 'tous' ? '' : prev.id_utilisateur_impacte,
                            }));
                            setSuccess(null);
                            setFormError(null);
                          }}
                          disabled={isSaving}
                        />
                      </div>
                      {form.impact_utilisateurs === 'specifique' && (
                        <div className="incidents__field">
                          <label htmlFor="id_utilisateur_impacte">Utilisateur impacté</label>
                          <IncidentSelect
                            inputId="id_utilisateur_impacte"
                            options={employeOptions}
                            value={form.id_utilisateur_impacte || null}
                            onChange={value => updateField('id_utilisateur_impacte', value ?? '')}
                            placeholder="Sélectionner un utilisateur"
                            disabled={isSaving}
                            isClearable
                          />
                        </div>
                      )}
                      <div className="incidents__field">
                        <label htmlFor="criticite">Criticité</label>
                        <IncidentSelect inputId="criticite" options={INCIDENT_CRITICITE_OPTIONS} value={form.criticite} onChange={value => updateField('criticite', (value ?? 'mineure') as IncidentCriticite)} disabled={isSaving} />
                      </div>
                      <div className="incidents__field">
                        <label htmlFor="priorite">Priorité</label>
                        <IncidentSelect inputId="priorite" options={INCIDENT_PRIORITE_OPTIONS} value={form.priorite} onChange={value => updateField('priorite', (value ?? 'normale') as IncidentPriorite)} disabled={isSaving} />
                      </div>
                      <div className="incidents__field">
                        <label htmlFor="urgence">Urgence</label>
                        <IncidentSelect inputId="urgence" options={INCIDENT_URGENCE_OPTIONS} value={form.urgence} onChange={value => updateField('urgence', (value ?? 'moyenne') as IncidentUrgence)} disabled={isSaving} />
                      </div>
                      <div className="incidents__field">
                        <label htmlFor="classification">Classification</label>
                        <input id="classification" list="classification-options" value={form.classification} onChange={event => updateField('classification', event.target.value)} disabled={isSaving} />
                        <datalist id="classification-options">
                          {INCIDENT_CLASSIFICATION_OPTIONS.map(option => <option key={option} value={option} />)}
                        </datalist>
                      </div>
                      <div className="incidents__field">
                        <label htmlFor="id_intervenant">Intervenant</label>
                        <IncidentSelect
                          inputId="id_intervenant"
                          options={employeOptions}
                          value={form.id_intervenant || null}
                          onChange={value => updateField('id_intervenant', value ?? '')}
                          placeholder="Non assigné"
                          disabled={isSaving}
                          isClearable
                        />
                      </div>
                      <div className="incidents__field incidents__field--wide">
                        <label htmlFor="tags">Tags</label>
                        <input id="tags" value={form.tags} onChange={event => updateField('tags', event.target.value)} disabled={isSaving} />
                      </div>
                    </div>

                    <div className="incidents__field incidents__field--wide">
                      <label htmlFor="commentaire_qualification">Commentaire de qualification</label>
                      <textarea id="commentaire_qualification" value={form.commentaire_qualification} onChange={event => updateField('commentaire_qualification', event.target.value)} rows={4} disabled={isSaving} />
                    </div>

                    <div className="incidents__actions">
                      <button type="submit" className="incidents__btn-primary" disabled={isSaving}>
                        <IoSave />
                        {isSaving ? 'Enregistrement...' : 'Qualifier'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="incidents__empty">Sélectionnez un incident à qualifier.</div>
              )}
            </section>
          </div>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const IncidentQualificationWithAuth = WithAuth(IncidentQualification);
export default IncidentQualificationWithAuth;
