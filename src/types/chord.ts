export interface ChordPosition {
  chord: string;
  character: string;
  position: number;
  lineIndex: number;
  charIndex: number;
}

export interface ParsedLine {
  originalText: string;
  text: string;
  chords: ChordPosition[];
}

export interface ParsedSong {
  lines: ParsedLine[];
  rawContent: string;
}

export interface ChordParts {
  root: string;
  accidental: string;
  quality: string;
  extension: string;
  bass: string;
}

export type NoteLetter = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';

export type Accidental = '#' | 'b' | '';
