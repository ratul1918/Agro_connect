import React, { useEffect, useState } from 'react';
import axios, { BASE_URL } from '../api/axiosConfig';
import { Loader2, Package, MapPin, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const OrdersPage: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth?tab=login');
            return;
        }
        fetchOrders();
    }, [isAuthenticated]);

    const fetchOrders = async () => {
        try {
            const res = await axios.get('/customer/orders');
            setOrders(res.data);
        } catch (err) {
            console.error('Failed to fetch orders', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'APPROVED': return 'bg-blue-100 text-blue-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'CANCELLED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-green-600" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                    <Package className="mr-3 h-8 w-8 text-green-600" />
                    My Orders
                </h1>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                        <p className="text-gray-500">You haven't placed any orders yet.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                                <CardHeader className="bg-gray-50 pb-3 border-b border-gray-100">
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-gray-500">
                                            Order #{order.id} • {new Date(order.createdAt).toLocaleDateString()}
                                        </div>
                                        <Badge className={getStatusColor(order.status)}>
                                            {order.status}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4">
                                    <div className="flex gap-4">
                                        <img
                                            src={order.cropImage ? `${BASE_URL}${order.cropImage}` : 'https://via.placeholder.com/80'}
                                            alt={order.cropTitle}
                                            className="h-20 w-20 object-cover rounded-md"
                                        />
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900">{order.cropTitle}</h3>
                                            <div className="flex items-center text-gray-600 mt-1">
                                                <MapPin className="h-4 w-4 mr-1" /> {order.deliveryStatus || 'Pending Delivery'}
                                            </div>
                                            <div className="flex items-center text-gray-600 mt-1">
                                                <DollarSign className="h-4 w-4 mr-1" /> Total: ৳{order.totalAmount}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersPage;
