import './incidents.scss';

import { FormEvent, ReactElement, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoAlertCircleOutline, IoSave } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';
import { useEmployes } from '../../../hooks/useEmployes';
import { useNotifications } from '../../../hooks/useNotifications';
import { useIncident } from '../../../hooks/useIncidents';
import type {
  CreateIncidentPayload,
  CreateIncidentResult,
  IncidentCriticite,
  IncidentEnvironnement,
  IncidentImpact,
  IncidentImpactUtilisateurs,
  IncidentPriorite,
  IncidentSecteur,
  IncidentSource,
  IncidentUrgence,
} from '../../../utils/types/incident.types';
import {
  INCIDENT_CRITICITE_OPTIONS,
  INCIDENT_ENVIRONNEMENT_OPTIONS,
  INCIDENT_IMPACT_OPTIONS,
  INCIDENT_IMPACT_UTILISATEURS_OPTIONS,
  INCIDENT_PRIORITE_OPTIONS,
  INCIDENT_SECTEUR_OPTIONS,
  INCIDENT_SOURCE_OPTIONS,
  INCIDENT_URGENCE_OPTIONS,
} from '../../../utils/types/incident.types';
import IncidentSelect from './IncidentSelect';

import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

interface DeclarationFormState {
  titre: string;
  description: string;
  source: IncidentSource;
  secteur: IncidentSecteur;
  sous_secteur: string;
  impact: IncidentImpact;
  criticite: IncidentCriticite;
  priorite: IncidentPriorite;
  urgence: IncidentUrgence;
  environnement: IncidentEnvironnement;
  impact_utilisateurs: IncidentImpactUtilisateurs;
  id_utilisateur_impacte: string;
  origine: string;
  tags: string;
  commentaire: string;
}

const INITIAL_FORM: DeclarationFormState = {
  titre: '',
  description: '',
  source: 'usv',
  secteur: 'software',
  sous_secteur: '',
  impact: 'interne',
  criticite: 'mineure',
  priorite: 'normale',
  urgence: 'moyenne',
  environnement: 'production',
  impact_utilisateurs: 'tous',
  id_utilisateur_impacte: '',
  origine: 'interne',
  tags: '',
  commentaire: '',
};

const parseTags = (value: string): string[] => value
  .split(',')
  .map(tag => tag.trim())
  .filter(Boolean);

function IncidentDeclaration(): ReactElement {
  const navigate = useNavigate();
  const { employes } = useEmployes();
  const { refreshNotifications } = useNotifications();
  const { create } = useIncident();
  const [form, setForm] = useState<DeclarationFormState>(INITIAL_FORM);
  const [createdResult, setCreatedResult] = useState<CreateIncidentResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = <K extends keyof DeclarationFormState>(field: K, value: DeclarationFormState[K]) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.titre.trim() || !form.description.trim()) {
      setError('Le titre et la description sont requis.');
      return;
    }
    if (form.impact_utilisateurs === 'specifique' && !form.id_utilisateur_impacte) {
      setError('Sélectionnez l’utilisateur impacté.');
      return;
    }

    setIsSaving(true);
    const payload: CreateIncidentPayload = {
      titre: form.titre.trim(),
      description: form.description.trim(),
      source: form.source,
      secteur: form.secteur,
      sous_secteur: form.sous_secteur.trim() || undefined,
      impact: form.impact,
      criticite: form.criticite,
      priorite: form.priorite,
      urgence: form.urgence,
      environnement: form.environnement,
      impact_utilisateurs: form.impact_utilisateurs,
      id_utilisateur_impacte: form.impact_utilisateurs === 'specifique'
        ? Number(form.id_utilisateur_impacte)
        : null,
      origine: form.origine.trim() || 'interne',
      tags: parseTags(form.tags),
      commentaire: form.commentaire.trim() || undefined,
    };

    const created = await create(payload);
    setIsSaving(false);

    if (created) {
      setCreatedResult(created);
      setForm(INITIAL_FORM);
      await refreshNotifications();
    }
  };

  const employeOptions = employes
    .filter(employe => employe.actif)
    .map(employe => ({
      value: String(employe.id_employe),
      label: `${employe.prenom} ${employe.nom.toUpperCase()} (${employe.identifiant})`
    }));

  return (
    <div id="incidentDeclaration">
      <Header />
      <SubNav />
      <main>
        <div className="incidents__container">
          <div className="incidents__header">
            <Button style="back" onClick={() => navigate('/incidents')}>
              <MdArrowBack />
              <span>Retour</span>
            </Button>
            <h1><IoAlertCircleOutline /> Déclarer un incident</h1>
          </div>

          {error && <div className="incidents__error">{error}</div>}
          {createdResult && (
            <div className="incidents__success">
              <span>
                Incident {createdResult.incident.reference} déclaré.
                {createdResult.meta?.emailNotification?.success === false && ' Notification email non envoyée.'}
              </span>
              <button type="button" onClick={() => navigate(`/incidents/traitement/${createdResult.incident.id_incident}`)}>
                Consulter
              </button>
            </div>
          )}

          <form className="incidents__form" onSubmit={handleSubmit}>
            <div className="incidents__field incidents__field--wide">
              <label htmlFor="titre">Titre *</label>
              <input
                id="titre"
                value={form.titre}
                onChange={event => updateField('titre', event.target.value)}
                placeholder="Ex: Impossible de lancer un appel sortant"
                disabled={isSaving}
              />
            </div>

            <div className="incidents__field incidents__field--wide">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                value={form.description}
                onChange={event => updateField('description', event.target.value)}
                rows={5}
                placeholder="Contexte, symptômes, personnes impactées, étapes déjà réalisées..."
                disabled={isSaving}
              />
            </div>

            <div className="incidents__grid">
              <div className="incidents__field">
                <label htmlFor="source">Source</label>
                <IncidentSelect
                  inputId="source"
                  options={INCIDENT_SOURCE_OPTIONS}
                  value={form.source}
                  onChange={value => updateField('source', (value ?? 'usv') as IncidentSource)}
                  disabled={isSaving}
                />
              </div>

              <div className="incidents__field">
                <label htmlFor="secteur">Secteur impacté</label>
                <IncidentSelect
                  inputId="secteur"
                  options={INCIDENT_SECTEUR_OPTIONS}
                  value={form.secteur}
                  onChange={value => updateField('secteur', (value ?? 'software') as IncidentSecteur)}
                  disabled={isSaving}
                />
              </div>

              <div className="incidents__field">
                <label htmlFor="sous_secteur">Sous-secteur</label>
                <input id="sous_secteur" value={form.sous_secteur} onChange={event => updateField('sous_secteur', event.target.value)} disabled={isSaving} />
              </div>

              <div className="incidents__field">
                <label htmlFor="impact">Impact</label>
                <IncidentSelect
                  inputId="impact"
                  options={INCIDENT_IMPACT_OPTIONS}
                  value={form.impact}
                  onChange={value => updateField('impact', (value ?? 'interne') as IncidentImpact)}
                  disabled={isSaving}
                />
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
                    setError(null);
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
                <IncidentSelect
                  inputId="criticite"
                  options={INCIDENT_CRITICITE_OPTIONS}
                  value={form.criticite}
                  onChange={value => updateField('criticite', (value ?? 'mineure') as IncidentCriticite)}
                  disabled={isSaving}
                />
              </div>

              <div className="incidents__field">
                <label htmlFor="priorite">Priorité</label>
                <IncidentSelect
                  inputId="priorite"
                  options={INCIDENT_PRIORITE_OPTIONS}
                  value={form.priorite}
                  onChange={value => updateField('priorite', (value ?? 'normale') as IncidentPriorite)}
                  disabled={isSaving}
                />
              </div>

              <div className="incidents__field">
                <label htmlFor="urgence">Urgence</label>
                <IncidentSelect
                  inputId="urgence"
                  options={INCIDENT_URGENCE_OPTIONS}
                  value={form.urgence}
                  onChange={value => updateField('urgence', (value ?? 'moyenne') as IncidentUrgence)}
                  disabled={isSaving}
                />
              </div>

              <div className="incidents__field">
                <label htmlFor="environnement">Environnement</label>
                <IncidentSelect
                  inputId="environnement"
                  options={INCIDENT_ENVIRONNEMENT_OPTIONS}
                  value={form.environnement}
                  onChange={value => updateField('environnement', (value ?? 'production') as IncidentEnvironnement)}
                  disabled={isSaving}
                />
              </div>

              <div className="incidents__field">
                <label htmlFor="origine">Origine</label>
                <input id="origine" value={form.origine} onChange={event => updateField('origine', event.target.value)} disabled={isSaving} />
              </div>

              <div className="incidents__field">
                <label htmlFor="tags">Tags</label>
                <input id="tags" value={form.tags} onChange={event => updateField('tags', event.target.value)} placeholder="twilio, urgence, prod" disabled={isSaving} />
              </div>
            </div>

            <div className="incidents__field incidents__field--wide">
              <label htmlFor="commentaire">Commentaire initial</label>
              <textarea id="commentaire" value={form.commentaire} onChange={event => updateField('commentaire', event.target.value)} rows={3} disabled={isSaving} />
            </div>

            <div className="incidents__actions">
              <button type="button" className="incidents__btn-secondary" onClick={() => navigate('/incidents')} disabled={isSaving}>
                Annuler
              </button>
              <button type="submit" className="incidents__btn-primary" disabled={isSaving}>
                <IoSave />
                {isSaving ? 'Déclaration...' : 'Déclarer'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const IncidentDeclarationWithAuth = WithAuth(IncidentDeclaration);
export default IncidentDeclarationWithAuth;
