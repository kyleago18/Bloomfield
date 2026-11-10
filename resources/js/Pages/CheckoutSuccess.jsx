import React, { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import StoreHeader from '../Components/StoreHeader';
import LiveNavigation from '../Components/LiveNavigation';
import { toLatLng } from '../Services/geoUtils';
import { getProductImage } from '../utils/productImages';
import { motion } from 'framer-motion';
import {
    CheckCircle2,
    Copy,
    Check,
    MapPin,
    Package,
    ArrowRight,
} from 'lucide-react';

function readStoredDestination() {
    try {
        const raw = sessionStorage.getItem('bloom_nav_destination');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        const coords = toLatLng(parsed);
        if (!coords) return null;
        return {
            destination: coords,
            shopName: parsed.shopName || 'Flower shop',
            sellerId: parsed.sellerId ?? null,
        };
    } catch {
        return null;
    }
}

export default function CheckoutSuccess({
    auth,
    order,
    orderId,
    rawOrderId,
    paymentMethod,
    paymentStatus,
    destination,
    shopName,
    sellerId,
}) {
    const stored = !destination ? readStoredDestination() : null;
    const shopLocation = toLatLng(destination) || stored?.destination || null;
    const displayName = shopName || order?.seller?.shop_name || stored?.shopName || 'Flower Store';
    const resolvedSellerId = sellerId || order?.seller_id || stored?.sellerId || null;
    const [isNavigating, setIsNavigating] = useState(false);
    const [copied, setCopied] = useState(false);

    const isCod = (paymentMethod || order?.payment_method) === 'Cash on Delivery';
    const resolvedPaymentStatus = (paymentStatus || order?.payment_status || 'Pending').toLowerCase();
    const isPaid = resolvedPaymentStatus === 'paid';

    const displayCode = orderId || order?.display_order_id || (rawOrderId ? `#${rawOrderId}` : 'Confirmed');

    useEffect(() => {
        if (!shopLocation) return;
        try {
            sessionStorage.setItem(
                'bloom_nav_destination',
                JSON.stringify({
                    lat: shopLocation.lat,
                    lng: shopLocation.lng,
                    shopName: displayName,
                    sellerId: resolvedSellerId,
                })
            );
        } catch {
            /* ignore */
        }
    }, [shopLocation, displayName, resolvedSellerId]);

    const handleCopyOrderId = () => {
        if (!displayCode) return;
        navigator.clipboard.writeText(displayCode).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const items = order?.order_items || order?.orderItems || [];
    const isDelivery = (order?.delivery_method || 'delivery') === 'delivery';
    const deliveryInfo = order?.delivery;

    const formattedDate = order?.scheduled_date
        ? new Date(order.scheduled_date).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
          })
        : 'Today';

    return (
        <div className="min-h-screen bg-[#FAF0F3] text-gray-600 font-sans pb-16 selection:bg-pink-200 selection:text-pink-900">
            <Head title="Order Confirmed — Bloom&Glow" />
            <StoreHeader auth={auth} />

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
                <motion.div
                    className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-8 sm:p-12 mb-8"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Order Meta */}
                    <motion.div
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 pb-6 border-b border-pink-200/40"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <button
                            type="button"
                            onClick={handleCopyOrderId}
                            className="flex items-center gap-2 px-5 py-2.5 bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl text-sm font-medium text-gray-600 hover:text-[#E91E63] transition-colors border-none"
                        >
                            <span className="text-gray-400">Order ID:</span>
                            <span className="font-mono tracking-wider">{displayCode}</span>
                            {copied ? <Check className="w-4 h-4 text-[#E91E63]" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                        </button>
                        <div className={`px-5 py-2.5 bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl text-sm font-medium border-none ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {isPaid ? `Paid via ${paymentMethod || order?.payment_method || 'Card'}` : (paymentMethod || order?.payment_method || 'Payment Pending')}
                        </div>
                        <div className="px-5 py-2.5 bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl text-sm font-medium border-none text-[#E91E63]">
                            Status: {order?.order_status || 'Pending'}
                        </div>
                    </motion.div>

                    {/* Details Grid */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Left: Fulfillment Details */}
                        <div>
                            <h2 className="text-base font-semibold text-gray-600 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                <MapPin className="w-4 h-4 text-[#E91E63]" />
                                {isDelivery ? 'Delivery Details' : 'Pickup Details'}
                            </h2>
                            <div className="space-y-4 text-base text-gray-500">
                                <div className="bg-white/40 p-4 rounded-2xl border border-white">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Florist</p>
                                    <p className="font-semibold text-gray-700 text-base">{displayName}</p>
                                    {order?.seller?.address && <p className="text-sm mt-0.5">{order.seller.address}</p>}
                                </div>
                                
                                <div className="bg-white/40 p-4 rounded-2xl border border-white">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Schedule</p>
                                    <p className="font-semibold text-gray-700 text-base">{formattedDate} • {order?.scheduled_time || 'Standard'}</p>
                                </div>

                                <div className="bg-white/40 p-4 rounded-2xl border border-white">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">
                                        {isDelivery ? 'Address' : 'Pickup Location'}
                                    </p>
                                    {isDelivery ? (
                                        <p className="font-semibold text-gray-700 text-sm leading-relaxed">
                                            {[
                                                deliveryInfo?.street_address,
                                                deliveryInfo?.barangay,
                                                deliveryInfo?.city,
                                                deliveryInfo?.province,
                                            ].filter(Boolean).join(', ') || 'Address pinned on checkout map'}
                                            {deliveryInfo?.landmark && <span className="block font-normal text-gray-400 mt-1">Landmark: {deliveryInfo.landmark}</span>}
                                        </p>
                                    ) : (
                                        <p className="font-semibold text-gray-700 text-sm">{order?.seller?.address || `${displayName}, Davao del Sur`}</p>
                                    )}
                                </div>

                                {order && (
                                    <div className="bg-white/40 p-4 rounded-2xl border border-white">
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-1">Recipient</p>
                                        <p className="font-semibold text-gray-700 text-base">{order.receiver_first_name} {order.receiver_last_name}</p>
                                        {order.receiver_contact && <p className="text-sm mt-0.5">{order.receiver_contact}</p>}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Order Summary */}
                        <div>
                            <h2 className="text-base font-semibold text-gray-600 mb-3 flex items-center gap-2 uppercase tracking-wider">
                                <Package className="w-4 h-4 text-[#E91E63]" />
                                Order Summary
                            </h2>

                            {/* Products — horizontal, no box, no border */}
                            {items.length > 0 ? (
                                <div className="flex flex-row gap-3 overflow-x-auto pb-2 mb-4">
                                    {items.map((item, idx) => {
                                        const prod = item.product || {};
                                        const name = prod.flower_name || prod.name || item.name || 'Floral Arrangement';
                                        const img = getProductImage(prod);
                                        const qty = item.quantity || 1;
                                        const subtotal = item.subtotal || (item.price ? item.price * qty : 0);

                                        return (
                                            <div key={item.id || item.order_item_id || idx} className="flex flex-col items-center gap-1.5 shrink-0 min-w-[100px] max-w-[120px]">
                                                <img src={img} alt={name} className="w-24 h-24 object-cover rounded-2xl shadow-md" />
                                                <p className="font-semibold text-gray-800 text-sm text-center leading-tight line-clamp-2 w-full">{name}</p>
                                                <p className="text-xs text-gray-400">Qty: {qty}</p>
                                                <p className="font-bold text-[#E91E63] text-sm">₱{Number(subtotal).toFixed(2)}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 mb-4">Order items are recorded in your profile history.</p>
                            )}

                            {/* Totals — clean, no wrapper box */}
                            <div className="border-t border-pink-200/40 pt-3 space-y-2 text-sm">
                                <div className="flex justify-between text-gray-500">
                                    <span>Subtotal</span>
                                    <span>₱{Number(items.reduce((acc, item) => acc + Number(item.subtotal || (item.price ? item.price * (item.quantity || 1) : 0)), 0)).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Fulfillment (Shipping)</span>
                                    <span>{isDelivery ? '₱50.00' : 'Free'}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-gray-700 pt-2 border-t border-pink-200/40">
                                    <span>Total</span>
                                    <span className="text-[#E91E63]">₱{order?.total_amount ? Number(order.total_amount).toFixed(2) : '0.00'}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    <Link
                        href="/"
                        className="px-8 py-3.5 bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-[4px_4px_12px_rgba(233,30,99,0.25)] hover:shadow-lg transition-all text-center flex items-center justify-center gap-2"
                    >
                        Continue Shopping <ArrowRight className="w-4 h-4" />
                    </Link>
                    {isDelivery ? (
                        <Link
                            href="/profile?tab=orders"
                            className="px-8 py-3.5 bg-[#FAF0F3] shadow-[4px_4px_10px_#e2d7da,-4px_-4px_10px_#ffffff] text-gray-600 text-xs font-bold uppercase tracking-wider rounded-full hover:shadow-[inset_2px_2px_5px_#e2d7da,inset_-2px_-2px_5px_#ffffff] hover:text-[#E91E63] transition-all text-center"
                        >
                            View Delivery Status
                        </Link>
                    ) : shopLocation ? (
                        <button
                            type="button"
                            onClick={() => setIsNavigating(true)}
                            className="px-8 py-3.5 bg-[#FAF0F3] shadow-[4px_4px_10px_#e2d7da,-4px_-4px_10px_#ffffff] text-gray-600 text-xs font-bold uppercase tracking-wider rounded-full hover:shadow-[inset_2px_2px_5px_#e2d7da,inset_-2px_-2px_5px_#ffffff] hover:text-[#E91E63] transition-all text-center"
                        >
                            Live Navigation
                        </button>
                    ) : (
                        <Link
                            href="/profile"
                            className="px-8 py-3.5 bg-[#FAF0F3] shadow-[4px_4px_10px_#e2d7da,-4px_-4px_10px_#ffffff] text-gray-600 text-xs font-bold uppercase tracking-wider rounded-full hover:shadow-[inset_2px_2px_5px_#e2d7da,inset_-2px_-2px_5px_#ffffff] hover:text-[#E91E63] transition-all text-center"
                        >
                            View Order History
                        </Link>
                    )}
                </motion.div>
            </main>

            {isNavigating && shopLocation && (
                <LiveNavigation
                    destination={shopLocation}
                    shopName={displayName}
                    autoStart
                    onClose={() => setIsNavigating(false)}
                />
            )}
        </div>
    );
}
