import type { ReactElement } from 'react';
import { IoAdd, IoCalendarClear } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import type { PostesListViewModel } from '../../../hooks/index.ts';
import { Button } from '../button/index.ts';
import { PlanningAdminModal } from '../planningAdminModal/index.ts';
import { PostesListTable } from '../postesListTable/index.ts';

interface PostesListContentProps { viewModel: PostesListViewModel }

export function PostesListContent({ viewModel }: PostesListContentProps): ReactElement {
  const count = viewModel.postes.length;
  return <><main><div className="postesList__container"><div className="postesList__back"><Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /><span>Retour</span></Button></div><div className="postesList__header"><div><h1>Postes</h1><p className="postesList__subtitle">{count} poste{count !== 1 ? 's' : ''}</p></div><div className="postesList__headerActions"><Button style="white" onClick={viewModel.openPlanningModal}><IoCalendarClear /> Gérer les plannings</Button><Button style="gradient" onClick={viewModel.navigateNewPoste}><IoAdd /> Nouveau poste</Button></div></div>{viewModel.error && <div className="postesList__error">{viewModel.error}</div>}<PostesListTable viewModel={viewModel} /></div></main><PlanningAdminModal viewModel={viewModel} /></>;
}
