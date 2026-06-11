export interface ICourrier {
  id: number;
  fileName: string;
  path: string;
  fileExtention: string;
  active: boolean;
  department?: string;
  kind?: string;
  direction: 'entrant' | 'sortant' | 'interne';
  recipient?: string;
  emitter?: string;
  priority: string;
  receptionDate?: string;
  courrierDate?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  addByUser: number;
  updateByUser?: number;
  createurUser?: IUserBasic;
  modificateurUser?: IUserBasic;
}

export interface IUserBasic {
  id_employe: number;
  email?: string;
  prenom: string;
  nom: string;
}

export interface ICourrierFormData {
  direction: 'entrant' | 'sortant' | 'interne';
  emitter: string;
  recipient: string;
  receptionDate: string;
  courrierDate: string;
  priority: string;
  department: string;
  kind: string;
  description: string;
  customFileName: string;
  fichierJoint?: File;
}

export interface ICourrierUploadData {
  direction: 'entrant' | 'sortant' | 'interne';
  emitter?: string;
  recipient?: string;
  receptionDate?: string;
  courrierDate?: string;
  priority?: string;
  department?: string;
  kind?: string;
  description?: string;
  customFileName?: string;
}

export interface IPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: IPagination;
}

export interface ICourrierSearchParams {
  column?: 'kind' | 'department' | 'direction' | 'recipient' | 'emitter' | 'fileName';
  value?: string;
  query?: string;
  page?: number;
  limit?: number;
}

export interface ICourrierStats {
  total: number;
  entrants: number;
  sortants: number;
  internes: number;
  thisMonth: number;
  thisYear: number;
}

export type CourrierSortColumn = 'fileName' | 'direction' | 'kind' | 'department' | 'emitter' | 'recipient' | 'courrierDate' | 'description';

export type SortOrder = 'ASC' | 'DESC';

export interface ICourrierListParams {
  page?: number;
  limit?: number;
  sortBy?: CourrierSortColumn;
  sortOrder?: SortOrder;
  filterKind?: string;
  filterDepartment?: string;
  filterEmitter?: string;
  filterRecipient?: string;
  filterDirection?: 'entrant' | 'sortant' | 'interne';
  filterDateMin?: string;
  filterDateMax?: string;
}

export interface IColumnFilters {
  kind: string;
  department: string;
  emitter: string;
  recipient: string;
  direction: string;
  dateMin: string;
  dateMax: string;
}

export interface ICourrierAnalysisResult {
  direction: "entrant" | "sortant" | "interne" | null;
  emitter: string | null;
  recipient: string | null;
  receptionDate: string | null;
  courrierDate: string | null;
  priority: "normal" | "urgent" | "bas" | null;
  department: string | null;
  kind: string | null;
  description: string | null;
  customFileName: string | null;
  confidence: number;
}
