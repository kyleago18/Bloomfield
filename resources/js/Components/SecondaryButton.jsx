export default function SecondaryButton({ type = 'button', className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            type={type}
            className={`btn-secondary cursor-pointer select-none ${disabled && 'opacity-40'} ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
