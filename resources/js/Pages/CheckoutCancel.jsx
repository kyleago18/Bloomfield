import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function CheckoutCancel() {
    return (
        <div className="store-shell flex min-h-screen items-center justify-center px-4 py-16">
            <Head title="Payment Cancelled" />

            <div className="w-full max-w-md rounded-3xl border border-rose/10 bg-white/85 p-10 text-center shadow-soft backdrop-blur-sm">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-light text-rose">
                    <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
                <p className="eyebrow mb-3">Cancelled</p>
                <h2 className="font-serif text-3xl font-semibold text-ink mb-3">Payment cancelled</h2>
                <p className="mb-8 text-ink-muted leading-relaxed">
                    No charges were made. You can return to checkout whenever you’re ready.
                </p>
                <div className="space-y-3">
                    <Link href={route('checkout')} className="btn-primary w-full">
                        Return to checkout
                    </Link>
                    <Link href={route('home')} className="btn-secondary w-full">
                        Back home
                    </Link>
                </div>
            </div>
        </div>
    );
}
