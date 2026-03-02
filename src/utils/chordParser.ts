import type { ChordPosition, ParsedLine, ParsedSong, ChordParts, NoteLetter } from '../types';

const NOTE_LETTERS: NoteLetter[] = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const CHROMATIC_SCALE_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const CHROMATIC_SCALE_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export function parseLine(text: string, lineIndex: number): ParsedLine {
  const chords: ChordPosition[] = [];
  let cleanText = '';
  const originalText = text;
  let lastEnd = 0;

  const pattern = /\[([^\]]+)\]\(([^\)]+)\)/g;
  let match;

  while ((match = pattern.exec(text)) !== null) {
    cleanText += text.slice(lastEnd, match.index);
    
    const chord = match[1];
    const targetChar = match[2];
    const charIndex = cleanText.length;
    
    chords.push({
      chord,
      character: targetChar,
      position: match.index,
      lineIndex,
      charIndex,
    });
    
    cleanText += targetChar;
    lastEnd = match.index + match[0].length;
  }
  
  cleanText += text.slice(lastEnd);

  return {
    originalText,
    text: cleanText,
    chords,
  };
}

export function parseSong(content: string): ParsedSong {
  const lines = content.split('\n');
  const parsedLines = lines.map((line, index) => parseLine(line, index));

  return {
    lines: parsedLines,
    rawContent: content,
  };
}

export function extractUniqueChords(content: string): string[] {
  const chords = new Set<string>();
  const pattern = /\[([^\]]+)\]\([^\)]+\)/g;
  let match;

  while ((match = pattern.exec(content)) !== null) {
    chords.add(match[1]);
  }

  return Array.from(chords);
}

export function isValidChord(chord: string): boolean {
  if (!chord || chord.length === 0) return false;

  const parsed = parseChordParts(chord);
  
  if (!parsed) return false;
  
  if (!NOTE_LETTERS.includes(parsed.root as NoteLetter)) return false;

  return true;
}

export function parseChordParts(chord: string): ChordParts | null {
  const regex = /^([A-G])([#b])?(m|maj|min|dim|aug|sus2|sus4)?(7|maj7|min7|m7|dim7|aug7|mMaj7)?(9|11|13|add9|add11|add13)?(\/([A-G][#b]?))?$/;
  const match = chord.match(regex);

  if (!match) return null;

  return {
    root: match[1] || '',
    accidental: match[2] || '',
    quality: match[3] || '',
    extension: (match[4] || '') + (match[5] || ''),
    bass: match[7] || '',
  };
}

export function getNoteIndex(note: string): number {
  const sharpIndex = CHROMATIC_SCALE_SHARP.indexOf(note);
  if (sharpIndex !== -1) return sharpIndex;
  
  const flatIndex = CHROMATIC_SCALE_FLAT.indexOf(note);
  if (flatIndex !== -1) return flatIndex;
  
  return -1;
}

export function transposeNote(note: string, semitones: number, useFlats = false): string {
  const noteIndex = getNoteIndex(note);
  if (noteIndex === -1) return note;

  let newIndex = (noteIndex + semitones) % 12;
  if (newIndex < 0) newIndex += 12;

  return useFlats ? CHROMATIC_SCALE_FLAT[newIndex] : CHROMATIC_SCALE_SHARP[newIndex];
}

export function transposeChord(chord: string, semitones: number, useFlats = false): string {
  const parts = parseChordParts(chord);
  if (!parts) return chord;

  const rootNote = parts.root + parts.accidental;
  const transposedRoot = transposeNote(rootNote, semitones, useFlats);
  
  let transposedBass = '';
  if (parts.bass) {
    transposedBass = '/' + transposeNote(parts.bass, semitones, useFlats);
  }

  return transposedRoot + parts.quality + parts.extension + transposedBass;
}

export function detectKey(content: string): string | null {
  const chords = extractUniqueChords(content);
  if (chords.length === 0) return null;

  const firstChord = parseChordParts(chords[0]);
  if (!firstChord) return null;

  return firstChord.root + firstChord.accidental;
}

export function validateChordSyntax(content: string): { line: number; message: string }[] {
  const errors: { line: number; message: string }[] = [];
  const lines = content.split('\n');

  lines.forEach((line, lineIndex) => {
    const pattern = /\[([^\]]+)\]\([^\)]+\)/g;
    let match;

    while ((match = pattern.exec(line)) !== null) {
      const chord = match[1];
      if (!isValidChord(chord)) {
        errors.push({
          line: lineIndex + 1,
          message: `Acorde inválido: "${chord}"`,
        });
      }
    }
  });

  return errors;
}

export { CHROMATIC_SCALE_SHARP, CHROMATIC_SCALE_FLAT, NOTE_LETTERS };
