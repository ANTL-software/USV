import type { ReactElement } from 'react';
import type { ProspectImportPageViewModel } from '../../../hooks/index.ts';
import { PROSPECT_IMPORT_PREVIEW_LIMIT } from '../../../utils/scripts/index.ts';
import { Button } from '../button/index.ts';

interface ProspectImportPreviewProps { viewModel: ProspectImportPageViewModel }

export function ProspectImportPreview({ viewModel }: ProspectImportPreviewProps): ReactElement {
  const preview = viewModel.rows.slice(0, PROSPECT_IMPORT_PREVIEW_LIMIT);
  const remaining = viewModel.rows.length - preview.length;
  return (
    <><div className="prospectImport__preview"><h3>{viewModel.rows.length} ligne{viewModel.rows.length > 1 ? 's' : ''} détectée{viewModel.rows.length > 1 ? 's' : ''} — aperçu ({preview.length} premières)</h3><table className="prospectImport__preview-table"><thead><tr><th>#</th><th>Nom</th><th>Prénom</th><th>Téléphone</th><th>Email</th><th>Type</th><th>Ville</th></tr></thead><tbody>{preview.map((row, index) => <tr key={`${row.telephone}-${index}`}><td>{index + 1}</td><td>{row.nom}</td><td>{row.prenom ?? '—'}</td><td>{row.telephone}</td><td>{row.email ?? '—'}</td><td>{row.type_prospect ?? 'Particulier'}</td><td>{row.ville ?? '—'}</td></tr>)}</tbody></table>{remaining > 0 && <div className="prospectImport__preview-more">... et {remaining} autre{remaining > 1 ? 's' : ''} ligne{remaining > 1 ? 's' : ''}</div>}</div>
      <div className="prospectImport__actions"><Button style="gradient" onClick={() => { void viewModel.handleImport(); }} disabled={viewModel.isImporting}>{viewModel.isImporting ? 'Import en cours...' : `Importer ${viewModel.rows.length} prospect${viewModel.rows.length > 1 ? 's' : ''}`}</Button><button type="button" className="prospectImport__secondary-button" onClick={viewModel.reset}>Annuler</button></div>
    </>
  );
}
