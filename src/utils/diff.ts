export interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber: number | null;
}

export function diffLines(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const result: DiffLine[] = [];
  
  const maxLen = Math.max(oldLines.length, newLines.length);
  
  for (let i = 0; i < maxLen; i++) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];
    
    if (oldLine === undefined) {
      result.push({ type: 'added', content: newLine, lineNumber: i + 1 });
    } else if (newLine === undefined) {
      result.push({ type: 'removed', content: oldLine, lineNumber: i + 1 });
    } else if (oldLine === newLine) {
      result.push({ type: 'unchanged', content: oldLine, lineNumber: i + 1 });
    } else {
      result.push({ type: 'removed', content: oldLine, lineNumber: i + 1 });
      result.push({ type: 'added', content: newLine, lineNumber: i + 1 });
    }
  }
  
  return result;
}
