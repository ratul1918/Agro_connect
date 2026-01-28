import React, { useState, useEffect } from 'react';
import { Check, X, AlertCircle, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import api, { BASE_URL } from '../../api/axios';
import { Button } from '../../components/ui/button';

// Helper function to get server base URL for invoices

interface AdminCashoutProps {
    handleCashoutAction: (id: number, action: 'approve' | 'reject') => void;
    key?: any; // Add key prop to force re-render
}

const AdminCashout: React.FC<AdminCashoutProps> = ({ handleCashoutAction, key }) => {
    const [requests, setRequests] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [historyRequests, setHistoryRequests] = useState<any[]>([]);

    useEffect(() => {
        fetchRequests();
    }, [key]); // Refetch when key changes (used for refresh after actions)



    const fetchRequests = async () => {
        try {
            console.log('Fetching cashout requests...');
            const res = await api.get('/admin/cashout/all');
            console.log('Cashout requests response:', res.data);
            const allRequests = res.data;

            // Separate pending and history requests
            const pending = (allRequests.pending || []).sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
            const history = [
                ...(allRequests.approved || []),
                ...(allRequests.rejected || []),
                ...(allRequests.paid || [])
            ].sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

            setPendingRequests(pending);
            setHistoryRequests(history);
            setRequests([...pending, ...history]);
        } catch (err) {
            console.error("Failed to fetch cashout requests:", err);
            // Mock data for UI dev
            const mockPending = [
                { id: 1, userName: 'Rahim Farmer', amount: 5000, method: 'bKash', number: '01700000000', status: 'PENDING', requestedAt: '2025-12-14' },
                { id: 2, userName: 'Karim Farmer', amount: 2000, method: 'Nagad', number: '01800000000', status: 'PENDING', requestedAt: '2025-12-15' }
            ];
            const mockHistory = [
                { id: 3, userName: 'Jamal Farmer', amount: 3000, method: 'bKash', number: '01700000001', status: 'APPROVED', requestedAt: '2025-12-10', processedAt: '2025-12-11' },
                { id: 4, userName: 'Kamal Farmer', amount: 1500, method: 'Nagad', number: '01800000001', status: 'REJECTED', requestedAt: '2025-12-08', processedAt: '2025-12-09' }
            ];
            setPendingRequests(mockPending);
            setHistoryRequests(mockHistory);
            setRequests([...mockPending, ...mockHistory]);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PENDING':
                return (
                    <div className="badge badge-warning gap-1">
                        <Clock className="w-3 h-3" />
                        Pending
                    </div>
                );
            case 'APPROVED':
                return (
                    <div className="badge badge-success gap-1 text-white">
                        <CheckCircle className="w-3 h-3" />
                        Approved
                    </div>
                );
            case 'REJECTED':
                return (
                    <div className="badge badge-error gap-1 text-white">
                        <XCircle className="w-3 h-3" />
                        Rejected
                    </div>
                );
            case 'PAID':
                return (
                    <div className="badge badge-info gap-1 text-white">
                        <DollarSign className="w-3 h-3" />
                        Paid
                    </div>
                );
            default:
                return <div className="badge badge-ghost">{status}</div>;
        }
    };

    const isPending = (status: string) => {
        return status?.toUpperCase() === 'PENDING';
    };

    return (
        <div className="space-y-6" data-cashout-component>
            {/* Pending Requests Section */}
            <div className="card bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 rounded-2xl">
                <div className="card-body p-6">
                    <h2 className="card-title text-lg flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-amber-500" />
                            Pending Requests
                        </div>
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                            {pendingRequests.length} Pending
                        </span>
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700">
                                    <th>User</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td>
                                            <div className="font-semibold">{req.userName}</div>
                                            <div className="text-xs text-gray-500">ID: {req.userId}</div>
                                        </td>
                                        <td className="font-bold text-green-600">৳{req.amount}</td>
                                        <td>
                                            <div className="badge badge-ghost">{req.paymentMethod || req.method}</div>
                                            <div className="text-xs mt-1">{req.accountDetails || req.number}</div>
                                        </td>
                                        <td className="text-sm">{new Date(req.requestedAt).toLocaleDateString()}</td>
                                        <td>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 text-white h-8"
                                                    onClick={() => handleCashoutAction(req.id, 'approve')}
                                                >
                                                    <Check className="w-4 h-4 mr-1" /> Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="border-red-200 text-red-600 hover:bg-red-50 h-8"
                                                    onClick={() => handleCashoutAction(req.id, 'reject')}
                                                >
                                                    <X className="w-4 h-4 mr-1" /> Reject
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {pendingRequests.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-gray-400">
                                            No pending cashout requests
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* History Section */}
            <div className="card bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 rounded-2xl">
                <div className="card-body p-6">
                    <h2 className="card-title text-lg flex justify-between items-center mb-6">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-500" />
                            Cashout History
                        </div>
                        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                            {historyRequests.length} Processed
                        </span>
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700">
                                    <th>User</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Requested</th>
                                    <th>Processed</th>
                                    <th>Status</th>
                                    <th>Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyRequests.map((req) => (
                                    <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td>
                                            <div className="font-semibold">{req.userName}</div>
                                            <div className="text-xs text-gray-500">ID: {req.userId}</div>
                                        </td>
                                        <td className="font-bold text-green-600">৳{req.amount}</td>
                                        <td>
                                            <div className="badge badge-ghost">{req.paymentMethod || req.method}</div>
                                            <div className="text-xs mt-1">{req.accountDetails || req.number}</div>
                                        </td>
                                        <td className="text-sm">{new Date(req.requestedAt).toLocaleDateString()}</td>
                                        <td className="text-sm">
                                            {req.processedAt ? new Date(req.processedAt).toLocaleDateString() : '-'}
                                        </td>
                                        <td>
                                            {getStatusBadge(req.status)}
                                        </td>
                                        <td>
                                            {req.invoiceUrl && (
                                                <a
                                                    href={`${BASE_URL}${req.invoiceUrl}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 hover:underline text-sm inline-flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
                                                    title={`View invoice for request #${req.id}`}
                                                    onClick={(e) => {
                                                        console.log('Invoice clicked:', `${BASE_URL}${req.invoiceUrl}`);
                                                    }}
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                    Invoice
                                                </a>
                                            )}
                                            {!req.invoiceUrl && req.status === 'APPROVED' && (
                                                <span className="text-xs text-gray-400" title="Invoice not yet generated">
                                                    Generating...
                                                </span>
                                            )}
                                            {req.status === 'REJECTED' && req.adminNote && (
                                                <div className="text-xs text-gray-500 mt-1" title="Rejection reason">
                                                    <strong>Reason:</strong> {req.adminNote}
                                                </div>
                                            )}
                                            {req.status === 'PAID' && req.transactionRef && (
                                                <div className="text-xs text-green-600 mt-1" title="Transaction reference">
                                                    <strong>Ref:</strong> {req.transactionRef}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {historyRequests.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center py-8 text-gray-400">
                                            No cashout history found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCashout;
