import React, { useState } from 'react';
import { addCrop } from '../../api/endpoints';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { useNotification } from '../../context/NotificationContext';
import { ShoppingBag } from 'lucide-react';

interface AdminAddRetailProps {
    onSuccess: () => void;
}

const AdminAddRetail: React.FC<AdminAddRetailProps> = ({ onSuccess }) => {
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
        setLoading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('cropTypeId', formData.cropTypeId);
        data.append('quantity', formData.quantity);
        data.append('unit', formData.unit);
        data.append('minPrice', formData.minPrice);
        data.append('location', formData.location);
        data.append('marketType', 'RETAIL'); // Mark as retail

        if (images) {
            for (let i = 0; i < images.length; i++) {
                data.append('images', images[i]);
            }
        }

        try {
            // Using /api/shop/products for retail-specific endpoint
            await addCrop(data);
            success('Retail product added successfully!');
            setFormData({ title: '', description: '', cropTypeId: '1', quantity: '', unit: 'kg', minPrice: '', location: '' });
            setImages(null);
            onSuccess();
        } catch (err: any) {
            error(err.message || 'Failed to add retail product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="card bg-base-100 shadow-xl max-w-3xl border-l-4 border-orange-500">
                <div className="card-body">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-orange-100 rounded-lg">
                            <ShoppingBag className="w-8 h-8 text-orange-600" />
                        </div>
                        <div>
                            <h2 className="card-title text-2xl text-orange-700">Add Retail Product</h2>
                            <p className="text-sm text-base-content/60">Add products for retail marketplace (100gm - 10kg)</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Product Name</span>
                            </label>
                            <Input
                                placeholder="e.g., Premium Basmati Rice"
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
                                placeholder="Product details, quality, origin..."
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
                                    <span className="label-text font-medium">Quantity (Retail)</span>
                                    <span className="label-text-alt text-orange-600">Max 10kg</span>
                                </label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    placeholder="1.5"
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
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
                                    <option value="gm">Gram (gm)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">Price (৳ per unit)</span>
                                </label>
                                <Input
                                    type="number"
                                    placeholder="150"
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

                        <div className="alert alert-warning bg-orange-50 border-orange-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            <span className="text-orange-800">Retail products are for small quantities (100gm - 10kg)</span>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                            disabled={loading}
                        >
                            {loading ? 'Adding Product...' : 'Add Retail Product'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminAddRetail;
