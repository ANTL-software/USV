import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleAuthError } from '../utils/scripts/index.ts';
import { useUserContext } from './useUserContext.ts';

export function useSignInForm() {
  const navigate = useNavigate();
  const { isLoading, login, user } = useUserContext();
  const [identifiant, setIdentifiant] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { if (user) void navigate('/home'); }, [navigate, user]);
  const submit = useCallback(async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setError('');
    try { await login({ identifiant, password }); } catch (loginError) { setError(handleAuthError(loginError)); }
  }, [identifiant, login, password]);
  return { error, identifiant, isLoading, password, setIdentifiant, setPassword, submit };
}

export type SignInFormViewModel = ReturnType<typeof useSignInForm>;
