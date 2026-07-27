import { useNavigate } from 'react-router-dom';
import { useSocialPublicationHistory } from './useSocialPublicationHistory.ts';

export function useSocialPublicationHistoryView() {
  const navigate = useNavigate();
  return {
    history: useSocialPublicationHistory(),
    navigateBack: () => void navigate('/commercial/publications-reseaux-sociaux'),
  };
}
