export type SocialPlatform = 'facebook' | 'instagram' | 'linkedin';
export type SocialDraftStatus = 'brouillon' | 'valide' | 'programme' | 'publie' | 'echec_publication' | 'annule';

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
  programme_pour: string | null;
  created_at: string;
}

export interface SocialVisual { fileId: string; name: string; mimeType: string; modifiedTime: string; webViewLink: string; }
export interface SocialPlatformStatus { active: boolean; state: 'ready' | 'configuration_required'; label: string; }
export interface SocialDraftInput { sujet: string; categorie: SocialEditorialDraft['categorie']; plateformes: SocialPlatform[]; textes: Record<SocialPlatform, string>; visuel_drive_id: string | null; visuel_url: string | null; visuel_notes: string | null; }
