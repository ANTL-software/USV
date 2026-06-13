// styles
import "./subNav.scss";

// hooks | libraries
import { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { IoHome, IoMail, IoCalendar, IoCallOutline, IoFolder, IoPeopleCircle } from "react-icons/io5";
import { useUserContext } from "../../../hooks/useUserContext.ts";
import { hasAccessToSection, getAllowedSections } from "../../../utils/scripts/permissions.ts";

interface ISection {
  id: string;
  name: string;
  path: string;
  aliases?: string[];
  icon: ReactElement;
}

export default function SubNav(): ReactElement | null {
  const navigate = useNavigate();
  const { user } = useUserContext();

  const sections: ISection[] = [
    {
      id: "1",
      name: "Accueil",
      path: "/home",
      icon: <IoHome />,
    },
    {
      id: "2",
      name: "Courriers",
      path: "/mail",
      icon: <IoMail />,
    },
    {
      id: "3",
      name: "Booking",
      path: "/booking",
      icon: <IoCalendar />,
    },
    {
      id: "4",
      name: "Gestion opérationnelle",
      path: "/operations",
      aliases: ["/campagnes", "/prospects", "/produits"],
      icon: <IoCallOutline />,
    },
    {
      id: "5",
      name: "Gestion commerciaux",
      path: "/commerciaux",
      icon: <IoPeopleCircle />,
    },
    {
      id: "6",
      name: "Gestion de projets",
      path: "/projets",
      icon: <IoFolder />,
    },
  ];

  const allowedSections = sections.filter((app: ISection) => {
    if (app.id === "1") return getAllowedSections(user).length > 1;
    if (app.id === "2") return hasAccessToSection(user, 'mail');
    if (app.id === "3") return hasAccessToSection(user, 'booking');
    if (app.id === "4") return hasAccessToSection(user, 'operations');
    if (app.id === "5") return hasAccessToSection(user, 'commerciaux');
    if (app.id === "6") return hasAccessToSection(user, 'projets');
    return false;
  });

  const getCurrentSection = (): ISection | undefined => {
    return sections.find((app) =>
      window.location.pathname.startsWith(app.path) ||
      app.aliases?.some(alias => window.location.pathname.startsWith(alias))
    );
  };

  const currentApp = getCurrentSection();

  const handleAppChange = (app: ISection) => {
    navigate(app.path);
  };

  if (allowedSections.length <= 1 && allowedSections.every(s => s.id !== "1")) {
    return null; // Pas de barre de navigation si seulement 1 app et pas d'accueil
  }

  return (
    <div id="subNav" className={`subNav`}>
      <div className="subNavContainer">
        {allowedSections.map((app: ISection) => (
          <button
            key={app.id}
            className={`subNavItem ${
              app?.id === currentApp?.id ? "active" : ""
            }`}
            onClick={() => handleAppChange(app)}
          >
            <span className="subNavIcon">{app.icon}</span>
            <span className="subNavText">{app.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
