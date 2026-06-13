import './commerciaux.scss';

import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoCalendarOutline, IoMegaphoneOutline } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';

import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

function Commerciaux(): ReactElement {
  const navigate = useNavigate();

  return (
    <div id="commerciaux">
      <Header />
      <SubNav />
      <main>
        <div className="commerciaux__back">
          <Button style="back" onClick={() => navigate('/home')}>
            <MdArrowBack />
            <span>Retour</span>
          </Button>
        </div>

        <div className="commerciaux__wrapper">
          <h1 className="commerciaux__title">Gestion commerciaux</h1>

          <div className="commerciaux__row">
            <section className="commerciaux__card" onClick={() => navigate('/commerciaux/notes-direction')}>
              <div className="commerciaux__card-icon">
                <IoMegaphoneOutline />
              </div>
              <h2>Notes de la direction</h2>
              <p>Retrouver les communications, consignes et messages importants transmis par la direction.</p>
            </section>

            <section className="commerciaux__card" onClick={() => navigate('/commerciaux/mon_planning')}>
              <div className="commerciaux__card-icon">
                <IoCalendarOutline />
              </div>
              <h2>Voir mon planning</h2>
              <p>Consulter votre planning, vos prochaines disponibilités et vos temps forts à venir.</p>
            </section>
          </div>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const CommerciauxWithAuth = WithAuth(Commerciaux);
export default CommerciauxWithAuth;
