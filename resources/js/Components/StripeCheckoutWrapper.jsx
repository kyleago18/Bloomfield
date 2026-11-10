import React, { useMemo } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentForm from './StripePaymentForm';

export default function StripeCheckoutWrapper({
    stripeKey,
    clientSecret,
    onSuccess,
    onError,
    isProcessing,
    setIsProcessing,
}) {
    const stripePromise = useMemo(() => {
        if (!stripeKey) return null;
        return loadStripe(stripeKey);
    }, [stripeKey]);

    const options = useMemo(() => ({
        clientSecret,
        appearance: {
            theme: 'flat',
            variables: {
                colorPrimary: '#E91E63',
                colorBackground: '#FAF0F3',
                colorText: '#1f2937',
                colorDanger: '#e11d48',
                fontFamily: 'Outfit, system-ui, -apple-system, sans-serif',
                borderRadius: '16px',
                spacingUnit: '4px',
            },
            rules: {
                '.Tab': {
                    backgroundColor: '#FAF0F3',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: '3px 3px 6px #e2d7da, -3px -3px 6px #ffffff',
                    borderRadius: '16px',
                    padding: '10px 14px',
                    transition: 'all 0.2s ease',
                },
                '.Tab:hover': {
                    color: '#E91E63',
                    border: '1px solid rgba(233, 30, 99, 0.3)',
                },
                '.Tab--selected': {
                    backgroundColor: '#FAF0F3',
                    border: '1px solid #E91E63',
                    boxShadow: 'inset 2px 2px 5px #e2d7da, inset -2px -2px 5px #ffffff',
                    color: '#E91E63',
                },
                '.Input': {
                    backgroundColor: '#FAF0F3',
                    border: '1px solid rgba(255, 255, 255, 0.8)',
                    boxShadow: 'inset 2px 2px 5px #e2d7da, inset -2px -2px 5px #ffffff',
                    borderRadius: '14px',
                    padding: '12px 14px',
                },
                '.Input:focus': {
                    border: '1px solid #E91E63',
                    boxShadow: 'inset 2px 2px 5px #e2d7da, inset -2px -2px 5px #ffffff, 0 0 0 2px rgba(233, 30, 99, 0.2)',
                },
                '.Label': {
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '4px',
                },
            },
        },
    }), [clientSecret]);

    if (!clientSecret || !stripePromise) {
        return null;
    }

    return (
        <Elements stripe={stripePromise} options={options}>
            <StripePaymentForm
                onSuccess={onSuccess}
                onError={onError}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
            />
        </Elements>
    );
}
