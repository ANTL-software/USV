import type { ReactElement } from 'react';
import type { SitesProspectionViewModel } from '../../../hooks/index.ts';
import { Button, Loader } from '../index.ts';

interface SitesProspectionTableProps { viewModel: SitesProspectionViewModel }

export function SitesProspectionTable({ viewModel: vm }: SitesProspectionTableProps): ReactElement {
 if (vm.loading) return <Loader message="Chargement des sites…" />;
 return (  <div className="sitesProspection__table" aria-busy={vm.loading}><table><thead><tr>
   {['code_postal', 'entreprise', 'domain', 'agence'].map((key, index) => <th key={key} aria-sort={vm.query.sort === key ? vm.query.direction === 'ASC' ? 'ascending' : 'descending' : 'none'}><button onClick={() => vm.sort(key)}>{['Code postal', 'Entreprise', 'Site web', 'Agence indiquée'][index]} {vm.query.sort === key ? vm.query.direction === 'ASC' ? '↑' : '↓' : '↕'}</button></th>)}<th>Qualité de preuve</th><th>Suivi</th><th>Fiche</th>
  </tr></thead><tbody>{vm.rows.map(row => <tr key={row.id_site}><td>{row.code_postal || '—'}<small>{row.ville || ''}</small></td><td>{row.entreprise || 'Entreprise non identifiée'}<small>{row.siren ? `SIREN ${row.siren}` : row.identification}{row.etat_entreprise === 'Cessée' ? ' · Cessée' : ''}</small></td><td><a href={row.siteLink} target="_blank" rel="noreferrer">{row.domain} ↗</a></td><td>{row.agence || 'Inconnue'}</td><td><span className={`sitesProspection__badge sitesProspection__badge--${row.agence_statut}`}>{row.agencyLabel}</span></td><td>{row.followupLabel}</td><td><Button style="grey" onClick={() => void vm.open(row.id_site)}>Ouvrir<span className="sitesProspection__srOnly"> {row.domain}</span></Button></td></tr>)}</tbody></table>
  {!vm.loading && vm.rows.length === 0 && <p className="sitesProspection__empty">Aucun site ne correspond à ces filtres.</p>}
  </div>);
}
