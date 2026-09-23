export const HOME_KPI_PATHS = {
  commandes: '/operations/commandes',
  ca: '/operations/commandes',
  rdv: '/operations/commandes',
  'ca-rdv': '/operations/commandes',
  commerciaux: '/supervision',
  incidents: '/incidents/traitement',
  'rdv-agenda': '/booking',
} as const;

export type HomeKpiId = keyof typeof HOME_KPI_PATHS;
