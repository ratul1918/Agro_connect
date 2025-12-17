import React from 'react';

interface AdminBidsProps {
    bids: any[];
    getStatusColor: (status: string) => string;
}

const AdminBids: React.FC<AdminBidsProps> = ({ bids, getStatusColor }) => {
    return (
        <div className="card bg-base-100 shadow-xl animate-in fade-in duration-300">
            <div className="card-body">
                <h2 className="card-title text-2xl mb-4">
                    Bid History
                    <div className="badge badge-accent">{bids.length}</div>
                </h2>

                <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                        <thead>
                            <tr>
                                <th>Bid ID</th>
                                <th>Crop</th>
                                <th>Bidder</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bids.map(bid => (
                                <tr key={bid.id}>
                                    <th>{bid.id}</th>
                                    <td>{bid.cropTitle}</td>
                                    <td>{bid.buyerName}</td>
                                    <td className="font-mono font-bold text-primary">৳{bid.amount}</td>
                                    <td>
                                        <span className={`badge ${getStatusColor(bid.status)}`}>
                                            {bid.status}
                                        </span>
                                    </td>
                                    <td className="text-xs opacity-70">
                                        {new Date(bid.bidTime).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminBids;
