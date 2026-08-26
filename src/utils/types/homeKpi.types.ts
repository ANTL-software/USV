export interface SparklinePoint {
  date: string;
  value: number;
}

export interface KpiMetric {
  total: number;
  trend: SparklinePoint[];
  formatted?: string;
}

export interface HomeKpiData {
  commandesValidees: KpiMetric;
  caMoisVentes: KpiMetric;
  rdvClientsPlanifies: KpiMetric;
  commerciauxActifsJour: KpiMetric;
  incidentsOuverts: KpiMetric;
  projetsEnCours: KpiMetric;
  rdvAgendaJour: KpiMetric;
}

export interface HomeKpiResponse {
  success: boolean;
  data: HomeKpiData;
  message?: string;
}
