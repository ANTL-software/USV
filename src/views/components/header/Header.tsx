import './header.scss';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { HiMenu, HiX } from 'react-icons/hi';
import { IoAdd, IoAlertCircleOutline, IoCalendar, IoCallOutline, IoFolder, IoHome, IoList, IoPeopleCircle, IoReceiptOutline } from 'react-icons/io5';
import { LuLogOut } from 'react-icons/lu';
import antlLogo from '../../../assets/antlLogo.png';
import { useHeaderView } from '../../../hooks/index.ts';
import type { HeaderViewModel } from '../../../hooks/index.ts';
import type { NavigationIconKey } from '../../../utils/scripts/index.ts';
import { PWAInstallButton } from '../pwaInstallButton/index.ts';

interface HeaderContentProps {
  closeMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  viewModel: HeaderViewModel;
}

function NavigationIcon({ icon }: { icon: NavigationIconKey }): ReactElement {
  if (icon === 'add') return <IoAdd className="mobileNavIcon" />;
  if (icon === 'booking') return <IoCalendar className="mobileNavIcon" />;
  if (icon === 'commercial') return <IoReceiptOutline className="mobileNavIcon" />;
  if (icon === 'commerciaux') return <IoPeopleCircle className="mobileNavIcon" />;
  if (icon === 'incidents') return <IoAlertCircleOutline className="mobileNavIcon" />;
  if (icon === 'list') return <IoList className="mobileNavIcon" />;
  if (icon === 'operations') return <IoCallOutline className="mobileNavIcon" />;
  if (icon === 'projects') return <IoFolder className="mobileNavIcon" />;
  return <IoHome className="mobileNavIcon" />;
}

export function HeaderContent({ closeMobileMenu, isMobileMenuOpen, toggleMobileMenu, viewModel }: HeaderContentProps): ReactElement {
  const navigate = (path: string): void => { viewModel.navigateTo(path); closeMobileMenu(); };
  const logout = (): void => { closeMobileMenu(); void viewModel.logout(); };
  return <>
    <header id="header"><div className="headerContainer">
      <button type="button" className="headerBrand" onClick={() => navigate(viewModel.brandPath)} title={viewModel.isAuthRoute ? '' : 'Home'}><figure className="brandLogo"><img src={antlLogo} alt="ANTL" /></figure></button>
      <div className="headerRight">
        {viewModel.hasUser && !viewModel.isAuthRoute && <span className="userGreeting"><span>{viewModel.greeting}</span>{viewModel.showTestBadge && <span className="envBadge envBadge--test">TEST</span>}</span>}
        {viewModel.hasUser && !viewModel.isAuthRoute && <div className="headerActions"><PWAInstallButton variant="desktop" compact /><button type="button" onClick={logout} className="logoutButton" title="Déconnexion" aria-label="Déconnexion"><LuLogOut size={18} /></button></div>}
        {!viewModel.isAuthRoute && <button type="button" className="headerToggle" onClick={toggleMobileMenu} aria-label="Toggle navigation">{isMobileMenuOpen ? <HiX /> : <HiMenu />}</button>}
      </div>
    </div></header>
    {isMobileMenuOpen && !viewModel.isAuthRoute && <div className="mobileMenuOverlay" onClick={closeMobileMenu}><div className="mobileMenu utils" onClick={(event) => event.stopPropagation()}>
      <div className="mobileMenuHeader utils"><span className="mobileMenuTitle">Navigation</span><button type="button" className="mobileMenuClose" onClick={closeMobileMenu}><HiX /></button></div>
      <div className="mobileMenuContent">
        {viewModel.hasUser && <div className="mobileUserInfo"><span className="mobileUserGreeting"><span>{viewModel.greeting}</span>{viewModel.showTestBadge && <span className="envBadge envBadge--test">TEST</span>}</span><PWAInstallButton variant="mobile" compact /><button type="button" onClick={logout} className="mobileLogoutButton" title="Déconnexion"><LuLogOut size={16} /> Déconnexion</button></div>}
        <div className="mobileSection">{viewModel.mobileGroups.map((group) => <div key={group.id}>{group.title && <h3 className="mobileSectionTitle">{group.title}</h3>}{group.items.map((item) => <button type="button" key={item.id} className={`mobileNavItem ${item.active ? 'active' : ''}`} onClick={() => navigate(item.path)}><NavigationIcon icon={item.icon} /><span className="mobileNavText">{item.label}</span></button>)}</div>)}</div>
      </div>
    </div></div>}
  </>;
}

export default function Header(): ReactElement {
  const viewModel = useHeaderView();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return <HeaderContent viewModel={viewModel} isMobileMenuOpen={isMobileMenuOpen} closeMobileMenu={() => setIsMobileMenuOpen(false)} toggleMobileMenu={() => setIsMobileMenuOpen((open) => !open)} />;
}
