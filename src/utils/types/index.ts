export type {
  TypePoste,
  PermissionSection,
  PermissionRecord,
  Poste,
  Departement,
  RangCommercial,
  Employe,
  EmployeFilter,
  LoginCredentials,
  LoginResponse,
  ApiResponse,
  CreateEmployeData,
  CreateEmployeResponse,
} from './user.types.ts';

export type {
  StatutCampagne,
  Campagne,
  CreateCampagneData,
  UpdateCampagneData,
  AgentAffecte,
  AddAgentCampagneData,
  TransfertAgentData,
  BonCommandeConfig,
  BonCommandeInvoiceRecipient,
  CampagneLogoDeleteResult,
  CampagneLogoUploadResult,
} from './campagne.types.ts';

export type {
  Categorie,
  CategorieOption,
  TypeProduit,
  TypeOption,
  Produit,
  CreateProduitData,
  UpdateProduitData,
  CreateCategorieData,
  UpdateCategorieData,
  CampagneProduit,
  AddProduitCampagneData,
  UpdateProduitCampagneData,
  ImportProduitRow,
  ImportProduitResult,
} from './produit.types.ts';

export type {
  Panier,
  PanierFormState,
  PanierOrigin,
  PanierOriginOption,
  CreatePanierData,
  UpdatePanierData,
  ProduitInPanier,
  PanierProduit,
  AddProduitToPanierData,
  PanierProduitAssociation,
  UpdatePanierProduitData,
} from './panier.types.ts';

export type {
  TypeMateriel,
  EtatMateriel,
} from './materiel.types.ts';

export type {
  IncidentSecteur,
  IncidentSource,
  IncidentImpact,
  IncidentImpactUtilisateurs,
  IncidentCriticite,
  IncidentPriorite,
  IncidentUrgence,
  IncidentStatut,
  IncidentEnvironnement,
  IncidentTypeCommentaire,
  IncidentEmploye,
  IncidentCommentaire,
  Incident,
  IncidentPagination,
  ApiIncidentCommentaireResponse,
  ApiIncidentResponse,
  IncidentListResult,
  IncidentFilters,
  CreateIncidentPayload,
  QualifierIncidentPayload,
  TraiterIncidentPayload,
  AddIncidentCommentairePayload,
  CreateIncidentResult,
} from './incident.types.ts';

export {
  INCIDENT_SECTEUR_LABELS,
  INCIDENT_SOURCE_LABELS,
  INCIDENT_IMPACT_LABELS,
  INCIDENT_CRITICITE_LABELS,
  INCIDENT_PRIORITE_LABELS,
  INCIDENT_URGENCE_LABELS,
  INCIDENT_STATUT_LABELS,
  INCIDENT_ENVIRONNEMENT_LABELS,
  INCIDENT_SECTEUR_OPTIONS,
  INCIDENT_SOURCE_OPTIONS,
  INCIDENT_IMPACT_OPTIONS,
  INCIDENT_IMPACT_UTILISATEURS_OPTIONS,
  INCIDENT_CRITICITE_OPTIONS,
  INCIDENT_PRIORITE_OPTIONS,
  INCIDENT_URGENCE_OPTIONS,
  INCIDENT_STATUT_OPTIONS,
  INCIDENT_ENVIRONNEMENT_OPTIONS,
  INCIDENT_CLASSIFICATION_OPTIONS,
  formatIncidentEmploye,
  formatIncidentUtilisateursImpactes,
} from './incident.types.ts';

export type {
  EmployeMaterielBasic,
  MaterielAffectation,
  Materiel,
  CreateMaterielPayload,
  UpdateMaterielPayload,
  AffecterMaterielPayload,
  RestituerMaterielPayload,
  ApiMaterielResponse,
  ApiAffectationResponse,
} from './materiel.types.ts';

export {
  ETAT_MATERIEL_LABELS,
  ETAT_MATERIEL_OPTIONS,
  TYPE_MATERIEL_LABELS,
  TYPE_MATERIEL_OPTIONS,
} from './materiel.types.ts';

export type {
  EmployeBasic,
  EmployeOption,
  Booking,
  BookingFormState,
  BookingMoveFormState,
  BookingPayloadResult,
  BookingTimeOption,
  BookingViewMode,
  CalendarEvent,
  CreateBookingPayload,
  UpdateBookingPayload,
  BookingFilters,
  BookingConfig,
  ApiBookingResponse,
  ApiBookingConfigResponse,
} from './booking.types.ts';

export type {
  ICourrier,
  EmailComposerCopy,
  EmailComposerForm,
  EmailData,
  IUserBasic,
  ICourrierFormData,
  ICourrierUploadData,
  IPagination,
  IApiResponse,
  ICourrierSearchParams,
  ICourrierStats,
  CourrierSortColumn,
  SortOrder,
  ICourrierListParams,
  IColumnFilters,
  IConvertCropData,
  ICourrierSelectSuggestion,
  ICourrierAnalysisResult,
} from './courrier.types.ts';

export type {
  EmployeeDocument,
  EmployeeDocumentFormData,
  UploadDocumentRequest,
  DocumentUploadResult,
  DocumentsListResult,
  DocumentDeleteResult,
  UploadModalState,
  PdfModalState,
} from './document.types.ts';

export {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
} from './document.types.ts';

export type {
  TypeProspect,
  StatutProspect,
  ImportProspectRow,
  ImportError,
  ImportResult,
  ImportApiResponse,
  Prospect,
  ProspectsApiResponse,
  ProspectFilters,
  ProspectUpdateData,
  SignalementType,
  ProspectSignale,
  EnrichissementStatut,
  ProspectEnrichmentSnapshot,
  ProspectEnrichmentPreview,
} from './prospect.types.ts';

export type {
  StatutVente,
  ModePaiement,
  VenteProspect,
  VenteAgent,
  VenteCampagne,
  Vente,
  VenteDetailProduit,
  VenteDetail,
  VenteComplete,
  VenteListParams,
  VenteStats,
} from './vente.types.ts';

export type {
  BillingAmounts,
  BillingField,
  BillingPeriod,
  BillingPreview,
  BillingSummaryCard,
  CampaignBillingSettings,
  FacturationPeriodPreset,
  InvoiceEmailOption,
  InvoiceRecipient,
  ResolvedBillingProfile,
} from './facturation.types.ts';

export type {
  AddMembreData,
  CreateDependanceData,
  CreateCommentaireData,
  CreateProjetData,
  CreateTacheData,
  CreateTagData,
  CreateTempsData,
  ListTachesFilters,
  Priorite,
  Projet,
  ProjetDashboard,
  ProjetStats,
  ProjetMembre,
  StatutProjet,
  StatutTache,
  Tache,
  TacheCommentaire,
  TacheDependance,
  TacheTag,
  TacheTemps,
  TypeProjet,
  UpdateProjetData,
  UpdateTacheData,
  ListProjetsFilters,
  ListProjetsResponse,
  ListTachesResponse,
  EmployeMini,
} from './projet.types.ts';

export type {
  ProgpaCommercialStats,
  ProgpaDistributionItem,
  ProgpaEvolutionDay,
  ProgpaEvolutionMonth,
  ProgpaSummary,
  QualiteProgpaStatsResponse,
} from './qualite.types.ts';

export {
  STATUT_VENTE_LABELS,
  STATUT_VENTE_COLORS,
  MODE_PAIEMENT_LABELS,
  STATUT_VENTE_OPTIONS,
} from './vente.types.ts';

export type {
  StatutProspection,
  QueueCount,
  AgentState,
  CallInProgress,
  QueueState,
  InjectionResult,
  InjectionFilters,
  ProspectCampagneRow,
  CampaignAgentStats,
  GlobalStats,
  SupervisionAgentOption,
} from './queue.types.ts';

export type {
  AppelsParHeure,
  TauxAbouti,
  DureeMoyenneParJour,
  RaisonEchec,
  AllGraphiquesStats,
  SupervisionExportData,
  DateFilters,
  AmdStats,
  AppelsParOrigine,
  StatutAppelCount,
  StatutAppelParHeure,
} from './graphiques.types.ts';

export { STATUT_LABELS, STATUT_COLORS } from './graphiques.types.ts';

export type {
  AlerteType,
  AlerteStatut,
  AlerteDestinataire,
  AlerteConfig,
  CreateAlerteConfigPayload,
  UpdateAlerteConfigPayload,
  AlerteHistory,
  AlerteHistoryFilters,
  AlerteTypeMetadata,
} from './alerte.types.ts';

export type {
  CreateVigieActionData,
  CreateVigieManualPriorityData,
  CreateVigiePriorityBatchData,
  VigieAction,
  VigieDateRange,
  VigieHourlyPerformance,
  VigieRecommendation,
  VigieSegmentDimension,
  VigieSnapshot,
} from './vigie.types.ts';

export {
  ALERTE_TYPES,
  ALERTE_TYPE_LABELS,
  ALERTE_TYPE_COLORS,
  ALERTE_STATUT_LABELS,
  ALERTE_STATUT_COLORS,
} from './alerte.types.ts';

export type {
  StatutAppel,
  OrigineAppel,
  Appel,
} from './appel.types.ts';

export type {
  Enregistrement,
  EnregistrementFilters,
  EnregistrementsApiResponse,
  RecordingFilterOption,
} from './enregistrement.types.ts';

export type {
  CalendarPlanningEvent,
  Planning,
  PlanningAssignation,
  PlanningCalendarEvent,
  PlanningCreneau,
  PlanningDisplayEvent,
  PlanningPayload,
} from './planning.types.ts';

export type {
  AbsenceMotifOption,
  AbsenceRequest,
  AbsenceRequestStatus,
  AbsenceRequestType,
  CreateAbsenceRequestPayload,
} from './absence.types.ts';

export type {
  StatutRendezVous,
  RendezVousAgent,
  RendezVousProspect,
  RendezVousCampagne,
  RendezVousAppelSource,
  RendezVousItem,
  LeadClient,
  LeadClientListParams,
  LeadClientStats,
} from './rendezVous.types.ts';

export {
  STATUT_RENDEZ_VOUS_LABELS,
  STATUT_RENDEZ_VOUS_COLORS,
  STATUT_RENDEZ_VOUS_OPTIONS,
} from './rendezVous.types.ts';

export type {
  NotificationContextType,
  NotificationItem,
  NotificationType,
} from './notification.types.ts';

export type {
  AntlConfiguration,
  AntlConfigurationLogoDeleteResult,
  AntlConfigurationLogoUploadResult,
  AntlConfigurationRibDeleteResult,
  AntlConfigurationRibUploadResult,
  UpdateAntlConfigurationData,
} from './antlConfiguration.types.ts';

export type {
  BillingRhythm,
  BudgetBand,
  Engagement,
  PriceMode,
  QuoteFormChangeHandler,
  QuoteFormState,
  QuoteLine,
  QuoteTemplate,
  TemplateAssumption,
  TemplateFamily,
  TemplateStatus,
  Timeline,
} from './devis.types.ts';
