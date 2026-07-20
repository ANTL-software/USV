// hooks | libraries
import { ReactElement } from "react";
import CreatableSelect from 'react-select/creatable';
import { StylesConfig } from 'react-select';
import { reactSelectStyles } from '../../../utils/styles/index.ts';

interface SelectOption {
  value: string;
  label: string;
}

interface CreatableSelectProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: string[];
  placeholder?: string;
  id?: string;
  name?: string;
  isLoading?: boolean;
}

function CreatableSelectComponent({
  value,
  onChange,
  onBlur,
  options,
  placeholder = "Sélectionner ou créer...",
  id,
  name,
  isLoading = false
}: CreatableSelectProps): ReactElement {

  // Transformer les options en format react-select
  const selectOptions: SelectOption[] = options.map(option => ({
    value: option,
    label: option
  }));

  // Trouver l'option sélectionnée
  const selectedOption = value ? { value, label: value } : null;

  const handleChange = (newValue: SelectOption | null) => {
    onChange(newValue ? newValue.value : '');
  };

  const handleCreate = (inputValue: string) => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue) {
      onChange(trimmedValue);
    }
  };

  return (
    <CreatableSelect
      inputId={id}
      name={name}
      value={selectedOption}
      onChange={handleChange}
      onBlur={onBlur}
      onCreateOption={handleCreate}
      options={selectOptions}
      styles={reactSelectStyles as StylesConfig<SelectOption, false>}
      placeholder={placeholder}
      isClearable
      isLoading={isLoading}
      isSearchable
      createOptionPosition="first"
      formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
      noOptionsMessage={() => "Aucune option disponible"}
      loadingMessage={() => "Chargement..."}
      menuPortalTarget={document.body}
      className="react-select-container"
      classNamePrefix="react-select"
    />
  );
}

export default CreatableSelectComponent;
