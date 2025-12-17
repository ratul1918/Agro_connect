import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { X, TrendingUp } from 'lucide-react';
import axios from '../api/axiosConfig';
import { useNotification } from '../context/NotificationContext';

interface BidModalProps {
    isOpen: boolean;
    onClose: () => void;
    crop: {
        id: number;
        title: string;
        minPrice: number;
        minWholesaleQty?: number;
        unit: string;
        farmerName: string;
    };
    onSuccess?: () => void;
}

const BidModal: React.FC<BidModalProps> = ({ isOpen, onClose, crop, onSuccess }) => {
    const { success, error } = useNotification();
    const [loading, setLoading] = useState(false);
    const [bidData, setBidData] = useState({
        price: '',
        quantity: crop.minWholesaleQty?.toString() || '80'
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const price = parseFloat(bidData.price);
        const quantity = parseFloat(bidData.quantity);

        if (isNaN(price) || price <= 0) {
            error('Please enter a valid price');
            return;
        }

        if (isNaN(quantity) || quantity <= 0) {
            error('Please enter a valid quantity');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`/bids/${crop.id}`, {
                amount: price,
                quantity: quantity
            });
            success('Bid placed successfully! The farmer will review your offer.');
            setBidData({ price: '', quantity: crop.minWholesaleQty?.toString() || '80' });
            onClose();
            if (onSuccess) onSuccess();
        } catch (err: any) {
            error(err.response?.data || 'Failed to place bid');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-blue-50 rounded-t-xl">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                        <h2 className="text-lg font-semibold text-blue-900">Place Bid</h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-blue-100 rounded-full">
                        <X className="h-5 w-5 text-gray-500" />
                    </button>
                </div>

                {/* Product Info */}
                <div className="p-4 bg-gray-50 border-b">
                    <h3 className="font-medium text-gray-900">{crop.title}</h3>
                    <p className="text-sm text-gray-500">by {crop.farmerName}</p>
                    <div className="mt-2 flex items-center justify-between">
                        <span className="text-sm text-gray-600">Listed Price:</span>
                        <span className="font-bold text-blue-600">৳{crop.minPrice}/{crop.unit}</span>
                    </div>
                    {crop.minWholesaleQty && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Min Order:</span>
                            <span className="font-medium">{crop.minWholesaleQty} {crop.unit}</span>
                        </div>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Your Bid Price (৳ per {crop.unit})
                        </label>
                        <Input
                            type="number"
                            placeholder={`e.g., ${Math.round(crop.minPrice * 0.9)}`}
                            value={bidData.price}
                            onChange={(e) => setBidData({ ...bidData, price: e.target.value })}
                            min="1"
                            step="0.01"
                            required
                            className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Suggest a price you're willing to pay
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity ({crop.unit})
                        </label>
                        <Input
                            type="number"
                            placeholder="Enter quantity"
                            value={bidData.quantity}
                            onChange={(e) => setBidData({ ...bidData, quantity: e.target.value })}
                            min={crop.minWholesaleQty || 1}
                            required
                            className="w-full"
                        />
                    </div>

                    {/* Summary */}
                    {bidData.price && bidData.quantity && (
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <div className="flex justify-between text-sm">
                                <span>Total Bid:</span>
                                <span className="font-bold text-blue-700">
                                    ৳{(parseFloat(bidData.price) * parseFloat(bidData.quantity)).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? 'Placing Bid...' : 'Place Bid'}
                        </Button>
                    </div>

                    <p className="text-xs text-center text-gray-500">
                        The farmer will review your bid and may accept, counter, or reject it.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default BidModal;
