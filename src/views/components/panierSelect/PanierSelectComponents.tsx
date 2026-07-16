import type { MouseEvent, ReactElement } from 'react';
import { IoTrash } from 'react-icons/io5';
import { components } from 'react-select';
import type { MultiValueProps, OptionProps } from 'react-select';
import type { ProduitPanierOption } from '../../../utils/scripts/index.ts';

import './panierSelect.scss';

export type PanierOptionData = ProduitPanierOption;

export function PanierMultiValue(props: MultiValueProps<PanierOptionData, true>): ReactElement {
  return (
    <components.MultiValue {...props}>
      <span className="panier-select__chip">
        <span className="panier-select__chip-label">{props.data.label}</span>
      </span>
    </components.MultiValue>
  );
}

export function PanierOption(props: OptionProps<PanierOptionData, true>): ReactElement {
  const { isSelected } = props.data;

  const handleClick = (event: MouseEvent): void => {
    event.stopPropagation();
    if (!isSelected) props.selectOption(props.data);
  };

  const handleRemove = (event: MouseEvent): void => {
    event.stopPropagation();
    event.preventDefault();
    window.dispatchEvent(new CustomEvent<number>('remove-panier', {
      detail: props.data.panier.id_panier,
      bubbles: true,
    }));
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
}
