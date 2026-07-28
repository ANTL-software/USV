export type SocialPlatform = 'facebook' | 'instagram' | 'linkedin';
export type SocialDraftStatus = 'brouillon' | 'valide' | 'programme' | 'publie' | 'echec_publication' | 'annule';
export type SocialPlatformState = 'ready' | 'configuration_required' | 'disabled';

export interface SocialReadinessCheck {
  verified: boolean;
  configured?: boolean;
  note?: string;
  name?: string;
  pageName?: string | null;
  username?: string | null;
}

export interface SocialReadinessSnapshot {
  checkedAt: string;
  success: boolean;
  checks?: Partial<Record<SocialPlatform | 'googleDrive', SocialReadinessCheck>>;
  error?: string;
}

export interface SocialEditorialDraft {
  id_brouillon_reseau_social: string;
  sujet: string;
  categorie: 'institutionnelle' | 'valeur' | 'humaine' | 'actualite' | 'service';
  plateformes: SocialPlatform[];
  textes: Record<SocialPlatform, string>;
  visuel_drive_id: string | null;
  visuel_url: string | null;
  visuel_notes: string | null;
  statut: SocialDraftStatus;
  date_souhaitee: string | null;
  programme_pour: string | null;
  valide_le: string | null;
  publie_le: string | null;
  programmation: {
    scheduledAt?: string;
    rescheduledAt?: string;
    scheduledBy?: string;
  } | null;
  annulation: {
    cancelledAt?: string;
    reviewer?: string;
  } | null;
  dernier_controle: SocialReadinessSnapshot | null;
  resultats_publication: Partial<Record<SocialPlatform, {
    success: boolean;
    postId?: string;
    error?: string;
  }>> | null;
  derniere_erreur: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocialVisual {
  fileId: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  webViewLink: string;
  directViewUrl: string;
  folder: string;
}

export interface SocialPlatformStatus {
  active: boolean;
  state: SocialPlatformState;
  label: string;
  detail: string;
}

export interface SocialPublicationPackage {
  packageId: string;
  draftId: string;
  platform: SocialPlatform;
  workflowStatus: string;
  preparedAt: string;
  approval: { mehdi: boolean; nelly: boolean };
  mediaPresent: boolean;
  published: boolean;
  anomalies: string[];
}

export type SocialPublicationHistoryStatus = 'scheduled' | 'published' | 'failed';

export interface SocialPublicationHistoryEntry {
  draftId: string;
  subject: string;
  category: SocialEditorialDraft['categorie'];
  platform: SocialPlatform;
  scheduledAt: string | null;
  processedAt: string | null;
  status: SocialPublicationHistoryStatus;
  postId: string | null;
  error: string | null;
  createdBy: string | null;
  validatedBy: string | null;
  scheduledBy: string | null;
}

export interface SocialPublicationHistoryPage {
  items: SocialPublicationHistoryEntry[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SocialPublicationDetail extends SocialEditorialDraft {
  visuel_apercu_url: string | null;
}

export interface SocialWorkflowStage {
  key: 'review' | 'schedule' | 'archive';
  label: string;
  connected: boolean;
}

export interface SocialPublicationStatus {
  checkedAt: string;
  policy: {
    automaticPublishing: boolean;
    approvalOrder: string[];
    humanConfirmationRequired: boolean;
    note: string;
  };
  summary: {
    readyPlatforms: number;
    totalPlatforms: number;
    preparedPackages: number;
    anomalies: number;
  };
  platforms: Record<string, SocialPlatformStatus>;
  workflow: {
    updatedAt: string | null;
    stages: SocialWorkflowStage[];
  };
  packages: SocialPublicationPackage[];
}

export interface SocialDraftInput {
  sujet: string;
  categorie: SocialEditorialDraft['categorie'];
  plateformes: SocialPlatform[];
  textes: Record<SocialPlatform, string>;
  date_souhaitee: string | null;
  visuel_drive_id: string | null;
  visuel_url: string | null;
  visuel_notes: string | null;
}
