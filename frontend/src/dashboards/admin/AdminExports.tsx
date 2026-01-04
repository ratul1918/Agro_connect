import React from 'react';
import { Button } from '../../components/ui/button';
import { Check, X, Globe, Package, User, Ship } from 'lucide-react';

interface AdminExportsProps {
    exportApplications: any[];
    handleExportAction: (id: number, action: 'approve' | 'reject') => void;
}

const AdminExports: React.FC<AdminExportsProps> = ({
    exportApplications, handleExportAction
}) => {
    return (
        <div className="card bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 animate-in fade-in duration-300">
            <div className="card-body p-0">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="card-title text-2xl font-bold text-gray-800 dark:text-white mb-1">
                                Export Applications
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                Manage international export requests
                                <span className="badge badge-primary badge-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border-0">{exportApplications.length} requests</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-200">
                            <tr>
                                <th className="py-4 pl-6">Farmer Info</th>
                                <th className="py-4">Cargo Details</th>
                                <th className="py-4">Destination</th>
                                <th className="py-4">Status</th>
                                <th className="py-4 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700 text-sm">
                            {exportApplications.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12">
                                        <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                            <Ship className="w-12 h-12 mb-3 opacity-20" />
                                            <p className="text-lg font-medium">No export applications found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                exportApplications.map((e) => (
                                    <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="pl-6">
                                            <div className="flex flex-col">
                                                <span className="font-semibold flex items-center gap-1 text-gray-800 dark:text-white">
                                                    <User className="h-3 w-3 text-gray-500" />
                                                    {e.farmerName}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-4">{e.farmerEmail}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex flex-col gap-1">
                                                <div className="font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                    <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                    {e.cropDetails}
                                                </div>
                                                <span className="badge badge-ghost badge-sm font-mono ml-6">
                                                    {e.quantity} kg
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                                <Globe className="h-4 w-4 text-blue-500" />
                                                <span className="font-medium">{e.destinationCountry}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className={`badge ${e.status === 'APPROVED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0' :
                                                    e.status === 'REJECTED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-0' :
                                                    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-0'
                                                } py-2.5 px-3 rounded-lg font-medium`}>
                                                {e.status}
                                            </div>
                                        </td>
                                        <td className="text-right pr-6">
                                            {e.status === 'PENDING' ? (
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 text-white border-none h-8"
                                                        onClick={() => handleExportAction(e.id, 'approve')}
                                                    >
                                                        <Check className="h-3 w-3 mr-1" />
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="h-8"
                                                        onClick={() => handleExportAction(e.id, 'reject')}
                                                    >
                                                        <X className="h-3 w-3 mr-1" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                                                    {e.adminNotes ? `Note: ${e.adminNotes}` : 'No notes'}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminExports;
