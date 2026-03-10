import { useContext } from 'react';
import { UserContext } from '../context/user/UserContext.tsx';
import type { UserContextType } from '../context/user/UserContext.tsx';

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
