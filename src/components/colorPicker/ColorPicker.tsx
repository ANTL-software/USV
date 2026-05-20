// styles
import './colorPicker.scss';

// hooks | library
import { ReactElement } from 'react';
import { SketchPicker } from 'react-color';

interface ColorPickerProps {
  color: string | null;
  onChange: (color: string | null) => void;
  label?: string;
}

export default function ColorPicker({ color, onChange, label }: ColorPickerProps): ReactElement {
  const handleChange = (newColor: { hex: string }) => {
    onChange(newColor.hex);
  };

  const handleClear = () => onChange(null);

  return (
    <div id="colorPicker">
      {label && <label>{label}</label>}
      <div className="colorPicker__container">
        <SketchPicker
          color={color || '#7c3aed'}
          onChange={handleChange}
          disableAlpha
          presetColors={[
            '#7c3aed', '#ef4444', '#f59e0b', '#10b981',
            '#3b82f6', '#8b5cf6', '#ec4899', '#6b7280'
          ]}
        />
        <button
          type="button"
          className="colorPicker__clear"
          onClick={handleClear}
          disabled={!color}
        >
          Pas de couleur
        </button>
        {color && (
          <div className="colorPicker__preview" style={{ backgroundColor: color }}>
            {color}
          </div>
        )}
      </div>
    </div>
  );
}
