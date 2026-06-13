// styles
import "./header.scss";

// assets
import antlLogo from "../../../assets/antlLogo.png";

// utils
import { getSalutation } from "../../../utils/scripts/utils.ts";

// hooks | libraries
import { ReactElement, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import { IoHome, IoAdd, IoList, IoCalendar, IoPeopleCircle, IoCallOutline, IoFolder } from "react-icons/io5";
import { LuLogOut } from "react-icons/lu";
import { useUserContext } from "../../../hooks/useUserContext.ts";

// components
import PWAInstallButton from "../pwaInstallButton/PWAInstallButton.tsx";

export default function Header(): ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useUserContext();

  const isAuthRoute: boolean = location.pathname === "/auth";

  const handleLogout = () => {
    logout();
  };

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    closeMobileMenu();
  };

  return (
    <>
      <header id="header">
        <div className="headerContainer">
          {/* Logo/Brand */}
          <Link
            to={isAuthRoute ? "/auth" : "/home"}
            className="headerBrand"
            onClick={closeMobileMenu}
            title={isAuthRoute ? "" : "Home"}
          >
            <figure className="brandLogo">
              <img src={antlLogo} alt="ANTL" />
            </figure>
          </Link>

          {/* User Info & Desktop Navigation */}
          <div className="headerRight">
            {user && !isAuthRoute && (
              <span className="userGreeting">{getSalutation(user.prenom)}</span>
            )}
            {user && !isAuthRoute && (
              <div className="headerActions">
                <PWAInstallButton variant="desktop" compact={true} />
                <button onClick={handleLogout} className="logoutButton" title="Déconnexion" aria-label="Déconnexion">
                  <LuLogOut size={18} />
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            {!isAuthRoute && (
              <button
                className="headerToggle"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle navigation"
              >
                {isMobileMenuOpen ? <HiX /> : <HiMenu />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && !isAuthRoute && (
        <div className="mobileMenuOverlay" onClick={closeMobileMenu}>
          <div
            className="mobileMenu utils"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobileMenuHeader utils">
              <span className="mobileMenuTitle">Navigation</span>
              <button className="mobileMenuClose" onClick={closeMobileMenu}>
                <HiX />
              </button>
            </div>

            <div className="mobileMenuContent">
              {/* User info in mobile menu */}
              {user && (
                <div className="mobileUserInfo">
                  <span className="mobileUserGreeting">
                    {getSalutation(user.prenom)}
                  </span>
                  <PWAInstallButton variant="mobile" compact={true} />
                  <button onClick={handleLogout} className="mobileLogoutButton" title="Déconnexion">
                    <LuLogOut size={16} /> Déconnexion
                  </button>
                </div>
              )}

              {/* Navigation */}
              <div className="mobileSection">
                <button
                  className={`mobileNavItem ${location.pathname === "/home" ? "active" : ""}`}
                  onClick={() => handleNavigate("/home")}
                >
                  <IoHome className="mobileNavIcon" />
                  <span className="mobileNavText">Accueil</span>
                </button>

                <h3 className="mobileSectionTitle">Gestion des courriers</h3>
                <button
                  className={`mobileNavItem ${location.pathname === "/mail/new" ? "active" : ""}`}
                  onClick={() => handleNavigate("/mail/new")}
                >
                  <IoAdd className="mobileNavIcon" />
                  <span className="mobileNavText">Ajouter un courrier</span>
                </button>
                <button
                  className={`mobileNavItem ${location.pathname === "/mail/list" ? "active" : ""}`}
                  onClick={() => handleNavigate("/mail/list")}
                >
                  <IoList className="mobileNavIcon" />
                  <span className="mobileNavText">Liste des courriers</span>
                </button>

                <h3 className="mobileSectionTitle">Agenda</h3>
                <button
                  className={`mobileNavItem ${location.pathname === "/booking" ? "active" : ""}`}
                  onClick={() => handleNavigate("/booking")}
                >
                  <IoCalendar className="mobileNavIcon" />
                  <span className="mobileNavText">Agenda</span>
                </button>

                <h3 className="mobileSectionTitle">Gestion opérationnelle</h3>
                <button
                  className={`mobileNavItem ${location.pathname.startsWith("/operations") || location.pathname.startsWith("/campagnes") || location.pathname.startsWith("/prospects") || location.pathname.startsWith("/produits") ? "active" : ""}`}
                  onClick={() => handleNavigate("/operations")}
                >
                  <IoCallOutline className="mobileNavIcon" />
                  <span className="mobileNavText">Gestion opérationnelle</span>
                </button>

                <h3 className="mobileSectionTitle">Gestion commerciaux</h3>
                <button
                  className={`mobileNavItem ${location.pathname.startsWith("/commerciaux") ? "active" : ""}`}
                  onClick={() => handleNavigate("/commerciaux")}
                >
                  <IoPeopleCircle className="mobileNavIcon" />
                  <span className="mobileNavText">Gestion commerciaux</span>
                </button>

                <h3 className="mobileSectionTitle">Gestion de projets</h3>
                <button
                  className={`mobileNavItem ${location.pathname.startsWith("/projets") ? "active" : ""}`}
                  onClick={() => handleNavigate("/projets")}
                >
                  <IoFolder className="mobileNavIcon" />
                  <span className="mobileNavText">Gestion de projets</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
