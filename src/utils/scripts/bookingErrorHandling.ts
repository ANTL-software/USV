interface AxiosError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      success?: boolean;
    };
  };
  message?: string;
}

const isAxiosError = (error: unknown): error is AxiosError =>
  typeof error === 'object' && error !== null && 'response' in error;

// ============================================
// Chargement des réservations
// ============================================
export const handleBookingLoadError = (error: unknown): string => {
  if (isAxiosError(error)) {
    switch (error.response?.status) {
      case 401: return "Votre session a expiré. Veuillez vous reconnecter.";
      case 403: return "Vous n'avez pas accès aux réservations.";
      case 500: return "Le serveur rencontre un problème. Réessayez dans quelques instants.";
    }
    if (error.response?.data?.message) return error.response.data.message;
  }
  return "Impossible de charger les réservations. Vérifiez votre connexion.";
};

// ============================================
// Création d'une réservation
// ============================================
export const handleBookingCreateError = (error: unknown): string => {
  if (isAxiosError(error)) {
    switch (error.response?.status) {
      case 400: return "Les informations saisies sont incorrectes. Vérifiez le formulaire.";
      case 401: return "Votre session a expiré. Veuillez vous reconnecter.";
      case 404: return "L'employé sélectionné est introuvable.";
      case 409: return error.response?.data?.message || "Cette journée est complète ou cet employé est déjà réservé.";
      case 500: return "Le serveur rencontre un problème. Réessayez dans quelques instants.";
    }
    if (error.response?.data?.message) return error.response.data.message;
  }
  return "La réservation n'a pas pu être créée. Vérifiez votre connexion et réessayez.";
};

// ============================================
// Annulation d'une réservation
// ============================================
export const handleBookingCancelError = (error: unknown): string => {
  if (isAxiosError(error)) {
    switch (error.response?.status) {
      case 401: return "Votre session a expiré. Veuillez vous reconnecter.";
      case 403: return "Vous n'êtes pas autorisé à annuler cette réservation.";
      case 404: return "Cette réservation est introuvable ou a déjà été annulée.";
      case 500: return "Le serveur rencontre un problème. Réessayez dans quelques instants.";
    }
    if (error.response?.data?.message) return error.response.data.message;
  }
  return "L'annulation a échoué. Vérifiez votre connexion et réessayez.";
};

// ============================================
// Déplacement d'une réservation
// ============================================
export const handleBookingUpdateError = (error: unknown): string => {
  if (isAxiosError(error)) {
    switch (error.response?.status) {
      case 400: return "Les informations saisies sont incorrectes.";
      case 401: return "Votre session a expiré. Veuillez vous reconnecter.";
      case 404: return "Cette réservation est introuvable.";
      case 409: return error.response?.data?.message || "Cette journée est complète ou cet employé est déjà réservé.";
      case 500: return "Le serveur rencontre un problème. Réessayez dans quelques instants.";
    }
    if (error.response?.data?.message) return error.response.data.message;
  }
  return "Le déplacement a échoué. Vérifiez votre connexion et réessayez.";
};

// ============================================
// Chargement des employés
// ============================================
export const handleEmployeLoadError = (error: unknown): string => {
  if (isAxiosError(error)) {
    switch (error.response?.status) {
      case 401: return "Votre session a expiré. Veuillez vous reconnecter.";
      case 403: return "Accès refusé à la liste des employés.";
      case 500: return "Le serveur rencontre un problème. Réessayez dans quelques instants.";
    }
  }
  return "Impossible de charger la liste des employés. Vérifiez votre connexion.";
};
