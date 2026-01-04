import React, { useState } from 'react';
import { Trash2, Edit, Plus, Filter, XCircle, CheckCircle, Sprout, Search } from 'lucide-react';
import { Button } from '../../components/ui/button';

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

    const filteredCrops = crops.filter(c =>
        c.title?.toLowerCase().includes(filter.toLowerCase()) ||
        c.farmerName?.toLowerCase().includes(filter.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            {/* Bulk Actions Card */}
            <div className="card bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="card-body p-6">
                    <h2 className="card-title text-lg flex items-center gap-2 text-gray-800 dark:text-white mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Filter className="w-5 h-5 text-primary" />
                        </div>
                        Bulk Configuration
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        <div className="form-control w-full">
                            <label className="label pt-0">
                                <span className="label-text font-medium text-gray-600 dark:text-gray-400">Min Wholesale (kg)</span>
                            </label>
                            <input
                                type="number"
                                className="input input-bordered w-full bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary/50"
                                value={bulkSettings.minWholesaleQty}
                                onChange={e => setBulkSettings({ ...bulkSettings, minWholesaleQty: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="form-control w-full">
                            <label className="label pt-0">
                                <span className="label-text font-medium text-gray-600 dark:text-gray-400">Min Retail (kg)</span>
                            </label>
                            <input
                                type="number"
                                className="input input-bordered w-full bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary/50"
                                value={bulkSettings.minRetailQty}
                                onChange={e => setBulkSettings({ ...bulkSettings, minRetailQty: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="form-control w-full">
                            <label className="label pt-0">
                                <span className="label-text font-medium text-gray-600 dark:text-gray-400">Max Retail (kg)</span>
                            </label>
                            <input
                                type="number"
                                className="input input-bordered w-full bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary/50"
                                value={bulkSettings.maxRetailQty}
                                onChange={e => setBulkSettings({ ...bulkSettings, maxRetailQty: parseFloat(e.target.value) })}
                            />
                        </div>
                        <Button
                            onClick={handleBulkUpdate}
                            disabled={loading}
                            className="bg-primary hover:bg-primary/90 text-white w-full h-[48px]"
                        >
                            {loading ? 'Applying...' : 'Apply to All'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Crops Table */}
            <div className="card bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="card-body p-0">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                            <div>
                                <h2 className="text-xl font-bold dark:text-white">Crop Listings</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Manage all available crops</p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                            <div className="relative w-full sm:w-64">
                                <input
                                    className="input input-bordered w-full pl-10 bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary/50"
                                    placeholder="Search crops..."
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                />
                                <Search className="w-4 h-4 absolute left-3 top-3.5 text-gray-400" />
                            </div>
                            <button
                                className="btn btn-primary gap-2 w-full sm:w-auto text-white shadow-lg shadow-primary/30"
                                onClick={() => window.location.href = '/admin#add-product'}
                            >
                                <Plus className="w-4 h-4" /> Add Product
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-200">
                                <tr>
                                    <th className="py-4 pl-6 w-[30%]">Product</th>
                                    <th className="py-4 w-[20%]">Farmer</th>
                                    <th className="py-4 w-[15%]">Stock</th>
                                    <th className="py-4 w-[10%]">Price/Unit</th>
                                    <th className="py-4 w-[15%] text-center">Status</th>
                                    <th className="py-4 pr-6 w-[10%] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredCrops.map(crop => (
                                    <tr key={crop.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
                                        <td className="pl-6">
                                            <div className="flex items-center gap-3">
                                                <div className="avatar placeholder">
                                                    <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl w-10 h-10 flex items-center justify-center ring-1 ring-green-200 dark:ring-green-800">
                                                        <Sprout className="w-5 h-5" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800 dark:text-white break-words">{crop.title}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{crop.cropTypeName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="font-medium text-gray-700 dark:text-gray-300 break-words">{crop.farmerName}</div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="radial-progress text-primary text-[10px] flex-shrink-0 bg-primary/10 dark:bg-primary/20" 
                                                    style={{ 
                                                        "--value": Math.min(100, (crop.quantity / 100) * 100), 
                                                        "--size": "2rem",
                                                        "--thickness": "3px" 
                                                    } as React.CSSProperties}
                                                >
                                                    {crop.quantity}
                                                </div>
                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap">{crop.unit}</span>
                                            </div>
                                        </td>
                                        <td className="font-mono font-semibold text-gray-700 dark:text-gray-300 whitespace-nowrap">৳{crop.minPrice}</td>
                                        <td className="text-center">
                                            {crop.isSold ? (
                                                <button
                                                    className="btn btn-xs btn-error btn-outline gap-1 w-24"
                                                    onClick={() => handleBackInStock(crop.id)}
                                                >
                                                    <XCircle className="w-3 h-3" />
                                                    Sold Out
                                                </button>
                                            ) : (
                                                <button
                                                    className="btn btn-xs btn-success btn-outline gap-1 w-24"
                                                    onClick={() => handleStockOut(crop.id)}
                                                >
                                                    <CheckCircle className="w-3 h-3" />
                                                    In Stock
                                                </button>
                                            )}
                                        </td>
                                        <td className="text-right pr-6">
                                            <div className="join justify-end">
                                                <button
                                                    className="btn btn-sm btn-ghost btn-square text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                    onClick={() => handleEditCrop(crop)}
                                                    title="Edit Product"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-ghost btn-square text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    onClick={() => handleDeleteCrop(crop.id)}
                                                    title="Delete Product"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCrops.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12">
                                            <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                                <Sprout className="w-12 h-12 mb-3 opacity-20" />
                                                <p className="text-lg font-medium">No crops found</p>
                                                <p className="text-sm">Try searching for a different product</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCrops;
