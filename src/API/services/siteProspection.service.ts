import type { AxiosResponse } from 'axios';
import { getRequest, patchRequest } from '../APICalls.ts';
import { normalizeSiteProspection } from '../models/index.ts';
import type { ApiResponse, SiteProspection, SiteProspectionList, SiteProspectionQuery, SiteEditPatch } from '../../utils/types/index.ts';
export async function getSitesProspectionService(query: SiteProspectionQuery): Promise<SiteProspectionList> {
 const params = new URLSearchParams(Object.entries(query).map(([key, value]) => [key, String(value)]));
 const response: AxiosResponse<ApiResponse<SiteProspectionList>> = await getRequest(`/sites-prospection?${params}`);
 if (!response.data.success || !response.data.data) throw new Error(response.data.message || 'Impossible de charger les sites');
 return { ...response.data.data, rows: response.data.data.rows.map(normalizeSiteProspection) };
}
export async function getSiteProspectionService(id: number): Promise<SiteProspection> {
 const response: AxiosResponse<ApiResponse<SiteProspection>> = await getRequest(`/sites-prospection/${id}`);
 if (!response.data.success || !response.data.data) throw new Error(response.data.message || 'Impossible de charger la fiche');
 return normalizeSiteProspection(response.data.data);
}
export async function updateSiteProspectionService(id: number, patch: SiteEditPatch): Promise<SiteProspection> {
 const response = await patchRequest<SiteEditPatch, ApiResponse<SiteProspection>>(`/sites-prospection/${id}`, patch);
 if (!response.data.success || !response.data.data) throw new Error(response.data.message || 'Impossible de modifier la fiche');
 return normalizeSiteProspection(response.data.data);
}
