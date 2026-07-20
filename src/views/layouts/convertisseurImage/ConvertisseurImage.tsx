import './convertisseurImage.scss';
import type { ReactElement } from 'react';
import { useImageConverterPage } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { ImageConverterContent } from '../../components/index.ts';

function ConvertisseurImage(): ReactElement {
  return <ImageConverterContent viewModel={useImageConverterPage()} />;
}

const ConvertisseurImageWithAuth = WithAuth(ConvertisseurImage);
export default ConvertisseurImageWithAuth;
