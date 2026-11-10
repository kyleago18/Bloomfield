import React from 'react';

export default function AccountInformation({ user }) {
    return (
        <section className="bg-transparent w-full">
            <header className="mb-6 border-b border-pink-200/40 pb-4">
                <h2 className="text-lg sm:text-xl font-serif font-semibold text-gray-800 tracking-tight">Account Overview</h2>
                <p className="mt-0.5 text-xs text-gray-500 font-normal">Summary of your account status and verification parameters.</p>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff]">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Joined Date</p>
                    <p className="font-semibold text-xs sm:text-sm text-gray-800">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}
                    </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff]">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Account Status</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="font-semibold text-xs sm:text-sm text-emerald-700">Active</span>
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff]">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Email Verification</p>
                    <div className="flex items-center justify-between mt-1">
                        <p className="font-semibold text-xs sm:text-sm text-gray-800 truncate pr-3">{user?.email}</p>
                        {user?.email_verified_at ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                                Verified
                            </span>
                        ) : (
                            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">
                                Unverified
                            </span>
                        )}
                    </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff]">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Phone Verification</p>
                    <div className="flex items-center justify-between mt-1">
                        <p className="font-semibold text-xs sm:text-sm text-gray-800">{user?.mobile_number || 'Not provided'}</p>
                        {user?.mobile_number ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                                Verified
                            </span>
                        ) : (
                            <button type="button" className="text-xs font-semibold text-[#E91E63] link-hover-scale">Add Phone</button>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
