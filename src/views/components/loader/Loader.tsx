// styles
import "./loader.scss";

// hooks | libraries
import { ReactElement } from "react";

interface ILoaderProps {
  size?: "small" | "medium" | "large";
  message?: string;
  overlay?: boolean;
}

function Loader({ size = "medium", message, overlay = false }: ILoaderProps): ReactElement {
  const loaderContent = (
    <div className={`loaderContainer ${size}`}>
      <div className="spinner">
        <div className="spinnerCircle"></div>
        <div className="spinnerCircle"></div>
        <div className="spinnerCircle"></div>
      </div>
      {message && <p className="loaderMessage">{message}</p>}
    </div>
  );

  if (overlay) {
    return (
      <div id="loader" className="loaderOverlay">
        {loaderContent}
      </div>
    );
  }

  return (
    <div id="loader">
      {loaderContent}
    </div>
  );
}

export default Loader;