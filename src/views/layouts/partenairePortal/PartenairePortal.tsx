import './partenairePortal.scss';
import type { ReactElement } from 'react';
import { usePartenairePortal } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { Header, PartenairePortalCards } from '../../components/index.ts';

function PartenairePortal(): ReactElement {
  return <div id="partnerPortal"><Header /><PartenairePortalCards {...usePartenairePortal()} /></div>;
}

export default WithAuth(PartenairePortal);
