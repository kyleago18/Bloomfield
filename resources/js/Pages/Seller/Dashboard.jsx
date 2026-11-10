import React, { Suspense, lazy, useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import SellerLayout from '@/Layouts/SellerLayout';
import { getProductImage } from '@/utils/productImages';

const DashboardRevenueChart = lazy(() => import('@/Components/DashboardRevenueChart'));

import {
    Wallet,
    Users,
    ShoppingBag,
    Star,
    Package,
    Plus,
    Store,
    Megaphone,
    ArrowUpRight
} from 'lucide-react';

/* ── Floral Neumorphic Donut Gauge (65%) ── */
function FulfillmentDonutChart({ percentage = 65 }) {
    const radius = 54;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex flex-col items-center justify-center py-2">
            <svg className="w-36 h-36 transform -rotate-90 filter drop-shadow-sm" viewBox="0 0 130 130">
                <circle cx="65" cy="65" r={radius} stroke="#EEDAE0" strokeWidth="12" fill="transparent" />
                <circle
                    cx="65"
                    cy="65"
                    r={radius}
                    stroke="url(#roseDonutGrad)"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                />
                <defs>
                    <linearGradient id="roseDonutGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#E91E63" />
                        <stop offset="100%" stopColor="#E07A5F" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">{percentage}%</span>
            </div>
        </div>
    );
}

/* ── Floral Neumorphic Gauge Arc ── */
function SalesGoalGaugeArc({ percentage = 0 }) {
    const p = Math.max(0, Math.min(100, percentage));
    const c1 = 2 * Math.PI * 60;
    const offset1 = c1 - (p / 100) * c1;
    
    const c2 = 2 * Math.PI * 48;
    const offset2 = c2 - (p / 100) * c2;
    
    const c3 = 2 * Math.PI * 36;
    const offset3 = c3 - (p / 100) * c3;

    return (
        <div className="relative flex flex-col items-center justify-center py-2">
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 140 140">
                {/* Arc 1 */}
                <circle cx="70" cy="70" r="60" stroke="#EEDAE0" strokeWidth="8" fill="transparent" />
                <circle cx="70" cy="70" r="60" stroke="#E91E63" strokeWidth="8" strokeDasharray={c1} strokeDashoffset={offset1} strokeLinecap="round" fill="transparent" className="transition-all duration-1000 ease-out" />
                
                {/* Arc 2 */}
                <circle cx="70" cy="70" r="48" stroke="#F6E2E7" strokeWidth="8" fill="transparent" />
                <circle cx="70" cy="70" r="48" stroke="#F472B6" strokeWidth="8" strokeDasharray={c2} strokeDashoffset={offset2} strokeLinecap="round" fill="transparent" className="transition-all duration-1000 ease-out" />
                
                {/* Arc 3 */}
                <circle cx="70" cy="70" r="36" stroke="#E2D7DA" strokeWidth="8" fill="transparent" />
                <circle cx="70" cy="70" r="36" stroke="#E07A5F" strokeWidth="8" strokeDasharray={c3} strokeDashoffset={offset3} strokeLinecap="round" fill="transparent" className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-800">{p}%</span>
            </div>
        </div>
    );
}

export default function SellerDashboard({
    seller,
    stats,
    revenue_data,
    best_sellers,
    recent_orders,
    pending_orders_list,
    notifications,
    recent_followers,
}) {
    const [isEditingTarget, setIsEditingTarget] = useState(false);
    const [newTarget, setNewTarget] = useState(stats?.monthly_target || 1000000);
    const [isSavingTarget, setIsSavingTarget] = useState(false);

    const handleSaveTarget = () => {
        setIsSavingTarget(true);
        router.patch(route('seller.dashboard.update-target'), {
            monthly_target: newTarget
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsEditingTarget(false);
                setIsSavingTarget(false);
            },
            onError: () => {
                setIsSavingTarget(false);
            }
        });
    };

    if (!seller) {
        return (
            <SellerLayout title="Dashboard">
                <Head title="Seller Dashboard" />
                <div className="flex flex-col items-center justify-center h-[60vh] gap-4 text-center">
                    <div className="h-20 w-20 rounded-3xl bg-[#FAF0F3] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] flex items-center justify-center text-[#E91E63]">
                        <Store className="h-10 w-10 stroke-[1.8]" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">No shop profile found</h2>
                    <p className="text-sm text-gray-500 max-w-sm">Please set up your boutique shop profile to start receiving orders.</p>
                    <Link
                        href={route('seller.shop.edit')}
                        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white text-sm font-semibold shadow-[4px_4px_12px_rgba(233,30,99,0.25)] transition-all mt-2"
                    >
                        Create Shop Profile
                    </Link>
                </div>
            </SellerLayout>
        );
    }

    const ownerFirstName = seller?.owner_name ? seller.owner_name.split(' ')[0] : 'Seller';
    const totalRevenueFormatted = `₱${Number(stats?.total_revenue || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const rangeRevenue = revenue_data ? revenue_data.reduce((sum, item) => sum + Number(item.revenue), 0) : 0;
    const rangeRevenueFormatted = `₱${Number(rangeRevenue || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const monthlyTarget = stats?.monthly_target || 1000000;
    const targetProgress = Math.min(100, Math.round((rangeRevenue / monthlyTarget) * 100)) || 0;
    const monthlyTargetFormatted = `₱${Number(monthlyTarget || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    return (
        <SellerLayout seller={seller} title="Dashboard">
            <Head title={`${seller.shop_name} — Dashboard`} />

            <div className="space-y-6 pb-12">

                {/* TOP SECTION: Revenue Chart (8 cols) + Order Fulfillment Gauge Ring (4 cols) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Left: Neumorphic Floral Revenue Chart */}
                    <div className="lg:col-span-8 bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 flex flex-col justify-between">
                        <div className="flex items-center justify-between pb-4 border-b border-pink-200/40 mb-4">
                            <div>
                                <h3 className="text-base sm:text-lg font-semibold text-gray-800">Revenue Overview</h3>
                                <div className="flex items-center gap-4 text-xs sm:text-sm font-medium mt-1">
                                    <span className="text-[#D81B60]">Income <strong className="text-gray-800 text-sm font-semibold">{rangeRevenueFormatted}</strong></span>
                                    <span className="text-[#E07A5F]">Expenses <strong className="text-gray-800 text-sm font-semibold">₱0.00</strong></span>
                                </div>
                            </div>
                            <span className="px-3 py-1 rounded-xl bg-[#FAF0F3] shadow-[inset_2px_2px_5px_#e2d7da,inset_-2px_-2px_5px_#ffffff] text-[#E91E63] text-xs font-semibold">Monthly</span>
                        </div>

                        <div className="h-[230px] w-full">
                            <Suspense fallback={<div className="h-full flex items-center justify-center text-xs text-pink-400 animate-pulse">Loading chart data...</div>}>
                                <DashboardRevenueChart data={revenue_data} />
                            </Suspense>
                        </div>
                    </div>

                    {/* Right: Order Fulfillment Donut Gauge (4 cols) */}
                    <div className="lg:col-span-4 bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 flex flex-col justify-between items-center text-center">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 w-full text-left border-b border-pink-200/40 pb-3 mb-2">Fulfillment Ratio</h3>
                        <FulfillmentDonutChart percentage={stats?.fulfillment_ratio ?? 0} />
                        <div className="flex items-center justify-center gap-4 text-xs font-medium pt-2">
                            <span className="flex items-center gap-1.5 text-[#E91E63]"><span className="w-2.5 h-2.5 rounded-full bg-[#E91E63]"></span> Completed</span>
                            <span className="flex items-center gap-1.5 text-[#E07A5F]"><span className="w-2.5 h-2.5 rounded-full bg-[#E07A5F]"></span> Pending</span>
                        </div>
                    </div>
                </div>

                {/* MIDDLE SECTION: Target Gauge Arc + Category Inventory + Vertical Metric Summary Column */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Sales Goal Concentric Gauge Arc (40%) */}
                    <div className="lg:col-span-4 bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 flex flex-col justify-between items-center">
                        <div className="w-full flex items-center justify-between border-b border-pink-200/40 pb-3 mb-2">
                            <h3 className="text-base font-semibold text-gray-800">Sales Goal</h3>
                            {isEditingTarget ? (
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        value={newTarget}
                                        onChange={e => setNewTarget(e.target.value)}
                                        className="w-24 rounded-lg bg-[#FAF0F3] shadow-[inset_2px_2px_4px_#e2d7da,inset_-2px_-2px_4px_#ffffff] text-xs font-semibold text-gray-700 px-2 py-1 outline-none border-none animate-fade-in"
                                        min="0"
                                    />
                                    <button 
                                        onClick={handleSaveTarget}
                                        disabled={isSavingTarget}
                                        className="px-2.5 py-1 bg-gradient-to-r from-[#E91E63] to-[#E07A5F] text-white text-[10px] font-bold rounded-lg shadow-xs hover:shadow-md transition-all shrink-0"
                                    >
                                        {isSavingTarget ? '...' : 'Save'}
                                    </button>
                                    <button 
                                        onClick={() => setIsEditingTarget(false)}
                                        className="px-2 py-1 text-gray-400 hover:text-gray-600 text-[10px] font-bold rounded-lg shrink-0"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1">
                                    <span className="text-xs sm:text-sm font-semibold text-[#E91E63]">{monthlyTargetFormatted}</span>
                                    <button 
                                        onClick={() => {
                                            setNewTarget(stats?.monthly_target || 1000000);
                                            setIsEditingTarget(true);
                                        }}
                                        className="p-1 text-gray-400 hover:text-[#E91E63] transition-colors"
                                        title="Edit Sales Goal"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                        <SalesGoalGaugeArc percentage={targetProgress} />
                        <p className="text-xs text-gray-500 font-medium text-center mt-2">Monthly Target Progress</p>
                    </div>

                    {/* Active Listings / Product Stock Breakdown */}
                    <div className="lg:col-span-4 bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 flex flex-col justify-between">
                        <div className="flex items-center justify-between border-b border-pink-200/40 pb-3 mb-4">
                            <h3 className="text-base font-semibold text-gray-800">Inventory Status</h3>
                            <Link href={route('seller.products.index')} className="text-xs font-semibold text-[#E91E63] link-hover-scale flex items-center gap-0.5">View All <ArrowUpRight className="w-3.5 h-3.5" /></Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3.5 rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff]">
                                <p className="text-[11px] font-semibold text-[#E91E63] uppercase">Active Products</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{stats?.active_products ?? 0}</p>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff]">
                                <p className="text-[11px] font-semibold text-pink-600 uppercase">Total Products</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{stats?.total_products ?? 0}</p>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff]">
                                <p className="text-[11px] font-semibold text-amber-700 uppercase">Low Stock</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{stats?.low_stock ?? 0}</p>
                            </div>
                            <div className="p-3.5 rounded-2xl bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff]">
                                <p className="text-[11px] font-semibold text-rose-700 uppercase">Out of Stock</p>
                                <p className="text-xl sm:text-2xl font-bold text-gray-800 mt-1">{stats?.out_of_stock ?? 0}</p>
                            </div>
                        </div>
                    </div>

                    {/* Neumorphic Vertical Metric Summary List Column */}
                    <div className="lg:col-span-4 bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 space-y-4">
                        <h3 className="text-base font-semibold text-gray-800 border-b border-pink-200/40 pb-3">Performance Summary</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF0F3] shadow-[3px_3px_8px_#e2d7da,-3px_-3px_8px_#ffffff]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-pink-500 text-white shadow-xs"><Wallet className="h-4 w-4 stroke-[1.8]" /></div>
                                    <span className="text-xs sm:text-sm font-medium text-gray-700">Total Revenue</span>
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-gray-800">{totalRevenueFormatted}</span>
                            </div>

                            {/* Replacements with Hover Preview */}
                            <Link 
                                href={route('seller.replacements.index')}
                                className="relative group/replacements flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF0F3] shadow-[3px_3px_8px_#e2d7da,-3px_-3px_8px_#ffffff] transition-all hover:shadow-[inset_2px_2px_4px_#e2d7da,inset_-2px_-2px_4px_#ffffff] cursor-pointer block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs"><Package className="h-4 w-4 stroke-[1.8]" /></div>
                                    <span className="text-xs sm:text-sm font-medium text-gray-700">Pending Replacements</span>
                                </div>
                                <span className={`text-xs sm:text-sm font-semibold ${stats?.pending_replacements > 0 ? 'text-amber-600' : 'text-gray-800'}`}>
                                    {stats?.pending_replacements ?? 0}
                                </span>
                            </Link>

                            {/* Followers with Hover Preview */}
                            <Link 
                                href={route('seller.followers.index')}
                                className="relative group/followers flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF0F3] shadow-[3px_3px_8px_#e2d7da,-3px_-3px_8px_#ffffff] transition-all hover:shadow-[inset_2px_2px_4px_#e2d7da,inset_-2px_-2px_4px_#ffffff] cursor-pointer block"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-rose-500 text-white shadow-xs"><Users className="h-4 w-4 stroke-[1.8]" /></div>
                                    <span className="text-xs sm:text-sm font-medium text-gray-700">Followers</span>
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-gray-800">{stats?.total_followers ?? 0}</span>

                                {/* Hover Preview Dropdown Tooltip */}
                                <div className="absolute right-0 bottom-full mb-2 w-64 bg-[#FAF0F3] rounded-2xl shadow-[8px_8px_20px_#e2d7da,-8px_-8px_20px_#ffffff] border border-white/90 p-4 z-50 invisible group-hover/followers:visible opacity-0 group-hover/followers:opacity-100 transition-all duration-200 pointer-events-none">
                                    <div className="flex items-center justify-between border-b border-pink-200/40 pb-2 mb-2.5">
                                        <span className="text-xs font-semibold text-gray-800">Recent Followers</span>
                                        <span className="text-[10px] font-bold text-[#E91E63]">View All →</span>
                                    </div>
                                    {(!recent_followers || recent_followers.length === 0) ? (
                                        <p className="text-xs text-gray-400 font-medium py-1">No followers yet.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {recent_followers.map(f => {
                                                const followerName = f.user?.name || (f.user?.first_name ? `${f.user.first_name} ${f.user.last_name || ''}`.trim() : 'Customer');
                                                return (
                                                    <div key={f.id} className="flex items-center gap-2.5">
                                                        {f.user?.avatar_url ? (
                                                            <img
                                                                src={f.user.avatar_url}
                                                                alt={followerName}
                                                                className="w-6 h-6 rounded-full object-cover border border-pink-200/60 shrink-0"
                                                            />
                                                        ) : (
                                                            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#E91E63] to-[#E07A5F] text-white text-[10px] font-bold flex items-center justify-center shrink-0 shadow-xs">
                                                                {followerName.charAt(0).toUpperCase()}
                                                            </div>
                                                        )}
                                                        <span className="text-xs font-medium text-gray-700 truncate">• {followerName}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </Link>

                            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF0F3] shadow-[3px_3px_8px_#e2d7da,-3px_-3px_8px_#ffffff]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs"><ShoppingBag className="h-4 w-4 stroke-[1.8]" /></div>
                                    <span className="text-xs sm:text-sm font-medium text-gray-700">Pending Orders</span>
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-gray-800">{stats?.pending_orders ?? 0}</span>
                            </div>

                            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF0F3] shadow-[3px_3px_8px_#e2d7da,-3px_-3px_8px_#ffffff]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-purple-500 text-white shadow-xs"><Package className="h-4 w-4 stroke-[1.8]" /></div>
                                    <span className="text-xs sm:text-sm font-medium text-gray-700">Active Listings</span>
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-gray-800">{stats?.active_products ?? 0}</span>
                            </div>

                            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF0F3] shadow-[3px_3px_8px_#e2d7da,-3px_-3px_8px_#ffffff]">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-xs"><Star className="h-4 w-4 stroke-[1.8]" /></div>
                                    <span className="text-xs sm:text-sm font-medium text-gray-700">Average Rating</span>
                                </div>
                                <span className="text-xs sm:text-sm font-semibold text-gray-800">{stats?.average_rating || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION: Quick Actions + Best Sellers + Recent Orders Table */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Neumorphic Quick Actions */}
                    <div className="lg:col-span-7 bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6">
                        <h3 className="text-base font-semibold text-gray-800 pb-4 border-b border-pink-200/40 mb-5">Quick Actions</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <Link
                                href={route('seller.products.create')}
                                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#FAF0F3] shadow-[5px_5px_12px_#e2d7da,-5px_-5px_12px_#ffffff] hover:shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] transition-all text-center group"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#E91E63] to-[#E07A5F] text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
                                    <Plus className="h-5 w-5 stroke-[2]" />
                                </div>
                                <span className="text-xs font-semibold text-gray-700">Add Product</span>
                            </Link>

                            <Link
                                href={route('seller.orders.index')}
                                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#FAF0F3] shadow-[5px_5px_12px_#e2d7da,-5px_-5px_12px_#ffffff] hover:shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] transition-all text-center group"
                            >
                                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                                    <ShoppingBag className="h-5 w-5 stroke-[1.8]" />
                                </div>
                                <span className="text-xs font-semibold text-gray-700">View Orders</span>
                            </Link>

                            <Link
                                href={route('seller.shop.edit')}
                                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#FAF0F3] shadow-[5px_5px_12px_#e2d7da,-5px_-5px_12px_#ffffff] hover:shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] transition-all text-center group"
                            >
                                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                                    <Store className="h-5 w-5 stroke-[1.8]" />
                                </div>
                                <span className="text-xs font-semibold text-gray-700">My Shop</span>
                            </Link>

                            <Link
                                href={route('shop.show', seller.id)}
                                className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#FAF0F3] shadow-[5px_5px_12px_#e2d7da,-5px_-5px_12px_#ffffff] hover:shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] transition-all text-center group"
                            >
                                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                                    <Megaphone className="h-5 w-5 stroke-[1.8]" />
                                </div>
                                <span className="text-xs font-semibold text-gray-700">Storefront</span>
                            </Link>
                        </div>
                    </div>

                    {/* Best Sellers */}
                    <div className="lg:col-span-5 bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6">
                        <div className="flex items-center justify-between pb-4 border-b border-pink-200/40 mb-4">
                            <h3 className="text-base font-semibold text-gray-800">Best Sellers</h3>
                            <Link href={route('seller.products.index')} className="text-xs font-semibold text-[#E91E63] link-hover-scale">Manage →</Link>
                        </div>
                        {(!best_sellers || best_sellers.length === 0) ? (
                            <div className="text-center py-6 text-xs text-gray-400 font-medium">No sales recorded yet.</div>
                        ) : (
                            <div className="space-y-3">
                                {best_sellers.slice(0, 3).map(product => (
                                    <div key={product.product_id} className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FAF0F3] shadow-[3px_3px_8px_#e2d7da,-3px_-3px_8px_#ffffff]">
                                        <div className="flex items-center gap-3">
                                            <img src={getProductImage(product)} alt="" className="h-9 w-9 rounded-xl object-cover border border-gray-200" loading="lazy" />
                                            <div>
                                                <p className="text-xs font-semibold text-gray-800">{product.name ?? product.flower_name}</p>
                                                <p className="text-[11px] text-gray-500 font-medium">₱{Number(product.price).toFixed(2)} • {product.total_sold ?? 0} sold</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Customer Orders Table */}
                {recent_orders && recent_orders.length > 0 && (
                    <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6">
                        <div className="flex items-center justify-between pb-4 border-b border-pink-200/40 mb-4">
                            <h3 className="text-base font-semibold text-gray-800">Recent Customer Orders</h3>
                            <Link href={route('seller.orders.index')} className="text-xs font-semibold text-[#E91E63] link-hover-scale">View All Orders →</Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs sm:text-sm">
                                <thead>
                                    <tr className="border-b border-pink-200/40 text-[#E91E63] font-semibold uppercase tracking-wider">
                                        <th className="pb-3 px-3">Order ID</th>
                                        <th className="pb-3 px-3">Customer</th>
                                        <th className="pb-3 px-3">Total Amount</th>
                                        <th className="pb-3 px-3">Status</th>
                                        <th className="pb-3 px-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-pink-200/30">
                                    {recent_orders.map(order => (
                                        <tr key={order.order_id} className="hover:bg-pink-50/40 transition-colors font-medium">
                                            <td className="py-3.5 px-3 font-semibold text-gray-800">{order.display_order_id || order.order_id}</td>
                                            <td className="py-3.5 px-3 font-medium text-gray-700">
                                                {order.user_id || order.user?.id ? (
                                                    <Link
                                                        href={route('seller.customers.show', order.user_id || order.user?.id)}
                                                        className="hover:text-[#E91E63] link-hover-scale font-semibold text-gray-800 transition-colors"
                                                    >
                                                        {order.user?.name || `${order.customer_first_name} ${order.customer_last_name}`}
                                                    </Link>
                                                ) : (
                                                    <span>{order.user?.name || `${order.customer_first_name} ${order.customer_last_name}`}</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-3 font-semibold text-gray-800">₱{Number(order.total_amount).toFixed(2)}</td>
                                            <td className="py-3.5 px-3">
                                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-700">
                                                    {order.order_status}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-3 text-gray-500 font-normal">{new Date(order.created_at || order.order_date).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </SellerLayout>
    );
}
