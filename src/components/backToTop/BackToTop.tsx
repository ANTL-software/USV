// styles
import "./backToTop.scss";

// hooks | library
import { ReactElement, useEffect, useState } from "react";
import { MdKeyboardArrowUp } from "react-icons/md";

export default function BackToTop(): ReactElement | null {
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow((window.pageYOffset || document.documentElement.scrollTop) > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      className="backToTopBtn"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      title="Retour en haut"
    >
      <MdKeyboardArrowUp />
    </button>
  );
}
