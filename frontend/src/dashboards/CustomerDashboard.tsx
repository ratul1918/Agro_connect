import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import api from '../api/axios';
import { Package, ShoppingCart, BarChart3, Truck, CheckCircle, Clock, ShoppingBag, User } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Badge } from '../components/ui/badge';
import MobileCard from '../components/ui/MobileCard';
import MobileStatCard from '../components/ui/MobileStatCard';
import { Input } from '../components/ui/input';

interface Order {
    id: number;
    cropTitle: string;
    quantity: number;
    totalAmount: number;
    status: string;
    deliveryStatus: string;
    createdAt: string;
}

interface UserProfile {
    fullName: string;
    email: string;
    phone: string;
    division: string;
    district: string;
    upazila: string;
    thana: string;
    postCode: string;
}

const CustomerDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [orders, setOrders] = useState<Order[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState<UserProfile>({
        fullName: '', email: '', phone: '', division: '', district: '', upazila: '', thana: '', postCode: ''
    });
    const [loading, setLoading] = useState(false);
    const [trackingModal, setTrackingModal] = useState<{ show: boolean; order: Order | null }>({ show: false, order: null });
    const [isLoading, setIsLoading] = useState(true);

    const sidebarItems = [
        { label: 'সারাংশ (Overview)', icon: BarChart3, value: 'overview' },
        { label: 'রিটেইল শপ (Shop)', icon: ShoppingBag, value: 'shop', onClick: () => navigate('/marketplace/retail') },
        { label: 'আমার অর্ডার (My Orders)', icon: Package, value: 'orders' },
        { label: 'কার্ট (Cart)', icon: ShoppingCart, value: 'cart', onClick: () => navigate('/cart') },
        { label: 'প্রোফাইল (Profile)', icon: User, value: 'profile' },
    ];

    useEffect(() => {
        // Only fetch data if user is authenticated
        const token = localStorage.getItem('token');
        if (token) {
            fetchOrders();
            fetchProfile();
        }
        setIsLoading(false);
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/customer/orders');
            setOrders(res.data || []);
        } catch (err: any) {
            console.error('Failed to fetch orders', err);
            if (err?.status === 401) {
                // Token expired, will be handled by axios interceptor
                return;
            }
            setOrders([]);
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await api.get('/auth/me');
            setProfile(res.data);
            setProfileForm(res.data);
        } catch (err: any) {
            console.error('Failed to fetch profile', err);
            if (err?.status === 401) {
                // Token expired, will be handled by axios interceptor
                return;
            }
            // Don't log out user for profile fetch failures, just keep using stored data
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    setProfile({
                        fullName: userData.fullName || '',
                        email: userData.email || '',
                        phone: userData.phone || '',
                        division: userData.division || '',
                        district: userData.district || '',
                        upazila: userData.upazila || '',
                        thana: userData.thana || '',
                        postCode: userData.postCode || ''
                    });
                    setProfileForm({
                        fullName: userData.fullName || '',
                        email: userData.email || '',
                        phone: userData.phone || '',
                        division: userData.division || '',
                        district: userData.district || '',
                        upazila: userData.upazila || '',
                        thana: userData.thana || '',
                        postCode: userData.postCode || ''
                    });
                } catch (parseError) {
                    console.error('Failed to parse stored user data:', parseError);
                }
            }
        }
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            await api.put('/auth/profile', profileForm);
            setProfile(profileForm);
            setEditingProfile(false);
        } catch (err) {
            console.error('Failed to update profile', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'DELIVERED': case 'COMPLETED':
                return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'CANCELLED':
                return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'PENDING': case 'PROCESSING':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'SHIPPED': case 'OUT_FOR_DELIVERY':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            default:
                return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
        }
    };

    const getDisplayStatus = (order: Order) => {
        // Use deliveryStatus if available and not null, otherwise use status
        const effectiveStatus = order.deliveryStatus || order.status || 'PENDING';
        return effectiveStatus.toUpperCase();
    };

    const getStatusLabel = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'DELIVERED': return '✅ ডেলিভারি সম্পন্ন';
            case 'COMPLETED': return '✅ সম্পন্ন';
            case 'SHIPPED': return '🚚 শিপমেন্টে';
            case 'OUT_FOR_DELIVERY': return '🛵 ডেলিভারিতে';
            case 'PROCESSING': return '⏳ প্রক্রিয়াধীন';
            case 'PENDING': return '🕐 অপেক্ষমাণ';
            case 'CANCELLED': return '❌ বাতিল';
            default: return status;
        }
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
        } catch (error: any) {
            console.error("Failed to download invoice", error);
            if (error?.status === 401) {
                // Token expired, will be handled by axios interceptor
                return;
            }
            alert('Failed to download invoice. Please try again.');
        }
    };

    const handleTabChange = (tab: string) => {
        if (tab === 'shop') {
            navigate('/marketplace/retail');
        } else if (tab === 'cart') {
            navigate('/cart');
        } else {
            setActiveTab(tab);
        }
    };

    const getTitle = () => {
        const item = sidebarItems.find(i => i.value === activeTab);
        return item ? item.label : 'Dashboard';
    };

    if (isLoading) {
        return (
            <DashboardLayout
                sidebarItems={sidebarItems}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                title={getTitle()}
            >
                <div className="flex items-center justify-center h-64">
                    <div className="loading loading-spinner loading-lg"></div>
                </div>
            </DashboardLayout>
        );
    }

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
                        <MobileStatCard title="মোট অর্ডার" value={orders.length} icon={<span className="text-2xl">📦</span>} color="blue" />
                        <MobileStatCard title="ডেলিভারি সম্পন্ন" value={orders.filter(o => (o.deliveryStatus || o.status)?.toUpperCase() === 'DELIVERED').length} icon={<span className="text-2xl">✅</span>} color="green" />
                        <MobileStatCard title="প্রক্রিয়াধীন" value={orders.filter(o => ['PENDING', 'PROCESSING', 'SHIPPED'].includes((o.deliveryStatus || o.status)?.toUpperCase())).length} icon={<span className="text-2xl">⏳</span>} color="yellow" />
                        <MobileStatCard title="শপিং করুন" value={0} icon={<span className="text-2xl">🛒</span>} color="purple" />
                    </div>

                    {/* Quick Actions */}
                    <MobileCard>
                        <div className="p-4 md:p-6">
                            <h3 className="text-lg font-semibold mb-4">🛍️ দ্রুত অ্যাকশন</h3>
                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <Button 
                                    className="h-20 md:h-24 flex flex-col gap-1 md:gap-2 bg-green-600 hover:bg-green-700 touch-manipulation"
                                    onClick={() => navigate('/marketplace/retail')}
                                >
                                    <ShoppingBag className="h-6 w-6 md:h-8 md:w-8" />
                                    <span className="text-xs md:text-sm">শপ ব্রাউজ করুন</span>
                                </Button>
                                <Button 
                                    variant="outline"
                                    className="h-20 md:h-24 flex flex-col gap-1 md:gap-2 touch-manipulation"
                                    onClick={() => navigate('/cart')}
                                >
                                    <ShoppingCart className="h-6 w-6 md:h-8 md:w-8" />
                                    <span className="text-xs md:text-sm">কার্ট দেখুন</span>
                                </Button>
                                <Button 
                                    variant="outline"
                                    className="h-20 md:h-24 flex flex-col gap-1 md:gap-2 touch-manipulation"
                                    onClick={() => setActiveTab('orders')}
                                >
                                    <Package className="h-6 w-6 md:h-8 md:w-8" />
                                    <span className="text-xs md:text-sm">অর্ডার ট্র্যাক করুন</span>
                                </Button>
                                <Button 
                                    variant="outline"
                                    className="h-20 md:h-24 flex flex-col gap-1 md:gap-2 touch-manipulation"
                                    onClick={() => setActiveTab('profile')}
                                >
                                    <User className="h-6 w-6 md:h-8 md:w-8" />
                                    <span className="text-xs md:text-sm">প্রোফাইল</span>
                                </Button>
                            </div>
                        </div>
                    </MobileCard>

                    {/* Recent Orders */}
                    <MobileCard>
                        <div className="p-4">
                            <h3 className="text-lg font-semibold mb-4">📦 সাম্প্রতিক অর্ডার</h3>
                            {orders.length > 0 ? (
                                <div className="space-y-3">
                                    {orders.slice(0, 5).map(order => (
                                        <div key={order.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                                            <div>
                                                <div className="font-medium">{order.cropTitle}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    ৳{order.totalAmount} • {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                                                </div>
                                            </div>
                                            <Badge className={getStatusColor(getDisplayStatus(order))}>
                                                {getStatusLabel(getDisplayStatus(order))}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p>কোনো অর্ডার নেই</p>
                                    <Button 
                                        className="mt-4 bg-green-600 hover:bg-green-700"
                                        onClick={() => navigate('/marketplace/retail')}
                                    >
                                        এখনই শপিং করুন
                                    </Button>
                                </div>
                            )}
                        </div>
                    </MobileCard>
                </div>
            )}

            {/* My Orders */}
            {activeTab === 'orders' && (
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">📦 আমার অর্ডার ({orders.length})</h2>
                    {orders.length > 0 ? (
                        <div className="space-y-3">
                            {orders.map(order => {
                                const displayStatus = getDisplayStatus(order);
                                return (
                                    <MobileCard key={order.id} padding="md">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-mono text-sm font-semibold">#{order.id}</p>
                                                    <p className="font-medium">{order.cropTitle}</p>
                                                </div>
                                                <Badge className={getStatusColor(displayStatus)}>
                                                    {getStatusLabel(displayStatus)}
                                                </Badge>
                                            </div>
                                            
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">মোট:</span>
                                                    <span className="font-bold text-green-600">৳{order.totalAmount}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">তারিখ:</span>
                                                    <span className="text-muted-foreground">
                                                        {new Date(order.createdAt).toLocaleDateString('bn-BD')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    className="flex-1 touch-manipulation"
                                                    onClick={() => setTrackingModal({ show: true, order })}
                                                >
                                                    <Truck className="h-4 w-4 mr-1" /> ট্র্যাক
                                                </Button>
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    className="flex-1 touch-manipulation"
                                                    onClick={() => handleDownloadInvoice(order.id)}
                                                >
                                                    ইনভয়েস
                                                </Button>
                                            </div>
                                        </div>
                                    </MobileCard>
                                );
                            })}
                        </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>কোনো অর্ডার নেই</p>
                                <Button 
                                    className="mt-4 bg-green-600 hover:bg-green-700"
                                    onClick={() => navigate('/marketplace/retail')}
                                >
                                    এখনই শপিং করুন
                                </Button>
                            </div>
                        )}
                </div>
            )}

            {/* Profile */}
            {activeTab === 'profile' && (
                <MobileCard>
                    <div className="p-4 md:p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <span>👤 আমার প্রোফাইল</span>
                            </h3>
                            {!editingProfile && (
                                <Button variant="outline" onClick={() => setEditingProfile(true)}>
                                    ✏️ সম্পাদনা
                                </Button>
                            )}
                        </div>

                        {profile && (
                            <div className="space-y-4">
                                {editingProfile ? (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium">নাম</label>
                                            <Input 
                                                value={profileForm.fullName} 
                                                onChange={e => setProfileForm({...profileForm, fullName: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">ইমেইল</label>
                                            <Input value={profileForm.email} disabled className="bg-muted" />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">ফোন</label>
                                            <Input 
                                                value={profileForm.phone} 
                                                onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">বিভাগ</label>
                                            <Input 
                                                value={profileForm.division} 
                                                onChange={e => setProfileForm({...profileForm, division: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">জেলা</label>
                                            <Input 
                                                value={profileForm.district} 
                                                onChange={e => setProfileForm({...profileForm, district: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">উপজেলা</label>
                                            <Input 
                                                value={profileForm.upazila} 
                                                onChange={e => setProfileForm({...profileForm, upazila: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">থানা</label>
                                            <Input 
                                                value={profileForm.thana} 
                                                onChange={e => setProfileForm({...profileForm, thana: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">পোস্ট কোড</label>
                                            <Input 
                                                value={profileForm.postCode} 
                                                onChange={e => setProfileForm({...profileForm, postCode: e.target.value})}
                                            />
                                        </div>
                                        <div className="md:col-span-2 flex gap-3">
                                            <Button onClick={handleUpdateProfile} disabled={loading} className="bg-green-600 hover:bg-green-700">
                                                {loading ? 'সংরক্ষণ হচ্ছে...' : '✅ সংরক্ষণ করুন'}
                                            </Button>
                                            <Button variant="outline" onClick={() => setEditingProfile(false)}>
                                                বাতিল
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-sm text-muted-foreground">নাম</div>
                                                <div className="font-medium">{profile.fullName}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">ইমেইল</div>
                                                <div className="font-medium">{profile.email}</div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">ফোন</div>
                                                <div className="font-medium">{profile.phone || 'নেই'}</div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-sm text-muted-foreground">ঠিকানা</div>
                                                <div className="font-medium">
                                                    {[profile.thana, profile.upazila, profile.district, profile.division].filter(Boolean).join(', ') || 'নেই'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-sm text-muted-foreground">পোস্ট কোড</div>
                                                <div className="font-medium">{profile.postCode || 'নেই'}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </MobileCard>
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
                                { status: 'PROCESSING', label: 'প্রক্রিয়াধীন', icon: Package },
                                { status: 'SHIPPED', label: 'শিপমেন্টে আছে', icon: Truck },
                                { status: 'DELIVERED', label: 'ডেলিভারি সম্পন্ন', icon: CheckCircle }
                            ].map((step, index) => {
                                const orderStatus = getDisplayStatus(trackingModal.order!);
                                const steps = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
                                const currentStepIndex = steps.indexOf(orderStatus);
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
                                <span className="font-medium text-green-600">{getStatusLabel(getDisplayStatus(trackingModal.order))}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default CustomerDashboard;
