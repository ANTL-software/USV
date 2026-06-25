import './incidents.scss';

import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IoAlertCircleOutline,
  IoBuildOutline,
  IoClipboardOutline,
  IoCreateOutline,
  IoListOutline,
} from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';
import { useUserContext } from '../../../hooks/useUserContext';
import { hasAccessToSubsection } from '../../../utils/scripts/permissions';

import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import NotificationBadge from '../../../components/notificationBadge/NotificationBadge';

function IncidentsHub(): ReactElement {
  const navigate = useNavigate();
  const { user } = useUserContext();

  return (
    <div id="incidentsHub">
      <Header />
      <SubNav />
      <main>
        <div className="incidents__back">
          <Button style="back" onClick={() => navigate('/home')}>
            <MdArrowBack />
            <span>Retour</span>
          </Button>
        </div>

        <div className="incidents__hero">
          <div>
            <h1><IoAlertCircleOutline /> Gestion des incidents</h1>
            <p>Déclaration, qualification, traitement et historique des incidents.</p>
          </div>
        </div>

        <div className="incidents__cards">
          {hasAccessToSubsection(user, 'incidents', 'declarer') && (
            <section className="incidents__card" onClick={() => navigate('/incidents/declarer')} style={{ position: 'relative' }}>
              <NotificationBadge sectionId="incidents" subsectionId="declarer" />
              <div className="incidents__card-icon"><IoCreateOutline /></div>
              <h2>Déclarer un incident</h2>
              <p>Créer une fiche incident avec contexte, impact et priorité initiale.</p>
            </section>
          )}

          {hasAccessToSubsection(user, 'incidents', 'qualifier') && (
            <section className="incidents__card" onClick={() => navigate('/incidents/qualification')} style={{ position: 'relative' }}>
              <NotificationBadge sectionId="incidents" subsectionId="qualifier" />
              <div className="incidents__card-icon"><IoClipboardOutline /></div>
              <h2>Qualifier</h2>
              <p>Définir secteur, criticité, classification et intervenant responsable.</p>
            </section>
          )}

          {hasAccessToSubsection(user, 'incidents', 'traiter') && (
            <section className="incidents__card" onClick={() => navigate('/incidents/traitement')} style={{ position: 'relative' }}>
              <NotificationBadge sectionId="incidents" subsectionId="traiter" />
              <div className="incidents__card-icon"><IoBuildOutline /></div>
              <h2>Traitement</h2>
              <p>Suivre les actions, commenter, mettre en attente, résoudre ou annuler.</p>
            </section>
          )}

          {hasAccessToSubsection(user, 'incidents', 'liste') && (
            <section className="incidents__card" onClick={() => navigate('/incidents/liste')} style={{ position: 'relative' }}>
              <NotificationBadge sectionId="incidents" subsectionId="liste" />
              <div className="incidents__card-icon"><IoListOutline /></div>
              <h2>Liste des incidents</h2>
              <p>Retrouver un incident par statut, secteur, intervenant ou recherche globale.</p>
            </section>
          )}
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const IncidentsHubWithAuth = WithAuth(IncidentsHub);
export default IncidentsHubWithAuth;
