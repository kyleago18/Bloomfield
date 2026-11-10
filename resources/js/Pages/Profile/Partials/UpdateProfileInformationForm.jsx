import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function UpdateProfileInformation({ mustVerifyEmail, status }) {
    const user = usePage().props.auth.user;
    const todayStr = new Date().toISOString().split('T')[0];
    const [isEditing, setIsEditing] = useState(false);

    const normalizeGender = (val) => {
        if (!val) return '';
        const l = val.toLowerCase();
        if (l === 'male') return 'Male';
        if (l === 'female') return 'Female';
        if (l === 'prefer not to say' || l === 'other') return 'Prefer not to say';
        return val;
    };

    const nameParts = (user?.name || '').split(' ');
    const initialFirstName = nameParts[0] || '';
    const initialLastName = nameParts.slice(1).join(' ') || '';

    const { data, setData, post, errors, processing, recentlySuccessful, reset } = useForm({
        name: user?.name || '',
        email: user?.email || '',
        first_name: initialFirstName,
        last_name: initialLastName,
        mobile_number: user?.mobile_number || '',
        date_of_birth: user?.date_of_birth ? user.date_of_birth.split('T')[0] : '',
        gender: normalizeGender(user?.gender),
        avatar: null,
        _method: 'PATCH',
    });

    const submit = (e) => {
        e.preventDefault();
        const combinedName = `${data.first_name} ${data.last_name}`.trim();
        data.name = combinedName || data.name;
        post(route('profile.update'), {
            onSuccess: () => setIsEditing(false),
        });
    };

    const handleCancel = () => {
        reset();
        setIsEditing(false);
    };

    const labelStyle = "block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5";
    const inputStyle = "w-full rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] text-xs sm:text-sm px-4 py-2.5 font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none border-none transition-all disabled:opacity-75 disabled:cursor-not-allowed";
    const selectStyle = "w-full rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] text-xs sm:text-sm px-4 py-2.5 font-medium text-gray-800 focus:outline-none border-none cursor-pointer transition-all disabled:opacity-75 disabled:cursor-not-allowed";

    return (
        <section className="bg-transparent w-full">
            <header className="mb-6 border-b border-pink-200/40 pb-4 flex items-center justify-between">
                <div>
                    <h2 className="text-lg sm:text-xl font-serif font-semibold text-gray-800 tracking-tight">Personal Information</h2>
                    <p className="mt-0.5 text-xs text-gray-500 font-normal">Update your personal account details and contact information.</p>
                </div>
                {!isEditing && (
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center justify-center px-5 py-2 bg-white text-gray-700 font-semibold text-xs rounded-full shadow-[2px_2px_8px_#e2d7da,-2px_-2px_8px_#ffffff] hover:bg-gray-50 hover:text-[#E91E63] transition-all border border-pink-200/60 uppercase tracking-wider shrink-0"
                    >
                        Edit Profile
                    </button>
                )}
            </header>

            <form onSubmit={submit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label htmlFor="first_name" className={labelStyle}>First Name *</label>
                        <input
                            id="first_name"
                            type="text"
                            className={inputStyle}
                            value={data.first_name}
                            onChange={(e) => setData('first_name', e.target.value)}
                            disabled={!isEditing}
                            required
                        />
                        <InputError className="mt-1" message={errors.first_name} />
                    </div>

                    <div>
                        <label htmlFor="last_name" className={labelStyle}>Last Name *</label>
                        <input
                            id="last_name"
                            type="text"
                            className={inputStyle}
                            value={data.last_name}
                            onChange={(e) => setData('last_name', e.target.value)}
                            disabled={!isEditing}
                            required
                        />
                        <InputError className="mt-1" message={errors.last_name} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label htmlFor="email" className={labelStyle}>Email Address *</label>
                        <input
                            id="email"
                            type="email"
                            className={inputStyle}
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={!isEditing}
                            required
                        />
                        <InputError className="mt-1" message={errors.email} />
                    </div>

                    <div>
                        <label htmlFor="phone" className={labelStyle}>Phone Number</label>
                        <input
                            id="phone"
                            type="tel"
                            className={inputStyle}
                            value={data.mobile_number}
                            onChange={(e) => setData('mobile_number', e.target.value)}
                            disabled={!isEditing}
                            placeholder="09123456789"
                        />
                        <InputError className="mt-1" message={errors.mobile_number} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label htmlFor="birthday" className={labelStyle}>Birthday</label>
                        <input
                            id="birthday"
                            type="date"
                            max={todayStr}
                            className={inputStyle}
                            value={data.date_of_birth}
                            onChange={(e) => setData('date_of_birth', e.target.value)}
                            disabled={!isEditing}
                        />
                        <InputError className="mt-1" message={errors.date_of_birth} />
                    </div>

                    <div>
                        <label htmlFor="gender" className={labelStyle}>Gender</label>
                        <select
                            id="gender"
                            className={selectStyle}
                            value={data.gender}
                            onChange={(e) => setData('gender', e.target.value)}
                            disabled={!isEditing}
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                        <InputError className="mt-1" message={errors.gender} />
                    </div>
                </div>

                {mustVerifyEmail && user?.email_verified_at === null && (
                    <div className="rounded-2xl bg-amber-50/70 p-4 text-xs text-amber-900 border border-amber-200/60">
                        <p className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            Your email address is unverified.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="font-semibold text-amber-800 underline hover:text-amber-950 ml-1"
                            >
                                Resend verification email
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <p className="mt-2 font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                                A new verification link has been sent to your email address.
                            </p>
                        )}
                    </div>
                )}

                {isEditing && (
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-pink-200/40">
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
                                Changes saved
                            </p>
                        </Transition>
                        
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="inline-flex items-center justify-center px-5 py-2.5 bg-gray-200 text-gray-700 font-semibold text-xs rounded-full hover:bg-gray-300 transition-all uppercase tracking-wider"
                        >
                            Cancel
                        </button>

                        <button 
                            type="submit" 
                            disabled={processing}
                            className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white font-semibold text-xs rounded-full shadow-[4px_4px_12px_rgba(233,30,99,0.25)] hover:shadow-lg transition-all uppercase tracking-wider disabled:opacity-50"
                        >
                            {processing ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </form>
        </section>
    );
}
