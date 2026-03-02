import type { ParsedLine } from '../../types';
import { parseSong } from '../../utils/chordParser';
import { transposeSongContent } from '../../utils/chordRenderer';

interface ChordViewerProps {
  content: string;
  semitones?: number;
  useFlats?: boolean;
  className?: string;
}

export function ChordViewer({ 
  content, 
  semitones = 0, 
  useFlats = false, 
  className = '' 
}: ChordViewerProps) {
  const transposedContent = semitones !== 0 
    ? transposeSongContent(content, semitones, useFlats)
    : content;
    
  const parsedSong = parseSong(transposedContent);

  return (
    <div className={`font-mono text-sm whitespace-pre ${className}`}>
      {parsedSong.lines.map((line, lineIndex) => (
        <ChordLine key={lineIndex} line={line} />
      ))}
    </div>
  );
}

interface ChordLineProps {
  line: ParsedLine;
}

function ChordLine({ line }: ChordLineProps) {
  if (line.chords.length === 0) {
    return <div style={{ lineHeight: '1.75rem', height: '1.75rem' }}>{line.text || '\u00A0'}</div>;
  }

  const chordPositions = new Set(line.chords.map(c => c.charIndex));

  return (
    <div style={{ position: 'relative', lineHeight: '1.75rem', height: '3.5rem' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, height: '1.75rem' }}>
        {line.chords.map((chord, idx) => (
          <span
            key={idx}
            className="chord-badge"
            style={{
              position: 'absolute',
              left: `${chord.charIndex}ch`,
              transform: 'translateX(0)',
            }}
          >
            {chord.chord}
          </span>
        ))}
      </div>
      <div style={{ paddingTop: '1.25rem' }}>
        {line.text.split('').map((char, idx) => (
          <span
            key={idx}
            style={{
              textDecoration: chordPositions.has(idx) ? 'underline' : 'none',
              textDecorationColor: chordPositions.has(idx) ? '#f59e0b' : undefined,
              textDecorationThickness: chordPositions.has(idx) ? '2px' : undefined,
              textUnderlineOffset: chordPositions.has(idx) ? '3px' : undefined,
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
}
