import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ShoppingCart, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { BASE_URL } from '../../api/axiosConfig';
import { motion } from 'framer-motion';

export interface Product {
    id: number;
    title: string;
    description: string;
    farmerName: string;
    cropTypeName: string;
    quantity: number;
    unit: string;
    minPrice: number; // Retail price or Min Bid price
    retailPrice?: number;
    location: string;
    images: string[];
}

interface ProductCardProps {
    product: Product;
    variant: 'retail' | 'b2b';
    onAction: (product: Product) => void;
    t: (key: string) => string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, variant, onAction, t }) => {
    const isRetail = variant === 'retail';
    const themeColor = isRetail ? 'green' : 'blue';
    const ActionIcon = isRetail ? ShoppingCart : TrendingUp;

    const getCropEmoji = (type: string) => {
        const emojis: Record<string, string> = {
            'Rice': '🌾',
            'Rice & Grains': '🌾',
            'Vegetables': '🥬',
            'Fruits': '🍎',
            'Spices': '🌶️',
            'Pulses': '🫘',
            'Fish': '🐟'
        };
        return emojis[type] || '🌱';
    };

    const imageUrl = product.images && product.images.length > 0
        ? (product.images[0].startsWith('http') ? product.images[0] : `${BASE_URL}${product.images[0]}`)
        : null;

    // Helper for conditional classes
    const ringClass = isRetail
        ? "hover:ring-green-200 dark:hover:ring-green-800/50"
        : "hover:ring-blue-200 dark:hover:ring-blue-800/50";

    const badgeBg = isRetail
        ? "text-green-700 dark:text-green-400 border-green-100 dark:border-green-900"
        : "text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900";

    const titleHover = isRetail
        ? "group-hover:text-green-600 dark:group-hover:text-green-400"
        : "group-hover:text-blue-600 dark:group-hover:text-blue-400";

    const priceColor = isRetail
        ? "text-green-600 dark:text-green-400"
        : "text-blue-600 dark:text-blue-400";

    const btnGradient = isRetail
        ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-green-600 dark:hover:bg-green-400 hover:text-white group-hover:bg-green-600 dark:group-hover:bg-green-400 dark:group-hover:text-white"
        : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-md";

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-full"
        >
            <Link to={`/crop/${product.id}`} className="block h-full group">
                <div className={`h-full bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-${themeColor}-900/5 transition-all duration-300 border border-gray-100 dark:border-gray-800 ring-1 ring-gray-100 dark:ring-gray-700 ${ringClass} flex flex-col`}>
                    {/* Image Container */}
                    <div className="relative h-52 overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={product.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        ) : (
                            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${isRetail ? 'from-green-50 to-emerald-100' : 'from-blue-50 to-indigo-100'} dark:from-gray-800 dark:to-gray-700/50`}>
                                <span className="text-7xl transform group-hover:scale-110 transition-transform duration-300 drop-shadow-sm">
                                    {getCropEmoji(product.cropTypeName)}
                                </span>
                            </div>
                        )}

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex gap-2">
                            <span className={`px-3 py-1 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md text-xs font-bold rounded-full shadow-sm flex items-center gap-1 border ${badgeBg}`}>
                                {getCropEmoji(product.cropTypeName)} {product.cropTypeName}
                            </span>
                        </div>

                        {!isRetail && (
                            <div className="absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-md">
                                Wholesale
                            </div>
                        )}

                        {product.quantity <= 0 && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center">
                                <span className="bg-red-500 text-white px-4 py-1.5 rounded-full font-bold text-sm shadow-lg">Sold Out</span>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3 gap-2">
                            <span className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-md">
                                <MapPin className={`h-3 w-3 ${isRetail ? 'text-green-500' : 'text-blue-500'}`} />
                                <span className="truncate max-w-[100px]">{product.location}</span>
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                            <span className="truncate font-medium text-gray-700 dark:text-gray-300">{product.farmerName}</span>
                        </div>

                        <h3 className={`font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-1 transition-colors ${titleHover}`}>
                            {product.title}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
                            {product.description}
                        </p>

                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-end justify-between gap-4">
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">
                                    {isRetail ? t('retail.price') : t('b2b.min_price')}
                                </p>
                                <div className="flex items-baseline gap-1">
                                    <span className={`text-2xl font-bold ${priceColor}`}>৳{product.minPrice}</span>
                                    <span className="text-sm text-gray-400 font-medium">/{product.unit}</span>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                className={`rounded-full px-4 transition-all ${btnGradient} ${product.quantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={product.quantity <= 0}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onAction(product);
                                }}
                            >
                                <ActionIcon className="h-4 w-4 mr-1.5" />
                                {isRetail ? t('retail.buy_now') : t('b2b.place_bid')}
                            </Button>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductCard;
