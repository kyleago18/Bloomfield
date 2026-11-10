import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { X, Check, XCircle, FileImage, ExternalLink } from 'lucide-react';
import { getProductImage } from '@/utils/productImages';

export default function Replacements({ seller, requests }) {
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        rejection_reason: ''
    });

    const requestsList = Array.isArray(requests) ? requests : (requests?.data || []);

    const openRejectModal = (req) => {
        setSelectedRequest(req);
        setShowRejectModal(true);
    };

    const openApproveModal = (req) => {
        setSelectedRequest(req);
        setShowApproveModal(true);
    };

    const handleApprove = () => {
        router.post(route('seller.replacements.approve', selectedRequest.id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setShowApproveModal(false);
                setSelectedRequest(null);
            }
        });
    };

    const handleReject = (e) => {
        e.preventDefault();
        post(route('seller.replacements.reject', selectedRequest.id), {
            onSuccess: () => {
                setShowRejectModal(false);
                setSelectedRequest(null);
                reset();
            }
        });
    };

    const getStatusColor = (status) => {
        const lower = status?.toLowerCase() || '';
        if (lower.includes('approved')) return 'bg-emerald-50 text-emerald-600 border-emerald-200';
        if (lower.includes('rejected')) return 'bg-rose-50 text-rose-600 border-rose-200';
        return 'bg-amber-50 text-amber-600 border-amber-200';
    };

    return (
        <SellerLayout seller={seller} title="Replacement Requests">
            <Head title="Replacement Requests - Seller Dashboard" />
            
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Replacement Requests</h2>
                        <p className="text-sm text-gray-500 mt-1">Review and manage customer product replacement requests.</p>
                    </div>
                </div>

                <div className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto min-h-[400px]">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer / Order</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Issue</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Evidence</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {requestsList.length > 0 ? (
                                    requestsList.map((req) => {
                                        const originalOrder = req.order;
                                        const firstItem = originalOrder?.order_items?.[0];
                                        
                                        return (
                                            <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                                                {/* Customer/Order */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">{req.user?.name}</div>
                                                    <div className="text-xs text-gray-500 mt-1">Order #{originalOrder?.display_order_id}</div>
                                                    <div className="text-[11px] text-gray-400 mt-0.5">
                                                        Delivered: {new Date(originalOrder?.delivered_at).toLocaleDateString()}
                                                    </div>
                                                </td>

                                                {/* Product */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-lg border border-gray-200 overflow-hidden shrink-0">
                                                            <img src={getProductImage(firstItem?.product)} alt="Product" className="w-full h-full object-cover" />
                                                        </div>
                                                        <div className="flex flex-col max-w-[150px]">
                                                            <span className="text-sm font-medium text-gray-900 truncate">
                                                                {firstItem?.product?.name || firstItem?.product?.flower_name}
                                                            </span>
                                                            <span className="text-xs text-gray-500 mt-0.5">Qty: {firstItem?.quantity}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Issue */}
                                                <td className="px-6 py-4 max-w-[200px]">
                                                    <div className="text-sm font-bold text-gray-900 truncate" title={req.reason}>{req.reason}</div>
                                                    <div className="text-xs text-gray-500 mt-1 line-clamp-2" title={req.description}>{req.description}</div>
                                                </td>

                                                {/* Evidence */}
                                                <td className="px-6 py-4">
                                                    {req.evidence_images && req.evidence_images.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1">
                                                            {req.evidence_images.map((img, idx) => (
                                                                <a key={idx} href={img} target="_blank" rel="noreferrer" className="w-8 h-8 rounded border border-gray-200 overflow-hidden hover:opacity-80 transition-opacity flex items-center justify-center bg-gray-100">
                                                                    <FileImage className="w-4 h-4 text-gray-400" />
                                                                </a>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">No photos</span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusColor(req.status)}`}>
                                                        {req.status}
                                                    </span>
                                                    {req.replacementOrder && (
                                                        <div className="text-xs text-gray-500 mt-2 font-medium">
                                                            Rep. Order: #{req.replacementOrder.display_order_id}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {req.status === 'Replacement Requested' ? (
                                                        <div className="flex flex-col gap-2 items-end">
                                                            <button 
                                                                onClick={() => openApproveModal(req)}
                                                                className="px-4 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded hover:bg-emerald-100 font-bold text-xs w-full text-center"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button 
                                                                onClick={() => openRejectModal(req)}
                                                                className="px-4 py-1.5 bg-white text-rose-600 border border-rose-200 rounded hover:bg-rose-50 font-bold text-xs w-full text-center"
                                                            >
                                                                Reject
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs font-semibold">Action Taken</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            No replacement requests found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative p-6">
                        <button 
                            onClick={() => setShowRejectModal(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Request</h3>
                        <p className="text-sm text-gray-500 mb-4">Please provide a reason for rejecting this replacement request.</p>

                        <form onSubmit={handleReject} className="space-y-4">
                            <div>
                                <textarea
                                    value={data.rejection_reason}
                                    onChange={e => setData('rejection_reason', e.target.value)}
                                    rows="4"
                                    className="w-full rounded-xl border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 text-sm"
                                    placeholder="Enter rejection reason..."
                                    required
                                ></textarea>
                                {errors.rejection_reason && <p className="text-red-500 text-xs mt-1">{errors.rejection_reason}</p>}
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button type="button" onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold">
                                    Cancel
                                </button>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-xl text-sm font-semibold disabled:opacity-70">
                                    {processing ? 'Processing...' : 'Confirm Rejection'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Approve Modal */}
            {showApproveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative p-6 text-center">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Approve Replacement</h3>
                        <p className="text-sm text-gray-500 mb-6 px-4">
                            Are you sure you want to approve this replacement? A new replacement order will automatically be created with a ₱0 cost for the customer.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button 
                                onClick={() => setShowApproveModal(false)} 
                                className="px-6 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleApprove} 
                                className="px-6 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl text-sm font-semibold shadow-md transition-colors"
                            >
                                Confirm Approval
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </SellerLayout>
    );
}
