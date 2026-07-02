import "../centreAppels/centreAppels.scss";

import { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { IoDocumentTextOutline, IoReceiptOutline } from "react-icons/io5";
import { MdArrowBack } from "react-icons/md";
import WithAuth from "../../../utils/middleware/WithAuth";

import Header from "../../components/header/Header";
import SubNav from "../../components/subNav/SubNav";
import BackToTop from "../../components/backToTop/BackToTop";
import Button from "../../components/button/Button";

function Commercial(): ReactElement {
  const navigate = useNavigate();

  return (
    <div id="centreAppels">
      <Header />
      <SubNav />
      <main>
        <div className="centreAppels__back">
          <Button style="back" onClick={() => navigate("/home")}>
            <MdArrowBack />
            <span>Retour</span>
          </Button>
        </div>
        <div className="centreAppels__wrapper">
          <div className="centreAppels__row">
            <section className="centreAppels__card" onClick={() => navigate("/commercial/facturation")}>
              <div className="centreAppels__card-icon">
                <IoReceiptOutline />
              </div>
              <h2>Facturation</h2>
            </section>
            <section className="centreAppels__card" onClick={() => navigate("/commercial/devis")}>
              <div className="centreAppels__card-icon">
                <IoDocumentTextOutline />
              </div>
              <h2>Devis</h2>
            </section>
          </div>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const CommercialWithAuth = WithAuth(Commercial);
export default CommercialWithAuth;
