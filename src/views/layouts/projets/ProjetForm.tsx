import './projetForm.scss';
import type { ReactElement } from 'react';
import { useProjetEditor } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { ProjetFormContent } from '../../components/index.ts';

function ProjetForm(): ReactElement {
  return <ProjetFormContent viewModel={useProjetEditor()} />;
}

const ProjetFormWithAuth = WithAuth(ProjetForm);
export default ProjetFormWithAuth;
