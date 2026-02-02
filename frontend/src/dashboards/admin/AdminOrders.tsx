import React, { useState } from 'react';
import { Trash2, Package, Printer, Search, ChevronLeft, ChevronRight, Users, ShoppingBag, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../api/axios';

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
    const itemsPerPage = 8;
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
            const response = await api.get(`/orders/${orderId}/invoice`, {
                responseType: 'blob'
            });
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

    // Helper to get status colors
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
            case 'DELIVERED':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-1 ring-green-500/20';
            case 'CANCELLED':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-red-500/20';
            case 'CONFIRMED':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ring-1 ring-blue-500/20';
            case 'IN_TRANSIT':
                return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 ring-1 ring-indigo-500/20';
            default:
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 ring-1 ring-yellow-500/20';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header & Stats Container */}
            <div className="glass-card rounded-3xl border border-white/20 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl p-8 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <ShoppingBag className="w-8 h-8 text-blue-500" />
                            Order Management
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                            Track and process customer orders efficiently.
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mt-8 flex flex-col xl:flex-row gap-4 justify-between items-end">
                    <div className="flex flex-wrap gap-2">
                        {['ALL', 'PENDING', 'CONFIRMED', 'DELIVERED', 'COMPLETED', 'CANCELLED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filter === status
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                                    : 'bg-white/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
                                    }`}
                            >
                                {status === 'ALL' ? 'All Orders' : status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Order ID..."
                                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                value={searchOrderId}
                                onChange={(e) => setSearchOrderId(e.target.value)}
                            />
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Mobile Number..."
                                className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                                value={searchMobile}
                                onChange={(e) => setSearchMobile(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="glass-card rounded-3xl border border-white/20 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl overflow-hidden p-6">
                {searchFiltered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                            <Package className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">No orders found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
                            Try adjusting your search criteria or filters to find what you're looking for.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                                    <th className="pb-4 pl-4 w-[100px]">Order ID</th>
                                    <th className="pb-4 w-[250px]">Product</th>
                                    <th className="pb-4 w-[200px]">Participants</th>
                                    <th className="pb-4">Amount</th>
                                    <th className="pb-4">Order Status</th>
                                    <th className="pb-4">Delivery</th>
                                    <th className="pb-4 pr-4 text-right">Actions</th>
                                    <th className="pb-4 w-[50px]"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {paginatedOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="group hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        <td className="py-4 pl-4">
                                            <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">#{order.id}</span>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                                    <Package className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 dark:text-white truncate max-w-[180px]">{order.cropTitle}</div>
                                                    <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="w-10 text-gray-400">From:</span>
                                                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{order.farmerName}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="w-10 text-gray-400">To:</span>
                                                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{order.buyerName}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className="font-bold text-gray-900 dark:text-white">৳{order.totalAmount?.toLocaleString()}</span>
                                        </td>
                                        <td className="py-4">
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                                    className={`h-8 pl-2 pr-8 text-xs font-bold rounded-lg border-none focus:ring-0 cursor-pointer appearance-none ${getStatusColor(order.status)}`}
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
                                        </td>
                                        <td className="py-4">
                                            <div onClick={(e) => e.stopPropagation()}>
                                                <select
                                                    value={order.deliveryStatus || 'PENDING'}
                                                    onChange={(e) => handleDeliveryStatusChange(order.id, e.target.value)}
                                                    className="h-8 pl-2 pr-8 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-lg border-none focus:ring-0 cursor-pointer"
                                                >
                                                    <option value="PENDING">⏳ Pending</option>
                                                    <option value="PROCESSING">📦 Processing</option>
                                                    <option value="SHIPPED">🚚 Shipped</option>
                                                    <option value="OUT_FOR_DELIVERY">🛵 Out for Delivery</option>
                                                    <option value="DELIVERED">✅ Delivered</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="py-4 text-right pr-4">
                                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => handleDownloadInvoice(order.id)}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-blue-600 transition-colors"
                                                    title="Download Invoice"
                                                >
                                                    <Printer className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirm({ show: true, orderId: order.id })}
                                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                                                    title="Delete Order"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <ChevronRight className="w-5 h-5 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8 gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="px-4 py-2 font-mono text-sm font-bold text-gray-500">
                            Page {currentPage} / {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Order Details Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={() => setSelectedOrder(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Order Details</h3>
                                    <p className="text-sm text-gray-500 font-mono">#{selectedOrder.id}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <XCircle className="w-6 h-6 text-gray-500" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-8 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Order Info */}
                                    <div className="space-y-6">
                                        <div className="p-6 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                                            <h4 className="flex items-center gap-2 font-bold text-blue-700 dark:text-blue-400 mb-4">
                                                <Package className="w-5 h-5" /> Product Information
                                            </h4>
                                            <div className="space-y-3 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Product Name</span>
                                                    <span className="font-bold text-gray-900 dark:text-white">{selectedOrder.cropTitle}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Farmer</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">{selectedOrder.farmerName}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Order Date</span>
                                                    <span className="font-mono text-gray-900 dark:text-white">{new Date(selectedOrder.createdAt).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 rounded-2xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30">
                                            <h4 className="flex items-center gap-2 font-bold text-purple-700 dark:text-purple-400 mb-4">
                                                <Users className="w-5 h-5" /> Customer Details
                                            </h4>
                                            <div className="space-y-3 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Customer Name</span>
                                                    <span className="font-bold text-gray-900 dark:text-white">{selectedOrder.buyerName}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Email</span>
                                                    <span className="text-gray-900 dark:text-white">{selectedOrder.buyerEmail}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">Mobile</span>
                                                    <span className="font-mono text-gray-900 dark:text-white">{selectedOrder.customerMobile || 'N/A'}</span>
                                                </div>
                                                <div className="pt-2 border-t border-purple-100 dark:border-purple-900/30 mt-2">
                                                    <span className="block text-gray-500 mb-1">Shipping Address</span>
                                                    <p className="text-gray-900 dark:text-white bg-white dark:bg-gray-800 p-3 rounded-xl border border-purple-100 dark:border-purple-900/30">
                                                        {selectedOrder.customerAddress || 'No address provided'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Financials & Status */}
                                    <div className="space-y-6">
                                        <div className="p-6 rounded-2xl bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
                                            <h4 className="flex items-center gap-2 font-bold text-green-700 dark:text-green-400 mb-4">
                                                <CheckCircle2 className="w-5 h-5" /> Financial Summary
                                            </h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Subtotal</span>
                                                    <span className="font-mono font-bold">৳{selectedOrder.totalAmount}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Advance Paid</span>
                                                    <span className="font-mono font-bold text-green-600">৳{selectedOrder.advanceAmount}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Due Amount</span>
                                                    <span className="font-mono font-bold text-red-500">৳{selectedOrder.dueAmount}</span>
                                                </div>
                                                <div className="pt-3 border-t border-green-200 dark:border-green-800 flex justify-between items-center mt-2">
                                                    <span className="font-bold text-gray-900 dark:text-white">Total Amount</span>
                                                    <span className="text-2xl font-bold text-green-600 dark:text-green-400">৳{selectedOrder.totalAmount}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Order Status</label>
                                                <select
                                                    value={selectedOrder.status}
                                                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                                                    className="w-full h-12 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 px-4"
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

                                            <div>
                                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Delivery Status</label>
                                                <select
                                                    value={selectedOrder.deliveryStatus || 'PENDING'}
                                                    onChange={(e) => handleDeliveryStatusChange(selectedOrder.id, e.target.value)}
                                                    className="w-full h-12 rounded-xl bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 px-4"
                                                >
                                                    <option value="PENDING">For Processing</option>
                                                    <option value="PROCESSING">Processing</option>
                                                    <option value="SHIPPED">Shipped</option>
                                                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                                                    <option value="DELIVERED">Delivered</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex justify-end gap-3 rounded-b-3xl">
                                <button
                                    onClick={() => handleDownloadInvoice(selectedOrder.id)}
                                    className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                                >
                                    <Printer className="w-5 h-5" /> Download Invoice
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm.show && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center"
                        >
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Order?</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                This action cannot be undone. Are you sure you want to permanently delete this order?
                            </p>
                            <div className="flex gap-4">
                                <button
                                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    onClick={() => setDeleteConfirm({ show: false, orderId: null })}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/30 transition-colors"
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
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminOrders;
