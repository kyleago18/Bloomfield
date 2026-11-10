import React, { useState } from 'react';
import { PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { ShieldCheck, Lock } from 'lucide-react';

export default function StripePaymentForm({ onSuccess, onError, isProcessing, setIsProcessing }) {
    const stripe = useStripe();
    const elements = useElements();
    const [localError, setLocalError] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);
        setLocalError(null);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: `${window.location.origin}/checkout/success`,
                },
                redirect: 'if_required',
            });

            if (error) {
                const message = error.message || 'Payment failed. Please review your details and try again.';
                setLocalError(message);
                onError?.(message);
                setIsProcessing(false);
                return;
            }

            if (paymentIntent?.status === 'succeeded' || paymentIntent?.status === 'processing') {
                await onSuccess(paymentIntent.id);
            } else {
                const message = 'Payment was not completed. Please try again.';
                setLocalError(message);
                onError?.(message);
                setIsProcessing(false);
            }
        } catch (err) {
            const msg = err?.message || 'An unexpected error occurred during payment processing.';
            setLocalError(msg);
            onError?.(msg);
            setIsProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-3 space-y-4">
            <div className="rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] border border-white/80 p-3 sm:p-4">
                <PaymentElement
                    options={{
                        layout: {
                            type: 'tabs',
                            defaultCollapsed: false,
                        },
                        wallets: {
                            applePay: 'auto',
                            googlePay: 'auto',
                        },
                    }}
                />
            </div>

            {localError && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-700 font-medium">
                    {localError}
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || !elements || isProcessing}
                className="w-full py-3.5 px-4 text-xs tracking-wider uppercase font-semibold rounded-full bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white shadow-[4px_4px_12px_rgba(233,30,99,0.25)] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isProcessing ? (
                    <>
                        <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Processing Payment...</span>
                    </>
                ) : (
                    <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Confirm &amp; Pay</span>
                    </>
                )}
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-gray-400 font-medium pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>256-bit encrypted checkout powered by Stripe</span>
            </div>
        </form>
    );
}
