import type { ReactElement } from 'react';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { useDocumentationPage } from '../../../hooks/index.ts';
import { DocumentationContent } from '../../components/index.ts';
import './documentation.scss';
function Documentation(): ReactElement { return <DocumentationContent viewModel={useDocumentationPage()} />; }
export default WithAuth(Documentation);
