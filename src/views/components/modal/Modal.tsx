// styles
import "./modal.scss";

// hooks | libraries
import { ReactElement, ReactNode, useId } from "react";
import type { MouseEvent } from "react";
import { MdClose } from "react-icons/md";

type ModalVariant = "default" | "document" | "confirm";

interface IModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  variant?: ModalVariant;
}

function Modal({
  isVisible,
  onClose,
  title,
  children,
  variant = "default",
}: IModalProps): ReactElement | null {
  const titleId = useId();

  if (!isVisible) return null;

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div id="modal">
      <div className="modalBackdrop" onClick={handleBackdropClick}>
        <div
          aria-labelledby={titleId}
          aria-modal="true"
          className={`modalContainer modalContainer--${variant}`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
        >
          <div className="modalHeader">
            <h3 id={titleId}>{title}</h3>
            <button
              aria-label="Fermer la fenêtre"
              className="closeBtn"
              onClick={onClose}
              type="button"
            >
              <MdClose />
            </button>
          </div>
          <div className="modalContent">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
