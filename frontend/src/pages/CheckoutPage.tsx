import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import axios from '../api/axiosConfig';
import { Loader2, ArrowLeft, Send } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';

const CheckoutPage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const { error, success } = useNotification();
    const navigate = useNavigate();

    const [deliveryLoc, setDeliveryLoc] = useState('dhaka'); // 'dhaka' or 'outside'
    const [deliveryCharges, setDeliveryCharges] = useState({ dhaka: 70, outside: 130 });
    const [deliveryCost, setDeliveryCost] = useState(70);

    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [total, setTotal] = useState(0);

    const [formData, setFormData] = useState({
        mobile: (user as any)?.mobile || '',
        address: (user as any)?.address || '',
        paymentMethod: 'COD'
    });

    useEffect(() => {
        // Fetch configurations
        const fetchConfig = async () => {
            try {
                const res = await axios.get('/public/config');
                const dhaka = parseInt(res.data.delivery_charge_dhaka) || 70;
                const outside = parseInt(res.data.delivery_charge_outside) || 130;
                setDeliveryCharges({ dhaka, outside });
                setDeliveryCost(dhaka); // Default
            } catch (err) {
                console.error("Failed to fetch config", err);
            }
        };
        fetchConfig();
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth?tab=login');
            return;
        }
        fetchCart();
    }, [isAuthenticated]);

    // Update delivery cost when location changes
    useEffect(() => {
        const cost = deliveryLoc === 'dhaka' ? deliveryCharges.dhaka : deliveryCharges.outside;
        setDeliveryCost(cost);
    }, [deliveryLoc, deliveryCharges]);

    const fetchCart = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/cart');
            const items = res.data.items || [];
            if (items.length === 0) {
                navigate('/cart');
                return;
            }
            setCartItems(items);

            // Calculate subtotal
            const sum = items.reduce((acc: number, item: any) => {
                const price = item.currentPrice || item.priceAtAddition || 0;
                return acc + (price * item.quantity);
            }, 0);
            setTotal(sum);
        } catch (err) {
            console.error(err);
            error('Failed to load cart');
            navigate('/cart');
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.address || !formData.mobile) {
            error('Please fill in all details');
            return;
        }

        setPlacingOrder(true);
        try {
            const response = await axios.post('/customer/orders/checkout', {
                mobile: formData.mobile,
                address: formData.address,
                paymentMethod: formData.paymentMethod,
                deliveryLocation: deliveryLoc // Send location for record/logic if needed
            });

            success('Order placed successfully!');
            navigate('/orders');
        } catch (err: any) {
            console.error(err);
            error(err.response?.data?.message || 'Failed to place order');
        } finally {
            setPlacingOrder(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-green-600" /></div>;

    const grandTotal = total + deliveryCost;

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                {/* Order Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="divide-y divide-gray-200 mb-4">
                            {cartItems.map((item, index) => (
                                <li key={index} className="py-2 flex justify-between text-sm">
                                    <span>{item.cropTitle} x {item.quantity} {item.unit}</span>
                                    <span className="font-medium">৳{((item.currentPrice || item.priceAtAddition || 0) * item.quantity).toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between items-center text-gray-600">
                                <span>Subtotal</span>
                                <span>৳{total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-gray-600">
                                <span>Delivery Charge ({deliveryLoc === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                                <span>৳{deliveryCost.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xl font-bold pt-2 border-t">
                                <span>Total</span>
                                <span>৳{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Checkout Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Shipping & Payment</CardTitle>
                    </CardHeader>
                    <form onSubmit={handlePlaceOrder}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Delivery Location</Label>
                                <RadioGroup
                                    value={deliveryLoc}
                                    onValueChange={setDeliveryLoc}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
                                        <RadioGroupItem value="dhaka" id="loc-dhaka" />
                                        <Label htmlFor="loc-dhaka" className="cursor-pointer">Inside Dhaka (৳{deliveryCharges.dhaka})</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
                                        <RadioGroupItem value="outside" id="loc-outside" />
                                        <Label htmlFor="loc-outside" className="cursor-pointer">Outside Dhaka (৳{deliveryCharges.outside})</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="mobile">Mobile Number</Label>
                                <Input
                                    id="mobile"
                                    value={formData.mobile}
                                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    placeholder="017..."
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address">Delivery Address</Label>
                                <Textarea
                                    id="address"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Enter full address..."
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Payment Method</Label>
                                <RadioGroup
                                    value={formData.paymentMethod}
                                    onValueChange={(val) => setFormData({ ...formData, paymentMethod: val })}
                                    className="flex flex-col space-y-1"
                                >
                                    <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
                                        <RadioGroupItem value="COD" id="cod" />
                                        <Label htmlFor="cod" className="cursor-pointer flex-1">Cash On Delivery</Label>
                                    </div>
                                    <div className="flex items-center space-x-2 border p-3 rounded-md hover:bg-gray-50">
                                        <RadioGroupItem value="WALLET" id="wallet" />
                                        <Label htmlFor="wallet" className="cursor-pointer flex-1">My Wallet</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button
                                type="submit"
                                className="w-full bg-green-600 hover:bg-green-700"
                                disabled={placingOrder}
                            >
                                {placingOrder ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 w-4 h-4" />}
                                Place Order (৳{grandTotal.toFixed(2)})
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default CheckoutPage;
