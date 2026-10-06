import type { SiteProspection } from '../../utils/types/index.ts';
export function normalizeSiteProspection(site: SiteProspection): SiteProspection {
 return { ...site, id_site: Number(site.id_site), revision: Number(site.revision), preuves: site.preuves ?? [], entreprise_sources: site.entreprise_sources ?? {} };
}
