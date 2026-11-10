import React, { useEffect, useRef } from 'react';
import useNavigation from '../Hooks/useNavigation';
import NavigationMap from './NavigationMap';

export default function LiveNavigation({
    destination,
    shopName = 'Flower shop',
    onClose,
    autoStart = true,
}) {
    const nav = useNavigation(destination, { shopName });
    const startedRef = useRef(false);

    useEffect(() => {
        if (autoStart && nav.destinationValid && !startedRef.current) {
            startedRef.current = true;
            nav.startNavigation();
        }
    }, [autoStart, nav.destinationValid, nav.startNavigation]);

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prev;
        };
    }, []);

    const handleEnd = () => {
        nav.stopNavigation();
        onClose?.();
    };

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-ink">
            <div className="relative min-h-0 flex-1">
                <NavigationMap
                    userLocation={nav.userLocation}
                    shopLocation={destination}
                    routeData={nav.routeCoords}
                    heading={nav.heading}
                    accuracy={nav.accuracy}
                    followUser={nav.isNavigating && !nav.arrived}
                    navigationMode
                />

                {/* Top maneuver card */}
                {nav.isNavigating && !nav.arrived && nav.currentStep && (
                    <div className="nav-banner-enter absolute left-4 right-4 top-4 z-[1000] md:left-6 md:right-auto md:max-w-md">
                        <div className="nav-glass flex items-center gap-4 rounded-2xl px-4 py-3.5">
                            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-ink text-2xl text-white">
                                {nav.currentStep.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose">
                                    {nav.currentStep.distanceStr}
                                </p>
                                <p className="truncate text-base font-semibold leading-snug text-ink">
                                    {nav.currentStep.instruction}
                                </p>
                                {nav.nextStep && (
                                    <p className="mt-0.5 truncate text-xs text-ink-muted">
                                        Then {nav.nextStep.instruction}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {(nav.isStarting || nav.isRerouting) && (
                    <div className="absolute right-4 top-4 z-[1000]">
                        <span className="nav-glass inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold text-ink">
                            <span className="h-2 w-2 animate-pulse rounded-full bg-rose" />
                            {nav.isStarting ? 'Starting…' : 'Rerouting…'}
                        </span>
                    </div>
                )}

                {(nav.error || nav.gpsWarning) && (
                    <div className="absolute bottom-40 left-4 right-4 z-[1000] md:bottom-44">
                        <div
                            className={`nav-sheet-enter rounded-2xl px-4 py-3.5 text-sm shadow-soft ${
                                nav.error
                                    ? 'border border-red-200 bg-red-50 text-red-800'
                                    : 'border border-amber-200 bg-amber-50 text-amber-900'
                            }`}
                        >
                            {nav.error || nav.gpsWarning}
                            {nav.error && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        startedRef.current = true;
                                        nav.startNavigation();
                                    }}
                                    className="mt-2 block text-sm font-semibold text-rose underline"
                                >
                                    Try again
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {nav.arrived && (
                    <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-ink/45 px-6 backdrop-blur-[2px]">
                        <div className="nav-sheet-enter w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-lift">
                            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-light text-2xl text-rose">
                                ✓
                            </div>
                            <h3 className="font-serif text-2xl font-semibold text-ink mb-2">You’ve arrived</h3>
                            <p className="mb-7 text-sm text-ink-muted leading-relaxed">
                                Welcome to {shopName}. Enjoy your flowers.
                            </p>
                            <button type="button" onClick={handleEnd} className="btn-primary w-full">
                                End navigation
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom sheet */}
            <div className="nav-sheet-enter relative z-[1000] rounded-t-3xl bg-[#fffcfb] px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(42,36,38,0.12)]">
                <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-rose/20" />

                <div className="mb-4 h-1 overflow-hidden rounded-full bg-rose-light">
                    <div
                        className="h-full rounded-full bg-rose transition-all duration-500 ease-out"
                        style={{ width: `${Math.round((nav.progress || 0) * 100)}%` }}
                    />
                </div>

                <div className="mb-5 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-white border border-rose/10 px-3 py-3 text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Distance</p>
                        <p className="mt-1 font-serif text-xl text-ink">{nav.remainingDistKmStr || '—'}</p>
                    </div>
                    <div className="rounded-2xl bg-white border border-rose/10 px-3 py-3 text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Time</p>
                        <p className="mt-1 font-serif text-xl text-ink">{nav.remainingTimeStr || '—'}</p>
                    </div>
                    <div className="rounded-2xl bg-white border border-rose/10 px-3 py-3 text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">ETA</p>
                        <p className="mt-1 font-serif text-xl text-ink">{nav.etaClockStr || '—'}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-ink-muted">
                            To <span className="font-semibold text-ink">{shopName}</span>
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleEnd}
                        className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink/90"
                    >
                        End
                    </button>
                </div>

            </div>
        </div>
    );
}
