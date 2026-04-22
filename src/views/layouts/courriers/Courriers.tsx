// styles
import "./courriers.scss";

// hooks | libraries
import { ReactElement, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MdAdd, MdList, MdPhotoCamera } from "react-icons/md";
import { IoMail, IoMailOpen } from "react-icons/io5";
import { FiCalendar, FiFileText } from "react-icons/fi";

// components
import WithAuth from "../../../utils/middleware/WithAuth";
import Header from "../../components/header/Header";
import SubNav from "../../components/subNav/SubNav";

// context
import { CourrierContext } from "../../../context/courrierContext/CourrierContext";

function Courriers(): ReactElement {
  const navigate = useNavigate();
  const { stats, getCourrierStats } = useContext(CourrierContext);
  const [activeAction, setActiveAction] = useState<string>("");
  const [statsLoading, setStatsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Charger les statistiques au montage du composant
    const loadStats = async () => {
      try {
        await getCourrierStats();
      } catch (error) {
        console.error('Error loading courrier stats:', error);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, [getCourrierStats]);

  const actions = [
    {
      id: '1',
      label: 'Nouveau courrier',
      icon: <MdAdd />,
      primary: true
    },
    {
      id: '2',
      label: 'Liste des courriers',
      icon: <MdList />,
      primary: false
    },
    {
      id: '3',
      label: 'Photo → PDF',
      icon: <MdPhotoCamera />,
      primary: false
    }
  ];

  const statsDisplay = [
    {
      id: 'total',
      label: 'Total courriers',
      value: statsLoading ? '...' : (stats?.total?.toString() || '0'),
      icon: <FiFileText />,
      color: 'primary'
    },
    {
      id: 'incoming',
      label: 'Entrants',
      value: statsLoading ? '...' : (stats?.entrants?.toString() || '0'),
      icon: <IoMail />,
      color: 'info'
    },
    {
      id: 'outgoing',
      label: 'Sortants',
      value: statsLoading ? '...' : (stats?.sortants?.toString() || '0'),
      icon: <IoMailOpen />,
      color: 'success'
    },
    {
      id: 'monthly',
      label: 'Ce mois',
      value: statsLoading ? '...' : (stats?.thisMonth?.toString() || '0'),
      icon: <FiCalendar />,
      color: 'warning'
    }
  ];

  const handleActionClick = (event: React.MouseEvent, actionId: string) => {
    event.preventDefault();
    event.stopPropagation();
    if (actionId === '1') {
      navigate("/mail/new");
    } else if (actionId === '2') {
      navigate("/mail/list");
    } else if (actionId === '3') {
      navigate("/mail/convert");
    } else {
      setActiveAction(actionId);
    }
  };

  return (
    <>
      <Header />
      <SubNav />
      <main id="courriers" className="courriersMain">
        <div className="courriersContainer">
          <section className="courriersHeader" data-aos="fade-down">
            <h1 className="courriersTitle">Gestion des courriers</h1>
            <p className="courriersSubtitle">Organisez et suivez vos courriers efficacement</p>
          </section>

          <section className="courriersActions" data-aos="fade-up" data-aos-delay="100">
            <div className="actionsGrid">
              {actions.map((action, index) => (
                <button
                  key={action.id}
                  type="button"
                  className={`actionBtn ${action.primary ? 'primary' : ''} ${activeAction === action.id ? 'active' : ''}`}
                  onClick={(event) => handleActionClick(event, action.id)}
                  data-aos="fade-up"
                  data-aos-delay={150 + index * 50}
                >
                  <span className="actionIcon">{action.icon}</span>
                  <span className="actionText">{action.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="courriersStats" data-aos="fade-up" data-aos-delay="200">
            <h2 className="statsTitle">Statistiques</h2>
            <div className="statsGrid">
              {statsDisplay.map((stat, index) => (
                <div
                  key={stat.id}
                  className={`statCard ${stat.color}`}
                  data-aos="zoom-in"
                  data-aos-delay={250 + index * 100}
                >
                  <div className="statIcon">
                    {stat.icon}
                  </div>
                  <div className="statContent">
                    <div className="statValue">{stat.value}</div>
                    <div className="statLabel">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {activeAction && (
            <section className="courriersContent" data-aos="fade-up" data-aos-delay="300">
              <div className="contentCard">
                <h3>Section: {actions.find(a => a.id === activeAction)?.label}</h3>
                <p>Le contenu de cette section sera développé selon vos besoins spécifiques.</p>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

const CourriersWithAuth = WithAuth(Courriers);
export default CourriersWithAuth;
