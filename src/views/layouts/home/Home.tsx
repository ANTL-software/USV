// styles
import "./home.scss";

// assets
import mailBackground from "../../../assets/background/mailSectionBckground.webp";
import calendarBackground from "../../../assets/background/calendar.webp";
import callCenterBackground from "../../../assets/background/utilsSection.webp";

// hooks | library
import { ReactElement } from "react";
import WithAuth from "../../../utils/middleware/WithAuth";
import { Link } from "react-router-dom";

// component
import Header from "../../components/header/Header";
import SubNav from "../../components/subNav/SubNav";
import BackToTop from "../../components/backToTop/BackToTop";

function Home(): ReactElement {
  return (
    <div id="home" className="homeContainer">
      <Header />
      <SubNav />
      <main>
        <div className={"mainWrapper"}>
          <section className={"utilsSection"}>
            <Link to={"/mail"}>
              <figure>
                <img src={mailBackground} alt={"Bureau de travail"} />
              </figure>
              <h2>Gestion des courriers</h2>
            </Link>
          </section>
          <section className={"bookingSection"}>
            <Link to={"/booking"}>
              <figure>
                <img src={calendarBackground} alt={"Salle de production"} />
              </figure>
              <h2>Booking salle de production</h2>
            </Link>
          </section>
          <section className={"callCenterSection"}>
            <Link to={"/operations"}>
              <figure>
                <img src={callCenterBackground} alt={"Gestion opérationnelle"} />
              </figure>
              <h2>Gestion opérationnelle</h2>
            </Link>
          </section>
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const HomeWithAuth = WithAuth(Home);
export default HomeWithAuth;
