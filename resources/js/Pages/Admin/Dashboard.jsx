import React from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link } from '@inertiajs/react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip as RechartsTooltip
} from 'recharts';
import {
    Users,
    Store,
    ShieldAlert,
    UserX,
} from 'lucide-react';

function KpiCard({ label, value, icon: Icon, hint }) {
    return (
        <div className="rounded-2xl border border-white/60 bg-white shadow-sm p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-[12px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
                    <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{value}</p>
                    {hint && <p className="mt-2 text-[13px] font-medium text-slate-500">{hint}</p>}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                    <Icon className="h-6 w-6 stroke-[1.8]" />
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboard({ data }) {
    const PIE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'];
    const userRoles = data.user_roles || {};
    const pieData = Object.keys(userRoles).map(role => ({
        name: role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' '),
        value: userRoles[role]
    }));

    return (
        <AdminLayout title="Platform Overview">
            <Head title="Admin Dashboard" />
            
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Platform Overview</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Monitor user registrations and seller applications.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <KpiCard label="Total Users" value={data.total_users} icon={Users} />
                    <KpiCard label="Total Sellers" value={data.total_sellers} icon={Store} />
                    <KpiCard label="Pending Sellers" value={data.pending_sellers} icon={ShieldAlert} />
                    <KpiCard label="Suspended Users" value={data.suspended_users} icon={UserX} />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-medium text-slate-900 mb-6">Users by Role</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value" stroke="none">
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {pieData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2 text-sm text-slate-600">
                                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }} />
                                    {entry.name}: {entry.value}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
                        <h3 className="text-lg font-medium text-slate-900 mb-4">Recent Users</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-500">
                                        <th className="pb-3 font-medium">Name</th>
                                        <th className="pb-3 font-medium">Email</th>
                                        <th className="pb-3 font-medium">Role</th>
                                        <th className="pb-3 font-medium">Status</th>
                                        <th className="pb-3 font-medium text-right">Joined</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.recent_users.map(user => (
                                        <tr key={user.id}>
                                            <td className="py-3 font-medium text-slate-900">{user.name}</td>
                                            <td className="py-3 text-slate-600">{user.email}</td>
                                            <td className="py-3 text-slate-600">{user.role}</td>
                                            <td className="py-3">
                                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right text-slate-500">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 text-right">
                            <Link href={route('admin.users.index')} className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View all users &rarr;</Link>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
