import React, { useState, useEffect } from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import { Button } from '../../components/ui/button';

interface AdminCashoutProps {
    handleCashoutAction: (id: number, action: 'approve' | 'reject') => void;
}

const AdminCashout: React.FC<AdminCashoutProps> = ({ handleCashoutAction }) => {
    const [requests, setRequests] = useState<any[]>([]);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await api.get('/api/admin/cashout/all');
            const allRequests = res.data;
            // Combine all status requests into a single array
            const combinedRequests = [
                ...(allRequests.pending || []),
                ...(allRequests.approved || []),
                ...(allRequests.rejected || []),
                ...(allRequests.paid || [])
            ];
            setRequests(combinedRequests);
        } catch (err) {
            console.error("Failed to fetch cashout requests:", err);
            // Mock data for UI dev
            setRequests([
                { id: 1, userName: 'Rahim Farmer', amount: 5000, method: 'bKash', number: '01700000000', status: 'PENDING', requestedAt: '2025-12-14' },
                { id: 2, userName: 'Karim Farmer', amount: 2000, method: 'Nagad', number: '01800000000', status: 'PENDING', requestedAt: '2025-12-15' }
            ]);
        }
    };

    return (
        <div className="card bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 rounded-2xl">
            <div className="card-body p-6">
                <h2 className="card-title text-lg flex justify-between items-center mb-6">
                    Cashout Requests
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                        <AlertCircle className="w-3 h-3" />
                        Actions Needed
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
                            {requests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <td>
                                        <div className="font-semibold">{req.userName}</div>
                                        <div className="text-xs text-gray-500">ID: {req.userId}</div>
                                    </td>
                                    <td className="font-bold text-green-600">৳{req.amount}</td>
                                    <td>
                                        <div className="badge badge-ghost">{req.method}</div>
                                        <div className="text-xs mt-1">{req.number}</div>
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
                            {requests.length === 0 && (
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
    );
};

export default AdminCashout;
