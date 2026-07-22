export {
  loginService,
  getCurrentUserService,
  logoutService,
} from './auth.service.ts';

export {
  getAllEmployesService,
  getEmployeByIdService,
  updateEmployeService,
  deleteEmployeService,
  createEmployeService,
  getRangsCommerciauxService,
  getPostesService,
  getPosteByIdService,
  createPosteService,
  updatePosteService,
  deletePosteService,
  deactivateEmployeService,
  uploadEmployePhotoService,
  deleteEmployePhotoService,
  exportEmployeDataService,
} from './user.service.ts';

export {
  getAllCampagnesService,
  getCampagneByIdService,
  createCampagneService,
  updateCampagneService,
  updateStatutCampagneService,
  getAgentsCampagneService,
  addAgentCampagneService,
  removeAgentCampagneService,
  transfererAgentService,
  downloadCampagneFacturationDocumentService,
  downloadCampagneFacturXDocumentService,
  sendCampagneFacturationEmailService,
  getCampagneFacturationPaStatusService,
  issueCampagneFacturationThroughPaService,
  testCampagneFacturationThroughPaService,
} from './campagne.service.ts';

export {
  getAllProduitsService,
  getProduitByIdService,
  createProduitService,
  updateProduitService,
  toggleProduitActifService,
  getAllCategoriesService,
  getCategoriesFromProduitsService,
  createCategorieService,
  updateCategorieService,
  deleteCategorieService,
  getCampagneProduitsService,
  getCampagneProduitsPaginatedService,
  addProduitCampagneService,
  updateProduitCampagneService,
  removeProduitCampagneService,
  importProduitsCSVService,
} from './produit.service.ts';

export {
  typeProduitService,
  getTypesByCategorieService,
  getTypeByIdService,
  getOrCreateTypeService,
} from './typeProduit.service.ts';

export {
  uploadCourrierService,
  getAllCourriersService,
  getCourrierByIdService,
  updateCourrierService,
  deleteCourrierService,
  searchCourriersService,
  downloadCourrierService,
  sendCourrierEmailService,
  getCourrierStatsService,
  getCourrierFieldOptionsService,
  downloadBulkCourriersService,
  convertImageToPdfService,
  sendBulkCourrierEmailService,
  analyzeCourrierService,
  checkCourrierNameService,
} from './courrier.service.ts';

export {
  getDocumentsByEmployeService,
  uploadDocumentService,
  downloadDocumentService,
  generateDocumentViewUrlService,
  getDocumentByIdService,
  deleteDocumentService,
} from './document.service.ts';

export {
  getMaterielService,
  getMarquesService,
  getMaterielHistoriqueService,
  createMaterielService,
  updateMaterielService,
  affecterMaterielService,
  restituerMaterielService,
} from './materiel.service.ts';

export {
  getIncidentsService,
  getIncidentByIdService,
  createIncidentService,
  qualifierIncidentService,
  traiterIncidentService,
  addIncidentCommentaireService,
} from './incident.service.ts';

export {
  getBookingsService,
  createBookingService,
  updateBookingService,
  cancelBookingService,
  getBookingConfigService,
  updateBookingConfigService,
} from './booking.service.ts';

export {
  getVentesService,
  getVenteByIdService,
  updateVenteStatutService,
  getVenteDocumentUrl,
  deleteVenteService,
  restoreVenteService,
} from './vente.service.ts';

export {
  addProduitToPanierService,
  getPanierProduitsService,
  getProduitPaniersService,
  removeProduitFromPanierService,
  updatePanierProduitService,
} from './panierProduit.service.ts';

export {
  createPanierService,
  deletePanierService,
  getAllPaniersService,
  getPanierByIdService,
  togglePanierActifService,
  updatePanierService,
} from './panier.service.ts';

export {
  getLeadClientByIdService,
  getLeadClientDocumentUrl,
  getLeadClientsByProspectService,
  getLeadClientsService,
  updateLeadClientStatusService,
} from './lead.service.ts';

export {
  getQueueStateService,
  getGlobalStatsService,
  getProspectsCountService as getQueueProspectsCountService,
  injectProspectsService,
  getInjectionCountService,
  getProspectsCampagneService,
  purgeProspectsService,
  removeProspectService,
} from './queue.service.ts';

export {
  importProspectsService,
  getAllProspectsService,
  getProspectsCountService as getAllProspectsCountService,
  getProspectByIdService,
  getProspectEnrichmentSnapshotService,
  previewProspectEnrichmentService,
  applyProspectEnrichmentService,
  getProspectsSignalesService,
  updateProspectService,
  getProspectAppelsService,
  getProspectVentesService,
  getProspectRendezVousService,
} from './prospect.service.ts';

export {
  generateViewUrlService,
  isViewUrlValid,
  getViewUrlRemainingTime,
  formatRemainingTime,
} from './viewUrl.service.ts';

export {
  getAllRecordingsService,
  getRecordingStreamUrl,
} from './enregistrement.service.ts';

export {
  getAlertesConfigService,
  createAlerteConfigService,
  updateAlerteConfigService,
  deactivateAlerteConfigService,
  getAlertesHistoryService,
  resolveAlerteService,
} from './alerte.service.ts';

export {
  getSupervisionAgentsService,
  getEmployeGraphiquesService,
} from './supervision.service.ts';

export {
  assignPlanningToEmployeService,
  createPlanningService,
  deletePlanningService,
  getEmployePlanningAssignationService,
  getMyPlanningService,
  getPlanningsService,
  updatePlanningService,
} from './planning.service.ts';

export {
  createMyAbsenceRequestService,
  deleteAbsenceRequestService,
  getActiveAbsenceRequestsService,
  getAllAbsenceRequestsService,
  getMyAbsenceRequestsService,
  getPendingAbsenceRequestsService,
  updateAbsenceRequestService,
  updateAbsenceRequestStatusService,
} from './absence.service.ts';

export {
  cancelVigieActionService,
  createVigieActionService,
  createVigieManualPriorityService,
  createVigiePriorityBatchService,
  getVigieActionsService,
  getVigieSnapshotService,
} from './vigie.service.ts';

export {
  addMembreService,
  createProjetService,
  deleteProjetService,
  getEmployesDisponiblesService,
  getMembresService,
  getProjetByIdService,
  getProjetDashboardService,
  getProjetStatsService,
  listProjetsService,
  removeMembreService,
  updateStatutProjetService,
  updateProjetService,
} from './projet.service.ts';

export {
  addCommentaireService,
  addDependanceService,
  addTagToTacheService,
  addTempsService,
  createTacheService,
  createTagService,
  deleteCommentaireService,
  deleteTacheService,
  deleteTempsService,
  getAllTagsService,
  getCommentairesService,
  getTacheByIdService,
  getTempsService,
  listTachesByEmployeService,
  listTachesService,
  removeDependanceService,
  removeTagFromTacheService,
  updateOrdreTacheService,
  updateProgressionTacheService,
  updateStatutTacheService,
  updateTacheService,
} from './tache.service.ts';

export { graphiquesService } from './graphiques.service.ts';
export { qualiteService } from './qualite.service.ts';

export {
  deleteCampagneLogoService,
  uploadCampagneLogoService,
} from './campagneLogo.service.ts';

export {
  categoriesToOptions,
  getAllCategories,
  getAllTypes,
  typesToOptions,
} from './categorieType.service.ts';

export {
  deleteNoteDirectionService,
  downloadNoteDirectionService,
  generateNoteDirectionViewUrlService,
  getNotesDirectionService,
  uploadNoteDirectionService,
} from './noteDirection.service.ts';

export {
  deleteAntlConfigurationLogoService,
  deleteAntlConfigurationRibService,
  getAntlConfigurationService,
  updateAntlConfigurationService,
  uploadAntlConfigurationLogoService,
  uploadAntlConfigurationRibService,
} from './antlConfiguration.service.ts';
