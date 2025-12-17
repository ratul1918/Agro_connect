import React from 'react';
import { Button } from '../../components/ui/button';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
    AreaChart, Area
} from 'recharts';
import {
    Users, Sprout, ShoppingCart, Globe, ArrowUpRight, TrendingUp, AlertCircle
} from 'lucide-react';

interface AdminOverviewProps {
    stats: any;
    orders: any[];
    exportApplications: any[];
    handleExportAction: (id: number, action: 'approve' | 'reject') => void;
    getStatusColor: (status: string) => string;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({
    stats, orders, exportApplications, handleExportAction, getStatusColor
}) => {
    // Data for Role Distribution Pie Chart
    const roleData = [
        { name: 'Farmers', value: stats.totalFarmers, color: '#10B981' }, // Green-500
        { name: 'Buyers', value: stats.totalBuyers, color: '#3B82F6' }, // Blue-500
        { name: 'Agronomists', value: stats.totalUsers - stats.totalFarmers - stats.totalBuyers || 1, color: '#F59E0B' } // Amber-500
    ];

    // Data for Order Status Bar Chart
    const orderStatusCounts = orders.reduce((acc: any, order: any) => {
        const status = order.status || 'UNKNOWN';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});

    const orderChartData = Object.keys(orderStatusCounts).map(status => ({
        name: status.replace('_', ' '),
        count: orderStatusCounts[status]
    }));

    // Mock trend data for "super looks" - in real app, aggregate from created_at
    const trendData = [
        { name: 'Jan', orders: 40, revenue: 2400 },
        { name: 'Feb', orders: 30, revenue: 1398 },
        { name: 'Mar', orders: 20, revenue: 9800 },
        { name: 'Apr', orders: 27, revenue: 3908 },
        { name: 'May', orders: 18, revenue: 4800 },
        { name: 'Jun', orders: 23, revenue: 3800 },
        { name: 'Jul', orders: 34, revenue: 4300 },
    ];

    const StatCard = ({ title, value, icon: Icon, gradient }: any) => (
        <div className={`relative overflow-hidden rounded-2xl p-6 shadow-lg border border-white/20 text-white ${gradient}`}>
            <div className="flex justify-between items-start z-10 relative">
                <div>
                    <p className="text-sm font-medium opacity-90 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl bg-white/20 backdrop-blur-sm`}>
                    <Icon className="w-6 h-6 text-white" />
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm opacity-80">
                <ArrowUpRight className="w-4 h-4 mr-1" />
                <span>+12.5% from last month</span>
            </div>
            {/* Decorative circles */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full blur-xl"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 p-2">

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    gradient="bg-gradient-to-br from-green-500 to-emerald-700"
                />
                <StatCard
                    title="Active Crops"
                    value={stats.totalCrops}
                    icon={Sprout}
                    gradient="bg-gradient-to-br from-blue-500 to-indigo-700"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={ShoppingCart}
                    gradient="bg-gradient-to-br from-violet-500 to-purple-700"
                />
                <StatCard
                    title="Total Income"
                    value={`৳${stats.totalIncome?.toLocaleString() || 0}`}
                    icon={TrendingUp}
                    gradient="bg-gradient-to-br from-emerald-500 to-green-700"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* User Distribution Pie Chart */}
                <div className="card bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 rounded-2xl">
                    <div className="card-body">
                        <h2 className="card-title text-gray-800 dark:text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-green-600" />
                            User Distribution
                        </h2>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={roleData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {roleData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Order Trends Area Chart */}
                <div className="card bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 rounded-2xl">
                    <div className="card-body">
                        <h2 className="card-title text-gray-800 dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            Platform Growth
                        </h2>
                        <div className="h-[300px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    />
                                    <Area type="monotone" dataKey="orders" stroke="#8884d8" fillOpacity={1} fill="url(#colorOrders)" />
                                    <Area type="monotone" dataKey="revenue" stroke="#82ca9d" fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row 2 - Order Status Bar Chart */}
            <div className="card bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 rounded-2xl">
                <div className="card-body">
                    <h2 className="card-title text-gray-800 dark:text-white flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-purple-600" />
                        Order Status Overview
                    </h2>
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={orderChartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} barSize={40}>
                                    {orderChartData.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={['#10B981', '#F59E0B', '#EF4444', '#3B82F6'][index % 4]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Recent Orders and Pending Exports */}
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent Orders Table */}
                <div className="card bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 rounded-2xl">
                    <div className="card-body p-6">
                        <h2 className="card-title text-lg flex justify-between items-center mb-4">
                            Recent Orders
                            <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium">Latest 5</span>
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-700 text-left">
                                        <th className="pb-3 text-sm font-medium text-gray-500">Item</th>
                                        <th className="pb-3 text-sm font-medium text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.slice(0, 5).map((o: any) => (
                                        <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-b border-gray-50 last:border-0">
                                            <td className="py-3">
                                                <div className="font-semibold text-gray-800 dark:text-gray-200">{o.cropTitle}</div>
                                                <div className="text-xs text-gray-500">{o.buyerName}</div>
                                            </td>
                                            <td className="py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(o.status)}`}>
                                                    {o.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr><td colSpan={2} className="text-center py-4 text-gray-400">No orders yet</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Pending Exports List */}
                <div className="card bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 rounded-2xl">
                    <div className="card-body p-6">
                        <h2 className="card-title text-lg flex justify-between items-center mb-4">
                            Pending Exports
                            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                                <AlertCircle className="w-3 h-3" />
                                Action Needed
                            </span>
                        </h2>
                        <div className="space-y-3">
                            {exportApplications.filter((e: any) => e.status === 'PENDING').slice(0, 5).map((e: any) => (
                                <div key={e.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-all duration-200">
                                    <div>
                                        <div className="font-semibold text-gray-800 dark:text-gray-200">{e.farmerName}</div>
                                        <div className="text-xs text-gray-500 flex items-center gap-1">
                                            {e.cropDetails} <ArrowUpRight className="w-3 h-3" /> {e.destinationCountry}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white shadow-green-200 h-8 text-xs"
                                            onClick={() => handleExportAction(e.id, 'approve')}
                                        >
                                            Approve
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {exportApplications.filter((e: any) => e.status === 'PENDING').length === 0 && (
                                <div className="text-center py-12 text-gray-400 bg-gray-50 dark:bg-gray-800/20 rounded-xl border border-dashed border-gray-200">
                                    No pending applications
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
