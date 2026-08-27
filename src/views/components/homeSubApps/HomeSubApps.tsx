import type { MouseEvent, ReactElement } from 'react';
import {
  IoBookOutline,
  IoBriefcaseOutline,
  IoCalendarOutline,
  IoCallOutline,
  IoMailOutline,
  IoPeopleOutline,
  IoStorefrontOutline,
  IoWarningOutline,
} from 'react-icons/io5';
import calendarBackground from '../../../assets/background/calendar.webp';
import commercialBackground from '../../../assets/background/commercialBackground.jpeg';
import docBackground from '../../../assets/background/devSection.webp';
import commerciauxBackground from '../../../assets/background/gestionCommerciaux.webp';
import incidentsBackground from '../../../assets/background/gestionIncidents.webp';
import mailBackground from '../../../assets/background/mailSectionBckground.webp';
import projetsBackground from '../../../assets/background/projetSection.webp';
import callCenterBackground from '../../../assets/background/utilsSection.webp';
import { NotificationBadge } from '../notificationBadge/index.ts';
import './homeSubApps.scss';

interface HomeSubAppsProps {
  access: {
    booking: boolean;
    commercial: boolean;
    commerciaux: boolean;
    incidents: boolean;
    mail: boolean;
    operations: boolean;
    projets: boolean;
    documentation: boolean;
  };
  onNavigate: (path: string) => void;
}

export function HomeSubApps({ access, onNavigate }: HomeSubAppsProps): ReactElement {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>, path: string, disabled = false): void => {
    event.preventDefault();
    if (!disabled) {
      onNavigate(path);
    }
  };

  return (
    <section id="homeSubApps" aria-label="Modules et sous-applications">
      <div className="homeSubApps__grid">
        {access.mail && (
          <a
            href="/mail"
            className="homeSubApps__card"
            onClick={(e) => handleClick(e, '/mail')}
          >
            <div
              className="homeSubApps__bg"
              style={{ backgroundImage: `url(${mailBackground})` }}
            />
            <div className="homeSubApps__overlay" />
            <div className="homeSubApps__content">
              <div className="homeSubApps__icon-wrapper">
                <IoMailOutline />
              </div>
              <div className="homeSubApps__info">
                <h3>
                  Gestion des courriers
                  <NotificationBadge sectionId="mail" />
                </h3>
                <p>Consulter, numériser et traiter les courriers entrants et sortants</p>
              </div>
            </div>
          </a>
        )}

        {access.booking && (
          <a
            href="/booking"
            className="homeSubApps__card"
            onClick={(e) => handleClick(e, '/booking')}
          >
            <div
              className="homeSubApps__bg"
              style={{ backgroundImage: `url(${calendarBackground})` }}
            />
            <div className="homeSubApps__overlay" />
            <div className="homeSubApps__content">
              <div className="homeSubApps__icon-wrapper">
                <IoCalendarOutline />
              </div>
              <div className="homeSubApps__info">
                <h3>
                  Agenda
                  <NotificationBadge sectionId="booking" />
                </h3>
                <p>Planifier les réunions d’équipe et les rendez-vous clients</p>
              </div>
            </div>
          </a>
        )}

        {access.operations && (
          <a
            href="/operations"
            className="homeSubApps__card"
            onClick={(e) => handleClick(e, '/operations')}
          >
            <div
              className="homeSubApps__bg"
              style={{ backgroundImage: `url(${callCenterBackground})` }}
            />
            <div className="homeSubApps__overlay" />
            <div className="homeSubApps__content">
              <div className="homeSubApps__icon-wrapper">
                <IoCallOutline />
              </div>
              <div className="homeSubApps__info">
                <h3>
                  Gestion opérationnelle
                  <NotificationBadge sectionId="operations" />
                </h3>
                <p>Superviser les appels, campagnes, prospects et le matériel</p>
              </div>
            </div>
          </a>
        )}

        {access.commercial && (
          <a
            href="/commercial"
            className="homeSubApps__card"
            onClick={(e) => handleClick(e, '/commercial')}
          >
            <div
              className="homeSubApps__bg"
              style={{ backgroundImage: `url(${commercialBackground})` }}
            />
            <div className="homeSubApps__overlay" />
            <div className="homeSubApps__content">
              <div className="homeSubApps__icon-wrapper">
                <IoStorefrontOutline />
              </div>
              <div className="homeSubApps__info">
                <h3>Commercial</h3>
                <p>Gérer la facturation, les devis et la communication commerciale</p>
              </div>
            </div>
          </a>
        )}

        {access.incidents && (
          <a
            href="/incidents"
            className="homeSubApps__card"
            onClick={(e) => handleClick(e, '/incidents')}
          >
            <div
              className="homeSubApps__bg"
              style={{ backgroundImage: `url(${incidentsBackground})` }}
            />
            <div className="homeSubApps__overlay" />
            <div className="homeSubApps__content">
              <div className="homeSubApps__icon-wrapper">
                <IoWarningOutline />
              </div>
              <div className="homeSubApps__info">
                <h3>
                  Gestion des incidents
                  <NotificationBadge sectionId="incidents" />
                </h3>
                <p>Déclarer, qualifier et suivre la résolution des incidents</p>
              </div>
            </div>
          </a>
        )}

        {access.commerciaux && (
          <a
            href="/commerciaux"
            className="homeSubApps__card"
            onClick={(e) => handleClick(e, '/commerciaux')}
          >
            <div
              className="homeSubApps__bg"
              style={{ backgroundImage: `url(${commerciauxBackground})` }}
            />
            <div className="homeSubApps__overlay" />
            <div className="homeSubApps__content">
              <div className="homeSubApps__icon-wrapper">
                <IoPeopleOutline />
              </div>
              <div className="homeSubApps__info">
                <h3>
                  Gestion commerciaux
                  <NotificationBadge sectionId="commerciaux" />
                </h3>
                <p>Consulter les notes de direction et les plannings individuels</p>
              </div>
            </div>
          </a>
        )}

        {access.projets && (
          <a
            href="/projets"
            className="homeSubApps__card"
            onClick={(e) => handleClick(e, '/projets')}
          >
            <div
              className="homeSubApps__bg"
              style={{ backgroundImage: `url(${projetsBackground})` }}
            />
            <div className="homeSubApps__overlay" />
            <div className="homeSubApps__content">
              <div className="homeSubApps__icon-wrapper">
                <IoBriefcaseOutline />
              </div>
              <div className="homeSubApps__info">
                <h3>
                  Gestion de projets
                  <NotificationBadge sectionId="projets" />
                </h3>
                <p>Piloter l’avancement, les tâches et les jalons d’équipe</p>
              </div>
            </div>
          </a>
        )}

        {access.documentation && <a
          href="/documentation"
          className="homeSubApps__card"
          onClick={(e) => handleClick(e, '/documentation')}
        >
          <div
            className="homeSubApps__bg"
            style={{ backgroundImage: `url(${docBackground})` }}
          />
          <div className="homeSubApps__overlay" />
          <div className="homeSubApps__content">
            <div className="homeSubApps__icon-wrapper">
              <IoBookOutline />
            </div>
            <div className="homeSubApps__info">
              <h3>Documentation</h3>
              <p>Guides d’utilisation, procédures métier et base de connaissances</p>
            </div>
          </div>
        </a>}
      </div>
    </section>
  );
}
