import type { ReactElement } from 'react';
import { IoListOutline } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import type { IncidentListViewModel } from '../../../hooks/index.ts';
import { Button } from '../button/index.ts';
import { IncidentListFilters } from '../incidentListFilters/index.ts';
import { IncidentListTable } from '../incidentListTable/index.ts';

interface IncidentListContentProps { viewModel: IncidentListViewModel }

export function IncidentListContent({ viewModel }: IncidentListContentProps): ReactElement {
  const count = viewModel.pagination.total;
  return <div className="incidents__container incidents__container--wide"><div className="incidents__header"><Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /><span>Retour</span></Button><h1><IoListOutline /> Liste des incidents</h1></div>{viewModel.error && <div className="incidents__error">{viewModel.error}</div>}<IncidentListFilters viewModel={viewModel} /><div className="incidents__table-header"><p>{count} incident{count > 1 ? 's' : ''} trouvé{count > 1 ? 's' : ''}</p></div><IncidentListTable viewModel={viewModel} /><div className="incidents__pagination"><button type="button" onClick={viewModel.previousPage} disabled={viewModel.pagination.page <= 1}>Précédent</button><span>Page {viewModel.pagination.page} / {viewModel.pagination.totalPages}</span><button type="button" onClick={viewModel.nextPage} disabled={viewModel.pagination.page >= viewModel.pagination.totalPages}>Suivant</button></div></div>;
}
