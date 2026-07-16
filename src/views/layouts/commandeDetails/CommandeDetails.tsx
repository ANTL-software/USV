import type { ReactElement } from 'react';

import './commandeDetails.scss';

import { useCommandeDetailsRoute } from '../../../hooks/index.ts';
import { WithAuth } from '../../../utils/middleware/index.ts';
import { CommandeVenteDetails } from '../../components/index.ts';
import { LeadClientDetails } from '../index.ts';

function CommandeDetails(): ReactElement {
  const route = useCommandeDetailsRoute();
  return route.isLeadMode
    ? <LeadClientDetails />
    : <CommandeVenteDetails idVente={route.idVente} onBack={route.navigateBack} />;
}

const CommandeDetailsWithAuth = WithAuth(CommandeDetails);
export default CommandeDetailsWithAuth;
