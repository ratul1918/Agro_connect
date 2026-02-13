import React, { useState } from 'react';
import { Trash2, Edit, Plus, Filter, Sprout, Search, Package, ArrowUpRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { BASE_URL } from '../../api/axios';

interface AdminCropsProps {
    crops: any[];
    handleDeleteCrop: (id: number) => void;
    handleEditCrop: (crop: any) => void;
    handleStockOut: (id: number) => void;
    handleBackInStock: (id: number) => void;
    handleBulkUpdate: () => void;
    bulkSettings: any;
    setBulkSettings: (settings: any) => void;
    loading: boolean;
}

const AdminCrops: React.FC<AdminCropsProps> = ({
    crops, handleDeleteCrop, handleEditCrop, handleStockOut, handleBackInStock,
    handleBulkUpdate, bulkSettings, setBulkSettings, loading
}) => {
    const [filter, setFilter] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const filteredCrops = crops.filter(c =>
        c.title?.toLowerCase().includes(filter.toLowerCase()) ||
        c.farmerName?.toLowerCase().includes(filter.toLowerCase()) ||
        c.location?.toLowerCase().includes(filter.toLowerCase())
    );

    // Stats for the header
    const totalStock = filteredCrops.reduce((acc, curr) => acc + (curr.quantity || 0), 0);
    const totalValue = filteredCrops.reduce((acc, curr) => acc + ((curr.quantity || 0) * (curr.minPrice || 0)), 0);

    return (
        <div className="space-y-8">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Products', value: filteredCrops.length, icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                    { label: 'Total Stock', value: `${totalStock.toLocaleString()} kg`, icon: Sprout, color: 'text-green-500', bg: 'bg-green-500/10' },
                    { label: 'Inventory Value', value: `৳${totalValue.toLocaleString()}`, icon: ArrowUpRight, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                ].map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="glass-card p-6 rounded-3xl border border-white/20 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl flex items-center justify-between"
                    >
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</h3>
                        </div>
                        <div className={`p-4 rounded-2xl ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Bulk Config & Actions */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card rounded-3xl border border-white/20 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl overflow-hidden"
            >
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Filter className="w-5 h-5 text-green-500" />
                        Bulk Configuration
                    </h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Min Wholesale (kg)</label>
                        <input
                            type="number"
                            className="w-full h-12 px-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-mono"
                            value={bulkSettings.minWholesaleQty}
                            onChange={e => setBulkSettings({ ...bulkSettings, minWholesaleQty: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Min Retail (kg)</label>
                        <input
                            type="number"
                            className="w-full h-12 px-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-mono"
                            value={bulkSettings.minRetailQty}
                            onChange={e => setBulkSettings({ ...bulkSettings, minRetailQty: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">Max Retail (kg)</label>
                        <input
                            type="number"
                            className="w-full h-12 px-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-mono"
                            value={bulkSettings.maxRetailQty}
                            onChange={e => setBulkSettings({ ...bulkSettings, maxRetailQty: parseFloat(e.target.value) })}
                        />
                    </div>
                    <Button
                        onClick={handleBulkUpdate}
                        disabled={loading}
                        className="h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 hover:shadow-green-600/30 transition-all w-full"
                    >
                        {loading ? 'Applying...' : 'Apply to All'}
                    </Button>
                </div>
            </motion.div>

            {/* Main Content Area */}
            <div className="space-y-6">
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, farmer, or location..."
                            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/40 dark:bg-gray-900/40 border border-white/20 dark:border-gray-800 backdrop-blur-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl p-1 rounded-xl border border-white/20 dark:border-gray-800 flex">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                <div className="grid grid-cols-2 gap-0.5 w-5 h-5">
                                    <div className="bg-current rounded-[1px]"></div>
                                    <div className="bg-current rounded-[1px]"></div>
                                    <div className="bg-current rounded-[1px]"></div>
                                    <div className="bg-current rounded-[1px]"></div>
                                </div>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                <div className="flex flex-col gap-0.5 w-5 h-5 justify-center">
                                    <div className="h-0.5 w-full bg-current rounded-full"></div>
                                    <div className="h-0.5 w-full bg-current rounded-full"></div>
                                    <div className="h-0.5 w-full bg-current rounded-full"></div>
                                </div>
                            </button>
                        </div>
                        <Button
                            onClick={() => window.location.href = '/admin#add-product'}
                            className="h-12 px-6 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                        >
                            <Plus className="w-5 h-5 mr-2" /> Add Product
                        </Button>
                    </div>
                </div>

                {/* Grid View */}
                {viewMode === 'grid' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <AnimatePresence>
                            {filteredCrops.map((crop, idx) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                                    key={crop.id}
                                    className="relative glass-card rounded-3xl border border-white/20 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all overflow-hidden"
                                >
                                    {/* Image */}
                                    <div className="group h-48 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                                        {/* Action Overlay - Only on image area */}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex items-center justify-center gap-3 backdrop-blur-sm pointer-events-none group-hover:pointer-events-auto">
                                            <button
                                                onClick={() => handleEditCrop(crop)}
                                                className="p-3 bg-white text-gray-900 rounded-xl hover:scale-110 transition-transform shadow-lg"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCrop(crop.id)}
                                                className="p-3 bg-red-500 text-white rounded-xl hover:scale-110 transition-transform shadow-lg"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        {crop.images && crop.images.length > 0 ? (
                                            <img
                                                src={crop.images[0].startsWith('http') ? crop.images[0] : `${BASE_URL}${crop.images[0]}`}
                                                alt={crop.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                onError={(e) => {
                                                    e.currentTarget.src = '';
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                                                <Sprout className="w-12 h-12" />
                                            </div>
                                        )}
                                        <div className="absolute top-4 right-4 z-10">
                                            {crop.isSold ? (
                                                <span className="px-3 py-1 bg-red-500/90 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-md">
                                                    Sold Out
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-green-500/90 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-md">
                                                    In Stock
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 space-y-3">
                                        <div>
                                            <div className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">
                                                {crop.cropTypeName}
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-tight">
                                                {crop.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                by {crop.farmerName}
                                            </p>
                                        </div>

                                        <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                                            <div>
                                                <p className="text-xs text-gray-500 mb-0.5">Price</p>
                                                <p className="font-bold text-gray-900 dark:text-white">৳{crop.minPrice} <span className="text-xs font-normal text-gray-500">/{crop.unit}</span></p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500 mb-0.5">Stock</p>
                                                <p className="font-bold text-gray-900 dark:text-white">{crop.quantity} {crop.unit}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                crop.isSold ? handleBackInStock(crop.id) : handleStockOut(crop.id);
                                            }}
                                            className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer ${crop.isSold
                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
                                                : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800'
                                                }`}
                                        >
                                            {crop.isSold ? '✓ Mark as In Stock' : '✗ Mark as Stock Out'}
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <div className="glass-card rounded-3xl border border-white/20 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-xl overflow-hidden p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-100 dark:border-gray-800">
                                    <tr className="text-left text-sm text-gray-500 dark:text-gray-400">
                                        <th className="pb-4 pl-4">Product</th>
                                        <th className="pb-4">Farmer</th>
                                        <th className="pb-4">Stock</th>
                                        <th className="pb-4">Price</th>
                                        <th className="pb-4 text-center">Status</th>
                                        <th className="pb-4 text-right pr-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {filteredCrops.map((crop) => (
                                        <tr key={crop.id} className="group hover:bg-white/50 dark:hover:bg-gray-800/50 transition-colors">
                                            <td className="py-4 pl-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
                                                        {crop.images && crop.images.length > 0 ? (
                                                            <img src={crop.images[0].startsWith('http') ? crop.images[0] : `${BASE_URL}${crop.images[0]}`} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center"><Sprout className="w-6 h-6 text-gray-300" /></div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white">{crop.title}</div>
                                                        <div className="text-xs text-gray-500">{crop.cropTypeName}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 text-sm text-gray-600 dark:text-gray-300">{crop.farmerName}</td>
                                            <td className="py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">{crop.quantity} {crop.unit}</td>
                                            <td className="py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">৳{crop.minPrice}</td>
                                            <td className="py-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${crop.isSold
                                                    ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                                    : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                                                    }`}>
                                                    {crop.isSold ? 'Sold Out' : 'active'}
                                                </span>
                                            </td>
                                            <td className="py-4 text-right pr-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleEditCrop(crop)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-blue-600 transition-colors">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteCrop(crop.id)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-red-600 transition-colors">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCrops;
