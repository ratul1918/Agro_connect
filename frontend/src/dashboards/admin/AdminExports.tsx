import React from 'react';
import { Button } from '../../components/ui/button';

interface AdminExportsProps {
    exportApplications: any[];
    handleExportAction: (id: number, action: 'approve' | 'reject') => void;
    getStatusColor: (status: string) => string;
}

const AdminExports: React.FC<AdminExportsProps> = ({
    exportApplications, handleExportAction, getStatusColor
}) => {
    return (
        <div className="card bg-base-100 shadow-xl overflow-visible animate-in fade-in duration-300">
            <div className="card-body p-0">
                <div className="p-6 border-b">
                    <h2 className="card-title text-2xl">
                        Export Applications
                        <div className="badge badge-info">{exportApplications.length}</div>
                    </h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Application Info</th>
                                <th>Cargo Details</th>
                                <th>Dest.</th>
                                <th>Status</th>
                                <th>Admin Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exportApplications.map(e => (
                                <tr key={e.id} className="hover">
                                    <td>
                                        <div>
                                            <div className="font-bold">{e.farmerName}</div>
                                            <div className="text-xs opacity-50">{e.farmerEmail}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="font-medium">{e.cropDetails}</div>
                                        <div className="badge badge-ghost badge-sm">{e.quantity} kg</div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">🌍</span>
                                            {e.destinationCountry}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`badge ${getStatusColor(e.status)} gap-2`}>
                                            {e.status}
                                        </div>
                                    </td>
                                    <td>
                                        {e.status === 'PENDING' ? (
                                            <div className="join">
                                                <Button
                                                    size="sm"
                                                    className="join-item bg-success hover:bg-success/90 text-white"
                                                    onClick={() => handleExportAction(e.id, 'approve')}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="join-item"
                                                    onClick={() => handleExportAction(e.id, 'reject')}
                                                >
                                                    Reject
                                                </Button>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-gray-500 italic">
                                                {e.adminNotes || 'No notes'}
                                            </span>
                                        )}
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

export default AdminExports;
