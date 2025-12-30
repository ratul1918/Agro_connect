import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    BarChart3, Users, Leaf, ShoppingCart, Ship, FileCheck, BookOpen,
    UserPlus, Settings, LogOut, DollarSign, Plus, Key
} from 'lucide-react';
import { ThemeToggle } from '../../components/ThemeToggle';

interface AdminSidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    pendingOrdersCount?: number;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, pendingOrdersCount }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
    };
    const menuItems = [
        { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
        { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
        { id: 'add-b2b', label: 'Add B2B Product', icon: <Plus className="w-5 h-5" /> },
        { id: 'add-retail', label: 'Add Retail Product', icon: <Plus className="w-5 h-5" /> },
        { id: 'crops', label: 'All Products', icon: <Leaf className="w-5 h-5" /> },
        { id: 'orders', label: 'Orders', icon: <ShoppingCart className="w-5 h-5" /> },
        { id: 'exports', label: 'Export Apps', icon: <Ship className="w-5 h-5" /> },
        { id: 'bids', label: 'Bids', icon: <FileCheck className="w-5 h-5" /> },
        { id: 'cashout', label: 'Cashouts', icon: <DollarSign className="w-5 h-5" /> },
        { id: 'blogs', label: 'Blogs', icon: <BookOpen className="w-5 h-5" /> },
        { id: 'agronomist', label: 'Add Expert', icon: <UserPlus className="w-5 h-5" /> },
        { id: 'api-keys', label: 'API Keys', icon: <Key className="w-5 h-5" /> },
        { id: 'config', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
    ];

    return (
        <div className="drawer-side z-40">
            <label htmlFor="admin-drawer" className="drawer-overlay"></label>
            <aside className="bg-base-200 w-80 min-h-screen flex flex-col">
                <div className="p-6 bg-green-700 text-white">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        🌾 Agro Admin
                    </h2>
                    <p className="text-xs text-green-100 mt-1 opacity-80">Control Center</p>
                </div>

                <ul className="menu p-4 w-full text-base-content flex-1 gap-2">
                    {menuItems.map((item) => (
                        <li key={item.id}>
                            <a
                                className={`flex items-center gap-3 py-3 ${activeTab === item.id ? 'active bg-green-600 text-white hover:bg-green-700' : 'hover:bg-base-300'}`}
                                onClick={() => setActiveTab(item.id)}
                            >
                                {item.icon}
                                <span className="font-medium flex-1">{item.label}</span>
                                {item.id === 'orders' && pendingOrdersCount !== undefined && pendingOrdersCount > 0 && (
                                    <span className="badge badge-sm badge-error text-white animate-pulse">
                                        {pendingOrdersCount}
                                    </span>
                                )}
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="p-4 border-t border-base-300 space-y-2">
                    <div className="flex gap-2 mb-2">
                        <button
                            onClick={() => navigate('/profile')}
                            className="btn btn-sm btn-outline flex-1 flex items-center gap-2"
                        >
                            <Settings className="w-4 h-4" />
                            Profile
                        </button>
                        <button
                            onClick={handleLogout}
                            className="btn btn-sm btn-error btn-outline flex items-center gap-2"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                    <ThemeToggle />
                    <div className="text-xs text-center text-base-content/50">
                        AgroConnect v1.0.0
                    </div>
                </div>
            </aside>
        </div>
    );
};

export default AdminSidebar;
