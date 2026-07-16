import { useNavigate } from 'react-router-dom';
import { formatDate, getPlanningEventStyle } from '../utils/scripts/index.ts';
import { useAbsenceRequests } from './useAbsenceRequests.ts';
import { usePlanningCalendar } from './usePlanningCalendar.ts';

export function useMonPlanningPage() {
  const navigate = useNavigate();
  return {
    absence: useAbsenceRequests(),
    calendar: usePlanningCalendar(),
    eventPropGetter: getPlanningEventStyle,
    formatRequestDate: formatDate,
    navigateBack: () => void navigate('/commerciaux'),
  };
}

export type MonPlanningPageViewModel = ReturnType<typeof useMonPlanningPage>;
