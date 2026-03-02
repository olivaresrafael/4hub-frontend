interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`input ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#dc2626' }}>{error}</p>}
      {helperText && !error && <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#6b7280' }}>{helperText}</p>}
    </div>
  );
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function TextArea({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}: TextAreaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={`input ${error ? 'input-error' : ''} ${className}`}
        style={{ minHeight: '100px' }}
        {...props}
      />
      {error && <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#dc2626' }}>{error}</p>}
      {helperText && !error && <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#6b7280' }}>{helperText}</p>}
    </div>
  );
}
