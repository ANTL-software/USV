import type { StylesConfig } from 'react-select';
import reactSelectStyles from './reactSelectStyles.ts';

const devisSelectStyles: StylesConfig<unknown, false> = {
  ...reactSelectStyles,
  control: (base, state) => ({
    ...(reactSelectStyles.control?.(base, state) ?? base),
    minHeight: '3rem',
    height: '3rem',
  }),
  valueContainer: (base, state) => ({
    ...(reactSelectStyles.valueContainer?.(base, state) ?? base),
    height: 'calc(3rem - 4px)',
  }),
  indicatorsContainer: (base, state) => ({
    ...(reactSelectStyles.indicatorsContainer?.(base, state) ?? base),
    height: 'calc(3rem - 4px)',
  }),
};

export default devisSelectStyles;
