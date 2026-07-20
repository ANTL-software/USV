import type { ReactElement } from 'react';
import type { PaniersListViewModel } from '../../../hooks/index.ts';
import { PanierListForm } from '../panierListForm/index.ts';
import { PaniersListAccordions } from '../paniersListAccordions/index.ts';
import { PaniersListHeader } from '../paniersListHeader/index.ts';

interface PaniersListContentProps { viewModel: PaniersListViewModel }

export function PaniersListContent({ viewModel }: PaniersListContentProps): ReactElement {
  return (
    <div className="paniersList__container">
      <PaniersListHeader onBack={viewModel.navigateBack} onCreate={viewModel.openCreateForm} />
      {viewModel.showForm && <PanierListForm viewModel={viewModel} />}
      {viewModel.error ? <div className="paniersList__error">{viewModel.error}</div> : viewModel.isLoading ? <div className="paniersList__loading">Chargement...</div> : viewModel.paniers.length === 0 ? <div className="paniersList__empty">Aucun panier.</div> : <PaniersListAccordions viewModel={viewModel} />}
    </div>
  );
}
