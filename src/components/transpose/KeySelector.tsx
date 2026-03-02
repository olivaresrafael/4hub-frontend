import type { MusicalKey } from '../../hooks/useTransposition';
import { CHROMATIC_SCALE_SHARP, CHROMATIC_SCALE_FLAT } from '../../utils/chordParser';

interface KeySelectorProps {
  value: MusicalKey;
  onChange: (key: MusicalKey) => void;
  originalKey?: MusicalKey;
  useFlats?: boolean;
  disabled?: boolean;
}

export function KeySelector({
  value,
  onChange,
  originalKey,
  useFlats = false,
  disabled = false,
}: KeySelectorProps) {
  const keys = useFlats ? CHROMATIC_SCALE_FLAT : CHROMATIC_SCALE_SHARP;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as MusicalKey)}
      disabled={disabled}
      style={{
        padding: '0.5rem 0.75rem',
        border: '1px solid #d1d5db',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        backgroundColor: 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {keys.map((key) => (
        <option key={key} value={key}>
          {key}
          {key === originalKey ? ' (original)' : ''}
        </option>
      ))}
    </select>
  );
}
