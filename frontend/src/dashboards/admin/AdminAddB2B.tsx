import React, { useState } from 'react';
import { addCrop } from '../../api/endpoints';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { useNotification } from '../../context/NotificationContext';
import { Warehouse } from 'lucide-react';

interface AdminAddB2BProps {
    onSuccess: () => void;
}

const AdminAddB2B: React.FC<AdminAddB2BProps> = ({ onSuccess }) => {
    const { success, error } = useNotification();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        cropTypeId: '1',
        quantity: '',
        unit: 'kg',
        minPrice: '',
        location: '',
    });
    const [images, setImages] = useState<FileList | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate minimum quantity for B2B
        const qty = parseFloat(formData.quantity);
        if (qty < 80) {
            error('B2B products must have minimum 80kg quantity');
            return;
        }

        setLoading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('cropTypeId', formData.cropTypeId);
        data.append('quantity', formData.quantity);
        data.append('unit', formData.unit);
        data.append('minPrice', formData.minPrice);
        data.append('location', formData.location);
        data.append('marketType', 'B2B'); // Mark as B2B

        if (images) {
            for (let i = 0; i < images.length; i++) {
                data.append('images', images[i]);
            }
        }

        try {
            await addCrop(data);
            success('B2B product added successfully!');
            setFormData({ title: '', description: '', cropTypeId: '1', quantity: '', unit: 'kg', minPrice: '', location: '' });
            setImages(null);
            onSuccess();
        } catch (err: any) {
            error(err.message || 'Failed to add B2B product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="card bg-base-100 shadow-xl max-w-3xl border-l-4 border-blue-500">
                <div className="card-body">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Warehouse className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="card-title text-2xl text-blue-700">Add B2B Product</h2>
                            <p className="text-sm text-base-content/60">Add wholesale products for B2B marketplace (min 80kg)</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Product Name</span>
                            </label>
                            <Input
                                placeholder="e.g., Premium Basmati Rice (Bulk)"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Description</span>
                            </label>
                            <Textarea
                                placeholder="Product details, quality, bulk specifications..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Category</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={formData.cropTypeId}
                                    onChange={e => setFormData({ ...formData, cropTypeId: e.target.value })}
                                >
                                    <option value="1">Rice & Grains</option>
                                    <option value="2">Wheat</option>
                                    <option value="3">Vegetables</option>
                                    <option value="4">Fruits</option>
                                    <option value="5">Spices</option>
                                    <option value="6">Pulses</option>
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Quantity (Wholesale)</span>
                                    <span className="label-text-alt text-blue-600">Min 80kg</span>
                                </label>
                                <Input
                                    type="number"
                                    placeholder="100"
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                    min="80"
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Unit</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={formData.unit}
                                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                >
                                    <option value="kg">Kilogram (kg)</option>
                                    <option value="ton">Ton</option>
                                    <option value="maund">Maund</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Wholesale Price (৳ per unit)</span>
                                </label>
                                <Input
                                    type="number"
                                    placeholder="5000"
                                    value={formData.minPrice}
                                    onChange={e => setFormData({ ...formData, minPrice: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Location</span>
                                </label>
                                <Input
                                    placeholder="District/Region"
                                    value={formData.location}
                                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Product Images</span>
                            </label>
                            <Input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={e => setImages(e.target.files)}
                                className="file-input file-input-bordered w-full"
                            />
                            <label className="label">
                                <span className="label-text-alt">Max 5 images, JPG/PNG</span>
                            </label>
                        </div>

                        <div className="alert alert-info bg-blue-50 border-blue-200">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6 text-blue-600"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span className="text-blue-800">B2B products are for wholesale/bulk orders (minimum 80kg)</span>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={loading}
                        >
                            {loading ? 'Adding Product...' : 'Add B2B Product'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminAddB2B;
