import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import SellerLayout from '@/Layouts/SellerLayout';
import { getProductImage } from '@/utils/productImages';
import { 
    ArrowLeft, 
    MapPin, 
    Phone, 
    Mail, 
    Truck,
    CheckCircle2,
    XCircle,
    Clock,
    ClipboardCheck,
    Package,
    Coins,
    User,
    Store,
    AlertCircle
} from 'lucide-react';
import RoutingMap from '@/Components/RoutingMap';
import { fetchDrivingRoute } from '@/Services/osrmService';

const STATUS_COLORS = {
    Pending:            'bg-amber-100/70 text-amber-800 border-amber-200/60',
    Confirmed:          'bg-sky-100/70 text-sky-800 border-sky-200/60',
    Preparing:          'bg-violet-100/70 text-violet-800 border-violet-200/60',
    'Ready for Pickup': 'bg-pink-100/70 text-pink-800 border-pink-200/60',
    'Out for Delivery': 'bg-blue-100/70 text-blue-800 border-blue-200/60',
    Completed:          'bg-emerald-100/70 text-emerald-800 border-emerald-200/60',
    Delivered:          'bg-emerald-100/70 text-emerald-800 border-emerald-200/60',
    Rejected:           'bg-rose-100/70 text-rose-800 border-rose-200/60',
    Cancelled:          'bg-rose-50 text-rose-600 border-rose-200/40',
};

const NEXT_STATUSES_DELIVERY = {
    Pending:   ['Confirmed', 'Rejected'],
    Confirmed: ['Preparing', 'Cancelled'],
    Preparing: ['Out for Delivery'],
    'Out for Delivery': ['Delivered'],
    Delivered: [],
    Rejected:  [],
    Cancelled: [],
};

const NEXT_STATUSES_PICKUP = {
    Pending:   ['Confirmed', 'Rejected'],
    Confirmed: ['Preparing', 'Cancelled'],
    Preparing: ['Ready for Pickup'],
    'Ready for Pickup': ['Completed'],
    Completed: [],
    Rejected:  [],
    Cancelled: [],
};

const STATUS_PIPELINE_DELIVERY = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];
const STATUS_PIPELINE_PICKUP   = ['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Completed'];

export default function SellerOrderShow({ order: initialOrder, seller }) {
    const [order, setOrder] = useState(initialOrder);

    const getSpecialRequests = () => {
        if (!order.special_requests) return null;
        try {
            const parsed = JSON.parse(order.special_requests);
            if (parsed && typeof parsed === 'object') {
                const hasAddOns = Array.isArray(parsed.addOns) && parsed.addOns.length > 0;
                const hasNote = parsed.note && parsed.note.trim() !== '';
                if (!hasAddOns && !hasNote) return null;
                return parsed;
            }
        } catch (e) {
            if (order.special_requests.trim() !== '') return { note: order.special_requests };
        }
        return null;
    };

    const specialRequestData = getSpecialRequests();
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        setOrder(initialOrder);
    }, [initialOrder]);

    const [routeData, setRouteData] = useState(null);
    const [routeMeta, setRouteMeta] = useState(null);

    const isPickup = order?.delivery_method === 'pickup';

    const defaultUserAddress = order?.user?.addresses?.[0];
    const sellerLat = Number(seller?.latitude || order?.seller?.latitude || 6.7508);
    const sellerLng = Number(seller?.longitude || order?.seller?.longitude || 125.3571);

    const customerLat = Number(order?.delivery?.dropoff_latitude || defaultUserAddress?.latitude || 6.7412);
    const customerLng = Number(order?.delivery?.dropoff_longitude || defaultUserAddress?.longitude || 125.3489);

    useEffect(() => {
        const fetchRoute = async () => {
            if (sellerLat && sellerLng && customerLat && customerLng && !isPickup) {
                try {
                    const shopLoc = { lat: sellerLat, lng: sellerLng };
                    const custLoc = { lat: customerLat, lng: customerLng };
                    const res = await fetchDrivingRoute(shopLoc, custLoc);
                    setRouteData(res.coords);
                    setRouteMeta({ distance: res.distanceStr, duration: res.travelTimeStr });
                } catch (e) {
                    console.error('Route error:', e);
                }
            }
        };
        fetchRoute();
    }, [sellerLat, sellerLng, customerLat, customerLng, isPickup]);

    const updateStatus = (status) => {
        const previousOrder = { ...order };
        setOrder({ ...order, order_status: status });
        setProcessing(true);
        
        router.patch(route('seller.orders.update-status', order.order_id), { status }, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
            onError: () => setOrder(previousOrder)
        });
    };

    const updatePaymentStatus = (payment_status) => {
        const previousOrder = { ...order };
        setOrder({ ...order, payment_status });
        setProcessing(true);
        
        router.patch(route('seller.orders.update-payment-status', order.order_id), { payment_status }, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
            onError: () => setOrder(previousOrder)
        });
    };

    const nextStatuses = (isPickup ? NEXT_STATUSES_PICKUP[order.order_status] : NEXT_STATUSES_DELIVERY[order.order_status]) ?? [];
    const statusPipeline = isPickup ? STATUS_PIPELINE_PICKUP : STATUS_PIPELINE_DELIVERY;
    
    // Calculate progress for stepper
    const currentStepIndex = statusPipeline.indexOf(order.order_status);
    const isCancelledOrRejected = ['Cancelled', 'Rejected'].includes(order.order_status);

    const getInitials = (firstName, lastName) => {
        return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase() || '?';
    };

    const orderCode = order.display_order_id || order.order_id;

    return (
        <SellerLayout seller={seller} title={`Order ${orderCode}`}>
            <Head title={`Order ${orderCode} — Seller Dashboard`} />
            <div className="space-y-6 pb-16">
                
                {/* Header & Back */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link 
                            href={route('seller.orders.index')} 
                            className="h-10 w-10 bg-[#FAF0F3] shadow-[4px_4px_8px_#e2d7da,-4px_-4px_8px_#ffffff] rounded-full flex items-center justify-center text-gray-600 hover:text-[#E91E63] transition-all"
                        >
                            <ArrowLeft className="h-5 w-5 stroke-[1.8]" />
                        </Link>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-gray-800 tracking-tight flex items-center gap-3">
                                Order {orderCode}
                                {['Delivered', 'Completed'].includes(order.order_status) && <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5 font-normal">
                                Placed on {new Date(order.created_at).toLocaleString('en-PH', { dateStyle: 'long', timeStyle: 'short' })} • 
                                <span className={`ml-1 font-semibold ${isPickup ? 'text-amber-600' : 'text-blue-600'}`}>
                                    {isPickup ? 'Store Pickup' : 'Doorstep Delivery'}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {nextStatuses.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 bg-[#FAF0F3] p-2 rounded-2xl shadow-[inset_2px_2px_5px_#e2d7da,inset_-2px_-2px_5px_#ffffff] border border-white/60">
                            {nextStatuses.map(status => {
                                const isDestructive = ['Cancelled', 'Rejected'].includes(status);
                                return (
                                    <button
                                        key={status}
                                        type="button"
                                        disabled={processing}
                                        onClick={() => updateStatus(status)}
                                        className={`flex items-center justify-center gap-2 rounded-full px-5 py-2 text-xs sm:text-sm font-semibold transition-all duration-300 disabled:opacity-50
                                            ${isDestructive 
                                                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                                                : 'bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white shadow-[2px_2px_6px_rgba(233,30,99,0.25)]'}`}
                                    >
                                        {isDestructive ? status + ' Order' : `Mark as ${status}`}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Progress Stepper */}
                <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 sm:p-8">
                    {isCancelledOrRejected ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                            <XCircle className="h-14 w-14 text-rose-500 mb-3 stroke-[1.8]" />
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">Order {order.order_status}</h3>
                            <p className="text-xs text-gray-500 font-normal">This order has been {order.order_status.toLowerCase()} and cannot be processed further.</p>
                        </div>
                    ) : (
                        <div className="relative max-w-4xl mx-auto">
                            <div className="overflow-hidden h-2 mb-4 rounded-full bg-[#FAF0F3] shadow-[inset_2px_2px_4px_#e2d7da,inset_-2px_-2px_4px_#ffffff]">
                                <div style={{ width: `${(Math.max(0, currentStepIndex) / (statusPipeline.length - 1)) * 100}%` }} className="h-full rounded-full bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] transition-all duration-1000 ease-in-out"></div>
                            </div>
                            <div className="flex justify-between w-full">
                                {statusPipeline.map((step, index) => {
                                    const isCompleted = index <= currentStepIndex;
                                    const isCurrent = index === currentStepIndex;
                                    return (
                                        <div key={step} className="flex flex-col items-center">
                                            <div className={`h-9 w-9 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-500 z-10 -mt-8 border-4 border-[#FAF0F3]
                                                ${isCompleted ? 'bg-gradient-to-r from-[#E91E63] to-[#E07A5F] text-white shadow-[2px_2px_6px_rgba(233,30,99,0.25)]' : 'bg-[#FAF0F3] shadow-[inset_2px_2px_4px_#e2d7da,inset_-2px_-2px_4px_#ffffff] text-gray-400'}`}>
                                                {isCompleted ? <CheckCircle2 className="h-5 w-5 text-white stroke-[2]" /> : index + 1}
                                            </div>
                                            <span className={`mt-2 text-xs font-semibold transition-colors duration-500 ${isCurrent ? 'text-gray-800' : (isCompleted ? 'text-[#E91E63]' : 'text-gray-400')}`}>
                                                {step}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Split Pane Layout */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    
                    {/* Left Pane: Items & Delivery/Pickup Map */}
                    <div className="xl:col-span-2 space-y-6">
                        
                        {/* Order Items */}
                        <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 overflow-hidden">
                            <div className="px-6 py-4 border-b border-pink-200/40 flex items-center justify-between">
                                <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                    <Package className="h-5 w-5 text-[#E91E63] stroke-[1.8]" />
                                    Order Items
                                </h2>
                                <span className="bg-pink-100 text-pink-700 px-3 py-0.5 rounded-full text-xs font-semibold">{order.order_items?.length || 0} items</span>
                            </div>
                            
                            <div className="divide-y divide-pink-200/30">
                                {order.order_items?.map(item => (
                                    <div key={item.order_item_id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-5 hover:bg-pink-50/30 transition-colors">
                                        <div className="h-20 w-20 rounded-2xl overflow-hidden shadow-xs shrink-0 border border-gray-200">
                                            <img
                                                src={getProductImage(item.product)}
                                                alt={item.product?.name ?? item.product?.flower_name ?? 'Product'}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-xs sm:text-sm font-semibold text-gray-800 mb-1">
                                                {item.product?.name ?? item.product?.flower_name}
                                            </h4>
                                            <p className="text-xs text-gray-500 font-normal flex items-center gap-2">
                                                <span>Qty: <strong className="text-gray-800 font-semibold">{item.quantity}</strong></span>
                                                <span className="text-pink-300">•</span>
                                                <span>Price: ₱{Number(item.product?.price || 0).toLocaleString('en-PH')}</span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-base sm:text-lg font-semibold text-gray-800">₱{Number(item.subtotal).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="px-6 py-4 bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] flex justify-between items-center border-t border-pink-200/40">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Amount</span>
                                <span className="text-xl font-bold text-gray-800">₱{Number(order.total_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        {/* Delivery or Pickup Map & Details */}
                        <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 overflow-hidden flex flex-col">
                            <div className="px-6 py-4 border-b border-pink-200/40 flex items-center justify-between">
                                <h2 className="text-base font-semibold text-gray-800">
                                    {isPickup ? 'Store Pickup Details' : 'Delivery Details'}
                                </h2>
                                <span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${isPickup ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'}`}>
                                    {isPickup ? 'STORE PICKUP' : (order.delivery?.delivery_status || 'PENDING')}
                                </span>
                            </div>

                            {isPickup ? (
                                <div className="p-6 space-y-4">
                                    <div className="py-2 border-l-[3px] border-gray-300 pl-4 mb-2">
                                        <p className="text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-1">Store Pickup</p>
                                        <p className="text-xs text-gray-500 leading-relaxed">
                                            The customer will collect this order at <strong className="font-semibold text-gray-700">{seller?.shop_name || 'Your Shop'}</strong>. Prepare the items and mark as <strong>Ready for Pickup</strong>.
                                        </p>
                                    </div>
                                    <div className="h-[280px] w-full relative rounded-2xl overflow-hidden border border-white/80 shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff]">
                                        <RoutingMap 
                                            shopLocation={{ lat: sellerLat, lng: sellerLng }} 
                                            shopName={seller?.shop_name || 'Your Shop'}
                                            mode="pickup"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-start gap-3 bg-[#FAF0F3] p-4 rounded-2xl shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff]">
                                            <div className="h-9 w-9 rounded-full bg-[#FAF0F3] shadow-[2px_2px_5px_#e2d7da,-2px_-2px_5px_#ffffff] flex items-center justify-center shrink-0 text-pink-500">
                                                <MapPin className="h-4 w-4 stroke-[1.8]" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                                    {order.delivery?.dropoff_address ? 'Dropoff Address' : 'Customer Address'}
                                                </p>
                                                <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-relaxed">
                                                    {order.delivery?.dropoff_address || (defaultUserAddress ? `${defaultUserAddress.street}, ${defaultUserAddress.barangay}, ${defaultUserAddress.city}, ${defaultUserAddress.province}` : 'No address provided')}
                                                </p>
                                            </div>
                                        </div>
                                        {order.delivery && (
                                            <div className="flex items-start gap-3 bg-[#FAF0F3] p-4 rounded-2xl shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff]">
                                                <div className="h-9 w-9 rounded-full bg-[#FAF0F3] shadow-[2px_2px_5px_#e2d7da,-2px_-2px_5px_#ffffff] flex items-center justify-center shrink-0 text-pink-500">
                                                    <Coins className="h-4 w-4 stroke-[1.8]" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Delivery Fee</p>
                                                    <p className="text-sm sm:text-base font-bold text-gray-800">₱{Number(order.delivery.delivery_fee || 0).toLocaleString('en-PH')}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="h-[320px] w-full border-t border-pink-200/40 relative">
                                        <div className="absolute top-3 left-3 z-[1000] bg-[#FAF0F3]/95 backdrop-blur-md px-3.5 py-1.5 rounded-xl shadow-md border border-white/80 flex items-center gap-2 text-xs font-semibold text-gray-800">
                                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                                            <span>Route from Store ({seller?.shop_name || 'Your Shop'}) → Customer</span>
                                        </div>
                                        <RoutingMap 
                                            shopLocation={{ lat: sellerLat, lng: sellerLng }} 
                                            userLocation={{ lat: customerLat, lng: customerLng }} 
                                            shopName={seller?.shop_name || 'Your Shop'}
                                            routeData={routeData} 
                                            mode="delivery"
                                        />
                                        {routeMeta && (
                                            <div className="absolute bottom-4 right-4 bg-[#FAF0F3]/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-white/80 flex items-center gap-4 z-[1000]">
                                                <div>
                                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Distance</p>
                                                    <p className="text-xs sm:text-sm font-bold text-gray-800">{routeMeta.distance}</p>
                                                </div>
                                                <div className="w-px h-6 bg-pink-200/50"></div>
                                                <div>
                                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Est. Driving Time</p>
                                                    <p className="text-xs sm:text-sm font-bold text-pink-600">{routeMeta.duration}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Pane: Customer & Payment */}
                    <div className="space-y-6">
                        
                        {/* Customer Info */}
                        <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 space-y-4">
                            <div className="flex items-center justify-between border-b border-pink-200/40 pb-3">
                                <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                    <User className="h-4 w-4 text-[#E91E63] stroke-[1.8]" />
                                    Customer Details
                                </h3>
                                {order.user_id && (
                                    <Link
                                        href={route('seller.customers.show', order.user_id)}
                                        className="text-xs font-semibold text-[#E91E63] hover:underline"
                                    >
                                        View Profile →
                                    </Link>
                                )}
                            </div>
                            
                            <div className="flex items-center gap-3.5">
                                {order.user_id ? (
                                    <Link 
                                        href={route('seller.customers.show', order.user_id)}
                                        className="h-12 w-12 rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 text-white font-semibold flex items-center justify-center text-sm shrink-0 shadow-xs hover:scale-105 transition-transform"
                                        title="View Customer Profile"
                                    >
                                        {getInitials(order.customer_first_name, order.customer_last_name)}
                                    </Link>
                                ) : (
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 text-white font-semibold flex items-center justify-center text-sm shrink-0 shadow-xs">
                                        {getInitials(order.customer_first_name, order.customer_last_name)}
                                    </div>
                                )}
                                <div>
                                    {order.user_id ? (
                                        <Link 
                                            href={route('seller.customers.show', order.user_id)}
                                            className="text-xs sm:text-sm font-semibold text-gray-800 hover:text-[#E91E63] hover:underline transition-colors block"
                                        >
                                            {order.customer_first_name} {order.customer_last_name}
                                        </Link>
                                    ) : (
                                        <p className="text-xs sm:text-sm font-semibold text-gray-800">{order.customer_first_name} {order.customer_last_name}</p>
                                    )}
                                    <p className="text-xs text-gray-400 font-normal">Registered Customer</p>
                                </div>
                            </div>
                            
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff]">
                                    <Mail className="h-4 w-4 text-pink-400 shrink-0 stroke-[1.8]" />
                                    <span className="text-xs font-normal text-gray-700 truncate">{order.customer_email}</span>
                                </div>
                                {order.customer_contact && (
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff]">
                                        <Phone className="h-4 w-4 text-pink-400 shrink-0 stroke-[1.8]" />
                                        <span className="text-xs font-normal text-gray-700">{order.customer_contact}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recipient Info (if different) */}
                        {order.receiver_first_name && (
                            <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 space-y-3">
                                <h3 className="text-base font-semibold text-gray-800 border-b border-pink-200/40 pb-3 flex items-center gap-2">
                                    <User className="h-4 w-4 text-purple-500 stroke-[1.8]" />
                                    Recipient
                                </h3>
                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center justify-between pb-2 border-b border-pink-200/30">
                                        <span className="font-semibold text-gray-500">Name</span>
                                        <span className="font-semibold text-gray-800">{order.receiver_first_name} {order.receiver_last_name}</span>
                                    </div>
                                    <div className="flex items-center justify-between pb-2 border-b border-pink-200/30">
                                        <span className="font-semibold text-gray-500">Email</span>
                                        <span className="font-medium text-gray-700">{order.receiver_email}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-gray-500">Contact</span>
                                        <span className="font-medium text-gray-700">{order.receiver_contact}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Summary Card */}
                        <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 space-y-4">
                            <h3 className="text-base font-semibold text-gray-800 border-b border-pink-200/40 pb-3 flex items-center gap-2">
                                <ClipboardCheck className="h-4 w-4 text-[#E91E63] stroke-[1.8]" />
                                Payment Summary
                            </h3>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between items-center pb-3 border-b border-pink-200/30">
                                    <span className="text-xs font-medium text-gray-500">Method</span>
                                    <span className="font-semibold text-gray-800 capitalize bg-pink-100/60 px-3 py-0.5 rounded-full text-xs">
                                        {order.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : 
                                         (order.payment_method === 'credit_card' ? 'Credit Card' : 
                                         (order.payment_method === 'debit_card' ? 'Debit Card' : 'Online Payment'))}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pb-3 border-b border-pink-200/30">
                                    <span className="text-xs font-medium text-gray-500">Status</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`font-semibold px-2.5 py-0.5 rounded-full text-xs ${
                                            order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                        }`}>
                                            {order.payment_status ? order.payment_status.toUpperCase() : 'PENDING'}
                                        </span>
                                        {order.payment_status !== 'paid' && (
                                            <button 
                                                disabled={processing}
                                                onClick={() => updatePaymentStatus('paid')}
                                                className="text-[10px] font-semibold bg-gradient-to-r from-[#E91E63] to-[#E07A5F] text-white px-2.5 py-1 rounded-full shadow-xs hover:shadow transition-all disabled:opacity-50"
                                            >
                                                MARK PAID
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-1">
                                    <span className="text-xs font-semibold text-gray-700">Total Charge</span>
                                    <span className="text-lg font-bold text-[#E91E63]">
                                        ₱{Number(order.total_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Special Requests */}
                        {specialRequestData && (
                            <div className="bg-[#FAF0F3] rounded-[24px] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] p-5 border border-pink-200/50 space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                                    <h3 className="text-xs font-semibold text-pink-700 uppercase tracking-wider">Special Request</h3>
                                </div>
                                
                                {specialRequestData.addOns && specialRequestData.addOns.length > 0 && (
                                    <div className="space-y-1 mt-2">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Add-ons:</p>
                                        <ul className="list-disc pl-4 text-xs text-gray-700 font-medium">
                                            {specialRequestData.addOns.map((addon, idx) => (
                                                <li key={idx}>{addon}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                
                                {specialRequestData.note && (
                                    <div className="space-y-1 mt-2">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Note:</p>
                                        <p className="text-xs text-gray-700 leading-relaxed font-medium italic">"{specialRequestData.note}"</p>
                                    </div>
                                )}
                            </div>
                        )}
                        
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
}
