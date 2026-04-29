import { MdPrint } from 'react-icons/md';
import './printButton.scss';

interface PrintButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

const PrintButton = ({ onClick, disabled = false }: PrintButtonProps) => {
  const handlePrint = (): void => {
    if (onClick) {
      onClick();
    } else {
      window.print();
    }
  };

  return (
    <button
      className="printButton"
      onClick={handlePrint}
      disabled={disabled}
      title="Imprimer le rapport"
    >
      <MdPrint className="printButton__icon" />
      <span className="printButton__label">Imprimer</span>
    </button>
  );
};

export default PrintButton;
