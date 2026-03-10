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