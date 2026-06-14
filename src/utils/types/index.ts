export type {
  TypePoste,
  Poste,
  Departement,
  RangCommercial,
  Employe,
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
} from './campagne.types.ts';

export type {
  Categorie,
  Produit,
  CreateProduitData,
  UpdateProduitData,
  CreateCategorieData,
  UpdateCategorieData,
  CampagneProduit,
  AddProduitCampagneData,
  UpdateProduitCampagneData,
} from './produit.types.ts';

export type {
  Panier,
  CreatePanierData,
  UpdatePanierData,
} from './panier.types.ts';

export type {
  TypeMateriel,
  EtatMateriel,
} from './materiel.types.ts';

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
  Booking,
  CreateBookingPayload,
  UpdateBookingPayload,
  BookingFilters,
  BookingConfig,
  ApiBookingResponse,
  ApiBookingConfigResponse,
} from './booking.types.ts';

export type {
  ICourrier,
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
} from './vente.types.ts';

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
} from './queue.types.ts';

export type {
  AppelsParHeure,
  TauxAbouti,
  DureeMoyenneParJour,
  RaisonEchec,
  AllGraphiquesStats,
} from './graphiques.types.ts';

export { STATUT_LABELS, STATUT_COLORS } from './graphiques.types.ts';
