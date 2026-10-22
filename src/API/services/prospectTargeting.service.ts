import { isAxiosError } from "axios";
import {
  getRequest,
  postRequest,
  deleteRequest,
  putRequest,
} from "../APICalls.ts";
import type {
  TargetingChoice,
  Prospect,
  TargetingCatalog,
  TargetingSaved,
  TargetingGroup,
  TargetingRequest,
  TargetingPreview,
  TargetingResult,
  TargetingRow,
  TargetingHistory,
} from "../../utils/types/index.ts";
interface Response<T> {
  success: boolean;
  data?: T;
  message?: string;
}
async function read<T>(request: Promise<{ data: Response<T> }>): Promise<T> {
  const { data } = await request.catch((failure: unknown) => {
    if (
      isAxiosError<{ message?: string }>(failure) &&
      failure.response?.data?.message
    )
      throw new Error(failure.response.data.message);
    throw failure;
  });
  if (!data.success || data.data === undefined)
    throw new Error(data.message || "Opération de ciblage impossible.");
  return data.data;
}
const base = (id: number): string => `/campagnes/${id}/targeting`;
export const getTargetingCatalog = (id: number): Promise<TargetingCatalog> =>
  read(getRequest(`${base(id)}/catalog`));
export const getTargetings = (id: number): Promise<TargetingSaved[]> =>
  read(getRequest(`${base(id)}/saved`));
export const saveTargeting = (
  id: number,
  nom: string,
  criteria: TargetingGroup,
): Promise<TargetingSaved> =>
  read(postRequest(`${base(id)}/saved`, { nom, criteria }));
export const deactivateTargeting = (
  id: number,
  rule: string,
): Promise<{ id: string; active: boolean }> =>
  read(deleteRequest(`${base(id)}/saved/${rule}`));
export const previewTargeting = (
  id: number,
  request: TargetingRequest,
): Promise<TargetingPreview> =>
  read(postRequest(`${base(id)}/preview`, request));
export const executeTargeting = (
  id: number,
  operation: string,
): Promise<TargetingResult> =>
  read(postRequest(`${base(id)}/operations/${operation}/execute`, {}));
export const getTargetingRows = (
  id: number,
  operation: string,
  page: number,
): Promise<TargetingRow[]> =>
  read(getRequest(`${base(id)}/operations/${operation}/rows?page=${page}`));
export const getTargetingHistory = (id: number): Promise<TargetingHistory[]> =>
  read(getRequest(`${base(id)}/operations`));

export const confirmProspectWorkforce = (id: number): Promise<Prospect> =>
  read(putRequest(`/prospects/${id}`, { effectif_confirmation: true }));

export const getTargetingOptions = (
  id: number,
  field: string,
  search: string,
): Promise<TargetingChoice[]> =>
  read(
    getRequest(
      `${base(id)}/options/${encodeURIComponent(field)}?search=${encodeURIComponent(search)}`,
    ),
  );
