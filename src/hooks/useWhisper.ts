import { useState, useEffect, useRef, useCallback } from 'react';
import { Device, Call } from '@twilio/voice-sdk';
import { postRequest } from '../API/APICalls';

interface WhisperResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    conference_name: string;
    agent_call_sid: string;
  };
}

export const useWhisper = () => {
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
  }, [stopTimer]);

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
      const response = await postRequest<any, WhisperResponse>('/supervision/whisper', {
        id_appel: idAppel
      });

      const { token, conference_name, agent_call_sid } = response.data.data;

      // 2. Initialiser le Twilio Device
      console.log('[WHISPER] Initialisation du Twilio Device superviseur');
      const device = new Device(token);
      deviceRef.current = device;

      // 3. Configurer les event handlers sur le Device
      device.on('registered', async () => {
        console.log('✅ [WHISPER] Device registered, lancement de l\'appel');
        try {
          // 4. Établir la connexion avec les paramètres de conférence
          const call = await device.connect({
            params: {
              conferenceName: conference_name,
              agentCallSid: agent_call_sid
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

        } catch (connErr: any) {
          console.error('[WHISPER] Erreur lors de device.connect:', connErr);
          setError(`Impossible de se connecter au canal audio : ${connErr.message}`);
          disconnectWhisper();
        }
      });

      device.on('error', (deviceErr) => {
        console.error('❌ [WHISPER] Erreur Device:', deviceErr);
        setError(`Erreur de périphérique Twilio : ${deviceErr.message}`);
        disconnectWhisper();
      });

      // Lancer l'enregistrement
      await device.register();

    } catch (err: any) {
      console.error('[WHISPER] Échec initialisation soufflé:', err);
      const msg = err.response?.data?.message || err.message || 'Erreur inconnue';
      setError(`Impossible d'initier le soufflé : ${msg}`);
      setIsConnecting(false);
      setAgentName(null);
    }
  }, [isConnecting, isConnected, disconnectWhisper, startTimer]);

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
