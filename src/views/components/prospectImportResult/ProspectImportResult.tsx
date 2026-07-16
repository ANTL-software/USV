import type { ReactElement } from 'react';
import type { ProspectImportPageViewModel } from '../../../hooks/index.ts';
import { Button } from '../button/index.ts';

interface ProspectImportResultProps { viewModel: ProspectImportPageViewModel }

export function ProspectImportResult({ viewModel }: ProspectImportResultProps): ReactElement | null {
  if (!viewModel.result) return null;
  return <div className="prospectImport__result"><h2>Résultats de l’import</h2><div className="prospectImport__result-stats"><div className="prospectImport__stat prospectImport__stat--created"><span>{viewModel.result.created}</span><span>Créés</span></div><div className="prospectImport__stat prospectImport__stat--skipped"><span>{viewModel.result.skipped}</span><span>Doublons ignorés</span></div><div className="prospectImport__stat prospectImport__stat--errors"><span>{viewModel.result.errors.length}</span><span>Erreurs</span></div></div>{viewModel.result.errors.length > 0 && <div className="prospectImport__result-errors"><h4>Détail des erreurs</h4><ul>{viewModel.result.errors.map((error) => <li key={`${error.ligne}-${error.message}`}><strong>Ligne {error.ligne}</strong>{error.message}</li>)}</ul></div>}<div className="prospectImport__result-actions"><Button style="grey" onClick={viewModel.reset}>Nouvel import</Button><button type="button" className="prospectImport__secondary-button" onClick={viewModel.navigateHome}>Retour à l’accueil</button></div></div>;
}
