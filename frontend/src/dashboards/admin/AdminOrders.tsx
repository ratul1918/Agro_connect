import React, { useState } from 'react';
import { Trash2, Package, Printer, Search, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Input } from '../../components/ui/input';

interface AdminOrdersProps {
    orders: any[];
    handleOrderStatus: (id: number, status: string) => void;
    handleDeliveryStatus: (id: number, deliveryStatus: string) => void;
    handleDeleteOrder: (id: number) => void;
}

const AdminOrders: React.FC<AdminOrdersProps> = ({
    orders, handleOrderStatus, handleDeliveryStatus, handleDeleteOrder
}) => {
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [filter, setFilter] = useState('ALL');
    const [searchOrderId, setSearchOrderId] = useState('');
    const [searchMobile, setSearchMobile] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; orderId: number | null }>({ show: false, orderId: null });

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
        if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder({ ...selectedOrder, deliveryStatus: newStatus });
        }
    };

    const handleStatusChange = (orderId: number, newStatus: string) => {
        handleOrderStatus(orderId, newStatus);
        if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
    };

    const handleDownloadInvoice = async (orderId: number) => {
        try {
            const response = await import('../../api/axios').then(m => m.default.get(`/orders/${orderId}/invoice`, {
                responseType: 'blob'
            }));
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to download invoice", error);
            alert("Failed to download invoice. Ensure you are authorized.");
        }
    };

    return (
        <div className="card bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in duration-300">
            <div className="card-body p-0">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                        <div>
                            <h2 className="card-title text-2xl font-bold text-gray-800 dark:text-white mb-1">
                                Order Management
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                Track and manage all customer orders
                                <span className="badge badge-primary badge-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-0">{searchFiltered.length} orders</span>
                            </p>
                        </div>

                        <div className="tabs tabs-boxed bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                            {['ALL', 'PENDING', 'CONFIRMED', 'DELIVERED', 'COMPLETED'].map((status) => (
                                <a
                                    key={status}
                                    className={`tab rounded-lg transition-all duration-200 ${filter === status
                                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm font-medium'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    } text-xs sm:text-sm px-4`}
                                    onClick={() => setFilter(status)}
                                >
                                    {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Search Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Search by Order ID..."
                                className="pl-10 text-sm bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={searchOrderId}
                                onChange={(e) => setSearchOrderId(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Search by Mobile Number..."
                                className="pl-10 text-sm bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                                value={searchMobile}
                                onChange={(e) => setSearchMobile(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="table w-full min-w-[800px]">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-200">
                            <tr>
                                <th className="py-4 pl-6 w-[8%]">Order ID</th>
                                <th className="py-4 w-[25%]">Item Details</th>
                                <th className="py-4 w-[20%]">Participants</th>
                                <th className="py-4 w-[12%]">Mobile</th>
                                <th className="py-4 w-[10%]">Amount</th>
                                <th className="py-4 w-[10%]">Status</th>
                                <th className="py-4 w-[10%]">Delivery</th>
                                <th className="py-4 pr-6 w-[5%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {paginatedOrders.map(o => (
                                <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                    <td className="pl-6 font-mono text-xs font-bold whitespace-nowrap text-gray-500 dark:text-gray-400">#{o.id}</td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="avatar placeholder">
                                                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-xl w-10 h-10 flex items-center justify-center ring-1 ring-blue-100 dark:ring-blue-800">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-bold text-sm text-gray-800 dark:text-white break-words">{o.cropTitle}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-sm">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-1.5 py-0.5 rounded">From</span>
                                                <span className="truncate text-gray-700 dark:text-gray-300 max-w-[120px]" title={o.farmerName}>{o.farmerName}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-1.5 py-0.5 rounded">To</span>
                                                <span className="truncate text-gray-700 dark:text-gray-300 max-w-[120px]" title={o.buyerName}>{o.buyerName}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="text-sm font-mono whitespace-nowrap text-gray-600 dark:text-gray-400">{o.customerMobile || 'N/A'}</td>
                                    <td className="font-bold text-gray-900 dark:text-white whitespace-nowrap">৳{o.totalAmount}</td>
                                    <td>
                                        <select
                                            className={`select select-bordered select-xs w-full max-w-[120px] text-xs font-medium rounded-lg border-2 ${o.status === 'PENDING' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800' :
                                                o.status === 'PENDING_ADVANCE' ? 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800' :
                                                    o.status === 'CONFIRMED' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                                                        o.status === 'IN_TRANSIT' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800' :
                                                            o.status === 'DELIVERED' || o.status === 'COMPLETED' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                                                                'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                                                }`}
                                            value={o.status}
                                            onChange={(e) => handleOrderStatus(o.id, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
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
                                            className={`select select-bordered select-xs w-full max-w-[140px] text-xs font-medium rounded-lg border-2 ${!o.deliveryStatus || o.deliveryStatus === 'PENDING' ? 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600' :
                                                o.deliveryStatus === 'PROCESSING' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                                                    o.deliveryStatus === 'SHIPPED' ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800' :
                                                        o.deliveryStatus === 'OUT_FOR_DELIVERY' ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800' :
                                                            o.deliveryStatus === 'DELIVERED' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800' :
                                                                'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                                                }`}
                                            value={o.deliveryStatus || 'PENDING'}
                                            onChange={(e) => handleDeliveryStatusChange(o.id, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <option value="PENDING">⏳ Pending</option>
                                            <option value="PROCESSING">📦 Processing</option>
                                            <option value="SHIPPED">🚚 Shipped</option>
                                            <option value="OUT_FOR_DELIVERY">🛵 Out for Delivery</option>
                                            <option value="DELIVERED">✅ Delivered</option>
                                            <option value="CANCELLED">❌ Cancelled</option>
                                        </select>
                                    </td>
                                    <td className="pr-6">
                                        <button
                                            className="btn btn-sm btn-ghost btn-circle text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                            onClick={() => setSelectedOrder(o)}
                                            title="View Details"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {paginatedOrders.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                            <Package className="w-12 h-12 mb-3 opacity-20" />
                                            <p className="text-lg font-medium">No orders found</p>
                                            <p className="text-sm">Try adjusting your filters</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border-t">
                        <div className="text-sm text-gray-600 order-2 sm:order-1">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, searchFiltered.length)} of {searchFiltered.length} orders
                        </div>
                        <div className="join order-1 sm:order-2 w-full sm:w-auto">
                            <button
                                className="join-item btn btn-sm flex-1 sm:flex-none"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span className="hidden sm:inline">Previous</span>
                            </button>
                            <button className="join-item btn btn-sm flex-1 sm:flex-none min-w-[100px]">
                                Page {currentPage} of {totalPages}
                            </button>
                            <button
                                className="join-item btn btn-sm flex-1 sm:flex-none"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <span className="hidden sm:inline">Next</span>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* View Order Modal */}
            {selectedOrder && (
                <div className="modal modal-open bg-black/50 backdrop-blur-sm">
                    <div className="modal-box w-11/12 max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl border border-gray-100 dark:border-gray-700 p-0">
                        <div className="flex justify-between items-center px-6 py-4 sticky top-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-700 z-10">
                            <h3 className="font-bold text-xl sm:text-2xl text-gray-800 dark:text-white flex items-center gap-2">
                                <Package className="w-6 h-6 text-blue-600" />
                                Order Details <span className="text-gray-400">#{selectedOrder.id}</span>
                            </h3>
                            <button
                                className="btn btn-sm btn-circle btn-ghost text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => setSelectedOrder(null)}
                            >✕</button>
                        </div>

                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column: Customer & Order Info */}
                            <div className="space-y-6">
                                <div className="card bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 p-5 rounded-xl">
                                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                                        <Package className="w-5 h-5 text-blue-500" /> Product Info
                                    </h4>
                                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                                        <p className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2">
                                            <span className="font-medium">Product:</span>
                                            <span className="font-bold text-gray-800 dark:text-white">{selectedOrder.cropTitle}</span>
                                        </p>
                                        <p className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2">
                                            <span className="font-medium">Farmer:</span>
                                            <span>{selectedOrder.farmerName} <span className="text-xs opacity-75">({selectedOrder.farmerEmail})</span></span>
                                        </p>
                                        <p className="flex justify-between">
                                            <span className="font-medium">Order Date:</span>
                                            <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="card bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 p-5 rounded-xl">
                                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                                        <Users className="w-5 h-5 text-purple-500" /> Customer Info
                                    </h4>
                                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                                        <p className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2">
                                            <span className="font-medium">Name:</span>
                                            <span className="font-bold text-gray-800 dark:text-white">{selectedOrder.buyerName}</span>
                                        </p>
                                        <p className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2">
                                            <span className="font-medium">Email:</span>
                                            <span>{selectedOrder.buyerEmail}</span>
                                        </p>
                                        <p className="flex justify-between border-b border-gray-200 dark:border-gray-600 pb-2">
                                            <span className="font-medium">Mobile:</span>
                                            {selectedOrder.customerMobile ? (
                                                <span className="font-mono bg-white dark:bg-gray-800 px-2 rounded border dark:border-gray-600">{selectedOrder.customerMobile}</span>
                                            ) : <span className="text-gray-400">N/A</span>}
                                        </p>
                                        <p className="flex flex-col gap-1">
                                            <span className="font-medium">Address:</span>
                                            <span className="bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600 min-h-[60px]">
                                                {selectedOrder.customerAddress || 'N/A'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Financials & Actions */}
                            <div className="space-y-6">
                                <div className="card bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 p-5 rounded-xl">
                                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
                                        <Printer className="w-5 h-5 text-orange-500" /> Status Management
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="form-control">
                                            <label className="label pt-0"><span className="label-text text-sm font-medium text-gray-600 dark:text-gray-400">Order Status</span></label>
                                            <select
                                                className="select select-bordered bg-white dark:bg-gray-800 w-full"
                                                value={selectedOrder.status}
                                                onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="PENDING_ADVANCE">Wait Advance</option>
                                                <option value="CONFIRMED">Confirmed</option>
                                                <option value="IN_TRANSIT">In Transit</option>
                                                <option value="DELIVERED">Delivered</option>
                                                <option value="COMPLETED">Completed</option>
                                                <option value="CANCELLED">Cancelled</option>
                                            </select>
                                        </div>

                                        <div className="form-control">
                                            <label className="label"><span className="label-text text-sm font-medium text-gray-600 dark:text-gray-400">Delivery Status</span></label>
                                            <select
                                                className="select select-bordered bg-white dark:bg-gray-800 w-full"
                                                value={selectedOrder.deliveryStatus || 'PENDING'}
                                                onChange={(e) => handleDeliveryStatusChange(selectedOrder.id, e.target.value)}
                                            >
                                                <option value="PENDING">⏳ Pending</option>
                                                <option value="PROCESSING">📦 Processing</option>
                                                <option value="SHIPPED">🚚 Shipped</option>
                                                <option value="OUT_FOR_DELIVERY">🛵 Out for Delivery</option>
                                                <option value="DELIVERED">✅ Delivered</option>
                                                <option value="CANCELLED">❌ Cancelled</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="card bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800/30 p-5 rounded-xl">
                                    <h4 className="font-semibold text-lg mb-3 text-green-800 dark:text-green-400 flex items-center justify-between">
                                        Payment Summary
                                        <span className="text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">Paid via {selectedOrder.paymentMethod || 'Cash'}</span>
                                    </h4>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between text-gray-600 dark:text-gray-300">
                                            <span>Subtotal:</span>
                                            <span className="font-mono">৳{selectedOrder.totalAmount}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-500 dark:text-gray-400 text-xs">
                                            <span>Advance Paid:</span>
                                            <span className="font-mono">৳{selectedOrder.advanceAmount}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-500 dark:text-gray-400 text-xs">
                                            <span>Due Amount:</span>
                                            <span className="font-mono">৳{selectedOrder.dueAmount}</span>
                                        </div>
                                        <div className="divider my-2 dark:opacity-20"></div>
                                        <div className="flex justify-between text-xl font-bold text-green-700 dark:text-green-400">
                                            <span>Total:</span>
                                            <span>৳{selectedOrder.totalAmount}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <button
                                        className="btn btn-outline dark:text-gray-300 dark:hover:bg-gray-700 flex-1 gap-2"
                                        onClick={async () => {
                                            try {
                                                const response = await import('../../api/axios').then(m => m.default.get(`/orders/${selectedOrder.id}/invoice`, {
                                                    responseType: 'text'
                                                }));
                                                const win = window.open('', '_blank');
                                                if (win) {
                                                    win.document.write(response.data);
                                                    win.document.close();
                                                } else {
                                                    alert('Please allow popups to view the invoice.');
                                                }
                                            } catch (error) {
                                                console.error("Failed to view invoice", error);
                                                alert("Failed to load invoice view.");
                                            }
                                        }}
                                    >
                                        <Users className="w-4 h-4" />
                                        View Invoice
                                    </button>
                                    <button
                                        className="btn btn-primary flex-1 gap-2"
                                        onClick={() => handleDownloadInvoice(selectedOrder.id)}
                                    >
                                        <Printer className="w-4 h-4" />
                                        Download PDF
                                    </button>
                                    <button
                                        className="btn btn-error btn-outline flex-1 gap-2"
                                        onClick={() => setDeleteConfirm({ show: true, orderId: selectedOrder.id })}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm.show && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Delete Order</h3>
                        <p className="py-4">Are you sure you want to delete this order? This action cannot be undone.</p>
                        <div className="modal-action">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setDeleteConfirm({ show: false, orderId: null })}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-error"
                                onClick={() => {
                                    if (deleteConfirm.orderId) {
                                        handleDeleteOrder(deleteConfirm.orderId);
                                        setSelectedOrder(null);
                                    }
                                    setDeleteConfirm({ show: false, orderId: null });
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
