export interface PlanningCreneau {
  id_creneau: number;
  jour_semaine: number;
  heure_debut: string;
  heure_fin: string;
  ordre_affichage: number;
}

export interface Planning {
  id_planning: number;
  code_planning: string;
  nom_planning: string;
  description?: string | null;
  heures_hebdo: number;
  jours_feries_chomes: boolean;
  actif: boolean;
  creneaux: PlanningCreneau[];
}

export interface PlanningAssignation {
  id_assignation: number;
  id_employe: number;
  id_planning: number;
  date_debut: string;
  date_fin: string | null;
  created_by?: number | null;
  planning: Planning | null;
}

export interface PlanningCalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  planning_name: string;
  heure_debut: string;
  heure_fin: string;
  event_type: 'work' | 'holiday' | 'absence';
  holiday_name: string | null;
  absence_label: string | null;
}

export interface PlanningPayload {
  code_planning: string;
  nom_planning: string;
  description?: string | null;
  heures_hebdo: number;
  jours_feries_chomes: boolean;
  creneaux: Array<{
    jour_semaine: number;
    heure_debut: string;
    heure_fin: string;
    ordre_affichage: number;
  }>;
}
