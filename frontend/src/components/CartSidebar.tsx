import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingCart, ArrowRight, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import axios, { BASE_URL } from '../api/axiosConfig';

interface CartItem {
    id?: number;
    cropId: number;
    title: string;
    image: string;
    price: number;
    quantity: number;
    unit: string;
    maxQuantity: number;
    farmerName: string;
}

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const CartSidebar: React.FC<CartSidebarProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { success, error } = useNotification();
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const fetchCart = useCallback(async () => {
        setLoading(true);
        if (isAuthenticated) {
            try {
                const res = await axios.get('/cart');
                const cartItems = res.data.items.map((item: any) => ({
                    id: item.id,
                    cropId: item.cropId,
                    title: item.cropTitle,
                    image: item.cropImage,
                    price: item.currentPrice || item.priceAtAddition || 0,
                    quantity: item.quantity,
                    unit: item.unit || 'kg',
                    maxQuantity: item.maxQuantity || 100,
                    farmerName: item.farmerName,
                }));
                setItems(cartItems);
            } catch (err) {
                console.error(err);
            }
        } else {
            const savedCart = localStorage.getItem('guest_cart');
            if (savedCart) {
                try {
                    const parsed = JSON.parse(savedCart);
                    setItems(parsed.map((item: any) => ({
                        cropId: item.cropId,
                        title: item.cropTitle || item.title,
                        image: item.cropImage || item.image,
                        price: item.price,
                        quantity: item.quantity,
                        unit: item.unit || 'kg',
                        maxQuantity: item.maxQuantity || 100,
                        farmerName: item.farmerName,
                    })));
                } catch { setItems([]); }
            }
        }
        setLoading(false);
    }, [isAuthenticated]);

    useEffect(() => {
        if (isOpen) fetchCart();
    }, [isOpen, fetchCart]);

    // Listen for custom cart-updated events
    useEffect(() => {
        const handler = () => { if (isOpen) fetchCart(); };
        window.addEventListener('cart-updated', handler);
        return () => window.removeEventListener('cart-updated', handler);
    }, [isOpen, fetchCart]);

    const handleRemove = async (index: number, itemId?: number) => {
        if (isAuthenticated && itemId) {
            try {
                await axios.delete(`/cart/items/${itemId}`);
                success('Item removed');
                fetchCart();
            } catch { error('Failed to remove'); }
        } else {
            const newItems = [...items];
            newItems.splice(index, 1);
            setItems(newItems);
            localStorage.setItem('guest_cart', JSON.stringify(newItems));
            success('Item removed');
        }
    };

    const handleUpdateQty = async (index: number, newQty: number) => {
        if (newQty <= 0) return;
        const item = items[index];
        if (newQty > item.maxQuantity) return;

        if (isAuthenticated && item.id) {
            try {
                await axios.put(`/cart/items/${item.id}`, { quantity: newQty });
                const updated = [...items];
                updated[index] = { ...item, quantity: newQty };
                setItems(updated);
            } catch { error('Failed to update'); }
        } else {
            const updated = [...items];
            updated[index] = { ...item, quantity: newQty };
            setItems(updated);
            localStorage.setItem('guest_cart', JSON.stringify(updated));
        }
    };

    const handleCheckout = () => {
        onClose();
        if (!isAuthenticated) {
            navigate('/auth?tab=login');
            return;
        }
        navigate('/checkout');
    };

    const handleViewCart = () => {
        onClose();
        navigate('/cart');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <ShoppingBag className="h-5 w-5 text-green-600" />
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                    Your Cart
                                </h2>
                                <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">
                                    {items.length}
                                </span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 dark:text-gray-400"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {loading ? (
                                <div className="flex items-center justify-center h-40">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                                </div>
                            ) : items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                    <ShoppingCart className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Cart is empty</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Add some products to get started</p>
                                    <Button
                                        onClick={() => { onClose(); navigate('/marketplace/retail'); }}
                                        className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6"
                                    >
                                        Browse Products
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <AnimatePresence initial={false}>
                                        {items.map((item, index) => (
                                            <motion.div
                                                key={item.id || item.cropId}
                                                layout
                                                initial={{ opacity: 0, x: 40 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -40, height: 0 }}
                                                className="flex gap-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800"
                                            >
                                                {/* Image */}
                                                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                                                    {item.image ? (
                                                        <img
                                                            src={item.image.startsWith('http') ? item.image : `${BASE_URL}${item.image}`}
                                                            alt={item.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-3xl">🌾</div>
                                                    )}
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                                        {item.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        ৳{item.price}/{item.unit}
                                                    </p>

                                                    <div className="flex items-center justify-between mt-2">
                                                        {/* Quantity Controls */}
                                                        <div className="flex items-center gap-1 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                                                            <button
                                                                onClick={() => handleUpdateQty(index, item.quantity - (item.unit === 'kg' ? 0.5 : 1))}
                                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-l-lg transition-colors"
                                                                disabled={item.quantity <= 0.5}
                                                            >
                                                                <Minus className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                                                            </button>
                                                            <span className="px-3 text-sm font-semibold text-gray-900 dark:text-white min-w-[40px] text-center">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => handleUpdateQty(index, item.quantity + (item.unit === 'kg' ? 0.5 : 1))}
                                                                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-r-lg transition-colors"
                                                            >
                                                                <Plus className="h-3 w-3 text-gray-600 dark:text-gray-300" />
                                                            </button>
                                                        </div>

                                                        {/* Price + Delete */}
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-sm text-green-600 dark:text-green-400">
                                                                ৳{(item.price * item.quantity).toFixed(0)}
                                                            </span>
                                                            <button
                                                                onClick={() => handleRemove(index, item.id)}
                                                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-5 bg-gray-50/80 dark:bg-gray-800/50">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Subtotal</span>
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">৳{subtotal.toFixed(0)}</span>
                                </div>
                                <Button
                                    onClick={handleCheckout}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold rounded-xl shadow-lg shadow-green-600/20 transition-all hover:scale-[1.02]"
                                >
                                    Checkout
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Button>
                                <button
                                    onClick={handleViewCart}
                                    className="w-full mt-2 text-center text-sm text-green-600 dark:text-green-400 hover:underline font-medium py-2"
                                >
                                    View Full Cart
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartSidebar;
