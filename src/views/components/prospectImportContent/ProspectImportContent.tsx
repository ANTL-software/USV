import type { ReactElement } from 'react';
import { MdArrowBack } from 'react-icons/md';
import type { ProspectImportPageViewModel } from '../../../hooks/index.ts';
import { ProspectImportDropzone } from '../prospectImportDropzone/index.ts';
import { ProspectImportPreview } from '../prospectImportPreview/index.ts';
import { ProspectImportResult } from '../prospectImportResult/index.ts';

interface ProspectImportContentProps { viewModel: ProspectImportPageViewModel }

export function ProspectImportContent({ viewModel }: ProspectImportContentProps): ReactElement {
  return (
    <div className="prospectImport__container">
      <div className="prospectImport__back"><button type="button" onClick={viewModel.navigateHome}><MdArrowBack /> Retour</button></div>
      <h1>Import de prospects</h1><p className="prospectImport__subtitle">Importez jusqu’à 1 000 prospects depuis un fichier CSV.</p>
      <div className="prospectImport__format"><h3>Format attendu (CSV — séparateur virgule ou point-virgule)</h3><code>nom,prenom,telephone,email,type_prospect,raison_sociale,adresse,code_postal,ville,pays,notes,siret,secteur,region,civilite</code><p>Colonnes obligatoires : <strong>nom</strong> et <strong>telephone</strong>. Les doublons (même téléphone) sont ignorés automatiquement.</p></div>
      {!viewModel.result && <><ProspectImportDropzone viewModel={viewModel} />{viewModel.parseError && <div className="prospectImport__parse-error">{viewModel.parseError}</div>}{viewModel.rows.length > 0 && <ProspectImportPreview viewModel={viewModel} />}{viewModel.importError && <div className="prospectImport__import-error">{viewModel.importError}</div>}</>}
      <ProspectImportResult viewModel={viewModel} />
    </div>
  );
}
