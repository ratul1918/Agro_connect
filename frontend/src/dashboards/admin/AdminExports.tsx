import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Check, X, Globe, Package, User, Ship, Search, Calendar, MapPin, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminExportsProps {
    exportApplications: any[];
    handleExportAction: (id: number, action: 'approve' | 'reject') => void;
}

const AdminExports: React.FC<AdminExportsProps> = ({
    exportApplications, handleExportAction
}) => {
    const [filter, setFilter] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredApplications = exportApplications.filter(app => {
        const matchesStatus = filter === 'ALL' || app.status === filter;
        const matchesSearch = app.farmerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.destinationCountry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.cropDetails?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const pendingCount = exportApplications.filter(a => a.status === 'PENDING').length;

    return (
        <div className="space-y-8">
            {/* Header Stats */}
            <div className="glass-card rounded-3xl border border-white/20 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Ship className="w-8 h-8 text-cyan-500" />
                            Export Crops
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">
                            Manage international trade requests and shipping manifests.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <div className="px-6 py-4 rounded-2xl bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-100 dark:border-cyan-800">
                            <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">Pending Requests</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{pendingCount}</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="mt-8 flex flex-col md:flex-row gap-4 justify-between items-end">
                    <div className="flex bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl">
                        {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${filter === status
                                    ? 'bg-white dark:bg-gray-700 text-cyan-600 shadow-sm'
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
                            placeholder="Search country, farmer, product..."
                            className="w-full h-10 pl-10 pr-4 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Applications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredApplications.map((app, idx) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2, delay: idx * 0.05 }}
                            key={app.id}
                            className="group glass-card rounded-3xl border border-white/20 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden flex flex-col"
                        >
                            {/* Card Header (Decorated) */}
                            <div className="h-2 w-full bg-gradient-to-r from-cyan-400 to-blue-500"></div>

                            <div className="p-6 flex-1 flex flex-col gap-6">
                                {/* Header Info */}
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 font-bold border border-cyan-100 dark:border-cyan-800">
                                            {app.farmerName?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white leading-tight">{app.farmerName}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{app.farmerEmail}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${app.status === 'APPROVED' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800' :
                                        app.status === 'REJECTED' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' :
                                            'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                                        }`}>
                                        {app.status}
                                    </span>
                                </div>

                                {/* Cargo Manifest */}
                                <div className="bg-gray-50/50 dark:bg-gray-800/30 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50">
                                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-100 dark:border-gray-700/50 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                                        <FileText className="w-3 h-3" /> Shipping Manifest
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <Package className="w-4 h-4 text-cyan-500" />
                                                Cargo
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white">{app.cropDetails}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <Globe className="w-4 h-4 text-blue-500" />
                                                Destination
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white">{app.destinationCountry}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                <MapPin className="w-4 h-4 text-orange-500" />
                                                Weight
                                            </div>
                                            <span className="font-mono font-bold text-gray-900 dark:text-white bg-white dark:bg-gray-700 px-2 py-0.5 rounded shadow-sm">
                                                {app.quantity} kg
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Footer */}
                            <div className="p-4 bg-gray-50/50 dark:bg-black/20 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
                                {app.status === 'PENDING' ? (
                                    <>
                                        <Button
                                            onClick={() => handleExportAction(app.id, 'reject')}
                                            className="bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 border border-gray-200 dark:border-gray-700 shadow-sm"
                                        >
                                            <X className="w-4 h-4 mr-2" /> Reject
                                        </Button>
                                        <Button
                                            onClick={() => handleExportAction(app.id, 'approve')}
                                            className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-600/20"
                                        >
                                            <Check className="w-4 h-4 mr-2" /> Approve
                                        </Button>
                                    </>
                                ) : (
                                    <div className="w-full text-center">
                                        {app.adminNotes ? (
                                            <p className="text-xs text-gray-500 italic">" {app.adminNotes} "</p>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">No additional notes</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredApplications.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Ship className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">No applications found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Try adjusting your filters or search terms.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminExports;
