import './bookingCalendar.scss';
import type { ReactElement } from 'react';
import { IoAdd } from 'react-icons/io5';
import type { BookingCalendarViewModel } from '../../../hooks/index.ts';
import { BookingDetailModal } from '../bookingDetailModal/index.ts';
import { BookingForm } from '../bookingForm/index.ts';
import { BookingMoveModal } from '../bookingMoveModal/index.ts';
import SimpleMonthCalendar from './SimpleMonthCalendar.tsx';
import SimpleWeekCalendar from './SimpleWeekCalendar.tsx';

interface BookingCalendarProps { viewModel: BookingCalendarViewModel; }

export default function BookingCalendar({ viewModel }: BookingCalendarProps): ReactElement {
  return <div id="bookingCalendar">
    <div className="calendarToolbar">
      <div className="viewSwitcher">
        <button type="button" className={`viewButton ${viewModel.currentView === 'week' ? 'isActive' : ''}`} onClick={() => viewModel.setCurrentView('week')}>Semaine</button>
        <button type="button" className={`viewButton ${viewModel.currentView === 'month' ? 'isActive' : ''}`} onClick={() => viewModel.setCurrentView('month')}>Mois</button>
      </div>
      <input type="date" className="dateJumpInput" value={viewModel.currentDateInput} onChange={(event) => viewModel.setCurrentDate(event.target.value)} />
      <button type="button" className="btnNewBooking" onClick={viewModel.openNewBooking} disabled={viewModel.isLoading}><IoAdd />Nouveau rendez-vous</button>
    </div>
    <div className="calendarBody">
      {viewModel.currentView === 'week'
        ? <SimpleWeekCalendar viewModel={viewModel.week} />
        : <SimpleMonthCalendar viewModel={viewModel.month} />}
    </div>
    {viewModel.form.isOpen && <BookingForm viewModel={viewModel.form} />}
    {viewModel.detail.booking && <BookingDetailModal viewModel={viewModel.detail} />}
    {viewModel.move.isOpen && <BookingMoveModal viewModel={viewModel.move} />}
  </div>;
}
