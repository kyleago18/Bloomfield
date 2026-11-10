import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({ active = false, className = '', children, ...props }) {
    return (
        <Link
            {...props}
            className={
                'flex w-full items-start rounded-xl py-2.5 pe-4 ps-3 text-base font-medium transition duration-150 ease-in-out focus:outline-none ' +
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
