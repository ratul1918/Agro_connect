import React, { useState } from 'react';
import { Trash2, Edit, Plus, Filter } from 'lucide-react';
import { Button } from '../../components/ui/button';

interface AdminCropsProps {
    crops: any[];
    handleDeleteCrop: (id: number) => void;
    handleEditCrop: (crop: any) => void;
    handleBulkUpdate: () => void;
    bulkSettings: any;
    setBulkSettings: (settings: any) => void;
    loading: boolean;
}

const AdminCrops: React.FC<AdminCropsProps> = ({
    crops, handleDeleteCrop, handleEditCrop,
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
            <div className="card bg-base-100 shadow-lg border-l-4 border-primary">
                <div className="card-body">
                    <h2 className="card-title text-lg flex items-center gap-2">
                        <Filter className="w-5 h-5 text-primary" />
                        Bulk Configuration
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mt-2">
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text">Min Wholesale (kg)</span>
                            </label>
                            <input
                                type="number"
                                className="input input-bordered input-sm w-full"
                                value={bulkSettings.minWholesaleQty}
                                onChange={e => setBulkSettings({ ...bulkSettings, minWholesaleQty: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text">Min Retail (kg)</span>
                            </label>
                            <input
                                type="number"
                                className="input input-bordered input-sm w-full"
                                value={bulkSettings.minRetailQty}
                                onChange={e => setBulkSettings({ ...bulkSettings, minRetailQty: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text">Max Retail (kg)</span>
                            </label>
                            <input
                                type="number"
                                className="input input-bordered input-sm w-full"
                                value={bulkSettings.maxRetailQty}
                                onChange={e => setBulkSettings({ ...bulkSettings, maxRetailQty: parseFloat(e.target.value) })}
                            />
                        </div>
                        <Button
                            onClick={handleBulkUpdate}
                            disabled={loading}
                            className="bg-primary hover:bg-primary/90 text-white w-full"
                        >
                            {loading ? 'Applying...' : 'Apply to All'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Crops Table */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body p-0">
                    <div className="p-4 border-b flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h2 className="text-xl font-bold">Crop Listings</h2>
                            <div className="join">
                                <input
                                    className="input input-bordered input-sm join-item w-48"
                                    placeholder="Search crops..."
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                />
                            </div>
                        </div>
                        <button
                            className="btn btn-primary btn-sm gap-2"
                            onClick={() => window.location.href = '/admin#add-product'}
                        >
                            <Plus className="w-4 h-4" /> Add Product (Retail/B2B)
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="table table-zebra table-pin-rows">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Farmer</th>
                                    <th>Stock</th>
                                    <th>Price/Unit</th>
                                    <th className="text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCrops.map(crop => (
                                    <tr key={crop.id} className="hover">
                                        <td>
                                            <div className="font-bold">{crop.title}</div>
                                            <div className="text-xs badge badge-ghost badge-sm">{crop.cropTypeName}</div>
                                        </td>
                                        <td>{crop.farmerName}</td>
                                        <td>
                                            <div className="radial-progress text-primary text-[10px]" style={{ "--value": Math.min(100, (crop.quantity / 100) * 100), "--size": "2rem" } as any}>
                                                {crop.quantity}
                                            </div>
                                            <span className="ml-2 text-xs">{crop.unit}</span>
                                        </td>
                                        <td className="font-mono">৳{crop.minPrice}</td>
                                        <td className="text-right">
                                            <div className="join">
                                                <button
                                                    className="btn btn-square btn-sm btn-ghost join-item text-primary"
                                                    onClick={() => handleEditCrop(crop)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    className="btn btn-square btn-sm btn-ghost join-item text-error"
                                                    onClick={() => handleDeleteCrop(crop.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCrops.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 opacity-50">No crops found</td>
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
