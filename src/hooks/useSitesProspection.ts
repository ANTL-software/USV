import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSitesProspectionService, getSiteProspectionService, updateSiteProspectionService } from '../API/services/index.ts';
import { buildSiteEditPatch, createSiteEditForm, DEFAULT_SITE_QUERY, safeSiteLink, SITE_AGENCY_OPTIONS, SITE_EDIT_FIELDS, SITE_FOLLOWUP_OPTIONS, siteAgencyLabel, siteFollowupLabel, siteProofLabel, siteRequestError } from '../utils/scripts/index.ts';
import type { SiteEditField, SiteEditForm, SiteProspection, SiteProspectionList, SiteProspectionQuery } from '../utils/types/index.ts';
export function useSitesProspection() {
 const navigate = useNavigate();
 const [query, setQuery] = useState<SiteProspectionQuery>(DEFAULT_SITE_QUERY);
 const [data, setData] = useState<SiteProspectionList>({ rows: [], total: 0, page: 1, limit: 50 });
 const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false), [error, setError] = useState('');
 const [selected, setSelected] = useState<SiteProspection | null>(null), [form, setForm] = useState<SiteEditForm | null>(null);
 const [success, setSuccess] = useState('');
 const [refresh, setRefresh] = useState(0); const detailRequest = useRef(0);
 useEffect(() => {
  let active = true; const timer = setTimeout(() => {
   setLoading(true); setError('');
   void getSitesProspectionService(query).then(result => { if (active) setData(result); }).catch(e => { if (active) setError(siteRequestError(e)); }).finally(() => { if (active) setLoading(false); });
  }, 250);
  return () => { active = false; clearTimeout(timer); };
 }, [query, refresh]);
 const changeFilter = (key: keyof SiteProspectionQuery, value: string) => setQuery(current => ({ ...current, [key]: value, page: 1 }));
 const sort = (key: string) => setQuery(current => ({ ...current, sort: key, direction: current.sort === key && current.direction === 'ASC' ? 'DESC' : 'ASC', page: 1 }));
 const close = useCallback(() => { detailRequest.current++; setSelected(null); setForm(null); }, []);
 useEffect(() => { if (!selected) return; const escape = (event: KeyboardEvent) => { if (event.key === 'Escape' && !saving) close(); }; window.addEventListener('keydown', escape); return () => window.removeEventListener('keydown', escape); }, [selected, saving, close]);
 const open = async (id: number) => {
  const request = ++detailRequest.current; setError(''); setSuccess('');
  try { const site = await getSiteProspectionService(id); if (request === detailRequest.current) { setSelected(site); setForm(createSiteEditForm(site)); } } catch (e) { setError(siteRequestError(e)); }
 };
 const save = async () => {
  if (!selected || !form || saving) return;
  const patch = buildSiteEditPatch(selected, form); if (Object.keys(patch).length === 1) { close(); return; }
  setSaving(true); setError(''); setSuccess('');
  try { const site = await updateSiteProspectionService(selected.id_site, patch); setSelected(site); setForm(createSiteEditForm(site)); setSuccess('Modifications enregistrées.'); setRefresh(value => value + 1); } catch (e) { setError(siteRequestError(e)); } finally { setSaving(false); }
 };
 const source = selected?.entreprise_sources;
 return {
  query, loading, saving, error, success, selected, form, fields: SITE_EDIT_FIELDS, agencyOptions: SITE_AGENCY_OPTIONS, followupOptions: SITE_FOLLOWUP_OPTIONS,
  total: data.total, rows: data.rows.map(site => ({ ...site, agencyLabel: siteAgencyLabel(site.agence_statut), followupLabel: siteFollowupLabel(site.suivi), siteLink: safeSiteLink(site.site_url) })),
  page: query.page, pages: Math.max(1, Math.ceil(data.total / query.limit)),
  sourceLinks: source ? [['Registre officiel', source.annuaire_url || source.registry_source_url], ['Éditeur du site', source.site_source_url]].map(([label, url]) => ({ label: String(label), url: safeSiteLink(url) })).filter(link => link.url) : [],
  sourceAddress: typeof source?.site_address === 'string' ? source.site_address : '',
  sourceDate: typeof source?.registry_checked_at === 'string' ? source.registry_checked_at : '',
  proofs: (selected?.preuves || []).map(proof => ({ ...proof, label: siteProofLabel(proof.kind), link: safeSiteLink(proof.page_url), resourceLink: safeSiteLink(proof.resource_url) })),
  changeFilter, sort, open, close, save,
  reload: () => setRefresh(value => value + 1),
  reloadSelected: () => { if (selected) void open(selected.id_site); },
  changeForm: (key: SiteEditField, value: string) => setForm(current => current ? { ...current, [key]: value } : current),
  previous: () => setQuery(current => ({ ...current, page: Math.max(1, current.page - 1) })),
  next: () => setQuery(current => ({ ...current, page: current.page + 1 })),
  reset: () => setQuery(DEFAULT_SITE_QUERY), back: () => void navigate('/commercial'),
 };
}
export type SitesProspectionViewModel = ReturnType<typeof useSitesProspection>;
