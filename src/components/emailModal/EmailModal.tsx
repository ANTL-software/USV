// styles
import "./emailModal.scss";

// hooks | libraries
import { ReactElement, useState, useEffect } from "react";
import { MdClose, MdSend, MdEmail, MdSubject, MdMessage } from "react-icons/md";
import { FiUser, FiFileText } from "react-icons/fi";

// components
import Button from "../button/Button.tsx";

// types
import { ICourrier } from "../../utils/types/courrier.types.ts";

interface EmailModalProps {
  isVisible: boolean;
  courrier: ICourrier | null;
  onClose: () => void;
  onSend: (emailData: { to: string; subject: string; message: string }) => Promise<void>;
  isLoading?: boolean;
  bulkMode?: boolean;
  selectedCount?: number;
}

function EmailModal({ 
  isVisible, 
  courrier, 
  onClose, 
  onSend, 
  isLoading = false, 
  bulkMode = false, 
  selectedCount = 1 
}: EmailModalProps): ReactElement {
  
  const getDefaultMessage = (): string => {
    // Plus de template HTML côté frontend - le backend gère tout
    return "";
  };

  const getDefaultSubject = (courrier: ICourrier | null, isBulkMode: boolean, count: number): string => {
    if (isBulkMode) {
      return `Envoi groupé: ${count} courrier${count > 1 ? 's' : ''}`;
    }
    return courrier ? `Courrier: ${courrier.fileName}` : "";
  };

  const [formData, setFormData] = useState({
    to: "",
    subject: getDefaultSubject(courrier, bulkMode, selectedCount),
    message: getDefaultMessage()
  });
  const [error, setError] = useState<string>("");

  // Update form data when courrier changes
  useEffect(() => {
    if (isVisible) {
      setFormData({
        to: "",
        subject: getDefaultSubject(courrier, bulkMode, selectedCount),
        message: getDefaultMessage()
      });
    }
  }, [isVisible, courrier, bulkMode, selectedCount]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateEmail = (email: string): boolean => {
    // Regex plus robuste pour la validation d'email
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    // Vérifications supplémentaires
    if (email.length > 254) return false; // Longueur maximale d'un email
    if (email.includes('..')) return false; // Pas de points consécutifs
    if (email.startsWith('.') || email.endsWith('.')) return false; // Pas de point au début ou à la fin
    
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset les erreurs précédentes
    setError("");
    
    // Validation renforcée
    if (!formData.to.trim()) {
      setError("L'adresse email du destinataire est requise");
      return;
    }
    
    if (!validateEmail(formData.to.trim())) {
      setError("L'adresse email n'est pas valide. Veuillez vérifier le format (ex: nom@domaine.com)");
      return;
    }
    
    if (!formData.subject.trim()) {
      setError("Le sujet est requis");
      return;
    }
    
    if (formData.subject.trim().length > 200) {
      setError("Le sujet ne peut pas dépasser 200 caractères");
      return;
    }
    
    // Validation pour le mode bulk
    if (bulkMode && selectedCount === 0) {
      setError("Aucun courrier sélectionné pour l'envoi groupé");
      return;
    }
    
    // Validation pour le mode simple
    if (!bulkMode && !courrier) {
      setError("Aucun courrier à envoyer");
      return;
    }
    
    try {
      await onSend({
        to: formData.to.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim() || ""
      });
      
      // Reset form and close modal on success
      setFormData({
        to: "",
        subject: getDefaultSubject(courrier, bulkMode, selectedCount),
        message: getDefaultMessage()
      });
      setError("");
      onClose();
    } catch (error: unknown) {
      // Gestion d'erreur locale dans le modal ET propagation au parent
      let errorMessage = "Erreur lors de l'envoi de l'email";
      
      if (error instanceof Error) {
        // Gestion spécifique des erreurs réseau et timeout
        if (error.name === 'NetworkError' || error.message.includes('fetch')) {
          errorMessage = "Erreur de connexion. Vérifiez votre connexion internet et réessayez.";
        } else if (error.message.includes('timeout')) {
          errorMessage = "L'envoi a pris trop de temps. Réessayez dans quelques instants.";
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorMessage = "Session expirée. Veuillez vous reconnecter.";
        } else if (error.message.includes('403') || error.message.includes('forbidden')) {
          errorMessage = "Vous n'avez pas l'autorisation d'envoyer cet email.";
        } else if (error.message.includes('404')) {
          errorMessage = "Courrier non trouvé ou supprimé.";
        } else if (error.message.includes('413') || error.message.includes('too large')) {
          errorMessage = "Le courrier est trop volumineux pour être envoyé par email.";
        } else if (error.message.includes('503') || error.message.includes('email non configuré')) {
          errorMessage = "Service email temporairement indisponible. Contactez l'administrateur.";
        } else {
          errorMessage = error.message;
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      // Afficher l'erreur dans le modal pour que l'utilisateur la voie
      setError(errorMessage);
      
      // Propager l'erreur au composant parent pour les notifications globales
      throw error;
    }
  };

  const handleClose = () => {
    setFormData({
      to: "",
      subject: getDefaultSubject(courrier, bulkMode, selectedCount),
      message: getDefaultMessage()
    });
    setError("");
    onClose();
  };

  if (!isVisible) return <></>;

  return (
    <div id="emailModal">
      <div className="emailModalOverlay" onClick={handleClose}>
        <div className="emailModalContent" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <header className="emailModalHeader">
            <div className="modalTitle">
              <MdEmail className="titleIcon" />
              <h2>{bulkMode ? `Envoi groupé (${selectedCount} courrier${selectedCount > 1 ? 's' : ''})` : 'Envoyer par email'}</h2>
            </div>
            <button className="closeBtn" onClick={handleClose} type="button">
              <MdClose />
            </button>
          </header>

          {/* Courrier Info */}
          {bulkMode ? (
            <div className="bulkCourrierInfo">
              <FiFileText className="courrierIcon" />
              <div className="bulkDetails">
                <h3>Envoi groupé de {selectedCount} courrier{selectedCount > 1 ? 's' : ''}</h3>
                <p className="bulkDescription">
                  Les courriers sélectionnés seront envoyés en pièces jointes dans un seul email.
                </p>
              </div>
            </div>
          ) : (
            courrier && (
              <div className="courrierInfo">
                <FiFileText className="courrierIcon" />
                <div className="courrierDetails">
                  <span className="fileName">{courrier.fileName}</span>
                  <span className="fileInfo">
                    {courrier.kind} • {courrier.department} • {courrier.direction}
                  </span>
                </div>
              </div>
            )
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="emailForm">
            {/* Recipient */}
            <div className="formGroup">
              <label htmlFor="emailTo" className="formLabel">
                <FiUser className="labelIcon" />
                Destinataire *
              </label>
              <input
                id="emailTo"
                type="email"
                placeholder="exemple@domaine.com"
                value={formData.to}
                onChange={(e) => handleInputChange('to', e.target.value)}
                className="formInput"
                required
              />
            </div>

            {/* Subject */}
            <div className="formGroup">
              <label htmlFor="emailSubject" className="formLabel">
                <MdSubject className="labelIcon" />
                Sujet *
              </label>
              <input
                id="emailSubject"
                type="text"
                placeholder="Objet de l'email"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="formInput"
                required
              />
            </div>

            {/* Personal Note */}
            <div className="formGroup">
              <label htmlFor="emailMessage" className="formLabel">
                <MdMessage className="labelIcon" />
                Note personnelle
              </label>
              <textarea
                id="emailMessage"
                placeholder="Ajoutez une note personnelle à votre envoi (optionnel)..."
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="formTextarea"
                rows={4}
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="errorMessage">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="formActions">
              <Button
                type="button"
                style="grey"
                onClick={handleClose}
                disabled={isLoading}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                style="green"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loadingSpinner" />
                    {bulkMode ? 'Envoi groupé en cours...' : 'Envoi...'}
                  </>
                ) : (
                  <>
                    {bulkMode ? `Envoyer ${selectedCount} courrier${selectedCount > 1 ? 's' : ''}` : 'Envoyer'}
                    <MdSend fill="#ffffff" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Info Note */}
          <div className="infoNote">
            <span className="infoIcon">ℹ️</span>
            <p>
              {bulkMode 
                ? `Les ${selectedCount} courriers seront envoyés en pièces jointes dans un seul email avec un modèle automatique.`
                : "Le courrier sera envoyé en pièce jointe avec un modèle d'email automatique. Votre note personnelle sera ajoutée si elle est renseignée."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailModal;