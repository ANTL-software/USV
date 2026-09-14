import type { ReactElement } from 'react';
import { IoCalendarNumberOutline, IoCalendarOutline, IoMegaphoneOutline } from 'react-icons/io5';
import { MdArrowBack } from 'react-icons/md';
import type { CommerciauxPageViewModel } from '../../../hooks/index.ts';
import { BackToTop, Button, Header, SubNav } from '../index.ts';

interface CommerciauxHubContentProps { viewModel: CommerciauxPageViewModel; }

export function CommerciauxHubContent({ viewModel }: CommerciauxHubContentProps): ReactElement {
  const { access } = viewModel;
  return <div id="commerciaux"><Header /><SubNav /><main><div className="commerciaux__back"><Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /><span>Retour</span></Button></div><div className="commerciaux__wrapper"><h1 className="commerciaux__title">Gestion commerciaux</h1><div className="commerciaux__row">{access.agenda && <button type="button" className="commerciaux__card" onClick={viewModel.navigateToAgenda}><div className="commerciaux__card-icon"><IoCalendarNumberOutline /></div><h2>Agenda travail commerciaux</h2><p>Visualiser l’agenda d’un commercial et déplacer ou annuler ses rendez-vous sans changer leur propriétaire.</p></button>}{access.notes && <button type="button" className="commerciaux__card" onClick={viewModel.navigateToNotes}><div className="commerciaux__card-icon"><IoMegaphoneOutline /></div><h2>Notes de la direction</h2><p>Retrouver les communications, consignes et messages importants transmis par la direction.</p></button>}{access.planning && <button type="button" className="commerciaux__card" onClick={viewModel.navigateToPlanning}><div className="commerciaux__card-icon"><IoCalendarOutline /></div><h2>Voir mon planning</h2><p>Consulter votre planning, vos prochaines disponibilités et vos temps forts à venir.</p></button>}</div></div></main><BackToTop /></div>;
}
