import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import StoreHeader from '../../Components/StoreHeader';
import { getProductImage } from '../../utils/productImages';
import {
    ShoppingBag,
    Calendar,
    ChevronRight,
    Store,
    Clock,
    CheckCircle2,
    XCircle,
    Truck,
    Package
} from 'lucide-react';

export default function Orders({ auth, orders, metrics }) {
    const [activeTab, setActiveTab] = useState('active');

    const activeStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'ready_for_pickup'];
    const historyStatuses = ['delivered', 'completed', 'cancelled'];

    const filteredOrders = orders.filter((order) => {
        const status = order.order_status?.toLowerCase();
        if (activeTab === 'active') {
            return activeStatuses.includes(status);
        }
        return historyStatuses.includes(status);
    });

    const getStatusConfig = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200/80', icon: Clock, label: 'Pending' };
            case 'confirmed':
                return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200/80', icon: CheckCircle2, label: 'Confirmed' };
            case 'preparing':
                return { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200/80', icon: Package, label: 'Preparing' };
            case 'out_for_delivery':
                return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200/80', icon: Truck, label: 'Out for Delivery' };
            case 'ready_for_pickup':
                return { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200/80', icon: Store, label: 'Ready for Pickup' };
            case 'completed':
                return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200/80', icon: CheckCircle2, label: 'Completed' };
            case 'cancelled':
                return { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200/80', icon: XCircle, label: 'Cancelled' };
            default:
                return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200/80', icon: Clock, label: status || 'Unknown' };
        }
    };

    return (
        <div className="store-shell min-h-screen bg-[#FAF0F3] text-gray-700 font-sans selection:bg-pink-200 selection:text-pink-900">
            <Head title="My Orders — Bloom&Glow" />
            <StoreHeader auth={auth} />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex items-center gap-3 mb-6">
                    <ShoppingBag className="w-6 h-6 text-[#E91E63]" />
                    <h1 className="text-2xl font-serif font-bold text-gray-800 tracking-tight">My Orders</h1>
                </div>

                {metrics && (
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
                        {[
                            { label: 'Total', value: metrics.total, color: 'text-gray-700' },
                            { label: 'Pending', value: metrics.pending, color: 'text-amber-600' },
                            { label: 'Processing', value: metrics.processing, color: 'text-indigo-600' },
                            { label: 'Out for Delivery', value: metrics.out_for_delivery, color: 'text-orange-600' },
                            { label: 'Delivered', value: metrics.delivered, color: 'text-emerald-600' },
                            { label: 'Cancelled', value: metrics.cancelled, color: 'text-red-600' },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white/60 border border-pink-100 rounded-2xl p-4 text-center shadow-sm">
                                <p className={`text-2xl font-bold font-serif ${stat.color}`}>{stat.value}</p>
                                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex items-center gap-4 border-b border-pink-200/40 mb-8 pb-1">
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`pb-3 text-sm font-semibold tracking-wider uppercase transition-colors relative ${
                            activeTab === 'active' ? 'text-[#E91E63]' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Active Orders
                        {activeTab === 'active' && (
                            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#E91E63] rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`pb-3 text-sm font-semibold tracking-wider uppercase transition-colors relative ${
                            activeTab === 'history' ? 'text-[#E91E63]' : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Order History
                        {activeTab === 'history' && (
                            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#E91E63] rounded-t-full" />
                        )}
                    </button>
                </div>

                {/* Order List */}
                <div className="space-y-6">
                    {filteredOrders.length === 0 ? (
                        <div className="bg-[#FAF0F3] rounded-[28px] shadow-[inset_4px_4px_10px_#e2d7da,inset_-4px_-4px_10px_#ffffff] p-10 text-center border border-white/60">
                            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">No orders found</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                {activeTab === 'active' 
                                    ? "You don't have any active orders right now."
                                    : "You don't have any past orders yet."}
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white text-xs font-semibold shadow-[4px_4px_12px_rgba(233,30,99,0.25)] hover:shadow-lg transition-all uppercase tracking-wider"
                            >
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        filteredOrders.map((order) => {
                            const conf = getStatusConfig(order.order_status);
                            const StatusIcon = conf.icon;
                            const items = order.order_items || [];
                            const firstItem = items[0];
                            const product = firstItem?.product;
                            const img = product ? getProductImage(product) : null;
                            const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

                            return (
                                <div
                                    key={order.order_id}
                                    className="block bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-5 sm:p-6 hover:shadow-[12px_12px_24px_#e2d7da,-12px_-12px_24px_#ffffff] transition-all group"
                                >
                                    <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                                        {/* Image */}
                                        <div className="shrink-0 relative">
                                            {img ? (
                                                <img src={img} alt="Product" className="w-24 h-24 sm:w-20 sm:h-20 object-cover rounded-2xl border border-gray-200/50" />
                                            ) : (
                                                <div className="w-24 h-24 sm:w-20 sm:h-20 bg-gray-100 rounded-2xl border border-gray-200/50 flex items-center justify-center">
                                                    <Package className="w-8 h-8 text-gray-300" />
                                                </div>
                                            )}
                                            {totalItems > 1 && (
                                                <span className="absolute -bottom-2 -right-2 bg-gray-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
                                                    +{totalItems - 1}
                                                </span>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                                <span className="text-xs font-bold text-gray-800 font-mono bg-white/50 px-2 py-0.5 rounded-lg border border-gray-100">
                                                    {order.display_order_id}
                                                </span>
                                                <span className="text-gray-300">•</span>
                                                <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                                                    <Store className="w-3.5 h-3.5" />
                                                    {order.seller?.shop_name || 'Flower Shop'}
                                                </span>
                                            </div>

                                            <h3 className="font-semibold text-gray-800 mb-2 truncate">
                                                {product?.flower_name || product?.name || 'Floral Arrangement'}
                                            </h3>

                                            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                                <span className="font-semibold text-gray-800">
                                                    ₱{Number(order.total_amount).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status & Action */}
                                        <div className="flex sm:flex-col items-center justify-between w-full sm:w-auto gap-4 sm:gap-2 shrink-0">
                                            <div className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold tracking-wide uppercase w-full sm:w-auto ${conf.bg} ${conf.text} ${conf.border}`}>
                                                <StatusIcon className="w-3.5 h-3.5" />
                                                <span>{conf.label}</span>
                                            </div>
                                            <div className="flex gap-2 w-full sm:w-auto">
                                                <Link 
                                                    href={route('orders.show', order.order_id)} 
                                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    View Order
                                                </Link>
                                                {!['pending', 'cancelled', 'delivered'].includes(order.order_status?.toLowerCase()) && (
                                                    <Link 
                                                        href={route('orders.show', order.order_id)} 
                                                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-1.5 bg-[#E91E63] text-white text-xs font-semibold rounded-xl hover:bg-[#D81B60] transition-colors"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        Track Order
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
}
