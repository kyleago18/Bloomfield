import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <p className="eyebrow mb-2">Account</p>
            <h1 className="font-serif text-2xl font-semibold text-ink mb-3">Reset password</h1>
            <p className="mb-6 text-sm text-ink-muted leading-relaxed">
                Enter your email and we’ll send a reset link.
            </p>

            {status && (
                <div className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <label htmlFor="email" className="field-label">Email</label>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        isFocused
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <PrimaryButton className="w-full" disabled={processing}>
                    Email reset link
                </PrimaryButton>

                <div className="mt-4 text-center">
                    <Link
                        href={route('login')}
                        className="text-xs font-semibold text-rose-dark link-hover-scale"
                    >
                        Back to login
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
