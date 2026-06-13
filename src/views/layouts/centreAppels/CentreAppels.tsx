// styles
import './centreAppels.scss';

// hooks | library
import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoPeople, IoCallOutline, IoBriefcase, IoPricetag, IoLaptopOutline, IoEyeOutline, IoReceipt, IoPersonCircleOutline, IoCheckmarkCircleOutline, IoCalendarClear } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';

// components
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

function CentreAppels(): ReactElement {
  const navigate = useNavigate();

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
            <section className="centreAppels__card" onClick={() => navigate('/supervision')}>
              <div className="centreAppels__card-icon">
                <IoEyeOutline />
              </div>
              <h2>Supervision</h2>
            </section>

            <section className="centreAppels__card" onClick={() => navigate('/operations/commandes')}>
              <div className="centreAppels__card-icon">
                <IoReceipt />
              </div>
              <h2>Commandes</h2>
            </section>

            <section className="centreAppels__card" onClick={() => navigate('/campagnes')}>
              <div className="centreAppels__card-icon">
                <IoCallOutline />
              </div>
              <h2>Campagnes</h2>
            </section>

            <section className="centreAppels__card" onClick={() => navigate('/operations/prospects')}>
              <div className="centreAppels__card-icon">
                <IoPersonCircleOutline />
              </div>
              <h2>Prospects</h2>
            </section>
          </div>

          <div className="centreAppels__row">
            <section className="centreAppels__card" onClick={() => navigate('/produits')}>
              <div className="centreAppels__card-icon">
                <IoPricetag />
              </div>
              <h2>Produits</h2>
            </section>

            <section className="centreAppels__card" onClick={() => navigate('/operations/qualite')}>
              <div className="centreAppels__card-icon">
                <IoCheckmarkCircleOutline />
              </div>
              <h2>Qualité</h2>
            </section>

            <section className="centreAppels__card" onClick={() => navigate('/operations/demandes-absence')}>
              <div className="centreAppels__card-icon">
                <IoCalendarClear />
              </div>
              <h2>Demande d&apos;absence</h2>
            </section>

            <section className="centreAppels__card" onClick={() => navigate('/operations/employes')}>
              <div className="centreAppels__card-icon">
                <IoPeople />
              </div>
              <h2>Employés</h2>
            </section>

            <section className="centreAppels__card" onClick={() => navigate('/operations/postes')}>
              <div className="centreAppels__card-icon">
                <IoBriefcase />
              </div>
              <h2>Postes & planning</h2>
            </section>

            <section className="centreAppels__card" onClick={() => navigate('/operations/materiel')}>
              <div className="centreAppels__card-icon">
                <IoLaptopOutline />
              </div>
              <h2>Matériel</h2>
            </section>
          </div>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const CentreAppelsWithAuth = WithAuth(CentreAppels);
export default CentreAppelsWithAuth;
