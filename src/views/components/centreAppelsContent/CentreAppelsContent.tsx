import type { ReactElement, ReactNode } from 'react';
import {
  IoBriefcase,
  IoCalendarClear,
  IoCallOutline,
  IoCheckmarkCircleOutline,
  IoEyeOutline,
  IoLaptopOutline,
  IoPeople,
  IoPersonCircleOutline,
  IoPricetag,
  IoReceipt,
  IoStatsChartOutline,
} from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import type { CentreAppelsPageViewModel } from '../../../hooks/index.ts';
import { BackToTop, Button, Header, NotificationBadge, SubNav } from '../index.ts';

interface CentreAppelsContentProps { viewModel: CentreAppelsPageViewModel; }

interface CentreAppelsCardProps {
  children: ReactNode;
  icon: ReactNode;
  notification?: string;
  onClick: () => void;
}

function CentreAppelsCard({ children, icon, notification, onClick }: CentreAppelsCardProps): ReactElement {
  return <section className="centreAppels__card" onClick={onClick} style={notification ? { position: 'relative' } : undefined}>{notification && <NotificationBadge sectionId="operations" subsectionId={notification} />}<div className="centreAppels__card-icon">{icon}</div><h2>{children}</h2></section>;
}

export function CentreAppelsContent({ viewModel }: CentreAppelsContentProps): ReactElement {
  const { access } = viewModel;
  return <div id="centreAppels"><Header /><SubNav /><main><div className="centreAppels__back"><Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /><span>Retour</span></Button></div><div className="centreAppels__wrapper"><div className="centreAppels__row">{access.supervision && <CentreAppelsCard notification="supervision" icon={<IoEyeOutline />} onClick={viewModel.navigateToSupervision}>Supervision</CentreAppelsCard>}{access.supervision && <CentreAppelsCard icon={<IoStatsChartOutline />} onClick={viewModel.navigateToVigie}>Vigie</CentreAppelsCard>}{access.commandes && <CentreAppelsCard notification="commandes" icon={<IoReceipt />} onClick={viewModel.navigateToCommandes}>Commandes</CentreAppelsCard>}{access.campagnes && <CentreAppelsCard notification="campagnes" icon={<IoCallOutline />} onClick={viewModel.navigateToCampagnes}>Campagnes</CentreAppelsCard>}{access.prospects && <CentreAppelsCard notification="prospects" icon={<IoPersonCircleOutline />} onClick={viewModel.navigateToProspects}>Prospects</CentreAppelsCard>}</div><div className="centreAppels__row">{access.produits && <CentreAppelsCard notification="produits" icon={<IoPricetag />} onClick={viewModel.navigateToProduits}>Produits</CentreAppelsCard>}{access.qualite && <CentreAppelsCard notification="qualite" icon={<IoCheckmarkCircleOutline />} onClick={viewModel.navigateToQualite}>Qualité</CentreAppelsCard>}{access.demandesAbsence && <CentreAppelsCard notification="demandes-absence" icon={<IoCalendarClear />} onClick={viewModel.navigateToDemandesAbsence}>Demande d&apos;absence</CentreAppelsCard>}{access.employes && <CentreAppelsCard notification="employes" icon={<IoPeople />} onClick={viewModel.navigateToEmployes}>Employés</CentreAppelsCard>}{access.postes && <CentreAppelsCard notification="postes" icon={<IoBriefcase />} onClick={viewModel.navigateToPostes}>Postes &amp; planning</CentreAppelsCard>}{access.materiel && <CentreAppelsCard notification="materiel" icon={<IoLaptopOutline />} onClick={viewModel.navigateToMateriel}>Matériel</CentreAppelsCard>}</div></div></main><BackToTop /></div>;
}
