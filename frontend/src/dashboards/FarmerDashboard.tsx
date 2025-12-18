import React, { useEffect, useState } from 'react';
import { addCrop, getMarketPrices } from '../api/endpoints';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useNotification } from '../context/NotificationContext';
import api from '../api/axios';
import { Leaf, Package, Ship, FileCheck, Plus, BarChart3, Bot, MessageSquare, Users, Printer, BookOpen, Check, X, Trash2, Edit2, PackageX } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import ChangePasswordPage from '../pages/ChangePasswordPage';
import AIChatPage from '../pages/AIChatPage';
import MessagesPage from '../pages/MessagesPage';
import AgronomistDirectoryPage from '../pages/AgronomistDirectoryPage';

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
    const [activeTab, setActiveTab] = useState('overview');
    const [orders, setOrders] = useState<Order[]>([]);
    const [exports, setExports] = useState<ExportApplication[]>([]);
    const [bids, setBids] = useState<Bid[]>([]);
    const [myCrops, setMyCrops] = useState<MyCrop[]>([]);
    const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(false);

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
    }, []);

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
        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', desc);
        formData.append('cropTypeId', type);
        formData.append('quantity', qty);
        formData.append('unit', unit);
        formData.append('minPrice', price);
        formData.append('location', location);
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
            await api.post('/features/farmer/export-application', {
                cropDetails: exportDetails,
                quantity: parseFloat(exportQty),
                destinationCountry: exportDest
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

    const handleAcceptOrder = async (orderId: number) => {
        if (!window.confirm('আপনি কি এই অর্ডারটি গ্রহণ করতে চান?')) {
            return;
        }
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
    };

    const handleRejectOrder = async (orderId: number) => {
        if (!window.confirm('আপনি কি এই অর্ডারটি প্রত্যাখ্যান করতে চান?')) {
            return;
        }
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

    const handleDeleteCrop = async (cropId: number) => {
        if (!window.confirm('আপনি কি এই ফসলটি মুছে ফেলতে চান?')) {
            return;
        }
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
        { label: 'সারাংশ (Overview)', icon: BarChart3, value: 'overview' },
        { label: 'ফসল যোগ করুন (Add Crop)', icon: Plus, value: 'add-crop' },
        { label: 'আমার ফসল (My Crops)', icon: Leaf, value: 'my-crops' },
        { label: 'অর্ডার (Orders)', icon: Package, value: 'orders' },
        { label: 'রপ্তানি (Exports)', icon: Ship, value: 'exports' },
        { label: 'বিড (Bids)', icon: FileCheck, value: 'bids' },
        { label: 'বার্তা (Messages)', icon: MessageSquare, value: 'messages' },
        { label: 'AI সহায়তা (AI Chat)', icon: Bot, value: 'ai-chat' },
    ];

    const getTitle = () => {
        if (activeTab === 'change-password') return 'Change Password';
        if (activeTab === 'ai-chat') return 'AI সহায়তা (AI Chat)';
        if (activeTab === 'blogs') return 'ব্লগ ও কৃষি টিপস';
        if (activeTab === 'messages') return 'বার্তা (Messages)';
        if (activeTab === 'find-agronomist') return 'কৃষিবিদ খুঁজুন (Find Agronomist)';
        const item = sidebarItems.find(i => i.value === activeTab);
        return item ? item.label : 'Dashboard';
    };

    return (
        <DashboardLayout
            sidebarItems={sidebarItems}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            title={getTitle()}
        >
            {/* Overview */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard title="মোট ফসল" value={myCrops.length} icon="🌾" color="green" />
                        <StatCard title="অর্ডার" value={orders.length} icon="📦" color="blue" />
                        <StatCard title="রপ্তানি আবেদন" value={exports.length} icon="🚢" color="purple" />
                        <StatCard title="বিড" value={bids.filter(b => b.status === 'PENDING').length} icon="💰" color="yellow" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Sales Chart */}
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>আয় ও বিক্রয় (Sales Overview)</CardTitle>
                                <CardDescription>গত কয়েকদিনের আয়ের পরিসংখ্যান</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={orders.filter(o => o.status === 'COMPLETED' || o.status === 'DELIVERED').slice(0, 10)}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="cropTitle" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="totalAmount" name="টাকা (BDT)" fill="#16a34a" />
                                    </BarChart>
                                </ResponsiveContainer>
                                {orders.filter(o => o.status === 'COMPLETED').length === 0 && <p className="text-center text-muted-foreground mt-[-150px]">কোন বিক্রয় তথ্য নেই</p>}
                            </CardContent>
                        </Card>

                        {/* Crop Distribution Pie Chart */}
                        <Card className="col-span-1">
                            <CardHeader>
                                <CardTitle>ফসল বন্টন (Crop Distribution)</CardTitle>
                                <CardDescription>মজুদ ফসলের পরিমাণ</CardDescription>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={myCrops as any[]}
                                            dataKey="quantity"
                                            nameKey="title"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            fill="#8884d8"
                                            label
                                        >
                                            {myCrops.map((_, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                                {myCrops.length === 0 && <p className="text-center text-muted-foreground mt-[-150px]">কোন ফসল নেই</p>}
                            </CardContent>
                        </Card>

                        {/* Market Prices */}
                        <Card className="col-span-2">
                            <CardHeader>
                                <CardTitle>আজকের বাজার দর (Today's Market Price)</CardTitle>
                                <CardDescription>সরকারি বাজার দর (প্রতি কেজি/একক)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ফসল</TableHead>
                                                <TableHead>জেলা</TableHead>
                                                <TableHead>দর (টকা)</TableHead>
                                                <TableHead>তারিখ</TableHead>
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
                                                    <TableCell colSpan={4} className="text-center text-muted-foreground">বাজার দর পাওয়া যায়নি</TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>সাম্প্রতিক অর্ডার</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {orders.slice(0, 5).map(o => (
                                    <div key={o.id} className="flex justify-between items-center py-2 border-b last:border-0 border-border">
                                        <div>
                                            <div className="font-medium">{o.cropTitle}</div>
                                            <div className="text-sm text-muted-foreground">ক্রেতা: {o.buyerName}</div>
                                        </div>
                                        <Badge variant="outline" className={getStatusColor(o.status)}>{o.status}</Badge>
                                    </div>
                                ))}
                                {orders.length === 0 && <p className="text-muted-foreground">কোন অর্ডার নেই</p>}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>অপেক্ষমাণ বিড</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {bids.filter(b => b.status === 'PENDING').slice(0, 5).map(b => (
                                    <div key={b.id} className="flex justify-between items-center py-2 border-b last:border-0 border-border">
                                        <div>
                                            <div className="font-medium">{b.cropTitle}</div>
                                            <div className="text-sm text-muted-foreground">৳{b.amount} - {b.buyerName}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleBidAction(b.id, 'accept')}>গ্রহণ</Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleBidAction(b.id, 'reject')}>বাতিল</Button>
                                        </div>
                                    </div>
                                ))}
                                {bids.filter(b => b.status === 'PENDING').length === 0 && <p className="text-muted-foreground">কোন অপেক্ষমাণ বিড নেই</p>}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}

            {/* Add Crop */}
            {activeTab === 'add-crop' && (
                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>নতুন ফসলের তথ্য দিন</CardTitle>
                        <CardDescription>আপনার উৎপাদিত ফসলের বিস্তারিত তথ্য দিয়ে বিক্রির জন্য তালিকাভুক্ত করুন।</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddCrop} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">ফসলের নাম</label>
                                <Input placeholder="যেমন: মিনিকেট চাল" value={title} onChange={e => setTitle(e.target.value)} required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">বিবরণ</label>
                                <Textarea placeholder="ফসলের গুণাগুণ সম্পর্কে লিখুন..." value={desc} onChange={e => setDesc(e.target.value)} />
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">ধরন</label>
                                    <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={type} onChange={e => setType(e.target.value)}>
                                        <option value="1">ধান (Rice)</option>
                                        <option value="2">গম (Wheat)</option>
                                        <option value="3">আলু (Potato)</option>
                                        <option value="4">টমেটো (Tomato)</option>
                                        <option value="5">পেঁয়াজ (Onion)</option>
                                        <option value="6">পাট (Jute)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">পরিমাণ</label>
                                    <Input type="number" placeholder="0" value={qty} onChange={e => setQty(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">একক</label>
                                    <select className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        value={unit} onChange={e => setUnit(e.target.value)}>
                                        <option value="kg">কেজি (kg)</option>
                                        <option value="ton">টন (ton)</option>
                                        <option value="maund">মণ (maund)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">ন্যূনতম মূল্য (টাকা)</label>
                                    <Input type="number" placeholder="Example: 5000" value={price} onChange={e => setPrice(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">অবস্থান</label>
                                    <Input placeholder="জেলা/উপজেলা" value={location} onChange={e => setLocation(e.target.value)} required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">ছবি আপলোড</label>
                                <Input type="file" multiple onChange={e => setImages(e.target.files)} className="cursor-pointer" />
                            </div>

                            <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                                {loading ? 'আপলোড হচ্ছে...' : 'আপলোড করুন'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
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
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <Card className="w-full max-w-md mx-4">
                                <CardHeader>
                                    <CardTitle>ফসল সম্পাদনা করুন</CardTitle>
                                    <CardDescription>ফসলের তথ্য পরিবর্তন করুন</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleUpdateCrop} className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">ফসলের নাম</label>
                                            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} required />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">পরিমাণ</label>
                                                <Input type="number" value={editQty} onChange={e => setEditQty(e.target.value)} required />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">মূল্য (টাকা)</label>
                                                <Input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} required />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">অবস্থান</label>
                                            <Input value={editLocation} onChange={e => setEditLocation(e.target.value)} placeholder="জেলা/উপজেলা" />
                                        </div>
                                        <div className="flex gap-2 pt-4">
                                            <Button type="submit" disabled={loading} className="flex-1 bg-green-600 hover:bg-green-700">
                                                {loading ? 'আপডেট হচ্ছে...' : 'আপডেট করুন'}
                                            </Button>
                                            <Button type="button" variant="outline" onClick={() => setEditingCrop(null)} className="flex-1">
                                                বাতিল
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </>
            )}

            {/* Orders */}
            {activeTab === 'orders' && (
                <Card>
                    <CardHeader>
                        <CardTitle>অর্ডারের তালিকা</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>ফসল</TableHead>
                                        <TableHead>ক্রেতা</TableHead>
                                        <TableHead>মোট</TableHead>
                                        <TableHead>অগ্রিম</TableHead>
                                        <TableHead>বাকি</TableHead>
                                        <TableHead>স্ট্যাটাস</TableHead>
                                        <TableHead>Actions</TableHead>
                                        <TableHead>Invoice</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map(o => (
                                        <TableRow key={o.id}>
                                            <TableCell>{o.id}</TableCell>
                                            <TableCell className="font-medium">{o.cropTitle}</TableCell>
                                            <TableCell>{o.buyerName}</TableCell>
                                            <TableCell>৳{o.totalAmount}</TableCell>
                                            <TableCell>৳{o.advanceAmount}</TableCell>
                                            <TableCell>৳{o.dueAmount}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={getStatusColor(o.status)}>{o.status}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                {o.status === 'PENDING' ? (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="default"
                                                            className="bg-green-600 hover:bg-green-700 text-white"
                                                            onClick={() => handleAcceptOrder(o.id)}
                                                            disabled={loading}
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleRejectOrder(o.id)}
                                                            disabled={loading}
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Button size="sm" variant="ghost" onClick={() => window.open(`http://localhost:8080/api/orders/${o.id}/invoice`, '_blank')}>
                                                    <Printer className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
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
                <Card>
                    <CardHeader>
                        <CardTitle>প্রাপ্ত বিডসমূহ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ফসল</TableHead>
                                    <TableHead>ক্রেতা</TableHead>
                                    <TableHead>বিড পরিমাণ</TableHead>
                                    <TableHead>স্ট্যাটাস</TableHead>
                                    <TableHead>অ্যাকশন</TableHead>
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
                                        <TableCell>
                                            {b.status === 'PENDING' && (
                                                <div className="flex gap-2">
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleBidAction(b.id, 'accept')}>গ্রহণ</Button>
                                                    <Button size="sm" variant="destructive" onClick={() => handleBidAction(b.id, 'reject')}>বাতিল</Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
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
                    <Card>
                        <CardHeader>
                            <CardTitle>কৃষি পরামর্শ ও ব্লগ</CardTitle>
                            <CardDescription>বিশেষজ্ঞদের কাছ থেকে আধুনিক কৃষি পদ্ধতি এবং টিপস জানুন</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {blogs.length === 0 ? (
                                <div className="text-center py-10 text-muted-foreground">কোন ব্লগ বা টিপস পাওয়া যায়নি</div>
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
                                                        {blog.type === 'TIP' ? '💡 কৃষি টিপস' : '📝 নিবন্ধ'}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">{new Date(blog.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <h3 className="font-bold text-lg mb-2 line-clamp-2 hover:text-green-600 transition-colors">{blog.title}</h3>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">{blog.content.substring(0, 100)}...</p>
                                                <div className="flex justify-between items-center text-xs text-muted-foreground pt-4 border-t border-gray-100 dark:border-gray-700">
                                                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {blog.authorName || 'Agronomist'}</span>
                                                    {/* Ideally link to full blog view if needed */}
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
        </DashboardLayout>
    );
};

const StatCard: React.FC<{ title: string; value: number; icon: string; color: string }> = ({ title, value, icon, color }) => {
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
