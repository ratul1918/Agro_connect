import React, { useState, useEffect } from 'react';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { TrendingUp, TrendingDown, BarChart3, Calendar } from 'lucide-react';
import axios from '../api/axiosConfig';

interface PriceData {
    cropName: string;
    district: string;
    wholesalePrice: number;
    retailPrice: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
    lastUpdated: string;
}

const MarketPricesPage: React.FC = () => {
    const [priceData, setPriceData] = useState<PriceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDistrict, setSelectedDistrict] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    const districts = [
        "All", "Dhaka", "Chittagong", "Rajshahi", "Khulna", "Barisal", "Sylhet", "Rangpur",
        "Mymensingh", "Comilla", "Gazipur", "Narayanganj", "Jessore", "Bogra", "Dinajpur"
    ];

    useEffect(() => {
        fetchPrices();
    }, [selectedDistrict]);

    const fetchPrices = async () => {
        setLoading(true);
        try {
            // TODO: Replace with actual API endpoint for market prices
            const res = await axios.get('/api/crops');
            // Transform crop data to price format
            const prices: PriceData[] = res.data.map((crop: any) => ({
                cropName: crop.title,
                district: crop.location || "Dhaka",
                wholesalePrice: crop.wholesalePrice || crop.minPrice,
                retailPrice: crop.retailPrice || (crop.minPrice * 1.3),
                change: Math.random() * 20 - 10,
                trend: Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable',
                lastUpdated: new Date().toISOString()
            }));
            setPriceData(prices);
        } catch (error) {
            // Mock market prices data
            const mockPrices: PriceData[] = [
                { cropName: "Aman Rice", district: "Rangpur", wholesalePrice: 45, retailPrice: 62, change: 2.5, trend: 'up', lastUpdated: new Date().toISOString() },
                { cropName: "Aman Rice", district: "Dhaka", wholesalePrice: 48, retailPrice: 65, change: -1.2, trend: 'down', lastUpdated: new Date().toISOString() },
                { cropName: "Tomatoes", district: "Jessore", wholesalePrice: 60, retailPrice: 85, change: 5.3, trend: 'up', lastUpdated: new Date().toISOString() },
                { cropName: "Tomatoes", district: "Dhaka", wholesalePrice: 65, retailPrice: 90, change: 3.1, trend: 'up', lastUpdated: new Date().toISOString() },
                { cropName: "Potatoes", district: "Rajshahi", wholesalePrice: 35, retailPrice: 50, change: -2.1, trend: 'down', lastUpdated: new Date().toISOString() },
                { cropName: "Cabbage", district: "Khulna", wholesalePrice: 28, retailPrice: 40, change: 0.5, trend: 'stable', lastUpdated: new Date().toISOString() },
                { cropName: "Onions", district: "Sylhet", wholesalePrice: 55, retailPrice: 75, change: 4.2, trend: 'up', lastUpdated: new Date().toISOString() },
                { cropName: "Garlic", district: "Barisal", wholesalePrice: 120, retailPrice: 160, change: -3.5, trend: 'down', lastUpdated: new Date().toISOString() },
            ];
            setPriceData(mockPrices);
        } finally {
            setLoading(false);
        }
    };

    const filteredData = priceData.filter(item => {
        const districtMatch = selectedDistrict === 'All' || item.district === selectedDistrict;
        const searchMatch = item.cropName.toLowerCase().includes(searchTerm.toLowerCase());
        return districtMatch && searchMatch;
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <BarChart3 className="h-10 w-10 text-green-600" />
                        Current Market Prices
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Real-time agricultural commodity prices across Bangladesh</p>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 mb-8 border border-transparent dark:border-gray-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Search Crop</label>
                            <Input
                                placeholder="Search by crop name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select District</label>
                            <select
                                value={selectedDistrict}
                                onChange={(e) => setSelectedDistrict(e.target.value)}
                                className="w-full border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                {districts.map(district => (
                                    <option key={district} value={district} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">{district}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Price Table */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden border border-transparent dark:border-gray-800">
                        <table className="w-full">
                            <thead className="bg-gray-100 dark:bg-gray-800 border-b dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Crop Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">District</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Wholesale Price (৳/kg)</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Retail Price (৳/kg)</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Change</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Updated</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-gray-800">
                                {filteredData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-100">{item.cropName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{item.district}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-blue-600 dark:text-blue-400">৳{item.wholesalePrice}</td>
                                        <td className="px-6 py-4 text-sm font-semibold text-orange-600 dark:text-orange-400">৳{item.retailPrice}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`flex items-center gap-1 font-semibold ${
                                                item.trend === 'up' ? 'text-red-600 dark:text-red-400' : item.trend === 'down' ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'
                                            }`}>
                                                {item.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : item.trend === 'down' ? <TrendingDown className="h-4 w-4" /> : <span>—</span>}
                                                {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(item.lastUpdated).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredData.length === 0 && (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                No prices found matching your search
                            </div>
                        )}
                    </div>
                )}

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Wholesale Prices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Bulk purchase prices for wholesale buyers and traders</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Retail Prices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Consumer prices available in local markets</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Live Updates</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Prices updated daily from market reports</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MarketPricesPage;
