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
    <div className={`font-mono text-sm leading-7 ${className}`} style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
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
    return <div className="min-h-[1.75rem]">&nbsp;</div>;
  }

  const chordMap = new Map<number, string>();
  line.chords.forEach(chord => {
    chordMap.set(chord.charIndex, chord.chord);
  });

  return (
    <div className="flex flex-wrap items-end min-h-[3.5rem]">
      {line.text.split('').map((char, idx) => {
        const chord = chordMap.get(idx);
        return (
          <div
            key={idx}
            className="flex flex-col items-center justify-end"
            style={{
              minWidth: '1ch',
              textAlign: 'center',
            }}
          >
            {chord && (
              <span
                className="text-amber-500 font-semibold text-xs whitespace-nowrap"
                style={{ marginBottom: '2px' }}
              >
                {chord}
              </span>
            )}
            <span
              className={chord ? "text-amber-500 underline decoration-2 underline-offset-2" : ""}
              style={{ lineHeight: 1 }}
            >
              {char}
            </span>
          </div>
        );
      })}
    </div>
  );
}
