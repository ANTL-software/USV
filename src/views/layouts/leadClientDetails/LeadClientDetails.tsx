import type { ReactElement } from 'react';
import { useLeadClientDetailsPage } from '../../../hooks/index.ts';
import { BackToTop, Header, LeadClientDetailsContent, SubNav } from '../../components/index.ts';

export default function LeadClientDetails(): ReactElement {
  const viewModel = useLeadClientDetailsPage();
  return <div id="commandeDetails"><Header /><SubNav /><LeadClientDetailsContent viewModel={viewModel} /><BackToTop /></div>;
}
