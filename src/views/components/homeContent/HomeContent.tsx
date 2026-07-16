// assets
import mailBackground from "../../../assets/background/mailSectionBckground.webp";
import calendarBackground from "../../../assets/background/calendar.webp";
import callCenterBackground from "../../../assets/background/utilsSection.webp";
import projetsBackground from "../../../assets/background/projetSection.webp";
import commercialBackground from "../../../assets/background/commercialBackground.jpeg";
import commerciauxBackground from "../../../assets/background/gestionCommerciaux.webp";
import incidentsBackground from "../../../assets/background/gestionIncidents.webp";

// hooks | library
import type { MouseEvent, ReactElement } from "react";
import type { HomePageViewModel } from "../../../hooks/index.ts";

// component
import { BackToTop, Header, NotificationBadge, SubNav } from "../index.ts";

interface HomeContentProps { viewModel: HomePageViewModel; }

export function HomeContent({ viewModel }: HomeContentProps): ReactElement {
  const { access } = viewModel;
  const navigate = (event: MouseEvent<HTMLAnchorElement>, path: string): void => { event.preventDefault(); viewModel.navigateTo(path); };

  return (
    <div id="home" className="homeContainer">
      <Header />
      <SubNav />
      <main>
        <div className={"mainWrapper"}>
          {access.mail && (
            <section className={"utilsSection"}>
              <a href="/mail" onClick={(event) => navigate(event, '/mail')} style={{ position: 'relative' }}>
                <NotificationBadge sectionId="mail" />
                <figure>
                  <img src={mailBackground} alt={"Bureau de travail"} />
                </figure>
                <h2>Gestion des courriers</h2>
              </a>
            </section>
          )}
          {access.booking && (
            <section className={"bookingSection"}>
              <a href="/booking" onClick={(event) => navigate(event, '/booking')} style={{ position: 'relative' }}>
                <NotificationBadge sectionId="booking" />
                <figure>
                  <img src={calendarBackground} alt={"Salle de production"} />
                </figure>
                <h2>Agenda</h2>
              </a>
            </section>
          )}
          {access.operations && (
            <section className={"callCenterSection"}>
              <a href="/operations" onClick={(event) => navigate(event, '/operations')} style={{ position: 'relative' }}>
                <NotificationBadge sectionId="operations" />
                <figure>
                  <img src={callCenterBackground} alt={"Gestion opérationnelle"} />
                </figure>
                <h2>Gestion opérationnelle</h2>
              </a>
            </section>
          )}
          {access.commercial && (
            <section className={"commercialSection"}>
              <a href="/commercial" onClick={(event) => navigate(event, '/commercial')} style={{ position: 'relative' }}>
                <figure>
                  <img src={commercialBackground} alt={"Gestion commerciale"} />
                </figure>
                <h2>Commercial</h2>
              </a>
            </section>
          )}
          {access.incidents && (
            <section className={"incidentsSection"}>
              <a href="/incidents" onClick={(event) => navigate(event, '/incidents')} style={{ position: 'relative' }}>
                <NotificationBadge sectionId="incidents" />
                <figure>
                  <img src={incidentsBackground} alt={"Gestion des incidents"} />
                </figure>
                <h2>Gestion des incidents</h2>
              </a>
            </section>
          )}
          {access.commerciaux && (
            <section className={"commerciauxSection"}>
              <a href="/commerciaux" onClick={(event) => navigate(event, '/commerciaux')} style={{ position: 'relative' }}>
                <NotificationBadge sectionId="commerciaux" />
                <figure>
                  <img src={commerciauxBackground} alt={"Gestion commerciaux"} />
                </figure>
                <h2>Gestion commerciaux</h2>
              </a>
            </section>
          )}
          {access.projets && (
            <section className={"projetsSection"}>
              <a href="/projets" onClick={(event) => navigate(event, '/projets')} style={{ position: 'relative' }}>
                <NotificationBadge sectionId="projets" />
                <figure>
                  <img src={projetsBackground} alt={"Gestion de projets"} />
                </figure>
                <h2>Gestion de projets</h2>
              </a>
            </section>
          )}
        </div>
      </main>
      <BackToTop />
    </div>
  );
}
