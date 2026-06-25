// styles
import "./home.scss";

// assets
import mailBackground from "../../../assets/background/mailSectionBckground.webp";
import calendarBackground from "../../../assets/background/calendar.webp";
import callCenterBackground from "../../../assets/background/utilsSection.webp";
import projetsBackground from "../../../assets/background/projetSection.webp";
import commerciauxBackground from "../../../assets/background/gestionCommerciaux.webp";
import incidentsBackground from "../../../assets/background/gestionIncidents.webp";

// hooks | library
import { ReactElement } from "react";
import WithAuth from "../../../utils/middleware/WithAuth";
import { Link } from "react-router-dom";
import { useUserContext } from "../../../hooks/useUserContext.ts";
import { hasAccessToSection } from "../../../utils/scripts/permissions.ts";

// component
import Header from "../../components/header/Header";
import SubNav from "../../components/subNav/SubNav";
import BackToTop from "../../components/backToTop/BackToTop";
import NotificationBadge from "../../../components/notificationBadge/NotificationBadge";

function Home(): ReactElement {
  const { user } = useUserContext();

  return (
    <div id="home" className="homeContainer">
      <Header />
      <SubNav />
      <main>
        <div className={"mainWrapper"}>
          {hasAccessToSection(user, 'mail') && (
            <section className={"utilsSection"}>
              <Link to={"/mail"} style={{ position: 'relative' }}>
                <NotificationBadge sectionId="mail" />
                <figure>
                  <img src={mailBackground} alt={"Bureau de travail"} />
                </figure>
                <h2>Gestion des courriers</h2>
              </Link>
            </section>
          )}
          {hasAccessToSection(user, 'booking') && (
            <section className={"bookingSection"}>
              <Link to={"/booking"} style={{ position: 'relative' }}>
                <NotificationBadge sectionId="booking" />
                <figure>
                  <img src={calendarBackground} alt={"Salle de production"} />
                </figure>
                <h2>Agenda</h2>
              </Link>
            </section>
          )}
          {hasAccessToSection(user, 'operations') && (
            <section className={"callCenterSection"}>
              <Link to={"/operations"} style={{ position: 'relative' }}>
                <NotificationBadge sectionId="operations" />
                <figure>
                  <img src={callCenterBackground} alt={"Gestion opérationnelle"} />
                </figure>
                <h2>Gestion opérationnelle</h2>
              </Link>
            </section>
          )}
          {hasAccessToSection(user, 'incidents') && (
            <section className={"incidentsSection"}>
              <Link to={"/incidents"} style={{ position: 'relative' }}>
                <NotificationBadge sectionId="incidents" />
                <figure>
                  <img src={incidentsBackground} alt={"Gestion des incidents"} />
                </figure>
                <h2>Gestion des incidents</h2>
              </Link>
            </section>
          )}
          {hasAccessToSection(user, 'commerciaux') && (
            <section className={"commerciauxSection"}>
              <Link to={"/commerciaux"} style={{ position: 'relative' }}>
                <NotificationBadge sectionId="commerciaux" />
                <figure>
                  <img src={commerciauxBackground} alt={"Gestion commerciaux"} />
                </figure>
                <h2>Gestion commerciaux</h2>
              </Link>
            </section>
          )}
          {hasAccessToSection(user, 'projets') && (
            <section className={"projetsSection"}>
              <Link to={"/projets"} style={{ position: 'relative' }}>
                <NotificationBadge sectionId="projets" />
                <figure>
                  <img src={projetsBackground} alt={"Gestion de projets"} />
                </figure>
                <h2>Gestion de projets</h2>
              </Link>
            </section>
          )}
        </div>
      </main>
      <BackToTop />
    </div>
  );
}

const HomeWithAuth = WithAuth(Home);
export default HomeWithAuth;
