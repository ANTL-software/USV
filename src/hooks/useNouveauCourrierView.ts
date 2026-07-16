import type {
  ChangeEvent,
  DragEvent,
  FocusEvent,
  FormEvent,
} from 'react';
import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  useCourrier,
  useCourrierFieldOptions,
} from './index.ts';
import {
  EMPTY_COURRIER_ANALYSIS_HINTS,
  applyCourrierAnalysis,
  buildCourrierFinalFileName,
  buildCourrierUploadData,
  createInitialCourrierForm,
  formatFileSize,
  getAnalyzedCourrierFileName,
  getCourrierDuplicateNameError,
  getCourrierFileBaseName,
  getCourrierSuggestionMessage,
  handleCourrierUploadError,
  isNouveauCourrierSubmitDisabled,
  logError,
  showErrorNotification,
  validateCourrierFile,
  validateCourrierForm,
} from '../utils/scripts/index.ts';
import type {
  CourrierAnalysisHints,
} from '../utils/scripts/index.ts';
import type { ICourrierFormData } from '../utils/types/index.ts';

type TextFormEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
type TextFormFocusEvent = FocusEvent<HTMLInputElement | HTMLTextAreaElement>;
type SelectFieldName = 'direction' | 'priority';
type CreatableFieldName = 'kind' | 'department' | 'emitter' | 'recipient';

export function useNouveauCourrierView() {
  const navigate = useNavigate();
  const { uploadCourrier, isLoading, analyzeCourrier, checkCourrierName } = useCourrier();
  const fieldOptions = {
    kind: useCourrierFieldOptions('kind'),
    department: useCourrierFieldOptions('department'),
    emitter: useCourrierFieldOptions('emitter'),
    recipient: useCourrierFieldOptions('recipient'),
  };
  const [formData, setFormData] = useState<ICourrierFormData>(() => createInitialCourrierForm());
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisHints, setAnalysisHints] = useState<CourrierAnalysisHints>({ ...EMPTY_COURRIER_ANALYSIS_HINTS });
  const [duplicateNameError, setDuplicateNameError] = useState<string | null>(null);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [fileInputVersion, setFileInputVersion] = useState(0);
  const nameCheckSequenceRef = useRef(0);

  const checkFileNameDuplication = useCallback(async (
    customName: string,
    file?: File,
  ): Promise<boolean> => {
    if (!file || !customName.trim()) {
      setDuplicateNameError(null);
      return false;
    }

    const finalFileName = buildCourrierFinalFileName(customName, file);
    const sequence = ++nameCheckSequenceRef.current;
    setIsCheckingName(true);
    try {
      const exists = await checkCourrierName(finalFileName);
      if (sequence === nameCheckSequenceRef.current) {
        setDuplicateNameError(exists ? getCourrierDuplicateNameError(finalFileName) : null);
      }
      return exists;
    } catch (error: unknown) {
      logError('checkFileNameDuplication', error);
      if (sequence === nameCheckSequenceRef.current) setDuplicateNameError(null);
      return false;
    } finally {
      if (sequence === nameCheckSequenceRef.current) setIsCheckingName(false);
    }
  }, [checkCourrierName]);

  const analyzeDocument = useCallback(async (file: File, currentCustomName: string): Promise<void> => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeCourrier(file, {
        kindOptions: fieldOptions.kind.options,
        departmentOptions: fieldOptions.department.options,
      });
      setAnalysisHints({
        kind: result.selectSuggestions.kind,
        department: result.selectSuggestions.department,
      });
      setFormData((previous) => applyCourrierAnalysis(previous, result));
      const analyzedName = getAnalyzedCourrierFileName(result, currentCustomName, file);
      void checkFileNameDuplication(analyzedName, file);
      if (result.confidence > 0) {
        showErrorNotification(`Document analysé (${result.confidence}% de confiance)`, 'info');
      }
    } catch (error: unknown) {
      logError('analyzeDocument', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    analyzeCourrier,
    checkFileNameDuplication,
    fieldOptions.department.options,
    fieldOptions.kind.options,
  ]);

  const handleFileUpload = useCallback((file: File): void => {
    const validation = validateCourrierFile(file);
    if (!validation.isValid) {
      showErrorNotification(validation.errorMessage, 'warning');
      return;
    }

    const baseName = getCourrierFileBaseName(file.name);
    const customName = formData.customFileName || baseName;
    setFormData((previous) => ({
      ...previous,
      fichierJoint: file,
      customFileName: previous.customFileName || baseName,
    }));
    void analyzeDocument(file, customName);
    void checkFileNameDuplication(customName, file);
  }, [analyzeDocument, checkFileNameDuplication, formData.customFileName]);

  const handleInputChange = useCallback((event: TextFormEvent): void => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  }, []);

  const handleInputBlur = useCallback((event: TextFormFocusEvent): void => {
    const { name, value } = event.target;
    const trimmedValue = value.trim();
    setFormData((previous) => ({ ...previous, [name]: trimmedValue }));
    if (name === 'customFileName') {
      void checkFileNameDuplication(trimmedValue, formData.fichierJoint);
    }
  }, [checkFileNameDuplication, formData.fichierJoint]);

  const handleSelectChange = useCallback((
    selectedOption: { value: string; label: string } | null,
    name: SelectFieldName,
  ): void => {
    if (!selectedOption) return;
    setFormData((previous) => ({ ...previous, [name]: selectedOption.value }));
  }, []);

  const handleCreatableChange = useCallback((name: CreatableFieldName, value: string): void => {
    setFormData((previous) => ({ ...previous, [name]: value }));
  }, []);

  const handleDrag = useCallback((event: DragEvent<HTMLElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(event.type === 'dragenter' || event.type === 'dragover');
  }, []);

  const handleDrop = useCallback((event: DragEvent<HTMLElement>): void => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    const file = event.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleFileInput = useCallback((event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const removeFile = useCallback((): void => {
    nameCheckSequenceRef.current += 1;
    setFormData((previous) => ({ ...previous, fichierJoint: undefined }));
    setAnalysisHints({ ...EMPTY_COURRIER_ANALYSIS_HINTS });
    setDuplicateNameError(null);
    setIsCheckingName(false);
    setFileInputVersion((current) => current + 1);
  }, []);

  const handleSubmit = useCallback(async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    const validation = validateCourrierForm(formData);
    if (!validation.isValid) {
      showErrorNotification(validation.errorMessage, 'warning');
      return;
    }

    const file = formData.fichierJoint;
    if (!file) return;
    const finalFileName = buildCourrierFinalFileName(formData.customFileName, file);
    const duplicateExists = await checkFileNameDuplication(formData.customFileName, file);
    if (duplicateExists) {
      showErrorNotification(`Un courrier avec le nom "${finalFileName}" existe déjà`, 'warning');
      return;
    }

    try {
      await uploadCourrier(file, buildCourrierUploadData(formData));
      showErrorNotification('Courrier créé avec succès', 'info');
      void navigate('/mail/list');
    } catch (error: unknown) {
      logError('handleSubmit - uploadCourrier', error);
      showErrorNotification(handleCourrierUploadError(error));
    }
  }, [checkFileNameDuplication, formData, navigate, uploadCourrier]);

  const handleCancel = useCallback((): void => {
    void navigate('/mail');
  }, [navigate]);

  return {
    analysisHints,
    departmentSuggestion: getCourrierSuggestionMessage('Service', analysisHints.department),
    dragActive,
    duplicateNameError,
    fieldOptions,
    fileInputVersion,
    fileSizeLabel: formData.fichierJoint ? formatFileSize(formData.fichierJoint.size) : null,
    formData,
    handleCancel,
    handleCreatableChange,
    handleDrag,
    handleDrop,
    handleFileInput,
    handleInputBlur,
    handleInputChange,
    handleSelectChange,
    handleSubmit,
    isAnalyzing,
    isCheckingName,
    isLoading,
    kindSuggestion: getCourrierSuggestionMessage('Type', analysisHints.kind),
    removeFile,
    submitDisabled: isNouveauCourrierSubmitDisabled(
      formData,
      isLoading,
      isCheckingName,
      duplicateNameError,
    ),
  };
}

export type NouveauCourrierViewModel = ReturnType<typeof useNouveauCourrierView>;
