import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import SellerLayout from '@/Layouts/SellerLayout';
import { 
    Search, 
    Columns, 
    List,
    TrendingUp,
    Clock,
    CheckCircle2
} from 'lucide-react';

const STATUS_COLORS = {
    Pending:            'bg-amber-100/70 text-amber-800 border-amber-200/60',
    Confirmed:          'bg-sky-100/70 text-sky-800 border-sky-200/60',
    Preparing:          'bg-violet-100/70 text-violet-800 border-violet-200/60',
    'Out for Delivery': 'bg-blue-100/70 text-blue-800 border-blue-200/60',
    Delivered:          'bg-emerald-100/70 text-emerald-800 border-emerald-200/60',
    Rejected:           'bg-rose-100/70 text-rose-800 border-rose-200/60',
    Cancelled:          'bg-rose-50 text-rose-600 border-rose-200/40',
};

const KANBAN_COLUMNS = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered'];
const STATUSES = ['Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Rejected', 'Cancelled'];

export default function SellerOrdersIndex({ orders, seller, filters, metrics }) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'board'

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('seller.orders.index'), { ...filters, search }, { preserveState: true });
    };

    const handleFilter = (status) => {
        router.get(route('seller.orders.index'), { ...filters, status, search }, { preserveState: true });
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getInitials = (firstName, lastName) => {
        return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase() || '?';
    };

    // Derived Metrics for UI
    const totalOrders = metrics?.total_orders || orders.total || 0;
    const pendingOrders = metrics?.pending_orders || 0;
    const totalRevenue = metrics?.total_revenue || 0;

    return (
        <SellerLayout seller={seller} title="Orders Dashboard">
            <Head title="Orders Dashboard — Seller" />
            <div className="space-y-6 pb-12">
                
                {/* Header & View Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-serif font-semibold text-gray-800 tracking-tight">Orders Dashboard</h2>
                        <p className="mt-1 text-xs sm:text-sm text-gray-500 font-normal">Manage, track, and fulfill your customer orders efficiently.</p>
                    </div>
                    <div className="flex items-center bg-[#FAF0F3] shadow-[inset_2px_2px_5px_#e2d7da,inset_-2px_-2px_5px_#ffffff] p-1.5 rounded-2xl w-fit border border-white/60">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${viewMode === 'list' ? 'bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white shadow-[2px_2px_6px_rgba(233,30,99,0.25)]' : 'text-gray-500 hover:text-[#E91E63]'}`}
                        >
                            <List className="h-4 w-4 stroke-[1.8]" />
                            List View
                        </button>
                        <button
                            onClick={() => setViewMode('board')}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${viewMode === 'board' ? 'bg-gradient-to-r from-[#E91E63] via-[#F472B6] to-[#E07A5F] text-white shadow-[2px_2px_6px_rgba(233,30,99,0.25)]' : 'text-gray-500 hover:text-[#E91E63]'}`}
                        >
                            <Columns className="h-4 w-4 stroke-[1.8]" />
                            Board View
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2.5 bg-pink-500 text-white rounded-2xl shadow-xs">
                                <List className="h-5 w-5 stroke-[1.8]" />
                            </div>
                        </div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Total Orders</p>
                        <h3 className="text-2xl font-bold text-gray-800">{totalOrders}</h3>
                    </div>
                    
                    <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2.5 bg-amber-500 text-white rounded-2xl shadow-xs">
                                <Clock className="h-5 w-5 stroke-[1.8]" />
                            </div>
                        </div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Pending Action</p>
                        <h3 className="text-2xl font-bold text-gray-800">{pendingOrders} <span className="text-xs font-semibold text-amber-600 ml-2">Needs attention</span></h3>
                    </div>

                    <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6">
                        <div className="flex justify-between items-start mb-3">
                            <div className="p-2.5 bg-emerald-500 text-white rounded-2xl shadow-xs">
                                <TrendingUp className="h-5 w-5 stroke-[1.8]" />
                            </div>
                        </div>
                        <p className="text-xs font-semibold text-gray-500 mb-1">Total Revenue</p>
                        <h3 className="text-2xl font-bold text-gray-800">₱{Number(totalRevenue).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</h3>
                    </div>
                </div>

                {/* Filters & Search Toolbar */}
                <div className="bg-[#FAF0F3] rounded-[24px] shadow-[6px_6px_14px_#e2d7da,-6px_-6px_14px_#ffffff] border border-white/80 p-4 flex flex-wrap items-center gap-4">
                    <form onSubmit={handleSearch} className="flex-1 min-w-[250px] max-w-md">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-400 stroke-[1.8]" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search order code, customer name, email..."
                                className="w-full bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-full pl-10 pr-4 py-2 text-xs sm:text-sm font-normal text-gray-700 placeholder:text-gray-400 focus:outline-none border-none transition-all"
                            />
                        </div>
                    </form>
                    <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar">
                        <button
                            type="button"
                            onClick={() => handleFilter(undefined)}
                            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${!filters?.status ? 'bg-gradient-to-r from-[#E91E63] to-[#E07A5F] text-white shadow-[2px_2px_6px_rgba(233,30,99,0.25)]' : 'bg-[#FAF0F3] text-gray-600 shadow-[3px_3px_8px_#e2d7da,-3px_-3px_8px_#ffffff] hover:text-[#E91E63]'}`}
                        >
                            All Orders
                        </button>
                        {STATUSES.map(status => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => handleFilter(status)}
                                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${filters?.status === status ? 'bg-gradient-to-r from-[#E91E63] to-[#E07A5F] text-white shadow-[2px_2px_6px_rgba(233,30,99,0.25)]' : 'bg-[#FAF0F3] text-gray-600 shadow-[3px_3px_8px_#e2d7da,-3px_-3px_8px_#ffffff] hover:text-[#E91E63]'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                {orders.data.length === 0 ? (
                    <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-12 text-center">
                        <div className="w-16 h-16 mx-auto bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff] rounded-full flex items-center justify-center mb-4 text-pink-400">
                            <Search className="h-8 w-8 stroke-[1.8]" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-800 mb-1">No orders found</h3>
                        <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">No orders match your current filters.</p>
                        {(filters?.status || search) && (
                            <button onClick={() => { setSearch(''); handleFilter(undefined); }} className="px-5 py-2.5 bg-[#FAF0F3] shadow-[4px_4px_8px_#e2d7da,-4px_-4px_8px_#ffffff] text-gray-700 font-semibold rounded-full hover:text-[#E91E63] transition-all text-xs">
                                Clear Filters
                            </button>
                        )}
                    </div>
                ) : viewMode === 'list' ? (
                    // LIST VIEW
                    <div className="bg-[#FAF0F3] rounded-[28px] shadow-[8px_8px_18px_#e2d7da,-8px_-8px_18px_#ffffff] border border-white/80 p-6 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-pink-200/40 text-xs sm:text-sm">
                                <thead>
                                    <tr className="text-left text-[#E91E63] font-semibold uppercase tracking-wider">
                                        <th className="pb-4 px-4">Order Info</th>
                                        <th className="pb-4 px-4">Customer</th>
                                        <th className="pb-4 px-4">Amount</th>
                                        <th className="pb-4 px-4">Payment</th>
                                        <th className="pb-4 px-4">Status</th>
                                        <th className="pb-4 px-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-pink-200/30">
                                    {orders.data.map(order => (
                                        <tr key={order.order_id} className="hover:bg-pink-50/40 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs sm:text-sm font-semibold text-gray-800">{order.display_order_id || order.order_id}</span>
                                                    <span className="text-xs text-gray-400 mt-0.5">{formatDate(order.created_at)}</span>
                                                    <span className="text-[11px] text-pink-500 font-medium mt-0.5">{order.order_items?.length || 0} items</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                 <div className="flex items-center gap-3">
                                                     {order.user_id ? (
                                                         <Link 
                                                             href={route('seller.customers.show', order.user_id)}
                                                             className="h-9 w-9 rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 text-white font-semibold flex items-center justify-center text-xs shrink-0 shadow-xs hover:scale-105 transition-transform"
                                                             title="View Customer Profile"
                                                         >
                                                             {getInitials(order.customer_first_name, order.customer_last_name)}
                                                         </Link>
                                                     ) : (
                                                         <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 text-white font-semibold flex items-center justify-center text-xs shrink-0 shadow-xs">
                                                             {getInitials(order.customer_first_name, order.customer_last_name)}
                                                         </div>
                                                     )}
                                                     <div className="flex flex-col">
                                                         {order.user_id ? (
                                                             <Link 
                                                                 href={route('seller.customers.show', order.user_id)}
                                                                 className="text-xs sm:text-sm font-semibold text-gray-800 hover:text-[#E91E63] hover:underline transition-colors"
                                                             >
                                                                 {order.customer_first_name} {order.customer_last_name}
                                                             </Link>
                                                         ) : (
                                                             <span className="text-xs sm:text-sm font-semibold text-gray-800">{order.customer_first_name} {order.customer_last_name}</span>
                                                         )}
                                                         <span className="text-xs text-gray-400">{order.customer_email}</span>
                                                     </div>
                                                 </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-xs sm:text-sm font-semibold text-gray-800">
                                                    ₱{Number(order.total_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex flex-col items-start">
                                                    <span className="text-xs font-semibold text-gray-700">
                                                        {order.payment_method === 'cash_on_delivery' ? 'COD' : order.payment_method}
                                                    </span>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                                        order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {order.payment_status || 'Pending'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[order.order_status] ?? 'bg-pink-100 text-pink-800 border-pink-200'}`}>
                                                    {order.order_status === 'Delivered' && <CheckCircle2 className="h-3.5 w-3.5 mr-1" />}
                                                    {order.order_status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <Link
                                                    href={route('seller.orders.show', order.order_id)}
                                                    className="inline-flex items-center justify-center px-4 py-1.5 bg-[#FAF0F3] shadow-[3px_3px_6px_#e2d7da,-3px_-3px_6px_#ffffff] rounded-full text-xs font-semibold text-gray-700 hover:text-[#E91E63] transition-all"
                                                >
                                                    Manage
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    // BOARD VIEW (Kanban)
                    <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar">
                        {KANBAN_COLUMNS.map(columnStatus => {
                            const columnOrders = orders.data.filter(o => o.order_status === columnStatus);
                            if (filters?.status && filters.status !== columnStatus) return null;

                            return (
                                <div key={columnStatus} className="min-w-[320px] max-w-[320px] shrink-0">
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <h3 className="text-xs sm:text-sm font-semibold text-gray-800">{columnStatus}</h3>
                                        <span className="bg-pink-100 text-pink-700 py-0.5 px-2.5 rounded-full text-xs font-semibold">
                                            {columnOrders.length}
                                        </span>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        {columnOrders.map(order => (
                                            <Link 
                                                href={route('seller.orders.show', order.order_id)}
                                                key={order.order_id} 
                                                className="block bg-[#FAF0F3] rounded-[24px] p-5 shadow-[6px_6px_14px_#e2d7da,-6px_-6px_14px_#ffffff] border border-white/80 hover:shadow-[3px_3px_8px_#e2d7da,-3px_-3px_8px_#ffffff] transition-all group"
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <span className="text-xs font-semibold text-gray-400 block mb-1">{order.display_order_id || order.order_id}</span>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_COLORS[order.order_status] ?? 'bg-pink-100 text-pink-800'}`}>
                                                            {order.order_status}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs sm:text-sm font-semibold text-gray-800">
                                                        ₱{Number(order.total_amount).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex items-center gap-3 mb-3">
                                                    {order.user_id ? (
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                router.visit(route('seller.customers.show', order.user_id));
                                                            }}
                                                            className="h-8 w-8 rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 text-white font-semibold flex items-center justify-center text-xs shrink-0 shadow-xs hover:scale-105 transition-transform"
                                                            title="View Customer Profile"
                                                        >
                                                            {getInitials(order.customer_first_name, order.customer_last_name)}
                                                        </button>
                                                    ) : (
                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 text-white font-semibold flex items-center justify-center text-xs shrink-0 shadow-xs">
                                                            {getInitials(order.customer_first_name, order.customer_last_name)}
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col min-w-0">
                                                        {order.user_id ? (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    router.visit(route('seller.customers.show', order.user_id));
                                                                }}
                                                                className="text-xs font-semibold text-gray-800 hover:text-[#E91E63] hover:underline transition-colors truncate text-left"
                                                            >
                                                                {order.customer_first_name} {order.customer_last_name}
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs font-semibold text-gray-800 truncate">{order.customer_first_name} {order.customer_last_name}</span>
                                                        )}
                                                        <span className="text-[11px] text-gray-400 truncate">{formatDate(order.created_at)}</span>
                                                    </div>
                                                </div>

                                                <div className="flex justify-between items-center pt-3 border-t border-pink-200/40">
                                                    <span className="text-xs text-gray-500 font-medium">
                                                        {order.order_items?.length || 0} Items
                                                    </span>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                                                        order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {order.payment_status || 'Pending'}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                        
                                        {columnOrders.length === 0 && (
                                            <div className="border border-dashed border-pink-200 rounded-[24px] p-6 flex flex-col items-center justify-center text-center bg-[#FAF0F3] shadow-[inset_3px_3px_6px_#e2d7da,inset_-3px_-3px_6px_#ffffff]">
                                                <p className="text-xs text-gray-400 font-medium">No {columnStatus.toLowerCase()} orders</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {orders.links && orders.data.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mt-6">
                        {orders.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all
                                    ${link.active ? 'bg-gradient-to-r from-[#E91E63] to-[#E07A5F] text-white shadow-[2px_2px_6px_rgba(233,30,99,0.25)]' : 'bg-[#FAF0F3] text-gray-600 shadow-[3px_3px_8px_#e2d7da,-3px_-3px_8px_#ffffff] hover:text-[#E91E63]'}
                                    ${!link.url ? 'opacity-50 pointer-events-none' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}

            </div>
        </SellerLayout>
    );
}
