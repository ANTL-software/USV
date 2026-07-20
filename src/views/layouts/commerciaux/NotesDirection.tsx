import './commerciaux.scss';
import type { ReactElement } from 'react';
import { useNotesDirectionPage } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { NotesDirectionContent } from '../../components/index.ts';

function NotesDirection(): ReactElement {
  return <NotesDirectionContent viewModel={useNotesDirectionPage()} />;
}

const NotesDirectionWithAuth = WithAuth(NotesDirection);
export default NotesDirectionWithAuth;
