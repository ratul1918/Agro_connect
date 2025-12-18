import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCrops } from '../api/endpoints';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api/axios';
import { ShoppingCart, Package, FileCheck, Leaf, BarChart3, MessageSquare, Bot, Wallet } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import ChangePasswordPage from '../pages/ChangePasswordPage';
import AIChatPage from '../pages/AIChatPage';
import MessagesPage from '../pages/MessagesPage';

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
    const navigate = useNavigate();
    const { user } = useAuth();
    const { success, error } = useNotification();
    const [activeTab, setActiveTab] = useState('overview');
    const [crops, setCrops] = useState<Crop[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [bids, setBids] = useState<Bid[]>([]);
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
            const res = await api.get('/wallet/balance').catch(() => ({ data: { balance: 0 } }));
            setWalletBalance(res.data.balance || 0);
        } catch { setWalletBalance(0); }
    };

    const handleAddCash = async () => {
        const amount = parseFloat(addCashAmount);
        if (!amount || amount <= 0) return;

        setLoading(true);
        setTimeout(async () => {
            try {
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

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'APPROVED': case 'COMPLETED': case 'DELIVERED': case 'ACCEPTED':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'REJECTED': case 'CANCELLED':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'PENDING': case 'PENDING_ADVANCE':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    const sidebarItems = [
        { label: 'Overview', icon: BarChart3, value: 'overview' },
        { label: 'Marketplace', icon: Leaf, value: 'marketplace', onClick: () => navigate('/marketplace/b2b') },
        { label: 'My Orders', icon: Package, value: 'my-orders' },
        { label: 'My Bids', icon: FileCheck, value: 'my-bids' },
        { label: 'Messages', icon: MessageSquare, value: 'messages' },
        { label: 'AI Chat', icon: Bot, value: 'ai-chat' },
        { label: 'Wallet', icon: Wallet, value: 'wallet' },
    ];

    const handleTabChange = (tab: string) => {
        if (tab === 'marketplace') {
            navigate('/marketplace/b2b');
        } else {
            setActiveTab(tab);
        }
    };

    return (
        <DashboardLayout
            sidebarItems={sidebarItems}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            title={activeTab === 'overview' ? 'Overview' : activeTab === 'my-orders' ? 'My Orders' : activeTab === 'my-bids' ? 'My Bids' : activeTab === 'wallet' ? 'Wallet' : activeTab === 'messages' ? 'Messages' : activeTab === 'ai-chat' ? 'AI Chat' : 'Dashboard'}
        >
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
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Orders</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {orders.slice(0, 5).map(o => (
                                    <div key={o.id} className="flex justify-between items-center py-2 border-b last:border-0">
                                        <div>
                                            <div className="font-medium">{o.cropTitle}</div>
                                            <div className="text-sm text-muted-foreground">From: {o.farmerName}</div>
                                        </div>
                                        <Badge variant="outline" className={getStatusColor(o.status)}>{o.status}</Badge>
                                    </div>
                                ))}
                                {orders.length === 0 && <p className="text-muted-foreground">No orders yet</p>}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>My Bids</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {bids.slice(0, 5).map(b => (
                                    <div key={b.id} className="flex justify-between items-center py-2 border-b last:border-0">
                                        <div>
                                            <div className="font-medium">{b.cropTitle}</div>
                                            <div className="text-sm text-muted-foreground">৳{b.amount}</div>
                                        </div>
                                        <Badge variant="outline" className={getStatusColor(b.status)}>{b.status}</Badge>
                                    </div>
                                ))}
                                {bids.length === 0 && <p className="text-muted-foreground">No bids placed</p>}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* My Orders */}
            {activeTab === 'my-orders' && (
                <Card>
                    <CardHeader>
                        <CardTitle>📦 My Orders ({orders.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Crop</TableHead>
                                        <TableHead>Farmer</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Advance Paid</TableHead>
                                        <TableHead>Due</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Invoice</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map(o => (
                                        <TableRow key={o.id}>
                                            <TableCell>{o.id}</TableCell>
                                            <TableCell className="font-medium">{o.cropTitle}</TableCell>
                                            <TableCell>{o.farmerName}</TableCell>
                                            <TableCell>৳{o.totalAmount}</TableCell>
                                            <TableCell className="text-green-600">৳{o.advanceAmount}</TableCell>
                                            <TableCell className="text-red-600">৳{o.dueAmount}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getStatusColor(o.status)}>{o.status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button size="sm" variant="outline" onClick={() => window.open(`http://localhost:8080/api/invoices/${o.id}`, '_blank')}>
                                                    Download
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {orders.length === 0 && <p className="text-muted-foreground text-center py-8">No orders yet. Place bids on crops to get started!</p>}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* My Bids */}
            {activeTab === 'my-bids' && (
                <Card>
                    <CardHeader>
                        <CardTitle>💰 My Bids ({bids.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Crop</TableHead>
                                        <TableHead>Farmer</TableHead>
                                        <TableHead>Bid Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bids.map(b => (
                                        <TableRow key={b.id}>
                                            <TableCell className="font-medium">{b.cropTitle}</TableCell>
                                            <TableCell>{b.farmerName}</TableCell>
                                            <TableCell className="font-bold text-blue-600">৳{b.amount}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getStatusColor(b.status)}>{b.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{b.bidTime}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            {bids.length === 0 && <p className="text-muted-foreground text-center py-8">No bids yet. Browse the marketplace to place bids!</p>}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Wallet Tab */}
            {activeTab === 'wallet' && (
                <div className="space-y-6">
                    <Card className="max-w-lg mx-auto">
                        <CardHeader>
                            <CardTitle className="text-center">My Wallet Balance</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
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
                                    {['500', '1000', '5000'].map(amt => (
                                        <Button key={amt} variant="outline" onClick={() => setAddCashAmount(amt)}>+ ৳{amt}</Button>
                                    ))}
                                </div>
                                <Button onClick={handleAddCash} disabled={loading} className="bg-green-600 hover:bg-green-700 w-full py-6 text-lg">
                                    {loading ? 'Processing...' : 'Add Cash via Payment Gateway'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="max-w-4xl mx-auto">
                        <CardHeader>
                            <CardTitle>Transaction History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center text-muted-foreground py-8">No recent transactions</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Messages */}
            {activeTab === 'messages' && <MessagesPage />}

            {/* AI Chat */}
            {activeTab === 'ai-chat' && <AIChatPage />}

            {/* Change Password */}
            {activeTab === 'change-password' && <ChangePasswordPage />}
        </DashboardLayout>
    );
};

const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({ title, value, icon, color }) => {
    const colors: Record<string, string> = {
        blue: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
        green: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
        purple: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800',
        yellow: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800'
    };
    return (
        <div className={`rounded-lg border p-4 ${colors[color] || colors.blue}`}>
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm text-muted-foreground">{title}</div>
        </div>
    );
};

export default BuyerDashboard;
