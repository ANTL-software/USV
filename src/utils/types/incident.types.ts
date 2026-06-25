import type { Employe } from './user.types';

export type IncidentSecteur =
  | 'rh'
  | 'hardware'
  | 'software'
  | 'reseau_telephonie'
  | 'dialer'
  | 'campagnes_prospects'
  | 'ventes_commandes'
  | 'courriers_documents'
  | 'qualite_conformite'
  | 'projets'
  | 'site_externe'
  | 'securite_donnees'
  | 'finance_admin'
  | 'autre';

export type IncidentSource =
  | 'usv'
  | 'script'
  | 'olympe'
  | 'external_website'
  | 'infrastructure'
  | 'autre';

export type IncidentImpact =
  | 'individuel'
  | 'equipe'
  | 'service'
  | 'entreprise'
  | 'client'
  | 'reglementaire'
  | 'interne';

export type IncidentCriticite = 'mineure' | 'majeure' | 'bloquante' | 'critique';
export type IncidentPriorite = 'basse' | 'normale' | 'haute' | 'critique';
export type IncidentUrgence = 'faible' | 'moyenne' | 'haute' | 'immediate';
export type IncidentStatut = 'declare' | 'qualifie' | 'en_traitement' | 'en_attente' | 'resolu' | 'annule';
export type IncidentEnvironnement = 'production' | 'preproduction' | 'developpement' | 'local' | 'autre';
export type IncidentTypeCommentaire = 'commentaire' | 'declaration' | 'qualification' | 'traitement' | 'resolution' | 'annulation';
export type IncidentImpactUtilisateurs = 'tous' | 'specifique';

export interface IncidentEmploye {
  id_employe: number;
  nom: string;
  prenom: string;
  identifiant: string;
  email?: string | null;
  actif?: boolean;
}

export interface IncidentCommentaire {
  id_commentaire: number;
  id_incident: number;
  id_auteur: number | null;
  type_commentaire: IncidentTypeCommentaire;
  commentaire: string;
  temps_passe_minutes: number | null;
  created_at: string;
  auteur?: IncidentEmploye | null;
}

export interface Incident {
  id_incident: number;
  reference: string;
  titre: string;
  description: string;
  source: IncidentSource;
  secteur: IncidentSecteur;
  sous_secteur: string | null;
  impact: IncidentImpact;
  criticite: IncidentCriticite;
  priorite: IncidentPriorite;
  urgence: IncidentUrgence;
  statut: IncidentStatut;
  classification: string | null;
  origine: string | null;
  environnement: IncidentEnvironnement;
  impact_utilisateurs: IncidentImpactUtilisateurs;
  id_utilisateur_impacte: number | null;
  id_declarant: number | null;
  id_createur: number | null;
  id_intervenant: number | null;
  id_qualifie_par: number | null;
  id_resolu_par: number | null;
  id_annule_par: number | null;
  date_detection: string;
  date_declaration: string;
  date_qualification: string | null;
  date_debut_traitement: string | null;
  date_resolution: string | null;
  date_annulation: string | null;
  cause_racine: string | null;
  solution: string | null;
  actions_correctives: string | null;
  commentaire_qualification: string | null;
  commentaire_traitement: string | null;
  commentaire_cloture: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  declarant?: IncidentEmploye | null;
  createur?: IncidentEmploye | null;
  intervenant?: IncidentEmploye | null;
  utilisateurImpacte?: IncidentEmploye | null;
  qualificateur?: IncidentEmploye | null;
  resoluPar?: IncidentEmploye | null;
  annulePar?: IncidentEmploye | null;
  commentaires?: IncidentCommentaire[];
}

export interface IncidentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IncidentListResult {
  incidents: Incident[];
  pagination: IncidentPagination;
}

export interface IncidentFilters {
  search?: string;
  statut?: IncidentStatut | 'tous';
  secteur?: IncidentSecteur | 'tous';
  source?: IncidentSource | 'tous';
  criticite?: IncidentCriticite | 'tous';
  priorite?: IncidentPriorite | 'tous';
  impact?: IncidentImpact | 'tous';
  impact_utilisateurs?: IncidentImpactUtilisateurs | 'tous_filtres';
  id_utilisateur_impacte?: number | 'tous';
  id_intervenant?: number | 'tous';
  date_debut?: string;
  date_fin?: string;
  page?: number;
  limit?: number;
}

export interface CreateIncidentPayload {
  titre: string;
  description: string;
  source: IncidentSource;
  secteur: IncidentSecteur;
  sous_secteur?: string;
  impact: IncidentImpact;
  criticite: IncidentCriticite;
  priorite: IncidentPriorite;
  urgence: IncidentUrgence;
  origine?: string;
  environnement: IncidentEnvironnement;
  impact_utilisateurs: IncidentImpactUtilisateurs;
  id_utilisateur_impacte?: number | null;
  id_declarant?: number;
  date_detection?: string;
  tags?: string[];
  commentaire?: string;
}

export interface QualifierIncidentPayload {
  secteur?: IncidentSecteur;
  sous_secteur?: string;
  impact?: IncidentImpact;
  criticite?: IncidentCriticite;
  priorite?: IncidentPriorite;
  urgence?: IncidentUrgence;
  classification?: string;
  source?: IncidentSource;
  environnement?: IncidentEnvironnement;
  impact_utilisateurs?: IncidentImpactUtilisateurs;
  id_utilisateur_impacte?: number | null;
  id_intervenant?: number | null;
  commentaire_qualification?: string;
  tags?: string[];
}

export interface TraiterIncidentPayload {
  statut: Extract<IncidentStatut, 'en_traitement' | 'en_attente' | 'resolu' | 'annule'>;
  classification?: string;
  cause_racine?: string;
  solution?: string;
  actions_correctives?: string;
  commentaire_traitement?: string;
  commentaire_cloture?: string;
  temps_passe_minutes?: number;
}

export interface AddIncidentCommentairePayload {
  type_commentaire?: IncidentTypeCommentaire;
  commentaire: string;
  temps_passe_minutes?: number;
}

export interface ApiIncidentResponse {
  success: boolean;
  message?: string;
  data?: Incident | Incident[];
  pagination?: IncidentPagination;
}

export interface ApiIncidentCommentaireResponse {
  success: boolean;
  message?: string;
  data?: IncidentCommentaire;
}

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

export const INCIDENT_SECTEUR_LABELS: Record<IncidentSecteur, string> = {
  rh: 'RH',
  hardware: 'Hardware',
  software: 'Software',
  reseau_telephonie: 'Réseau & téléphonie',
  dialer: 'Dialer',
  campagnes_prospects: 'Campagnes & prospects',
  ventes_commandes: 'Ventes & commandes',
  courriers_documents: 'Courriers & documents',
  qualite_conformite: 'Qualité & conformité',
  projets: 'Projets',
  site_externe: 'Site externe',
  securite_donnees: 'Sécurité & données',
  finance_admin: 'Finance & administratif',
  autre: 'Autre',
};

export const INCIDENT_SOURCE_LABELS: Record<IncidentSource, string> = {
  usv: 'USV',
  script: 'Script vendeur',
  olympe: 'Olympe API',
  external_website: 'Site externe',
  infrastructure: 'Infrastructure',
  autre: 'Autre',
};

export const INCIDENT_IMPACT_LABELS: Record<IncidentImpact, string> = {
  individuel: 'Individuel',
  equipe: 'Équipe',
  service: 'Service',
  entreprise: 'Entreprise',
  client: 'Client',
  reglementaire: 'Réglementaire',
  interne: 'Interne',
};

export const INCIDENT_CRITICITE_LABELS: Record<IncidentCriticite, string> = {
  mineure: 'Mineure',
  majeure: 'Majeure',
  bloquante: 'Bloquante',
  critique: 'Critique',
};

export const INCIDENT_PRIORITE_LABELS: Record<IncidentPriorite, string> = {
  basse: 'Basse',
  normale: 'Normale',
  haute: 'Haute',
  critique: 'Critique',
};

export const INCIDENT_URGENCE_LABELS: Record<IncidentUrgence, string> = {
  faible: 'Faible',
  moyenne: 'Moyenne',
  haute: 'Haute',
  immediate: 'Immédiate',
};

export const INCIDENT_STATUT_LABELS: Record<IncidentStatut, string> = {
  declare: 'Déclaré',
  qualifie: 'Qualifié',
  en_traitement: 'En traitement',
  en_attente: 'En attente',
  resolu: 'Résolu',
  annule: 'Annulé',
};

export const INCIDENT_ENVIRONNEMENT_LABELS: Record<IncidentEnvironnement, string> = {
  production: 'Production',
  preproduction: 'Préproduction',
  developpement: 'Développement',
  local: 'Local',
  autre: 'Autre',
};

export const INCIDENT_IMPACT_UTILISATEURS_LABELS: Record<IncidentImpactUtilisateurs, string> = {
  tous: 'Tous les utilisateurs',
  specifique: 'Utilisateur spécifique',
};

export const INCIDENT_SECTEUR_OPTIONS: SelectOption<IncidentSecteur>[] = Object.entries(INCIDENT_SECTEUR_LABELS)
  .map(([value, label]) => ({ value: value as IncidentSecteur, label }));

export const INCIDENT_SOURCE_OPTIONS: SelectOption<IncidentSource>[] = Object.entries(INCIDENT_SOURCE_LABELS)
  .map(([value, label]) => ({ value: value as IncidentSource, label }));

export const INCIDENT_IMPACT_OPTIONS: SelectOption<IncidentImpact>[] = Object.entries(INCIDENT_IMPACT_LABELS)
  .map(([value, label]) => ({ value: value as IncidentImpact, label }));

export const INCIDENT_CRITICITE_OPTIONS: SelectOption<IncidentCriticite>[] = Object.entries(INCIDENT_CRITICITE_LABELS)
  .map(([value, label]) => ({ value: value as IncidentCriticite, label }));

export const INCIDENT_PRIORITE_OPTIONS: SelectOption<IncidentPriorite>[] = Object.entries(INCIDENT_PRIORITE_LABELS)
  .map(([value, label]) => ({ value: value as IncidentPriorite, label }));

export const INCIDENT_URGENCE_OPTIONS: SelectOption<IncidentUrgence>[] = Object.entries(INCIDENT_URGENCE_LABELS)
  .map(([value, label]) => ({ value: value as IncidentUrgence, label }));

export const INCIDENT_STATUT_OPTIONS: SelectOption<IncidentStatut>[] = Object.entries(INCIDENT_STATUT_LABELS)
  .map(([value, label]) => ({ value: value as IncidentStatut, label }));

export const INCIDENT_ENVIRONNEMENT_OPTIONS: SelectOption<IncidentEnvironnement>[] = Object.entries(INCIDENT_ENVIRONNEMENT_LABELS)
  .map(([value, label]) => ({ value: value as IncidentEnvironnement, label }));

export const INCIDENT_IMPACT_UTILISATEURS_OPTIONS: SelectOption<IncidentImpactUtilisateurs>[] = Object.entries(INCIDENT_IMPACT_UTILISATEURS_LABELS)
  .map(([value, label]) => ({ value: value as IncidentImpactUtilisateurs, label }));

export const INCIDENT_CLASSIFICATION_OPTIONS = [
  'Bug applicatif',
  'Erreur de donnée',
  'Incident matériel',
  'Incident réseau',
  'Incident téléphonie',
  'Droit ou accès',
  'Process interne',
  'Sécurité',
  'Conformité',
  'Demande support',
];

export const formatIncidentEmploye = (employe?: IncidentEmploye | Employe | null): string => {
  if (!employe) return 'Non assigné';
  return `${employe.prenom} ${employe.nom.toUpperCase()}`;
};

export const formatIncidentUtilisateursImpactes = (incident: Pick<Incident, 'impact_utilisateurs' | 'utilisateurImpacte'>): string => {
  if (incident.impact_utilisateurs === 'tous') return INCIDENT_IMPACT_UTILISATEURS_LABELS.tous;
  return formatIncidentEmploye(incident.utilisateurImpacte);
};
