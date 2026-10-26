import { getRequest, putRequest } from '../APICalls.ts';
import type { ScriptSupport, ScriptSupportItem, ScriptSupportKind } from '../../utils/types/index.ts';

interface SupportResponse { success: boolean; data?: ScriptSupport; message?: string }
export async function getScriptSupport(id: number, kind: ScriptSupportKind): Promise<ScriptSupport> {
  const response = await getRequest(`/campagnes/${id}/supports/${kind}`);
  const body = response.data as SupportResponse;
  if (!body.success || !body.data) throw new Error(body.message || 'Impossible de charger le support');
  return body.data;
}
export async function saveScriptSupport(id: number, kind: ScriptSupportKind, revision: number, items: ScriptSupportItem[]): Promise<ScriptSupport> {
  const response = await putRequest(`/campagnes/${id}/supports/${kind}`, { revision, items });
  const body = response.data as SupportResponse;
  if (!body.success || !body.data) throw new Error(body.message || 'Impossible d’enregistrer le support');
  return body.data;
}
