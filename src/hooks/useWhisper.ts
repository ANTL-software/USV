import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { Device, Call } from '@twilio/voice-sdk';
import { getRequest, postRequest } from '../API/APICalls';
import { UserContext } from '../context/user/index.ts';

interface WhisperResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    conference_name: string;
    call_sid_to_coach: string;
  };
}

interface TwilioTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    identity: string;
  };
}

export const useWhisper = () => {
  const userContext = useContext(UserContext);
  const logout = userContext?.logout;
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Mute par défaut à l'entrée
  const [duration, setDuration] = useState(0);
  const [agentName, setAgentName] = useState<string | null>(null);
  const [activeAppelId, setActiveAppelId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const deviceRef = useRef<Device | null>(null);
  const callRef = useRef<Call | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tokenRefreshPromiseRef = useRef<Promise<boolean> | null>(null);
  const recoveryPromiseRef = useRef<Promise<boolean> | null>(null);
  const isForceLogoutInProgressRef = useRef<boolean>(false);

  const getErrorMessage = useCallback((value: unknown): string => {
    if (value instanceof Error) {
      return value.message;
    }

    if (typeof value === 'object' && value !== null && 'message' in value && typeof value.message === 'string') {
      return value.message;
    }

    return 'Erreur inconnue';
  }, []);

  const startTimer = useCallback(() => {
    setDuration(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const disconnectWhisper = useCallback(() => {
    console.log('[WHISPER] Déconnexion demandée');
    stopTimer();
    
    if (callRef.current) {
      callRef.current.disconnect();
      callRef.current = null;
    }

    if (deviceRef.current) {
      deviceRef.current.removeAllListeners();
      deviceRef.current.destroy();
      deviceRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setIsMuted(true);
    setAgentName(null);
    setActiveAppelId(null);
    tokenRefreshPromiseRef.current = null;
    recoveryPromiseRef.current = null;
  }, [stopTimer]);

  const forceLogoutForTwilioFailure = useCallback(async (reason: string) => {
    if (isForceLogoutInProgressRef.current) {
      return;
    }

    isForceLogoutInProgressRef.current = true;
    console.error(`[WHISPER] Session Twilio irrécupérable (${reason}) - déconnexion forcée`);

    try {
      disconnectWhisper();
      setError('La connexion Twilio a expiré. Merci de vous reconnecter.');
      await logout?.();
    } catch (error) {
      console.error('[WHISPER] Erreur lors de la déconnexion forcée:', error);
    } finally {
      isForceLogoutInProgressRef.current = false;
    }
  }, [disconnectWhisper, logout]);

  const refreshDeviceToken = useCallback(async (device: Device, source: string): Promise<boolean> => {
    if (tokenRefreshPromiseRef.current) {
      return tokenRefreshPromiseRef.current;
    }

    tokenRefreshPromiseRef.current = (async () => {
      try {
        console.log(`[WHISPER] Rafraîchissement du token (${source})...`);
        const response = await getRequest('/twilio/token');
        const payload = response.data as TwilioTokenResponse;
        const accessToken = payload?.data?.accessToken;

        if (!accessToken) {
          throw new Error('Token Twilio manquant');
        }

        await device.updateToken(accessToken);
        console.log(`[WHISPER] Token rafraîchi (${source})`);
        return true;
      } catch (error) {
        console.error(`[WHISPER] Échec du rafraîchissement du token (${source}):`, error);
        return false;
      } finally {
        tokenRefreshPromiseRef.current = null;
      }
    })();

    return tokenRefreshPromiseRef.current;
  }, []);

  const recoverDeviceRegistration = useCallback(async (device: Device, source: string): Promise<boolean> => {
    if (recoveryPromiseRef.current) {
      return recoveryPromiseRef.current;
    }

    recoveryPromiseRef.current = (async () => {
      const refreshed = await refreshDeviceToken(device, source);
      if (!refreshed) {
        await forceLogoutForTwilioFailure(`${source}:token-refresh-failed`);
        return false;
      }

      try {
        if (device.state !== 'registered' && device.state !== 'registering') {
          console.log(`[WHISPER] Tentative de reconnexion (${source})...`);
          await device.register();
        }

        return true;
      } catch (error) {
        console.error(`[WHISPER] Échec de reconnexion (${source}):`, error);
        await forceLogoutForTwilioFailure(`${source}:register-failed`);
        return false;
      } finally {
        recoveryPromiseRef.current = null;
      }
    })();

    return recoveryPromiseRef.current;
  }, [forceLogoutForTwilioFailure, refreshDeviceToken]);

  const startWhisper = useCallback(async (idAppel: number, agentNom: string) => {
    if (isConnecting || isConnected) {
      console.warn('[WHISPER] Déjà en cours de connexion ou connecté');
      return;
    }

    setIsConnecting(true);
    setError(null);
    setAgentName(agentNom);
    setActiveAppelId(idAppel);
    setIsMuted(true); // S'assurer qu'on commence MUTE par défaut

    try {
      // 1. Demander le token et la redirection de l'appel au backend Olympe
      console.log(`[WHISPER] Envoi POST /supervision/whisper pour l'appel #${idAppel}`);
      const response = await postRequest<{ id_appel: number }, WhisperResponse>('/supervision/whisper', {
        id_appel: idAppel
      });

      const { token, conference_name, call_sid_to_coach } = response.data.data;

      // 2. Initialiser le Twilio Device
      console.log('[WHISPER] Initialisation du Twilio Device superviseur');
      const device = new Device(token);
      deviceRef.current = device;

      // 3. Configurer les event handlers sur le Device
      device.on('registered', async () => {
        console.log('✅ [WHISPER] Device registered, attente de la transition des lignes...');
        try {
          const call = await device.connect({
            params: {
              mode: 'coach',
              conferenceName: conference_name,
              callSidToCoach: call_sid_to_coach
            }
          });

          if (!call) {
            throw new Error('device.connect() a retourné null');
          }

          callRef.current = call;

          // Configurer les events sur le call
          call.on('accept', () => {
            console.log('✅ [WHISPER] Appel accepté par Twilio (connecté à la conférence)');
            setIsConnected(true);
            setIsConnecting(false);
            
            // Par défaut, on force le mute au join de la conférence
            call.mute(true);
            setIsMuted(true);
            
            startTimer();
          });

          call.on('disconnect', () => {
            console.log('📞 [WHISPER] Conférence déconnectée');
            disconnectWhisper();
          });

          call.on('error', (callErr) => {
            console.error('❌ [WHISPER] Erreur Call:', callErr);
            setError(`Erreur d'appel Twilio : ${callErr.message}`);
            disconnectWhisper();
          });

        } catch (connErr: unknown) {
          console.error('[WHISPER] Erreur lors de device.connect:', connErr);
          setError(`Impossible de se connecter au canal audio : ${getErrorMessage(connErr)}`);
          disconnectWhisper();
        }
      });

      device.on('error', (deviceErr) => {
        console.error('❌ [WHISPER] Erreur Device:', deviceErr);
        setError(`Erreur de périphérique Twilio : ${deviceErr.message}`);
        disconnectWhisper();
      });

      device.on('tokenWillExpire', () => {
        console.warn('⚠️ [WHISPER] Token va expirer');
        void refreshDeviceToken(device, 'tokenWillExpire').then((refreshed) => {
          if (!refreshed) {
            void forceLogoutForTwilioFailure('tokenWillExpire');
          }
        });
      });

      device.on('unregistered', () => {
        console.warn('⚠️ [WHISPER] Device unregistered');
        void recoverDeviceRegistration(device, 'unregistered');
      });

      // Lancer l'enregistrement
      await device.register();

    } catch (err: unknown) {
      console.error('[WHISPER] Échec initialisation soufflé:', err);
      const apiMessage = (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof err.response === 'object' &&
        err.response !== null &&
        'data' in err.response &&
        typeof err.response.data === 'object' &&
        err.response.data !== null &&
        'message' in err.response.data &&
        typeof err.response.data.message === 'string'
      ) ? err.response.data.message : null;
      const msg = apiMessage || getErrorMessage(err);
      setError(`Impossible d'initier le soufflé : ${msg}`);
      setIsConnecting(false);
      setAgentName(null);
      setActiveAppelId(null);
    }
  }, [disconnectWhisper, forceLogoutForTwilioFailure, getErrorMessage, isConnected, isConnecting, recoverDeviceRegistration, refreshDeviceToken, startTimer]);

  const toggleMute = useCallback(() => {
    if (!callRef.current || !isConnected) return;
    const nextMuteState = !isMuted;
    callRef.current.mute(nextMuteState);
    setIsMuted(nextMuteState);
    console.log(`[WHISPER] Superviseur ${nextMuteState ? 'MUTE (Écoute)' : 'UNMUTE (Soufflé)'}`);
  }, [isMuted, isConnected]);

  // Nettoyage automatique au démontage du hook
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      // Ne pas déconnecter silencieusement pour éviter de couper sans le vouloir si le state change,
      // mais détruire pour éviter les fuites de listeners.
    };
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    startWhisper,
    disconnectWhisper,
    toggleMute,
    isConnecting,
    isConnected,
    isMuted,
    duration,
    agentName,
    activeAppelId,
    error,
    clearError
  };
};
