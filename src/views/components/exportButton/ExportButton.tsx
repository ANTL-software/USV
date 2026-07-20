import { MdDownload } from 'react-icons/md';
import { useSupervisionExport } from '../../../hooks/index.ts';
import type { SupervisionExportData } from '../../../utils/types/index.ts';
import './exportButton.scss';

interface ExportButtonProps {
  data: SupervisionExportData;
  disabled?: boolean;
}

const ExportButton = ({ data, disabled = false }: ExportButtonProps) => {
  const handleExport = useSupervisionExport(data);

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
