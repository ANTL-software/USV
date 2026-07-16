import './subNav.scss';
import type { ReactElement } from 'react';
import { IoAlertCircleOutline, IoCalendar, IoCallOutline, IoFolder, IoHome, IoMail, IoPeopleCircle, IoReceiptOutline } from 'react-icons/io5';
import { useSubNavView } from '../../../hooks/index.ts';
import type { SubNavViewModel } from '../../../hooks/index.ts';
import type { NavigationIconKey } from '../../../utils/scripts/index.ts';

function NavigationIcon({ icon }: { icon: NavigationIconKey }): ReactElement {
  if (icon === 'booking') return <IoCalendar />;
  if (icon === 'commercial') return <IoReceiptOutline />;
  if (icon === 'commerciaux') return <IoPeopleCircle />;
  if (icon === 'incidents') return <IoAlertCircleOutline />;
  if (icon === 'mail') return <IoMail />;
  if (icon === 'operations') return <IoCallOutline />;
  if (icon === 'projects') return <IoFolder />;
  return <IoHome />;
}

export function SubNavContent({ viewModel }: { viewModel: SubNavViewModel }): ReactElement | null {
  if (!viewModel.visible) return null;
  return <div id="subNav" className="subNav"><div className="subNavContainer">{viewModel.items.map((item) => <button type="button" key={item.id} className={`subNavItem ${item.active ? 'active' : ''}`} onClick={() => viewModel.navigateTo(item.path)}><span className="subNavIcon"><NavigationIcon icon={item.icon} /></span><span className="subNavText">{item.label}</span></button>)}</div></div>;
}

export default function SubNav(): ReactElement | null {
  return <SubNavContent viewModel={useSubNavView()} />;
}
