import React, { useState } from 'react';
import { Search, Gavel, User, Calendar, Clock, ArrowUpRight, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminBidsProps {
    bids: any[];
}

const AdminBids: React.FC<AdminBidsProps> = ({ bids }) => {
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBids = bids.filter(bid => {
        const matchesFilter = filter === 'ALL' || bid.status === filter;
        const matchesSearch = searchTerm === '' ||
            bid.id?.toString().includes(searchTerm) ||
            bid.cropTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bid.buyerName?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    // Calculate stats
    const totalVolume = filteredBids.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const avgBid = filteredBids.length > 0 ? totalVolume / filteredBids.length : 0;
    const activeBids = filteredBids.filter(b => b.status === 'PENDING').length;

    return (
        <div className="space-y-8">
            {/* Header Area */}
            <div className="glass-card rounded-3xl border border-white/20 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Gavel className="w-8 h-8 text-purple-500" />
                            Bid Management
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                            Monitor real-time auctions and offers.
                        </p>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                    {[
                        { label: 'Active Bids', value: activeBids, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
                        { label: 'Total Volume', value: `৳${totalVolume.toLocaleString()}`, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/20' },
                        { label: 'Avg. Bid Value', value: `৳${Math.round(avgBid).toLocaleString()}`, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
                    ].map((stat, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 border border-white/20 dark:border-gray-700 backdrop-blur-sm flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</span>
                            <span className={`text-xl font-bold ${stat.color} px-3 py-1 rounded-lg ${stat.bg}`}>{stat.value}</span>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="mt-8 flex flex-col md:flex-row gap-4 justify-between items-end">
                    <div className="flex bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl w-full md:w-auto">
                        {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === status
                                    ? 'bg-white dark:bg-gray-700 text-purple-600 shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                            >
                                {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search bids..."
                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Bids List */}
            <div className="space-y-4">
                <AnimatePresence>
                    {filteredBids.map((bid, idx) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2, delay: idx * 0.05 }}
                            key={bid.id}
                            className="glass-card rounded-2xl border border-white/20 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-sm hover:shadow-lg transition-all p-4 flex flex-col md:flex-row items-center gap-4 group"
                        >
                            {/* Bid ID & Icon */}
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                                    <Gavel className="w-6 h-6" />
                                </div>
                                <div className="md:hidden">
                                    <span className="text-xs font-mono text-gray-400">#{bid.id}</span>
                                </div>
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                                <div className="col-span-2 md:col-span-1">
                                    <p className="text-xs text-gray-500 mb-0.5">Product</p>
                                    <h4 className="font-bold text-gray-900 dark:text-white truncate" title={bid.cropTitle}>{bid.cropTitle}</h4>
                                    <span className="text-xs font-mono text-gray-400 hidden md:inline-block">#{bid.id}</span>
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <p className="text-xs text-gray-500 mb-0.5">Bidder</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
                                            {bid.buyerName?.charAt(0)}
                                        </div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{bid.buyerName}</span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Amount</p>
                                    <div className="flex items-center gap-1 font-bold text-lg text-gray-900 dark:text-white">
                                        ৳{bid.amount?.toLocaleString()}
                                        <ArrowUpRight className="w-3 h-3 text-green-500" />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500 mb-0.5">Time</p>
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(bid.bidTime).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-gray-400">
                                            <Clock className="w-3 h-3" />
                                            {new Date(bid.bidTime).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="w-full md:w-auto flex justify-end">
                                <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider ${bid.status === 'ACCEPTED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800' :
                                        bid.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800' :
                                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
                                    }`}>
                                    {bid.status}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredBids.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4">
                            <Gavel className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">No active bids</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            The marketplace is quiet right now.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBids;
