import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Search, Filter, MapPin, TrendingUp, Package, Plus } from 'lucide-react';
import axios from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';

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
    const [crops, setCrops] = useState<Crop[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');

    const isFarmer = user?.role === 'ROLE_FARMER';
    const isBuyer = user?.role === 'ROLE_BUYER';
    const isAdmin = user?.role === 'ROLE_ADMIN';
    const canAddProduct = isFarmer || isAdmin; // Both farmers and admins can add products

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
            const res = await axios.get('/crops');
            console.log('Fetched B2B crops:', res.data);
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Package className="h-8 w-8" />
                                <h1 className="text-3xl font-bold">B2B Marketplace</h1>
                            </div>
                            <p className="text-blue-100 mt-1">Wholesale marketplace for farmers and buyers</p>
                        </div>
                        {canAddProduct && (
                            <Link to={isAdmin ? "/admin" : "/farmer"}>
                                <Button className="bg-white text-blue-600 hover:bg-blue-50">
                                    <Plus className="h-4 w-4 mr-2" />
                                    {isAdmin ? 'Add Product (Admin)' : 'List Product'}
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* User type indicator */}
                    {(isFarmer || isBuyer || isAdmin) && (
                        <div className={`rounded-lg p-3 mb-6 ${isBuyer ? 'bg-blue-500/30' : isAdmin ? 'bg-purple-500/30' : 'bg-green-500/30'}`}>
                            {isBuyer ? (
                                <p className="text-sm">
                                    💼 <strong>Wholesale Buyer</strong> - You're viewing bulk prices. Minimum order quantity is <strong>80 kg</strong> per product.
                                </p>
                            ) : isAdmin ? (
                                <p className="text-sm">
                                    👨‍💼 <strong>Admin</strong> - You can add products to both Retail and B2B marketplaces.
                                </p>
                            ) : (
                                <p className="text-sm">
                                    🌾 <strong>Farmer</strong> - List your products and connect with wholesale buyers.
                                </p>
                            )}
                        </div>
                    )}

                    {!user && (
                        <div className="rounded-lg p-3 mb-6 bg-blue-500/30">
                            <p className="text-sm">
                                📦 <strong>B2B Wholesale Market</strong> - <Link to="/auth?tab=signup&role=farmer" className="underline font-semibold">Register as Farmer</Link> to sell or <Link to="/auth?tab=signup&role=buyer" className="underline font-semibold">Register as Buyer</Link> for wholesale purchases.
                            </p>
                        </div>
                    )}

                    {/* Search Bar */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search for crops..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-white text-gray-900"
                            />
                        </div>
                        <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            className="px-4 py-2 rounded-lg border-0 focus:ring-2 focus:ring-blue-300 bg-white text-gray-900 font-semibold"
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
                                                ? 'bg-blue-100 text-blue-700 font-medium'
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
                                Showing <span className="font-semibold">{filteredCrops.length}</span> products
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
                        ) : filteredCrops.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No crops found matching your criteria</p>
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
                                {filteredCrops.map((crop) => (
                                    <Link to={`/crop/${crop.id}`} key={crop.id}>
                                        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full relative overflow-hidden">
                                            {/* Wholesale badge */}
                                            <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded text-xs font-semibold bg-blue-500 text-white">
                                                Wholesale
                                            </div>

                                            <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 rounded-t-lg flex items-center justify-center">
                                                <span className="text-7xl">{getCropEmoji(crop.cropTypeName)}</span>
                                            </div>
                                            <CardContent className="pt-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                                        {crop.cropTypeName}
                                                    </span>
                                                    <span className="text-xs text-gray-500 flex items-center">
                                                        <MapPin className="h-3 w-3 mr-1" />
                                                        {crop.location}
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-lg text-gray-900 mb-1">{crop.title}</h3>
                                                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{crop.description}</p>

                                                {/* Wholesale pricing */}
                                                <div className="border-t pt-3 mt-2">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-blue-600 font-bold text-lg">
                                                                ৳{crop.wholesalePrice || crop.minPrice}/{crop.unit}
                                                            </p>
                                                            <p className="text-xs text-blue-500 font-medium">
                                                                Min: {crop.minWholesaleQty || 80} {crop.unit}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs text-gray-500">Available</p>
                                                            <p className="font-semibold text-gray-700">{crop.quantity} {crop.unit}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <p className="text-xs text-gray-400 mt-2">by {crop.farmerName}</p>
                                            </CardContent>
                                            <CardFooter className="pt-0">
                                                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                                    <TrendingUp className="h-4 w-4 mr-2" />
                                                    Place Bid (Min {crop.minWholesaleQty || 80}kg)
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

export default B2BMarketplacePage;
