import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../ui/button';
import {
    Menu, X, User, LogOut, Leaf,
    ChevronLeft, ChevronRight, KeyRound, Home, Package, MessageSquare, Wallet, Settings
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Footer from './Footer';
import { ThemeSelectorSidebar } from '../ThemeSelectorSidebar';
import Navbar from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarItem {
    label: string;
    icon: React.ElementType;
    value: string; // Used for identifying active tab/state
    onClick?: () => void;
}

interface DashboardLayoutProps {
    children: React.ReactNode;
    sidebarItems: SidebarItem[];
    activeTab: string;
    onTabChange: (tab: string) => void;
    title?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    sidebarItems,
    activeTab,
    onTabChange,
    title = "Dashboard"
}) => {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleLogout = () => {
        logout(); // AuthContext handles redirect
    };

    // Mobile Bottom Navigation Items (Quick Access)
    const mobileBottomNav = [
        { icon: Home, label: "dashboard.overview", value: sidebarItems[0]?.value || 'overview' },
        { icon: Package, label: "dashboard.orders", value: 'orders' },
        { icon: MessageSquare, label: "dashboard.messages", value: 'messages' },
        { icon: Wallet, label: "dashboard.wallet", value: 'wallet' },
        { icon: Settings, label: "dashboard.settings", value: 'settings' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-foreground flex flex-col transition-colors duration-300">
            {/* Main Navbar - Fixed */}
            <Navbar />

            <div className="flex pt-16 min-h-screen">
                {!isMobile && (
                    <motion.aside
                        initial={false}
                        animate={{ width: isSidebarOpen ? 260 : 70 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="hidden md:flex flex-col fixed left-0 top-16 bottom-0 z-40 bg-white dark:bg-gray-800 border-r dark:border-gray-700 shadow-md"
                    >
                        {/* Toggle Button */}
                        <div className="flex justify-end p-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                            >
                                {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto py-2">
                            <nav className="space-y-1 px-3">
                                {sidebarItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.value;
                                    // Handle translated labels if they are keys, or plain text
                                    const labelText = item.label.includes('.') ? t(item.label) : item.label;

                                    return (
                                        <button
                                            key={item.value}
                                            onClick={() => {
                                                if (item.onClick) item.onClick();
                                                else onTabChange(item.value);
                                            }}
                                            className={cn(
                                                "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden",
                                                isActive
                                                    ? "bg-green-600 text-white shadow-md shadow-green-200 dark:shadow-none"
                                                    : "text-gray-600 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-700 hover:text-green-700 dark:hover:text-green-300"
                                            )}
                                            title={!isSidebarOpen ? labelText : undefined}
                                        >
                                            <Icon className={cn("h-5 w-5 flex-shrink-0 z-10", isActive ? "text-white" : "")} />
                                            {isSidebarOpen && (
                                                <motion.span
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.1 }}
                                                    className="z-10 font-medium whitespace-nowrap"
                                                >
                                                    {labelText}
                                                </motion.span>
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* User Menu Section */}
                        <div className="border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                            <nav className="space-y-1 px-3 py-3">
                                <Link
                                    to="/settings"
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-gray-600 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-700 hover:text-green-700 dark:hover:text-green-300"
                                    title={!isSidebarOpen ? t('dashboard.settings') : undefined}
                                >
                                    <KeyRound className="h-5 w-5 flex-shrink-0" />
                                    {isSidebarOpen && <span className="font-medium">{t('dashboard.settings')}</span>}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    title={!isSidebarOpen ? t('dashboard.logout') : undefined}
                                >
                                    <LogOut className="h-5 w-5 flex-shrink-0" />
                                    {isSidebarOpen && <span className="font-medium">{t('dashboard.logout')}</span>}
                                </button>
                            </nav>
                        </div>

                        {/* Theme Selector */}
                        {isSidebarOpen && (
                            <div className="px-2 pb-2">
                                <ThemeSelectorSidebar isSidebarOpen={isSidebarOpen} />
                            </div>
                        )}
                    </motion.aside>
                )}

                {/* Mobile Sidebar - Slide Over */}
                <AnimatePresence>
                    {isMobile && isMobileMenuOpen && (
                        <>
                            {/* Overlay */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                                onClick={() => setIsMobileMenuOpen(false)}
                            />

                            {/* Sidebar - Mobile */}
                            <motion.aside
                                initial={{ x: -300 }}
                                animate={{ x: 0 }}
                                exit={{ x: -300 }}
                                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                className="fixed left-0 top-16 bottom-16 z-50 w-72 bg-white dark:bg-gray-800 border-r dark:border-gray-700 overflow-y-auto"
                            >
                                <div className="p-4">
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b dark:border-gray-700">
                                        <div className="flex items-center gap-3">
                                            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-lg border-2 border-green-200 dark:border-green-800">
                                                {user?.fullName?.charAt(0) || 'U'}
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className="font-bold text-gray-900 dark:text-white truncate max-w-[170px]">{user?.fullName}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[170px]">{user?.email}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    <nav className="space-y-2">
                                        {sidebarItems.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = activeTab === item.value;
                                            const labelText = item.label.includes('.') ? t(item.label) : item.label;
                                            return (
                                                <button
                                                    key={item.value}
                                                    onClick={() => {
                                                        if (item.onClick) {
                                                            item.onClick();
                                                        } else {
                                                            onTabChange(item.value);
                                                        }
                                                        setIsMobileMenuOpen(false);
                                                    }}
                                                    className={cn(
                                                        "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200",
                                                        isActive
                                                            ? "bg-green-600 text-white shadow-md shadow-green-200 dark:shadow-none"
                                                            : "text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-700"
                                                    )}
                                                >
                                                    <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-500 dark:text-gray-400")} />
                                                    <span className="text-sm font-medium">{labelText}</span>
                                                </button>
                                            );
                                        })}
                                    </nav>

                                    <div className="mt-8 pt-4 border-t dark:border-gray-700 space-y-2">
                                        <Link
                                            to="/settings"
                                            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <KeyRound className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                            <span className="text-sm font-medium">{t('dashboard.settings')}</span>
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
                                        >
                                            <LogOut className="h-5 w-5" />
                                            <span className="text-sm font-medium">{t('dashboard.logout')}</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <main
                    className={cn(
                        "flex-1 flex flex-col transition-all duration-300 relative",
                        !isMobile && isSidebarOpen ? "md:ml-[260px]" : !isMobile ? "md:ml-[70px]" : "ml-0"
                    )}
                >
                    <div className="flex-1 pb-20 md:pb-8">
                        {/* Mobile Top Bar */}
                        {isMobile && (
                            <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b dark:border-gray-700 px-4 py-3 flex items-center justify-between">
                                <button
                                    onClick={() => setIsMobileMenuOpen(true)}
                                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                                >
                                    <Menu className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                                </button>
                                <h1 className="font-semibold text-lg text-gray-900 dark:text-white">{title}</h1>
                                <div className="w-9" />
                            </div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            className={cn(
                                "animate-in fade-in duration-500",
                                isMobile ? "px-4 py-6" : "p-6 md:p-8"
                            )}
                        >
                            <div className="max-w-7xl mx-auto">
                                {/* Desktop Title */}
                                {!isMobile && (
                                    <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                        <div>
                                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h1>
                                            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('dashboard.subtitle')}</p>
                                        </div>
                                        <div className="text-right hidden lg:block">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                    </div>
                                )}

                                {children}
                            </div>
                        </motion.div>
                    </div>

                    {/* Desktop Footer */}
                    {!isMobile && (
                        <div className="mt-auto">
                            <Footer />
                        </div>
                    )}
                </main>

                {/* Mobile Bottom Navigation */}
                {isMobile && (
                    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t dark:border-gray-700 shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
                        <div className="grid grid-cols-5 h-16">
                            {mobileBottomNav.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.value ||
                                    (item.value === 'settings' && window.location.pathname === '/settings') ||
                                    (item.value === 'messages' && window.location.pathname === '/messages');

                                return (
                                    <button
                                        key={item.value}
                                        onClick={() => {
                                            if (item.value === 'settings') {
                                                navigate('/settings');
                                            } else if (item.value === 'messages') {
                                                navigate('/messages');
                                            } else {
                                                onTabChange(item.value);
                                            }
                                        }}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-1 transition-all duration-200 relative",
                                            isActive
                                                ? "text-green-600 dark:text-green-400 font-medium"
                                                : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                        )}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTabMobile"
                                                className="absolute -top-0.5 w-8 h-1 bg-green-500 rounded-full"
                                            />
                                        )}
                                        <Icon className="h-6 w-6" />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardLayout;
