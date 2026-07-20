import type { ReactElement } from 'react';
import { MdArrowBack } from 'react-icons/md';
import type { BookingPageViewModel } from '../../../hooks/index.ts';
import { BackToTop, BookingCalendar, Button, Header, SubNav } from '../index.ts';

interface BookingPageContentProps { viewModel: BookingPageViewModel; }

export function BookingPageContent({ viewModel }: BookingPageContentProps): ReactElement {
  return <div id="bookingPage"><Header /><SubNav /><main><div className="bookingHeader"><Button style="back" onClick={viewModel.navigateBack}><MdArrowBack /><span>Retour</span></Button><h1>Agenda ANTL</h1></div><div className="calendarWrapper"><BookingCalendar viewModel={viewModel.booking} /></div></main><BackToTop /></div>;
}
