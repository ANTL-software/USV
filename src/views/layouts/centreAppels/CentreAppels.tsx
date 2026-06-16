// styles
import './centreAppels.scss';

// hooks | library
import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoPeople, IoCallOutline, IoBriefcase, IoPricetag, IoLaptopOutline, IoEyeOutline, IoReceipt, IoPersonCircleOutline, IoCheckmarkCircleOutline, IoCalendarClear } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';
import { useUserContext } from '../../../hooks/useUserContext.ts';
import { hasAccessToSubsection } from '../../../utils/scripts/permissions.ts';

// components
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';
import NotificationBadge from '../../../components/notificationBadge/NotificationBadge';

function CentreAppels(): ReactElement {
  const navigate = useNavigate();
  const { user } = useUserContext();

  return (
    <div id="centreAppels">
      <Header />
      <SubNav />
      <main>
        <div className="centreAppels__back">
          <Button style="back" onClick={() => navigate('/home')}>
            <MdArrowBack />
            <span>Retour</span>
          </Button>
        </div>
        <div className="centreAppels__wrapper">
          <div className="centreAppels__row">
            {hasAccessToSubsection(user, 'operations', 'supervision') && (
              <section className="centreAppels__card" onClick={() => navigate('/supervision')} style={{ position: 'relative' }}>
                <NotificationBadge sectionId="operations" subsectionId="supervision" />
                <div className="centreAppels__card-icon">
                  <IoEyeOutline />
                </div>
                <h2>Supervision</h2>
              </section>
            )}

            {hasAccessToSubsection(user, 'operations', 'commandes') && (
              <section className="centreAppels__card" onClick={() => navigate('/operations/commandes')} style={{ position: 'relative' }}>
                <NotificationBadge sectionId="operations" subsectionId="commandes" />
                <div className="centreAppels__card-icon">
                  <IoReceipt />
                </div>
                <h2>Commandes</h2>
              </section>
            )}

            {hasAccessToSubsection(user, 'operations', 'campagnes') && (
              <section className="centreAppels__card" onClick={() => navigate('/campagnes')} style={{ position: 'relative' }}>
                <NotificationBadge sectionId="operations" subsectionId="campagnes" />
                <div className="centreAppels__card-icon">
                  <IoCallOutline />
                </div>
                <h2>Campagnes</h2>
              </section>
            )}

            {hasAccessToSubsection(user, 'operations', 'prospects') && (
              <section className="centreAppels__card" onClick={() => navigate('/operations/prospects')} style={{ position: 'relative' }}>
                <NotificationBadge sectionId="operations" subsectionId="prospects" />
                <div className="centreAppels__card-icon">
                  <IoPersonCircleOutline />
                </div>
                <h2>Prospects</h2>
              </section>
            )}
          </div>

          <div className="centreAppels__row">
            {hasAccessToSubsection(user, 'operations', 'produits') && (
              <section className="centreAppels__card" onClick={() => navigate('/produits')} style={{ position: 'relative' }}>
                <NotificationBadge sectionId="operations" subsectionId="produits" />
                <div className="centreAppels__card-icon">
                  <IoPricetag />
                </div>
                <h2>Produits</h2>
              </section>
            )}

            {hasAccessToSubsection(user, 'operations', 'qualite') && (
              <section className="centreAppels__card" onClick={() => navigate('/operations/qualite')} style={{ position: 'relative' }}>
                <NotificationBadge sectionId="operations" subsectionId="qualite" />
                <div className="centreAppels__card-icon">
                  <IoCheckmarkCircleOutline />
                </div>
                <h2>Qualité</h2>
              </section>
            )}

            {hasAccessToSubsection(user, 'operations', 'demandes-absence') && (
              <section className="centreAppels__card" onClick={() => navigate('/operations/demandes-absence')} style={{ position: 'relative' }}>
                <NotificationBadge sectionId="operations" subsectionId="demandes-absence" />
                <div className="centreAppels__card-icon">
                  <IoCalendarClear />
                </div>
                <h2>Demande d&apos;absence</h2>
              </section>
            )}

            {hasAccessToSubsection(user, 'operations', 'employes') && (
              <section className="centreAppels__card" onClick={() => navigate('/operations/employes')} style={{ position: 'relative' }}>
                <NotificationBadge sectionId="operations" subsectionId="employes" />
                <div className="centreAppels__card-icon">
                  <IoPeople />
                </div>
                <h2>Employés</h2>
              </section>
            )}

            {hasAccessToSubsection(user, 'operations', 'postes') && (
              <section className="centreAppels__card" onClick={() => navigate('/operations/postes')} style={{ position: 'relative' }}>
                <NotificationBadge sectionId="operations" subsectionId="postes" />
                <div className="centreAppels__card-icon">
                  <IoBriefcase />
                </div>
                <h2>Postes & planning</h2>
              </section>
            )}

            {hasAccessToSubsection(user, 'operations', 'materiel') && (
              <section className="centreAppels__card" onClick={() => navigate('/operations/materiel')} style={{ position: 'relative' }}>
                <NotificationBadge sectionId="operations" subsectionId="materiel" />
                <div className="centreAppels__card-icon">
                  <IoLaptopOutline />
                </div>
                <h2>Matériel</h2>
              </section>
            )}
          </div>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const CentreAppelsWithAuth = WithAuth(CentreAppels);
export default CentreAppelsWithAuth;
