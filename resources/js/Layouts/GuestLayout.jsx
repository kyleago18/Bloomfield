import { Link } from '@inertiajs/react';
import useFlashToast from '@/Hooks/useFlashToast';

export default function GuestLayout({ children }) {
    useFlashToast();

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-10 page-transition">
            <div className="mb-8">
                <Link href={route('home')} className="font-serif text-3xl font-semibold tracking-tight text-gray-900 hover:text-gray-600 transition-colors duration-300 cursor-pointer">
                    Bloom&amp;Glow
                </Link>
            </div>
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 sm:p-10 shadow-xl transition-all duration-300">
                {children}
            </div>
        </div>
    );
}
