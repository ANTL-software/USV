import { useAlert as useAlertContext } from '../context/alert/index.ts';

export function useAlert() {
  return useAlertContext();
}
