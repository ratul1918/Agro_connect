import React, { useState, useEffect } from 'react';
import { Check, X, AlertCircle, Clock, CheckCircle, Wallet, FileText } from 'lucide-react';
import api, { BASE_URL } from '../../api/axios';
import { Button } from '../../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminCashoutProps {
    handleCashoutAction: (id: number, action: 'approve' | 'reject') => void;
    key?: any;
}

const AdminCashout: React.FC<AdminCashoutProps> = ({ handleCashoutAction, key }) => {
    const [_requests, setRequests] = useState<any[]>([]);
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);
    const [historyRequests, setHistoryRequests] = useState<any[]>([]);
    const [_loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, [key]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/cashout/all');
            const allRequests = res.data;

            const pending = (allRequests.pending || []).sort((a: any, b: any) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());
            const history = [
                ...(allRequests.approved || []),
                ...(allRequests.rejected || []),
                ...(allRequests.paid || [])
            ].sort((a: any, b: any) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

            setPendingRequests(pending);
            setHistoryRequests(history);
            setRequests([...pending, ...history]);
        } catch (err) {
            console.error("Failed to fetch cashout requests:", err);
        } finally {
            setLoading(false);
        }
    };

    const totalPendingAmount = pendingRequests.reduce((sum, req) => sum + (req.amount || 0), 0);
    const totalProcessedAmount = historyRequests.filter(r => r.status === 'APPROVED' || r.status === 'PAID').reduce((sum, req) => sum + (req.amount || 0), 0);

    return (
        <div className="space-y-8">
            {/* Header Stats */}
            <div className="glass-card rounded-3xl border border-white/20 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-yellow-500/10 blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Wallet className="w-8 h-8 text-yellow-500" />
                            Financial Overview
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                            Manage payout requests and financial history.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-100 dark:border-yellow-800">
                        <p className="text-yellow-700 dark:text-yellow-400 font-medium mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4" /> Pending Payouts
                        </p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">৳{totalPendingAmount.toLocaleString()}</h3>
                        <p className="text-sm text-gray-500 mt-1">{pendingRequests.length} requests waiting</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800">
                        <p className="text-green-700 dark:text-green-400 font-medium mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Total Disbursed
                        </p>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white">৳{totalProcessedAmount.toLocaleString()}</h3>
                        <p className="text-sm text-gray-500 mt-1">Successfully processed</p>
                    </div>
                </div>
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 px-2">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        Action Required
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <AnimatePresence>
                            {pendingRequests.map((req, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={req.id}
                                    className="glass-card rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10 p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 font-bold text-xl">
                                        ৳
                                    </div>

                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                                        <div>
                                            <p className="text-xs text-amber-600/70 dark:text-amber-400/70 font-semibold uppercase tracking-wider">Beneficiary</p>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-lg">{req.userName}</h4>
                                            <p className="text-sm text-gray-500">ID: {req.userId}</p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-amber-600/70 dark:text-amber-400/70 font-semibold uppercase tracking-wider">Amount & Method</p>
                                            <h4 className="font-bold text-gray-900 dark:text-white text-lg">৳{req.amount.toLocaleString()}</h4>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <span className="font-medium text-gray-700 dark:text-gray-300">{req.paymentMethod || req.method}</span>
                                                <span>•</span>
                                                <span className="font-mono">{req.accountDetails || req.number}</span>
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-amber-600/70 dark:text-amber-400/70 font-semibold uppercase tracking-wider">Requested</p>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-1">
                                                {new Date(req.requestedAt).toLocaleDateString()}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(req.requestedAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 w-full md:w-auto">
                                        <Button
                                            variant="outline"
                                            className="flex-1 md:flex-none border-red-200 hover:bg-red-50 text-red-600 dark:border-red-900 dark:hover:bg-red-900/20"
                                            onClick={() => handleCashoutAction(req.id, 'reject')}
                                        >
                                            <X className="w-4 h-4 mr-2" /> Reject
                                        </Button>
                                        <Button
                                            className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg shadow-green-600/20"
                                            onClick={() => handleCashoutAction(req.id, 'approve')}
                                        >
                                            <Check className="w-4 h-4 mr-2" /> Approve
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            {/* Transaction History */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 px-2 mt-8">
                    <Clock className="w-5 h-5 text-gray-400" />
                    Transaction History
                </h3>

                <div className="glass-card rounded-2xl border border-white/20 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50/50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs font-semibold">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Date processed</th>
                                    <th className="px-6 py-4 text-right">Invoice</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {historyRequests.map(req => (
                                    <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 dark:text-white">{req.userName}</div>
                                            <div className="text-xs text-gray-500">{req.paymentMethod || req.method} • {req.accountDetails || req.number}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-gray-900 dark:text-white">৳{req.amount.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${req.status === 'APPROVED' || req.status === 'PAID'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                }`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {req.processedAt ? new Date(req.processedAt).toLocaleDateString() : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {req.invoiceUrl ? (
                                                <a href={`${BASE_URL}${req.invoiceUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-xs">
                                                    <FileText className="w-4 h-4 mr-1" /> View
                                                </a>
                                            ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {historyRequests.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No history available.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCashout;
