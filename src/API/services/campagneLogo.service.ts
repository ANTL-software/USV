import {
  postFormDataRequest,
  deleteRequest,
} from "../APICalls.ts";
import type { AxiosResponse } from "axios";
import {
  CampagneLogoUploadResult,
  CampagneLogoDeleteResult,
} from "../../utils/types/campagne.types";

/**
 * Upload le logo d'une campagne
 */
export const uploadCampagneLogoService = async (
  id_campagne: number,
  file: File,
  customName?: string
): Promise<CampagneLogoUploadResult> => {
  const formData = new FormData();
  formData.append("file", file);

  if (customName) {
    formData.append("customName", customName);
  }

  const response: AxiosResponse<CampagneLogoUploadResult> = await postFormDataRequest(
    `/campagnes/${id_campagne}/logo`,
    formData
  );

  return response.data;
};

/**
 * Supprime le logo d'une campagne
 */
export const deleteCampagneLogoService = async (
  id_campagne: number
): Promise<CampagneLogoDeleteResult> => {
  const response: AxiosResponse<CampagneLogoDeleteResult> = await deleteRequest(
    `/campagnes/${id_campagne}/logo`
  );

  return response.data;
};

export default {
  uploadCampagneLogoService,
  deleteCampagneLogoService,
};
