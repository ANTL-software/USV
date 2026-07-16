import { useEffect, useMemo, useState } from 'react';
import { Views } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import { getMyPlanningService } from '../API/services/index.ts';
import {
  buildPlanningDetailedEvents,
  buildPlanningMonthEvents,
  getPlanningEndOfWeek,
  getPlanningStartOfWeek,
  toPlanningDateKey,
} from '../utils/scripts/index.ts';
import type { CalendarPlanningEvent } from '../utils/types/index.ts';

export function usePlanningCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);
  const [sourceEvents, setSourceEvents] = useState<CalendarPlanningEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const range = useMemo(() => {
    const baseDate = new Date(currentDate);
    baseDate.setHours(0, 0, 0, 0);

    if (currentView === Views.WEEK) {
      return {
        start: getPlanningStartOfWeek(baseDate),
        end: getPlanningEndOfWeek(baseDate),
      };
    }

    if (currentView === Views.DAY) {
      return { start: baseDate, end: baseDate };
    }

    return {
      start: new Date(baseDate.getFullYear(), baseDate.getMonth(), 1),
      end: new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0),
    };
  }, [currentDate, currentView]);

  useEffect(() => {
    let isCancelled = false;

    const loadPlanning = async (): Promise<void> => {
      setIsLoading(true);

      try {
        const data = await getMyPlanningService(
          toPlanningDateKey(range.start),
          toPlanningDateKey(range.end),
        );
        if (!isCancelled) {
          setSourceEvents(data.events);
        }
      } catch (loadError) {
        console.error('Erreur lors du chargement du planning:', loadError);
        if (!isCancelled) {
          setSourceEvents([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadPlanning();

    return () => {
      isCancelled = true;
    };
  }, [range]);

  const events = useMemo(
    () => currentView === Views.MONTH
      ? buildPlanningMonthEvents(sourceEvents)
      : buildPlanningDetailedEvents(sourceEvents),
    [currentView, sourceEvents],
  );

  const { minTime, maxTime } = useMemo(() => {
    const min = new Date();
    min.setHours(7, 0, 0, 0);
    const max = new Date();
    max.setHours(18, 0, 0, 0);
    return { minTime: min, maxTime: max };
  }, []);

  return {
    currentDate,
    currentView,
    events,
    isLoading,
    maxTime,
    minTime,
    setCurrentDate,
    setCurrentView,
  };
}
