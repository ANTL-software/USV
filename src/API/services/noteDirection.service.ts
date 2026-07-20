import {
  getRequest,
  postFormDataRequest,
  deleteRequest,
} from "../APICalls.ts";
import type { AxiosResponse } from "axios";
import { NoteDirectionModel } from '../models/index.ts';
import type { NoteDirectionData } from '../models/index.ts';
import type { IViewUrlResponse } from './viewUrl.service.ts';

export interface NoteDirectionUploadResult {
  success: boolean;
  message: string;
  data: NoteDirectionData;
}

export interface NoteDirectionDeleteResult {
  success: boolean;
  message: string;
}

/**
 * Récupère la liste de toutes les notes de la direction
 */
export const getNotesDirectionService = async (): Promise<NoteDirectionModel[]> => {
  try {
    const response: AxiosResponse<{ success: boolean; data: NoteDirectionData[] }> = await getRequest(
      `/notes-direction`
    );

    if (response.data.success && response.data.data) {
      return NoteDirectionModel.listFromJSON(response.data.data);
    }

    return [];
  } catch (error) {
    console.error("Erreur lors de la récupération des notes de direction:", error);
    throw error;
  }
};

/**
 * Upload une note de la direction
 */
export const uploadNoteDirectionService = async (
  file: File,
  customName?: string
): Promise<NoteDirectionModel> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    if (customName) {
      formData.append('customName', customName);
    }

    const response: AxiosResponse<NoteDirectionUploadResult> = await postFormDataRequest(
      `/notes-direction/upload`,
      formData
    );

    if (response.data.success && response.data.data) {
      return NoteDirectionModel.fromJSON(response.data.data);
    }

    throw new Error(
      response.data.message || "Échec de l'upload de la note de direction"
    );
  } catch (error) {
    console.error("Erreur lors de l'upload de la note de direction:", error);
    throw error;
  }
};

/**
 * Télécharge une note de la direction
 */
export const downloadNoteDirectionService = async (
  noteId: number
): Promise<Blob> => {
  try {
    const response: AxiosResponse<Blob> = await getRequest(
      `/notes-direction/${noteId}/download`,
      {
        responseType: 'blob',
      }
    );

    return response.data;
  } catch (error) {
    console.error("Erreur lors du téléchargement de la note:", error);
    throw error;
  }
};

/**
 * Génère une URL signée temporaire pour visualiser une note de la direction
 */
export const generateNoteDirectionViewUrlService = async (
  noteId: number,
  expiresInMinutes: number = 10
): Promise<IViewUrlResponse> => {
  const response: AxiosResponse<{ success: boolean; message: string; data: IViewUrlResponse }> = await getRequest(
    `/notes-direction/${noteId}/view-url?expires=${expiresInMinutes}`
  );

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.message || "Failed to generate signed URL");
};

/**
 * Supprime une note de la direction
 */
export const deleteNoteDirectionService = async (
  noteId: number
): Promise<NoteDirectionDeleteResult> => {
  try {
    const response: AxiosResponse<NoteDirectionDeleteResult> = await deleteRequest(
      `/notes-direction/${noteId}`
    );

    if (response.data.success) {
      return response.data;
    }

    throw new Error(
      response.data.message || "Échec de la suppression de la note"
    );
  } catch (error) {
    console.error("Erreur lors de la suppression de la note:", error);
    throw error;
  }
};

export default {
  getNotesDirectionService,
  uploadNoteDirectionService,
  downloadNoteDirectionService,
  generateNoteDirectionViewUrlService,
  deleteNoteDirectionService,
};
