// styles
import './qualite.scss';

// hooks | library
import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoWarning, IoEarOutline, IoBarChartOutline } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';

// components
import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

function Qualite(): ReactElement {
  const navigate = useNavigate();

  return (
    <div id="qualite">
      <Header />
      <SubNav />
      <main>
        <div className="qualite__back">
          <Button style="back" onClick={() => navigate('/operations')}>
            <MdArrowBack />
            <span>Retour</span>
          </Button>
        </div>
        <div className="qualite__wrapper">
          <div className="qualite__row">
            <section className="qualite__card" onClick={() => navigate('/operations/qualite/signalements')}>
              <div className="qualite__card-icon">
                <IoWarning />
              </div>
              <h2>Signalements</h2>
              <p>Contrôle humain des prospects signalés en doublon ou opt-out.</p>
            </section>

            <section className="qualite__card qualite__card--disabled" onClick={() => null}>
              <div className="qualite__card-icon">
                <IoEarOutline />
              </div>
              <h2>Écoutes</h2>
              <p>Écouter et évaluer les appels des agents pour le contrôle qualité.</p>
            </section>

            <section className="qualite__card" onClick={() => navigate('/operations/qualite/statistiques')}>
              <div className="qualite__card-icon">
                <IoBarChartOutline />
              </div>
              <h2>Statistiques</h2>
              <p>Consulter les statistiques et indicateurs de performance qualité.</p>
            </section>
          </div>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const QualiteWithAuth = WithAuth(Qualite);
export default QualiteWithAuth;
