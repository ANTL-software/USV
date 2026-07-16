import type { EmailComposerCopy, EmailComposerForm, EmailData, ICourrier } from '../types/index.ts';

const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function getEmailDefaultSubject(courrier: ICourrier | null, bulkMode: boolean, selectedCount: number): string {
  if (bulkMode) return `Envoi groupé: ${selectedCount} courrier${selectedCount > 1 ? 's' : ''}`;
  return courrier ? `Courrier: ${courrier.fileName}` : '';
}

export function createEmailComposerForm(courrier: ICourrier | null, bulkMode: boolean, selectedCount: number): EmailComposerForm {
  return { error: '', message: '', subject: getEmailDefaultSubject(courrier, bulkMode, selectedCount), to: '' };
}

export function validateEmailComposer(form: EmailComposerForm, courrier: ICourrier | null, bulkMode: boolean, selectedCount: number): { data: EmailData | null; error: string | null } {
  const to = form.to.trim();
  const subject = form.subject.trim();
  if (!to) return { data: null, error: "L'adresse email du destinataire est requise" };
  if (to.length > 254 || to.includes('..') || to.startsWith('.') || to.endsWith('.') || !EMAIL_PATTERN.test(to)) {
    return { data: null, error: "L'adresse email n'est pas valide. Veuillez vérifier le format (ex: nom@domaine.com)" };
  }
  if (!subject) return { data: null, error: 'Le sujet est requis' };
  if (subject.length > 200) return { data: null, error: 'Le sujet ne peut pas dépasser 200 caractères' };
  if (bulkMode && selectedCount === 0) return { data: null, error: "Aucun courrier sélectionné pour l'envoi groupé" };
  if (!bulkMode && !courrier) return { data: null, error: 'Aucun courrier à envoyer' };
  return { data: { to, subject, message: form.message.trim() }, error: null };
}

export function getEmailSendErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (!(error instanceof Error)) return "Erreur lors de l'envoi de l'email";
  const message = error.message.toLowerCase();
  if (error.name === 'NetworkError' || message.includes('fetch')) return 'Erreur de connexion. Vérifiez votre connexion internet et réessayez.';
  if (message.includes('timeout')) return "L'envoi a pris trop de temps. Réessayez dans quelques instants.";
  if (message.includes('401') || message.includes('unauthorized')) return 'Session expirée. Veuillez vous reconnecter.';
  if (message.includes('403') || message.includes('forbidden')) return "Vous n'avez pas l'autorisation d'envoyer cet email.";
  if (message.includes('404')) return 'Courrier non trouvé ou supprimé.';
  if (message.includes('413') || message.includes('too large')) return 'Le courrier est trop volumineux pour être envoyé par email.';
  if (message.includes('503') || message.includes('email non configuré')) return "Service email temporairement indisponible. Contactez l'administrateur.";
  return error.message;
}

export function getEmailComposerCopy(bulkMode: boolean, selectedCount: number): EmailComposerCopy {
  const plural = selectedCount > 1 ? 's' : '';
  return {
    title: bulkMode ? `Envoi groupé (${selectedCount} courrier${plural})` : 'Envoyer par email',
    sendLabel: bulkMode ? `Envoyer ${selectedCount} courrier${plural}` : 'Envoyer',
    sendingLabel: bulkMode ? 'Envoi groupé en cours...' : 'Envoi...',
    information: bulkMode
      ? `Les ${selectedCount} courriers seront envoyés en pièces jointes dans un seul email avec un modèle automatique.`
      : "Le courrier sera envoyé en pièce jointe avec un modèle d'email automatique. Votre note personnelle sera ajoutée si elle est renseignée.",
  };
}
