// styles
import "./subNav.scss";

// hooks | libraries
import { ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { IoHome, IoMail, IoCalendar } from "react-icons/io5";

interface ISection {
  id: string;
  name: string;
  path: string;
  icon: ReactElement;
}

export default function SubNav(): ReactElement | null {
  const navigate = useNavigate();

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
  ];

  const getCurrentSection = (): ISection | undefined => {
    return sections.find((app) =>
      window.location.pathname.startsWith(app.path)
    );
  };

  const currentApp = getCurrentSection();

  const handleAppChange = (app: ISection) => {
    navigate(app.path);
  };

  return (
    <div id="subNav" className={`subNav`}>
      <div className="subNavContainer">
        {sections.map((app: ISection) => (
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
