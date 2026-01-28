import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import axios, { BASE_URL } from '../api/axiosConfig';
import { Trash2, ShoppingCart, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';

interface CartItem {
    id?: number; // Backend ID
    cropId: number;
    title: string;
    image: string;
    price: number;
    quantity: number;
    unit: string;
    maxQuantity: number;
    farmerName: string;
}

const CartPage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const { error, success } = useNotification();
    const navigate = useNavigate();
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [subtotal, setSubtotal] = useState(0);

    useEffect(() => {
        fetchCart();
    }, [isAuthenticated]);

    useEffect(() => {
        // Calculate subtotal
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setSubtotal(total);
    }, [items]);

    const fetchCart = async () => {
        setLoading(true);
        if (isAuthenticated) {
            try {
                const res = await axios.get('/cart');
                // Transform backend response to CartItem
                const cartItems = res.data.items.map((item: any) => ({
                    id: item.id,
                    cropId: item.cropId,
                    title: item.cropTitle,
                    image: item.cropImage,
                    price: item.currentPrice || item.priceAtAddition || 0,
                    quantity: item.quantity,
                    unit: item.unit || 'kg',
                    maxQuantity: item.maxQuantity || 100, // Fallback
                    farmerName: item.farmerName
                }));
                setItems(cartItems);
            } catch (err) {
                console.error(err);
                // If 403/401, maybe token invalid?
            }
        } else {
            // Guest Cart from LocalStorage
            const savedCart = localStorage.getItem('guest_cart');
            if (savedCart) {
                setItems(JSON.parse(savedCart));
            }
        }
        setLoading(false);
    };

    const handleRemoveItem = async (index: number, itemId?: number) => {
        if (isAuthenticated && itemId) {
            try {
                await axios.delete(`/cart/items/${itemId}`);
                success('Item removed');
                fetchCart();
            } catch (err) {
                error('Failed to remove item');
            }
        } else {
            // Remove from local state and update localStorage
            const newItems = [...items];
            newItems.splice(index, 1);
            setItems(newItems);
            localStorage.setItem('guest_cart', JSON.stringify(newItems));
            success('Item removed');
        }
    };

    const handleCheckout = () => {
        if (!isAuthenticated) {
            // Save current path to redirect back after login? 
            // Or usually redirect to login then checkout.
            // For now, simple redirect
            navigate('/auth?tab=login');
            return;
        }

        // Navigate to checkout page (if exists) or order creation
        // Since we don't have a dedicated checkout page in the list, 
        // we might need to create one or use a modal.
        // For simplicity, let's assume there is a checkout flow or we redirect to a checkout page.
        // The CustomerDashboard has order history. 
        // Let's create a CheckoutPage later or handle it here?
        // User said "add to card... workable". I'll assume checkout is a separate step or page.
        // I'll send them to a new Checkout route.
        navigate('/checkout');
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin h-8 w-8 text-green-600" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                    <ShoppingCart className="mr-3 h-8 w-8 text-green-600" />
                    Shopping Cart
                </h1>

                {items.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
                        <Button onClick={() => navigate('/marketplace/retail')} className="bg-green-600 hover:bg-green-700">
                            Start Shopping
                        </Button>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <ul className="divide-y divide-gray-200">
                            {items.map((item, index) => (
                                <li key={item.id || index} className="p-6 flex items-center">
                                    <img
                                        src={item.image ? `${BASE_URL}${item.image}` : 'https://via.placeholder.com/100?text=Crop'}
                                        alt={item.title}
                                        className="h-20 w-20 object-cover rounded-md border border-gray-200"
                                    />
                                    <div className="ml-6 flex-1">
                                        <div className="flex justify-between">
                                            <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                                            <p className="text-lg font-bold text-gray-900">৳{(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <p className="text-sm text-gray-500">Sold by {item.farmerName}</p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="text-sm text-gray-700">
                                                Qty: <span className="font-semibold">{item.quantity} {item.unit}</span>
                                                <span className="mx-2 text-gray-300">|</span>
                                                Price: ৳{item.price}/{item.unit}
                                            </div>
                                            <button
                                                onClick={() => handleRemoveItem(index, item.id)}
                                                className="text-red-500 hover:text-red-700 p-2"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <div className="bg-gray-50 p-6 border-t border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-lg text-gray-600">Subtotal</span>
                                <span className="text-2xl font-bold text-gray-900">৳{subtotal.toFixed(2)}</span>
                            </div>
                            <Button
                                onClick={handleCheckout}
                                className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg"
                            >
                                Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                            {!isAuthenticated && (
                                <p className="text-center text-sm text-gray-500 mt-2">
                                    You'll need to login to complete your purchase.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CartPage;
