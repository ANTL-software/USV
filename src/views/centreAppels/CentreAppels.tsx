// styles
import './centreAppels.scss';

// hooks | library
import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoPeople, IoCallOutline, IoBriefcase } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import WithAuth from '../../utils/middleware/WithAuth';

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
          <section className="centreAppels__card" onClick={() => navigate('/operations/employes')}>
            <div className="centreAppels__card-icon">
              <IoPeople />
            </div>
            <h2>Gestion des employés</h2>
            <p>Créer, modifier et configurer les employés de antl.</p>
          </section>

          <section className="centreAppels__card" onClick={() => navigate('/operations/postes')}>
            <div className="centreAppels__card-icon">
              <IoBriefcase />
            </div>
            <h2>Postes</h2>
            <p>Gérer les intitulés de postes, catégories et niveaux hiérarchiques.</p>
          </section>

          <section className="centreAppels__card" onClick={() => navigate('/campagnes')}>
            <div className="centreAppels__card-icon">
              <IoCallOutline />
            </div>
            <h2>Campagnes</h2>
            <p>Créer et gérer les campagnes commerciales, affecter et déplacer les agents.</p>
          </section>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const CentreAppelsWithAuth = WithAuth(CentreAppels);
export default CentreAppelsWithAuth;
