import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { getProductImage } from '@/utils/productImages';
import { ShoppingBag } from 'lucide-react';

export default function PurchasesList({ purchases }) {
    const [activeTab, setActiveTab] = useState('All');

    const tabs = [
        { id: 'All', label: 'All' },
        { id: 'Pending', label: 'Pending', statuses: ['pending_payment', 'pending', 'confirmed'] },
        { id: 'Preparing', label: 'Preparing', statuses: ['preparing'] },
        { id: 'To Ship', label: 'To Ship', statuses: ['ready_for_pickup'] },
        { id: 'To Receive', label: 'To Receive', statuses: ['out_for_delivery', 'in_transit'] }
    ];

    const getStatusLabel = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending_payment': return 'To Pay';
            case 'pending': return 'Pending';
            case 'confirmed': return 'Confirmed';
            case 'preparing': return 'Preparing';
            case 'ready_for_pickup': return 'To Ship';
            case 'out_for_delivery': 
            case 'in_transit': return 'To Receive';
            default: return status || 'Unknown';
        }
    };

    const getStatusColor = (status) => {
        const lowerStatus = status?.toLowerCase();
        if (['pending_payment', 'pending'].includes(lowerStatus)) return 'bg-blue-50 text-blue-600 border-blue-200';
        return 'bg-amber-50 text-amber-600 border-amber-200';
    };

    const purchasesList = Array.isArray(purchases) ? purchases : (purchases?.data || []);
    
    const filteredPurchases = purchasesList.filter(purchase => {
        if (activeTab === 'All') return true;
        const tabConfig = tabs.find(t => t.id === activeTab);
        const purchaseStatus = purchase.order_status?.toLowerCase();
        return tabConfig?.statuses?.includes(purchaseStatus);
    });

    return (
        <section className="space-y-4">
            <header className="flex items-center gap-2 mb-4">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    Active Purchases
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

            {/* Purchases Table */}
            <div className="overflow-x-auto w-full mt-4 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                        <tr className="bg-gray-50/70 border-b border-gray-100">
                            <th className="px-5 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap rounded-l-lg">Product</th>
                            <th className="px-5 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Purchase Number</th>
                            <th className="px-5 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Total</th>
                            <th className="px-5 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Status</th>
                            <th className="px-5 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap">Attributes</th>
                            <th className="px-5 py-4 text-sm font-semibold text-gray-700 whitespace-nowrap rounded-r-lg text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredPurchases.length > 0 ? (
                            filteredPurchases.map((purchase) => {
                                const totalAmount = parseFloat(purchase.total_amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });
                                const purchaseNumber = `#${purchase.display_order_id || purchase.order_id}`;
                                const firstItem = purchase.order_items?.[0];
                                const extraItemsCount = (purchase.order_items?.length || 1) - 1;
                                const totalQty = purchase.order_items?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 1;
                                
                                return (
                                    <tr key={purchase.order_id} className="hover:bg-gray-50/40 transition-colors">
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
                                                    <span className="text-[13px] text-gray-500">
                                                        {firstItem?.product?.category?.name || 'Standard'}
                                                        {extraItemsCount > 0 && ` (+${extraItemsCount} other items)`}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Purchase Number */}
                                        <td className="px-5 py-6 text-[13px] font-medium text-gray-600 whitespace-nowrap">
                                            {purchaseNumber}
                                        </td>

                                        {/* Total */}
                                        <td className="px-5 py-6 text-[13px] font-semibold text-gray-900 whitespace-nowrap">
                                            ₱{totalAmount}
                                        </td>

                                        {/* Status */}
                                        <td className="px-5 py-6 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-[11px] font-semibold tracking-wide rounded-full border ${getStatusColor(purchase.order_status)}`}>
                                                {getStatusLabel(purchase.order_status)}
                                            </span>
                                            {purchase.replacement_for_order_id && (
                                                <div className="text-[10px] font-bold text-[#E91E63] mt-2 bg-pink-50 px-2 py-0.5 rounded border border-pink-100 inline-block">
                                                    REPLACEMENT
                                                </div>
                                            )}
                                        </td>

                                        {/* Attributes */}
                                        <td className="px-5 py-6 whitespace-nowrap">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="text-[12px] text-gray-500">
                                                    Store : <span className="text-gray-900 font-medium">{purchase.seller?.shop_name || 'Flower Shop'}</span>
                                                </div>
                                                <div className="text-[12px] text-gray-500">
                                                    Items : <span className="text-gray-900 font-medium">{totalQty}</span>
                                                </div>
                                                <Link href={route('shop.show', purchase.seller?.id || purchase.seller_id)} className="text-[12px] text-blue-600 hover:text-blue-700 font-medium mt-0.5">
                                                    Explore Products
                                                </Link>
                                            </div>
                                        </td>

                                        {/* Action */}
                                        <td className="px-5 py-6 text-center align-top">
                                            <div className="flex flex-col gap-2 items-center justify-center">
                                                {['pending', 'pending_payment', 'placed', 'confirmed', 'preparing'].includes(purchase.order_status?.toLowerCase()) && purchase.payment_status?.toLowerCase() !== 'paid' ? (
                                                    <Link 
                                                        href={route('orders.cancel', purchase.order_id)} 
                                                        method="post" 
                                                        as="button"
                                                        className="px-3 py-1.5 bg-blue-950 text-white border border-blue-900 text-[11px] font-semibold rounded-md hover:bg-blue-900 transition-colors text-center shadow-xs uppercase tracking-wide whitespace-nowrap"
                                                    >
                                                        Cancel Order
                                                    </Link>
                                                ) : (
                                                    <>
                                                        {['out_for_delivery', 'ready_for_pickup', 'to_receive', 'in_transit'].includes(purchase.order_status?.toLowerCase()) && (
                                                            <Link 
                                                                href={route('orders.receive', purchase.order_id)} 
                                                                method="post" 
                                                                as="button"
                                                                className="px-3 py-1.5 border border-emerald-500 text-emerald-700 bg-emerald-50 text-[11px] font-semibold rounded-md hover:bg-emerald-100 transition-colors text-center uppercase tracking-wide whitespace-nowrap shadow-xs"
                                                            >
                                                                Order Received
                                                            </Link>
                                                        )}
                                                    </>
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
                                    <h3 className="text-base font-semibold text-gray-900 mb-1">No active purchases</h3>
                                    <p className="text-[13px] text-gray-500">You don't have any active purchases right now.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

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
