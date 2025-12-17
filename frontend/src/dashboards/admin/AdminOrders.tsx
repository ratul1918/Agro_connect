import React, { useState } from 'react';
import { Trash2, Package, Printer, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '../../components/ui/input';

interface AdminOrdersProps {
    orders: any[];
    handleOrderStatus: (id: number, status: string) => void;
    handleDeliveryStatus: (id: number, deliveryStatus: string) => void;
    handleDeleteOrder: (id: number) => void;
    getStatusColor: (status: string) => string;
}

const AdminOrders: React.FC<AdminOrdersProps> = ({
    orders, handleOrderStatus, handleDeliveryStatus, handleDeleteOrder, getStatusColor
}) => {
    const [filter, setFilter] = useState('ALL');
    const [searchOrderId, setSearchOrderId] = useState('');
    const [searchMobile, setSearchMobile] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter by status
    const statusFiltered = filter === 'ALL'
        ? orders
        : orders.filter(o => o.status === filter);

    // Filter by search terms
    const searchFiltered = statusFiltered.filter(order => {
        const matchesId = searchOrderId === '' || order.id.toString().includes(searchOrderId);
        const matchesMobile = searchMobile === '' || (order.customerMobile && order.customerMobile.includes(searchMobile));
        return matchesId && matchesMobile;
    });

    // Pagination
    const totalPages = Math.ceil(searchFiltered.length / itemsPerPage);
    const paginatedOrders = searchFiltered.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchOrderId, searchMobile]);

    const handleDeliveryStatusChange = (orderId: number, newStatus: string) => {
        handleDeliveryStatus(orderId, newStatus);
    };

    return (
        <div className="card bg-base-100 shadow-xl animate-in fade-in duration-300">
            <div className="card-body p-0">
                {/* Header */}
                <div className="p-6 border-b">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <h2 className="card-title text-2xl">
                            Order Management
                            <div className="badge badge-primary">{searchFiltered.length}</div>
                        </h2>

                        <div className="tabs tabs-boxed">
                            <a className={`tab ${filter === 'ALL' ? 'tab-active' : ''}`} onClick={() => setFilter('ALL')}>All</a>
                            <a className={`tab ${filter === 'PENDING' ? 'tab-active' : ''}`} onClick={() => setFilter('PENDING')}>Pending</a>
                            <a className={`tab ${filter === 'CONFIRMED' ? 'tab-active' : ''}`} onClick={() => setFilter('CONFIRMED')}>Confirmed</a>
                            <a className={`tab ${filter === 'DELIVERED' ? 'tab-active' : ''}`} onClick={() => setFilter('DELIVERED')}>Delivered</a>
                            <a className={`tab ${filter === 'COMPLETED' ? 'tab-active' : ''}`} onClick={() => setFilter('COMPLETED')}>Completed</a>
                        </div>
                    </div>

                    {/* Search Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Search by Order ID..."
                                className="pl-10"
                                value={searchOrderId}
                                onChange={(e) => setSearchOrderId(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Search by Mobile Number..."
                                className="pl-10"
                                value={searchMobile}
                                onChange={(e) => setSearchMobile(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Item Details</th>
                                <th>Participants</th>
                                <th>Mobile</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Delivery Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedOrders.map(o => (
                                <tr key={o.id}>
                                    <td className="font-mono text-xs font-bold">#{o.id}</td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar placeholder">
                                                <div className="bg-neutral-focus text-neutral-content rounded-xl w-12 h-12 flex items-center justify-center bg-gray-200">
                                                    <Package className="w-6 h-6 text-gray-500" />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-bold">{o.cropTitle}</div>
                                                <div className="text-xs opacity-50">{new Date(o.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-sm">
                                            <span className="font-semibold text-gray-700">From:</span> {o.farmerName} <br />
                                            <span className="font-semibold text-gray-700">To:</span> {o.buyerName}
                                        </div>
                                    </td>
                                    <td className="text-sm font-mono">{o.customerMobile || 'N/A'}</td>
                                    <td className="font-bold text-primary">৳{o.totalAmount}</td>
                                    <td>
                                        <select
                                            className={`select select-bordered select-xs w-full max-w-xs ${getStatusColor(o.status)}`}
                                            value={o.status}
                                            onChange={(e) => handleOrderStatus(o.id, e.target.value)}
                                        >
                                            <option value="PENDING">Pending</option>
                                            <option value="PENDING_ADVANCE">Wait Advance</option>
                                            <option value="CONFIRMED">Confirmed</option>
                                            <option value="IN_TRANSIT">In Transit</option>
                                            <option value="DELIVERED">Delivered</option>
                                            <option value="COMPLETED">Completed</option>
                                            <option value="CANCELLED">Cancelled</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select
                                            className="select select-bordered select-xs w-36 bg-blue-50 border-blue-300"
                                            value={o.deliveryStatus || 'PENDING'}
                                            onChange={(e) => handleDeliveryStatusChange(o.id, e.target.value)}
                                        >
                                            <option value="PENDING">⏳ Pending</option>
                                            <option value="PROCESSING">📦 Processing</option>
                                            <option value="SHIPPED">🚚 Shipped</option>
                                            <option value="OUT_FOR_DELIVERY">🛵 Out for Delivery</option>
                                            <option value="DELIVERED">✅ Delivered</option>
                                            <option value="CANCELLED">❌ Cancelled</option>
                                        </select>
                                    </td>
                                    <td>
                                        <div className="flex gap-1">
                                            <button
                                                className="btn btn-ghost btn-xs tooltip"
                                                data-tip="Download Invoice"
                                                onClick={() => window.open(`http://localhost:8080/api/orders/${o.id}/invoice`, '_blank')}
                                            >
                                                <Printer className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-xs text-error tooltip"
                                                data-tip="Delete Order"
                                                onClick={() => handleDeleteOrder(o.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paginatedOrders.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-center py-8 text-gray-500">
                                        No orders found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center p-4 border-t">
                        <div className="text-sm text-gray-600">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, searchFiltered.length)} of {searchFiltered.length} orders
                        </div>
                        <div className="join">
                            <button
                                className="join-item btn btn-sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </button>
                            <button className="join-item btn btn-sm">
                                Page {currentPage} of {totalPages}
                            </button>
                            <button
                                className="join-item btn btn-sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminOrders;
