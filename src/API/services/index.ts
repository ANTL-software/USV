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
} from './campagne.service.ts';

export {
  getAllProduitsService,
  getProduitByIdService,
  createProduitService,
  updateProduitService,
  toggleProduitActifService,
  getAllCategoriesService,
  createCategorieService,
  updateCategorieService,
  deleteCategorieService,
  getCampagneProduitsService,
  addProduitCampagneService,
  updateProduitCampagneService,
  removeProduitCampagneService,
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
} from './courrier.service.ts';

export {
  getDocumentsByEmployeService,
  uploadDocumentService,
  downloadDocumentService,
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
  getVenteDocumentUrl,
} from './vente.service.ts';

export {
  getQueueStateService,
  getGlobalStatsService,
  injectProspectsService,
  getInjectionCountService,
  getProspectsCampagneService,
  purgeProspectsService,
} from './queue.service.ts';

export {
  importProspectsService,
  getAllProspectsService,
  getProspectByIdService,
  getProspectEnrichmentSnapshotService,
  previewProspectEnrichmentService,
  applyProspectEnrichmentService,
  updateProspectService,
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
