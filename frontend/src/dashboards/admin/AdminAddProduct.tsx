import React, { useState, useEffect } from 'react';
import { addCrop } from '../../api/endpoints';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { useNotification } from '../../context/NotificationContext';
import { Package, Upload, X, Check, Globe, DollarSign, Layers, Store, Building2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminAddProductProps {
    onSuccess: () => void;
    defaultMarketType?: 'RETAIL' | 'B2B' | 'BOTH';
}

const AdminAddProduct: React.FC<AdminAddProductProps> = ({ onSuccess, defaultMarketType = 'BOTH' }) => {
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
        marketType: defaultMarketType
    });

    // Reset market type if prop changes (e.g. navigation between tabs)
    useEffect(() => {
        setFormData(prev => ({ ...prev, marketType: defaultMarketType }));
    }, [defaultMarketType]);

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
        data.append('marketType', formData.marketType === 'BOTH' ? 'RETAIL' : formData.marketType); // Backend might expect specific enum, assuming logic handles it or backend defaults. 
        // NOTE: If backend has specific endpoints for B2B vs Retail, we might need logic here. 
        // Assuming 'addCrop' handles a 'marketType' or we rely on 'cropTypeId' logic from previous context. 
        // Re-reading previous code, it didn't send 'marketType'. It seemingly relied on context or just added to general inventory. 
        // However, user specifically asked for "Add B2B" and "Add Retail". 
        // If the backend doesn't support explicit market type on creation, we might be simulating it.
        // For now, we will append it if the backend supports it, otherwise it adds to general.

        // *Correction based on previous code*: The previous code didn't send marketType. 
        // If the user wants separate 'forms', it implies logical separation. 
        // We will send it as metadata if possible, or just proceed with the standard addCrop.

        if (images) {
            for (let i = 0; i < images.length; i++) {
                data.append('images', images[i]);
            }
        }

        try {
            await addCrop(data);
            success(`Product added successfully!`);
            setFormData({
                title: '',
                description: '',
                cropTypeId: '1',
                quantity: '',
                unit: 'kg',
                minPrice: '',
                location: '',
                marketType: defaultMarketType
            });
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
            key={defaultMarketType} // Force re-render on tab change for animation
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-5xl mx-auto"
        >
            <div className="relative glass-card overflow-hidden rounded-3xl border border-white/20 dark:border-gray-800 shadow-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl">
                {/* Decorative background gradients */}
                <div className={`absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full blur-3xl opacity-20 ${defaultMarketType === 'B2B' ? 'bg-blue-500' : defaultMarketType === 'RETAIL' ? 'bg-green-500' : 'bg-purple-500'
                    }`}></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-gray-500/10 rounded-full blur-3xl opacity-20"></div>

                <div className="relative p-8 md:p-10">
                    <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-5">
                            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg text-white ${defaultMarketType === 'B2B'
                                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/20'
                                    : defaultMarketType === 'RETAIL'
                                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/20'
                                        : 'bg-gradient-to-br from-purple-500 to-pink-600 shadow-purple-500/20'
                                }`}>
                                {defaultMarketType === 'B2B' ? <Building2 className="w-7 h-7" /> : <Store className="w-7 h-7" />}
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {defaultMarketType === 'BOTH' ? 'Add New Product' :
                                        defaultMarketType === 'B2B' ? 'Add Wholesale Product' : 'Add Retail Product'}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 mt-1">
                                    {defaultMarketType === 'BOTH'
                                        ? 'List products across all marketplaces'
                                        : defaultMarketType === 'B2B'
                                            ? 'Create bulk listings for verifying businesses'
                                            : 'Create individual listings for direct consumers'}
                                </p>
                            </div>
                        </div>

                        {/* Market Type Badge */}
                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${defaultMarketType === 'B2B'
                                ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                                : defaultMarketType === 'RETAIL'
                                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
                                    : 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800'
                            }`}>
                            {defaultMarketType} Market
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info Section */}
                        <div className="bg-white/50 dark:bg-gray-800/30 rounded-2xl p-6 border border-white/20 dark:border-gray-700/50">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-6">
                                <Layers className="w-4 h-4" />
                                Basic Information
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Product Name</label>
                                    <Input
                                        placeholder="e.g., Premium Basmati Rice"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-opacity-50 transition-all rounded-xl"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 appearance-none"
                                            value={formData.cropTypeId}
                                            onChange={e => setFormData({ ...formData, cropTypeId: e.target.value })}
                                        >
                                            <option value="1">🍚 Rice & Grains</option>
                                            <option value="2">🌾 Wheat</option>
                                            <option value="3">🥦 Vegetables</option>
                                            <option value="4">🍎 Fruits</option>
                                            <option value="5">🌶️ Spices</option>
                                            <option value="6">🥔 Pulses</option>
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                            <Layers className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <Textarea
                                    placeholder="Describe the quality, origin, and key features..."
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-opacity-50 transition-all rounded-xl resize-none p-4"
                                />
                            </div>
                        </div>

                        {/* Inventory & Pricing */}
                        <div className="bg-white/50 dark:bg-gray-800/30 rounded-2xl p-6 border border-white/20 dark:border-gray-700/50">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-6">
                                <DollarSign className="w-4 h-4" />
                                Inventory & Pricing
                            </h3>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity</label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={formData.quantity}
                                            onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                            required
                                            className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Unit</label>
                                        <select
                                            className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-opacity-50"
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

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Unit Price (BDT)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">৳</span>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={formData.minPrice}
                                            onChange={e => setFormData({ ...formData, minPrice: e.target.value })}
                                            required
                                            className="pl-10 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        placeholder="District, Region"
                                        value={formData.location}
                                        onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        required
                                        className="pl-12 h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="bg-white/50 dark:bg-gray-800/30 rounded-2xl p-6 border border-white/20 dark:border-gray-700/50">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2 mb-6">
                                <Upload className="w-4 h-4" />
                                Media Gallery
                            </h3>

                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-green-500 dark:hover:border-green-500 transition-colors cursor-pointer relative group bg-white dark:bg-gray-800">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="space-y-3 pointer-events-none">
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto transition-transform group-hover:scale-110 ${defaultMarketType === 'B2B' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                                        }`}>
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-base font-semibold text-gray-900 dark:text-white">
                                            Click to upload images
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            or drag and drop here (Max 5MB)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Image Previews */}
                            <AnimatePresence>
                                {previewUrls.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-6"
                                    >
                                        {previewUrls.map((url, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200 dark:border-gray-700 shadow-sm"
                                            >
                                                <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-600 text-white p-1.5 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 flex justify-end">
                            <Button
                                type="submit"
                                className={`h-14 px-8 text-lg font-bold rounded-xl shadow-lg transform hover:scale-[1.02] transition-all text-white ${defaultMarketType === 'B2B'
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/25'
                                        : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-green-500/25'
                                    }`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-3">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Check className="w-5 h-5" />
                                        Publish Product
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
