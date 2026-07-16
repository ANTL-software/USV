import type { ReactElement } from 'react';
import { IoFolderOpen } from 'react-icons/io5';
import type { ProjetsListViewModel } from '../../../hooks/index.ts';
import { Button } from '../button/index.ts';
import { ProjetsListFilters } from '../projetsListFilters/index.ts';
import { ProjetsListHeader } from '../projetsListHeader/index.ts';
import { ProjetsListTable } from '../projetsListTable/index.ts';

interface ProjetsListContentProps { viewModel: ProjetsListViewModel }

export function ProjetsListContent({ viewModel }: ProjetsListContentProps): ReactElement {
  return (
    <div className="projetsList__container">
      <ProjetsListHeader onBack={viewModel.navigateHome} onCreate={viewModel.navigateNewProject} onMyTasks={viewModel.navigateMyTasks} />
      <ProjetsListFilters viewModel={viewModel} />
      {viewModel.isLoading && <div className="projetsList__loading"><div className="spinner" /><p>Chargement des projets...</p></div>}
      {viewModel.error && <div className="projetsList__error"><p>{viewModel.error}</p><Button style="gradient" onClick={viewModel.refreshProjets}>Réessayer</Button></div>}
      {!viewModel.isLoading && !viewModel.error && viewModel.projets.length === 0 && <div className="projetsList__empty"><IoFolderOpen size={48} /><p>Aucun projet trouvé</p><p>Créez votre premier projet pour commencer</p></div>}
      {!viewModel.isLoading && !viewModel.error && viewModel.projets.length > 0 && <ProjetsListTable viewModel={viewModel} />}
    </div>
  );
}
