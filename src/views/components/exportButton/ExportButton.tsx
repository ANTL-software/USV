import { MdDownload } from 'react-icons/md';
import { csvService } from '../../../utils/services/csvService';
import type { SupervisionExportData } from '../../../utils/services/csvService';
import './exportButton.scss';

interface ExportButtonProps {
  data: SupervisionExportData;
  disabled?: boolean;
}

const ExportButton = ({ data, disabled = false }: ExportButtonProps) => {
  const handleExport = (): void => {
    try {
      csvService.exportSupervisionData(data);
    } catch (error) {
      console.error('[ExportButton] Erreur lors de l\'export:', error);
    }
  };

  return (
    <button
      className="exportButton"
      onClick={handleExport}
      disabled={disabled}
      title="Exporter les données au format CSV"
    >
      <MdDownload className="exportButton__icon" />
      <span className="exportButton__label">Exporter CSV</span>
    </button>
  );
};

export default ExportButton;
