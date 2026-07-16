import { useMemo } from 'react';
import {
  buildProspectDetailPresentation,
  PROSPECT_DETAIL_STATUS_OPTIONS,
  PROSPECT_DETAIL_TYPE_OPTIONS,
} from '../utils/scripts/index.ts';
import type { Prospect } from '../utils/types/index.ts';
import { useProspectEditor } from './useProspectEditor.ts';

export function useProspectDetailView(
  prospect: Prospect | null,
  onClose: () => void,
  onProspectUpdated: (prospect: Prospect) => void,
) {
  const editor = useProspectEditor(prospect, onProspectUpdated);
  const presentation = useMemo(
    () => prospect ? buildProspectDetailPresentation(prospect) : null,
    [prospect],
  );
  return {
    ...editor,
    close: editor.isEditing ? editor.cancelEditing : onClose,
    presentation,
    prospect,
    statusOptions: PROSPECT_DETAIL_STATUS_OPTIONS,
    typeOptions: PROSPECT_DETAIL_TYPE_OPTIONS,
  };
}

export type ProspectDetailViewModel = ReturnType<typeof useProspectDetailView>;
