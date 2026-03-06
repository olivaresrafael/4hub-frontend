import { useState } from 'react';

const VENEZUELAN_GENRES = [
  'Joropo',
  'Gaita',
  'Salsa',
  'Merengue',
  'Cumbia',
  'Bachata',
  'Reggaeton',
  'Rock',
  'Pop',
  'Vals',
  'Tonada',
  'Polca',
  'Corrido',
  'Ranchera',
  'Bolero',
  'Tango',
  'Jazz',
  'Blues',
  'Otro',
];

interface GenreSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export function GenreSelect({ value, onChange, label = 'Género' }: GenreSelectProps) {
  const [showOther, setShowOther] = useState(value && !VENEZUELAN_GENRES.includes(value));

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    if (newValue === 'Otro') {
      setShowOther(true);
      onChange('');
    } else {
      setShowOther(false);
      onChange(newValue);
    }
  };

  const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div>
      <label className="label">{label}</label>
      {!showOther ? (
        <select
          className="input"
          value={value}
          onChange={handleChange}
        >
          <option value="">Seleccionar...</option>
          {VENEZUELAN_GENRES.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      ) : (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            className="input"
            value={value}
            onChange={handleOtherChange}
            placeholder="Especifica el género"
            style={{ flex: 1 }}
          />
          <button
            type="button"
            onClick={() => {
              setShowOther(false);
              onChange('');
            }}
            style={{
              padding: '0.5rem',
              fontSize: '0.875rem',
              color: '#6b7280',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
