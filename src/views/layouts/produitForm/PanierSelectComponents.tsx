import { ReactElement } from 'react';
import { IoTrash } from 'react-icons/io5';
import { components } from 'react-select';
import type { OptionProps, MultiValueProps } from 'react-select';
import type { Panier } from '../../../utils/types/panier.types';

// Type pour nos options personnalisées
export interface PanierOption {
  value: string;  // id_panier en string
  label: string;  // label du panier
  isSelected: boolean;  // true si le produit est dans ce panier
  panier: Panier;
}

// ─── MultiValue (chip affichée dans l'input) ────────────────────────

export const PanierMultiValue = (
  props: MultiValueProps<PanierOption, true>
): ReactElement => {
  return (
    <components.MultiValue {...props}>
      <span className="panier-select__chip">
        <span className="panier-select__chip-label">{props.data.label}</span>
      </span>
    </components.MultiValue>
  );
};

// ─── Option (panier dans la liste déroulante) ───────────────────────

export const PanierOption = (
  props: OptionProps<PanierOption, true>
): ReactElement => {
  const { isSelected } = props.data;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Si sélectionné, aucun effet (seule la corbeille fonctionne)
    if (isSelected) return;
    // Si non sélectionné, on laisse le handler par défaut (sélectionner)
    props.selectOption(props.data);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // Émettre un événement personnalisé pour le retrait
    const event = new CustomEvent('remove-panier', {
      detail: props.data.panier.id_panier,
      bubbles: true
    });
    window.dispatchEvent(event);
  };

  return (
    <div
      className={`panier-select__option ${isSelected ? 'panier-select__option--selected' : ''}`}
      onClick={handleClick}
    >
      <span className="panier-select__option-label">{props.data.label}</span>
      {isSelected && (
        <button
          className="panier-select__option-remove"
          onClick={handleRemove}
          type="button"
          title="Retirer de ce panier"
        >
          <IoTrash />
        </button>
      )}
    </div>
  );
};
