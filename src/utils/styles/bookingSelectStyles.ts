const bookingSelectStyles = {
  control: (base: object) => ({
    ...base,
    borderColor: '#d1d5db',
    borderRadius: '6px',
    boxShadow: 'none',
    fontSize: '0.9em',
    minHeight: '2.5em',
    '&:hover': { borderColor: '#7c3aed' },
  }),
  menuPortal: (base: object) => ({ ...base, zIndex: 9999 }),
  option: (base: object, state: { isFocused: boolean; isSelected: boolean }) => ({
    ...base,
    backgroundColor: state.isSelected ? '#7c3aed' : state.isFocused ? 'rgba(124,58,237,0.1)' : 'white',
    color: state.isSelected ? 'white' : '#1f2937',
    fontSize: '0.9em',
  }),
  singleValue: (base: object) => ({ ...base, color: '#1f2937' }),
};

export default bookingSelectStyles;
