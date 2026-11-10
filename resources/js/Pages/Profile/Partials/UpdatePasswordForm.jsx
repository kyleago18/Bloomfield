import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { useRef } from 'react';
import { Shield } from 'lucide-react';

export default function UpdatePasswordForm() {
    const user = usePage().props.auth?.user;
    const isGoogleUser = Boolean(user?.google_id);

    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    const labelStyle = "block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5";
    const inputStyle = "w-full rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] text-xs sm:text-sm px-4 py-2.5 font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none border-none transition-all";

    return (
        <section className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 sm:p-8">
            <header className="mb-6 border-b border-pink-200/40 pb-4">
                <h2 className="text-lg sm:text-xl font-serif font-semibold text-gray-800 tracking-tight flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#E91E63] stroke-[1.8]" />
                    Security Settings
                </h2>
                <p className="mt-0.5 text-xs text-gray-500 font-normal">Ensure your account is using a strong password to stay secure.</p>
            </header>

            {isGoogleUser ? (
                <div className="flex items-center gap-4 bg-white/80 p-5 rounded-2xl border border-pink-200/50 shadow-xs">
                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0 text-[#E91E63]">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Google Single Sign-On Active</h4>
                        <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
                            Your account is signed in using Google. Password changes are managed directly through your Google Account settings.
                        </p>
                    </div>
                </div>
            ) : (
                <form onSubmit={updatePassword} className="space-y-5">
                    <div>
                        <label htmlFor="current_password" className={labelStyle}>Current Password</label>
                        <input
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) => setData('current_password', e.target.value)}
                            type="password"
                            className={inputStyle}
                            autoComplete="current-password"
                        />
                        <InputError message={errors.current_password} className="mt-1" />
                    </div>

                    <div>
                        <label htmlFor="password" className={labelStyle}>New Password</label>
                        <input
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type="password"
                            className={inputStyle}
                            autoComplete="new-password"
                        />
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <div>
                        <label htmlFor="password_confirmation" className={labelStyle}>Confirm Password</label>
                        <input
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            type="password"
                            className={inputStyle}
                            autoComplete="new-password"
                        />
                        <InputError message={errors.password_confirmation} className="mt-1" />
                    </div>

                    <div className="flex items-center justify-end gap-4 pt-3 border-t border-pink-200/40">
                        <Transition
                            show={recentlySuccessful}
                            enter="transition ease-out duration-300"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-200"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                Password updated
                            </p>
                        </Transition>
                        
                        <button 
                            type="submit" 
                            disabled={processing}
                            className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white font-semibold text-xs rounded-full shadow-[4px_4px_12px_rgba(233,30,99,0.25)] hover:shadow-lg transition-all uppercase tracking-wider disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            )}
        </section>
    );
}
