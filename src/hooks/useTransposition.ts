import { useState, useCallback, useMemo } from 'react';
import { CHROMATIC_SCALE_SHARP, CHROMATIC_SCALE_FLAT } from '../utils/chordParser';

export type MusicalKey = typeof CHROMATIC_SCALE_SHARP[number];

interface UseTranspositionReturn {
  currentKey: MusicalKey;
  originalKey: MusicalKey;
  useFlats: boolean;
  semitones: number;
  isTransposed: boolean;
  setKey: (key: MusicalKey) => void;
  transpose: (semitones: number) => void;
  transposeUp: () => void;
  transposeDown: () => void;
  reset: () => void;
  toggleFlats: () => void;
}

function getKeyIndex(key: string): number {
  let index = CHROMATIC_SCALE_SHARP.indexOf(key);
  if (index !== -1) return index;
  
  index = CHROMATIC_SCALE_FLAT.indexOf(key);
  if (index !== -1) return index;
  
  return 0;
}

function calculateSemitones(fromKey: string, toKey: string): number {
  const fromIndex = getKeyIndex(fromKey);
  const toIndex = getKeyIndex(toKey);
  
  return toIndex - fromIndex;
}

function normalizeKey(key: string, useFlats: boolean): MusicalKey {
  const index = getKeyIndex(key);
  return useFlats ? CHROMATIC_SCALE_FLAT[index] : CHROMATIC_SCALE_SHARP[index];
}

export function useTransposition(originalKey: MusicalKey = 'C'): UseTranspositionReturn {
  const [currentKey, setCurrentKey] = useState<MusicalKey>(originalKey);
  const [useFlats, setUseFlats] = useState(false);

  const semitones = useMemo(() => {
    return calculateSemitones(originalKey, currentKey);
  }, [originalKey, currentKey]);

  const isTransposed = useMemo(() => {
    return semitones !== 0;
  }, [semitones]);

  const setKey = useCallback((key: MusicalKey) => {
    setCurrentKey(normalizeKey(key, useFlats));
  }, [useFlats]);

  const transpose = useCallback((semitonesDelta: number) => {
    setCurrentKey(prevKey => {
      const currentIndex = getKeyIndex(prevKey);
      let newIndex = (currentIndex + semitonesDelta) % 12;
      if (newIndex < 0) newIndex += 12;
      return useFlats ? CHROMATIC_SCALE_FLAT[newIndex] : CHROMATIC_SCALE_SHARP[newIndex];
    });
  }, [useFlats]);

  const transposeUp = useCallback(() => {
    transpose(1);
  }, [transpose]);

  const transposeDown = useCallback(() => {
    transpose(-1);
  }, [transpose]);

  const reset = useCallback(() => {
    setCurrentKey(normalizeKey(originalKey, useFlats));
  }, [originalKey, useFlats]);

  const toggleFlats = useCallback(() => {
    setUseFlats(prev => {
      const newUseFlats = !prev;
      setCurrentKey(prevKey => normalizeKey(prevKey, newUseFlats));
      return newUseFlats;
    });
  }, []);

  return {
    currentKey,
    originalKey,
    useFlats,
    semitones,
    isTransposed,
    setKey,
    transpose,
    transposeUp,
    transposeDown,
    reset,
    toggleFlats,
  };
}

export { calculateSemitones, getKeyIndex, normalizeKey };
