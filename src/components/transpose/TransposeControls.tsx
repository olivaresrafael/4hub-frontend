import { useEffect, useCallback } from 'react';
import type { MusicalKey } from '../../hooks/useTransposition';
import { KeySelector } from './KeySelector';
import { ArrowUpIcon, ArrowDownIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface TransposeControlsProps {
  currentKey: MusicalKey;
  originalKey: MusicalKey;
  useFlats: boolean;
  isTransposed: boolean;
  onKeyChange: (key: MusicalKey) => void;
  onTransposeUp: () => void;
  onTransposeDown: () => void;
  onReset: () => void;
  onToggleFlats: () => void;
  disabled?: boolean;
}

export function TransposeControls({
  currentKey,
  originalKey,
  useFlats,
  isTransposed,
  onKeyChange,
  onTransposeUp,
  onTransposeDown,
  onReset,
  onToggleFlats,
  disabled = false,
}: TransposeControlsProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (disabled) return;
    
    if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      onTransposeUp();
    } else if (e.key === '-') {
      e.preventDefault();
      onTransposeDown();
    }
  }, [disabled, onTransposeUp, onTransposeDown]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const buttonStyle = {
    padding: '0.375rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    backgroundColor: 'white',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <button
          type="button"
          onClick={onTransposeDown}
          disabled={disabled}
          style={buttonStyle}
          title="Bajar un semitono (-)"
        >
          <ArrowDownIcon style={{ width: '1rem', height: '1rem' }} />
        </button>
        
        <KeySelector
          value={currentKey}
          onChange={onKeyChange}
          originalKey={originalKey}
          useFlats={useFlats}
          disabled={disabled}
        />
        
        <button
          type="button"
          onClick={onTransposeUp}
          disabled={disabled}
          style={buttonStyle}
          title="Subir un semitono (+)"
        >
          <ArrowUpIcon style={{ width: '1rem', height: '1rem' }} />
        </button>
      </div>

      {isTransposed && (
        <button
          type="button"
          onClick={onReset}
          disabled={disabled}
          style={{
            ...buttonStyle,
            padding: '0.375rem 0.75rem',
            fontSize: '0.75rem',
          }}
          title="Restaurar tono original"
        >
          <ArrowPathIcon style={{ width: '0.875rem', height: '0.875rem', marginRight: '0.25rem' }} />
          Original
        </button>
      )}

      <button
        type="button"
        onClick={onToggleFlats}
        disabled={disabled}
        style={{
          ...buttonStyle,
          padding: '0.375rem 0.5rem',
          fontSize: '0.75rem',
          fontWeight: 500,
          backgroundColor: useFlats ? '#fef3c7' : 'white',
        }}
        title={useFlats ? 'Usar sostenidos' : 'Usar bemoles'}
      >
        {useFlats ? '♭' : '#'}
      </button>

      {isTransposed && (
        <span
          style={{
            fontSize: '0.75rem',
            color: '#f59e0b',
            fontWeight: 500,
          }}
        >
          Transpuesto
        </span>
      )}
    </div>
  );
}
