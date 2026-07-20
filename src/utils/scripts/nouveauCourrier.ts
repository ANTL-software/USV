import type {
  ICourrierAnalysisResult,
  ICourrierFormData,
  ICourrierSelectSuggestion,
  ICourrierUploadData,
} from '../types/index.ts';
import { toLocalIsoDate } from './utils.ts';

export interface CourrierAnalysisHints {
  kind: ICourrierSelectSuggestion | null;
  department: ICourrierSelectSuggestion | null;
}

export const EMPTY_COURRIER_ANALYSIS_HINTS: CourrierAnalysisHints = {
  kind: null,
  department: null,
};

export function createInitialCourrierForm(referenceDate: Date = new Date()): ICourrierFormData {
  return {
    direction: 'entrant',
    emitter: '',
    recipient: '',
    receptionDate: toLocalIsoDate(referenceDate),
    courrierDate: '',
    priority: 'normal',
    department: '',
    kind: '',
    description: '',
    customFileName: '',
  };
}

export function getCourrierFileBaseName(fileName: string): string {
  return fileName.replace(/\.[^/.]+$/, '').trim();
}

export function getCourrierFileExtension(fileName: string): string {
  const dotIndex = fileName.lastIndexOf('.');
  return dotIndex === -1 ? '' : fileName.substring(dotIndex);
}

export function buildCourrierFinalFileName(customName: string, file: File): string {
  return `${customName.trim()}${getCourrierFileExtension(file.name)}`;
}

export function getCourrierDuplicateNameError(finalFileName: string): string {
  return `Un courrier nommé "${finalFileName}" existe déjà. Veuillez choisir un autre nom.`;
}

export function resolveCourrierSelectValue(
  suggestion: ICourrierSelectSuggestion | null,
  fallbackValue: string | null,
  previousValue: string,
): string {
  if (suggestion?.matchedOption && suggestion.matchConfidence >= 85) {
    return suggestion.matchedOption;
  }
  if (!suggestion?.matchedOption && suggestion && suggestion.confidence >= 75 && fallbackValue) {
    return fallbackValue;
  }
  return previousValue;
}

export function getCourrierSuggestionMessage(
  label: string,
  suggestion: ICourrierSelectSuggestion | null,
): string | null {
  if (!suggestion?.matchedOption || !suggestion.shouldSuggest || suggestion.shouldAutofill) {
    return null;
  }
  return `${label} suggéré : ${suggestion.matchedOption} (${suggestion.matchConfidence}% de confiance)`;
}

export function applyCourrierAnalysis(
  previous: ICourrierFormData,
  result: ICourrierAnalysisResult,
): ICourrierFormData {
  return {
    ...previous,
    direction: result.direction || previous.direction,
    emitter: result.emitter || previous.emitter,
    recipient: result.recipient || previous.recipient,
    receptionDate: result.receptionDate || previous.receptionDate,
    courrierDate: result.courrierDate || previous.courrierDate,
    priority: result.priority || previous.priority,
    department: resolveCourrierSelectValue(
      result.selectSuggestions.department,
      result.department,
      previous.department,
    ),
    kind: resolveCourrierSelectValue(
      result.selectSuggestions.kind,
      result.kind,
      previous.kind,
    ),
    description: result.description || previous.description,
    customFileName: result.customFileName || previous.customFileName,
  };
}

export function getAnalyzedCourrierFileName(
  result: ICourrierAnalysisResult,
  currentCustomName: string,
  file: File,
): string {
  return result.customFileName || currentCustomName || getCourrierFileBaseName(file.name);
}

export function buildCourrierUploadData(formData: ICourrierFormData): ICourrierUploadData {
  return {
    direction: formData.direction,
    emitter: formData.emitter.trim() || undefined,
    recipient: formData.recipient.trim() || undefined,
    receptionDate: formData.receptionDate || undefined,
    courrierDate: formData.courrierDate || undefined,
    priority: formData.priority,
    department: formData.department.trim() || undefined,
    kind: formData.kind.trim() || undefined,
    description: formData.description.trim() || undefined,
    customFileName: formData.customFileName.trim() || undefined,
  };
}

export function isNouveauCourrierSubmitDisabled(
  formData: ICourrierFormData,
  isLoading: boolean,
  isCheckingName: boolean,
  duplicateNameError: string | null,
): boolean {
  return isLoading
    || isCheckingName
    || duplicateNameError !== null
    || !formData.direction
    || !formData.fichierJoint
    || !formData.customFileName.trim()
    || !formData.kind.trim()
    || !formData.department.trim()
    || !formData.courrierDate;
}
