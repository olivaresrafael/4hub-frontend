import { useState, useRef, useEffect, useCallback } from 'react';

const CHORDS = [
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B',
  'Cm', 'C#m', 'Dbm', 'Dm', 'D#m', 'Ebm', 'Em', 'Fm', 'F#m', 'Gbm', 'Gm', 'G#m', 'Abm', 'Am', 'A#m', 'Bbm', 'Bm',
  'C7', 'C#7', 'Db7', 'D7', 'D#7', 'Eb7', 'E7', 'F7', 'F#7', 'Gb7', 'G7', 'G#7', 'Ab7', 'A7', 'A#7', 'Bb7', 'B7',
  'Cmaj7', 'C#maj7', 'Dbmaj7', 'Dmaj7', 'D#maj7', 'Ebmaj7', 'Emaj7', 'Fmaj7', 'F#maj7', 'Gbmaj7', 'Gmaj7', 'G#maj7', 'Abmaj7', 'Amaj7', 'A#maj7', 'Bbmaj7', 'Bmaj7',
  'Cm7', 'C#m7', 'Dbm7', 'Dm7', 'D#m7', 'Ebm7', 'Em7', 'Fm7', 'F#m7', 'Gbm7', 'Gm7', 'G#m7', 'Abm7', 'Am7', 'A#m7', 'Bbm7', 'Bm7',
  'Csus2', 'Csus4', 'Dsus2', 'Dsus4', 'Esus2', 'Esus4', 'Fsus2', 'Fsus4', 'Gsus2', 'Gsus4', 'Asus2', 'Asus4', 'Bsus2', 'Bsus4',
  'Cadd9', 'Dadd9', 'Eadd9', 'Fadd9', 'Gadd9', 'Aadd9', 'Badd9',
];

interface ChordPickerProps {
  onSelect: (chord: string) => void;
  onClose: () => void;
  initialValue?: string;
}

export function ChordPicker({ onSelect, onClose, initialValue = '' }: ChordPickerProps) {
  const [search, setSearch] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const filteredChords = CHORDS.filter(chord => 
    chord.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 15);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredChords.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredChords[selectedIndex]) {
        onSelect(filteredChords[selectedIndex]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (filteredChords[selectedIndex]) {
        onSelect(filteredChords[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        zIndex: 50,
        width: '220px',
        maxHeight: '280px',
        overflow: 'auto',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div style={{ padding: '0.5rem', borderBottom: '1px solid #e5e7eb' }}>
        <input
          ref={inputRef}
          type="text"
          placeholder="Buscar acorde..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            width: '100%',
            padding: '0.5rem',
            fontSize: '0.875rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            outline: 'none',
          }}
        />
      </div>
      <div style={{ maxHeight: '200px', overflow: 'auto' }}>
        {filteredChords.length === 0 ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
            No hay resultados
          </div>
        ) : (
          filteredChords.map((chord, index) => (
            <button
              key={chord}
              type="button"
              onClick={() => onSelect(chord)}
              onMouseEnter={() => setSelectedIndex(index)}
              style={{
                display: 'block',
                width: '100%',
                padding: '0.5rem 1rem',
                textAlign: 'left',
                fontSize: '0.875rem',
                color: '#374151',
                backgroundColor: index === selectedIndex ? '#e0f2fe' : 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {chord}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
