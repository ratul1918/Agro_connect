import React, { useState } from 'react';
import { addCrop } from '../../api/endpoints';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { useNotification } from '../../context/NotificationContext';
import { Package } from 'lucide-react';

interface AdminAddProductProps {
    onSuccess: () => void;
}

const AdminAddProduct: React.FC<AdminAddProductProps> = ({ onSuccess }) => {
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
        marketType: 'BOTH' // RETAIL, B2B, or BOTH
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

        if (images) {
            for (let i = 0; i < images.length; i++) {
                data.append('images', images[i]);
            }
        }

        try {
            await addCrop(data);
            success(`Product added to ${formData.marketType} marketplace!`);
            setFormData({ title: '', description: '', cropTypeId: '1', quantity: '', unit: 'kg', minPrice: '', location: '', marketType: 'BOTH' });
            setImages(null);
            onSuccess();
        } catch (err: any) {
            error(err.message || 'Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="card bg-base-100 shadow-xl max-w-3xl">
                <div className="card-body">
                    <div className="flex items-center gap-3 mb-4">
                        <Package className="w-8 h-8 text-primary" />
                        <div>
                            <h2 className="card-title text-2xl">Add Product</h2>
                            <p className="text-sm text-base-content/60">Add products to Retail and/or B2B marketplace</p>
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
                                    <span className="label-text font-medium">Quantity</span>
                                </label>
                                <Input
                                    type="number"
                                    placeholder="100"
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
                                    <option value="ton">Ton</option>
                                    <option value="maund">Maund</option>
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

                        <div className="alert alert-info">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            <span>Products will be available in both Retail and B2B marketplaces</span>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90"
                            disabled={loading}
                        >
                            {loading ? 'Adding Product...' : 'Add Product'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminAddProduct;
