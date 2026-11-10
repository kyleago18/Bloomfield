import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    ArrowLeft, 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    ShoppingBag, 
    Clock, 
    Heart, 
    Package, 
    ShieldCheck,
    CheckCircle2,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

const STATUS_COLORS = {
    Pending:            'bg-amber-100/80 text-amber-800 border-amber-200/60',
    Accepted:           'bg-sky-100/80 text-sky-800 border-sky-200/60',
    Preparing:          'bg-violet-100/80 text-violet-800 border-violet-200/60',
    'Ready for Pickup': 'bg-pink-100/80 text-pink-800 border-pink-200/60',
    'Out for Delivery': 'bg-blue-100/80 text-blue-800 border-blue-200/60',
    Completed:          'bg-emerald-100/80 text-emerald-800 border-emerald-200/60',
    Delivered:          'bg-emerald-100/80 text-emerald-800 border-emerald-200/60',
    Rejected:           'bg-rose-100/80 text-rose-800 border-rose-200/60',
    Cancelled:          'bg-rose-50 text-rose-600 border-rose-200/40',
};

export default function CustomerProfileShow({ seller, customer }) {
    const [showAllOrders, setShowAllOrders] = useState(false);

    const handleBack = () => {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.location.href = route('seller.orders.index');
        }
    };

    const getInitials = (name) => {
        if (!name) return 'C';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    const allOrders = customer.recent_orders || [];
    const visibleOrders = showAllOrders ? allOrders : allOrders.slice(0, 4);

    return (
        <SellerLayout seller={seller} title={`Customer Profile — ${customer.full_name}`}>
            <Head title={`${customer.full_name} — Customer Profile`} />

            <div className="space-y-6 pb-16 max-w-6xl mx-auto">
                {/* Top Navigation & Back Button */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="h-10 w-10 bg-[#FAF0F3] shadow-[4px_4px_8px_#e2d7da,-4px_-4px_8px_#ffffff] rounded-full flex items-center justify-center text-gray-600 hover:text-[#E91E63] transition-all cursor-pointer"
                            title="Go Back"
                        >
                            <ArrowLeft className="h-5 w-5 stroke-[1.8]" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl sm:text-2xl font-serif font-semibold text-gray-800 tracking-tight">
                                    Customer Profile
                                </h2>
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                                    <ShieldCheck className="w-3.5 h-3.5" />
                                    Read-Only View
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5 font-normal">
                                Viewing customer details and store order history
                            </p>
                        </div>
                    </div>
                </div>

                {/* Profile Header Card */}
                <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                        {/* Avatar */}
                        {customer.avatar_url ? (
                            <img
                                src={customer.avatar_url}
                                alt={customer.full_name}
                                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-[4px_4px_10px_#e2d7da,-4px_-4px_10px_#ffffff] border-2 border-white shrink-0"
                            />
                        ) : (
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-[#E91E63] to-[#E07A5F] text-white font-bold text-2xl sm:text-3xl flex items-center justify-center shadow-[4px_4px_10px_#e2d7da,-4px_-4px_10px_#ffffff] shrink-0">
                                {getInitials(customer.full_name)}
                            </div>
                        )}

                        <div className="flex-1 min-w-0 space-y-2">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                                <h1 className="text-2xl font-bold text-gray-800">
                                    {customer.full_name}
                                </h1>
                                {customer.is_following && (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-pink-100 text-pink-700 px-3 py-1 rounded-full">
                                        <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                                        Follower
                                    </span>
                                )}
                            </div>

                            <p className="text-xs sm:text-sm font-medium text-pink-600">
                                @{customer.username}
                            </p>

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-2 gap-x-4 pt-2 text-xs text-gray-500">
                                {customer.member_since && (
                                    <span className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                        Member since {customer.member_since}
                                    </span>
                                )}
                                {customer.is_following && customer.followed_at && (
                                    <span className="flex items-center gap-1.5 text-pink-600 font-medium">
                                        <Heart className="w-3.5 h-3.5" />
                                        Following since {customer.followed_at}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                    {/* Completed Orders Card */}
                    <div className="bg-[#FAF0F3] p-4.5 rounded-[24px] shadow-[6px_6px_14px_#e2d7da,-6px_-6px_14px_#ffffff] border border-white/80 flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="h-5 w-5 stroke-[1.8]" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Completed Orders</p>
                            <p className="text-base sm:text-lg font-bold text-gray-800 mt-0.5">{customer.completed_orders ?? 0}</p>
                        </div>
                    </div>

                    {/* Total Orders Card */}
                    <div className="bg-[#FAF0F3] p-4.5 rounded-[24px] shadow-[6px_6px_14px_#e2d7da,-6px_-6px_14px_#ffffff] border border-white/80 flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-2xl bg-pink-100 text-[#E91E63] flex items-center justify-center shrink-0">
                            <ShoppingBag className="h-5 w-5 stroke-[1.8]" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Orders with You</p>
                            <p className="text-base sm:text-lg font-bold text-gray-800 mt-0.5">{customer.total_orders ?? 0}</p>
                        </div>
                    </div>

                    {/* Last Order Date Card */}
                    <div className="bg-[#FAF0F3] p-4.5 rounded-[24px] shadow-[6px_6px_14px_#e2d7da,-6px_-6px_14px_#ffffff] border border-white/80 flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                            <Clock className="h-5 w-5 stroke-[1.8]" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Last Order</p>
                            <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate mt-0.5">
                                {customer.last_order_date || 'No orders'}
                            </p>
                        </div>
                    </div>

                    {/* Follower Status Card */}
                    <div className="bg-[#FAF0F3] p-4.5 rounded-[24px] shadow-[6px_6px_14px_#e2d7da,-6px_-6px_14px_#ffffff] border border-white/80 flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                            <Heart className="h-5 w-5 stroke-[1.8]" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Follower Status</p>
                            <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate mt-0.5">
                                {customer.is_following ? 'Following' : 'Not Following'}
                            </p>
                        </div>
                    </div>

                    {/* Registered Card */}
                    <div className="col-span-2 sm:col-span-1 bg-[#FAF0F3] p-4.5 rounded-[24px] shadow-[6px_6px_14px_#e2d7da,-6px_-6px_14px_#ffffff] border border-white/80 flex items-center gap-3.5">
                        <div className="h-10 w-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <Calendar className="h-5 w-5 stroke-[1.8]" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] sm:text-[11px] font-semibold text-gray-400 uppercase tracking-wider truncate">Registered</p>
                            <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate mt-0.5">
                                {customer.member_since_date || '—'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Contact & Location Information */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 space-y-5">
                            <h3 className="text-base font-semibold text-gray-800 border-b border-pink-200/40 pb-3 flex items-center gap-2">
                                <User className="h-4 w-4 text-[#E91E63] stroke-[1.8]" />
                                Contact & Location
                            </h3>

                            <div className="space-y-3.5">
                                <div>
                                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                                        Email Address
                                    </span>
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff]">
                                        <Mail className="h-4 w-4 text-pink-400 shrink-0 stroke-[1.8]" />
                                        <span className="text-xs font-medium text-gray-800 break-all">
                                            {customer.email || 'No email available'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                                        Contact Number
                                    </span>
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff]">
                                        <Phone className="h-4 w-4 text-pink-400 shrink-0 stroke-[1.8]" />
                                        <span className="text-xs font-medium text-gray-800">
                                            {customer.contact_number || 'Not provided'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                                        City / Municipality
                                    </span>
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff]">
                                        <MapPin className="h-4 w-4 text-pink-400 shrink-0 stroke-[1.8]" />
                                        <span className="text-xs font-medium text-gray-800">
                                            {customer.city || 'Not specified'}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
                                        Province
                                    </span>
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff]">
                                        <MapPin className="h-4 w-4 text-pink-400 shrink-0 stroke-[1.8]" />
                                        <span className="text-xs font-medium text-gray-800">
                                            {customer.province || 'Not specified'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Orders from this Customer (Read-Only, Compact with View All) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 flex flex-col justify-between">
                            <div>
                                <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-pink-200/40 mb-4">
                                    <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                                        <Package className="h-4 w-4 text-[#E91E63] stroke-[1.8]" />
                                        Order History with {seller?.shop_name || 'Your Shop'}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                            {customer.completed_orders ?? 0} Completed
                                        </span>
                                        <span className="bg-pink-100 text-pink-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                            {customer.total_orders} Total
                                        </span>
                                    </div>
                                </div>

                                {(!allOrders || allOrders.length === 0) ? (
                                    <div className="p-8 text-center bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-2xl">
                                        <ShoppingBag className="w-10 h-10 mx-auto text-pink-300 mb-2 stroke-[1.5]" />
                                        <p className="text-xs sm:text-sm font-semibold text-gray-700">No orders placed yet</p>
                                        <p className="text-xs text-gray-500 mt-1">This customer hasn't purchased any items from your store yet.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                                            <thead>
                                                <tr className="border-b border-pink-200/40 text-[#E91E63] font-semibold uppercase tracking-wider">
                                                    <th className="pb-3 px-3">Order ID</th>
                                                    <th className="pb-3 px-3">Date</th>
                                                    <th className="pb-3 px-3">Amount</th>
                                                    <th className="pb-3 px-3 text-right">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-pink-200/30">
                                                {visibleOrders.map(order => (
                                                    <tr key={order.order_id} className="hover:bg-pink-50/40 transition-colors">
                                                        <td className="py-3 px-3 font-semibold text-gray-800">
                                                            {order.display_order_id || order.order_id}
                                                        </td>
                                                        <td className="py-3 px-3 text-gray-600">
                                                            {new Date(order.created_at).toLocaleDateString('en-PH', { dateStyle: 'medium' })}
                                                        </td>
                                                        <td className="py-3 px-3 font-semibold text-gray-800">
                                                            ₱{Number(order.total_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="py-3 px-3 text-right">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[order.order_status] ?? 'bg-pink-100 text-pink-800'}`}>
                                                                {order.order_status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* View All Toggle Button */}
                            {allOrders.length > 4 && (
                                <div className="pt-4 mt-3 border-t border-pink-200/30 flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => setShowAllOrders(prev => !prev)}
                                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#FAF0F3] shadow-[3px_3px_7px_#e2d7da,-3px_-3px_7px_#ffffff] hover:shadow-[inset_2px_2px_4px_#e2d7da,inset_-2px_-2px_4px_#ffffff] text-[#E91E63] text-xs font-semibold rounded-full transition-all cursor-pointer"
                                    >
                                        <span>{showAllOrders ? 'Show Less' : `View All Orders (${allOrders.length})`}</span>
                                        {showAllOrders ? (
                                            <ChevronUp className="w-3.5 h-3.5" />
                                        ) : (
                                            <ChevronDown className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SellerLayout>
    );
}
