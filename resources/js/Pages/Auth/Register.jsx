import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Eye, EyeOff, UserPlus, Home } from 'lucide-react';

export default function Register({ error }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);

    const heroImages = ['/images/auth-bg.png', '/images/auth-bg-2.png', '/images/auth-bg-3.png'];
    const [currentImgIndex, setCurrentImgIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImgIndex((prev) => (prev + 1) % heroImages.length);
        }, 9000);
        return () => clearInterval(interval);
    }, []);

    const todayStr = new Date().toISOString().split('T')[0];
    const { data: formData, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        gender: '',
        date_of_birth: '',
        mobile_number: '',
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const setFormData = (newData) => {
        if (typeof newData === 'function') {
            setData(newData(formData));
        } else {
            setData(newData);
        }
    };


    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    const inputStyle = "w-full rounded-2xl bg-white/60 backdrop-blur-md shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_12px_rgba(233,30,99,0.05)] text-xs sm:text-sm px-4 py-3.5 font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:bg-white/90 border border-white/50 transition-all hover:bg-white/80";
    const selectStyle = "w-full rounded-2xl bg-white/60 backdrop-blur-md shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_4px_12px_rgba(233,30,99,0.05)] text-xs sm:text-sm px-4 py-3.5 font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:bg-white/90 border border-white/50 cursor-pointer transition-all hover:bg-white/80";
    const labelStyle = "block text-[11px] sm:text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5 ml-1";

    return (
        <div className="min-h-screen w-full flex bg-white overflow-hidden font-sans text-gray-700 antialiased selection:bg-pink-200 selection:text-pink-900">
            <Head title="Create Customer Account — Bloom&Glow" />

            {/* Left Side: Editorial Image & Quote (Hidden on mobile) */}
            <div className={`relative hidden lg:block lg:w-[55%] xl:w-[60%] h-screen select-none overflow-hidden transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] transform ${mounted ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'}`}>
                {heroImages.map((src, index) => (
                    <div
                        key={src}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImgIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        <img
                            src={src}
                            alt="Bloom & Glow Floral Collection"
                            className="w-full h-full object-cover scale-[1.05]"
                        />
                    </div>
                ))}
                
                {/* Subtle dark-to-transparent gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/40 via-transparent to-transparent z-10" />

                {/* Decorative floating blurred shapes */}
                <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-coral-300/20 rounded-full blur-3xl mix-blend-screen z-10 animate-[pulse_7s_ease-in-out_infinite]" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-300/20 rounded-full blur-3xl mix-blend-screen z-10 animate-[pulse_9s_ease-in-out_infinite_reverse]" />
                
                <div className="absolute inset-x-0 bottom-0 p-12 xl:p-16 z-20 flex flex-col justify-end h-full">
                    <Link 
                        href={route('home')} 
                        className="inline-flex items-center gap-2 text-white/95 text-[11px] font-semibold uppercase tracking-[0.28em] mb-6 hover:text-pink-200 transition-colors duration-300"
                    >
                        <Home className="w-4 h-4 text-pink-300" />
                        BLOOM &amp; GLOW
                    </Link>
                    <h1 className="font-serif text-4xl xl:text-5xl font-semibold text-white leading-tight mb-4 max-w-2xl drop-shadow-md">
                        Join a quieter, premium kind of flower shopping
                    </h1>
                    <p className="text-white/90 text-sm xl:text-base tracking-wide font-normal max-w-md">
                        Fresh bouquets delivered straight from local artisan florists.
                    </p>
                </div>
            </div>

            {/* Right Side: Registration Form */}
            <div className={`w-full lg:w-[45%] xl:w-[40%] flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20 relative z-10 h-screen overflow-y-auto bg-white transition-all duration-1000 delay-100 ease-[cubic-bezier(0.22,1,0.36,1)] transform ${mounted ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}>
                
                {/* 3D background elements for form side */}
                <div className="absolute top-[10%] left-[-10%] w-80 h-80 bg-white/40 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-[5%] right-[-10%] w-96 h-96 bg-pink-100/60 rounded-full blur-3xl pointer-events-none" />

                <div className="mx-auto w-full max-w-[420px] relative z-10 py-10">
                    <Link href={route('home')} className="mb-8 inline-flex items-center gap-3 font-serif text-2xl font-semibold text-gray-800 lg:hidden">
                        <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center p-0.5">
                            <img src="/images/logo.png" alt="" className="w-full h-full rounded-full object-cover" />
                        </div>
                        <span>Bloom <span className="text-[#E91E63] font-sans text-lg">&amp;</span> Glow</span>
                    </Link>
                    
                    <div className="mb-6 flex items-end justify-between border-b border-pink-200/50 pb-4">
                        <div>
                            <span className="text-xs font-semibold text-[#E91E63] uppercase tracking-[0.2em]">User Account</span>
                            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-gray-800 mt-1.5">Create account</h2>
                        </div>
                        <div className="hidden sm:flex w-12 h-12 rounded-full bg-white/80 backdrop-blur-sm shadow-[0_4px_10px_rgba(233,30,99,0.1)] text-[#E91E63] items-center justify-center shrink-0 border border-white">
                            <UserPlus className="w-5 h-5 stroke-[1.8]" />
                        </div>
                    </div>

                    {error && (
                        <div className="mb-5 rounded-2xl bg-rose-50/80 backdrop-blur-sm border border-rose-100 px-5 py-3 text-xs sm:text-sm font-semibold text-rose-700 shadow-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-3.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <label htmlFor="first_name" className={labelStyle}>First Name *</label>
                                <input
                                    id="first_name"
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    className={inputStyle}
                                    autoComplete="given-name"
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    required
                                />
                                <InputError message={errors.first_name} className="mt-1 ml-1" />
                            </div>
                            <div>
                                <label htmlFor="last_name" className={labelStyle}>Last Name *</label>
                                <input
                                    id="last_name"
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    className={inputStyle}
                                    autoComplete="family-name"
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    required
                                />
                                <InputError message={errors.last_name} className="mt-1 ml-1" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            <div>
                                <label htmlFor="gender" className={labelStyle}>Gender</label>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    className={selectStyle}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                                <InputError message={errors.gender} className="mt-1 ml-1" />
                            </div>
                            <div>
                                <label htmlFor="date_of_birth" className={labelStyle}>Date of Birth</label>
                                <input
                                    id="date_of_birth"
                                    type="date"
                                    name="date_of_birth"
                                    max={todayStr}
                                    value={formData.date_of_birth}
                                    className={inputStyle}
                                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                />
                                <InputError message={errors.date_of_birth} className="mt-1 ml-1" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="mobile_number" className={labelStyle}>Mobile Number *</label>
                            <input
                                id="mobile_number"
                                type="tel"
                                name="mobile_number"
                                value={formData.mobile_number}
                                className={inputStyle}
                                placeholder="09123456789"
                                autoComplete="tel"
                                onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                                required
                            />
                            <InputError message={errors.mobile_number} className="mt-1 ml-1" />
                        </div>

                        <div>
                            <label htmlFor="username" className={labelStyle}>Username *</label>
                            <input
                                id="username"
                                type="text"
                                name="username"
                                value={formData.username}
                                className={inputStyle}
                                placeholder="Username"
                                autoComplete="username"
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                            <InputError message={errors.username} className="mt-1 ml-1" />
                        </div>

                        <div>
                            <label htmlFor="email" className={labelStyle}>Email Address *</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                className={inputStyle}
                                autoComplete="email"
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                            <InputError message={errors.email} className="mt-1 ml-1" />
                        </div>

                        <div>
                            <label htmlFor="password" className={labelStyle}>Password *</label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    className={inputStyle}
                                    autoComplete="new-password"
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E91E63] transition-colors p-1"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4 stroke-[1.8]" /> : <Eye className="h-4 w-4 stroke-[1.8]" />}
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-1 ml-1" />
                        </div>

                        <div>
                            <label htmlFor="password_confirmation" className={labelStyle}>Confirm Password *</label>
                            <div className="relative">
                                <input
                                    id="password_confirmation"
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    className={inputStyle}
                                    autoComplete="new-password"
                                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#E91E63] transition-colors p-1"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4 stroke-[1.8]" /> : <Eye className="h-4 w-4 stroke-[1.8]" />}
                                </button>
                            </div>
                            <InputError message={errors.password_confirmation} className="mt-1 ml-1" />
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full h-12 sm:h-14 mt-4 rounded-full bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white text-xs sm:text-sm font-bold uppercase tracking-widest shadow-[0_8px_20px_rgba(233,30,99,0.25)] hover:shadow-[0_12px_25px_rgba(233,30,99,0.35)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                        >
                            Create Account
                        </button>
                    </form>

                    <div className="mt-5">
                        <a
                            href="/auth/google"
                            className="w-full h-12 sm:h-14 rounded-full bg-white/70 backdrop-blur-md shadow-[0_4px_12px_rgba(0,0,0,0.03),inset_0_2px_4px_rgba(255,255,255,0.8)] border border-white/50 hover:bg-white hover:shadow-[0_6px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 active:translate-y-0 text-gray-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all"
                        >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Continue with Google
                        </a>
                    </div>

                    <div className="mt-8 pt-5 border-t border-pink-200/50 text-center text-xs sm:text-sm font-medium text-gray-500 pb-10">
                        Already have an account?{' '}
                        <Link href={route('login')} className="font-semibold text-[#E91E63] hover:text-[#D81B60] transition-colors">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
