import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import LiveNavigation from '../Components/LiveNavigation';
import { toLatLng } from '../Services/geoUtils';

export default function Navigate({ destination: destProp, shopName, error: serverError }) {
    const destination = toLatLng(destProp);
    const [active, setActive] = useState(Boolean(destination) && !serverError);

    return (
        <div className="store-shell flex min-h-screen flex-col bg-[var(--bg-soft)]">
            <Head title={`Navigate to ${shopName || 'shop'}`} />

            <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-white/90 backdrop-blur-xl">
                <div className="store-container flex items-center justify-between py-4 md:py-5">
                    <Link href={route('home')} className="font-serif text-2xl font-semibold tracking-tight text-[var(--ink)] transition-colors hover:text-rose">
                        Bloom&amp;Glow
                    </Link>
                    <div className="flex items-center gap-3 text-sm text-[var(--ink-muted)]">
                        <Link href={route('home')} className="hover:text-ink transition-colors">Home</Link>
                        <Link href={route('checkout')} className="hover:text-ink transition-colors">Checkout</Link>
                    </div>
                </div>
            </header>

            {!active && (
                <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
                    <p className="eyebrow mb-4">Navigation</p>
                    <h1 className="font-serif text-4xl font-semibold text-[var(--ink)] mb-3">
                        {destination ? `Ready for ${shopName}` : 'Destination unavailable'}
                    </h1>
                    <p className="mb-10 max-w-md text-[var(--ink-muted)] leading-relaxed">
                        {serverError ||
                            (!destination
                                ? 'Shop destination is missing or invalid.'
                                : `We’ll guide you live from your current location to ${shopName}.`)}
                    </p>

                    {destination ? (
                        <button type="button" onClick={() => setActive(true)} className="btn-primary">
                            Start navigation
                        </button>
                    ) : (
                        <Link href={route('checkout')} className="btn-primary">
                            Back to checkout
                        </Link>
                    )}
                </div>
            )}

            {active && destination && (
                <LiveNavigation
                    destination={destination}
                    shopName={shopName || 'Flower shop'}
                    autoStart
                    onClose={() => setActive(false)}
                />
            )}
        </div>
    );
}
