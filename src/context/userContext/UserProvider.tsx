// Aligné avec script/src/context/userContext/UserProvider.tsx
// Différence : auth par cookies httpOnly (pas de hasValidToken/localStorage)
import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Employe, LoginCredentials } from '../../utils/types/user.types.ts';
import { UserContext } from './UserContext.tsx';
import { loginService, getCurrentUserService, logoutService } from '../../API/services/auth.service.ts';

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<Employe | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!user;

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        // Avec les cookies httpOnly, on tente directement /auth/me
        // Le cookie est envoyé automatiquement si présent
        const userModel = await getCurrentUserService();
        setUser(userModel.toJSON());
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      const userModel = await loginService(credentials);
      setUser(userModel.toJSON());
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de la connexion';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      await logoutService();
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    } finally {
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const userModel = await getCurrentUserService();
      setUser(userModel.toJSON());
    } catch (err) {
      console.error('Erreur lors du rafraîchissement:', err);
      setUser(null);
      await logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshUser,
    clearError,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
