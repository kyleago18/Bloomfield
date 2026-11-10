import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { ShieldCheck, FileSearch } from 'lucide-react';

export default function VerificationsIndex({ sellers }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-700';
            case 'approved': return 'bg-emerald-50 text-emerald-700';
            case 'rejected': return 'bg-red-50 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <AdminLayout title="Verifications">
            <Head title="Seller Verifications — Admin" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold text-slate-900">
                            KYC Verifications
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">Review pending seller applications and documents.</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Shop Details</th>
                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Owner</th>
                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Date Applied</th>
                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">Status</th>
                                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sellers.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-12 text-center text-slate-500">
                                            No pending verification applications.
                                        </td>
                                    </tr>
                                ) : (
                                    sellers.data.map(seller => (
                                        <tr key={seller.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-slate-900">{seller.shop_name}</div>
                                                <div className="text-xs text-slate-500 mt-1">{seller.city || 'N/A'}</div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-medium text-slate-700">{seller.owner_name}</div>
                                                <div className="text-xs text-slate-500 mt-1">{seller.user?.email}</div>
                                            </td>
                                            <td className="px-5 py-4 text-slate-600">
                                                {new Date(seller.updated_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusColor(seller.status)}`}>
                                                    {seller.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={route('admin.verifications.show', seller.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full hover:bg-indigo-100 transition-colors"
                                                >
                                                    <FileSearch className="w-4 h-4" />
                                                    Review
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {sellers.links && sellers.links.length > 3 && (
                    <div className="flex justify-center mt-6">
                        <div className="flex flex-wrap gap-1">
                            {sellers.links.map((link, i) => (
                                <Link
                                    key={i}
                                    href={link.url || '#'}
                                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors
                                        ${link.active ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}
                                        ${!link.url ? 'opacity-40 pointer-events-none' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
