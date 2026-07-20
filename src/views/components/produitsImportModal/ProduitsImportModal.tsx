import type { MouseEvent, ReactElement } from 'react';
import { IoClose } from 'react-icons/io5';

import type { ProduitsImportModalViewModel } from '../../../hooks/index.ts';

interface ProduitsImportModalProps {
  viewModel: ProduitsImportModalViewModel;
}

export function ProduitsImportModal({ viewModel }: ProduitsImportModalProps): ReactElement | null {
  if (!viewModel.showImportModal) return null;
  const { importState } = viewModel;
  const stopPropagation = (event: MouseEvent): void => event.stopPropagation();

  return (
    <div className="produitsList__modal-backdrop" onClick={viewModel.closeImportModal}>
      <div className="produitsList__modal-container" onClick={stopPropagation}>
        <div className="produitsList__modal-header">
          <h3>Importer des produits (CSV)</h3>
          <button type="button" onClick={viewModel.closeImportModal}><IoClose /></button>
        </div>
        <div className="produitsList__modal-content">
          <p className="produitsList__modal-format">
            Format attendu (séparateur ; ou ,) :<br />
            <code>code_produit_origine; nom_produit_origine; description; prix_unitaire; conditionnement;</code>
          </p>
          <input
            key={viewModel.fileInputVersion}
            id="produitsImportFile"
            type="file"
            accept=".csv,text/csv"
            onChange={viewModel.handleImportFileChange}
            disabled={importState.isLoading}
            hidden
          />
          <label className="produitsList__modal-btn-select" htmlFor="produitsImportFile" aria-disabled={importState.isLoading}>
            {importState.selectedFile?.name || 'Choisir un fichier CSV'}
          </label>
          {importState.isLoading && <p className="produitsList__modal-status">Import en cours... (cela peut prendre plusieurs minutes pour les gros fichiers)</p>}
          {importState.result && (
            <div className="produitsList__modal-result">
              <p className="produitsList__modal-success">✅ {importState.result.created} produits créés</p>
              {importState.result.skipped > 0 && <p className="produitsList__modal-warning">⚠️ {importState.result.skipped} produits ignorés (déjà existants)</p>}
              {importState.result.errors.length > 0 && (
                <div className="produitsList__modal-errors">
                  <p className="produitsList__modal-error">❌ {importState.result.errors.length} erreurs :</p>
                  <ul className="produitsList__modal-error-list">
                    {importState.result.errors.map((error) => <li key={`${error.ligne}-${error.message}`}>Ligne {error.ligne}: {error.message}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
          {importState.error && <p className="produitsList__modal-error">{importState.error}</p>}
          <div className="produitsList__modal-actions"><button type="button" onClick={viewModel.closeImportModal}>Fermer</button></div>
        </div>
      </div>
    </div>
  );
}
