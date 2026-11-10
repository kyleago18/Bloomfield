import { Head, Link, useForm } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import AddressDropdowns from '@/Components/AddressDropdowns';
import { useState } from 'react';
import { Eye, EyeOff, Store, Flower2 } from 'lucide-react';

export default function SellerRegister({ isAuth, user }) {
    const { data, setData, post, processing, errors } = useForm({
        shop_name: '',
        owner_name: user?.name || '',
        email: user?.email || '',
        phone_number: '',
        password: '',
        password_confirmation: '',
        address: '',
        barangay: '',
        city: '',
        province: '',
        postal_code: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post('/seller/register');
    };

    const inputStyle = "w-full rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] text-xs sm:text-sm px-4 py-3 font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none border-none transition-all";
    const labelStyle = "block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5";

    return (
        <div className="store-shell min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#FAF0F3] relative overflow-hidden font-sans text-gray-700 antialiased">
            <Head title="Open Your Shop — Bloom&Glow" />

            <div className="relative z-10 w-full max-w-5xl">
                
                {/* Brand Logo & Tagline Header */}
                <div className="text-center mb-8">
                    <Link href={route('home')} className="font-serif text-3xl font-semibold text-gray-800 tracking-tight inline-flex items-center gap-2.5 hover:text-[#E91E63] transition-colors duration-300 group">
                        <img
                            src="/images/logo.png"
                            alt="Bloom & Glow Logo"
                            className="w-10 h-10 rounded-full object-cover shadow-xs group-hover:scale-105 transition-transform duration-300"
                        />
                        <span>Bloom <span className="text-[#E91E63] font-sans text-xl">&amp;</span> Glow</span>
                    </Link>
                    <p className="mt-2 text-gray-500 text-xs sm:text-sm font-medium">Start selling your bouquet creations to thousands of flower lovers</p>
                </div>

                {/* Neumorphic Main Card Container */}
                <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 sm:p-8 lg:p-10">
                    
                    <div className="mb-8 border-b border-pink-200/40 pb-4 flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-semibold text-[#E91E63] uppercase tracking-widest">Seller Registration</span>
                            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-gray-800 mt-1">Open your flower shop</h1>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] text-[#E91E63] flex items-center justify-center shrink-0 hidden sm:flex">
                            <Store className="w-6 h-6 stroke-[1.8]" />
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-8">
                        
                        {/* Two Column Layout on Desktop */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                            
                            {/* ────── Left Column: Shop, Contact & Security ────── */}
                            <div className="space-y-6">
                                
                                {/* Shop Information */}
                                <div className="space-y-4">
                                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[#E91E63] border-b border-pink-200/40 pb-2">Shop Information</h2>
                                    
                                    <div>
                                        <label htmlFor="shop_name" className={labelStyle}>Shop Name *</label>
                                        <input
                                            type="text"
                                            id="shop_name"
                                            value={data.shop_name}
                                            onChange={e => setData('shop_name', e.target.value)}
                                            className={inputStyle}
                                            placeholder="e.g. Rose Garden Boutique"
                                            required
                                        />
                                        <InputError message={errors.shop_name} className="mt-1" />
                                    </div>

                                    <div>
                                        <label htmlFor="owner_name" className={labelStyle}>Owner Full Name *</label>
                                        <input
                                            type="text"
                                            id="owner_name"
                                            value={data.owner_name}
                                            onChange={e => setData('owner_name', e.target.value)}
                                            className={inputStyle}
                                            placeholder="e.g. Maria Santos"
                                            required
                                        />
                                        <InputError message={errors.owner_name} className="mt-1" />
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div className="space-y-4">
                                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[#E91E63] border-b border-pink-200/40 pb-2">Contact Details</h2>
                                    
                                    {!isAuth && (
                                        <div>
                                            <label htmlFor="email" className={labelStyle}>Email Address *</label>
                                            <input
                                                type="email"
                                                id="email"
                                                value={data.email}
                                                onChange={e => setData('email', e.target.value)}
                                                className={inputStyle}
                                                placeholder="seller@gmail.com"
                                                required
                                            />
                                            <InputError message={errors.email} className="mt-1" />
                                        </div>
                                    )}

                                    <div>
                                        <label htmlFor="phone_number" className={labelStyle}>Phone Number *</label>
                                        <input
                                            type="text"
                                            id="phone_number"
                                            value={data.phone_number}
                                            onChange={e => setData('phone_number', e.target.value)}
                                            className={inputStyle}
                                            placeholder="09123456789"
                                            required
                                        />
                                        <InputError message={errors.phone_number} className="mt-1" />
                                    </div>
                                </div>

                                {/* Account Security */}
                                {!isAuth && (
                                    <div className="space-y-4">
                                        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#E91E63] border-b border-pink-200/40 pb-2">Account Security</h2>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="password" className={labelStyle}>Password *</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPassword ? 'text' : 'password'}
                                                        id="password"
                                                        value={data.password}
                                                        onChange={e => setData('password', e.target.value)}
                                                        className={inputStyle}
                                                        placeholder="••••••••"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E91E63] transition-colors"
                                                    >
                                                        {showPassword ? <EyeOff className="h-4 w-4 stroke-[1.8]" /> : <Eye className="h-4 w-4 stroke-[1.8]" />}
                                                    </button>
                                                </div>
                                                <InputError message={errors.password} className="mt-1" />
                                            </div>

                                            <div>
                                                <label htmlFor="password_confirmation" className={labelStyle}>Confirm Password *</label>
                                                <div className="relative">
                                                    <input
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        id="password_confirmation"
                                                        value={data.password_confirmation}
                                                        onChange={e => setData('password_confirmation', e.target.value)}
                                                        className={inputStyle}
                                                        placeholder="••••••••"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E91E63] transition-colors"
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="h-4 w-4 stroke-[1.8]" /> : <Eye className="h-4 w-4 stroke-[1.8]" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                            
                            {/* ────── Right Column: Location & Addresses ────── */}
                            <div className="space-y-6 flex flex-col justify-between">
                                
                                <div className="space-y-4">
                                    <h2 className="text-xs font-semibold uppercase tracking-wider text-[#E91E63] border-b border-pink-200/40 pb-2">Shop Location</h2>
                                    
                                    <div>
                                        <label htmlFor="address" className={labelStyle}>Street Address</label>
                                        <input
                                            type="text"
                                            id="address"
                                            value={data.address}
                                            onChange={e => setData('address', e.target.value)}
                                            className={inputStyle}
                                            placeholder="123 Flower Street, Zone 3"
                                        />
                                    </div>

                                    <AddressDropdowns
                                        provinceValue={data.province}
                                        cityValue={data.city}
                                        barangayValue={data.barangay}
                                        onProvinceChange={(val) => setData('province', val)}
                                        onCityChange={(val) => setData('city', val)}
                                        onBarangayChange={(val) => setData('barangay', val)}
                                        variant="neumorphic"
                                        errors={errors}
                                    />

                                    <div>
                                        <label htmlFor="postal_code" className={labelStyle}>Postal Code</label>
                                        <input
                                            type="text"
                                            id="postal_code"
                                            value={data.postal_code}
                                            onChange={e => setData('postal_code', e.target.value)}
                                            className={inputStyle}
                                            placeholder="8002"
                                        />
                                        <InputError message={errors.postal_code} className="mt-1" />
                                    </div>
                                </div>

                                {/* Neumorphic Submit button */}
                                <div className="pt-6 lg:pt-0">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full h-12 rounded-full bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white text-xs sm:text-sm font-semibold uppercase tracking-wider shadow-[4px_4px_12px_rgba(233,30,99,0.25)] hover:shadow-lg transition-all disabled:opacity-50"
                                    >
                                        {processing ? 'Creating your shop...' : 'Open My Shop'}
                                    </button>
                                </div>

                            </div>
                        </div>
                    </form>

                    {/* Bottom Navigation Links */}
                    {!isAuth && (
                        <div className="mt-10 pt-6 border-t border-pink-200/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-gray-500">
                            <p>
                                Already have an account?{' '}
                                <Link href={route('login')} className="font-semibold text-[#E91E63] link-hover-scale">
                                    Sign in
                                </Link>
                            </p>
                            <p>
                                Are you a customer?{' '}
                                <Link href={route('register')} className="font-semibold text-[#E91E63] link-hover-scale">
                                    Customer registration
                                </Link>
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
