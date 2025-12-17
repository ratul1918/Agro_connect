import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Search, Filter, MapPin, ShoppingCart, Store, Plus } from 'lucide-react';
import axios from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface Product {
    id: number;
    title: string;
    description: string;
    farmerName: string;
    cropTypeName: string;
    quantity: number;
    unit: string;
    retailPrice?: number;
    minPrice: number;
    minRetailQty?: number;
    maxRetailQty?: number;
    location: string;
    images: string[];
    createdAt: string;
}

const RetailMarketplacePage: React.FC = () => {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');

    const isAdmin = user?.role === 'ROLE_ADMIN';

    const categories = [
        "All", "Rice & Grains", "Vegetables", "Fruits", "Spices", "Pulses", "Fish"
    ];

    const districts = [
        "All Districts", "Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur"
    ];

    useEffect(() => {
        fetchProducts();
    }, [selectedCategory, selectedDistrict]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/shop/products');
            console.log('Fetched retail products:', res.data);
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Store className="h-8 w-8" />
                                <h1 className="text-3xl font-bold">Retail Shop</h1>
                            </div>
                            <p className="text-orange-100 mt-1">Quality products curated by our team</p>
                        </div>
                        {isAdmin && (
                            <Link to="/admin">
                                <Button className="bg-white text-orange-600 hover:bg-orange-50">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Product
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Info banner */}
                    <div className="rounded-lg p-3 mb-6 bg-orange-500/30">
                        <p className="text-sm">
                            🛒 <strong>Retail Prices</strong> - Buy in small quantities (100gm - 10kg). Admin-curated quality products.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search for products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-white text-gray-900"
                            />
                        </div>
                        <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            className="px-4 py-2 rounded-lg border-0 focus:ring-2 focus:ring-orange-300 bg-white text-gray-900 font-semibold"
                        >
                            {districts.map((district) => (
                                <option key={district} value={district} className="text-gray-900 font-semibold">{district}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <div className="lg:w-64 flex-shrink-0">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Filter className="h-5 w-5 mr-2" />
                                    Categories
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {categories.map((category) => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category === 'All' ? '' : category)}
                                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${(category === 'All' && !selectedCategory) || selectedCategory === category
                                                ? 'bg-orange-100 text-orange-700 font-medium'
                                                : 'hover:bg-gray-100'
                                                }`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-gray-600">
                                Showing <span className="font-semibold">{filteredProducts.length}</span> products
                            </p>
                            <select className="px-4 py-2 border rounded-lg">
                                <option>Sort by: Latest</option>
                                <option>Price: Low to High</option>
                                <option>Price: High to Low</option>
                            </select>
                        </div>

                        {loading ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <Card key={i} className="animate-pulse">
                                        <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                                        <CardContent className="pt-4">
                                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No products found matching your criteria</p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => { setSearchTerm(''); setSelectedCategory(''); setSelectedDistrict(''); }}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                    <Link to={`/crop/${product.id}`} key={product.id}>
                                        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                            <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 rounded-t-lg flex items-center justify-center">
                                                <span className="text-7xl">{getCropEmoji(product.cropTypeName)}</span>
                                            </div>
                                            <CardContent className="pt-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                                        {product.cropTypeName}
                                                    </span>
                                                    <span className="text-xs text-gray-500 flex items-center">
                                                        <MapPin className="h-3 w-3 mr-1" />
                                                        {product.location}
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-lg text-gray-900 mb-1">{product.title}</h3>
                                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

                                                <div className="border-t pt-3 mt-2">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-orange-600 font-bold text-lg">
                                                                ৳{product.retailPrice || product.minPrice}/{product.unit}
                                                            </p>
                                                            <p className="text-xs text-orange-500 font-medium">
                                                                {(product.minRetailQty || 0.1) >= 1
                                                                    ? `${product.minRetailQty || 0.1} - ${product.maxRetailQty || 10} ${product.unit}`
                                                                    : `${((product.minRetailQty || 0.1) * 1000).toFixed(0)}gm - ${product.maxRetailQty || 10} ${product.unit}`
                                                                }
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs text-gray-400 line-through">
                                                                ৳{Math.round((product.retailPrice || product.minPrice) * 1.1)}/{product.unit}
                                                            </p>
                                                            <p className="text-xs text-green-600 font-medium">Save 10%</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="pt-0">
                                                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                                    Buy Now
                                                </Button>
                                            </CardFooter>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RetailMarketplacePage;
