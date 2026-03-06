import { useState, useEffect, useCallback } from 'react';
import { ChordViewer } from '../viewer';

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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

        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
          Sintaxis: <code style={{ backgroundColor: '#f3f4f6', padding: '0 0.25rem', borderRadius: '0.25rem' }}>[Acorde](carácter)</code>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, gap: '1rem', minHeight: 0 }}>
        {activeTab === 'editor' ? (
          <textarea
            value={content}
            onChange={handleChange}
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
