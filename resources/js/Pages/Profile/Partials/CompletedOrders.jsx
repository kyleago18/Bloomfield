import React, { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { getProductImage } from '@/utils/productImages';
import { ShoppingBag, X, Upload, Star } from 'lucide-react';

export default function CompletedOrders({ orders }) {
    const [activeTab, setActiveTab] = useState('All');
    const [showReplacementModal, setShowReplacementModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        order_id: '',
        reason: '',
        description: '',
        images: []
    });

    const tabs = [
        { id: 'All', label: 'All' },
        { id: 'Completed', label: 'Completed', statuses: ['completed', 'delivered'] },
        { id: 'Cancelled', label: 'Cancelled', statuses: ['cancelled'] }
    ];

    const getStatusLabel = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'delivered': return 'Delivered';
            case 'cancelled': return 'Cancelled';
            default: return status || 'Unknown';
        }
    };

    const getStatusColor = (status) => {
        const lowerStatus = status?.toLowerCase();
        if (['completed', 'delivered'].includes(lowerStatus)) return 'bg-emerald-50 text-emerald-600 border-emerald-200';
        if (['cancelled'].includes(lowerStatus)) return 'bg-red-50 text-red-600 border-red-200';
        return 'bg-gray-50 text-gray-600 border-gray-200';
    };

    const getReplacementStatusColor = (status) => {
        const lower = status?.toLowerCase() || '';
        if (lower.includes('approved')) return 'bg-emerald-50 text-emerald-600 border-emerald-200';
        if (lower.includes('rejected')) return 'bg-rose-50 text-rose-600 border-rose-200';
        return 'bg-amber-50 text-amber-600 border-amber-200';
    };

    const ordersList = Array.isArray(orders) ? orders : (orders?.data || []);
    
    const filteredOrders = ordersList.filter(order => {
        if (activeTab === 'All') return true;
        const tabConfig = tabs.find(t => t.id === activeTab);
        const orderStatus = order.order_status?.toLowerCase();
        return tabConfig?.statuses?.includes(orderStatus);
    });

    const canRequestReplacement = (order) => {
        const req = order.replacement_request || order.replacementRequest;
        if (!['completed', 'delivered'].includes(order.order_status?.toLowerCase())) return false;
        if (req) return false;
        if (order.replacement_for_order_id) return false; // cannot replace a replacement
        
        // Check if within 24 hours of delivery
        if (!order.delivered_at) return false;
        const deliveryDate = new Date(order.delivered_at);
        const now = new Date();
        const diffInHours = (now - deliveryDate) / (1000 * 60 * 60);
        return diffInHours <= 24;
    };

    const getIneligibilityReason = (order) => {
        const req = order.replacement_request || order.replacementRequest;
        if (!['completed', 'delivered'].includes(order.order_status?.toLowerCase())) {
            return "Must be delivered first";
        }
        if (req) {
            return "Replacement already requested";
        }
        if (order.replacement_for_order_id) {
            return "Cannot replace a replacement";
        }
        if (!order.delivered_at) {
            return "Delivery date unrecorded";
        }
        const deliveryDate = new Date(order.delivered_at);
        const now = new Date();
        const diffInHours = (now - deliveryDate) / (1000 * 60 * 60);
        if (diffInHours > 24) {
            return "24-hour period expired";
        }
        return "Not eligible";
    };

    const openReplacementModal = (order) => {
        setSelectedOrder(order);
        setData('order_id', order.order_id);
        setShowReplacementModal(true);
    };

    const closeReplacementModal = () => {
        setShowReplacementModal(false);
        setSelectedOrder(null);
        reset();
    };

    const openReviewModal = (product) => {
        setSelectedProduct(product);
        setReviewRating(5);
        setReviewComment('');
        setReviewError(null);
        setShowReviewModal(true);
    };

    const handleReviewSubmit = (e) => {
        e.preventDefault();
        if (!selectedProduct) return;
        setSubmittingReview(true);
        setReviewError(null);

        router.post(route('reviews.store', selectedProduct.product_id), {
            rating: reviewRating,
            comment: reviewComment,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowReviewModal(false);
                setSelectedProduct(null);
                setReviewComment('');
                setSubmittingReview(false);
            },
            onError: (errs) => {
                setSubmittingReview(false);
                setReviewError(errs.review || 'Failed to submit review.');
            }
        });
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setData('images', [...data.images, ...files].slice(0, 5)); // max 5 images
    };

    const removeImage = (index) => {
        const newImages = [...data.images];
        newImages.splice(index, 1);
        setData('images', newImages);
    };

    const submitReplacement = (e) => {
        e.preventDefault();
        post(route('customer.replacement.store'), {
            onSuccess: () => {
                closeReplacementModal();
            },
        });
    };

    return (
        <section className="space-y-4">
            <header className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Completed Orders
                </h2>
            </header>

            {/* Tabs */}
            <div className="flex overflow-x-auto hide-scrollbar bg-white border-b border-gray-100 shadow-sm">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors relative text-center ${
                            activeTab === tab.id
                                ? 'text-slate-900'
                                : 'text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-900 rounded-t-md" />
                        )}
                    </button>
                ))}
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto w-full mt-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-gray-50/70 border-b border-gray-100">
                            <th className="px-5 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap rounded-l-lg">Product</th>
                            <th className="px-5 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Order Number</th>
                            <th className="px-5 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Total</th>
                            <th className="px-5 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Status</th>
                            <th className="px-5 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Attributes</th>
                            <th className="px-5 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap rounded-r-lg text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => {
                                const totalAmount = parseFloat(order.total_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });
                                const orderNumber = `#${order.display_order_id || order.order_id}`;
                                const firstItem = order.order_items?.[0];
                                const extraItemsCount = (order.order_items?.length || 1) - 1;
                                const totalQty = order.order_items?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 1;
                                
                                return (
                                    <tr key={order.order_id} className="hover:bg-gray-50/40 transition-colors">
                                        {/* Product */}
                                        <td className="px-5 py-6">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-[72px] h-[72px] rounded-lg overflow-hidden border border-gray-200/50 bg-white shrink-0">
                                                    <img src={getProductImage(firstItem?.product)} alt="Product" className="w-full h-full object-cover" loading="lazy" />
                                                </div>
                                                <div className="flex flex-col">
                                                     <span className="text-sm font-semibold text-gray-900 line-clamp-1 mb-1">
                                                         {firstItem?.product?.name || firstItem?.product?.flower_name || 'Flower Bouquet'}
                                                     </span>
                                                     <span className="text-[13px] text-gray-500 mb-1">
                                                         {firstItem?.product?.category?.name || 'Standard'}
                                                         {extraItemsCount > 0 && ` (+${extraItemsCount} other items)`}
                                                     </span>

                                                     {/* Review Status / Trigger */}
                                                     {firstItem?.product?.reviews?.length > 0 ? (
                                                         <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded w-fit border border-amber-200/60 mt-0.5">
                                                             <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                             <span>Reviewed ({firstItem.product.reviews[0].rating}/5)</span>
                                                         </div>
                                                     ) : (
                                                         ['completed', 'delivered'].includes(order.order_status?.toLowerCase()) && firstItem?.product && (
                                                             <button
                                                                 type="button"
                                                                 onClick={() => openReviewModal(firstItem.product)}
                                                                 className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 bg-amber-50/80 hover:bg-amber-100 px-2 py-0.5 rounded w-fit border border-amber-200/80 transition-colors mt-0.5"
                                                             >
                                                                 <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                                                 <span>Write Review</span>
                                                             </button>
                                                         )
                                                     )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Order Number */}
                                        <td className="px-5 py-6 text-[13px] font-medium text-gray-600 whitespace-nowrap">
                                            {orderNumber}
                                        </td>

                                        {/* Total */}
                                        <td className="px-5 py-6 text-[13px] font-semibold text-gray-900 whitespace-nowrap">
                                            ₱{totalAmount}
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-6 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-[11px] font-semibold tracking-wide rounded-full border ${getStatusColor(order.order_status)}`}>
                                                {getStatusLabel(order.order_status)}
                                            </span>
                                            
                                            {order.replacement_for_order_id && (
                                                <div className="text-[10px] font-bold text-[#E91E63] mt-2 bg-pink-50 px-2 py-0.5 rounded border border-pink-100 inline-block">
                                                    REPLACEMENT
                                                </div>
                                            )}

                                            {(order.replacement_request || order.replacementRequest) && (
                                                <div className="mt-2.5 space-y-1">
                                                    <div className="text-[10px] uppercase font-bold text-gray-400">Replacement Request</div>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getReplacementStatusColor((order.replacement_request || order.replacementRequest).status)}`}>
                                                        {(order.replacement_request || order.replacementRequest).status}
                                                    </span>
                                                    {(order.replacement_request || order.replacementRequest).rejection_reason && (
                                                        <div className="mt-1 text-[11px] text-rose-600 bg-rose-50 border border-rose-100 p-1.5 rounded max-w-[150px] whitespace-normal">
                                                            <strong className="block">Reason:</strong> {(order.replacement_request || order.replacementRequest).rejection_reason}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>

                                        {/* Attributes */}
                                        <td className="px-5 py-6 whitespace-nowrap">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="text-[12px] text-gray-500">
                                                    Store : <span className="text-gray-900 font-medium">{order.seller?.shop_name || 'Flower Shop'}</span>
                                                </div>
                                                <div className="text-[12px] text-gray-500">
                                                    Items : <span className="text-gray-900 font-medium">{totalQty}</span>
                                                </div>
                                                <Link href={route('shop.show', order.seller?.id || order.seller_id)} className="text-[12px] text-blue-600 hover:text-blue-700 font-medium mt-0.5">
                                                    Explore Products
                                                </Link>
                                            </div>
                                        </td>

                                        {/* Action */}
                                        <td className="px-5 py-6 text-center align-top">
                                            <div className="flex flex-col gap-2 items-center justify-center">
                                                {canRequestReplacement(order) && (
                                                    <button 
                                                        onClick={() => openReplacementModal(order)}
                                                        className="px-3 py-1.5 border border-pink-500 text-pink-600 bg-pink-50 text-[11px] font-semibold tracking-wide rounded-md hover:bg-pink-100 transition-colors text-center uppercase whitespace-nowrap shadow-xs"
                                                    >
                                                        Request Replacement
                                                    </button>
                                                )}
                                                {!canRequestReplacement(order) && !(order.replacement_request || order.replacementRequest) && order.order_status?.toLowerCase() !== 'cancelled' && (
                                                    <div className="flex flex-col items-end text-right">
                                                        <span className="text-[10px] font-semibold text-gray-400">
                                                            Not eligible for replacement
                                                        </span>
                                                        <span className="text-[9px] text-red-400 font-medium">
                                                            ({getIneligibilityReason(order)})
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="py-20 text-center">
                                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center">
                                        <ShoppingBag className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <h3 className="text-base font-semibold text-gray-900 mb-1">No completed orders</h3>
                                    <p className="text-[13px] text-gray-500">You don't have any completed orders in this category.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Replacement Modal */}
            {showReplacementModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative my-8">
                        <button 
                            onClick={closeReplacementModal}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="p-6 sm:p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Request Replacement</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                We're sorry you had an issue with your order <strong>#{selectedOrder.display_order_id}</strong>. 
                                Please provide details so the seller can process a replacement. Note: There is NO refund available, only a product replacement.
                            </p>

                            <form onSubmit={submitReplacement} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Why do you want to request a replacement?</label>
                                    <select
                                        value={data.reason}
                                        onChange={e => setData('reason', e.target.value)}
                                        className="w-full rounded-xl border-gray-200 shadow-sm focus:border-pink-500 focus:ring-pink-500 text-sm"
                                        required
                                    >
                                        <option value="">Select a reason...</option>
                                        <option value="Flowers arrived damaged">Flowers arrived damaged</option>
                                        <option value="Flowers arrived wilted">Flowers arrived wilted</option>
                                        <option value="Flowers arrived broken/crushed">Flowers arrived broken/crushed</option>
                                        <option value="Wrong flowers received">Wrong flowers received</option>
                                        <option value="Wrong bouquet received">Wrong bouquet received</option>
                                        <option value="Wrong color/variant">Wrong color/variant</option>
                                        <option value="Wrong quantity">Wrong quantity</option>
                                        <option value="Missing items">Missing items</option>
                                        <option value="Product does not match the listing">Product does not match the listing</option>
                                        <option value="Delivery problem">Delivery problem</option>
                                        <option value="Changed my mind">Changed my mind</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                    <textarea
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        rows="3"
                                        className="w-full rounded-xl border-gray-200 shadow-sm focus:border-pink-500 focus:ring-pink-500 text-sm"
                                        placeholder="Please explain the issue in detail..."
                                        required
                                    ></textarea>
                                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Evidence (Photos)</label>
                                    <label className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-pink-500 transition-colors bg-gray-50 group relative cursor-pointer">
                                        <div className="space-y-1 text-center">
                                            <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-pink-500 transition-colors" />
                                            <div className="flex text-sm text-gray-600 justify-center">
                                                <span className="relative font-medium text-pink-600 group-hover:text-pink-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500">
                                                    <span>Upload files</span>
                                                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="sr-only" />
                                                </span>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG up to 5MB (Max 5)</p>
                                        </div>
                                    </label>
                                    {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}

                                    {/* Image Previews */}
                                    {data.images.length > 0 && (
                                        <div className="mt-4 grid grid-cols-5 gap-2">
                                            {data.images.map((img, idx) => (
                                                <div key={idx} className="relative group rounded-lg overflow-hidden h-16 w-16 border border-gray-200">
                                                    <img src={URL.createObjectURL(img)} className="w-full h-full object-cover" alt="Preview" />
                                                    <button 
                                                        type="button" 
                                                        onClick={() => removeImage(idx)}
                                                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={closeReplacementModal}
                                        className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-5 py-2.5 rounded-xl bg-[#E91E63] text-white text-sm font-semibold hover:bg-[#D81B60] transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Submitting...' : 'Submit Request'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative p-6">
                        <button 
                            type="button"
                            onClick={() => setShowReviewModal(false)}
                            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Rate & Review Product</h3>
                        <p className="text-xs text-gray-500 mb-4">Share your feedback to help other buyers and rate the shop service.</p>

                        {/* Product Info Banner */}
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-5 border border-gray-100">
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 bg-white shrink-0">
                                <img src={getProductImage(selectedProduct)} alt="Product" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-gray-900 truncate">
                                    {selectedProduct.name || selectedProduct.flower_name}
                                </h4>
                                <p className="text-[11px] text-gray-500">₱{parseFloat(selectedProduct.price || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>

                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            {/* Interactive Star Rating */}
                            <div className="text-center bg-amber-50/50 p-4 rounded-xl border border-amber-100/80">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Overall Rating</label>
                                <div className="flex justify-center items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => {
                                        const active = star <= (hoverRating || reviewRating);
                                        return (
                                            <button
                                                key={star}
                                                type="button"
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setReviewRating(star)}
                                                className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                                            >
                                                <Star className={`w-8 h-8 ${active ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                                            </button>
                                        );
                                    })}
                                </div>
                                <span className="text-xs font-bold text-amber-700 mt-2 block">
                                    {reviewRating === 5 && '⭐⭐⭐⭐⭐ Excellent!'}
                                    {reviewRating === 4 && '⭐⭐⭐⭐ Very Good!'}
                                    {reviewRating === 3 && '⭐⭐⭐ Average'}
                                    {reviewRating === 2 && '⭐⭐ Poor'}
                                    {reviewRating === 1 && '⭐ Terrible'}
                                </span>
                            </div>

                            {/* Comment */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Your Feedback</label>
                                <textarea
                                    value={reviewComment}
                                    onChange={e => setReviewComment(e.target.value)}
                                    rows="3"
                                    className="w-full rounded-xl border-gray-300 shadow-xs focus:border-amber-500 focus:ring-amber-500 text-xs"
                                    placeholder="Write your honest review about the fresh flowers and store delivery..."
                                ></textarea>
                                {reviewError && <p className="text-red-500 text-xs mt-1 font-semibold">{reviewError}</p>}
                            </div>

                            <div className="flex justify-end gap-2.5 pt-2">
                                <button 
                                    type="button" 
                                    onClick={() => setShowReviewModal(false)} 
                                    className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submittingReview} 
                                    className="px-5 py-2 bg-amber-500 text-white hover:bg-amber-600 rounded-xl text-xs font-bold shadow-md transition-colors disabled:opacity-70"
                                >
                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
}
