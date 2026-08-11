import { Web } from 'sip.js';

import type { AsteriskWhisperSession } from '../../utils/types/index.ts';

export interface AsteriskWhisperCallbacks {
  onConnected: () => void;
  onDisconnected: () => void;
  onError: (error: Error) => void;
}

export class AsteriskWhisperClient {
  private simpleUser: Web.SimpleUser | null = null;
  private isDisconnecting = false;

  public async connect(
    coaching: AsteriskWhisperSession,
    remoteAudio: HTMLAudioElement,
    callbacks: AsteriskWhisperCallbacks,
  ): Promise<void> {
    if (this.simpleUser) {
      throw new Error('Une session de coaching Asterisk est déjà active');
    }

    const peerConnectionConfiguration: RTCConfiguration = {
      iceServers: coaching.session.iceServers.map((iceServer) => ({
        urls: iceServer.urls,
        ...(iceServer.username ? { username: iceServer.username } : {}),
        ...(iceServer.credential ? { credential: iceServer.credential } : {}),
      })),
    };
    const options: Web.SimpleUserOptions = {
      aor: coaching.session.sip.uri,
      delegate: {
        onCallAnswered: () => {
          this.setMuted(true);
          callbacks.onConnected();
        },
        onCallHangup: () => {
          if (!this.isDisconnecting) callbacks.onDisconnected();
        },
        onServerDisconnect: (error) => {
          if (!this.isDisconnecting) callbacks.onError(error || new Error('Connexion Asterisk interrompue'));
        },
      },
      media: {
        constraints: { audio: true, video: false },
        remote: { audio: remoteAudio },
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 4,
      userAgentOptions: {
        authorizationUsername: coaching.session.sip.authorizationUsername,
        authorizationPassword: coaching.session.sip.authorizationPassword,
        logBuiltinEnabled: import.meta.env.DEV,
        logConfiguration: false,
        sessionDescriptionHandlerFactoryOptions: { peerConnectionConfiguration },
        userAgentString: 'ANTL-USV-Asterisk-Coaching',
      },
    };

    const simpleUser = new Web.SimpleUser(coaching.session.sip.webSocketUrl, options);
    this.simpleUser = simpleUser;
    this.isDisconnecting = false;

    try {
      await simpleUser.connect();
      await simpleUser.register();
      await simpleUser.call(`sip:${coaching.destination}@${coaching.session.sip.domain}`, {
        earlyMedia: false,
        extraHeaders: [`X-ANTL-Coaching-Ticket: ${coaching.coaching_ticket}`],
        sessionDescriptionHandlerOptions: {
          constraints: { audio: true, video: false },
        },
      });
    } catch (error) {
      await this.disconnect();
      throw error;
    }
  }

  public setMuted(muted: boolean): void {
    for (const track of this.simpleUser?.localMediaStream?.getAudioTracks() || []) {
      track.enabled = !muted;
    }
  }

  public async disconnect(): Promise<void> {
    const simpleUser = this.simpleUser;
    this.simpleUser = null;
    if (!simpleUser) return;

    this.isDisconnecting = true;
    await simpleUser.hangup().catch(() => undefined);
    await simpleUser.unregister().catch(() => undefined);
    await simpleUser.disconnect().catch(() => undefined);
    this.isDisconnecting = false;
  }
}
