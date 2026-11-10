import React, { useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import StoreHeader from '../../Components/StoreHeader';
import { getProductImage } from '../../utils/productImages';
import {
    ArrowLeft,
    CheckCircle2,
    MapPin,
    Calendar,
    Clock,
    CreditCard,
    ShoppingBag,
    Package,
    Truck,
    Store,
    User,
    Phone,
    Activity
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const riderIcon = new L.DivIcon({
    html: `<div style="background-color: #f97316; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.2); border: 2.5px solid white;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v5c0 .6-.4 1-1 1h-2"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg></div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

const destinationIcon = new L.DivIcon({
    html: `<div style="background-color: #E91E63; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.2); border: 2.5px solid white;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
});

const storeIcon = new L.DivIcon({
    html: `<div style="background-color: #3b82f6; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.2); border: 2.5px solid white;"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg></div>`,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
});

export default function OrderTracker({ auth, order }) {
    const isDelivery = order.delivery_method === 'delivery';
    
    // Determine the starting location
    const startLat = order.delivery_latitude || order.seller?.latitude;
    const startLng = order.delivery_longitude || order.seller?.longitude;
    const isRiderAssigned = !!order.delivery_latitude;

    useEffect(() => {
        // Poll for updates every 15 seconds
        const interval = setInterval(() => {
            router.reload({ only: ['order'], preserveScroll: true, preserveState: true });
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    const getStepperStages = () => {
        return [
            { id: 'pending', label: 'Order Placed', icon: Clock },
            { id: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
            { id: 'preparing', label: 'Preparing', icon: Package },
            { 
                id: isDelivery ? 'out_for_delivery' : 'ready_for_pickup', 
                label: isDelivery ? 'Out for Delivery' : 'Ready for Pickup', 
                icon: isDelivery ? Truck : Store 
            },
            { id: 'completed', label: 'Completed', icon: CheckCircle2 }
        ];
    };

    const stages = getStepperStages();
    const currentStatus = order.order_status?.toLowerCase();
    
    // Find current index
    let currentIndex = stages.findIndex(s => s.id === currentStatus);
    if (currentIndex === -1) {
        if (currentStatus === 'completed') currentIndex = 4;
        else currentIndex = 0; // fallback
    }

    const isCancelled = currentStatus === 'cancelled';

    return (
        <div className="store-shell min-h-screen bg-[#FAF0F3] text-gray-700 font-sans selection:bg-pink-200 selection:text-pink-900 pb-16">
            <Head title={`Order ${order.display_order_id} — Bloom&Glow`} />
            <StoreHeader auth={auth} />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Link href={route('orders.index')} className="flex items-center gap-2 text-gray-500 hover:text-[#E91E63] font-semibold text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Orders
                    </Link>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Order ID</p>
                        <p className="font-mono text-lg font-bold text-gray-800">{order.display_order_id}</p>
                    </div>
                </div>

                {/* ── Stepper ── */}
                <div className="bg-[#FAF0F3] rounded-[32px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-8 mb-8">
                    <h2 className="text-lg font-serif font-semibold text-gray-800 mb-8">Order Status</h2>
                    
                    {isCancelled ? (
                        <div className="p-6 bg-red-50 rounded-2xl border border-red-200 text-center">
                            <p className="text-red-700 font-bold text-lg mb-1">Order Cancelled</p>
                            <p className="text-red-500 text-sm">This order has been cancelled and will not be fulfilled.</p>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Track Background */}
                            <div className="absolute top-6 left-6 right-6 h-1 bg-gray-200 rounded-full" />
                            {/* Active Track */}
                            <div 
                                className="absolute top-6 left-6 h-1 bg-[#E91E63] rounded-full transition-all duration-500"
                                style={{ width: `${(Math.max(0, currentIndex) / (stages.length - 1)) * 100}%` }}
                            />
                            
                            <div className="relative flex justify-between">
                                {stages.map((stage, idx) => {
                                    const isActive = idx <= currentIndex;
                                    const isCurrent = idx === currentIndex;
                                    const Icon = stage.icon;
                                    
                                    return (
                                        <div key={stage.id} className="flex flex-col items-center w-24">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center z-10 border-4 border-[#FAF0F3] transition-colors duration-500 ${
                                                isActive 
                                                    ? 'bg-[#E91E63] text-white shadow-[0_0_15px_rgba(233,30,99,0.4)]' 
                                                    : 'bg-white text-gray-400 shadow-sm'
                                            }`}>
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <div className="mt-3 text-center">
                                                <p className={`text-[11px] font-bold uppercase tracking-wider ${isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                                                    {stage.label}
                                                </p>
                                                {isCurrent && (
                                                    <span className="inline-block mt-1 w-1.5 h-1.5 bg-[#E91E63] rounded-full animate-pulse" />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Courier Details & Map ── */}
                {isDelivery && (
                    <div className="bg-white rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 overflow-hidden mb-8 z-10 relative">
                        {currentStatus === 'out_for_delivery' && (
                            <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-6 flex flex-col sm:flex-row items-center gap-6 border-b border-orange-100">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                                    <Truck className="w-8 h-8 text-orange-500" />
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-1">Your Driver is on the way!</h3>
                                    <p className="text-gray-600 text-sm mb-3">They should be arriving shortly. Have your phone nearby.</p>
                                </div>
                            </div>
                        )}
                        {/* Map Tracker */}
                        <div className="h-64 sm:h-96 w-full relative z-0 bg-gray-100">
                            {order.delivery && (order.delivery.dropoff_latitude && order.delivery.dropoff_longitude) ? (
                                <MapContainer 
                                    center={startLat && startLng ? [startLat, startLng] : [order.delivery.dropoff_latitude, order.delivery.dropoff_longitude]} 
                                    zoom={14} 
                                    style={{ height: '100%', width: '100%' }}
                                    zoomControl={true}
                                    dragging={true}
                                    scrollWheelZoom={false}
                                >
                                    <TileLayer
                                        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        maxZoom={19}
                                    />
                                    {startLat && startLng && (
                                        <Marker position={[startLat, startLng]} icon={isRiderAssigned ? riderIcon : storeIcon}>
                                            <Popup>{isRiderAssigned ? 'Driver Location' : 'Seller Store'}</Popup>
                                        </Marker>
                                    )}
                                    <Marker position={[order.delivery.dropoff_latitude, order.delivery.dropoff_longitude]} icon={destinationIcon}>
                                        <Popup>Your Delivery Address</Popup>
                                    </Marker>
                                    {startLat && startLng && (
                                        <Polyline 
                                            positions={[[startLat, startLng], [order.delivery.dropoff_latitude, order.delivery.dropoff_longitude]]} 
                                            color="#E91E63" 
                                            weight={4}
                                            dashArray="10, 10"
                                        />
                                    )}
                                </MapContainer>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                                    <MapPin className="w-8 h-8 mb-2" />
                                    <p className="text-sm font-semibold">Map coordinates unavailable</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Order Details Grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Items & Payment */}
                    <div className="space-y-8">
                        <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6">
                            <div className="flex items-center gap-2 text-[#E91E63] mb-4 border-b border-pink-200/40 pb-3">
                                <ShoppingBag className="w-4 h-4 stroke-[2]" />
                                <h3 className="text-sm font-semibold text-gray-800">Order Items</h3>
                            </div>
                            <div className="space-y-4">
                                {order.order_items?.map((item, idx) => (
                                    <div key={item.order_item_id || idx} className="flex items-center gap-4">
                                        <img src={getProductImage(item.product)} alt="Product" className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shadow-sm" />
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm text-gray-800">{item.product?.flower_name || 'Item'}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-semibold text-gray-800 text-sm">₱{Number(item.subtotal).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 bg-[#FAF0F3] p-4 rounded-2xl shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] text-sm">
                                <div className="flex justify-between text-gray-500 mb-2">
                                    <span>Subtotal</span>
                                    <span>₱{(Number(order.total_amount) - (isDelivery ? 50 : 0)).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 mb-2">
                                    <span>{isDelivery ? 'Delivery Fee' : 'Pickup Fee'}</span>
                                    <span>{isDelivery ? '₱50.00' : 'Free'}</span>
                                </div>
                                <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-pink-200/40">
                                    <span>Total</span>
                                    <span className="text-[#E91E63]">₱{Number(order.total_amount).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fulfillment Details */}
                    <div className="space-y-8">
                        <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 text-sm">
                            <div className="flex items-center gap-2 text-[#E91E63] mb-4 border-b border-pink-200/40 pb-3">
                                <MapPin className="w-4 h-4 stroke-[2]" />
                                <h3 className="font-semibold text-gray-800">Fulfillment Details</h3>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Method</p>
                                    <p className="font-medium text-gray-700">{isDelivery ? 'Doorstep Delivery' : 'Store Pickup'}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Shop</p>
                                    <p className="font-medium text-gray-700">{order.seller?.shop_name || 'Flower Shop'}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{order.seller?.address}</p>
                                </div>

                                {isDelivery && order.delivery && (
                                    <div>
                                        <p className="text-xs text-gray-400 font-semibold uppercase mb-1">Delivery Address</p>
                                        <p className="font-medium text-gray-700">
                                            {[order.delivery.street_address, order.delivery.barangay, order.delivery.city, order.delivery.province].filter(Boolean).join(', ')}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 text-sm">
                            <div className="flex items-center gap-2 text-[#E91E63] mb-4 border-b border-pink-200/40 pb-3">
                                <CreditCard className="w-4 h-4 stroke-[2]" />
                                <h3 className="font-semibold text-gray-800">Payment Details</h3>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Method</span>
                                    <span className="font-medium text-gray-700">{order.payment_method || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Status</span>
                                    <span className={`font-bold ${order.payment_status?.toLowerCase() === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                        {order.payment_status || 'Pending'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Status History Logs */}
                        <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 text-sm">
                            <div className="flex items-center gap-2 text-[#E91E63] mb-4 border-b border-pink-200/40 pb-3">
                                <Activity className="w-4 h-4 stroke-[2]" />
                                <h3 className="font-semibold text-gray-800">Tracking History</h3>
                            </div>
                            
                            <div className="space-y-4">
                                {order.status_histories && order.status_histories.length > 0 ? (
                                    order.status_histories.map((history, idx) => (
                                        <div key={history.id} className="flex gap-4 relative">
                                            {idx !== order.status_histories.length - 1 && (
                                                <div className="absolute left-1.5 top-6 bottom-[-16px] w-[2px] bg-pink-100" />
                                            )}
                                            <div className="w-3 h-3 rounded-full bg-[#E91E63] mt-1 shrink-0 z-10 ring-4 ring-[#FAF0F3]" />
                                            <div>
                                                <p className="font-bold text-gray-800 uppercase text-xs tracking-wider">{history.status}</p>
                                                <p className="text-xs text-gray-500 mt-0.5 font-medium">
                                                    {new Date(history.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-xs italic">No tracking updates available yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
