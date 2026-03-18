import { ICourrierFormData } from "../types/courrier.types";

export interface ValidationResult {
  isValid: boolean;
  errorMessage: string;
}

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