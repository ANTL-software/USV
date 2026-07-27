import { useNavigate } from 'react-router-dom';
import { useSocialPublication } from './useSocialPublication.ts';

export function useSocialPublicationView() {
  const navigate = useNavigate();
  return { socialPublication: useSocialPublication(), navigateBack: () => void navigate('/commercial') };
}
