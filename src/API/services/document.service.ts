import {
  getRequest,
  postFormDataRequest,
  deleteRequest,
} from "../APICalls.ts";
import { AxiosResponse } from "axios";
import {
  DocumentsListResult,
  DocumentUploadResult,
  DocumentDeleteResult,
} from "../../utils/types/document.types";
import { DocumentModel } from "../models/document.model";
import { IViewUrlResponse } from "./viewUrl.service";

/**
 * Récupère la liste des documents d'un employé
 * @param id_employe - ID de l'employé
 * @returns Promise avec la liste des documents (modèles)
 */
export const getDocumentsByEmployeService = async (
  id_employe: number
): Promise<DocumentModel[]> => {
  try {
    const response: AxiosResponse<DocumentsListResult> = await getRequest(
      `/employes/${id_employe}/documents`
    );

    if (response.data.success && response.data.data) {
      return DocumentModel.listFromJSON(response.data.data);
    }

    return [];
  } catch (error) {
    console.error("Erreur lors de la récupération des documents:", error);
    throw error;
  }
};

/**
 * Upload un document pour un employé
 * @param id_employe - ID de l'employé cible
 * @param file - Fichier à uploader
 * @param customName - Nom personnalisé (optionnel)
 * @returns Promise avec le document créé (modèle)
 */
export const uploadDocumentService = async (
  id_employe: number,
  file: File,
  customName?: string
): Promise<DocumentModel> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    if (customName) {
      formData.append('customName', customName);
    }

    const response: AxiosResponse<DocumentUploadResult> = await postFormDataRequest(
      `/employes/${id_employe}/documents`,
      formData
    );

    if (response.data.success && response.data.data) {
      return DocumentModel.fromJSON(response.data.data);
    }

    throw new Error(
      response.data.message || "Échec de l'upload du document"
    );
  } catch (error) {
    console.error("Erreur lors de l'upload du document:", error);
    throw error;
  }
};

/**
 * Télécharge un document
 * @param documentId - ID du document
 * @returns Promise avec le Blob du fichier
 */
export const downloadDocumentService = async (
  documentId: number
): Promise<Blob> => {
  try {
    const response: AxiosResponse<Blob> = await getRequest(
      `/employes/documents/${documentId}/download`,
      {
        responseType: 'blob',
      }
    );

    return response.data;
  } catch (error) {
    console.error("Erreur lors du téléchargement du document:", error);
    throw error;
  }
};

/**
 * Génère une URL signée temporaire pour visualiser un document employé
 * @param documentId - ID du document
 * @param expiresInMinutes - Durée de validité en minutes (1-60, défaut: 10)
 */
export const generateDocumentViewUrlService = async (
  documentId: number,
  expiresInMinutes: number = 10
): Promise<IViewUrlResponse> => {
  const response: AxiosResponse<{ success: boolean; message: string; data: IViewUrlResponse }> = await getRequest(
    `/employes/documents/${documentId}/view-url?expires=${expiresInMinutes}`
  );

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || "Failed to generate signed URL");
};

/**
 * Supprime un document
 * @param documentId - ID du document
 * @returns Promise avec le résultat de la suppression
 */
export const deleteDocumentService = async (
  documentId: number
): Promise<DocumentDeleteResult> => {
  try {
    const response: AxiosResponse<DocumentDeleteResult> = await deleteRequest(
      `/employes/documents/${documentId}`
    );

    if (response.data.success) {
      return response.data;
    }

    throw new Error(
      response.data.message || "Échec de la suppression du document"
    );
  } catch (error) {
    console.error("Erreur lors de la suppression du document:", error);
    throw error;
  }
};

/**
 * Service pour récupérer un seul document par ID
 * @param documentId - ID du document
 * @returns Promise avec le document (modèle)
 */
export const getDocumentByIdService = async (
  documentId: number
): Promise<DocumentModel | null> => {
  try {
    const documents = await getDocumentsByEmployeService(documentId);
    const foundDocument = documents.find((doc) => doc.id === documentId);

    return foundDocument || null;
  } catch (error) {
    console.error(
      `Erreur lors de la récupération du document ${documentId}:`,
      error
    );
    return null;
  }
};

export default {
  getDocumentsByEmployeService,
  uploadDocumentService,
  downloadDocumentService,
  generateDocumentViewUrlService,
  deleteDocumentService,
  getDocumentByIdService,
};
