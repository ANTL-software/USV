import type { ReactElement } from 'react';
import { IoSave } from 'react-icons/io5';
import type { IncidentDeclarationViewModel } from '../../../hooks/index.ts';
import type { IncidentCriticite, IncidentEnvironnement, IncidentImpact, IncidentImpactUtilisateurs, IncidentPriorite, IncidentSecteur, IncidentSource, IncidentUrgence } from '../../../utils/types/index.ts';
import { INCIDENT_CRITICITE_OPTIONS, INCIDENT_ENVIRONNEMENT_OPTIONS, INCIDENT_IMPACT_OPTIONS, INCIDENT_IMPACT_UTILISATEURS_OPTIONS, INCIDENT_PRIORITE_OPTIONS, INCIDENT_SECTEUR_OPTIONS, INCIDENT_SOURCE_OPTIONS, INCIDENT_URGENCE_OPTIONS } from '../../../utils/types/index.ts';
import { IncidentSelect } from '../incidentSelect/index.ts';

interface IncidentDeclarationFormProps { viewModel: IncidentDeclarationViewModel }

export function IncidentDeclarationForm({ viewModel }: IncidentDeclarationFormProps): ReactElement {
  const { form, isSaving, updateField } = viewModel;
  return (
    <form className="incidents__form" onSubmit={viewModel.submit}>
      <div className="incidents__field incidents__field--wide"><label htmlFor="titre">Titre *</label><input id="titre" value={form.titre} onChange={(event) => updateField('titre', event.target.value)} placeholder="Ex: Impossible de lancer un appel sortant" disabled={isSaving} /></div>
      <div className="incidents__field incidents__field--wide"><label htmlFor="description">Description *</label><textarea id="description" value={form.description} onChange={(event) => updateField('description', event.target.value)} rows={5} placeholder="Contexte, symptômes, personnes impactées, étapes déjà réalisées..." disabled={isSaving} /></div>
      <div className="incidents__grid">
        <div className="incidents__field"><label htmlFor="source">Source</label><IncidentSelect inputId="source" options={INCIDENT_SOURCE_OPTIONS} value={form.source} onChange={(value) => updateField('source', (value ?? 'usv') as IncidentSource)} disabled={isSaving} /></div>
        <div className="incidents__field"><label htmlFor="secteur">Secteur impacté</label><IncidentSelect inputId="secteur" options={INCIDENT_SECTEUR_OPTIONS} value={form.secteur} onChange={(value) => updateField('secteur', (value ?? 'software') as IncidentSecteur)} disabled={isSaving} /></div>
        <div className="incidents__field"><label htmlFor="sous_secteur">Sous-secteur</label><input id="sous_secteur" value={form.sous_secteur} onChange={(event) => updateField('sous_secteur', event.target.value)} disabled={isSaving} /></div>
        <div className="incidents__field"><label htmlFor="impact">Impact</label><IncidentSelect inputId="impact" options={INCIDENT_IMPACT_OPTIONS} value={form.impact} onChange={(value) => updateField('impact', (value ?? 'interne') as IncidentImpact)} disabled={isSaving} /></div>
        <div className="incidents__field"><label htmlFor="impact_utilisateurs">Utilisateurs impactés</label><IncidentSelect inputId="impact_utilisateurs" options={INCIDENT_IMPACT_UTILISATEURS_OPTIONS} value={form.impact_utilisateurs} onChange={(value) => viewModel.updateImpactedUsers((value ?? 'tous') as IncidentImpactUtilisateurs)} disabled={isSaving} /></div>
        {form.impact_utilisateurs === 'specifique' && <div className="incidents__field"><label htmlFor="id_utilisateur_impacte">Utilisateur impacté</label><IncidentSelect inputId="id_utilisateur_impacte" options={viewModel.employeeOptions} value={form.id_utilisateur_impacte || null} onChange={(value) => updateField('id_utilisateur_impacte', value ?? '')} placeholder="Sélectionner un utilisateur" disabled={isSaving} isClearable /></div>}
        <div className="incidents__field"><label htmlFor="criticite">Criticité</label><IncidentSelect inputId="criticite" options={INCIDENT_CRITICITE_OPTIONS} value={form.criticite} onChange={(value) => updateField('criticite', (value ?? 'mineure') as IncidentCriticite)} disabled={isSaving} /></div>
        <div className="incidents__field"><label htmlFor="priorite">Priorité</label><IncidentSelect inputId="priorite" options={INCIDENT_PRIORITE_OPTIONS} value={form.priorite} onChange={(value) => updateField('priorite', (value ?? 'normale') as IncidentPriorite)} disabled={isSaving} /></div>
        <div className="incidents__field"><label htmlFor="urgence">Urgence</label><IncidentSelect inputId="urgence" options={INCIDENT_URGENCE_OPTIONS} value={form.urgence} onChange={(value) => updateField('urgence', (value ?? 'moyenne') as IncidentUrgence)} disabled={isSaving} /></div>
        <div className="incidents__field"><label htmlFor="environnement">Environnement</label><IncidentSelect inputId="environnement" options={INCIDENT_ENVIRONNEMENT_OPTIONS} value={form.environnement} onChange={(value) => updateField('environnement', (value ?? 'production') as IncidentEnvironnement)} disabled={isSaving} /></div>
        <div className="incidents__field"><label htmlFor="origine">Origine</label><input id="origine" value={form.origine} onChange={(event) => updateField('origine', event.target.value)} disabled={isSaving} /></div>
        <div className="incidents__field"><label htmlFor="tags">Tags</label><input id="tags" value={form.tags} onChange={(event) => updateField('tags', event.target.value)} placeholder="twilio, urgence, prod" disabled={isSaving} /></div>
      </div>
      <div className="incidents__field incidents__field--wide"><label htmlFor="commentaire">Commentaire initial</label><textarea id="commentaire" value={form.commentaire} onChange={(event) => updateField('commentaire', event.target.value)} rows={3} disabled={isSaving} /></div>
      <div className="incidents__actions"><button type="button" className="incidents__btn-secondary" onClick={viewModel.navigateBack} disabled={isSaving}>Annuler</button><button type="submit" className="incidents__btn-primary" disabled={isSaving}><IoSave />{isSaving ? 'Déclaration...' : 'Déclarer'}</button></div>
    </form>
  );
}
