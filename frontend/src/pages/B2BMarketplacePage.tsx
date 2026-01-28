import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Search, Filter, MapPin, TrendingUp, Package, Plus, Store } from 'lucide-react';
import axios, { BASE_URL } from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import BidModal from '../components/BidModal';
import { motion, AnimatePresence } from 'framer-motion';

interface Crop {
    id: number;
    title: string;
    description: string;
    farmerName: string;
    cropTypeName: string;
    quantity: number;
    unit: string;
    minPrice: number;
    wholesalePrice?: number;
    minWholesaleQty?: number;
    location: string;
    images: string[];
    createdAt: string;
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
    const canBuyB2B = isBuyer || isAdmin;

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

    const getCropEmoji = (type: string) => {
        const emojis: Record<string, string> = {
            'Rice': '🌾',
            'Rice & Grains': '🌾',
            'Vegetables': '🥬',
            'Fruits': '🍎',
            'Spices': '🌶️',
            'Pulses': '🫘',
            'Fish': '🐟'
        };
        return emojis[type] || '🌱';
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col md:flex-row md:items-center justify-between mb-8"
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Package className="h-10 w-10" />
                                <h1 className="text-4xl font-extrabold tracking-tight">{t('b2b.title')}</h1>
                            </div>
                            <p className="text-blue-100 mt-2 text-lg max-w-2xl">{t('b2b.subtitle')}</p>
                        </div>
                        {canAddProduct && (
                            <Link to={isAdmin ? "/admin" : "/farmer"} className="mt-4 md:mt-0">
                                <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-md transition-all hover:scale-105">
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
                        className={`rounded-xl p-4 mb-8 backdrop-blur-md border border-white/20 shadow-lg ${isBuyer ? 'bg-blue-500/30' : isAdmin ? 'bg-purple-500/30' : 'bg-green-500/30'}`}
                    >
                        {isBuyer ? (
                            <p className="text-white font-medium flex items-center">
                                <span className="mr-2 text-xl">💼</span> {t('b2b.buyer_msg_title')} - {t('b2b.buyer_msg_desc')}
                            </p>
                        ) : isAdmin ? (
                            <p className="text-white font-medium flex items-center">
                                <span className="mr-2 text-xl">👨‍💼</span> {t('b2b.admin_msg')}
                            </p>
                        ) : isFarmer ? (
                            <p className="text-white font-medium flex items-center">
                                <span className="mr-2 text-xl">🌾</span> {t('b2b.farmer_msg')}
                            </p>
                        ) : (
                            <p className="text-white font-medium flex items-center">
                                <span className="mr-2 text-xl">📦</span>
                                {t('b2b.guest_msg_1')} <Link to="/auth?tab=signup&role=farmer" className="underline font-bold hover:text-blue-200 mx-1">{t('b2b.register_farmer')}</Link> {t('b2b.or')} <Link to="/auth?tab=signup&role=buyer" className="underline font-bold hover:text-blue-200 mx-1">{t('b2b.register_buyer')}</Link> {t('b2b.guest_msg_2')}
                            </p>
                        )}
                    </motion.div>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 shadow-xl"
                    >
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-200 group-focus-within:text-white transition-colors" />
                                <Input
                                    type="text"
                                    placeholder={t('b2b.search_placeholder') || "Search for bulk crops..."}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-12 bg-white/20 border-white/30 text-white placeholder-gray-200 focus:bg-white/30 focus:border-white focus:ring-2 focus:ring-white/50 transition-all rounded-lg"
                                />
                            </div>
                            <select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                className="h-12 px-4 rounded-lg border-white/30 bg-white/20 text-white font-medium focus:ring-2 focus:ring-white/50 cursor-pointer hover:bg-white/30 transition-colors"
                            >
                                {districts.map((district) => (
                                    <option key={district} value={district} className="text-gray-900 font-medium">
                                        {district === "All Districts" ? t('retail.all_districts') : district}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="lg:w-64 flex-shrink-0"
                    >
                        <Card className="sticky top-24 border-none shadow-md bg-white dark:bg-gray-800 overflow-hidden">
                            <CardHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                                <CardTitle className="flex items-center text-lg font-bold text-gray-800 dark:text-white">
                                    <Filter className="h-5 w-5 mr-3 text-blue-600" />
                                    {t('retail.categories')}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-3">
                                <div className="space-y-1">
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category === 'All' ? '' : category)}
                                            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between group ${(category === 'All' && !selectedCategory) || selectedCategory === category
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            <span className="font-medium">{category === "All" ? t('retail.all_categories') : category}</span>
                                            {((category === 'All' && !selectedCategory) || selectedCategory === category) && (
                                                <motion.div layoutId="activeCategoryB2B" className="w-2 h-2 bg-white rounded-full" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
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
                                    <Card key={i} className="animate-pulse border-none shadow-sm">
                                        <div className="h-56 bg-gray-200 dark:bg-gray-700 rounded-t-xl"></div>
                                        <CardContent className="pt-6 space-y-3">
                                            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : filteredCrops.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-dashed border-gray-300 dark:border-gray-700"
                            >
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('retail.no_products')}</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">{t('retail.no_products_desc')}</p>
                                <Button
                                    variant="outline"
                                    onClick={() => { setSearchTerm(''); setSelectedCategory(''); setSelectedDistrict(''); }}
                                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
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
                                        <motion.div
                                            key={crop.id}
                                            variants={itemVariants}
                                            layout
                                            className="h-full"
                                        >
                                            <Link to={`/crop/${crop.id}`} className="block h-full">
                                                <Card className="group h-full hover:shadow-xl transition-all duration-300 border-none shadow-sm bg-white dark:bg-gray-800 overflow-hidden ring-1 ring-gray-100 dark:ring-gray-700 hover:ring-blue-200 dark:hover:ring-blue-900">
                                                    {/* Wholesale badge */}
                                                    <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-md">
                                                        {t('b2b.wholesale')}
                                                    </div>

                                                    <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-gray-700">
                                                        {crop.images && crop.images.length > 0 ? (
                                                            <img
                                                                src={crop.images[0].startsWith('http') ? crop.images[0] : `${BASE_URL}${crop.images[0]}`}
                                                                alt={crop.title}
                                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700">
                                                                <span className="text-8xl transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">{getCropEmoji(crop.cropTypeName)}</span>
                                                            </div>
                                                        )}
                                                        <div className="absolute top-3 left-3">
                                                            <span className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-blue-700 dark:text-blue-400 text-xs font-bold rounded-full shadow-sm flex items-center gap-1">
                                                                {getCropEmoji(crop.cropTypeName)} {crop.cropTypeName}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <CardContent className="pt-5 p-5">
                                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
                                                            <MapPin className="h-3 w-3 mr-1 text-blue-500" />
                                                            <span className="truncate max-w-[150px]">{crop.location}</span>
                                                            <span className="mx-2">•</span>
                                                            <span className="truncate text-blue-600 dark:text-blue-400 font-medium">{crop.farmerName}</span>
                                                        </div>
                                                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{crop.title}</h3>
                                                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed h-10">{crop.description}</p>

                                                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                                            <div>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('b2b.min_price')}</p>
                                                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                                    ৳{crop.minPrice}<span className="text-sm font-normal text-gray-500">/{crop.unit}</span>
                                                                </p>
                                                                {crop.minWholesaleQty && (
                                                                    <p className="text-xs text-blue-500 dark:text-blue-300 font-medium mt-1">
                                                                        Min: {crop.minWholesaleQty} {crop.unit}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('retail.stock')}</p>
                                                                <p className="font-semibold text-gray-700 dark:text-gray-200">{crop.quantity} {crop.unit}</p>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                    <CardFooter className="p-5 pt-0">
                                                        {canBuyB2B ? (
                                                            <Button
                                                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:translate-y-[-2px]"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    setSelectedCrop(crop);
                                                                    setShowBidModal(true);
                                                                }}
                                                            >
                                                                <TrendingUp className="h-4 w-4 mr-2" />
                                                                {t('b2b.place_bid')}
                                                            </Button>
                                                        ) : (
                                                            <Button variant="outline" className="w-full border-dashed" disabled>
                                                                {t('b2b.login_to_bid')}
                                                            </Button>
                                                        )}
                                                    </CardFooter>
                                                </Card>
                                            </Link>
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
