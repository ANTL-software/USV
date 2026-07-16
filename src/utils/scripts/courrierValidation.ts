import type { ICourrierFormData } from "../types/index.ts";

export interface ValidationResult {
  isValid: boolean;
  errorMessage: string;
}

export const MAX_COURRIER_FILE_SIZE = 50 * 1024 * 1024;
export const ALLOWED_COURRIER_FILE_EXTENSIONS = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'] as const;

export const validateCourrierFile = (file: File): ValidationResult => {
  if (file.size > MAX_COURRIER_FILE_SIZE) {
    return {
      isValid: false,
      errorMessage: 'Le fichier dépasse la taille maximale de 50 Mo',
    };
  }

  const extension = file.name.includes('.') ? file.name.split('.').pop()?.toLowerCase() : undefined;
  if (!extension || !ALLOWED_COURRIER_FILE_EXTENSIONS.includes(
    extension as (typeof ALLOWED_COURRIER_FILE_EXTENSIONS)[number],
  )) {
    return {
      isValid: false,
      errorMessage: 'Format de fichier non autorisé. Utilisez PDF, DOC, DOCX, JPG ou PNG.',
    };
  }

  return { isValid: true, errorMessage: '' };
};

// Fonction utilitaire pour nettoyer le nom de fichier
export const sanitizeFileName = (fileName: string): string => {
  // Remplacer les caractères vraiment interdits par des underscores (autoriser : . , ')
  return fileName.replace(/[<>"|?*`´]/g, '_');
};

// Fonction utilitaire pour valider les caractères des champs texte (kind, department, etc.)
const validateTextFieldCharacters = (fieldValue: string, fieldName: string): ValidationResult => {
  // Caractères vraiment dangereux pour les champs de métadonnées (autoriser : . , ')
  const invalidChars = /[<>"|?*]/g;
  const invalidMatches = fieldValue.match(invalidChars);
  
  if (invalidMatches) {
    const uniqueInvalidChars = [...new Set(invalidMatches)].join(', ');
    return {
      isValid: false,
      errorMessage: `Le champ "${fieldName}" contient des caractères non autorisés: ${uniqueInvalidChars}.`
    };
  }
  
  return {
    isValid: true,
    errorMessage: ""
  };
};

export const validateCourrierForm = (formData: ICourrierFormData): ValidationResult => {
  if (!formData.fichierJoint) {
    return {
      isValid: false,
      errorMessage: "Veuillez sélectionner un fichier"
    };
  }

  const fileValidation = validateCourrierFile(formData.fichierJoint);
  if (!fileValidation.isValid) return fileValidation;
  
  if (!formData.customFileName.trim()) {
    return {
      isValid: false,
      errorMessage: "Veuillez saisir un nom de fichier"
    };
  }

  if (!formData.kind.trim()) {
    return {
      isValid: false,
      errorMessage: "Veuillez saisir le type de courrier"
    };
  }

  // Validation des caractères du type de courrier
  const kindValidation = validateTextFieldCharacters(formData.kind, "Type de courrier");
  if (!kindValidation.isValid) {
    return kindValidation;
  }

  if (!formData.department.trim()) {
    return {
      isValid: false,
      errorMessage: "Veuillez saisir le service/département"
    };
  }

  // Validation des caractères du département
  const departmentValidation = validateTextFieldCharacters(formData.department, "Service/Département");
  if (!departmentValidation.isValid) {
    return departmentValidation;
  }

  // Validation des caractères des champs optionnels s'ils sont remplis
  if (formData.emitter.trim()) {
    const emitterValidation = validateTextFieldCharacters(formData.emitter, "Expéditeur");
    if (!emitterValidation.isValid) {
      return emitterValidation;
    }
  }

  if (formData.recipient.trim()) {
    const recipientValidation = validateTextFieldCharacters(formData.recipient, "Destinataire");
    if (!recipientValidation.isValid) {
      return recipientValidation;
    }
  }

  if (formData.description.trim()) {
    const descriptionValidation = validateTextFieldCharacters(formData.description, "Description");
    if (!descriptionValidation.isValid) {
      return descriptionValidation;
    }
  }

  if (!formData.courrierDate) {
    return {
      isValid: false,
      errorMessage: "Veuillez saisir la date du courrier"
    };
  }

  if (!formData.direction) {
    return {
      isValid: false,
      errorMessage: "Veuillez sélectionner la direction"
    };
  }

  return {
    isValid: true,
    errorMessage: ""
  };
};

export const validateCourrierUpdateForm = (formData: ICourrierFormData): ValidationResult => {
  if (!formData.kind.trim()) {
    return {
      isValid: false,
      errorMessage: "Veuillez saisir le type de courrier"
    };
  }

  // Validation des caractères du type de courrier
  const kindValidation = validateTextFieldCharacters(formData.kind, "Type de courrier");
  if (!kindValidation.isValid) {
    return kindValidation;
  }

  if (!formData.department.trim()) {
    return {
      isValid: false,
      errorMessage: "Veuillez saisir le service/département"
    };
  }

  // Validation des caractères du département
  const departmentValidation = validateTextFieldCharacters(formData.department, "Service/Département");
  if (!departmentValidation.isValid) {
    return departmentValidation;
  }

  // Validation des caractères des champs optionnels s'ils sont remplis
  if (formData.emitter && formData.emitter.trim()) {
    const emitterValidation = validateTextFieldCharacters(formData.emitter, "Expéditeur");
    if (!emitterValidation.isValid) {
      return emitterValidation;
    }
  }

  if (formData.recipient && formData.recipient.trim()) {
    const recipientValidation = validateTextFieldCharacters(formData.recipient, "Destinataire");
    if (!recipientValidation.isValid) {
      return recipientValidation;
    }
  }

  if (formData.description && formData.description.trim()) {
    const descriptionValidation = validateTextFieldCharacters(formData.description, "Description");
    if (!descriptionValidation.isValid) {
      return descriptionValidation;
    }
  }

  if (!formData.direction) {
    return {
      isValid: false,
      errorMessage: "Veuillez sélectionner la direction"
    };
  }
  
  return {
    isValid: true,
    errorMessage: ""
  };
};
