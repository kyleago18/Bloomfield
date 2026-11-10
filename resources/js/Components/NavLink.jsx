import { Link } from '@inertiajs/react';

export default function NavLink({ active = false, className = '', children, ...props }) {
    return (
        <Link
            {...props}
            className={
                'cursor-pointer select-none inline-flex items-center rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 focus:outline-none ' +
                (active
                    ? 'bg-rose-light text-rose-dark '
                    : 'text-ink-muted hover:bg-rose-light/60 hover:text-ink ') +
                className
            }
        >
            {children}
        </Link>
    );
}
