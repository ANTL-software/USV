import type { ReactElement } from 'react';

import type { CommandesListViewModel } from '../../../hooks/index.ts';
import { CommandesLeadTable, CommandesSaleTable, Loader } from '../index.ts';
import { Button } from '../button/index.ts';

interface CommandesContentProps {
  viewModel: CommandesListViewModel;
}

export function CommandesContent({ viewModel }: CommandesContentProps): ReactElement {
  const { commandes } = viewModel;
  if (commandes.isCrossCampaignSearch) {
    if (commandes.searchLoading) return <Loader message="Recherche dans toutes les campagnes..." />;
    if (commandes.searchError) return <div className="empty">{commandes.searchError}</div>;
    if (commandes.searchResults.length === 0) return <div className="empty">Aucune vente ou rendez-vous client ne correspond à cette recherche.</div>;
    return <>
      <div className="commandesList__table-wrapper"><table>
        <thead><tr><th>Réf.</th><th>Type</th><th>Campagne</th><th>Client</th><th>Contact</th><th>Téléphone</th><th>Date</th><th>Statut</th></tr></thead>
        <tbody>{commandes.searchResults.map((result) => <tr key={`${result.type}-${result.id}`} className="commandesList__row--clickable" onClick={() => { if (result.type === 'lead') viewModel.navigateToLead(result.id); else viewModel.navigateToSale(result.id); }}>
          <td><span className="commandesList__reference">{result.reference}</span></td><td>{result.type === 'lead' ? 'Lead client' : 'Vente'}</td><td>{result.campagne}</td><td>{result.client ?? '—'}</td><td>{result.contact ?? '—'}</td><td>{result.telephone ?? '—'}</td><td>{new Intl.DateTimeFormat('fr-FR').format(new Date(result.date_creation))}</td><td>{result.statut}</td>
        </tr>)}</tbody>
      </table></div>
      {commandes.searchPagination && commandes.searchPagination.totalPages > 1 && <div className="commandesList__pagination"><Button style="grey" onClick={() => commandes.setSearchPage(commandes.searchPage - 1)} disabled={commandes.searchPage <= 1}>Précédent</Button><span>Page {commandes.searchPage} / {commandes.searchPagination.totalPages}</span><Button style="grey" onClick={() => commandes.setSearchPage(commandes.searchPage + 1)} disabled={commandes.searchPage >= commandes.searchPagination.totalPages}>Suivant</Button></div>}
    </>;
  }
  if (!commandes.hasCampaignSelection) return <div className="empty">Sélectionnez une campagne pour voir {commandes.isLeadCampaign ? 'les rendez-vous client' : 'les commandes'}.</div>;
  if (commandes.pageLoading) return <Loader message={commandes.isLeadCampaign ? 'Chargement des rendez-vous client...' : 'Chargement des commandes...'} />;
  if (commandes.isLeadCampaign && commandes.leadClients.length === 0 && !commandes.pageError) return <div className="empty">Aucun rendez-vous client trouvé pour cette campagne.</div>;
  if (!commandes.isLeadCampaign && commandes.ventes.length === 0 && !commandes.pageError) return <div className="empty">{commandes.isCorbeille ? 'Aucune commande supprimée pour cette campagne.' : 'Aucune commande trouvée pour cette campagne.'}</div>;
  return <>{commandes.isLeadCampaign ? <CommandesLeadTable viewModel={viewModel} /> : <CommandesSaleTable viewModel={viewModel} />}</>;
}
