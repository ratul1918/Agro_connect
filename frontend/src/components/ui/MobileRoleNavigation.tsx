import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from './button';
import { 
    Home, Package, MessageSquare, Wallet, Settings,
    ShoppingBag, Store, TrendingUp, BookOpen, Users
} from 'lucide-react';

interface MobileRoleNavigationProps {
    currentPath: string;
}

const MobileRoleNavigation: React.FC<MobileRoleNavigationProps> = ({ currentPath }) => {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    const getNavigationItems = () => {
        const role = user.role;
        
        switch (role) {
            case 'ROLE_FARMER':
                return [
                    { icon: Home, label: 'হোম', value: 'overview', path: '/farmer' },
                    { icon: Package, label: 'অর্ডার', value: 'orders', path: '/farmer/orders' },
                    { icon: TrendingUp, label: 'দরপত্র', value: 'bids', path: '/farmer/bids' },
                    { icon: Wallet, label: 'ওয়ালেট', value: 'wallet', path: '/farmer/wallet' },
                ];
            case 'ROLE_CUSTOMER':
            case 'ROLE_GENERAL_CUSTOMER':
                return [
                    { icon: Home, label: 'Home', value: 'overview', path: '/customer' },
                    { icon: ShoppingBag, label: 'Orders', value: 'orders', path: '/customer/orders' },
                    { icon: Package, label: 'Cart', value: 'cart', path: '/cart' },
                    { icon: Wallet, label: 'Wallet', value: 'wallet', path: '/customer/wallet' },
                ];
            case 'ROLE_BUYER':
                return [
                    { icon: Home, label: 'Home', value: 'overview', path: '/buyer' },
                    { icon: Package, label: 'Orders', value: 'orders', path: '/buyer/orders' },
                    { icon: TrendingUp, label: 'Bids', value: 'bids', path: '/buyer/bids' },
                    { icon: Wallet, label: 'Wallet', value: 'wallet', path: '/buyer/wallet' },
                ];
            case 'ROLE_AGRONOMIST':
                return [
                    { icon: Home, label: 'Home', value: 'overview', path: '/agronomist' },
                    { icon: BookOpen, label: 'Blogs', value: 'blogs', path: '/agronomist/blogs' },
                    { icon: Users, label: 'Farmers', value: 'farmers', path: '/agronomist/farmers' },
                    { icon: MessageSquare, label: 'Messages', value: 'messages', path: '/messages' },
                ];
            default:
                return [];
        }
    };

    const navigationItems = getNavigationItems();

    const isActive = (path: string, value: string) => {
        return currentPath === path || currentPath.includes(value);
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50 md:hidden">
            <div className="flex justify-around items-center">
                {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path, item.value);
                    
                    return (
                        <button
                            key={item.value}
                            onClick={() => navigate(item.path)}
                            className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-all duration-200 touch-manipulation ${
                                active 
                                    ? 'text-primary bg-primary/10' 
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Icon className={`w-5 h-5 ${active ? 'text-primary' : 'text-current'}`} />
                            <span className="text-xs font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileRoleNavigation;