export type TelephonyProvider = 'twilio' | 'asterisk';

export interface TelephonyConfiguration {
  provider: TelephonyProvider;
  configured: boolean;
  browserClientAvailable: boolean;
  transport: {
    kind: 'twilio-sdk' | 'sip-wss';
    webSocketUrl: string | null;
    sipDomain: string | null;
  };
  capabilities: {
    outboundCalls: boolean;
    incomingCalls: boolean;
    supervisorWhisper: boolean;
    answeringMachineDetection: boolean;
    recording: boolean;
  };
}

export interface TelephonyProviderReadiness {
  configured: boolean;
  missingVariables: string[];
}

export interface TelephonyOperationsConfiguration {
  provider: TelephonyProvider;
  providers: Record<TelephonyProvider, TelephonyProviderReadiness>;
  activeConfiguration: TelephonyConfiguration;
  activationScope: 'new-browser-sessions';
}

export interface UpdateTelephonyProvider {
  provider: TelephonyProvider;
}
