// hooks | libraries
import { ReactElement } from "react";
import CreatableSelect from 'react-select/creatable';
import { StylesConfig } from 'react-select';

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

  // Styles personnalisés pour correspondre au design existant
  const customStyles: StylesConfig<SelectOption, false> = {
    control: (provided, state) => ({
      ...provided,
      minHeight: '44px',
      border: state.isFocused 
        ? '2px solid #7c3aed' 
        : '2px solid #e0e7ff',
      borderRadius: '8px',
      boxShadow: state.isFocused 
        ? '0 0 0 3px rgba(38, 208, 206, 0.2)' 
        : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#7c3aed' : '#c7d2fe'
      },
      fontSize: '1em',
      fontFamily: 'inherit'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#9ca3af'
    }),
    input: (provided) => ({
      ...provided,
      color: '#374151'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#374151'
    }),
    menu: (provided) => ({
      ...provided,
      borderRadius: '8px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      border: '1px solid #e5e7eb',
      zIndex: 9999
    }),
    menuList: (provided) => ({
      ...provided,
      padding: '4px'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected
        ? '#7c3aed'
        : state.isFocused
        ? '#f0fffe'
        : 'white',
      color: state.isSelected ? 'white' : '#374151',
      borderRadius: '6px',
      margin: '2px 0',
      cursor: 'pointer',
      '&:active': {
        backgroundColor: state.isSelected ? '#7c3aed' : 'rgba(124,58,237,0.08)'
      }
    })
  };

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
      styles={customStyles}
      placeholder={placeholder}
      isClearable
      isLoading={isLoading}
      isSearchable
      createOptionPosition="first"
      formatCreateLabel={(inputValue) => `Créer "${inputValue}"`}
      noOptionsMessage={() => "Aucune option disponible"}
      loadingMessage={() => "Chargement..."}
      className="react-select-container"
      classNamePrefix="react-select"
    />
  );
}

export default CreatableSelectComponent;