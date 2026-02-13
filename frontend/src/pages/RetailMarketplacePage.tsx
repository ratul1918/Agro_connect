import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Search, Filter, Store, Plus } from 'lucide-react';
import axios from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import ProductCard, { Product } from '../components/marketplace/ProductCard';

const RetailMarketplacePage: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [categories, setCategories] = useState<string[]>(['All']);

    const isAdmin = user?.role === 'ROLE_ADMIN';

    const districts = [
        "All Districts", "Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur"
    ];

    useEffect(() => {
        axios.get('/shop/crop-types').then(res => {
            const names = res.data.map((ct: any) => ct.nameEn || ct.name_en);
            setCategories(['All', ...names]);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory, selectedDistrict]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/crops', { params: { marketplaceType: 'RETAIL' } });
            setProducts(res.data);
        } catch (error) {
            console.error('Error fetching retail products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !selectedCategory || selectedCategory === 'All' ||
            product.cropTypeName === selectedCategory;
        const matchesDistrict = !selectedDistrict || selectedDistrict === 'All Districts' ||
            product.location === selectedDistrict;
        return matchesSearch && matchesCategory && matchesDistrict;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
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

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            {/* Glassmorphism Header */}
            <div className="relative pt-24 pb-12 overflow-hidden">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-100/40 via-transparent to-transparent dark:from-green-900/20"></div>
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-900/20"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4"
                    >
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium mb-3">
                                <Store className="h-3 w-3" />
                                Retail Marketplace
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                                {t('retail.title')}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg max-w-2xl">
                                {t('retail.subtitle')}
                            </p>
                        </div>
                        {isAdmin && (
                            <Link to="/admin">
                                <Button className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 transition-all hover:scale-105 rounded-full px-6">
                                    <Plus className="h-5 w-5 mr-2" />
                                    {t('retail.add_product')}
                                </Button>
                            </Link>
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
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                                <Input
                                    type="text"
                                    placeholder={t('retail.search_placeholder') || "Search fresh produce..."}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-12 h-12 bg-transparent border-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:bg-white dark:focus:bg-gray-900/50 focus:ring-0 focus:border-transparent transition-all rounded-xl text-base"
                                />
                            </div>
                            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 self-center hidden md:block"></div>
                            <select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                className="h-12 px-4 rounded-xl border-transparent bg-transparent text-gray-700 dark:text-gray-200 font-medium focus:ring-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors md:w-64"
                            >
                                {districts.map((district) => (
                                    <option key={district} value={district} className="text-gray-900 dark:text-white bg-white dark:bg-gray-800">
                                        {district === "All Districts" ? t('retail.all_districts') : district}
                                    </option>
                                ))}
                            </select>
                            <Button className="h-12 px-8 rounded-xl bg-green-600 hover:bg-green-700 text-white font-medium shadow-md">
                                Search
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
                        <div className="sticky top-24">
                            <h3 className="font-bold text-gray-900 dark:text-white mb-4 px-2 flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                {t('retail.categories')}
                            </h3>
                            <div className="space-y-1 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-100 dark:border-gray-800">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() => setSelectedCategory(category === 'All' ? '' : category)}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between group ${(category === 'All' && !selectedCategory) || selectedCategory === category
                                            ? 'bg-green-600 text-white shadow-md shadow-green-600/20'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        <span className="font-medium text-sm">{category === "All" ? t('retail.all_categories') : category}</span>
                                        {((category === 'All' && !selectedCategory) || selectedCategory === category) && (
                                            <motion.div layoutId="activeCategory" className="w-1.5 h-1.5 bg-white rounded-full" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6 px-1">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {t('retail.showing')} <span className="font-bold text-gray-900 dark:text-white">{filteredProducts.length}</span> {t('retail.products')}
                            </p>
                        </div>

                        {loading ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 h-[340px] animate-pulse">
                                        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl mb-4"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-24 bg-white/50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700"
                            >
                                <div className="text-6xl mb-4 opacity-50">🍃</div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('retail.no_products')}</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">{t('retail.no_products_desc')}</p>
                                <Button
                                    variant="outline"
                                    onClick={() => { setSearchTerm(''); setSelectedCategory(''); setSelectedDistrict(''); }}
                                    className="rounded-full"
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
                                    {filteredProducts.map((product) => (
                                        <motion.div key={product.id} variants={itemVariants} layout className="h-full">
                                            <ProductCard
                                                product={product}
                                                variant="retail"
                                                onAction={(p) => {
                                                    navigate(`/crop/${p.id}`);
                                                }}
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
        </div>
    );
};

export default RetailMarketplacePage;
