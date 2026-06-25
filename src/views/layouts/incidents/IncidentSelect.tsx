import Select from 'react-select';
import type { SingleValue, StylesConfig } from 'react-select';
import reactSelectStyles from '../../../utils/styles/reactSelectStyles';

type OptionValue = string | number;

export interface IncidentSelectOption<T extends OptionValue> {
  value: T;
  label: string;
}

interface IncidentSelectProps<T extends OptionValue> {
  inputId: string;
  options: IncidentSelectOption<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  placeholder?: string;
  disabled?: boolean;
  isClearable?: boolean;
}

function IncidentSelect<T extends OptionValue>({
  inputId,
  options,
  value,
  onChange,
  placeholder = 'Sélectionner',
  disabled = false,
  isClearable = false,
}: IncidentSelectProps<T>) {
  const selected = options.find(option => option.value === value) ?? null;

  return (
    <Select<IncidentSelectOption<T>, false>
      inputId={inputId}
      className="react-select-container"
      classNamePrefix="react-select"
      options={options}
      value={selected}
      onChange={(option: SingleValue<IncidentSelectOption<T>>) => onChange(option?.value ?? null)}
      placeholder={placeholder}
      isDisabled={disabled}
      isClearable={isClearable}
      styles={reactSelectStyles as StylesConfig<IncidentSelectOption<T>, false>}
      noOptionsMessage={() => 'Aucun résultat'}
    />
  );
}

export default IncidentSelect;
