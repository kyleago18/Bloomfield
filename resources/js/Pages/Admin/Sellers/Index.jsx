import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Search, CheckCircle, Ban, XCircle, Clock } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const STATUS_COLORS = {
    approved:  'bg-emerald-50 text-emerald-700',
    pending:   'bg-amber-50 text-amber-700',
    rejected:  'bg-red-50 text-red-600',
    suspended: 'bg-gray-100 text-gray-600',
};

export default function AdminSellersIndex({ sellers, filters }) {
    const [search, setSearch] = useState(filters?.search ?? '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.sellers.index'), { ...filters, search }, { preserveState: true });
    };

    const handleFilter = (status) => {
        router.get(route('admin.sellers.index'), { ...filters, status, search }, { preserveState: true });
    };

    const updateStatus = (seller, status) => {
        if (confirm(`Are you sure you want to mark this shop as ${status}?`)) {
            router.patch(route('admin.sellers.status', seller.id), { status }, { preserveScroll: true });
        }
    };

    const statusFilters = ['All', 'pending', 'approved', 'rejected', 'suspended'];

    return (
        <AdminLayout title="Seller Management">
            <Head title="Seller Management — Admin" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-2xl font-semibold text-slate-900">Seller Management</h1>
                </div>

                {/* Search + Filter */}
                <div className="flex flex-wrap items-center gap-3">
                    <form onSubmit={handleSearch} className="flex-1 min-w-[200px] max-w-sm">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search sellers…"
                                className="w-full rounded-full border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                            />
                        </div>
                    </form>
                    <div className="flex gap-2 flex-wrap">
                        {statusFilters.map(s => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => handleFilter(s === 'All' ? undefined : s)}
                                className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors
                                    ${(s === 'All' && !filters?.status) || filters?.status === s
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="border-b border-slate-200 text-left bg-slate-50">
                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Shop</th>
                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Owner</th>
                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Joined</th>
                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Status</th>
                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sellers.data?.length === 0 ? (
                                    <tr><td colSpan={5} className="py-12 text-center text-slate-500 text-sm">No sellers found.</td></tr>
                                ) : sellers.data?.map(seller => (
                                    <tr key={seller.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                {seller.shop_logo ? (
                                                    <img src={seller.shop_logo_url ?? 'https://images.unsplash.com/photo-1563241597-12a4145ee5ff?auto=format&fit=crop&w=150&q=80'} alt="" className="h-10 w-10 rounded-xl object-cover border border-slate-200" />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                                        {seller.shop_name?.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">{seller.shop_name}</p>
                                                    <p className="text-xs text-slate-500">{seller.city || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-medium text-slate-700">{seller.owner_name}</p>
                                            <p className="text-xs text-slate-500">{seller.email}</p>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {new Date(seller.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${STATUS_COLORS[seller.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {seller.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {seller.status === 'pending' && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateStatus(seller, 'approved')}
                                                            className="flex items-center gap-1 rounded-full px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                            <span className="text-xs font-semibold">Approve</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => updateStatus(seller, 'rejected')}
                                                            className="flex items-center gap-1 rounded-full px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                            <span className="text-xs font-semibold">Reject</span>
                                                        </button>
                                                    </>
                                                )}
                                                {seller.status === 'approved' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => updateStatus(seller, 'suspended')}
                                                        className="flex items-center gap-1 rounded-full px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                                        title="Suspend"
                                                    >
                                                        <Ban className="h-4 w-4" />
                                                        <span className="text-xs font-semibold">Suspend</span>
                                                    </button>
                                                )}
                                                {seller.status === 'suspended' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => updateStatus(seller, 'approved')}
                                                        className="flex items-center gap-1 rounded-full px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                                                        title="Re-activate"
                                                    >
                                                        <CheckCircle className="h-4 w-4" />
                                                        <span className="text-xs font-semibold">Re-activate</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {sellers.links && (
                    <div className="flex flex-wrap justify-center gap-1">
                        {sellers.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors
                                    ${link.active ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}
                                    ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
