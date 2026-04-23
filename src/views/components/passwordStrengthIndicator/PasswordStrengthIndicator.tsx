import { ReactElement, useEffect, useState } from 'react';
import { validatePasswordStrength, PasswordStrength } from '../../../utils/scripts/passwordValidation';
import './passwordStrengthIndicator.scss';

interface PasswordStrengthIndicatorProps {
  password: string;
  onValidityChange?: (isValid: boolean, strength: PasswordStrength) => void;
}

function PasswordStrengthIndicator({ 
  password, 
  onValidityChange 
}: PasswordStrengthIndicatorProps): ReactElement {
  const [strength, setStrength] = useState<PasswordStrength | null>(null);

  useEffect(() => {
    if (password) {
      const passwordStrength = validatePasswordStrength(password);
      queueMicrotask(() => setStrength(passwordStrength));
      onValidityChange?.(passwordStrength.isValid, passwordStrength);
    } else {
      queueMicrotask(() => setStrength(null));
      onValidityChange?.(false, {} as PasswordStrength);
    }
    // onValidityChange omis intentionnellement pour éviter boucle infinie
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password]);

  const getStrengthClass = (score: number): string => {
    switch (score) {
      case 0:
      case 1:
        return 'very-weak';
      case 2:
        return 'weak';
      case 3:
        return 'fair';
      case 4:
        return 'good';
      case 5:
        return 'strong';
      default:
        return 'none';
    }
  };

  const getStrengthLabel = (score: number): string => {
    switch (score) {
      case 0:
      case 1:
        return 'Très faible';
      case 2:
        return 'Faible';
      case 3:
        return 'Acceptable';
      case 4:
        return 'Bon';
      case 5:
        return 'Excellent';
      default:
        return '';
    }
  };

  if (!password) return <></>;

  return (
    <div id="passwordStrengthIndicator" className="password-strength-container">
      {strength && (
        <>
          {/* Informations de force et validation */}
          <div className="strength-info">
            <span className={`strength-text ${getStrengthClass(strength.score)}`}>
              {getStrengthLabel(strength.score)}
            </span>
            <span className="validation-status">
              {strength.isValid ? '✅' : '❌'}
            </span>
          </div>

          {/* Barre de force */}
          <div className="strength-bar">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`strength-segment ${
                  level <= strength.score ? getStrengthClass(strength.score) : 'empty'
                }`}
              />
            ))}
          </div>

          {/* Critères essentiels non respectés uniquement */}
          <div className="requirements">
            {strength.requirements
              .filter(req => req.priority === 'critical' && !req.isMet)
              .slice(0, 2) // Maximum 2 critères non respectés
              .map((req) => (
                <div key={req.name} className="requirement">
                  <span className="requirement-icon">❌</span>
                  <span className="requirement-text">{req.description}</span>
                </div>
              ))}
          </div>

        </>
      )}
    </div>
  );
}

export default PasswordStrengthIndicator;