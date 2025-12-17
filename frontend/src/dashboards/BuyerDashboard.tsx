import React, { useEffect, useState } from 'react';
import { getAllCrops, placeBid } from '../api/endpoints';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api/axios';
import { ShoppingCart, Package, FileCheck, Leaf, BarChart3, Search } from 'lucide-react';

interface Crop {
    id: number;
    title: string;
    farmerName: string;
    minPrice: number;
    wholesalePrice: number;
    quantity: number;
    unit: string;
    location: string;
    images?: string[];
}

interface Order {
    id: number;
    farmerId: number;
    farmerName: string;
    cropId: number;
    cropTitle: string;
    totalAmount: number;
    advanceAmount: number;
    dueAmount: number;
    status: string;
    createdAt: string;
}

interface Bid {
    id: number;
    cropId: number;
    cropTitle: string;
    farmerName: string;
    amount: number;
    bidTime: string;
    status: string;
}

const BuyerDashboard: React.FC = () => {
    const { user } = useAuth();
    const { success, error } = useNotification();
    const [activeTab, setActiveTab] = useState<'overview' | 'marketplace' | 'my-orders' | 'my-bids' | 'wallet'>('overview');
    const [crops, setCrops] = useState<Crop[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [bids, setBids] = useState<Bid[]>([]);
    const [bidAmounts, setBidAmounts] = useState<{ [key: number]: string }>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // Wallet State
    const [walletBalance, setWalletBalance] = useState(0);
    const [addCashAmount, setAddCashAmount] = useState('');

    useEffect(() => {
        fetchCrops();
        fetchOrders();
        fetchBids();
        fetchWalletBalance();
    }, []);

    const fetchWalletBalance = async () => {
        try {
            // Mock for now, replace with api.get('/wallet/balance');
            const res = await api.get('/wallet/balance').catch(() => ({ data: { balance: 0 } }));
            setWalletBalance(res.data.balance || 0);
        } catch { setWalletBalance(0); }
    };

    const handleAddCash = async () => {
        const amount = parseFloat(addCashAmount);
        if (!amount || amount <= 0) return;

        // Simulate payment gateway
        setLoading(true);
        setTimeout(async () => {
            try {
                // In real app, this would verify payment token. Here just mock add.
                await api.post('/wallet/add-cash', { amount });
                success('Cash added successfully!');
                setAddCashAmount('');
                fetchWalletBalance();
            } catch (e) {
                error('Failed to add cash');
            } finally {
                setLoading(false);
            }
        }, 1500);
    };

    const fetchCrops = async () => {
        try {
            const res = await getAllCrops();
            setCrops(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await api.get('/features/buyer/orders');
            setOrders(res.data);
        } catch (err) {
            setOrders([]);
        }
    };

    const fetchBids = async () => {
        try {
            const res = await api.get('/features/buyer/bids');
            setBids(res.data);
        } catch (err) {
            setBids([]);
        }
    };

    const handleBid = async (cropId: number) => {
        const amount = parseFloat(bidAmounts[cropId]);
        if (!amount) return;
        setLoading(true);
        try {
            await placeBid(cropId, amount);
            success('Bid placed successfully!');
            setBidAmounts({ ...bidAmounts, [cropId]: '' });
            fetchBids();
        } catch (err) {
            error('Failed to place bid');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED': case 'COMPLETED': case 'DELIVERED': case 'ACCEPTED':
                return 'bg-green-100 text-green-700';
            case 'REJECTED': case 'CANCELLED':
                return 'bg-red-100 text-red-700';
            case 'PENDING': case 'PENDING_ADVANCE':
                return 'bg-yellow-100 text-yellow-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredCrops = crops.filter(crop =>
        crop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.farmerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
                <h1 className="text-3xl font-bold">🛒 Buyer Dashboard</h1>
                <p className="text-blue-100 mt-1">Welcome, {user?.fullName || 'Buyer'}</p>
            </div>

            {/* Tabs */}
            <div className="bg-white shadow-sm border-b sticky top-0 z-10 overflow-x-auto">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex space-x-1 py-2">
                        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<BarChart3 className="w-4 h-4" />} label="Overview" />
                        <TabButton active={activeTab === 'marketplace'} onClick={() => setActiveTab('marketplace')} icon={<Leaf className="w-4 h-4" />} label="Marketplace" />
                        <TabButton active={activeTab === 'my-orders'} onClick={() => setActiveTab('my-orders')} icon={<Package className="w-4 h-4" />} label="My Orders" />
                        <TabButton active={activeTab === 'my-bids'} onClick={() => setActiveTab('my-bids')} icon={<FileCheck className="w-4 h-4" />} label="My Bids" />
                        <TabButton active={activeTab === 'wallet'} onClick={() => setActiveTab('wallet')} icon={<ShoppingCart className="w-4 h-4" />} label="Wallet" />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Overview */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard title="Available Crops" value={crops.length} icon="🌾" color="green" />
                            <StatCard title="My Orders" value={orders.length} icon="📦" color="blue" />
                            <StatCard title="Active Bids" value={bids.filter(b => b.status === 'PENDING').length} icon="💰" color="yellow" />
                            <StatCard title="Accepted Bids" value={bids.filter(b => b.status === 'ACCEPTED').length} icon="✅" color="purple" />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
                                {orders.slice(0, 5).map(o => (
                                    <div key={o.id} className="flex justify-between items-center py-2 border-b">
                                        <div>
                                            <div className="font-medium">{o.cropTitle}</div>
                                            <div className="text-sm text-gray-500">From: {o.farmerName}</div>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(o.status)}`}>{o.status}</span>
                                    </div>
                                ))}
                                {orders.length === 0 && <p className="text-gray-500">No orders yet</p>}
                            </div>

                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-xl font-bold mb-4">My Bids</h2>
                                {bids.slice(0, 5).map(b => (
                                    <div key={b.id} className="flex justify-between items-center py-2 border-b">
                                        <div>
                                            <div className="font-medium">{b.cropTitle}</div>
                                            <div className="text-sm text-gray-500">৳{b.amount}</div>
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(b.status)}`}>{b.status}</span>
                                    </div>
                                ))}
                                {bids.length === 0 && <p className="text-gray-500">No bids placed</p>}
                            </div>
                        </div>
                    </div>
                )}

                {/* Marketplace */}
                {activeTab === 'marketplace' && (
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search crops, farmers, locations..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCrops.map(crop => (
                                <div key={crop.id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                                    <div className="h-48 bg-gray-200 w-full rounded-t overflow-hidden">
                                        {crop.images && crop.images.length > 0 ? (
                                            <img
                                                src={`http://localhost:8080${crop.images[0]}`}
                                                alt={crop.title}
                                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-500">No Image</div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-xl font-bold mb-2">{crop.title}</h3>
                                        <p className="text-gray-600 text-sm mb-1">Farmer: {crop.farmerName}</p>
                                        <p className="text-gray-600 text-sm mb-1">Location: {crop.location}</p>
                                        <p className="text-green-600 font-bold text-lg mb-1">
                                            {crop.quantity} {crop.unit} • ৳{crop.wholesalePrice || crop.minPrice}
                                        </p>
                                        <p className="text-xs text-gray-400 mb-4">Wholesale price (min 80kg)</p>

                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                placeholder="Your Bid"
                                                className="w-32"
                                                value={bidAmounts[crop.id] || ''}
                                                onChange={e => setBidAmounts({ ...bidAmounts, [crop.id]: e.target.value })}
                                            />
                                            <Button onClick={() => handleBid(crop.id)} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                                                Place Bid
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* My Orders */}
                {activeTab === 'my-orders' && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">📦 My Orders ({orders.length})</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-3">ID</th>
                                        <th className="p-3">Crop</th>
                                        <th className="p-3">Farmer</th>
                                        <th className="p-3">Total</th>
                                        <th className="p-3">Advance Paid</th>
                                        <th className="p-3">Due</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Invoice</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3">{o.id}</td>
                                            <td className="p-3 font-medium">{o.cropTitle}</td>
                                            <td className="p-3">{o.farmerName}</td>
                                            <td className="p-3">৳{o.totalAmount}</td>
                                            <td className="p-3 text-green-600">৳{o.advanceAmount}</td>
                                            <td className="p-3 text-red-600">৳{o.dueAmount}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(o.status)}`}>{o.status}</span>
                                            </td>
                                            <td className="p-3">
                                                <Button size="sm" variant="outline" onClick={() => window.open(`http://localhost:8080/api/invoices/${o.id}`, '_blank')}>
                                                    Download
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {orders.length === 0 && <p className="text-gray-500 text-center py-8">No orders yet. Place bids on crops to get started!</p>}
                        </div>
                    </div>
                )}

                {/* My Bids */}
                {activeTab === 'my-bids' && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold mb-4">💰 My Bids ({bids.length})</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-3">Crop</th>
                                        <th className="p-3">Farmer</th>
                                        <th className="p-3">Bid Amount</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bids.map(b => (
                                        <tr key={b.id} className="border-b hover:bg-gray-50">
                                            <td className="p-3 font-medium">{b.cropTitle}</td>
                                            <td className="p-3">{b.farmerName}</td>
                                            <td className="p-3 font-bold text-blue-600">৳{b.amount}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs ${getStatusColor(b.status)}`}>{b.status}</span>
                                            </td>
                                            <td className="p-3 text-xs text-gray-500">{b.bidTime}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {bids.length === 0 && <p className="text-gray-500 text-center py-8">No bids yet. Browse the marketplace to place bids!</p>}
                        </div>
                    </div>
                )}

                {/* Wallet Tab */}
                {activeTab === 'wallet' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow p-8 text-center max-w-lg mx-auto">
                            <h2 className="text-2xl font-bold mb-2">My Wallet Balance</h2>
                            <div className="text-4xl font-extrabold text-green-600 mb-6">৳{walletBalance}</div>

                            <div className="flex flex-col gap-4">
                                <Input
                                    type="number"
                                    placeholder="Enter amount to add"
                                    className="text-center text-lg"
                                    value={addCashAmount}
                                    onChange={(e) => setAddCashAmount(e.target.value)}
                                />
                                <div className="grid grid-cols-3 gap-2">
                                    {/* Quick Add Buttons */}
                                    {['500', '1000', '5000'].map(amt => (
                                        <Button key={amt} variant="outline" onClick={() => setAddCashAmount(amt)}>+ ৳{amt}</Button>
                                    ))}
                                </div>
                                <Button onClick={handleAddCash} className="bg-green-600 hover:bg-green-700 w-full py-6 text-lg">
                                    Add Cash via Payment Gateway
                                </Button>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6 max-w-4xl mx-auto">
                            <h3 className="font-bold mb-4">Transaction History</h3>
                            <div className="text-center text-gray-500 py-8">No recent transactions</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm ${active ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
            }`}>
        {icon}
        {label}
    </button>
);

const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({ title, value, icon, color }) => {
    const colors: Record<string, string> = {
        blue: 'bg-blue-50 border-blue-200',
        green: 'bg-green-50 border-green-200',
        purple: 'bg-purple-50 border-purple-200',
        yellow: 'bg-yellow-50 border-yellow-200'
    };
    return (
        <div className={`rounded-lg border p-4 ${colors[color] || colors.blue}`}>
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm text-gray-600">{title}</div>
        </div>
    );
};

export default BuyerDashboard;
