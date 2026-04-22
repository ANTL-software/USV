// styles
import "./modal.scss";

// hooks | libraries
import { ReactElement } from "react";
import { MdClose } from "react-icons/md";

interface IModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

function Modal({ isVisible, onClose, title, children }: IModalProps): ReactElement | null {
  if (!isVisible) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div id="modal">
      <div className="modalBackdrop" onClick={handleBackdropClick}>
        <div className="modalContainer" onClick={(e) => e.stopPropagation()}>
          <div className="modalHeader">
            <h3>{title}</h3>
            <button className="closeBtn" onClick={onClose}>
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