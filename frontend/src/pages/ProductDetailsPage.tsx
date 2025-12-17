import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import axios from '../api/axiosConfig';
import { Loader2, ArrowLeft, Minus, Plus, ShoppingCart } from 'lucide-react';

const ProductDetailsPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { success, error } = useNotification();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [buying, setBuying] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await axios.get(`/shop/products/${id}`);
            setProduct(res.data);
            setQuantity(res.data.minRetailQty || 1);
        } catch (error) {
            console.error("Error fetching product", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async () => {
        if (!user) {
            navigate('/auth?tab=login');
            return;
        }
        setBuying(true);
        try {
            await axios.post('/shop/orders', {
                cropId: product.id,
                quantity: quantity,
                paymentMethod: 'COD'
            });
            success('Order placed successfully! Pay on delivery.');
            navigate('/profile');
        } catch (err: any) {
            console.error(err);
            error('Failed to place order.');
        } finally {
            setBuying(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin w-8 h-8 text-green-600" /></div>;
    if (!product) return <div className="p-8 text-center text-xl">Product not found</div>;

    // Use retailPrice if available, else calculated (fallback logic)
    // The backend `getCalculatedRetailPrice` ensures `retailPrice` is populated in the DTO if I used logic there?
    // Actually the DTO `Crop` has `retailPrice` field. If null, we might need to rely on `minPrice` or similar.
    // The `ShopController` calls `findAllRetail` which returns raw DB values.
    // So `retailPrice` might be null.
    // However, for retail display we should use `retailPrice`. If null, maybe use `minPrice` + margin.

    const price = product.retailPrice || (product.minPrice * 1.25);
    const totalPrice = price * quantity;

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="md:w-1/2 bg-gray-100 flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-green-100">
                    {product.images && product.images.length > 0 ? (
                        <img src={product.images[0]} alt={product.title} className="max-h-[500px] w-full object-contain rounded-lg shadow-sm" />
                    ) : (
                        <span className="text-9xl">🌾</span> // Fallback emoji
                    )}
                </div>

                {/* Details Section */}
                <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-between">
                    <div>
                        <Link to="/marketplace" className="text-sm text-green-600 hover:text-green-700 hover:underline flex items-center mb-6 font-medium transition-colors">
                            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Market
                        </Link>

                        <div className="flex items-center space-x-2 mb-2">
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide">{product.type_name || "Crop"}</span>
                            {product.location && <span className="text-gray-500 text-xs flex items-center"><span className="mr-1">📍</span>{product.location}</span>}
                        </div>

                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 leading-tight">{product.title}</h1>
                        <p className="text-gray-500 mb-6 flex items-center">
                            <span className="mr-2">Sold by</span>
                            <span className="font-semibold text-gray-700 underline decoration-dotted">{product.farmerName}</span>
                        </p>

                        <div className="bg-green-50 p-5 rounded-xl mb-8 border border-green-100 shadow-sm">
                            <p className="text-green-800 font-semibold text-sm uppercase tracking-wider mb-1">Retail Price</p>
                            <div className="flex items-baseline">
                                <span className="text-4xl font-bold text-green-700">৳{price}</span>
                                <span className="text-gray-500 font-medium ml-1">/{product.unit}</span>
                            </div>
                        </div>

                        <p className="text-gray-700 leading-relaxed mb-8 text-lg">{product.description}</p>
                    </div>

                    <div>
                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Select Quantity ({product.unit})</label>
                            <div className="flex items-center space-x-6">
                                <div className="flex items-center border border-gray-300 rounded-lg bg-white shadow-sm">
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-l-lg hover:bg-gray-100" onClick={() => setQuantity(Math.max((product.minRetailQty || 1), quantity - 1))}>
                                        <Minus className="w-4 h-4 text-gray-600" />
                                    </Button>
                                    <div className="h-10 px-4 flex items-center justify-center min-w-[3rem] border-x border-gray-300 text-lg font-semibold text-gray-900">
                                        {quantity}
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-r-lg hover:bg-gray-100" onClick={() => setQuantity(Math.min((product.maxRetailQty || 50), quantity + 1))}>
                                        <Plus className="w-4 h-4 text-gray-600" />
                                    </Button>
                                </div>
                                <div className="text-sm text-gray-500">
                                    <span className="font-medium text-gray-900">{product.quantity} {product.unit}</span> available
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-xl font-bold text-gray-800">Total</span>
                                <span className="text-3xl font-bold text-green-700">৳{totalPrice.toFixed(2)}</span>
                            </div>
                            <Button onClick={handleBuy} disabled={buying || quantity > product.quantity} className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-bold shadow-lg shadow-green-200 rounded-xl transition-all transform hover:scale-[1.02]">
                                {buying ? <Loader2 className="animate-spin mr-2" /> : <ShoppingCart className="mr-2 w-5 h-5" />}
                                Buy Now (Cash on Delivery)
                            </Button>
                            {!user && <p className="text-center text-sm text-gray-500 mt-3 bg-yellow-50 p-2 rounded text-yellow-700">Login required to proceed with purchase.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailsPage;
