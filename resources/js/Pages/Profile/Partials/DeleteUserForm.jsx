import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function DeleteUserForm() {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    const inputStyle = "w-full rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] text-xs sm:text-sm px-4 py-2.5 font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none border-none transition-all";

    return (
        <section className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 sm:p-8">
            <header className="mb-6 border-b border-pink-200/40 pb-4">
                <h2 className="text-lg sm:text-xl font-serif font-semibold text-rose-600 tracking-tight flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-600 stroke-[1.8]" />
                    Danger Zone
                </h2>
                <p className="mt-0.5 text-xs text-gray-500 font-normal">
                    Once your account is deleted, all of its resources and data will be permanently purged.
                </p>
            </header>

            <button
                type="button"
                className="px-6 py-2.5 rounded-full bg-rose-50 text-rose-600 shadow-[inset_2px_2px_4px_#e2d7da,inset_-2px_-2px_4px_#ffffff] border border-rose-200/50 font-semibold text-xs uppercase tracking-wider hover:bg-rose-100 transition-all"
                onClick={confirmUserDeletion}
            >
                Delete Account
            </button>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form onSubmit={deleteUser} className="p-6 sm:p-8 bg-[#FAF0F3] rounded-[28px]">
                    <h2 className="text-lg font-serif font-semibold text-gray-800 mb-2">
                        Are you sure you want to delete your account?
                    </h2>

                    <p className="text-xs text-gray-500 leading-relaxed mb-6 font-normal">
                        Once your account is deleted, all of its resources and data will be permanently erased. Please enter your password to confirm account deletion.
                    </p>

                    <div className="space-y-2">
                        <input
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            className={inputStyle}
                            placeholder="Enter your password"
                        />
                        <InputError message={errors.password} className="mt-1" />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-5 py-2.5 rounded-full bg-[#FAF0F3] shadow-[4px_4px_8px_#e2d7da,-4px_-4px_8px_#ffffff] text-gray-600 hover:text-gray-800 text-xs font-semibold uppercase tracking-wider transition-all"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="px-5 py-2.5 rounded-full bg-rose-600 text-white font-semibold text-xs uppercase tracking-wider shadow-[4px_4px_12px_rgba(225,29,72,0.25)] hover:bg-rose-700 transition-all disabled:opacity-50"
                        >
                            Delete Account
                        </button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
