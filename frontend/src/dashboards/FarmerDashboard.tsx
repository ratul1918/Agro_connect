import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addCrop, getMarketPrices } from '../api/endpoints';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '../components/ui/button';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useNotification } from '../context/NotificationContext';
import api, { BASE_URL } from '../api/axios';
import { Leaf, Package, Ship, FileCheck, Plus, BarChart3, MessageSquare, Users, Printer, Check, X, Trash2, Edit2, PackageX, DollarSign, Wallet, Bot } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import MobileCard from '../components/ui/MobileCard';
import MobileStatCard from '../components/ui/MobileStatCard';
import ChangePasswordPage from '../pages/ChangePasswordPage';
import AIChatPage from '../pages/AIChatPage';
import MessagesPage from '../pages/MessagesPage';
import AgronomistDirectoryPage from '../pages/AgronomistDirectoryPage';
import ConfirmModal from '../components/ConfirmModal';
import WeatherWidget from '../components/WeatherWidget';

interface Order {
    id: number;
    buyerId: number;
    buyerName: string;
    cropId: number;
    cropTitle: string;
    totalAmount: number;
    advanceAmount: number;
    dueAmount: number;
    status: string;
    createdAt: string;
}

interface ExportApplication {
    id: number;
    cropDetails: string;
    quantity: number;
    destinationCountry: string;
    status: string;
    adminNotes: string;
    createdAt: string;
}

interface Bid {
    id: number;
    cropId: number;
    cropTitle: string;
    buyerId: number;
    buyerName: string;
    buyerEmail: string;
    amount: number;
    bidTime: string;
    status: string;
}

interface MyCrop {
    id: number;
    title: string;
    quantity: number;
    unit: string;
    minPrice: number;
    isSold: boolean;
}

interface MarketPrice {
    id: number;
    cropTypeId: number;
    cropTypeName: string;
    district: string;
    price: number;
    priceDate: string;
}

interface Blog {
    id: number;
    title: string;
    content: string;
    authorName: string;
    type: string; // 'NORMAL' or 'TIP'
    thumbnailUrl?: string;
    createdAt: string;
}



const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const FarmerDashboard: React.FC = () => {
    const { success, error } = useNotification();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [orders, setOrders] = useState<Order[]>([]);
    const [exports, setExports] = useState<ExportApplication[]>([]);
    const [bids, setBids] = useState<Bid[]>([]);
    const [myCrops, setMyCrops] = useState<MyCrop[]>([]);
    const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    const [pendingMoney, setPendingMoney] = useState(0);
    const [totalIncome, setTotalIncome] = useState(0);
    const [cashoutAmount, setCashoutAmount] = useState('');
    const [transactions, setTransactions] = useState<any[]>([]);
    const [cashoutRequests, setCashoutRequests] = useState<any[]>([]);
    const [confirmAction, setConfirmAction] = useState<{
        show: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant?: 'default' | 'destructive';
    }>({ show: false, title: '', message: '', onConfirm: () => { } });

    // Add Crop Form
    const [title, setTitle] = useState('');
    const [desc, setDesc] = useState('');
    const [type, setType] = useState('1');
    const [qty, setQty] = useState('');
    const [unit, setUnit] = useState('kg');
    const [price, setPrice] = useState('');
    const [location, setLocation] = useState('');
    const [images, setImages] = useState<FileList | null>(null);

    // Export Form
    const [exportDetails, setExportDetails] = useState('');
    const [exportQty, setExportQty] = useState('');
    const [exportDest, setExportDest] = useState('');

    useEffect(() => {
        fetchOrders();
        fetchExports();
        fetchBids();
        fetchMyCrops();
        fetchMarketPrices();
        fetchBlogs();
        fetchWalletBalance();
        fetchPendingMoney();
        fetchTotalIncome();
        fetchTransactions();
        fetchCashoutRequests();
    }, []);

    const fetchWalletBalance = async () => {
        try {
            const res = await api.get('/wallet/balance');
            setWalletBalance(res.data.balance || 0);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchPendingMoney = async () => {
        try {
            const res = await api.get('/features/farmer/pending-money');
            setPendingMoney(res.data.pendingMoney || 0);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTotalIncome = async () => {
        try {
            const res = await api.get('/features/farmer/total-income');
            setTotalIncome(res.data.totalIncome || 0);
        } catch (err) {
            console.error(err);
        }
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

    const fetchCashoutRequests = async () => {
        try {
            const res = await api.get('/cashout/my-requests');
            setCashoutRequests(res.data || []);
        } catch (err) {
            console.error('Failed to fetch cashout requests:', err);
            setCashoutRequests([]);
        }
    };

    const handleCashout = async () => {
        try {
            if (!cashoutAmount || parseFloat(cashoutAmount) <= 0) {
                error('Please enter a valid amount');
                return;
            }
            if (parseFloat(cashoutAmount) > walletBalance) {
                error('Insufficient balance');
                return;
            }
            await api.post('/cashout/request', {
                amount: parseFloat(cashoutAmount),
                paymentMethod: 'BKASH', // Default to bKash
                accountDetails: '' // Can be added later if needed
            });
            success('Cashout request sent successfully');
            setCashoutAmount('');
            fetchWalletBalance();
        } catch (err) {
            error('Failed to request cashout');
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await api.get('/features/farmer/orders');
            setOrders(res.data);
        } catch (err) {
            setOrders([]);
        }
    };

    const fetchExports = async () => {
        try {
            const res = await api.get('/features/farmer/exports');
            setExports(res.data);
        } catch (err) {
            setExports([]);
        }
    };

    const fetchBids = async () => {
        try {
            const res = await api.get('/features/farmer/bids');
            setBids(res.data);
        } catch (err) {
            setBids([]);
        }
    };

    const fetchMyCrops = async () => {
        try {
            const res = await api.get('/crops/my');
            setMyCrops(res.data);
        } catch (err) {
            setMyCrops([]);
        }
    };

    const fetchMarketPrices = async () => {
        try {
            const res = await getMarketPrices();
            setMarketPrices(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchBlogs = async () => {
        try {
            const res = await api.get('/blogs');
            setBlogs(res.data);
        } catch (err) {
            console.error("Failed to fetch blogs");
            setBlogs([]);
        }
    };



    const handleAddCrop = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return; // Prevent duplicate submissions
        setLoading(true);
        
        // Validate required fields
        if (!title.trim()) {
            error('Product name is required');
            setLoading(false);
            return;
        }
        if (!desc.trim()) {
            error('Description is required');
            setLoading(false);
            return;
        }
        if (!qty.trim()) {
            error('Quantity is required');
            setLoading(false);
            return;
        }
        if (!price.trim()) {
            error('Unit price is required');
            setLoading(false);
            return;
        }
        if (!location.trim()) {
            error('Location is required');
            setLoading(false);
            return;
        }
        
        const formData = new FormData();
        formData.append('title', title.trim());
        formData.append('description', desc.trim());
        formData.append('cropTypeId', type);
        formData.append('quantity', qty.trim());
        formData.append('unit', unit);
        formData.append('minPrice', price.trim());
        formData.append('location', location.trim());
        formData.append('marketType', 'B2B');

        if (images) {
            for (let i = 0; i < images.length; i++) {
                formData.append('images', images[i]);
            }
        }

        try {
            await addCrop(formData);
            success('ফসল সফলভাবে আপলোড করা হয়েছে!');
            setTitle(''); setDesc(''); setQty(''); setPrice(''); setLocation('');
            setActiveTab('my-crops');
            fetchMyCrops();
        } catch (err: any) {
            console.error(err);
            error(err.message || err.response?.data?.message || 'Error uploading crop');
        } finally {
            setLoading(false);
        }
    };

    const handleExportApply = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/features/export/apply', {
                cropDetails: exportDetails,
                quantity: parseFloat(exportQty),
                destination: exportDest
            });
            success('রপ্তানি আবেদন সফলভাবে জমা হয়েছে');
            setExportDetails(''); setExportQty(''); setExportDest('');
            fetchExports();
        } catch (err) {
            error('আবেদন জমা ব্যর্থ হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptOrder = (orderId: number) => {
        setConfirmAction({
            show: true,
            title: 'অর্ডার গ্রহণ করুন',
            message: 'আপনি কি এই অর্ডারটি গ্রহণ করতে চান?',
            variant: 'default',
            onConfirm: async () => {
                setConfirmAction(prev => ({ ...prev, show: false }));
                setLoading(true);
                try {
                    await api.put(`/features/farmer/orders/${orderId}/accept`);
                    success('অর্ডার গ্রহণ করা হয়েছে');
                    fetchOrders();
                } catch (err) {
                    error('অর্ডার গ্রহণ ব্যর্থ হয়েছে');
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleRejectOrder = (orderId: number) => {
        setConfirmAction({
            show: true,
            title: 'অর্ডার প্রত্যাখ্যান করুন',
            message: 'আপনি কি এই অর্ডারটি প্রত্যাখ্যান করতে চান?',
            variant: 'destructive',
            onConfirm: async () => {
                setConfirmAction(prev => ({ ...prev, show: false }));
                setLoading(true);
                try {
                    await api.put(`/features/farmer/orders/${orderId}/reject`);
                    success('অর্ডার প্রত্যাখ্যান করা হয়েছে');
                    fetchOrders();
                } catch (err) {
                    error('অর্ডার প্রত্যাখ্যান ব্যর্থ হয়েছে');
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleBidAction = async (id: number, action: 'accept' | 'reject') => {
        try {
            await api.put(`/features/farmer/bids/${id}/${action}`);
            success(`বিড ${action === 'accept' ? 'গ্রহণ' : 'প্রত্যাখ্যান'} করা হয়েছে!`);
            fetchBids();
        } catch (err) {
            error('Failed');
        }
    };

    const handleDeleteCrop = (cropId: number) => {
        setConfirmAction({
            show: true,
            title: 'ফসল মুছে ফেলুন',
            message: 'আপনি কি এই ফসলটি মুছে ফেলতে চান? এটি পুনরুদ্ধার করা যাবে না।',
            variant: 'destructive',
            onConfirm: async () => {
                setConfirmAction(prev => ({ ...prev, show: false }));
                setLoading(true);
                try {
                    await api.delete(`/crops/${cropId}`);
                    success('ফসল মুছে ফেলা হয়েছে');
                    fetchMyCrops();
                } catch (err) {
                    error('ফসল মুছে ফেলা ব্যর্থ হয়েছে');
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleStockToggle = async (cropId: number, isSold: boolean) => {
        setLoading(true);
        try {
            if (isSold) {
                await api.put(`/crops/${cropId}/back-in-stock`);
                success('ফসল আবার উপলব্ধ করা হয়েছে');
            } else {
                await api.put(`/crops/${cropId}/stock-out`);
                success('ফসল স্টক আউট করা হয়েছে');
            }
            fetchMyCrops();
        } catch (err) {
            error('স্ট্যাটাস পরিবর্তন ব্যর্থ হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    // Edit crop state
    const [editingCrop, setEditingCrop] = useState<MyCrop | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editQty, setEditQty] = useState('');
    const [editPrice, setEditPrice] = useState('');
    const [editLocation, setEditLocation] = useState('');

    const handleEditCrop = (crop: MyCrop) => {
        setEditingCrop(crop);
        setEditTitle(crop.title);
        setEditQty(String(crop.quantity));
        setEditPrice(String(crop.minPrice));
        setEditLocation('');
    };

    const handleUpdateCrop = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCrop) return;
        setLoading(true);
        const formData = new FormData();
        formData.append('title', editTitle);
        formData.append('description', '');
        formData.append('cropTypeId', '1');
        formData.append('quantity', editQty);
        formData.append('unit', editingCrop.unit || 'kg');
        formData.append('minPrice', editPrice);
        formData.append('location', editLocation || 'Bangladesh');
        try {
            await api.put(`/crops/${editingCrop.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            success('ফসল আপডেট করা হয়েছে');
            setEditingCrop(null);
            fetchMyCrops();
        } catch (err) {
            error('ফসল আপডেট ব্যর্থ হয়েছে');
        } finally {
            setLoading(false);
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
        { label: 'dashboard.overview', icon: BarChart3, value: 'overview' },
        { label: 'dashboard.add_crop', icon: Plus, value: 'add-crop' },
        { label: 'dashboard.my_crops', icon: Leaf, value: 'my-crops' },
        { label: 'dashboard.orders', icon: Package, value: 'orders' },
        { label: 'dashboard.exports', icon: Ship, value: 'exports' },
        { label: 'dashboard.bids', icon: FileCheck, value: 'bids' },
        { label: 'dashboard.messages', icon: MessageSquare, value: 'messages', onClick: () => navigate('/messages') },
        { label: 'dashboard.wallet', icon: DollarSign, value: 'wallet' },
        { label: 'dashboard.ai_chat', icon: Bot, value: 'ai-chat' },
    ];

    const getTitle = () => {
        if (activeTab === 'change-password') return t('dashboard.settings');
        if (activeTab === 'ai-chat') return t('dashboard.ai_chat');
        if (activeTab === 'blogs') return t('dashboard.blogs') || 'Blogs & Tips';
        if (activeTab === 'messages') return t('dashboard.messages');
        if (activeTab === 'find-agronomist') return 'Agonomist Directory';
        const item = sidebarItems.find(i => i.value === activeTab);
        return item ? t(item.label) : 'Dashboard';
    };

    const handleTabChange = (tab: string) => {
        if (tab === 'messages') {
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
            title={getTitle()}
        >
            {/* Overview */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        <MobileStatCard title={t('farmer.total_crops')} value={myCrops.length} icon={<span className="text-2xl">🌾</span>} color="green" />
                        <MobileStatCard title={t('farmer.total_orders')} value={orders.length} icon={<span className="text-2xl">📦</span>} color="blue" />
                        <MobileStatCard title={t('farmer.pending_money')} value={`৳${pendingMoney}`} icon={<span className="text-2xl">💰</span>} color="yellow" />
                        <MobileStatCard title={t('farmer.total_income')} value={`৳${totalIncome}`} icon={<span className="text-2xl">💵</span>} color="purple" />
                    </div>

                    {/* Weather Section */}
                    <WeatherWidget className="shadow-sm hover:shadow-md transition-shadow" />

                    <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                        {/* Sales Chart */}
                        <Card className="col-span-1 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle>{t('farmer.sales_overview')}</CardTitle>
                                <CardDescription>{t('farmer.sales_desc')}</CardDescription>
                            </CardHeader>
                            <CardContent style={{ height: '300px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={orders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED').slice(0, 10)}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                        <XAxis dataKey="cropTitle" fontSize={12} />
                                        <YAxis fontSize={12} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Legend />
                                        <Bar dataKey="totalAmount" name="BDT" fill="#16a34a" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                                {orders.filter(o => o.status === 'COMPLETED').length === 0 && <p className="text-center text-muted-foreground mt-[-150px]">{t('farmer.no_data')}</p>}
                            </CardContent>
                        </Card>

                        {/* Crop Distribution Pie Chart */}
                        <Card className="col-span-1 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle>{t('farmer.crop_dist')}</CardTitle>
                                <CardDescription>{t('farmer.crop_dist_desc')}</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px] flex items-center justify-center">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={myCrops as any[]}
                                            dataKey="quantity"
                                            nameKey="title"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            innerRadius={60}
                                            fill="#8884d8"
                                            label
                                        >
                                            {myCrops.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                                {myCrops.length === 0 && <p className="text-center text-muted-foreground mt-[-150px]">{t('farmer.no_data')}</p>}
                            </CardContent>
                        </Card>

                        {/* Market Prices */}
                        <Card className="col-span-2 shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle>{t('farmer.todays_market')}</CardTitle>
                                <CardDescription>{t('farmer.market_desc')}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Crop</TableHead>
                                                <TableHead>District</TableHead>
                                                <TableHead>Price (BDT)</TableHead>
                                                <TableHead>Date</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {marketPrices.slice(0, 10).map(mp => (
                                                <TableRow key={mp.id}>
                                                    <TableCell className="font-medium">{mp.cropTypeName || 'Unknown'}</TableCell>
                                                    <TableCell>{mp.district}</TableCell>
                                                    <TableCell className="font-bold text-green-600">৳{mp.price}</TableCell>
                                                    <TableCell>{new Date(mp.priceDate).toLocaleDateString()}</TableCell>
                                                </TableRow>
                                            ))}
                                            {marketPrices.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center text-muted-foreground">{t('farmer.no_data')}</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle>{t('farmer.recent_orders')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {orders.slice(0, 5).map(o => (
                                    <div key={o.id} className="flex justify-between items-center py-3 border-b last:border-0 border-border">
                                        <div className="flex-1">
                                            <div className="font-medium">{o.cropTitle}</div>
                                            <div className="text-sm text-muted-foreground">Buyer: {o.buyerName} • ৳{o.totalAmount}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={getStatusColor(o.status)}>{o.status}</Badge>
                                            <a href={`${BASE_URL.replace('/api', '')}/api/orders/${o.id}/invoice`} target="_blank" rel="noopener noreferrer">
                                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0"><Printer className="h-4 w-4" /></Button>
                                            </a>
                                        </div>
                                    </div>
                                ))}
                                {orders.length === 0 && <p className="text-muted-foreground text-center py-4">{t('farmer.no_data')}</p>}
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle>{t('farmer.pending_bids')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {bids.filter(b => b.status === 'PENDING').slice(0, 5).map(b => (
                                    <div key={b.id} className="flex justify-between items-center py-3 border-b last:border-0 border-border">
                                        <div>
                                            <div className="font-medium">{b.cropTitle}</div>
                                            <div className="text-sm text-muted-foreground">৳{b.amount} - {b.buyerName}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 h-8 text-xs" onClick={() => handleBidAction(b.id, 'accept')}>{t('farmer.accept')}</Button>
                                            <Button size="sm" variant="destructive" className="h-8 text-xs" onClick={() => handleBidAction(b.id, 'reject')}>{t('farmer.reject')}</Button>
                                        </div>
                                    </div>
                                ))}
                                {bids.filter(b => b.status === 'PENDING').length === 0 && <p className="text-muted-foreground text-center py-4">{t('farmer.no_data')}</p>}
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle>{t('farmer.transaction_history')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {transactions.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4">{t('farmer.no_data')}</p>
                                ) : (
                                    <div className="space-y-2">
                                        {transactions.slice(0, 5).map((t, idx) => (
                                            <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0 border-border">
                                                <div>
                                                    <div className="font-medium text-sm">{t.description}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(t.createdAt).toLocaleDateString()} • {t.source}
                                                    </div>
                                                </div>
                                                <div className={`font-bold ${t.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {t.type === 'CREDIT' ? '+' : '-'}৳{t.amount}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="shadow-sm hover:shadow-md transition-shadow">
                            <CardHeader>
                                <CardTitle>{t('farmer.cashout_history')}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {cashoutRequests.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-4">{t('farmer.no_data')}</p>
                                ) : (
                                    <div className="space-y-2">
                                        {cashoutRequests.slice(0, 5).map((req: any) => (
                                            <div key={req.id} className="flex justify-between items-center py-2 border-b last:border-0 border-border">
                                                <div className="flex-1">
                                                    <div className="font-medium">৳{req.amount}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(req.requestedAt).toLocaleDateString()} • {req.paymentMethod}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={req.status === 'APPROVED' ? 'default' : req.status === 'REJECTED' ? 'destructive' : 'outline'}>
                                                        {req.status}
                                                    </Badge>
                                                    {req.status === 'APPROVED' && (
                                                        <a href={`${BASE_URL.replace('/api', '')}/api/cashout/${req.id}/invoice`} target="_blank" rel="noopener noreferrer">
                                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0"><Printer className="h-4 w-4" /></Button>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Add Crop */}
            {/* Add Crop */}
            {activeTab === 'add-crop' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-4xl mx-auto"
                >
                    <div className="relative glass-card overflow-hidden rounded-3xl border border-white/20 dark:border-gray-800 shadow-2xl bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl">
                        {/* Decorative background gradients */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl"></div>

                        <div className="relative p-8">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20 text-white">
                                    <Plus className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">নতুন ফসলের তথ্য দিন</h2>
                                    <p className="text-gray-500 dark:text-gray-400">আপনার উৎপাদিত ফসলের বিস্তারিত তথ্য দিয়ে বিক্রির জন্য তালিকাভুক্ত করুন।</p>
                                </div>
                            </div>

                            <form onSubmit={handleAddCrop} className="space-y-6">
                                {/* Basic Info Section */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                        <FileCheck className="w-4 h-4" />
                                        সাধারণ তথ্য
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ফসলের নাম</label>
                                            <Input
                                                placeholder="যেমন: মিনিকেট চাল"
                                                value={title}
                                                onChange={e => setTitle(e.target.value)}
                                                required
                                                className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ধরন</label>
                                            <select
                                                className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                                value={type}
                                                onChange={e => setType(e.target.value)}
                                            >
                                                <option value="1">ধান (Rice)</option>
                                                <option value="2">গম (Wheat)</option>
                                                <option value="3">আলু (Potato)</option>
                                                <option value="4">টমেটো (Tomato)</option>
                                                <option value="5">পেঁয়াজ (Onion)</option>
                                                <option value="6">পাট (Jute)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">বিবরণ</label>
                                        <Textarea
                                            placeholder="ফসলের গুণাগুণ সম্পর্কে লিখুন..."
                                            value={desc}
                                            onChange={e => setDesc(e.target.value)}
                                            rows={3}
                                            className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-800/50 my-6"></div>

                                {/* Inventory & Pricing */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        মূল্য এবং পরিমাণ
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">পরিমাণ</label>
                                                <Input
                                                    type="number"
                                                    placeholder="0"
                                                    value={qty}
                                                    onChange={e => setQty(e.target.value)}
                                                    required
                                                    className="bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">একক</label>
                                                <select
                                                    className="w-full h-10 px-3 rounded-md border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                                    value={unit}
                                                    onChange={e => setUnit(e.target.value)}
                                                >
                                                    <option value="kg">কেজি (kg)</option>
                                                    <option value="ton">টন (ton)</option>
                                                    <option value="maund">মণ (maund)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ন্যূনতম মূল্য (টাকা)</label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-2.5 text-gray-500">৳</span>
                                                <Input
                                                    type="number"
                                                    placeholder="Example: 5000"
                                                    value={price}
                                                    onChange={e => setPrice(e.target.value)}
                                                    required
                                                    className="pl-8 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">অবস্থান</label>
                                        <div className="relative">
                                            <div className="absolute left-3 top-2.5 w-4 h-4 text-gray-400">
                                                <span className="text-lg">📍</span>
                                            </div>
                                            <Input
                                                placeholder="জেলা/উপজেলা"
                                                value={location}
                                                onChange={e => setLocation(e.target.value)}
                                                required
                                                className="pl-9 bg-white/50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 dark:border-gray-800/50 my-6"></div>

                                {/* Image Upload */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                        <span className="text-lg">🖼️</span>
                                        মিডিয়া
                                    </h3>

                                    <div className="bg-white/50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-center hover:border-green-500/50 transition-colors cursor-pointer relative group">
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={e => setImages(e.target.files)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="space-y-2 pointer-events-none">
                                            <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                                <Plus className="w-6 h-6" />
                                            </div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                ছবি আপলোড করতে ক্লিক করুন
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                সর্বোচ্চ ৫টি ছবি (JPG, PNG)
                                            </p>
                                        </div>
                                    </div>
                                    {images && <p className="text-sm text-green-600 font-medium text-center">{images.length} টি ছবি নির্বাচিত হয়েছে</p>}
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 transform hover:translate-y-[-2px] transition-all"
                                        disabled={loading}
                                    >
                                        {loading ? 'আপলোড হচ্ছে...' : 'আপলোড করুন'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* My Crops */}
            {activeTab === 'my-crops' && (
                <>
                    <Card>
                        <CardHeader>
                            <CardTitle>আমার ফসলের তালিকা</CardTitle>
                            <CardDescription>আপনার যোগ করা সকল ফসলের তালিকা।</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>নাম</TableHead>
                                            <TableHead>পরিমাণ</TableHead>
                                            <TableHead>মূল্য</TableHead>
                                            <TableHead>স্ট্যাটাস</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {myCrops.map(crop => (
                                            <TableRow key={crop.id}>
                                                <TableCell className="font-medium">{crop.title}</TableCell>
                                                <TableCell>{crop.quantity} {crop.unit}</TableCell>
                                                <TableCell>৳{crop.minPrice}</TableCell>
                                                <TableCell>
                                                    <Badge variant={crop.isSold ? "secondary" : "outline"} className={crop.isSold ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}>
                                                        {crop.isSold ? 'বিক্রিত' : 'উপলব্ধ'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex gap-1 justify-end">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                            onClick={() => handleEditCrop(crop)}
                                                            disabled={loading}
                                                            title="সম্পাদনা করুন"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className={crop.isSold ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-orange-600 hover:text-orange-700 hover:bg-orange-50"}
                                                            onClick={() => handleStockToggle(crop.id, crop.isSold)}
                                                            disabled={loading}
                                                            title={crop.isSold ? "স্টক ইন করুন" : "স্টক আউট করুন"}
                                                        >
                                                            <PackageX className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            onClick={() => handleDeleteCrop(crop.id)}
                                                            disabled={loading}
                                                            title="মুছে ফেলুন"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Edit Crop Modal */}
                    {editingCrop && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                            <div className="glass-card rounded-3xl border border-white/20 dark:border-gray-800 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                                {/* Header */}
                                <div className="sticky top-0 z-10 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border-b border-white/20 dark:border-gray-800 p-6 sm:p-8">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">ফসল সম্পাদনা করুন</h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">আপনার ফসলের তথ্য আপডেট করুন</p>
                                        </div>
                                        <button
                                            onClick={() => setEditingCrop(null)}
                                            disabled={loading}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Form Content */}
                                <form onSubmit={handleUpdateCrop} className="p-6 sm:p-8 space-y-6">
                                    {/* Basic Information */}
                                    <div className="bg-white/50 dark:bg-gray-800/30 rounded-2xl p-6 border border-white/20 dark:border-gray-700/50">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-6">মূল তথ্য</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ফসলের নাম</label>
                                                <Input 
                                                    value={editTitle} 
                                                    onChange={e => setEditTitle(e.target.value)} 
                                                    required 
                                                    className="h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                                    placeholder="যেমন - আমন ধান, গম"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Inventory & Pricing */}
                                    <div className="bg-white/50 dark:bg-gray-800/30 rounded-2xl p-6 border border-white/20 dark:border-gray-700/50">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-6">মূল্য এবং পরিমাণ</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">পরিমাণ (কেজিতে)</label>
                                                <Input 
                                                    type="number" 
                                                    step="0.01"
                                                    value={editQty} 
                                                    onChange={e => setEditQty(e.target.value)} 
                                                    required 
                                                    className="h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">মূল্য (টাকা/একক)</label>
                                                <div className="relative">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">৳</span>
                                                    <Input 
                                                        type="number" 
                                                        step="0.01"
                                                        value={editPrice} 
                                                        onChange={e => setEditPrice(e.target.value)} 
                                                        required 
                                                        className="pl-8 h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all font-mono"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    <div className="bg-white/50 dark:bg-gray-800/30 rounded-2xl p-6 border border-white/20 dark:border-gray-700/50">
                                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-6">অবস্থান</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">জেলা/উপজেলা</label>
                                            <Input 
                                                value={editLocation} 
                                                onChange={e => setEditLocation(e.target.value)} 
                                                placeholder="যেমন - ঢাকা, চট্টগ্রাম"
                                                className="h-12 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 justify-end pt-6 border-t border-gray-100 dark:border-gray-800">
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => setEditingCrop(null)} 
                                            disabled={loading}
                                            className="px-6 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold transition-colors disabled:opacity-50"
                                        >
                                            বাতিল
                                        </Button>
                                        <Button 
                                            type="submit" 
                                            disabled={loading} 
                                            className="px-8 h-12 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg shadow-green-600/20 hover:shadow-green-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    আপডেট হচ্ছে...
                                                </>
                                            ) : (
                                                <>আপডেট করুন</>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Wallet */}
            {activeTab === 'wallet' && (
                <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Wallet className="w-5 h-5" />
                                    ওয়ালেট ব্যালেন্স (Available Balance)
                                </CardTitle>
                                <CardDescription>আপনার বর্তমান উত্তোলনযোগ্য ব্যালেন্স</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">৳{walletBalance}</div>
                                <div className="mt-4 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">টাকার পরিমাণ (Amount)</label>
                                        <Input
                                            type="number"
                                            placeholder="উত্তোলন পরিমাণ লিখুন"
                                            value={cashoutAmount}
                                            onChange={e => setCashoutAmount(e.target.value)}
                                        />
                                    </div>
                                    <Button onClick={handleCashout} disabled={!cashoutAmount || parseFloat(cashoutAmount) <= 0 || parseFloat(cashoutAmount) > walletBalance}>
                                        নগদ উত্তোলন অনুরোধ (Request Cashout)
                                    </Button>
                                    <p className="text-xs text-muted-foreground">অ্যাডমিন অনুমোদনের পর টাকা আপনার অ্যাকাউন্টে জমা হবে।</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <DollarSign className="w-5 h-5" />
                                    অপেক্ষমাণ আয় (Pending Income)
                                </CardTitle>
                                <CardDescription>অর্ডার সম্পন্ন হলে এই টাকা মূল ব্যালেন্সে যোগ হবে</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-yellow-600">
                                    ৳{orders
                                        .filter(o => o.status !== 'DELIVERED' && o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && o.status !== 'REJECTED')
                                        .reduce((sum, o) => sum + o.totalAmount, 0)
                                        .toFixed(2)}
                                </div>
                                <div className="mt-4">
                                    <h4 className="font-medium mb-2">সাম্প্রতিক পেন্ডিং অর্ডার:</h4>
                                    <div className="space-y-2">
                                        {orders
                                            .filter(o => o.status !== 'DELIVERED' && o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && o.status !== 'REJECTED')
                                            .slice(0, 3)
                                            .map(o => (
                                                <div key={o.id} className="text-sm border-b pb-2">
                                                    <div className="flex justify-between">
                                                        <span>Order #{o.id}</span>
                                                        <span className="font-bold">৳{o.totalAmount}</span>
                                                    </div>
                                                    <div className="text-muted-foreground text-xs">{o.status}</div>
                                                </div>
                                            ))}
                                        {orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && o.status !== 'REJECTED').length === 0 && (
                                            <p className="text-sm text-muted-foreground">কোন পেন্ডিং অর্ডার নেই</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Cashout History Table */}
                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>নগদ উত্তোলনের ইতিহাস (Cashout History)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {cashoutRequests.length === 0 ? (
                                <p className="text-muted-foreground text-center py-4">কোন নগদ উত্তোলনের অনুরোধ নেই</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>তারিখ</TableHead>
                                                <TableHead>পরিমাণ</TableHead>
                                                <TableHead>মাধ্যম</TableHead>
                                                <TableHead>স্ট্যাটাস</TableHead>
                                                <TableHead>Invoice</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {cashoutRequests.map((req: any) => (
                                                <TableRow key={req.id}>
                                                    <TableCell>{new Date(req.requestedAt).toLocaleDateString('bn-BD')}</TableCell>
                                                    <TableCell className="font-bold">৳{req.amount}</TableCell>
                                                    <TableCell>{req.paymentMethod}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={req.status === 'APPROVED' ? 'default' : req.status === 'REJECTED' ? 'destructive' : 'outline'}>
                                                            {req.status === 'APPROVED' ? '✅ অনুমোদিত' : req.status === 'REJECTED' ? '❌ প্রত্যাখ্যাত' : '⏳ অপেক্ষমাণ'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        {req.status === 'APPROVED' && (
                                                            <a href={`${BASE_URL.replace('/api', '')}/api/cashout/${req.id}/invoice`} target="_blank" rel="noopener noreferrer">
                                                                <Button size="sm" variant="outline">📄 ডাউনলোড</Button>
                                                            </a>
                                                        )}
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

            {/* Orders */}
            {activeTab === 'orders' && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">অর্ডারের তালিকা</h2>
                    <div className="space-y-3">
                        {orders.map(o => (
                            <MobileCard key={o.id} padding="md">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-semibold text-lg">#{o.id}</p>
                                            <p className="text-sm text-muted-foreground">{o.cropTitle}</p>
                                        </div>
                                        <Badge variant="outline" className={getStatusColor(o.status)}>
                                            {o.status}
                                        </Badge>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">ক্রেতা:</span>
                                            <span className="font-medium">{o.buyerName}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">মোট:</span>
                                            <span className="font-medium">৳{o.totalAmount}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">অগ্রিম:</span>
                                            <span className="font-medium text-green-600">৳{o.advanceAmount}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">বাকি:</span>
                                            <span className="font-medium text-orange-600">৳{o.dueAmount}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        {o.status === 'PENDING' ? (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                                    onClick={() => handleAcceptOrder(o.id)}
                                                    disabled={loading}
                                                >
                                                    <Check className="w-4 h-4 mr-1" />
                                                    Accept
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    className="flex-1"
                                                    onClick={() => handleRejectOrder(o.id)}
                                                    disabled={loading}
                                                >
                                                    <X className="w-4 h-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => window.open(`${BASE_URL.replace('/api', '')}/api/orders/${o.id}/invoice`, '_blank')}
                                            >
                                                <Printer className="w-4 h-4 mr-1" />
                                                Invoice
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </MobileCard>
                        ))}
                    </div>
                    {orders.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>কোন অর্ডার নেই</p>
                        </div>
                    )}
                </div>
            )}

            {/* Exports */}
            {activeTab === 'exports' && (
                <div className="space-y-6">
                    <Card className="max-w-lg">
                        <CardHeader>
                            <CardTitle>রপ্তানি আবেদন</CardTitle>
                            <CardDescription>বিদেশে ফসল রপ্তানির জন্য আবেদন করুন।</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleExportApply} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">ফসলের বিবরণ</label>
                                    <Textarea placeholder="যেমন: প্রিমিয়াম বাসমতি চাল..."
                                        value={exportDetails} onChange={e => setExportDetails(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">পরিমাণ (কেজি)</label>
                                    <Input type="number" placeholder="500"
                                        value={exportQty} onChange={e => setExportQty(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">গন্তব্য দেশ</label>
                                    <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={exportDest} onChange={e => setExportDest(e.target.value)} required>
                                        <option value="">দেশ নির্বাচন করুন</option>
                                        <option value="India">ভারত</option>
                                        <option value="UAE">সংযুক্ত আরব আমিরাত</option>
                                        <option value="Saudi Arabia">সৌদি আরব</option>
                                        <option value="Malaysia">মালয়েশিয়া</option>
                                        <option value="UK">যুক্তরাজ্য</option>
                                        <option value="USA">যুক্তরাষ্ট্র</option>
                                        <option value="Other">অন্যান্য</option>
                                    </select>
                                </div>
                                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                                    {loading ? 'জমা দেওয়া হচ্ছে...' : 'আবেদন জমা দিন'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>পূর্ববর্তী আবেদনসমূহ</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>বিবরণ</TableHead>
                                        <TableHead>পরিমাণ</TableHead>
                                        <TableHead>গন্তব্য</TableHead>
                                        <TableHead>স্ট্যাটাস</TableHead>
                                        <TableHead>মন্তব্য</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {exports.map(e => (
                                        <TableRow key={e.id}>
                                            <TableCell className="font-medium">{e.cropDetails}</TableCell>
                                            <TableCell>{e.quantity} কেজি</TableCell>
                                            <TableCell>{e.destinationCountry}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getStatusColor(e.status)}>{e.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{e.adminNotes || '-'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Bids */}
            {activeTab === 'bids' && (
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle>{t('dashboard.bids')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Crop</TableHead>
                                    <TableHead>Buyer</TableHead>
                                    <TableHead>Bid Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {bids.map(b => (
                                    <TableRow key={b.id}>
                                        <TableCell className="font-medium">{b.cropTitle}</TableCell>
                                        <TableCell>
                                            <div>{b.buyerName}</div>
                                            <div className="text-xs text-muted-foreground">{b.buyerEmail}</div>
                                        </TableCell>
                                        <TableCell className="font-bold text-green-600">৳{b.amount}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={getStatusColor(b.status)}>{b.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {b.status === 'PENDING' && (
                                                <div className="flex gap-2 justify-end">
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleBidAction(b.id, 'accept')}>{t('farmer.accept')}</Button>
                                                    <Button size="sm" variant="destructive" onClick={() => handleBidAction(b.id, 'reject')}>{t('farmer.reject')}</Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {bids.length === 0 && <p className="text-center py-8 text-muted-foreground">{t('farmer.no_data')}</p>}
                    </CardContent>
                </Card>
            )}

            {/* Change Password */}
            {activeTab === 'change-password' && <ChangePasswordPage />}

            {/* Messages */}
            {activeTab === 'messages' && <MessagesPage />}

            {/* Find Agronomist */}
            {activeTab === 'find-agronomist' && <AgronomistDirectoryPage />}

            {/* Blogs Tab */}
            {activeTab === 'blogs' && (
                <div className="space-y-6">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Agricultural Tips & Blogs</CardTitle>
                            <CardDescription>Expert advice and modern farming techniques</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {blogs.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">{t('farmer.no_data')}</div>
                            ) : (
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {blogs.map(blog => (
                                        <Card key={blog.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700">
                                            {blog.thumbnailUrl && (
                                                <div className="h-48 overflow-hidden">
                                                    <img src={blog.thumbnailUrl} alt={blog.title} className="w-full h-full object-cover transition-transform hover:scale-105" />
                                                </div>
                                            )}
                                            <CardContent className="p-5">
                                                <div className="flex justify-between items-start mb-2">
                                                    <Badge variant={blog.type === 'TIP' ? 'secondary' : 'default'} className="mb-2">
                                                        {blog.type === 'TIP' ? '💡 Tip' : '📝 Article'}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">{new Date(blog.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <h3 className="font-bold text-lg mb-2 line-clamp-2 hover:text-green-600 transition-colors">{blog.title}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">{blog.content.substring(0, 100)}...</p>
                                                <div className="flex justify-between items-center text-xs text-muted-foreground pt-4 border-t border-gray-100 dark:border-gray-700">
                                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {blog.authorName || 'Agronomist'}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* AI Chat */}
            {activeTab === 'ai-chat' && <AIChatPage />}

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmAction.show}
                title={confirmAction.title}
                message={confirmAction.message}
                variant={confirmAction.variant}
                onConfirm={confirmAction.onConfirm}
                onCancel={() => setConfirmAction(prev => ({ ...prev, show: false }))}
            />
        </DashboardLayout>
    );
};

export const _StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({ title, value, icon, color }) => {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <h3 className="text-2xl font-bold mt-1">{value}</h3>
                </div>
                <div className={`p-3 rounded-full bg-${color}-100 dark:bg-${color}-900/20`}>
                    <span className="text-2xl">{icon}</span>
                </div>
            </CardContent>
        </Card>
    );
};

export default FarmerDashboard;
