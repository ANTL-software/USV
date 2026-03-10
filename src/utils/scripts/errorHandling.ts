interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

interface AxiosError {
  response?: {
    status?: number;
    data?: {
      message?: string;
      success?: boolean;
      errors?: ValidationError[];
    };
  };
  message?: string;
}

export const handleCourrierUploadError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response?.status === 400) {
      // Si nous avons des erreurs de validation détaillées
      if (axiosError.response.data?.errors && Array.isArray(axiosError.response.data.errors)) {
        const validationErrors = axiosError.response.data.errors;
        
        if (validationErrors.length === 1) {
          // Une seule erreur - message direct
          const error = validationErrors[0];
          return `${getFieldDisplayName(error.field)}: ${error.message}`;
        } else if (validationErrors.length > 1) {
          // Plusieurs erreurs - liste numérotée
          const errorMessages = validationErrors.map((err, index) => 
            `${index + 1}. ${getFieldDisplayName(err.field)}: ${err.message}`
          ).join('\n');
          return `Erreurs de validation:\n${errorMessages}`;
        }
      }
      
      // Fallback si pas d'erreurs détaillées
      return `Erreur de validation: ${axiosError.response.data?.message || "Données invalides"}`;
    } else if (axiosError.response?.status === 413) {
      return "Le fichier est trop volumineux (max 50MB)";
    } else if (axiosError.response?.data?.message) {
      return `Erreur: ${axiosError.response.data.message}`;
    }
  }
  
  return "Erreur lors de la création du courrier. Veuillez réessayer.";
};

// Fonction utilitaire pour convertir les noms de champs techniques en noms affichables
const getFieldDisplayName = (fieldName: string): string => {
  const fieldDisplayNames: Record<string, string> = {
    'customFileName': 'Nom du fichier',
    'kind': 'Type de courrier',
    'department': 'Service/Département',
    'emitter': 'Expéditeur',
    'recipient': 'Destinataire',
    'description': 'Description',
    'direction': 'Direction',
    'priority': 'Priorité',
    'courrierDate': 'Date du courrier',
    'receptionDate': 'Date de réception'
  };
  
  return fieldDisplayNames[fieldName] || fieldName;
};

// Gestion d'erreurs pour le chargement des courriers
export const handleCourrierLoadError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response?.status === 401) {
      return "Session expirée. Veuillez vous reconnecter.";
    } else if (axiosError.response?.status === 403) {
      return "Accès non autorisé à cette ressource.";
    } else if (axiosError.response?.status === 500) {
      return "Erreur serveur. Veuillez réessayer plus tard.";
    } else if (axiosError.response?.data?.message) {
      return `Erreur: ${axiosError.response.data.message}`;
    }
  }
  
  if (error instanceof Error) {
    return `Erreur réseau: ${error.message}`;
  }
  
  return "Erreur lors du chargement des courriers. Veuillez réessayer.";
};

// Gestion d'erreurs pour le téléchargement de courriers
export const handleCourrierDownloadError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response?.status === 404) {
      return "Courrier non trouvé ou fichier supprimé.";
    } else if (axiosError.response?.status === 401) {
      return "Session expirée. Reconnectez-vous pour télécharger.";
    } else if (axiosError.response?.status === 403) {
      return "Vous n'avez pas l'autorisation de télécharger ce courrier.";
    } else if (axiosError.response?.data?.message) {
      return `Erreur: ${axiosError.response.data.message}`;
    }
  }
  
  return "Erreur lors du téléchargement. Veuillez réessayer.";
};

// Gestion d'erreurs pour la suppression de courriers
export const handleCourrierDeleteError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response?.status === 404) {
      return "Courrier non trouvé ou déjà supprimé.";
    } else if (axiosError.response?.status === 401) {
      return "Session expirée. Veuillez vous reconnecter.";
    } else if (axiosError.response?.status === 403) {
      return "Vous n'avez pas l'autorisation de supprimer ce courrier.";
    } else if (axiosError.response?.data?.message) {
      return `Erreur: ${axiosError.response.data.message}`;
    }
  }
  
  return "Erreur lors de la suppression. Veuillez réessayer.";
};

// Gestion d'erreurs pour la visualisation de PDF/images
export const handleCourrierViewError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response?.status === 404) {
      return "Fichier non trouvé sur le serveur.";
    } else if (axiosError.response?.status === 401) {
      return "Session expirée. Reconnectez-vous pour visualiser.";
    } else if (axiosError.response?.status === 403) {
      return "Accès non autorisé à ce fichier.";
    } else if (axiosError.response?.data?.message) {
      return `Erreur: ${axiosError.response.data.message}`;
    }
  }
  
  return "Erreur lors du chargement du fichier pour visualisation.";
};

// Fonction générale pour logger les erreurs avec contexte
export const logError = (context: string, error: unknown): void => {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    context,
    error: error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : error
  };
  
  console.error(`[${timestamp}] Error in ${context}:`, errorInfo);
  
  // TODO: En production, envoyer vers un service de monitoring
  // logToMonitoringService(errorInfo);
};

// Gestion d'erreurs pour l'envoi d'emails
export const handleCourrierEmailError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response?.status === 400) {
      return "Données d'email invalides. Vérifiez l'adresse du destinataire.";
    } else if (axiosError.response?.status === 404) {
      return "Courrier non trouvé. Il a peut-être été supprimé.";
    } else if (axiosError.response?.status === 503) {
      return "Service email non configuré. Contactez l'administrateur.";
    } else if (axiosError.response?.data?.message) {
      return `Erreur: ${axiosError.response.data.message}`;
    }
  }
  
  if (error instanceof Error) {
    return `Erreur d'envoi: ${error.message}`;
  }
  
  return "Erreur lors de l'envoi de l'email. Veuillez réessayer.";
};

// Interface pour notifier l'utilisateur des erreurs (legacy - synchrone)
export const showErrorNotification = (message: string, type: 'error' | 'warning' | 'info' = 'error'): void => {
  // Fallback pour la compatibilité - utilise l'ancien système
  const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  
  // Essayer d'utiliser notre nouveau système si disponible
  if (typeof window !== 'undefined' && (window as any).antl_alert_service) {
    const alertService = (window as any).antl_alert_service;
    if (type === 'error') {
      alertService.showError(message);
    } else if (type === 'warning') {
      alertService.showWarning(message);
    } else {
      alertService.showInfo(message);
    }
    return;
  }
  
  // Fallback vers alert natif si le service n'est pas disponible
  alert(`${prefix} ${message}`);
};

// Nouvelle interface asynchrone pour les erreurs
export const showErrorNotificationAsync = async (message: string, type: 'error' | 'warning' | 'info' = 'error'): Promise<void> => {
  try {
    const { showError, showWarning, showInfo } = await import('../services/alertService');
    
    if (type === 'error') {
      await showError(message);
    } else if (type === 'warning') {
      await showWarning(message);
    } else {
      await showInfo(message);
    }
  } catch {
    // Fallback si import échoue
    showErrorNotification(message, type);
  }
};