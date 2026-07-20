import type { ICourrierFormData } from '../types/index.ts';
import { buildCourrierUploadData } from './nouveauCourrier.ts';

export function createEmptyCourrierUpdateForm(): ICourrierFormData {
  return {
    direction: 'entrant',
    emitter: '',
    recipient: '',
    receptionDate: '',
    courrierDate: '',
    priority: 'normal',
    department: '',
    kind: '',
    description: '',
    customFileName: '',
  };
}

export const buildCourrierUpdateData = buildCourrierUploadData;

export function isCourrierUpdateSubmitDisabled(
  formData: ICourrierFormData,
  isLoading: boolean,
): boolean {
  return isLoading
    || !formData.direction
    || !formData.kind.trim()
    || !formData.department.trim()
    || !formData.customFileName.trim();
}
