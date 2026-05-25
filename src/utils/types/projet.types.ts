// =============================================================================
// TYPES PROJETS
// =============================================================================

export type TypeProjet = 'developpement' | 'commercial' | 'administratif' | 'marketing' | 'rh' | 'technique';

export type StatutProjet = 'brouillon' | 'actif' | 'en_pause' | 'termine' | 'annule';

export type Priorite = 'basse' | 'normale' | 'haute' | 'critique';

export type RoleMembre = 'pilote' | 'membre' | 'developpeur' | 'designer' | 'testeur' | 'chef_projet' | string;

// =============================================================================
// PROJET
// =============================================================================

export interface Projet {
  id_projet: number;
  titre: string;
  description: string | null;
  type_projet: TypeProjet;
  id_pilote: number;
  date_debut: string | null;
  date_fin: string | null;
  statut: StatutProjet;
  priorite: Priorite;
  progression: number;
  date_creation: string;
  date_modification: string;
  created_by: number | null;
  updated_by: number | null;
  // Associations
  pilote?: EmployeMini;
  createur?: EmployeMini;
  modificateur?: EmployeMini;
  membres?: ProjetMembre[];
  stats?: ProjetStats;
  taches_actives_count?: number;
  membres_count?: number;
}

export interface CreateProjetData {
  titre: string;
  description?: string;
  type_projet: TypeProjet;
  id_pilote: number;
  date_debut?: string;
  date_fin?: string;
  priorite?: Priorite;
}

export interface UpdateProjetData {
  titre?: string;
  description?: string;
  type_projet?: TypeProjet;
  id_pilote?: number;
  date_debut?: string;
  date_fin?: string;
  statut?: StatutProjet;
  priorite?: Priorite;
  progression?: number;
}

// =============================================================================
// MEMBRE PROJET
// =============================================================================

export interface ProjetMembre {
  id_membre: number;
  id_projet: number;
  id_employe: number;
  role: string;
  date_assignation: string;
  employe?: EmployeMini;
}

export interface AddMembreData {
  id_employe: number;
  role?: string;
}

// =============================================================================
// TÂCHE
// =============================================================================

export type StatutTache = 'a_faire' | 'en_cours' | 'en_attente' | 'termine' | 'annule';

export type TypeDependance = 'fin_debut' | 'debut_debut' | 'fin_fin';

export interface Tache {
  id_tache: number;
  id_projet: number;
  id_tache_parent: number | null;
  titre: string;
  description: string | null;
  id_assigne: number | null;
  statut: StatutTache;
  priorite: Priorite;
  date_echeance: string | null;
  date_debut_reel: string | null;
  date_fin_reelle: string | null;
  temps_esthe: number;
  temps_consomme: number;
  progression: number;
  ordre: number;
  date_creation: string;
  date_modification: string;
  created_by: number | null;
  updated_by: number | null;
  // Associations
  projet?: ProjetMini;
  assigne?: EmployeMini;
  createur?: EmployeMini;
  modificateur?: EmployeMini;
  tacheParente?: TacheMini;
  sousTaches?: TacheMini[];
  tags?: TacheTag[];
  // Added by service
  dependances?: TacheDependance[];
  temps?: TacheTemps[];
  commentaires?: TacheCommentaire[];
}

export interface CreateTacheData {
  id_projet: number;
  titre: string;
  description?: string;
  id_tache_parent?: number;
  id_assigne?: number | null;
  statut?: StatutTache;
  priorite?: Priorite;
  date_echeance?: string;
  temps_esthe?: number;
  progression?: number;
  ordre?: number;
  tags?: number[];
}

export interface UpdateTacheData {
  titre?: string;
  description?: string;
  id_assigne?: number | null;
  statut?: StatutTache;
  priorite?: Priorite;
  date_echeance?: string;
  progression?: number;
  tags?: number[];
}

export interface TacheMini {
  id_tache: number;
  titre: string;
  statut: StatutTache;
  progression?: number;
  priorite?: Priorite;
}

export interface ProjetMini {
  id_projet: number;
  titre: string;
  statut: StatutProjet;
}

// =============================================================================
// DÉPENDANCES TÂCHE
// =============================================================================

export interface TacheDependance {
  id_dependance: number;
  id_tache: number;
  id_tache_dependante: number;
  type_dependance: TypeDependance;
  tache?: TacheMini;
  tacheDependante?: TacheMini;
}

export interface CreateDependanceData {
  id_tache_dependante: number;
  type_dependance?: TypeDependance;
}

// =============================================================================
// COMMENTAIRES TÂCHE
// =============================================================================

export interface TacheCommentaire {
  id_commentaire: number;
  id_tache: number;
  id_employe: number;
  contenu: string;
  date_creation: string;
  date_modification: string;
  employe?: EmployeMini;
}

export interface CreateCommentaireData {
  id_employe: number;
  contenu: string;
}

// =============================================================================
// TEMPS TÂCHE
// =============================================================================

export interface TacheTemps {
  id_temps: number;
  id_tache: number;
  id_employe: number;
  date_travail: string;
  minutes: number;
  description: string | null;
  date_creation: string;
  employe?: EmployeMini;
}

export interface CreateTempsData {
  id_employe: number;
  date_travail?: string;
  minutes: number;
  description?: string;
}

// =============================================================================
// TAGS TÂCHE
// =============================================================================

export interface TacheTag {
  id_tag: number;
  libelle: string;
  couleur: string;
}

export interface CreateTagData {
  libelle: string;
  couleur?: string;
}

// =============================================================================
// STATISTIQUES
// =============================================================================

export interface ProjetStats {
  taches_par_statut: Record<StatutTache, number>;
  taches_total: number;
  temps_esthe_total: number;
  temps_consomme_total: number;
  temps_restant: number;
  progression_calculee: number;
  taches_en_retard: number;
}

export interface ProjetDashboard {
  projet: Projet;
  stats: ProjetStats;
  recentesTaches: Tache[];
  tempsParEmploye: TempsParEmploye[];
}

export interface TempsParEmploye {
  id_employe: number;
  total_minutes: number;
  employe: EmployeMini;
}

// =============================================================================
// LISTES ET FILTRES
// =============================================================================

export interface ListProjetsFilters {
  statut?: StatutProjet;
  type_projet?: TypeProjet;
  id_pilote?: number;
  priorite?: Priorite;
  search?: string;
  date_debut_min?: string;
  date_debut_max?: string;
}

export interface ListProjetsResponse {
  projets: Projet[];
  total: number;
  pages: number;
  currentPage: number;
}

export interface ListTachesFilters {
  statut?: StatutTache;
  id_assigne?: number | null;
  priorite?: Priorite;
  id_tache_parent?: number | null;
  tags?: number[];
}

export interface ListTachesResponse {
  taches: Tache[];
  total: number;
  pages: number;
  currentPage: number;
}

// =============================================================================
// TYPES MINI POUR ASSOCIATIONS
// =============================================================================

export interface EmployeMini {
  id_employe: number;
  identifiant: string;
  nom: string;
  prenom: string;
  email?: string;
  actif?: boolean;
}

// =============================================================================
// FORMS
// =============================================================================

export interface ProjetFormData {
  titre: string;
  description?: string;
  type_projet: TypeProjet;
  id_pilote: number;
  date_debut?: Date;
  date_fin?: Date;
  priorite?: Priorite;
}

export interface TacheFormData {
  titre: string;
  description?: string;
  id_assigne?: number;
  statut?: StatutTache;
  priorite?: Priorite;
  date_echeance?: Date;
  temps_esthe?: number;
  progression?: number;
  tags?: number[];
}

// =============================================================================
// KANBAN
// =============================================================================

export type KanbanColumn = StatutTache;

export interface KanbanCard {
  id: number;
  title: string;
  description: string | null;
  status: KanbanColumn;
  priority: Priorite;
  assignee: EmployeMini | null;
  dueDate: string | null;
  progression: number;
  tags: TacheTag[];
  projectId: number;
}

export interface KanbanColumnData {
  id: KanbanColumn;
  title: string;
  cards: KanbanCard[];
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export interface ProjetError {
  message: string;
  code?: string;
  details?: unknown;
}
