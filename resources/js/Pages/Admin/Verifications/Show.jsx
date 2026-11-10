import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ShieldCheckIcon, DocumentIcon, ArrowLeftIcon, PhotoIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import Modal from '@/Components/Modal';

export default function VerificationShow({ seller }) {
    const { auth } = usePage().props;
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [isFocused, setIsFocused] = useState(true);

    const approveForm = useForm({});
    const rejectForm = useForm({
        reason: '',
    });

    const confirmApprove = () => {
        approveForm.post(route('admin.verifications.approve', seller.id));
    };

    const handleReject = (e) => {
        e.preventDefault();
        rejectForm.post(route('admin.verifications.reject', seller.id), {
            onSuccess: () => setIsRejectModalOpen(false),
        });
    };

    // Focus-loss blur mechanic
    useEffect(() => {
        const onFocus = () => setIsFocused(true);
        const onBlur = () => setIsFocused(false);

        window.addEventListener('focus', onFocus);
        window.addEventListener('blur', onBlur);

        return () => {
            window.removeEventListener('focus', onFocus);
            window.removeEventListener('blur', onBlur);
        };
    }, []);

    // Helper for secure document URLs
    const getSecureDocUrl = (path) => path ? route('admin.verifications.document', encodeURIComponent(path)) : null;

    const SecureImage = ({ path, label }) => {
        const url = getSecureDocUrl(path);
        
        if (!url) return (
            <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-gray-400">
                <PhotoIcon className="w-8 h-8 mb-2" />
                <span className="text-sm">Not provided</span>
            </div>
        );

        return (
            <div className="relative group rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                <img 
                    src={url} 
                    alt={label}
                    className="w-full h-auto min-h-[200px] object-cover"
                    onContextMenu={(e) => e.preventDefault()}
                    draggable="false"
                />
            </div>
        );
    };

    return (
        <AdminLayout title={`Review - ${seller.shop_name}`}>
            <Head title={`Review: ${seller.shop_name} - Admin`} />
            
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center gap-4">
                    <Link href={route('admin.verifications.index')} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                        <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-serif font-semibold text-bloom-text flex items-center gap-2">
                            Review Application: {seller.shop_name}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">Carefully verify the provided documents before approving.</p>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Pane: Text Details */}
                    <div className="w-full lg:w-1/3 space-y-6">
                        <div className="bg-bloom-bg rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-bloom-text flex items-center gap-2 border-b border-pink-200/40 pb-3">
                                <ShieldCheckIcon className="w-5 h-5 text-bloom-peach" />
                                Shop Details
                            </h3>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <span className="block text-xs font-semibold text-gray-500 uppercase">Shop Name</span>
                                    <span className="block mt-1 text-sm text-gray-800">{seller.shop_name}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-gray-500 uppercase">Owner</span>
                                    <span className="block mt-1 text-sm text-gray-800">{seller.owner_name}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-gray-500 uppercase">Email</span>
                                    <span className="block mt-1 text-sm text-gray-800">{seller.email}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-gray-500 uppercase">Phone</span>
                                    <span className="block mt-1 text-sm text-gray-800">{seller.phone_number || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-gray-500 uppercase">Location</span>
                                    <span className="block mt-1 text-sm text-gray-800">
                                        {[seller.address, seller.barangay, seller.city, seller.province, seller.postal_code].filter(Boolean).join(', ')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-bloom-bg rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-bloom-text flex items-center gap-2 border-b border-pink-200/40 pb-3">
                                <CreditCardIcon className="w-5 h-5 text-bloom-peach" />
                                Banking Details
                            </h3>
                            <div className="mt-4 space-y-4">
                                <div>
                                    <span className="block text-xs font-semibold text-gray-500 uppercase">Bank Name</span>
                                    <span className="block mt-1 text-sm text-gray-800">{seller.bank_name || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-gray-500 uppercase">Account Name</span>
                                    <span className="block mt-1 text-sm text-gray-800">{seller.bank_account_name || 'N/A'}</span>
                                </div>
                                <div>
                                    <span className="block text-xs font-semibold text-gray-500 uppercase">Account Number</span>
                                    <span className="block mt-1 text-sm font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded">{seller.bank_account_number || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Pane: Document Viewer with Anti-Leak Mechanics */}
                    <div className="w-full lg:w-2/3">
                        <div className="bg-bloom-bg rounded-2xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
                            <h3 className="text-lg font-semibold text-bloom-text flex items-center gap-2 border-b border-pink-200/40 pb-3 mb-4">
                                <DocumentIcon className="w-5 h-5 text-bloom-peach" />
                                KYC Documents
                            </h3>
                            
                            {!isFocused && (
                                <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-md rounded-2xl">
                                    <div className="bg-white px-6 py-4 rounded-xl shadow-lg border border-red-100 text-center">
                                        <ShieldCheckIcon className="w-12 h-12 text-red-500 mx-auto mb-2" />
                                        <h4 className="text-lg font-bold text-gray-800">Security Pause</h4>
                                        <p className="text-sm text-gray-500">Documents hidden while window is out of focus.</p>
                                    </div>
                                </div>
                            )}

                            <div className={`space-y-8 flex-1 transition-all duration-300 ${!isFocused ? 'blur-xl select-none pointer-events-none' : ''}`}>
                                
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Government ID ({seller.id_type || 'Unknown Type'})</h4>
                                    <SecureImage path={seller.id_photo_path} label="Government ID" />
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Business Permit</h4>
                                    <SecureImage path={seller.business_permit_path} label="Business Permit" />
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Storefront Photo</h4>
                                    <SecureImage path={seller.storefront_photo_path} label="Storefront Photo" />
                                </div>

                            </div>
                            
                            {/* Action Bar */}
                            {seller.status === 'pending' && (
                                <div className={`mt-8 pt-6 border-t border-gray-100 flex items-center justify-end gap-4 ${!isFocused ? 'pointer-events-none opacity-50' : ''}`}>
                                    <button 
                                        onClick={() => setIsRejectModalOpen(true)}
                                        className="px-6 py-2.5 rounded-full text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                                    >
                                        Reject Application
                                    </button>
                                    <button 
                                        onClick={confirmApprove}
                                        disabled={approveForm.processing}
                                        className="px-8 py-2.5 rounded-full text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20 transition-all"
                                    >
                                        {approveForm.processing ? 'Approving...' : 'Approve Shop'}
                                    </button>
                                </div>
                            )}
                            
                            {seller.status !== 'pending' && (
                                <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                                    <p className="text-sm text-gray-500">This application has already been <strong className={seller.status === 'approved' ? 'text-emerald-600' : 'text-red-600'}>{seller.status}</strong>.</p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            <Modal show={isRejectModalOpen} onClose={() => setIsRejectModalOpen(false)}>
                <form onSubmit={handleReject} className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900">Reject Application</h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Please provide a specific reason for rejection. This will be emailed to the seller.
                    </p>
                    <div className="mt-4 mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quick Response Templates</label>
                        <select
                            className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm text-sm"
                            onChange={(e) => {
                                if (e.target.value) {
                                    rejectForm.setData('reason', e.target.value);
                                }
                            }}
                            defaultValue=""
                        >
                            <option value="">Select a template...</option>
                            <option value="The name on your provided Government ID does not match the Account Name on your banking details. Please ensure all documents reflect the exact same legal name.">Mismatched Banking Details</option>
                            <option value="During our physical survey, we could not locate a storefront at the provided address. Please update your address to your exact location or provide proof of physical operations.">Physical Store Verification Failed</option>
                            <option value="The uploaded files do not match the required legal documents. Please re-submit using the correct forms.">Incorrect Documents</option>
                            <option value="One or more uploaded images are blurry or have glare, making the text unreadable. Please upload clear, well-lit photographs.">Blurry/Unreadable Images</option>
                            <option value="We detected inconsistencies in the uploaded documents that suggest they may have been digitally altered. Please upload original, unmodified photographs.">Suspected Document Alteration</option>
                        </select>
                    </div>
                    <div className="mt-4">
                        <textarea
                            className="w-full border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm text-sm"
                            rows="4"
                            placeholder="e.g., The provided ID is blurry and illegible."
                            value={rejectForm.data.reason}
                            onChange={(e) => rejectForm.setData('reason', e.target.value)}
                            required
                        ></textarea>
                        {rejectForm.errors.reason && <p className="mt-1 text-xs text-red-600">{rejectForm.errors.reason}</p>}
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => setIsRejectModalOpen(false)} className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                            Cancel
                        </button>
                        <button type="submit" disabled={rejectForm.processing} className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700">
                            Confirm Rejection
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
