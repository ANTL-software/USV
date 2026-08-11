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

export interface AsteriskIceServer {
  urls: string[];
  username?: string;
  credential?: string;
}

export interface AsteriskSipSession {
  uri: string;
  authorizationUsername: string;
  authorizationPassword: string;
  webSocketUrl: string;
  domain: string;
}

export interface AsteriskTelephonySession {
  provider: 'asterisk';
  sip: AsteriskSipSession;
  iceServers: AsteriskIceServer[];
  expiresAt: string;
}

export interface TwilioWhisperSession {
  provider: 'twilio';
  token: string;
  conference_name: string;
  call_sid_to_coach: string;
}

export interface AsteriskWhisperSession {
  provider: 'asterisk';
  session: AsteriskTelephonySession;
  destination: string;
  coaching_ticket: string;
}

export type WhisperSession = TwilioWhisperSession | AsteriskWhisperSession;

export interface TelephonyProviderReadiness {
  configured: boolean;
  missingVariables: string[];
  browserConfigured?: boolean;
  trunkConfigured?: boolean;
  simulationMode?: boolean;
}

export interface TelephonyOperationsConfiguration {
  provider: TelephonyProvider;
  providers: Record<TelephonyProvider, TelephonyProviderReadiness>;
  activeConfiguration: TelephonyConfiguration;
  trunkConfiguration: TelephonyTrunkConfiguration;
  activationScope: 'live-idle-sessions';
}

export interface UpdateTelephonyProvider {
  provider: TelephonyProvider;
}

export type TelephonyTrunkProvider = 'boxip' | 'evenmedia' | 'custom';
export type TelephonyTrunkDistributionMode = 'single_account' | 'credential_pool';
export type TelephonyTrunkAuthMode = 'registration' | 'ip';
export type TelephonyTrunkApplyStatus = 'not_configured' | 'pending' | 'applying' | 'applied' | 'failed';

export interface TelephonyTrunkAccount {
  id: string;
  label: string;
  username: string;
  password?: string;
  channelLimit: number;
  priority: number;
  enabled: boolean;
  hasPassword: boolean;
}

export interface TelephonyTrunkRuntimeAccount {
  endpoint: string;
  label: string;
  state: string;
  activeChannels: number;
  channelLimit: number;
}

export interface TelephonyTrunkRuntime {
  available: boolean;
  healthy: boolean;
  activeChannels: number;
  accounts: TelephonyTrunkRuntimeAccount[];
  message: string;
}

export interface TelephonyTrunkEvent {
  id: string;
  type: 'configuration_saved' | 'apply_started' | 'apply_succeeded' | 'apply_failed';
  status: string;
  message: string;
  employeeId: number | null;
  createdAt: string;
}

export interface TelephonyTrunkConfiguration {
  provider: TelephonyTrunkProvider;
  distributionMode: TelephonyTrunkDistributionMode;
  authMode: TelephonyTrunkAuthMode;
  sipServer: string;
  sipPort: number;
  transport: 'udp';
  fromDomain: string;
  callerId: string;
  contactUser: string;
  maxChannels: number;
  enabled: boolean;
  applyStatus: TelephonyTrunkApplyStatus;
  lastAppliedAt: string | null;
  lastError: string | null;
  accounts: TelephonyTrunkAccount[];
  runtime: TelephonyTrunkRuntime | null;
  events: TelephonyTrunkEvent[];
}

export interface SaveTelephonyTrunkAccount {
  id: string;
  label: string;
  username: string;
  password?: string;
  channelLimit: number;
  enabled: boolean;
}

export interface SaveTelephonyTrunkConfiguration {
  provider: TelephonyTrunkProvider;
  distributionMode: TelephonyTrunkDistributionMode;
  authMode: TelephonyTrunkAuthMode;
  sipServer: string;
  sipPort: number;
  fromDomain: string;
  callerId: string;
  contactUser: string;
  maxChannels: number;
  enabled: boolean;
  accounts: SaveTelephonyTrunkAccount[];
}

export interface TelephonyTrunkForm {
  provider: TelephonyTrunkProvider;
  distributionMode: TelephonyTrunkDistributionMode;
  authMode: TelephonyTrunkAuthMode;
  sipServer: string;
  sipPort: number;
  fromDomain: string;
  callerId: string;
  contactUser: string;
  maxChannels: number;
  enabled: boolean;
  accounts: TelephonyTrunkAccount[];
}
