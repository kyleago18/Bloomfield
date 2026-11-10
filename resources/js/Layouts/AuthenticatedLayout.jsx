import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import NotificationDropdown from '@/Components/NotificationDropdown';
import useFlashToast from '@/Hooks/useFlashToast';
import StoreHeader from '@/Components/StoreHeader';

export default function AuthenticatedLayout({ header, children }) {
    useFlashToast();
    const user = usePage().props.auth.user;
    const { url } = usePage();
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);

    return (
        <div className="min-h-screen bg-[#fafafc] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-100/30 via-[#fafafc] to-indigo-50/40 flex flex-col font-sans text-[15px] antialiased">
            <StoreHeader auth={usePage().props.auth} />

            {user && user.role === 'customer' && (!user.gender || !user.date_of_birth) && !url.startsWith('/profile') && (
                <div className="bg-rose-50/80 backdrop-blur-md border-b border-rose-100 px-4 py-2.5 text-xs sm:text-sm text-rose-800">
                    <div className="mx-auto max-w-7xl w-full flex items-center justify-between">
                        <span className="font-medium flex items-center gap-2">
                            <svg className="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Complete your profile by adding your gender and date of birth.
                        </span>
                        <Link href={route('profile.edit')} className="font-semibold text-rose-700 underline hover:text-rose-900 ml-4 shrink-0">
                            Update profile
                        </Link>
                    </div>
                </div>
            )}

            {header && (
                <header className="border-b border-white/40 bg-white/30 backdrop-blur-xl shadow-[0_4px_24px_-8px_rgba(0,0,0,0.02)]">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{header}</div>
                </header>
            )}

            <main key={url} className="page-transition">{children}</main>
        </div>
    );
}
