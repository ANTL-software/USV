import type { ReactElement } from 'react';
import { IoArrowBack } from 'react-icons/io5';
import type { MesTachesViewModel } from '../../../hooks/index.ts';
import { KANBAN_COLUMN_CONFIGS } from '../../../utils/scripts/index.ts';
import { Button } from '../button/index.ts';
import { MesTachesTask } from '../mesTachesTask/index.ts';

interface MesTachesContentProps { viewModel: MesTachesViewModel }

export function MesTachesContent({ viewModel }: MesTachesContentProps): ReactElement {
  return (
    <div className="mesTaches__container">
      <div className="mesTaches__header"><Button style="back" onClick={viewModel.navigateBack}><IoArrowBack /><span>Retour aux projets</span></Button><h1>Mes tâches</h1><div className="mesTaches__header-spacer" /></div>
      {viewModel.isLoading && <div className="mesTaches__loading"><div className="spinner" /><p>Chargement des tâches...</p></div>}
      {viewModel.error && <div className="mesTaches__error"><p>{viewModel.error}</p><Button style="gradient" onClick={() => { void viewModel.load(); }}>Réessayer</Button></div>}
      {!viewModel.isLoading && !viewModel.error && <div className="mesTaches__board">{KANBAN_COLUMN_CONFIGS.map((column) => {
        const tasks = viewModel.sortedColumns[column.id];
        return <section key={column.id} className={`mesTaches__column mesTaches__column--${column.id}`}><div className="mesTaches__column-header"><span className="mesTaches__column-icon">{column.icon}</span><h2 className="mesTaches__column-title">{column.title}</h2><span className="mesTaches__column-count">{tasks.length}</span></div><div className="mesTaches__tasks">{tasks.map((task) => <MesTachesTask key={task.id_tache} task={task} viewModel={viewModel} />)}{tasks.length === 0 && <div className="mesTaches__empty"><p>Aucune tâche</p></div>}</div></section>;
      })}</div>}
    </div>
  );
}
