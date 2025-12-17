import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import axios from '../api/axiosConfig';
import { Loader2, ArrowLeft, ShoppingCart, TrendingUp } from 'lucide-react';
import BidModal from '../components/BidModal';

const ProductDetailsPage: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { success, error } = useNotification();
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [unit, setUnit] = useState('kg');
    const [buying, setBuying] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);
    const [showBidModal, setShowBidModal] = useState(false);

    const isB2B = product?.marketplaceType === 'B2B';
    const isBuyer = user?.role === 'ROLE_BUYER';
    const isAdmin = user?.role === 'ROLE_ADMIN';
    const isFarmer = user?.role === 'ROLE_FARMER';
    const canBid = user && (isBuyer || isAdmin || isFarmer);
    const canBuyB2B = canBid; // Only authorized B2B roles can buy && isB2B;

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            // Try crops endpoint first (for B2B), fallback to shop products
            const res = await axios.get(`/crops/${id}`);
            setProduct(res.data);
            // Set default quantity based on product type
            if (res.data.marketplaceType === 'B2B' && res.data.minWholesaleQty) {
                setQuantity(res.data.minWholesaleQty);
            } else {
                setQuantity(1);
            }
        } catch (err) {
            try {
                const res = await axios.get(`/shop/products/${id}`);
                setProduct(res.data);
                setQuantity(1);
            } catch (error) {
                console.error("Error fetching product", error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        setAddingToCart(true);
        const quantityInKg = unit === 'gram' ? quantity / 1000 : quantity;

        if (!user) {
            // Guest Cart Logic
            try {
                const guestCart = JSON.parse(localStorage.getItem('guest_cart') || '[]');

                // Check if item exists
                const existingItemIndex = guestCart.findIndex((item: any) => item.cropId === product.id);

                if (existingItemIndex >= 0) {
                    guestCart[existingItemIndex].quantity += quantityInKg;
                } else {
                    guestCart.push({
                        cropId: product.id,
                        cropTitle: product.title,
                        cropImage: product.images?.[0],
                        price: product.price, // Uses minPrice as adjusted by backend/frontend
                        quantity: quantityInKg,
                        unit: product.unit,
                        maxQuantity: product.maxRetailQty || 100,
                        farmerName: product.farmerName
                    });
                }

                localStorage.setItem('guest_cart', JSON.stringify(guestCart));
                success('Added to guest cart! Login to checkout.');
            } catch (err) {
                console.error(err);
                error('Failed to add to cart');
            } finally {
                setAddingToCart(false);
            }
            return;
        }

        // Logged In Logic
        try {
            await axios.post('/cart/items', {
                cropId: product.id,
                quantity: quantityInKg
            });
            success('Added to cart successfully!');
        } catch (err: any) {
            console.error(err);
            error(err.response?.data?.message || 'Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuy = async () => {
        if (!user) {
            navigate('/auth?tab=login');
            return;
        }
        setBuying(true);
        try {
            const quantityInKg = unit === 'gram' ? quantity / 1000 : quantity;
            const response = await axios.post('/shop/orders', {
                cropId: product.id,
                quantity: quantityInKg,
                paymentMethod: 'COD'
            });
            success('Order placed successfully! Your invoice is ready.');
            setOrderPlaced(true);
            if (response.data.invoiceUrl) {
                setInvoiceUrl(response.data.invoiceUrl);
            }
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

    const price = product.minPrice;
    const pricePerKg = price;
    const effectivePrice = unit === 'gram' ? pricePerKg / 1000 : pricePerKg;
    const totalPrice = effectivePrice * quantity;

    // Theme colors based on product type
    const themeColor = isB2B ? 'blue' : 'green';
    const bgGradient = isB2B ? 'from-blue-50 to-blue-100' : 'from-green-50 to-green-100';

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row">
                {/* Image Section */}
                <div className={`md:w-1/2 bg-gray-100 flex items-center justify-center p-6 bg-gradient-to-br ${bgGradient} overflow-hidden`}>
                    {product.images && product.images.length > 0 ? (
                        <img
                            src={`http://localhost:8080${product.images[0]}`}
                            alt={product.title}
                            className="max-h-[500px] w-full object-contain rounded-lg shadow-sm transition-transform duration-500 hover:scale-125 cursor-pointer"
                        />
                    ) : (
                        <span className="text-9xl">🌾</span>
                    )}
                </div>

                {/* Details Section */}
                <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-between">
                    <div>
                        <Link to={isB2B ? "/marketplace/b2b" : "/marketplace/retail"} className={`text-sm text-${themeColor}-600 hover:text-${themeColor}-700 hover:underline flex items-center mb-6 font-medium transition-colors`}>
                            <ArrowLeft className="w-4 h-4 mr-1" /> Back to {isB2B ? 'B2B Market' : 'Retail Shop'}
                        </Link>

                        <div className="flex items-center space-x-2 mb-2">
                            <span className={`bg-${themeColor}-100 text-${themeColor}-800 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide`}>
                                {isB2B ? 'B2B Wholesale' : product.cropTypeName || "Retail"}
                            </span>
                            {product.location && <span className="text-gray-500 text-xs flex items-center"><span className="mr-1">📍</span>{product.location}</span>}
                        </div>

                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2 leading-tight">{product.title}</h1>
                        <p className="text-gray-500 mb-6 flex items-center">
                            <span className="mr-2">Sold by</span>
                            <span className="font-semibold text-gray-700 underline decoration-dotted">{product.farmerName}</span>
                        </p>

                        <div className={`bg-${themeColor}-50 p-5 rounded-xl mb-8 border border-${themeColor}-100 shadow-sm`}>
                            <p className={`text-${themeColor}-800 font-semibold text-sm uppercase tracking-wider mb-1`}>
                                {isB2B ? 'Wholesale Price' : 'Retail Price'}
                            </p>
                            <div className="flex items-baseline">
                                <span className={`text-4xl font-bold text-${themeColor}-700`}>৳{price}</span>
                                <span className="text-gray-500 font-medium ml-1">/{product.unit}</span>
                            </div>
                            {isB2B && product.minWholesaleQty && (
                                <p className={`text-sm text-${themeColor}-600 mt-2`}>
                                    Minimum Order: <span className="font-bold">{product.minWholesaleQty} {product.unit}</span>
                                </p>
                            )}
                        </div>

                        <p className="text-gray-700 leading-relaxed mb-8 text-lg">{product.description}</p>
                    </div>

                    <div>
                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Select Quantity</label>
                            <div className="space-y-4">
                                {/* Unit Selector - Only for Retail */}
                                {!isB2B && (
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setUnit('kg')}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${unit === 'kg'
                                                ? 'bg-green-600 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            Kilogram (kg)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setUnit('gram')}
                                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${unit === 'gram'
                                                ? 'bg-green-600 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            Gram (g)
                                        </button>
                                    </div>
                                )}

                                {/* Quantity Input */}
                                <div className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min={isB2B ? (product.minWholesaleQty || 1) : 0.001}
                                                step={isB2B ? '1' : (unit === 'gram' ? '1' : '0.1')}
                                                value={quantity}
                                                onChange={(e) => setQuantity(Math.max(0.001, parseFloat(e.target.value) || 0))}
                                                className={`w-full px-4 py-3 text-lg font-semibold border-2 border-gray-300 rounded-lg focus:border-${themeColor}-500 focus:ring-2 focus:ring-${themeColor}-200 outline-none transition-all`}
                                                placeholder={`Enter quantity in ${isB2B ? product.unit : unit}`}
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                                {isB2B ? product.unit : unit}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Available: <span className="font-medium text-gray-900">{product.quantity} {product.unit}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-xl font-bold text-gray-800">Total</span>
                                <span className={`text-3xl font-bold text-${themeColor}-700`}>৳{totalPrice.toFixed(2)}</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                {isB2B ? (
                                    // B2B Buttons: Buy Now + Place Bid (NO Add to Cart)
                                    <>
                                        {canBuyB2B ? (
                                            <Button
                                                onClick={handleBuy}
                                                disabled={buying || quantity > product.quantity || orderPlaced || (product.minWholesaleQty && quantity < product.minWholesaleQty)}
                                                className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-lg font-bold shadow-lg shadow-blue-200 rounded-xl transition-all transform hover:scale-[1.02]"
                                            >
                                                {buying ? <Loader2 className="animate-spin mr-2" /> : <ShoppingCart className="mr-2 w-5 h-5" />}
                                                Buy Now
                                            </Button>
                                        ) : (
                                            <div className="w-full p-4 bg-gray-100 rounded-xl text-center text-gray-500">
                                                View Only (B2B Marketplace)
                                            </div>
                                        )}

                                        {canBid && (
                                            <Button
                                                onClick={() => setShowBidModal(true)}
                                                variant="outline"
                                                className="w-full h-14 text-lg font-bold border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                            >
                                                <TrendingUp className="mr-2 w-5 h-5" />
                                                Place Bid (Negotiate Price)
                                            </Button>
                                        )}

                                        {!canBid && !user && (
                                            <p className="text-center text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                                                <Link to="/auth?tab=login" className="underline font-semibold">Login as Buyer</Link> to buy or negotiate
                                            </p>
                                        )}
                                    </>
                                ) : (
                                    // Retail Buttons: Add to Cart + Buy Now
                                    <>
                                        <Button
                                            onClick={handleAddToCart}
                                            disabled={addingToCart || quantity > product.quantity || orderPlaced}
                                            variant="outline"
                                            className="w-full h-14 text-lg font-bold border-2 border-green-600 text-green-600 hover:bg-green-50 rounded-xl transition-all"
                                        >
                                            {addingToCart ? <Loader2 className="animate-spin mr-2" /> : <ShoppingCart className="mr-2 w-5 h-5" />}
                                            Add to Cart
                                        </Button>

                                        <Button
                                            onClick={handleBuy}
                                            disabled={buying || quantity > product.quantity || orderPlaced}
                                            className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-bold shadow-lg shadow-green-200 rounded-xl transition-all transform hover:scale-[1.02]"
                                        >
                                            {buying ? <Loader2 className="animate-spin mr-2" /> : <ShoppingCart className="mr-2 w-5 h-5" />}
                                            Buy Now
                                        </Button>
                                    </>
                                )}

                                {/* Invoice Download Button */}
                                {orderPlaced && invoiceUrl && (
                                    <a
                                        href={`http://localhost:8080${invoiceUrl}`}
                                        download
                                        className="block w-full"
                                    >
                                        <Button
                                            variant="outline"
                                            className="w-full h-14 text-lg font-bold border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                        >
                                            ⬇️ Download Invoice PDF
                                        </Button>
                                    </a>
                                )}
                            </div>

                            {!user && !isB2B && <p className="text-center text-sm text-gray-500 mt-3 bg-yellow-50 p-2 rounded text-yellow-700">Login required to proceed with purchase.</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bid Modal */}
            {product && (
                <BidModal
                    isOpen={showBidModal}
                    onClose={() => setShowBidModal(false)}
                    crop={{
                        id: product.id,
                        title: product.title,
                        minPrice: product.minPrice,
                        minWholesaleQty: product.minWholesaleQty,
                        unit: product.unit,
                        farmerName: product.farmerName
                    }}
                    onSuccess={() => {
                        success('Bid placed! Check your dashboard to track it.');
                    }}
                />
            )}
        </div>
    );
};

export default ProductDetailsPage;
