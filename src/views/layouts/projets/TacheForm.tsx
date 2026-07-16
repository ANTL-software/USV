import './tacheForm.scss';
import type { ReactElement } from 'react';
import { useTacheEditor } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { TacheFormContent } from '../../components/index.ts';

function TacheForm(): ReactElement {
  return <TacheFormContent viewModel={useTacheEditor()} />;
}

const TacheFormWithAuth = WithAuth(TacheForm);
export default TacheFormWithAuth;
