import React, { useState } from 'react';
import { Trash2, Package, Printer, Search, ChevronLeft, ChevronRight, Users } from 'lucide-react';
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
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
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
                                <th>Delivery</th>
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
                                            className={`select select-bordered select-xs w-full max-w-xs ${o.status === 'PENDING' ? 'select-warning' :
                                                o.status === 'PENDING_ADVANCE' ? 'select-warning' :
                                                    o.status === 'CONFIRMED' ? 'select-info' :
                                                        o.status === 'IN_TRANSIT' ? 'select-info' :
                                                            o.status === 'DELIVERED' ? 'select-success' :
                                                                o.status === 'COMPLETED' ? 'select-success' :
                                                                    'select-error'
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
                                            className={`select select-bordered select-xs w-36 ${!o.deliveryStatus || o.deliveryStatus === 'PENDING' ? 'select-warning' :
                                                o.deliveryStatus === 'PROCESSING' ? 'select-info' :
                                                    o.deliveryStatus === 'SHIPPED' ? 'select-info' :
                                                        o.deliveryStatus === 'OUT_FOR_DELIVERY' ? 'select-primary' :
                                                            o.deliveryStatus === 'DELIVERED' ? 'select-success' :
                                                                'select-error'
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
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline btn-primary"
                                            onClick={() => setSelectedOrder(o)}
                                        >
                                            View Details
                                        </button>
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

            {/* View Order Modal */}
            {selectedOrder && (
                <div className="modal modal-open">
                    <div className="modal-box w-11/12 max-w-4xl bg-base-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-2xl">Order Details #{selectedOrder.id}</h3>
                            <button className="btn btn-sm btn-circle btn-ghost" onClick={() => setSelectedOrder(null)}>✕</button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Left Column: Customer & Order Info */}
                            <div className="space-y-6">
                                <div className="card bg-base-200 p-4">
                                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                        <Package className="w-5 h-5" /> Product Info
                                    </h4>
                                    <div className="space-y-2">
                                        <p><span className="font-medium">Product:</span> {selectedOrder.cropTitle}</p>
                                        <p><span className="font-medium">Farmer:</span> {selectedOrder.farmerName} ({selectedOrder.farmerEmail})</p>
                                        <p><span className="font-medium">Order Date:</span> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>

                                <div className="card bg-base-200 p-4">
                                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                        <Users className="w-5 h-5" /> Customer Info
                                    </h4>
                                    <div className="space-y-2">
                                        <p><span className="font-medium">Name:</span> {selectedOrder.buyerName}</p>
                                        <p><span className="font-medium">Email:</span> {selectedOrder.buyerEmail}</p>
                                        <p><span className="font-medium">Mobile:</span> {selectedOrder.customerMobile || 'N/A'}</p>
                                        <p><span className="font-medium">Address:</span> {selectedOrder.customerAddress || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Financials & Actions */}
                            <div className="space-y-6">
                                <div className="card bg-base-200 p-4">
                                    <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                        <Printer className="w-5 h-5" /> Status Management
                                    </h4>
                                    <div className="space-y-4">
                                        <div className="form-control">
                                            <label className="label"><span className="label-text">Order Status</span></label>
                                            <select
                                                className={`select select-bordered w-full ${selectedOrder.status === 'PENDING' ? 'select-warning' :
                                                        selectedOrder.status === 'PENDING_ADVANCE' ? 'select-warning' :
                                                            selectedOrder.status === 'CONFIRMED' ? 'select-info' :
                                                                selectedOrder.status === 'IN_TRANSIT' ? 'select-info' :
                                                                    selectedOrder.status === 'DELIVERED' ? 'select-success' :
                                                                        selectedOrder.status === 'COMPLETED' ? 'select-success' :
                                                                            'select-error'
                                                    }`}
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
                                            <label className="label"><span className="label-text">Delivery Status</span></label>
                                            <select
                                                className={`select select-bordered w-full ${!selectedOrder.deliveryStatus || selectedOrder.deliveryStatus === 'PENDING' ? 'select-warning' :
                                                        selectedOrder.deliveryStatus === 'PROCESSING' ? 'select-info' :
                                                            selectedOrder.deliveryStatus === 'SHIPPED' ? 'select-info' :
                                                                selectedOrder.deliveryStatus === 'OUT_FOR_DELIVERY' ? 'select-primary' :
                                                                    selectedOrder.deliveryStatus === 'DELIVERED' ? 'select-success' :
                                                                        'select-error'
                                                    }`}
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

                                <div className="card bg-green-50 border border-green-200 p-4">
                                    <h4 className="font-semibold text-lg mb-3 text-green-800">Payment Summary</h4>
                                    <div className="space-y-2 text-green-900">
                                        <div className="flex justify-between">
                                            <span>Subtotal & Fees:</span>
                                            <span className="font-bold">৳{selectedOrder.totalAmount}</span>
                                        </div>
                                        <div className="flex justify-between text-sm opacity-75">
                                            <span>Advance Paid:</span>
                                            <span>৳{selectedOrder.advanceAmount}</span>
                                        </div>
                                        <div className="flex justify-between text-sm opacity-75">
                                            <span>Due Amount:</span>
                                            <span>৳{selectedOrder.dueAmount}</span>
                                        </div>
                                        <div className="divider my-2"></div>
                                        <div className="flex justify-between text-xl font-bold">
                                            <span>Total:</span>
                                            <span>৳{selectedOrder.totalAmount}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        className="btn btn-outline flex-1 gap-2"
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
                                        <Users className="w-4 h-4" /> View Invoice
                                    </button>
                                    <button
                                        className="btn btn-primary flex-1 gap-2"
                                        onClick={async () => {
                                            try {
                                                const response = await import('../../api/axios').then(m => m.default.get(`/orders/${selectedOrder.id}/invoice/pdf`, {
                                                    responseType: 'blob'
                                                }));
                                                const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                                                const link = document.createElement('a');
                                                link.href = url;
                                                link.setAttribute('download', `invoice-${selectedOrder.id}.pdf`);
                                                document.body.appendChild(link);
                                                link.click();
                                                link.remove();
                                            } catch (error) {
                                                console.error("Failed to download invoice", error);
                                                alert("Failed to download invoice.");
                                            }
                                        }}
                                    >
                                        <Printer className="w-4 h-4" /> Download PDF
                                    </button>
                                    <button
                                        className="btn btn-error btn-outline flex-1 gap-2"
                                        onClick={() => {
                                            if (window.confirm('Delete this order? Cannot be undone.')) {
                                                handleDeleteOrder(selectedOrder.id);
                                                setSelectedOrder(null);
                                            }
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" /> Delete Order
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
