import type { SocialDraftInput, SocialDraftStatus, SocialPlatform } from '../../../utils/types/index.ts';

export type SocialSelectOption<T extends string> = { label: string; value: T };

export const platformLabels: Record<SocialPlatform, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
};

export const categoryLabels: Record<SocialDraftInput['categorie'], string> = {
  valeur: 'Valeur',
  service: 'Service',
  institutionnelle: 'Institutionnelle',
  humaine: 'Humaine',
  actualite: 'Actualité',
};

export const statusLabels: Record<SocialDraftStatus, string> = {
  brouillon: 'Brouillon',
  valide: 'Prêt à programmer',
  programme: 'Programmé',
  publie: 'Publié',
  echec_publication: 'Publication en échec',
  annule: 'Annulé',
};

export const categoryOptions: SocialSelectOption<SocialDraftInput['categorie']>[] = Object.entries(categoryLabels)
  .map(([value, label]) => ({ value: value as SocialDraftInput['categorie'], label }));

export const platformOptions: SocialSelectOption<SocialPlatform>[] = Object.entries(platformLabels)
  .map(([value, label]) => ({ value: value as SocialPlatform, label }));

export const emptySocialText: Record<SocialPlatform, string> = {
  facebook: '',
  instagram: '',
  linkedin: '',
};

export const formatSocialDate = (value: string | null | undefined): string => {
  if (!value) return 'À définir';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'À définir';
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

export const toLocalDateTimeValue = (value: string | null | undefined): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export const localDateTimeToIso = (value: string): string => {
  if (!value) throw new Error('Choisissez une date et une heure.');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error('La date saisie est invalide.');
  return date.toISOString();
};
