import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/scripts/index.ts';
import { useNotesDirection } from './useNotesDirection.ts';

export function useNotesDirectionPage() {
  const navigate = useNavigate();
  return {
    ...useNotesDirection(),
    formatNoteDate: formatDate,
    navigateBack: () => void navigate('/commerciaux'),
  };
}

export type NotesDirectionPageViewModel = ReturnType<typeof useNotesDirectionPage>;
