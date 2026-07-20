import type { ReactElement } from 'react';
import { IoDocumentTextOutline, IoReceiptOutline, IoSettingsOutline } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import type { CommercialPageViewModel } from '../../../hooks/index.ts';
import { BackToTop, Button, Header, SubNav } from '../index.ts';

interface CommercialHubContentProps {
  viewModel: CommercialPageViewModel;
}

export function CommercialHubContent({ viewModel }: CommercialHubContentProps): ReactElement {
  return <div id="centreAppels"><Header /><SubNav /><main><div className="centreAppels__back"><Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /><span>Retour</span></Button></div><div className="centreAppels__wrapper"><div className="centreAppels__row"><section className="centreAppels__card" onClick={viewModel.navigateToFacturation}><div className="centreAppels__card-icon"><IoReceiptOutline /></div><h2>Facturation</h2></section><section className="centreAppels__card" onClick={viewModel.navigateToDevis}><div className="centreAppels__card-icon"><IoDocumentTextOutline /></div><h2>Devis</h2></section><section className="centreAppels__card" onClick={viewModel.navigateToConfiguration}><div className="centreAppels__card-icon"><IoSettingsOutline /></div><h2>Configuration antl</h2></section></div></div></main><BackToTop /></div>;
}
