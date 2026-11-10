export default function InputLabel({ value, className = '', children, ...props }) {
    return (
        <label
            {...props}
            className={`field-label ${className}`}
        >
            {value ? value : children}
        </label>
    );
}
