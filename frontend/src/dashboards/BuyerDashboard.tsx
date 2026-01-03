import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCrops } from '../api/endpoints';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { useNotification } from '../context/NotificationContext';
import api from '../api/axios';
import { Package, FileCheck, Leaf, BarChart3, MessageSquare, Wallet, Truck, CheckCircle, Clock } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import ChangePasswordPage from '../pages/ChangePasswordPage';
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
    quantity: number;
    farmerCounterPrice?: number;
    bidTime: string;
    status: string;
}

const BuyerDashboard: React.FC = () => {
    const navigate = useNavigate();
    // const { user } = useAuth();
    const { success, error } = useNotification();
    const [activeTab, setActiveTab] = useState('overview');
    const [crops, setCrops] = useState<Crop[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [bids, setBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(false);

    // Wallet State
    const [walletBalance, setWalletBalance] = useState(0);
    const [addCashAmount, setAddCashAmount] = useState('');

    // Notifications
    const [notifications, setNotifications] = useState<any[]>([]);

    // Payment Modal for accepted bids
    const [paymentModal, setPaymentModal] = useState<{
        show: boolean;
        bid: Bid | null;
        address: string;
        mobile: string;
    }>({ show: false, bid: null, address: '', mobile: '' });

    const [trackingModal, setTrackingModal] = useState<{ show: boolean; order: any }>({ show: false, order: null });

    // Transactions State
    const [transactions, setTransactions] = useState<any[]>([]);

    useEffect(() => {
        fetchCrops();
        fetchOrders();
        fetchBids();
        fetchWalletBalance();
        fetchNotifications();
        fetchTransactions();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data || []);
        } catch { setNotifications([]); }
    };

    const fetchWalletBalance = async () => {
        try {
            const res = await api.get('/wallet/balance').catch(() => ({ data: { balance: 0 } }));
            setWalletBalance(res.data.balance || 0);
        } catch { setWalletBalance(0); }
    };

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/wallet/transactions');
            setTransactions(res.data.transactions || []);
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
            setTransactions([]);
        }
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

    const handleDownloadInvoice = async (orderId: number) => {
        try {
            const response = await api.get(`/orders/${orderId}/invoice/pdf`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice-${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to download invoice", error);
            // Fallback to text invoice if PDF fails
            try {
                const response = await api.get(`/orders/${orderId}/invoice`, {
                    responseType: 'text'
                });
                const win = window.open('', '_blank');
                if (win) {
                    win.document.write(response.data);
                    win.document.close();
                } else {
                    alert('Please allow popups to view the invoice.');
                }
            } catch (e) {
                alert("Failed to download invoice.");
            }
        }
    };

    // Process payment from accepted bid
    const processPaymentFromBid = async () => {
        if (!paymentModal.bid || !paymentModal.address || !paymentModal.mobile) {
            error('ঠিকানা এবং মোবাইল নম্বর দিন');
            return;
        }

        setLoading(true);
        try {
            const bid = paymentModal.bid;
            const totalAmount = (bid.farmerCounterPrice || bid.amount) * (bid.quantity || 1);
            const advanceAmount = Math.ceil(totalAmount * 0.20); // 20% advance

            // Create order from bid
            const orderData = {
                bidId: bid.id,
                cropId: bid.cropId,
                quantity: bid.quantity || 1,
                pricePerUnit: bid.farmerCounterPrice || bid.amount,
                totalAmount: totalAmount,
                advanceAmount: advanceAmount,
                customerAddress: paymentModal.address,
                customerMobile: paymentModal.mobile
            };

            await api.post('/orders/from-bid', orderData);
            success('অর্ডার সফল হয়েছে! ৳' + advanceAmount + ' অগ্রিম পরিশোধ করা হয়েছে।');
            setPaymentModal({ show: false, bid: null, address: '', mobile: '' });
            fetchOrders();
            fetchBids();
            fetchWalletBalance();
        } catch (err: any) {
            error(err.response?.data?.message || 'অর্ডার ব্যর্থ হয়েছে');
        } finally {
            setLoading(false);
        }
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
        { label: 'Messages', icon: MessageSquare, value: 'messages', onClick: () => navigate('/messages') },
        { label: 'Wallet', icon: Wallet, value: 'wallet' },
    ];

    const handleTabChange = (tab: string) => {
        if (tab === 'marketplace') {
            navigate('/marketplace/b2b');
        } else if (tab === 'messages') {
            navigate('/messages');
        } else {
            setActiveTab(tab);
        }
    };

    return (
        <DashboardLayout
            sidebarItems={sidebarItems}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            title={activeTab === 'overview' ? 'Overview' : activeTab === 'my-orders' ? 'My Orders' : activeTab === 'my-bids' ? 'My Bids' : activeTab === 'wallet' ? 'Wallet' : activeTab === 'messages' ? 'Messages' : 'Dashboard'}
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

                    {/* Accepted Bids Alert - Go to Pay */}
                    {bids.filter(b => b.status === 'ACCEPTED').length > 0 && (
                        <Card className="border-green-500 bg-green-50 dark:bg-green-950/30">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl">🎉</div>
                                        <div>
                                            <h3 className="font-semibold text-green-700 dark:text-green-400">
                                                বিড গৃহীত হয়েছে!
                                            </h3>
                                            <p className="text-sm text-green-600 dark:text-green-500">
                                                আপনার {bids.filter(b => b.status === 'ACCEPTED').length}টি বিড গৃহীত হয়েছে। এখনই পেমেন্ট করে অর্ডার নিশ্চিত করুন।
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => setActiveTab('my-bids')}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <Wallet className="h-4 w-4 mr-2" />
                                        Pay & Confirm
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent Notifications */}
                    {notifications.filter(n => n.type === 'BID' && !n.is_read).length > 0 && (
                        <Card className="border-blue-500 bg-blue-50 dark:bg-blue-950/30">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg text-blue-700 dark:text-blue-400">🔔 নতুন বিড আপডেট</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {notifications.filter(n => n.type === 'BID' && !n.is_read).slice(0, 3).map((n, i) => (
                                        <div key={i} className="p-3 bg-white dark:bg-background rounded border text-sm whitespace-pre-line">
                                            {n.message_bn}
                                        </div>
                                    ))}
                                </div>
                                {notifications.filter(n => n.type === 'BID' && !n.is_read).length > 3 && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        +{notifications.filter(n => n.type === 'BID' && !n.is_read).length - 3} আরও নোটিফিকেশন
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}

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
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline" onClick={() => handleDownloadInvoice(o.id)}>
                                                        Invoice
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => setTrackingModal({ show: true, order: o })}>
                                                        <Truck className="h-4 w-4 mr-1" /> Track
                                                    </Button>
                                                </div>
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
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bids.map(b => (
                                        <TableRow key={b.id} className={b.status === 'ACCEPTED' ? 'bg-green-50 dark:bg-green-950/20' : b.status === 'REJECTED' ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                                            <TableCell className="font-medium">{b.cropTitle}</TableCell>
                                            <TableCell>{b.farmerName}</TableCell>
                                            <TableCell className="font-bold text-blue-600">৳{b.amount}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getStatusColor(b.status)}>
                                                    {b.status === 'ACCEPTED' ? '✅ গৃহীত' : b.status === 'REJECTED' ? '❌ প্রত্যাখ্যাত' : b.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{b.bidTime}</TableCell>
                                            <TableCell>
                                                {b.status === 'ACCEPTED' && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => setPaymentModal({ show: true, bid: b, address: '', mobile: '' })}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        💳 Pay & Order
                                                    </Button>
                                                )}
                                                {b.status === 'REJECTED' && (
                                                    <span className="text-xs text-muted-foreground">প্রত্যাখ্যাত</span>
                                                )}
                                            </TableCell>
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
                            {transactions.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">No recent transactions</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Description</TableHead>
                                                <TableHead className="text-right">Amount</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {transactions.map((t, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell className="text-sm">
                                                        {new Date(t.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        <br />
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(t.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={t.type === 'CREDIT' ? 'default' : 'destructive'}>
                                                            {t.type === 'CREDIT' ? '↓ Credit' : '↑ Debit'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="max-w-md">
                                                            <div className="font-medium text-sm">{t.description}</div>
                                                            <div className="text-xs text-muted-foreground">{t.source}</div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className={`font-bold ${t.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                                                            {t.type === 'CREDIT' ? '+' : '-'}৳{t.amount}
                                                        </span>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Messages */}
            {activeTab === 'messages' && <MessagesPage />}



            {/* Change Password */}
            {activeTab === 'change-password' && <ChangePasswordPage />}

            {/* Payment Modal for Accepted Bids */}
            {paymentModal.show && paymentModal.bid && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <h3 className="text-xl font-bold mb-4">💳 অর্ডার নিশ্চিত করুন</h3>

                        <div className="bg-muted p-4 rounded-lg mb-4 space-y-2">
                            <p><strong>ফসল:</strong> {paymentModal.bid.cropTitle}</p>
                            <p><strong>পরিমাণ:</strong> {paymentModal.bid.quantity || 1} কেজি</p>
                            <p><strong>মূল্য:</strong> ৳{paymentModal.bid.farmerCounterPrice || paymentModal.bid.amount}/কেজি</p>
                            <div className="border-t pt-2 mt-2">
                                <p className="text-lg"><strong>মোট:</strong> ৳{((paymentModal.bid.farmerCounterPrice || paymentModal.bid.amount) * (paymentModal.bid.quantity || 1)).toFixed(0)}</p>
                                <p className="text-green-600 font-bold">অগ্রিম (20%): ৳{Math.ceil((paymentModal.bid.farmerCounterPrice || paymentModal.bid.amount) * (paymentModal.bid.quantity || 1) * 0.20)}</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium">ঠিকানা *</label>
                                <Input
                                    placeholder="আপনার সম্পূর্ণ ঠিকানা"
                                    value={paymentModal.address}
                                    onChange={(e) => setPaymentModal(prev => ({ ...prev, address: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">মোবাইল নম্বর *</label>
                                <Input
                                    placeholder="01XXXXXXXXX"
                                    value={paymentModal.mobile}
                                    onChange={(e) => setPaymentModal(prev => ({ ...prev, mobile: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setPaymentModal({ show: false, bid: null, address: '', mobile: '' })}
                            >
                                বাতিল
                            </Button>
                            <Button
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                onClick={processPaymentFromBid}
                                disabled={loading}
                            >
                                {loading ? 'প্রসেসিং...' : '✅ ২০% অগ্রিম দিয়ে অর্ডার করুন'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tracking Modal */}
            {trackingModal.show && trackingModal.order && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Truck className="h-5 w-5" /> অর্ডার ট্র্যাকিং
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => setTrackingModal({ show: false, order: null })}>✕</Button>
                        </div>

                        <div className="space-y-6 relative ml-4">
                            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-muted -z-10" />

                            {[
                                { status: 'PENDING', label: 'অর্ডার প্লেস করা হয়েছে', icon: Clock },
                                { status: 'CONFIRMED', label: 'অর্ডার নিশ্চিত করা হয়েছে', icon: CheckCircle },
                                { status: 'SHIPPED', label: 'শিপমেন্টে আছে', icon: Truck },
                                { status: 'DELIVERED', label: 'ডেলিভারি সম্পন্ন হয়েছে', icon: Package }
                            ].map((step, index) => {
                                const orderStatus = trackingModal.order.status;
                                const steps = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
                                const currentStepIndex = steps.indexOf(orderStatus === 'PENDING_ADVANCE' ? 'CONFIRMED' : orderStatus);
                                const isCompleted = index <= currentStepIndex;
                                const isActive = index === currentStepIndex;

                                return (
                                    <div key={step.status} className="flex items-center gap-4">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${isCompleted ? 'bg-green-100 border-green-600 text-green-600' : 'bg-background border-muted text-muted-foreground'}`}>
                                            <step.icon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className={`font-medium ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</div>
                                            {isActive && <div className="text-xs text-green-600 font-medium">বর্তমান অবস্থা</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-8 pt-4 border-t">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Order ID: #{trackingModal.order.id}</span>
                                <span className="font-medium text-green-600">{trackingModal.order.status}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
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
