import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import { ExclamationTriangleIcon, ShieldCheckIcon, NoSymbolIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ShopReportsIndex({ auth, reports }) {
    const [selectedReport, setSelectedReport] = useState(null);
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    const [reportToSuspend, setReportToSuspend] = useState(null);

    const updateStatus = (reportId, status) => {
        router.patch(route('admin.reports.status', reportId), { status }, {
            preserveScroll: true,
        });
    };

    const confirmSuspend = (report) => {
        setReportToSuspend(report);
        setIsSuspendModalOpen(true);
    };

    const handleSuspend = () => {
        // First suspend the shop
        router.patch(route('admin.sellers.status', reportToSuspend.seller_id), { status: 'suspended' }, {
            preserveScroll: true,
            onSuccess: () => {
                // Then mark report as action_taken
                updateStatus(reportToSuspend.id, 'action_taken');
                setIsSuspendModalOpen(false);
                setReportToSuspend(null);
                setSelectedReport(null);
            }
        });
    };

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        reviewed: 'bg-blue-100 text-blue-800',
        action_taken: 'bg-red-100 text-red-800',
        dismissed: 'bg-gray-100 text-gray-800',
    };

    return (
        <AdminLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Shop Reports</h2>}
        >
            <Head title="Shop Reports" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            {reports.data.length === 0 ? (
                                <p className="text-gray-500 text-center py-4">No shop reports found.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shop</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reporter</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {reports.data.map((report) => (
                                                <tr key={report.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(report.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">{report.seller?.shop_name}</div>
                                                        <div className="text-sm text-gray-500">Status: {report.seller?.status}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {report.user?.name}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {report.reason}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[report.status]}`}>
                                                            {report.status.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button
                                                            onClick={() => setSelectedReport(report)}
                                                            className="text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            View Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {reports.links && reports.data.length > 0 && (
                                <div className="mt-6 flex flex-wrap justify-center gap-1 pb-6">
                                    {reports.links.map((link, i) => (
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
                    </div>
                </div>
            </div>

            {/* View Details Modal */}
            <Modal show={!!selectedReport} onClose={() => setSelectedReport(null)} maxWidth="md">
                {selectedReport && (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Report Details</h2>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[selectedReport.status]}`}>
                                {selectedReport.status.replace('_', ' ')}
                            </span>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500">Shop</h3>
                                <p className="text-gray-900 font-medium">{selectedReport.seller?.shop_name}</p>
                                <p className="text-sm text-gray-600">Current Status: {selectedReport.seller?.status}</p>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500">Reporter</h3>
                                <p className="text-gray-900">{selectedReport.user?.name}</p>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500">Reason</h3>
                                <p className="text-gray-900 font-medium">{selectedReport.reason}</p>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500">Description</h3>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg text-sm whitespace-pre-wrap mt-1">
                                    {selectedReport.description || 'No description provided.'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 border-t pt-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Admin Actions</h3>
                            <div className="flex flex-wrap gap-2">
                                {selectedReport.status !== 'dismissed' && (
                                    <button
                                        onClick={() => {
                                            updateStatus(selectedReport.id, 'dismissed');
                                            setSelectedReport(null);
                                        }}
                                        className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
                                    >
                                        <NoSymbolIcon className="w-4 h-4" />
                                        Dismiss Report
                                    </button>
                                )}
                                
                                {selectedReport.status === 'pending' && (
                                    <button
                                        onClick={() => updateStatus(selectedReport.id, 'reviewed')}
                                        className="flex items-center gap-1 px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-100"
                                    >
                                        <CheckCircleIcon className="w-4 h-4" />
                                        Mark Reviewed
                                    </button>
                                )}
                                
                                {selectedReport.seller?.status !== 'suspended' && (
                                    <button
                                        onClick={() => confirmSuspend(selectedReport)}
                                        className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 ml-auto"
                                    >
                                        <ExclamationTriangleIcon className="w-4 h-4" />
                                        Suspend Shop
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Confirm Suspend Modal */}
            <Modal show={isSuspendModalOpen} onClose={() => setIsSuspendModalOpen(false)} maxWidth="sm">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
                        Confirm Suspension
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Are you sure you want to suspend the shop <strong>{reportToSuspend?.seller?.shop_name}</strong>? 
                        Their products will no longer be visible to customers.
                    </p>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => setIsSuspendModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSuspend}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg"
                        >
                            Yes, Suspend Shop
                        </button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
