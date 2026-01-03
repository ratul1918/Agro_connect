import React, { useState } from 'react';

interface AdminBidsProps {
    bids: any[];
    getStatusColor: (status: string) => string;
}

const AdminBids: React.FC<AdminBidsProps> = ({ bids, getStatusColor }) => {
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
        <div className="card bg-base-100 shadow-xl animate-in fade-in duration-300">
            <div className="card-body p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                    <h2 className="card-title text-xl sm:text-2xl">
                        Bid History
                        <div className="badge badge-accent">{filteredBids.length}</div>
                    </h2>
                    <div className="tabs tabs-boxed w-full lg:w-auto overflow-x-auto">
                        <a 
                            className={`tab ${filter === 'ALL' ? 'tab-active' : ''} text-xs sm:text-sm`} 
                            onClick={() => setFilter('ALL')}
                        >
                            All
                        </a>
                        <a 
                            className={`tab ${filter === 'PENDING' ? 'tab-active' : ''} text-xs sm:text-sm`} 
                            onClick={() => setFilter('PENDING')}
                        >
                            Pending
                        </a>
                        <a 
                            className={`tab ${filter === 'ACCEPTED' ? 'tab-active' : ''} text-xs sm:text-sm`} 
                            onClick={() => setFilter('ACCEPTED')}
                        >
                            Accepted
                        </a>
                        <a 
                            className={`tab ${filter === 'REJECTED' ? 'tab-active' : ''} text-xs sm:text-sm`} 
                            onClick={() => setFilter('REJECTED')}
                        >
                            Rejected
                        </a>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="form-control w-full">
                        <input
                            type="text"
                            placeholder="Search by bid ID, crop, or bidder..."
                            className="input input-bordered input-sm text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="table table-zebra w-full text-xs sm:text-sm">
                        <thead>
                            <tr>
                                <th className="w-16 sm:w-20">Bid ID</th>
                                <th className="min-w-32 sm:min-w-40">Crop</th>
                                <th className="min-w-32 sm:min-w-40">Bidder</th>
                                <th className="w-24 sm:w-28">Amount</th>
                                <th className="w-24 sm:w-28">Status</th>
                                <th className="w-32 sm:w-36">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBids.map(bid => (
                                <tr key={bid.id}>
                                    <th className="font-mono text-xs sm:text-sm">#{bid.id}</th>
                                    <td className="max-w-32 truncate">{bid.cropTitle}</td>
                                    <td className="max-w-32 truncate">{bid.buyerName}</td>
                                    <td className="font-mono font-bold text-primary text-xs sm:text-sm">৳{bid.amount}</td>
                                    <td>
                                        <span className={`badge badge-sm ${getStatusColor(bid.status)}`}>
                                            {bid.status}
                                        </span>
                                    </td>
                                    <td className="text-xs opacity-70 whitespace-nowrap">
                                        {new Date(bid.bidTime).toLocaleDateString()}
                                        <div className="text-xs opacity-50">
                                            {new Date(bid.bidTime).toLocaleTimeString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredBids.length === 0 && (
                    <div className="text-center py-8">
                        <div className="text-lg font-semibold mb-2">No bids found</div>
                        <div className="text-sm opacity-70">
                            {searchTerm || filter !== 'ALL' 
                                ? 'Try adjusting your filters or search terms'
                                : 'No bids have been placed yet'
                            }
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBids;
