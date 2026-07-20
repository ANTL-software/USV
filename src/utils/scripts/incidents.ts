import type {
  CreateIncidentPayload,
  Employe,
  Incident,
  IncidentCommentaire,
  IncidentCriticite,
  IncidentEnvironnement,
  IncidentImpact,
  IncidentImpactUtilisateurs,
  IncidentFilters,
  IncidentPriorite,
  IncidentSecteur,
  IncidentSource,
  IncidentStatut,
  IncidentUrgence,
  QualifierIncidentPayload,
  TraiterIncidentPayload,
} from '../types/index.ts';

export type IncidentTreatmentStatus = Extract<
  IncidentStatut,
  'en_traitement' | 'en_attente' | 'resolu' | 'annule'
>;

export interface IncidentSelectOption {
  value: string;
  label: string;
}

export interface IncidentDeclarationFormState {
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

export interface IncidentQualificationFormState {
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

export interface IncidentTreatmentFormState {
  statut: IncidentTreatmentStatus;
  classification: string;
  cause_racine: string;
  solution: string;
  actions_correctives: string;
  commentaire_traitement: string;
  commentaire_cloture: string;
  temps_passe_minutes: string;
}

export interface IncidentListDraftFilters {
  search: string;
  statut: IncidentStatut | 'tous';
  secteur: IncidentSecteur | 'tous';
  source: IncidentSource | 'tous';
  criticite: IncidentCriticite | 'tous';
  priorite: IncidentPriorite | 'tous';
  impact: IncidentImpact | 'tous';
  impact_utilisateurs: IncidentImpactUtilisateurs | 'tous_filtres';
  id_utilisateur_impacte: string;
  id_intervenant: string;
  date_debut: string;
  date_fin: string;
}

export const createIncidentListInitialFilters = (): IncidentListDraftFilters => ({
  search: '', statut: 'tous', secteur: 'tous', source: 'tous', criticite: 'tous', priorite: 'tous', impact: 'tous', impact_utilisateurs: 'tous_filtres', id_utilisateur_impacte: 'tous', id_intervenant: 'tous', date_debut: '', date_fin: '',
});

export function buildIncidentListFilters(draft: IncidentListDraftFilters, limit: number): IncidentFilters {
  return {
    search: draft.search.trim() || undefined,
    statut: draft.statut, secteur: draft.secteur, source: draft.source, criticite: draft.criticite, priorite: draft.priorite, impact: draft.impact,
    impact_utilisateurs: draft.impact_utilisateurs,
    id_utilisateur_impacte: draft.id_utilisateur_impacte === 'tous' ? 'tous' : Number(draft.id_utilisateur_impacte),
    id_intervenant: draft.id_intervenant === 'tous' ? 'tous' : Number(draft.id_intervenant),
    date_debut: draft.date_debut || undefined, date_fin: draft.date_fin || undefined, page: 1, limit,
  };
}

export interface IncidentCommentGroups {
  declaration: IncidentCommentaire[];
  qualification: IncidentCommentaire[];
  traitement: IncidentCommentaire[];
  cloture: IncidentCommentaire[];
  libres: IncidentCommentaire[];
}

export interface IncidentTimelineVisibility {
  closure: boolean;
  qualification: boolean;
  treatment: boolean;
}

export interface IncidentPayloadResult<T> {
  payload: T | null;
  error: string | null;
}

export const INCIDENT_TREATMENT_STATUS_OPTIONS: Array<{
  value: IncidentTreatmentStatus;
  label: string;
}> = [
  { value: 'en_traitement', label: 'En traitement' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'resolu', label: 'Résolu' },
  { value: 'annule', label: 'Annulé' },
];

export const createIncidentDeclarationInitialForm = (): IncidentDeclarationFormState => ({
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
});

export const createIncidentQualificationInitialForm = (): IncidentQualificationFormState => ({
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

export const createIncidentTreatmentInitialForm = (): IncidentTreatmentFormState => ({
  statut: 'en_traitement',
  classification: '',
  cause_racine: '',
  solution: '',
  actions_correctives: '',
  commentaire_traitement: '',
  commentaire_cloture: '',
  temps_passe_minutes: '',
});

export function applyIncidentImpactedUsers<
  Form extends { impact_utilisateurs: IncidentImpactUtilisateurs; id_utilisateur_impacte: string },
>(form: Form, value: IncidentImpactUtilisateurs): Form {
  return {
    ...form,
    impact_utilisateurs: value,
    id_utilisateur_impacte: value === 'tous' ? '' : form.id_utilisateur_impacte,
  };
}

export const parseIncidentTags = (value: string): string[] => value
  .split(',')
  .map((tag) => tag.trim())
  .filter(Boolean);

export const buildIncidentEmployeeOptions = (employes: Employe[]): IncidentSelectOption[] => employes
  .filter((employe) => employe.actif)
  .map((employe) => ({
    value: String(employe.id_employe),
    label: `${employe.prenom} ${employe.nom.toUpperCase()} (${employe.identifiant})`,
  }));

export function buildIncidentDeclarationPayload(
  form: IncidentDeclarationFormState,
): IncidentPayloadResult<CreateIncidentPayload> {
  if (!form.titre.trim() || !form.description.trim()) {
    return { payload: null, error: 'Le titre et la description sont requis.' };
  }
  if (form.impact_utilisateurs === 'specifique' && !form.id_utilisateur_impacte) {
    return { payload: null, error: 'Sélectionnez l’utilisateur impacté.' };
  }

  return {
    error: null,
    payload: {
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
      tags: parseIncidentTags(form.tags),
      commentaire: form.commentaire.trim() || undefined,
    },
  };
}

export const getIncidentQualificationForm = (incident: Incident): IncidentQualificationFormState => ({
  secteur: incident.secteur,
  sous_secteur: incident.sous_secteur ?? '',
  impact: incident.impact,
  criticite: incident.criticite,
  priorite: incident.priorite,
  urgence: incident.urgence,
  classification: incident.classification ?? '',
  source: incident.source,
  environnement: incident.environnement,
  impact_utilisateurs: incident.impact_utilisateurs,
  id_utilisateur_impacte: incident.id_utilisateur_impacte ? String(incident.id_utilisateur_impacte) : '',
  id_intervenant: incident.id_intervenant ? String(incident.id_intervenant) : '',
  commentaire_qualification: incident.commentaire_qualification ?? '',
  tags: incident.tags.join(', '),
});

export function buildIncidentQualificationPayload(
  form: IncidentQualificationFormState,
): IncidentPayloadResult<QualifierIncidentPayload> {
  if (form.impact_utilisateurs === 'specifique' && !form.id_utilisateur_impacte) {
    return { payload: null, error: 'Sélectionnez l’utilisateur impacté.' };
  }

  return {
    error: null,
    payload: {
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
      tags: parseIncidentTags(form.tags),
    },
  };
}

export const getIncidentTreatmentForm = (incident: Incident): IncidentTreatmentFormState => ({
  statut: ['resolu', 'annule', 'en_attente'].includes(incident.statut)
    ? incident.statut as IncidentTreatmentStatus
    : 'en_traitement',
  classification: incident.classification ?? '',
  cause_racine: incident.cause_racine ?? '',
  solution: incident.solution ?? '',
  actions_correctives: incident.actions_correctives ?? '',
  commentaire_traitement: incident.commentaire_traitement ?? '',
  commentaire_cloture: incident.commentaire_cloture ?? '',
  temps_passe_minutes: '',
});

export const buildIncidentTreatmentPayload = (
  form: IncidentTreatmentFormState,
): TraiterIncidentPayload => ({
  statut: form.statut,
  classification: form.classification.trim() || undefined,
  cause_racine: form.cause_racine.trim() || undefined,
  solution: form.solution.trim() || undefined,
  actions_correctives: form.actions_correctives.trim() || undefined,
  commentaire_traitement: form.commentaire_traitement.trim() || undefined,
  commentaire_cloture: form.commentaire_cloture.trim() || undefined,
  temps_passe_minutes: form.temps_passe_minutes.trim() ? Number(form.temps_passe_minutes) : undefined,
});

export const formatIncidentResolutionDuration = (start?: string | null, end?: string | null): string => {
  if (!start || !end) return '—';
  const minutes = Math.max(0, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60_000));
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0
    ? `${hours}h${String(remainingMinutes).padStart(2, '0')}`
    : `${hours}h`;
};

export const matchesIncidentStructuredComment = (
  commentaire: IncidentCommentaire,
  expected?: string | null,
): boolean => Boolean(expected && commentaire.commentaire.trim() === expected.trim());

export function groupIncidentComments(incident: Incident | null): IncidentCommentGroups {
  const comments = incident?.commentaires ?? [];
  return {
    declaration: comments.filter((comment) => comment.type_commentaire === 'declaration'),
    qualification: comments.filter((comment) => (
      comment.type_commentaire === 'qualification'
      && !matchesIncidentStructuredComment(comment, incident?.commentaire_qualification)
    )),
    traitement: comments.filter((comment) => (
      comment.type_commentaire === 'traitement'
      && !matchesIncidentStructuredComment(comment, incident?.commentaire_traitement)
    )),
    cloture: comments.filter((comment) => (
      ['resolution', 'annulation'].includes(comment.type_commentaire)
      && !matchesIncidentStructuredComment(comment, incident?.commentaire_cloture)
    )),
    libres: comments.filter((comment) => comment.type_commentaire === 'commentaire'),
  };
}

export const getOpenIncidents = (incidents: Incident[]): Incident[] => incidents.filter((incident) => (
  ['qualifie', 'en_traitement', 'en_attente'].includes(incident.statut)
));

export const getIncidentsToQualify = (incidents: Incident[]): Incident[] => incidents.filter((incident) => (
  incident.statut === 'declare'
));

export function getIncidentTimelineVisibility(
  incident: Incident,
  groups: IncidentCommentGroups,
): IncidentTimelineVisibility {
  return {
    qualification: Boolean(
      incident.date_qualification
      || incident.commentaire_qualification
      || groups.qualification.length > 0
      || incident.statut !== 'declare'
    ),
    treatment: Boolean(
      incident.date_debut_traitement
      || incident.commentaire_traitement
      || incident.cause_racine
      || incident.solution
      || incident.actions_correctives
      || groups.traitement.length > 0
      || ['en_traitement', 'en_attente', 'resolu', 'annule'].includes(incident.statut)
    ),
    closure: Boolean(
      incident.statut === 'resolu'
      || incident.statut === 'annule'
      || incident.date_resolution
      || incident.date_annulation
      || incident.commentaire_cloture
      || groups.cloture.length > 0
    ),
  };
}
