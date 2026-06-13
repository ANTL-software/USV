import './commerciaux.scss';

import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMegaphoneOutline } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import WithAuth from '../../../utils/middleware/WithAuth';

import Header from '../../components/header/Header';
import SubNav from '../../components/subNav/SubNav';
import BackToTop from '../../components/backToTop/BackToTop';
import Button from '../../components/button/Button';

function NotesDirection(): ReactElement {
  const navigate = useNavigate();

  return (
    <div id="commerciauxPlaceholder">
      <Header />
      <SubNav />
      <main>
        <div className="commerciauxPlaceholder__back">
          <Button style="back" onClick={() => navigate('/commerciaux')}>
            <MdArrowBack />
            <span>Retour</span>
          </Button>
        </div>

        <div className="commerciauxPlaceholder__wrapper">
          <h1 className="commerciauxPlaceholder__title">Notes de la direction</h1>

          <section className="commerciauxPlaceholder__card">
            <div className="commerciauxPlaceholder__card-icon">
              <IoMegaphoneOutline />
            </div>
            <h2>Section en préparation</h2>
            <p>Le socle de la sous-application est prêt. Cette vue servira bientôt à consulter les notes et annonces de la direction.</p>
          </section>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const NotesDirectionWithAuth = WithAuth(NotesDirection);
export default NotesDirectionWithAuth;
