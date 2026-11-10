import React from 'react';
import { Head, Link } from '@inertiajs/react';

export default function PendingReview() {
    return (
        <div className="min-h-screen bg-[#FAF0F3] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <Head title="Verification Pending" />

            <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
                <h2 className="text-3xl font-serif font-bold text-gray-800 mt-2">
                    Under Review
                </h2>
                
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    Thank you for submitting your verification documents. Our team is currently reviewing your application. 
                    This usually takes 1-2 business days. We will notify you via email once a decision is made.
                </p>

                <div className="pt-6">
                    <Link
                        href={route('home')}
                        className="btn-secondary"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
