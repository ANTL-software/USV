import type { ReactElement } from 'react';
import type { EventProps } from 'react-big-calendar';
import type { CommandesCalendarEvent } from '../../../utils/types/index.ts';

export function CommandesCalendarEventLabel({ event }: EventProps<CommandesCalendarEvent>): ReactElement {
  if (event.kind !== 'lead') return <>{event.title}</>;
  return <span className="commandesCalendar__rdv-label">
    <span className="commandesCalendar__rdv-prefix">{event.labelPrefix}</span>
    <span className="commandesCalendar__rdv-company">{event.company}</span>
  </span>;
}
