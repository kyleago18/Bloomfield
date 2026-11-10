import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';

export default function VerifyEmail({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        otp: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('verification.verify.otp'));
    };

    const resend = () => {
        post(route('verification.send'), {
            onSuccess: () => reset('otp')
        });
    }

    return (
        <GuestLayout>
            <Head title="Email Verification" />

            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Account</p>
            <h1 className="font-serif text-2xl font-semibold text-gray-900 mb-3">Verify your email</h1>
            <p className="mb-8 text-sm text-gray-500 leading-relaxed">
                Thanks for signing up! We've sent a 6-digit verification code to your email address. Please enter it below.
            </p>

            {status === 'verification-link-sent' && (
                <div className="mb-6 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 border border-emerald-100">
                    A new verification code has been sent to your email.
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="otp" className="block text-[11px] font-bold uppercase tracking-widest text-gray-600 mb-2">
                        6-Digit Verification Code
                    </label>
                    
                    <input
                        id="otp"
                        type="text"
                        name="otp"
                        value={data.otp}
                        className="mt-1 block w-full text-center text-3xl tracking-[0.5em] font-mono border-gray-300 focus:border-gray-900 focus:ring-gray-900 rounded-lg py-4 shadow-sm transition-colors"
                        onChange={(e) => setData('otp', e.target.value)}
                        required
                        maxLength={6}
                        placeholder="••••••"
                        autoFocus
                    />

                    <InputError message={errors.otp} className="mt-3 text-center font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 shadow-sm animate-pulse" />
                </div>

                <button 
                    type="submit"
                    className="w-full justify-center bg-gray-900 text-white rounded-lg py-3.5 text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 mt-2"
                    disabled={processing || data.otp.length !== 6}
                >
                    Verify Code
                </button>

                <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-gray-100">
                    <button 
                        onClick={resend} 
                        type="button" 
                        className="w-full justify-center text-center bg-white border border-gray-300 text-gray-700 rounded-lg py-3 text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Resend verification code
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}

