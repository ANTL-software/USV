import type { SiteProspection } from '../../utils/types/index.ts';
export function normalizeSiteProspection(site: SiteProspection): SiteProspection {
 return { ...site, id_site: Number(site.id_site), revision: Number(site.revision), telephone_preuves: site.telephone_preuves ?? [], telephone_statut: site.telephone_statut || 'non_recherche', preuves: site.preuves ?? [], entreprise_sources: site.entreprise_sources ?? {} };
}
