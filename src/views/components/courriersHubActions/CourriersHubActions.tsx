import type { ReactElement } from 'react';
import { MdAdd, MdList, MdPhotoCamera } from 'react-icons/md';
import type { CourriersHubViewModel } from '../../../hooks/index.ts';

interface CourriersHubActionsProps { viewModel: CourriersHubViewModel }

export function CourriersHubActions({ viewModel }: CourriersHubActionsProps): ReactElement {
  const actions = [
    { allowed: viewModel.access.new, id: 'new', label: 'Nouveau courrier', icon: <MdAdd />, primary: true, onClick: viewModel.navigateNew },
    { allowed: viewModel.access.list, id: 'list', label: 'Liste des courriers', icon: <MdList />, primary: false, onClick: viewModel.navigateList },
    { allowed: viewModel.access.convert, id: 'convert', label: 'Photo → PDF', icon: <MdPhotoCamera />, primary: false, onClick: viewModel.navigateConvert },
  ].filter((action) => action.allowed);
  return (
    <section className="courriersActions" data-aos="fade-up" data-aos-delay="100"><div className="actionsGrid">{actions.map((action, index) => (
      <button key={action.id} type="button" className={`actionBtn ${action.primary ? 'primary' : ''}`} onClick={action.onClick} data-aos="fade-up" data-aos-delay={150 + index * 50}><span className="actionIcon">{action.icon}</span><span className="actionText">{action.label}</span></button>
    ))}</div></section>
  );
}
