import type { ReactElement } from 'react';
import type { ProjetDetailsViewModel } from '../../../hooks/index.ts';
import { Button, ProjetDetailsDashboard, ProjetDetailsHeader, ProjetInformationCard, ProjetMembersCard, ProjetQuickActions } from '../index.ts';

interface ProjetDetailsContentProps { viewModel: ProjetDetailsViewModel }

export function ProjetDetailsContent({ viewModel }: ProjetDetailsContentProps): ReactElement {
  if (viewModel.projetLoading || (!viewModel.projet && !viewModel.projetError)) return <div className="projetDetails__loading"><div className="spinner" /><p>Chargement du projet...</p></div>;
  if (viewModel.projetError) return <div className="projetDetails__error"><p>{viewModel.projetError}</p><Button style="gradient" onClick={viewModel.navigateToProjects}>Retour</Button></div>;
  if (!viewModel.projet) return <div className="projetDetails__error"><p>Projet introuvable.</p><Button style="gradient" onClick={viewModel.navigateToProjects}>Retour</Button></div>;

  return (
    <>
      <ProjetDetailsHeader projet={viewModel.projet} navigateToEdit={viewModel.navigateToEdit} navigateToProjects={viewModel.navigateToProjects} navigateToTasks={viewModel.navigateToTasks} />
      {viewModel.dashboard && <ProjetDetailsDashboard dashboard={viewModel.dashboard} memberCount={viewModel.membres.length} />}
      <div className="projetDetails__grid"><ProjetInformationCard projet={viewModel.projet} /><ProjetMembersCard viewModel={viewModel} /></div>
      <ProjetQuickActions {...viewModel} />
    </>
  );
}
