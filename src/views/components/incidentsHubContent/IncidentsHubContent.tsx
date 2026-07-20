import type { ReactElement, ReactNode } from 'react';
import { IoAlertCircleOutline, IoBuildOutline, IoClipboardOutline, IoCreateOutline, IoListOutline } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import type { IncidentsHubPageViewModel } from '../../../hooks/index.ts';
import { BackToTop, Button, Header, NotificationBadge, SubNav } from '../index.ts';

interface IncidentsHubContentProps { viewModel: IncidentsHubPageViewModel; }
interface IncidentHubCardProps { children: ReactNode; description: string; icon: ReactNode; notification: string; onClick: () => void; }

function IncidentHubCard({ children, description, icon, notification, onClick }: IncidentHubCardProps): ReactElement {
  return <section className="incidents__card" onClick={onClick} style={{ position: 'relative' }}><NotificationBadge sectionId="incidents" subsectionId={notification} /><div className="incidents__card-icon">{icon}</div><h2>{children}</h2><p>{description}</p></section>;
}

export function IncidentsHubContent({ viewModel }: IncidentsHubContentProps): ReactElement {
  const { access } = viewModel;
  return <div id="incidentsHub"><Header /><SubNav /><main><div className="incidents__back"><Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /><span>Retour</span></Button></div><div className="incidents__hero"><div><h1><IoAlertCircleOutline /> Gestion des incidents</h1><p>Déclaration, qualification, traitement et historique des incidents.</p></div></div><div className="incidents__cards">{access.declarer && <IncidentHubCard description="Créer une fiche incident avec contexte, impact et priorité initiale." icon={<IoCreateOutline />} notification="declarer" onClick={viewModel.navigateToDeclaration}>Déclarer un incident</IncidentHubCard>}{access.qualifier && <IncidentHubCard description="Définir secteur, criticité, classification et intervenant responsable." icon={<IoClipboardOutline />} notification="qualifier" onClick={viewModel.navigateToQualification}>Qualifier</IncidentHubCard>}{access.traiter && <IncidentHubCard description="Suivre les actions, commenter, mettre en attente, résoudre ou annuler." icon={<IoBuildOutline />} notification="traiter" onClick={viewModel.navigateToTraitement}>Traitement</IncidentHubCard>}{access.liste && <IncidentHubCard description="Retrouver un incident par statut, secteur, intervenant ou recherche globale." icon={<IoListOutline />} notification="liste" onClick={viewModel.navigateToListe}>Liste des incidents</IncidentHubCard>}</div></main><BackToTop /></div>;
}
