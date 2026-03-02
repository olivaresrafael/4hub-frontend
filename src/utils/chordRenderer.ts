import type { ParsedSong, ParsedLine } from '../types';
import { transposeChord } from './chordParser';

export interface RenderPosition {
  chord: string;
  x: number;
  charIndex: number;
}

export interface RenderedLine {
  text: string;
  positions: RenderPosition[];
}

const CHAR_WIDTH = 9.6;
const CHORD_OFFSET = 0;

export function calculateLinePositions(line: ParsedLine, charWidth = CHAR_WIDTH): RenderedLine {
  const positions: RenderPosition[] = [];

  for (const chord of line.chords) {
    positions.push({
      chord: chord.chord,
      x: chord.charIndex * charWidth + CHORD_OFFSET,
      charIndex: chord.charIndex,
    });
  }

  return {
    text: line.text,
    positions,
  };
}

export function calculateSongPositions(
  parsedSong: ParsedSong,
  charWidth = CHAR_WIDTH
): RenderedLine[] {
  return parsedSong.lines.map((line) => calculateLinePositions(line, charWidth));
}

export function transposeSongContent(content: string, semitones: number, useFlats = false): string {
  return content.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, (_match: string, chord: string, char: string) => {
    const transposed = transposeChord(chord, semitones, useFlats);
    return `[${transposed}](${char})`;
  });
}

export function getChordWidth(chord: string): number {
  return chord.length * CHAR_WIDTH;
}

export function handleOverlapping(positions: RenderPosition[], minGap = 2): RenderPosition[] {
  if (positions.length <= 1) return positions;

  const sorted = [...positions].sort((a, b) => a.charIndex - b.charIndex);
  const result: RenderPosition[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = result[result.length - 1];
    const curr = sorted[i];

    const prevEnd = prev.x + getChordWidth(prev.chord);
    const minStart = prevEnd + minGap;

    if (curr.x < minStart) {
      result.push({
        ...curr,
        x: minStart,
      });
    } else {
      result.push(curr);
    }
  }

  return result;
}
