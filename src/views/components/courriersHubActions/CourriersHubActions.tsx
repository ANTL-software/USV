import type { ReactElement } from 'react';
import { MdAdd, MdList, MdPhotoCamera } from 'react-icons/md';
import type { CourriersHubViewModel } from '../../../hooks/index.ts';

interface CourriersHubActionsProps { viewModel: CourriersHubViewModel }

export function CourriersHubActions({ viewModel }: CourriersHubActionsProps): ReactElement {
  const actions = [
    { id: 'new', label: 'Nouveau courrier', icon: <MdAdd />, primary: true, onClick: viewModel.navigateNew },
    { id: 'list', label: 'Liste des courriers', icon: <MdList />, primary: false, onClick: viewModel.navigateList },
    { id: 'convert', label: 'Photo → PDF', icon: <MdPhotoCamera />, primary: false, onClick: viewModel.navigateConvert },
  ];
  return (
    <section className="courriersActions" data-aos="fade-up" data-aos-delay="100"><div className="actionsGrid">{actions.map((action, index) => (
      <button key={action.id} type="button" className={`actionBtn ${action.primary ? 'primary' : ''}`} onClick={action.onClick} data-aos="fade-up" data-aos-delay={150 + index * 50}><span className="actionIcon">{action.icon}</span><span className="actionText">{action.label}</span></button>
    ))}</div></section>
  );
}
