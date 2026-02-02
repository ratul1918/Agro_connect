import React, { useState } from 'react';
import { addCrop } from '../../api/endpoints';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { useNotification } from '../../context/NotificationContext';
import { Package, Upload, X, Check, Globe, DollarSign, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(e.target.files);
            const urls = Array.from(e.target.files).map(file => URL.createObjectURL(file));
            setPreviewUrls(urls);
        }
    };

    const removeImage = (index: number) => {
        // Note: validating FileList manipulation is complex in React/JS without creating a new DataTransfer
        // For simple preview removal, we just clear previews. In a real app we'd manage a separate file array.
        setImages(null);
        setPreviewUrls([]);
    };

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
            setPreviewUrls([]);
            onSuccess();
        } catch (err: any) {
            error(err.message || 'Failed to add product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl mx-auto"
        >
            <div className="relative glass-card overflow-hidden rounded-3xl border border-white/20 dark:border-gray-800 shadow-2xl">
                {/* Decorative background gradients */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>

                <div className="relative p-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20 text-white">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Product</h2>
                            <p className="text-gray-500 dark:text-gray-400">List products on Retail and B2B marketplaces</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info Section */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <Layers className="w-4 h-4" />
                                Basic Information
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</label>
                                    <Input
                                        placeholder="e.g., Premium Basmati Rice"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                    <select
                                        className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
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
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <Textarea
                                    placeholder="Describe the quality, origin, and key features..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 transition-all resize-none"
                                />
                            </div>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-800/50 my-6"></div>

                        {/* Inventory & Pricing */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                Inventory & Pricing
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={formData.quantity}
                                            onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                            required
                                            className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Unit</label>
                                        <select
                                            className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                            value={formData.unit}
                                            onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                        >
                                            <option value="kg">kg</option>
                                            <option value="ton">ton</option>
                                            <option value="maund">maund</option>
                                            <option value="pcs">pcs</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Unit Price (BDT)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500">৳</span>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={formData.minPrice}
                                            onChange={e => setFormData({ ...formData, minPrice: e.target.value })}
                                            required
                                            className="pl-8 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                    <Input
                                        placeholder="District, Region"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        required
                                        className="pl-9 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-800/50 my-6"></div>

                        {/* Image Upload */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Media
                            </h3>

                            <div className="bg-white/50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center hover:border-green-500/50 transition-colors cursor-pointer relative group">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="space-y-2 pointer-events-none">
                                    <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                        <Upload className="w-6 h-6" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        SVG, PNG, JPG or GIF (max. 5MB)
                                    </p>
                                </div>
                            </div>

                            {/* Image Previews */}
                            <AnimatePresence>
                                {previewUrls.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="grid grid-cols-4 gap-4 mt-4"
                                    >
                                        {previewUrls.map((url, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group border border-gray-200 dark:border-gray-700">
                                                <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <Button
                                type="submit"
                                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 transform hover:translate-y-[-2px] transition-all"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Adding Product...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Check className="w-5 h-5" />
                                        Add Product to Marketplace
                                    </span>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </motion.div>
    );
};

export default AdminAddProduct;
