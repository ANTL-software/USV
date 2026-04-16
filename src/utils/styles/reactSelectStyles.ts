import type { StylesConfig, GroupBase } from 'react-select';

/**
 * Styles react-select alignés sur le mixin `formInput` :
 * - minHeight fixe pour que react-select centre le texte correctement
 * - Même border, focus que les inputs
 * - On NE touche PAS au valueContainer (react-select gère le centrage)
 */
const reactSelectStyles: StylesConfig<unknown, false, GroupBase<unknown>> = {
  control: (base, state) => ({
    ...base,
    minHeight: '44px',
    border: state.isFocused
      ? '2px solid #7c3aed'
      : '2px solid rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    boxShadow: state.isFocused
      ? '0 0 0 3px rgba(38, 208, 206, 0.1)'
      : 'none',
    '&:hover': {
      borderColor: state.isFocused ? '#7c3aed' : 'rgba(0, 0, 0, 0.1)',
    },
    fontSize: '1em',
    fontFamily: 'inherit',
  }),

  placeholder: (provided) => ({
    ...provided,
    color: '#5a6c7d',
  }),

  singleValue: (provided) => ({
    ...provided,
    color: '#2c3e50',
  }),

  indicatorSeparator: () => ({
    display: 'none',
  }),

  menuPortal: (base) => ({
    ...base,
    zIndex: 1050,
  }),

  menu: (provided) => ({
    ...provided,
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid rgba(0, 0, 0, 0.1)',
  }),

  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#7c3aed'
      : state.isFocused
        ? 'rgba(38, 208, 206, 0.1)'
        : 'white',
    color: state.isSelected ? 'white' : '#2c3e50',
    borderRadius: '6px',
    margin: '2px 0',
    cursor: 'pointer',
    '&:active': {
      backgroundColor: state.isSelected ? '#7c3aed' : 'rgba(124,58,237,0.08)',
    },
  }),
};

export default reactSelectStyles;
