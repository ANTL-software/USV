import './simpleWeekCalendar.scss';
import type { ReactElement } from 'react';
import type { BookingWeekCalendarViewModel } from '../../../hooks/index.ts';

interface SimpleWeekCalendarProps { viewModel: BookingWeekCalendarViewModel; }

export default function SimpleWeekCalendar({ viewModel }: SimpleWeekCalendarProps): ReactElement {
  const { view } = viewModel;
  return <div className="simpleWeekCalendar">
    <div className="swcToolbar"><button type="button" className="swcNavButton" onClick={() => viewModel.navigate(-1)}>← Semaine précédente</button><div className="swcTitle">Semaine {view.rangeLabel}</div><button type="button" className="swcNavButton" onClick={() => viewModel.navigate(1)}>Semaine suivante →</button></div>
    <div className="swcHeader"><div className="swcCorner"></div>{view.days.map((day) => <div key={day.key} className="swcDayHeader"><div className="swcDayName">{day.dayName}</div><div className="swcDayNumber">{day.dayNumber}</div></div>)}</div>
    <div className="swcGrid">
      <div className="swcHours">{view.hourLabels.map((hour) => <div key={hour.label} className="swcHourLabel" style={{ top: hour.top }}>{hour.label}</div>)}</div>
      <div className="swcDays">
        {view.days.map((day) => <div key={day.key} className="swcDayColumn">{Array.from({ length: view.totalHours }, (_, hour) => <div key={hour} className="swcHourRow" style={{ top: `${(hour / view.totalHours) * 100}%` }}><div className="swcHourCell" onClick={() => viewModel.selectSlot(day.date, viewModel.startHour + hour)} /></div>)}</div>)}
        {view.events.map(({ event, style, timeLabel }) => <div key={event.id} className="swcEvent" style={style} onClick={(clickEvent) => { clickEvent.stopPropagation(); viewModel.selectEvent(event); }} title={event.title}><div className="swcEventContent"><div className="swcEventTime">{timeLabel}</div><div className="swcEventTitle">{event.title}</div></div></div>)}
      </div>
    </div>
  </div>;
}
