import { useState, useEffect, useCallback, useRef } from 'react';
import { ChordViewer } from '../viewer';
import { ChordPicker } from './ChordPicker';

interface SongEditorProps {
  initialContent?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export function SongEditor({
  initialContent = '',
  onChange,
  placeholder = 'Escribe tu canción aquí...\nUsa [Acorde](carácter) para agregar acordes.\n\nEjemplo: [Em](E)sta es una canción',
  readOnly = false,
}: SongEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [showChordPicker, setShowChordPicker] = useState(false);
  const [chordPickerPosition, setChordPickerPosition] = useState({ top: 0, left: 0 });
  const [selectedChar, setSelectedChar] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setContent(newContent);
      onChange?.(newContent);
    },
    [onChange]
  );

  const insertChord = useCallback((chord: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.substring(0, start);
    const after = content.substring(end);
    
    const selectedText = content.substring(start, end);
    const charToUse = selectedChar || selectedText || '';
    
    const newContent = `${before}[${chord}](${charToUse})${after}`;
    setContent(newContent);
    onChange?.(newContent);
    
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + chord.length + 3 + charToUse.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
    
    setShowChordPicker(false);
    setSelectedChar('');
  }, [content, onChange, selectedChar]);

  const openChordPicker = (char: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPos);
    const lines = textBeforeCursor.split('\n').length - 1;
    
    setSelectedChar(char);
    setChordPickerPosition({ top: 50, left: 16 });
    setShowChordPicker(true);
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === '[' && !showChordPicker) {
      e.preventDefault();
      openChordPicker('');
    } else if (e.key === 'Tab' && showChordPicker) {
      e.preventDefault();
    }
  }, [showChordPicker]);

  const handleChordButtonClick = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    
    openChordPicker(selectedText);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        borderBottom: '1px solid #e5e7eb', 
        paddingBottom: '0.5rem', 
        marginBottom: '1rem' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            style={{
              padding: '0.375rem 0.75rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'editor' ? '#e0f2fe' : 'transparent',
              color: activeTab === 'editor' ? '#0369a1' : '#4b5563',
            }}
          >
            Editor
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            style={{
              padding: '0.375rem 0.75rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              borderRadius: '0.375rem',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'preview' ? '#e0f2fe' : 'transparent',
              color: activeTab === 'preview' ? '#0369a1' : '#4b5563',
            }}
          >
            Vista Previa
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
            Sintaxis: <code style={{ backgroundColor: '#f3f4f6', padding: '0 0.25rem', borderRadius: '0.25rem' }}>[Acorde](carácter)</code>
          </span>
          {activeTab === 'editor' && !readOnly && (
            <button
              type="button"
              onClick={handleChordButtonClick}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                fontWeight: 500,
                borderRadius: '0.375rem',
                border: '1px solid #d1d5db',
                cursor: 'pointer',
                backgroundColor: 'white',
                color: '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              + Acorde
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: '1rem', minHeight: 0, position: 'relative' }}>
        {activeTab === 'editor' ? (
          <>
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              readOnly={readOnly}
              style={{
                width: '100%',
                height: '100%',
                padding: '1rem',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              spellCheck={false}
            />
            {showChordPicker && (
              <div style={{ position: 'absolute', top: chordPickerPosition.top, left: chordPickerPosition.left, zIndex: 50 }}>
                <ChordPicker
                  onSelect={insertChord}
                  onClose={() => { setShowChordPicker(false); setSelectedChar(''); }}
                />
              </div>
            )}
          </>
        ) : (
          <div
            style={{
              flex: 1,
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '1rem',
              overflow: 'auto',
              backgroundColor: '#f9fafb',
            }}
          >
            {content ? (
              <ChordViewer content={content} />
            ) : (
              <div style={{ color: '#9ca3af', fontSize: '0.875rem', fontStyle: 'italic' }}>
                La vista previa aparecerá aquí...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
