import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Filter, Package, Plus } from 'lucide-react';
import axios from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import BidModal from '../components/BidModal';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import ProductCard, { Product } from '../components/marketplace/ProductCard';

interface Crop extends Product {
    wholesalePrice?: number;
    minWholesaleQty?: number;
    createdAt?: string; // Optional if not used
}

const B2BMarketplacePage: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [crops, setCrops] = useState<Crop[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [showBidModal, setShowBidModal] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);

    const isFarmer = user?.role === 'ROLE_FARMER';
    const isBuyer = user?.role === 'ROLE_BUYER';
    const isAdmin = user?.role === 'ROLE_ADMIN';
    const canAddProduct = isFarmer || isAdmin;

    const categories = [
        "All", "Rice & Grains", "Vegetables", "Fruits", "Spices", "Pulses", "Fish"
    ];

    const districts = [
        "All Districts", "Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur"
    ];

    useEffect(() => {
        fetchCrops();
    }, [selectedCategory, selectedDistrict]);

    const fetchCrops = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/crops', { params: { marketplaceType: 'B2B' } });
            setCrops(res.data);
        } catch (error) {
            console.error('Error fetching B2B crops:', error);
            setCrops([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredCrops = crops.filter(crop => {
        const matchesSearch = crop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            crop.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || selectedCategory === 'All' ||
            crop.cropTypeName === selectedCategory;
        const matchesDistrict = !selectedDistrict || selectedDistrict === 'All Districts' ||
            crop.location === selectedDistrict;
        return matchesSearch && matchesCategory && matchesDistrict;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100
            }
        }
    };

    const handleAction = (product: Product) => {
        // cast product to Crop if necessary, though ProductCard passes Product
        // For B2B, action is "Bid"
        setSelectedCrop(product as Crop);
        setShowBidModal(true);
    };

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            {/* Glassmorphism Header */}
            <div className="relative pt-24 pb-12 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-900/20"></div>
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent dark:from-indigo-900/20"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4"
                    >
                        <div>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                    {t('b2b.title')}
                                </span>
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
                                {t('b2b.subtitle')}
                            </p>
                        </div>

                        {canAddProduct && (
                            <Link to={isAdmin ? "/admin" : "/farmer"}>
                                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-6 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all transform hover:scale-105">
                                    <Plus className="h-5 w-5 mr-2" />
                                    {isAdmin ? t('admin.add_product') : t('farmer.add_crop')}
                                </Button>
                            </Link>
                        )}
                    </motion.div>

                    {/* Role Indicator Banner */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`rounded-2xl p-4 mb-8 backdrop-blur-md border border-white/20 shadow-md ${isBuyer ? 'bg-blue-100/50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' : isAdmin ? 'bg-purple-100/50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800' : 'bg-gray-100/50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700'}`}
                    >
                        {isBuyer ? (
                            <p className="text-blue-800 dark:text-blue-200 font-medium flex items-center">
                                <span className="mr-2 text-xl">💼</span> {t('b2b.buyer_msg_title')} - {t('b2b.buyer_msg_desc')}
                            </p>
                        ) : isAdmin ? (
                            <p className="text-purple-800 dark:text-purple-200 font-medium flex items-center">
                                <span className="mr-2 text-xl">👨‍💼</span> {t('b2b.admin_msg')}
                            </p>
                        ) : isFarmer ? (
                            <p className="text-gray-800 dark:text-gray-200 font-medium flex items-center">
                                <span className="mr-2 text-xl">🌾</span> {t('b2b.farmer_msg')}
                            </p>
                        ) : (
                            <div className="flex flex-wrap items-center text-gray-800 dark:text-gray-200 font-medium">
                                <span className="mr-2 text-xl">📦</span>
                                <span>{t('b2b.guest_msg_1')}</span>
                                <Link to="/auth?tab=signup&role=farmer" className="bg-white/80 dark:bg-gray-800 px-3 py-1 rounded-full text-blue-600 text-sm font-bold shadow-sm mx-2 hover:bg-white">{t('b2b.register_farmer')}</Link>
                                <span>{t('b2b.or')}</span>
                                <Link to="/auth?tab=signup&role=buyer" className="bg-white/80 dark:bg-gray-800 px-3 py-1 rounded-full text-blue-600 text-sm font-bold shadow-sm mx-2 hover:bg-white">{t('b2b.register_buyer')}</Link>
                                <span>{t('b2b.guest_msg_2')}</span>
                            </div>
                        )}
                    </motion.div>

                    {/* Glass Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-2 rounded-2xl border border-white/20 dark:border-gray-700 shadow-xl"
                    >
                        <div className="flex flex-col md:flex-row gap-2">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    type="text"
                                    placeholder={t('b2b.search_placeholder') || "Search for bulk crops..."}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 h-12 bg-white/50 dark:bg-gray-900/50 border-none shadow-none focus:ring-0 text-lg"
                                />
                            </div>
                            <div className="h-full w-px bg-gray-200 dark:bg-gray-700 hidden md:block mx-2"></div>
                            <select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                className="h-12 px-4 rounded-xl border-none bg-transparent dark:text-white font-medium focus:ring-0 cursor-pointer hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors md:w-48"
                            >
                                {districts.map((district) => (
                                    <option key={district} value={district} className="dark:bg-gray-800">
                                        {district === "All Districts" ? t('retail.all_districts') : district}
                                    </option>
                                ))}
                            </select>
                            <Button size="lg" className="rounded-xl bg-blue-600 hover:bg-blue-700 h-12 px-8 shadow-md">
                                {t('retail.search')}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:w-64 flex-shrink-0"
                    >
                        <div className="sticky top-24 space-y-4">
                            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 border border-white/20 dark:border-gray-700 shadow-lg">
                                <h3 className="flex items-center text-lg font-bold text-gray-900 dark:text-white mb-6">
                                    <Filter className="h-5 w-5 mr-3 text-blue-600" />
                                    {t('retail.categories')}
                                </h3>
                                <div className="space-y-2">
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category === 'All' ? '' : category)}
                                            className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center justify-between group ${(category === 'All' && !selectedCategory) || selectedCategory === category
                                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400'
                                                }`}
                                        >
                                            <span className="font-medium">{category === "All" ? t('retail.all_categories') : category}</span>
                                            {((category === 'All' && !selectedCategory) || selectedCategory === category) && (
                                                <motion.div layoutId="activeCategoryB2B" className="w-2 h-2 bg-white rounded-full" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-gray-600 dark:text-gray-400 font-medium">
                                {t('retail.showing')} <span className="font-bold text-gray-900 dark:text-white">{filteredCrops.length}</span> {t('retail.products')}
                            </p>
                        </div>

                        {loading ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="h-96 rounded-2xl bg-gray-100 dark:bg-gray-800/50 animate-pulse"></div>
                                ))}
                            </div>
                        ) : filteredCrops.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-24 bg-white/40 dark:bg-gray-800/40 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 backdrop-blur-sm"
                            >
                                <div className="text-8xl mb-6 opacity-80">🔍</div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('retail.no_products')}</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">{t('retail.no_products_desc')}</p>
                                <Button
                                    variant="outline"
                                    onClick={() => { setSearchTerm(''); setSelectedCategory(''); setSelectedDistrict(''); }}
                                    className="border-blue-500 text-blue-600 hover:bg-blue-50 rounded-full px-8"
                                >
                                    {t('retail.clear_filters')}
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                <AnimatePresence>
                                    {filteredCrops.map((crop) => (
                                        <motion.div key={crop.id} variants={itemVariants} layout>
                                            <ProductCard
                                                product={crop}
                                                variant="b2b"
                                                onAction={handleAction}
                                                t={t}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Bid Modal */}
            {selectedCrop && (
                <BidModal
                    isOpen={showBidModal}
                    onClose={() => {
                        setShowBidModal(false);
                        setSelectedCrop(null);
                    }}
                    crop={selectedCrop}
                    onSuccess={() => fetchCrops()}
                />
            )}
        </div>
    );
};

export default B2BMarketplacePage;
