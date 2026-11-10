import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import ManageAddresses from './Partials/ManageAddresses';
import PurchasesList from './Partials/PurchasesList';
import CompletedOrders from './Partials/CompletedOrders';
import Sidebar from './Partials/Sidebar';
import AccountInformation from './Partials/AccountInformation';
import SellerInformation from './Partials/SellerInformation';


export default function Edit({ mustVerifyEmail, status, purchases, completed_orders, addresses, sellerStats, userStats, auth }) {
    const user = auth?.user || (typeof usePage !== 'undefined' ? usePage().props.auth.user : null);
    
    // Initialize tab from URL if present
    const queryParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const initialTab = queryParams?.get('tab') || 'profile';
    const [activeTab, setActiveTab] = useState(initialTab);

    return (
        <AuthenticatedLayout>
            <Head title="Account Settings — Bloom&Glow" />

            <div className="min-h-screen bg-[#FAF0F3] py-8 md:py-12 selection:bg-pink-200 selection:text-pink-900">
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 mx-auto">
                    
                    {/* Header Title */}
                    <div className="mb-8 border-b border-pink-200/40 pb-4">
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-800 tracking-tight">Account Settings</h1>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 font-normal">Manage your profile, order history, addresses, and account security.</p>
                    </div>

                    {/* Responsive Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr] gap-8 items-start">
                        
                        {/* Sidebar (Fixed on Desktop, Stacked on Mobile) */}
                        <div className="lg:sticky lg:top-24">
                            <Sidebar user={user} userStats={userStats} activeTab={activeTab} setActiveTab={setActiveTab} />
                        </div>

                        {/* Content Area */}
                        <div className="space-y-6">
                            
                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div className="space-y-6 animate-fade-in-up">
                                    <UpdateProfileInformationForm
                                        mustVerifyEmail={mustVerifyEmail}
                                        status={status}
                                    />
                                    <AccountInformation user={user} />
                                </div>
                            )}

                            {/* Purchases Tab */}
                            {activeTab === 'purchases' && (
                                <div className="animate-fade-in-up">
                                    <PurchasesList purchases={purchases} />
                                </div>
                            )}

                            {/* Completed Orders Tab */}
                            {activeTab === 'completed' && (
                                <div className="animate-fade-in-up">
                                    <CompletedOrders orders={completed_orders} />
                                </div>
                            )}

                            {/* Addresses Tab */}
                            {activeTab === 'addresses' && (
                                <div className="animate-fade-in-up">
                                    <ManageAddresses addresses={addresses} />
                                </div>
                            )}

                            {/* Security Tab */}
                            {activeTab === 'security' && (
                                <div className="space-y-6 animate-fade-in-up">
                                    <UpdatePasswordForm />
                                    <DeleteUserForm />
                                </div>
                            )}


                            {/* Placeholder Tabs */}
                            {(activeTab === 'payment' || activeTab === 'notifications') && (
                                <div className="animate-fade-in-up bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-12 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] text-pink-400 mb-4">
                                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800 font-serif mb-1">Coming Soon</h3>
                                    <p className="text-xs text-gray-500 font-normal">This feature is currently under development.</p>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
