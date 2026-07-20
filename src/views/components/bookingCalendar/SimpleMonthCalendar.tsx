import './simpleMonthCalendar.scss';
import type { ReactElement } from 'react';
import type { BookingMonthCalendarViewModel } from '../../../hooks/index.ts';

interface SimpleMonthCalendarProps { viewModel: BookingMonthCalendarViewModel; }

export default function SimpleMonthCalendar({ viewModel }: SimpleMonthCalendarProps): ReactElement {
  const { view } = viewModel;
  return <div className="simpleMonthCalendar">
    <div className="smcHeader"><button type="button" className="smcNavButton" onClick={() => viewModel.navigate(-1)}>←</button><div className="smcTitle">{view.title}</div><button type="button" className="smcNavButton" onClick={() => viewModel.navigate(1)}>→</button></div>
    <div className="smcWeekdays">{viewModel.weekdays.map((day) => <div key={day} className="smcWeekday">{day}</div>)}</div>
    <div className="smcGrid">
      {Array.from({ length: view.paddingDays }, (_, index) => <div key={`padding-${index}`} className="smcDay smcDayPadding"></div>)}
      {view.days.map((day) => <div key={day.key} className={`smcDay ${day.isToday ? 'isToday' : ''}`} onClick={() => viewModel.selectDay(day.date)}><div className="smcDayNumber">{day.label}</div><div className="smcEvents">{day.events.map(({ event, label }) => <div key={event.id} className="smcEvent" style={{ backgroundColor: event.couleur || '#6b7280' }} onClick={(clickEvent) => { clickEvent.stopPropagation(); viewModel.selectEvent(event); }} title={event.title}>{label}</div>)}{day.moreCount > 0 && <div className="smcMoreEvents">+{day.moreCount} de plus</div>}</div></div>)}
    </div>
  </div>;
}
