import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../Contexts/CartContext';
import { Link, router, usePage } from '@inertiajs/react';
import { getProductImage } from '../utils/productImages';
import { getEprioRecommendations, ADD_ONS } from '../utils/eprio';
import { toast } from 'sonner';
import { 
    EnvelopeIcon, 
    TagIcon, 
    SparklesIcon, 
    PencilSquareIcon, 
    GiftIcon, 
    CameraIcon 
} from '@heroicons/react/24/outline';

export default function CartDrawer() {
    const {
        cartItems,
        isCartOpen,
        closeCartDrawer,
        updateQuantity,
        removeFromCart,
        addToCart,
        cartSubtotal,
        selectedAddOns,
        toggleAddOn,
        removeAddOn,
        addOnTotal,
    } = useCart();
    
    const { auth } = usePage().props;

    const [recommendations, setRecommendations] = useState([]);

    const getAddOnIcon = (id) => {
        switch (id) {
            case 'card': return <EnvelopeIcon className="h-5 w-5" />;
            case 'note': return <PencilSquareIcon className="h-5 w-5" />;
            case 'cake_tag': return <TagIcon className="h-5 w-5" />;
            case 'balloon_sticker': return <SparklesIcon className="h-5 w-5" />;
            case 'chocolate_pack': return <GiftIcon className="h-5 w-5" />;
            case 'polaroid_photo': return <CameraIcon className="h-5 w-5" />;
            default: return <SparklesIcon className="h-5 w-5" />;
        }
    };

    useEffect(() => {
        if (cartItems.length === 0) {
            setRecommendations([]);
            return;
        }

        const rankedAddOns = getEprioRecommendations(cartItems);
        // Filter out add-ons that are already selected
        const availableAddOns = rankedAddOns.filter(r => !selectedAddOns.includes(r.id));
        setRecommendations(availableAddOns);
    }, [cartItems, selectedAddOns]);

    return (
        <>
            <div
                className={`fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px] transition-opacity duration-300 ${
                    isCartOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
                }`}
                onClick={closeCartDrawer}
            />

            <aside
                className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-md flex-col bg-[#fffcfb] shadow-2xl transition-transform duration-300 ease-out ${
                    isCartOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
                aria-hidden={!isCartOpen}
            >
                <div className="flex items-center justify-between border-b border-rose/10 px-6 py-5">
                    <div>
                        <p className="eyebrow">Bag</p>
                        <h2 className="font-serif text-2xl font-semibold text-ink">Your selection</h2>
                    </div>
                    <button
                        type="button"
                        onClick={closeCartDrawer}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-rose-light hover:text-rose"
                        aria-label="Close cart"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {cartItems.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center text-center">
                            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-rose-light text-rose">
                                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <p className="font-serif text-xl text-ink mb-2">Your cart is empty</p>
                            <p className="text-sm text-ink-muted mb-8 max-w-[220px]">
                                Discover fresh arrangements waiting for you.
                            </p>
                            <button type="button" onClick={closeCartDrawer} className="btn-secondary">
                                Continue shopping
                            </button>
                        </div>
                    ) : (
                        <>
                            <ul className="space-y-5">
                                {cartItems.map((item) => (
                                    <li key={item.product_id} className="flex gap-4">
                                        <img
                                            src={getProductImage(item)}
                                            alt={item.flower_name}
                                            className="h-20 w-20 rounded-xl object-cover"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="font-medium text-ink truncate">{item.flower_name}</h3>
                                                <button
                                                    type="button"
                                                    onClick={() => removeFromCart(item.product_id)}
                                                    className="text-ink-muted hover:text-rose transition-colors p-3 -mr-3 -mt-3"
                                                    aria-label="Remove item"
                                                >
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                            <p className="mt-0.5 text-sm text-rose font-medium">₱{Number(item.price).toFixed(2)}</p>
                                            <div className="mt-3 inline-flex items-center rounded-full border border-rose/15 bg-white">
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.product_id, -1)}
                                                    className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center text-ink-muted hover:text-rose active:bg-gray-50 rounded-l-full"
                                                >
                                                    −
                                                </button>
                                                <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.product_id, 1)}
                                                    className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center text-ink-muted hover:text-rose active:bg-gray-50 rounded-r-full"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {selectedAddOns.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-rose/10">
                                    <p className="eyebrow mb-4">Selected Add-ons</p>
                                    <ul className="space-y-3">
                                        {selectedAddOns.map((addOnId) => {
                                            const addOn = ADD_ONS.find(a => a.id === addOnId);
                                            if (!addOn) return null;
                                            return (
                                                <li
                                                    key={addOn.id}
                                                    className="flex items-center justify-between rounded-2xl bg-gray-50 border border-gray-200 p-3"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-gray-100 shadow-sm text-gray-600 shrink-0">
                                                            {getAddOnIcon(addOn.id)}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-medium text-gray-800">{addOn.label}</h4>
                                                            <p className="text-xs text-gray-500">{addOn.price > 0 ? `+₱${addOn.price}` : 'Free'}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAddOn(addOn.id)}
                                                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                                        aria-label="Remove add-on"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}

                            {recommendations.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-rose/10">
                                    <p className="eyebrow mb-4">Recommended Add-ons</p>
                                    <ul className="space-y-3">
                                        {recommendations.map((rec) => (
                                            <li
                                                key={rec.id}
                                                className="flex items-center justify-between rounded-2xl bg-white border border-gray-200 p-3 hover:shadow-md hover:border-gray-300 transition-all"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-100 text-gray-500 shrink-0">
                                                        {getAddOnIcon(rec.id)}
                                                    </div>
                                                    <div className="min-w-0 flex-1 pr-2">
                                                        <h4 className="text-sm font-medium text-ink truncate">{rec.label}</h4>
                                                        <p className="text-xs text-ink-muted">{rec.price > 0 ? `+₱${rec.price}` : 'Free'}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleAddOn(rec.id)}
                                                    className="shrink-0 rounded-full bg-gray-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 hover:shadow-md transition-all"
                                                >
                                                    Add
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {cartItems.length > 0 && (
                    <div className="border-t border-rose/10 bg-white/90 px-6 py-5 backdrop-blur-sm">
                        <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm text-ink-muted">Subtotal</span>
                            <span className="font-serif text-2xl text-ink">₱{cartSubtotal.toFixed(2)}</span>
                        </div>
                        <p className="mb-5 text-xs text-ink-muted">Shipping calculated at checkout.</p>
                        <button 
                            onClick={(e) => {
                                e.preventDefault();
                                const user = auth?.user;
                                if (!user) {
                                    toast.info("Please log in or create an account to secure your checkout and easily track your order.");
                                    router.visit('/login');
                                    return;
                                }
                                router.visit('/checkout');
                                closeCartDrawer();
                            }}
                            className="btn-primary w-full"
                        >
                            Proceed to checkout
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
}
