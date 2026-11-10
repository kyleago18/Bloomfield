import React from 'react';
import { ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white rounded-2xl shadow-xl border border-pink-100 p-3.5 flex flex-col items-center gap-1">
                <p className="text-xs text-[#D81B60] font-bold uppercase tracking-wider">{label}</p>
                <p className="text-base font-extrabold text-gray-900">₱{Number(payload[0].value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</p>
            </div>
        );
    }
    return null;
};

export default function DashboardRevenueChart({ data, range = 'monthly' }) {
    const tickInterval = range === 'monthly' ? 3 : 0;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                    <linearGradient id="roseBarGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F472B6" stopOpacity={0.85} />
                        <stop offset="100%" stopColor="#E91E63" stopOpacity={0.35} />
                    </linearGradient>
                    <linearGradient id="roseLineGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D81B60" stopOpacity={0.25} />
                        <stop offset="100%" stopColor="#D81B60" stopOpacity={0.0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FCE7F0" />
                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#E91E63', fontSize: 11, fontWeight: 600 }}
                    dy={10}
                    interval={tickInterval}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 500 }}
                    tickFormatter={v => v >= 1000 ? `₱${(v / 1000).toFixed(0)}k` : `₱${v}`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(252, 231, 240, 0.4)' }} />
                <Bar
                    dataKey="revenue"
                    fill="url(#roseBarGrad)"
                    radius={[8, 8, 0, 0]}
                    barSize={16}
                />
                <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#D81B60"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#roseLineGrad)"
                    dot={{ r: 4, fill: '#D81B60', stroke: '#FFFFFF', strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: '#D81B60', stroke: '#FFFFFF', strokeWidth: 3 }}
                />
            </ComposedChart>
        </ResponsiveContainer>
    );
}
