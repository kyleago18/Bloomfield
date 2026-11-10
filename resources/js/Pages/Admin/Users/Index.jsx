import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Search, Ban, CheckCircle } from 'lucide-react';
import AdminLayout from '@/Layouts/AdminLayout';

const STATUS_COLORS = {
    active:  'bg-emerald-50 text-emerald-700',
    suspended: 'bg-red-50 text-red-600',
};

export default function AdminUsersIndex({ users, filters }) {
    const [search, setSearch] = useState(filters?.search ?? '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.users.index'), { ...filters, search }, { preserveState: true });
    };

    const handleFilterStatus = (status) => {
        router.get(route('admin.users.index'), { ...filters, status, search }, { preserveState: true });
    };

    const updateStatus = (user, status) => {
        if (confirm(`Are you sure you want to ${status === 'suspended' ? 'suspend' : 'activate'} this user?`)) {
            router.patch(route('admin.users.status', user.id), { status }, { preserveScroll: true });
        }
    };

    const statusFilters = ['All', 'active', 'suspended'];

    return (
        <AdminLayout title="User Management">
            <Head title="User Management — Admin" />
            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
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
                                placeholder="Search users by name or email..."
                                className="w-full rounded-full border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm"
                            />
                        </div>
                    </form>
                    <div className="flex gap-2 flex-wrap">
                        {statusFilters.map(s => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => handleFilterStatus(s === 'All' ? undefined : s)}
                                className={`rounded-full px-4 py-2 text-xs font-semibold transition-colors
                                    ${(s === 'All' && !filters?.status) || filters?.status === s
                                        ? 'bg-indigo-600 text-white'
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
                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">User</th>
                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Role</th>
                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Status</th>
                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data?.length === 0 ? (
                                    <tr><td colSpan={4} className="py-12 text-center text-slate-500 text-sm">No users found.</td></tr>
                                ) : users.data?.map(user => (
                                    <tr key={user.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                                                    {user.name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-900">{user.name}</p>
                                                    <p className="text-xs text-slate-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {user.role}
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${STATUS_COLORS[user.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            {user.role !== 'super_admin' && (
                                                <div className="flex items-center justify-end gap-1">
                                                    {user.status === 'suspended' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => updateStatus(user, 'active')}
                                                            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                                                            title="Activate User"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                            <span className="text-xs font-semibold">Activate</span>
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => updateStatus(user, 'suspended')}
                                                            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                            title="Suspend User"
                                                        >
                                                            <Ban className="h-4 w-4" />
                                                            <span className="text-xs font-semibold">Suspend</span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {users.links && (
                    <div className="flex flex-wrap justify-center gap-1">
                        {users.links.map((link, i) => (
                            <Link
                                key={i}
                                href={link.url ?? '#'}
                                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors
                                    ${link.active ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 text-slate-500'}
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
