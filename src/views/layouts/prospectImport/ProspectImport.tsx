import './prospectImport.scss';

import type { ReactElement } from 'react';
import { useProspectImportPage } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { BackToTop, Header, ProspectImportContent, SubNav } from '../../components/index.ts';

function ProspectImport(): ReactElement {
  const viewModel = useProspectImportPage();
  return <div id="prospectImport"><Header /><SubNav /><main><ProspectImportContent viewModel={viewModel} /></main><BackToTop /></div>;
}

const ProspectImportWithAuth = WithAuth(ProspectImport);
export default ProspectImportWithAuth;
