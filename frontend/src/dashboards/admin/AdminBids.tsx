import React, { useState } from 'react';
import { Search, Gavel } from 'lucide-react';

interface AdminBidsProps {
    bids: any[];
}

const AdminBids: React.FC<AdminBidsProps> = ({ bids }) => {
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredBids = bids.filter(bid => {
        const matchesFilter = filter === 'ALL' || bid.status === filter;
        const matchesSearch = searchTerm === '' || 
            bid.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bid.cropTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bid.buyerName.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    return (
        <div className="card bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in duration-300">
            <div className="card-body p-0">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                        <div>
                            <h2 className="card-title text-2xl font-bold text-gray-800 dark:text-white mb-1">
                                Bid History
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                Monitor all incoming bids
                                <span className="badge badge-primary badge-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-0">{filteredBids.length} bids</span>
                            </p>
                        </div>
                        <div className="tabs tabs-boxed bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                            {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'].map((status) => (
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

                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by bid ID, crop, or bidder..."
                            className="input input-bordered w-full pl-10 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary/50 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-200">
                            <tr>
                                <th className="py-4 pl-6 w-16 sm:w-20">Bid ID</th>
                                <th className="py-4 min-w-32 sm:min-w-40">Crop</th>
                                <th className="py-4 min-w-32 sm:min-w-40">Bidder</th>
                                <th className="py-4 w-24 sm:w-28">Amount</th>
                                <th className="py-4 w-24 sm:w-28">Status</th>
                                <th className="py-4 w-32 sm:w-36">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                            {filteredBids.map(bid => (
                                <tr key={bid.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <th className="pl-6 font-mono text-gray-500 dark:text-gray-400 font-normal">#{bid.id}</th>
                                    <td>
                                        <div className="font-medium text-gray-800 dark:text-white max-w-32 truncate" title={bid.cropTitle}>{bid.cropTitle}</div>
                                    </td>
                                    <td>
                                        <div className="text-gray-600 dark:text-gray-300 max-w-32 truncate" title={bid.buyerName}>{bid.buyerName}</div>
                                    </td>
                                    <td className="font-mono font-bold text-primary">৳{bid.amount}</td>
                                    <td>
                                        <div className={`badge ${bid.status === 'ACCEPTED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0' :
                                                bid.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-0' :
                                                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-0'
                                            } py-2.5 px-3 rounded-lg font-medium`}>
                                            {bid.status}
                                        </div>
                                    </td>
                                    <td className="text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col">
                                            <span>{new Date(bid.bidTime).toLocaleDateString()}</span>
                                            <span className="text-xs opacity-50">{new Date(bid.bidTime).toLocaleTimeString()}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredBids.length === 0 && (
                    <div className="text-center py-12">
                        <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                            <Gavel className="w-12 h-12 mb-3 opacity-20" />
                            <p className="text-lg font-medium">No bids found</p>
                            <p className="text-sm">
                                {searchTerm || filter !== 'ALL'
                                    ? 'Try adjusting your filters'
                                    : 'No bids have been placed yet'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBids;
