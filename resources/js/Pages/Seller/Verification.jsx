import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import { ShieldCheck, UploadCloud, Building2, CreditCard, ChevronLeft } from 'lucide-react';

export default function Verification({ auth, seller, rejection_reason }) {
    const { data, setData, post, processing, errors } = useForm({
        id_type: '',
        id_photo: null,
        business_permit: null,
        storefront_photo: null,
        bank_name: '',
        bank_account_name: '',
        bank_account_number: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('seller.verification.store'));
    };

    const inputStyle = "w-full rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] text-xs sm:text-sm px-4 py-3 font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none border-none transition-all";
    const labelStyle = "block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5";
    const fileInputStyle = "w-full rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] text-xs sm:text-sm px-4 py-2 font-medium text-gray-700 focus:outline-none border-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer";

    return (
        <div className="store-shell min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#FAF0F3] relative overflow-hidden font-sans text-gray-700 antialiased">
            <Head title="Shop Verification — Bloom&Glow" />

            <div className="relative z-10 w-full max-w-5xl">
                
                {/* Header */}
                <div className="text-center mb-8 relative">
                    <Link href={route('profile.edit')} className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-[#E91E63] transition-colors">
                        <ChevronLeft className="w-4 h-4" /> Back to Profile
                    </Link>
                    <Link href={route('home')} className="font-serif text-3xl font-semibold text-gray-800 tracking-tight inline-flex items-center gap-2.5 hover:text-[#E91E63] transition-colors duration-300 group">
                        <img
                            src="/images/logo.png"
                            alt="Bloom & Glow Logo"
                            className="w-10 h-10 rounded-full object-cover shadow-xs group-hover:scale-105 transition-transform duration-300"
                        />
                        <span>Bloom <span className="text-[#E91E63] font-sans text-xl">&amp;</span> Glow</span>
                    </Link>
                    <p className="mt-2 text-gray-500 text-xs sm:text-sm font-medium">Complete your shop verification to start accepting orders</p>
                </div>

                {/* Neumorphic Main Card */}
                <div className="bg-[#FAF0F3] rounded-[32px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 sm:p-8 lg:p-10">
                    
                    <div className="mb-8 border-b border-pink-200/40 pb-4 flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-teal-600 uppercase tracking-widest">Step 2 of 2</span>
                            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-gray-800 mt-1">Shop Verification</h1>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] text-teal-500 flex items-center justify-center shrink-0 hidden sm:flex">
                            <ShieldCheck className="w-6 h-6 stroke-[1.8]" />
                        </div>
                    </div>

                    {rejection_reason && (
                        <div className="mb-8 p-5 rounded-[20px] bg-rose-50 border border-rose-100 shadow-sm flex items-start gap-4">
                            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                                <ShieldCheck className="w-4 h-4 stroke-[2]" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-rose-800 uppercase tracking-wider mb-1">Verification Rejected</h3>
                                <p className="text-xs text-rose-700 font-medium leading-relaxed">{rejection_reason}</p>
                                <p className="text-[11px] text-rose-600/80 font-medium mt-2">Please correct these issues and submit your documents again.</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-10" encType="multipart/form-data">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                            
                            {/* Left Column */}
                            <div className="space-y-10">
                                
                                {/* Identity */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-2 border-b border-pink-200/40 pb-2">
                                        <div className="w-6 h-6 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center"><ShieldCheck className="w-3.5 h-3.5" /></div>
                                        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800">1. Identity Verification</h2>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="id_type" className={labelStyle}>ID Type *</label>
                                        <select
                                            id="id_type"
                                            value={data.id_type}
                                            onChange={e => setData('id_type', e.target.value)}
                                            className={inputStyle + " appearance-none cursor-pointer"}
                                            required
                                        >
                                            <option value="">Select ID Type</option>
                                            <option value="Passport">Passport</option>
                                            <option value="Driver's License">Driver's License</option>
                                            <option value="National ID">National ID</option>
                                        </select>
                                        <InputError message={errors.id_type} className="mt-1" />
                                    </div>

                                    <div>
                                        <label htmlFor="id_photo" className={labelStyle}>Upload ID Photo *</label>
                                        <input
                                            type="file"
                                            id="id_photo"
                                            onChange={e => setData('id_photo', e.target.files[0])}
                                            className={fileInputStyle}
                                            accept="image/*,.pdf"
                                            required
                                        />
                                        <p className="text-[10px] font-medium text-gray-500 mt-1.5 flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3" /> Stored securely. Never shared publicly.
                                        </p>
                                        <InputError message={errors.id_photo} className="mt-1" />
                                    </div>
                                </div>

                                {/* Business */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-2 border-b border-pink-200/40 pb-2">
                                        <div className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center"><Building2 className="w-3.5 h-3.5" /></div>
                                        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800">2. Business Details (Optional)</h2>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="business_permit" className={labelStyle}>Business Permit</label>
                                        <input
                                            type="file"
                                            id="business_permit"
                                            onChange={e => setData('business_permit', e.target.files[0])}
                                            className={fileInputStyle}
                                            accept="image/*,.pdf"
                                        />
                                        <InputError message={errors.business_permit} className="mt-1" />
                                    </div>

                                    <div>
                                        <label htmlFor="storefront_photo" className={labelStyle}>Storefront Photo</label>
                                        <input
                                            type="file"
                                            id="storefront_photo"
                                            onChange={e => setData('storefront_photo', e.target.files[0])}
                                            className={fileInputStyle}
                                            accept="image/*,.pdf"
                                        />
                                        <InputError message={errors.storefront_photo} className="mt-1" />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-10 flex flex-col justify-between">
                                
                                {/* Bank Details */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-2 border-b border-pink-200/40 pb-2">
                                        <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><CreditCard className="w-3.5 h-3.5" /></div>
                                        <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800">3. Bank Details</h2>
                                    </div>
                                    <p className="text-[11px] font-medium text-gray-500 mb-2">This is where your earnings will be disbursed securely.</p>
                                    
                                    <div>
                                        <label htmlFor="bank_name" className={labelStyle}>Bank Name *</label>
                                        <input
                                            type="text"
                                            id="bank_name"
                                            value={data.bank_name}
                                            onChange={e => setData('bank_name', e.target.value)}
                                            className={inputStyle}
                                            placeholder="e.g. BDO, BPI, GCash"
                                            required
                                        />
                                        <InputError message={errors.bank_name} className="mt-1" />
                                    </div>

                                    <div>
                                        <label htmlFor="bank_account_name" className={labelStyle}>Account Name *</label>
                                        <input
                                            type="text"
                                            id="bank_account_name"
                                            value={data.bank_account_name}
                                            onChange={e => setData('bank_account_name', e.target.value)}
                                            className={inputStyle}
                                            placeholder="John Doe"
                                            required
                                        />
                                        <InputError message={errors.bank_account_name} className="mt-1" />
                                    </div>

                                    <div>
                                        <label htmlFor="bank_account_number" className={labelStyle}>Account Number *</label>
                                        <input
                                            type="text"
                                            id="bank_account_number"
                                            value={data.bank_account_number}
                                            onChange={e => setData('bank_account_number', e.target.value)}
                                            className={inputStyle}
                                            placeholder="0000 0000 0000"
                                            required
                                        />
                                        <InputError message={errors.bank_account_number} className="mt-1" />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-6 lg:pt-0">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full h-14 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-sm font-bold uppercase tracking-widest shadow-[4px_4px_12px_rgba(20,184,166,0.3)] hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50"
                                    >
                                        <UploadCloud className="w-5 h-5 stroke-[2]" />
                                        {processing ? 'Submitting...' : 'Submit Verification'}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
