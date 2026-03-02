interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({
  label,
  error,
  className = '',
  children,
  ...props
}: SelectProps) {
  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label className="label">
          {label}
        </label>
      )}
      <select
        className={`input ${error ? 'input-error' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#dc2626' }}>{error}</p>}
    </div>
  );
}
