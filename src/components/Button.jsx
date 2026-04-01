import './Button.css';

export function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  icon: Icon,
  onClick,
  className = ''
}) {
  return (
    <button
      className={`btn btn-${variant} ${fullWidth ? 'btn-full' : ''} ${className}`}
      onClick={onClick}
    >
      {Icon && <Icon className="btn-icon" size={20} />}
      {children}
    </button>
  );
}
