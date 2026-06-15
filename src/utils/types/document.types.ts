/**
 * Types pour la gestion des documents employés
 */

export interface EmployeeDocument {
  id: number;
  id_employe: number;
  name: string;
  filename: string;
  path: string;
  mime_type: string;
  size: number;
  date_created: string;
  date_updated: string | null;
  created_by: number;
}

export interface EmployeeDocumentFormData {
  file: File;
  customName?: string;
}

export interface UploadDocumentRequest {
  id_employe: number;
  customName?: string;
}

export interface DocumentUploadResult {
  success: boolean;
  message: string;
  data: EmployeeDocument;
}

export interface DocumentsListResult {
  success: boolean;
  data: EmployeeDocument[];
}

export interface DocumentDeleteResult {
  success: boolean;
  message: string;
}

// Types pour l'upload modal
export interface UploadModalState {
  isOpen: boolean;
  fileName: string;
  selectedFile: File | null;
  isUploading: boolean;
  dragging: boolean;
  error: string | null;
}

// Types pour la modale de visualisation (comme courrier)
export interface PdfModalState {
  visible: boolean;
  pdfUrl: string;
  fileName: string;
  fileType: 'pdf' | 'image';
}

// MIME types autorisés
export const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/webp'];
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
