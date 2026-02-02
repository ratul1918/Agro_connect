import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../ui/button';
import {
    Menu, X, LogOut, ChevronLeft, ChevronRight, KeyRound, Home, Package, MessageSquare, Wallet, Settings, LayoutDashboard
} from 'lucide-react';
import { cn } from '../../lib/utils';
import Footer from './Footer';
import { ThemeSelectorSidebar } from '../ThemeSelectorSidebar';
import Navbar from './Navbar';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarItem {
    label: string;
    icon: React.ElementType;
    value: string;
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
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024); // Extended breakpoint for dashboard
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleLogout = () => {
        logout();
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
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 text-foreground flex flex-col font-sans selection:bg-green-100 selection:text-green-900">
            {/* Main Navbar - Fixed */}
            <Navbar />

            <div className="flex pt-16 min-h-screen">
                {/* Desktop Sidebar */}
                {!isMobile && (
                    <motion.aside
                        initial={false}
                        animate={{ width: isSidebarOpen ? 280 : 80 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} // smooth easeOutQuint
                        className="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 z-40 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800"
                    >
                        {/* Toggle Button */}
                        <div className="flex justify-end p-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                            >
                                {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                            {sidebarItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.value;
                                const labelText = item.label.includes('.') ? t(item.label) : item.label;

                                return (
                                    <button
                                        key={item.value}
                                        onClick={() => {
                                            if (item.onClick) item.onClick();
                                            else onTabChange(item.value);
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                            isActive
                                                ? "bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-green-900/20"
                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                                        )}
                                        title={!isSidebarOpen ? labelText : undefined}
                                    >
                                        <Icon className={cn("h-5 w-5 flex-shrink-0 z-10", isActive ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200")} />

                                        <AnimatePresence mode='wait'>
                                            {isSidebarOpen && (
                                                <motion.span
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -10 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="z-10 font-medium whitespace-nowrap text-sm"
                                                >
                                                    {labelText}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </button>
                                );
                            })}
                        </div>

                        {/* User Menu Section */}
                        <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 p-4 space-y-2">
                            {/* Theme Selector - Compact when closed */}
                            <div className={cn("transition-all", !isSidebarOpen && "flex justify-center")}>
                                <ThemeSelectorSidebar isSidebarOpen={isSidebarOpen} />
                            </div>

                            <div className="pt-2 space-y-1">
                                <Link
                                    to="/settings"
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 hover:shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-gray-700",
                                        location.pathname === '/settings' && "bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 font-medium shadow-sm border-gray-200 dark:border-gray-700"
                                    )}
                                    title={!isSidebarOpen ? t('dashboard.settings') : undefined}
                                >
                                    <KeyRound className="h-5 w-5 flex-shrink-0" />
                                    {isSidebarOpen && <span>{t('dashboard.settings')}</span>}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700"
                                    title={!isSidebarOpen ? t('dashboard.logout') : undefined}
                                >
                                    <LogOut className="h-5 w-5 flex-shrink-0" />
                                    {isSidebarOpen && <span>{t('dashboard.logout')}</span>}
                                </button>
                            </div>
                        </div>
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
                                className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50"
                                onClick={() => setIsMobileMenuOpen(false)}
                            />

                            {/* Sidebar - Mobile */}
                            <motion.aside
                                initial={{ x: -300 }}
                                animate={{ x: 0 }}
                                exit={{ x: -300 }}
                                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                                className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-2xl overflow-y-auto"
                            >
                                <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
                                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <LayoutDashboard className="h-5 w-5 text-green-600" />
                                        Menu
                                    </h2>
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="p-4">
                                    {user && (
                                        <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
                                            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 font-bold border border-green-200 dark:border-green-800">
                                                {user.fullName?.charAt(0) || 'U'}
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className="font-semibold text-gray-900 dark:text-white truncate">{user.fullName}</div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</div>
                                            </div>
                                        </div>
                                    )}

                                    <nav className="space-y-1">
                                        {sidebarItems.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = activeTab === item.value;
                                            const labelText = item.label.includes('.') ? t(item.label) : item.label;
                                            return (
                                                <button
                                                    key={item.value}
                                                    onClick={() => {
                                                        if (item.onClick) item.onClick();
                                                        else onTabChange(item.value);
                                                        setIsMobileMenuOpen(false);
                                                    }}
                                                    className={cn(
                                                        "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200",
                                                        isActive
                                                            ? "bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-none"
                                                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                    )}
                                                >
                                                    <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-500 dark:text-gray-400")} />
                                                    <span className="font-medium">{labelText}</span>
                                                </button>
                                            );
                                        })}
                                    </nav>

                                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-2">
                                        <Link
                                            to="/settings"
                                            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <KeyRound className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                            <span className="font-medium">{t('dashboard.settings')}</span>
                                        </Link>
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMobileMenuOpen(false);
                                            }}
                                            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-medium"
                                        >
                                            <LogOut className="h-5 w-5" />
                                            <span>{t('dashboard.logout')}</span>
                                        </button>
                                    </div>
                                </div>
                            </motion.aside>
                        </>
                    )}
                </AnimatePresence>

                {/* Main Content Area */}
                <main
                    className={cn(
                        "flex-1 flex flex-col transition-all duration-300 ease-[0.22,1,0.36,1] relative w-full",
                        !isMobile && isSidebarOpen ? "lg:ml-[280px]" : !isMobile ? "lg:ml-[80px]" : "ml-0"
                    )}
                >
                    <div className="flex-1 pb-24 md:pb-12 max-w-[1920px]"> {/* Added padding for mobile nav */}
                        {/* Mobile Top Header (Sidebar Toggle + Title) */}
                        {isMobile && (
                            <div className="sticky top-16 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                                <button
                                    onClick={() => setIsMobileMenuOpen(true)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors"
                                >
                                    <Menu className="h-6 w-6" />
                                </button>
                                <h1 className="font-heading font-bold text-lg text-gray-900 dark:text-white capitalize tracking-tight">{title}</h1>
                                {/* Spacer to balance the menu button */}
                                <div className="w-10"></div>
                            </div>
                        )}

                        <motion.div
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className={cn(
                                "h-full",
                                isMobile ? "px-4 py-6" : "p-8 lg:p-10"
                            )}
                        >
                            <div className="max-w-[1600px] mx-auto space-y-8">
                                {/* Desktop Header */}
                                {!isMobile && (
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                                        <div>
                                            <h1 className="text-4xl font-heading font-bold tracking-tight text-gray-900 dark:text-white mb-2">{title}</h1>
                                            <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed max-w-2xl">{t('dashboard.subtitle')}</p>
                                        </div>
                                        <div className="text-right hidden xl:block">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm text-sm font-medium text-gray-600 dark:text-gray-300">
                                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {children}
                            </div>
                        </motion.div>
                    </div>

                    {/* Desktop Footer */}
                    {!isMobile && (
                        <div className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                            <Footer />
                        </div>
                    )}
                </main>

                {/* Mobile Bottom Navigation Bar (App-like feel) */}
                {isMobile && (
                    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 pb-safe">
                        <div className="grid grid-cols-5 h-[60px] items-center">
                            {mobileBottomNav.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.value ||
                                    (item.value === 'settings' && location.pathname === '/settings') ||
                                    (item.value === 'messages' && location.pathname === '/messages');

                                return (
                                    <button
                                        key={item.value}
                                        onClick={() => {
                                            if (item.value === 'settings') navigate('/settings');
                                            else if (item.value === 'messages') navigate('/messages');
                                            else onTabChange(item.value);
                                        }}
                                        className="relative flex flex-col items-center justify-center h-full w-full"
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTabMobile"
                                                className="absolute top-0 w-12 h-1 bg-green-500 rounded-b-full shadow-[0_2px_8px_rgba(34,197,94,0.5)]"
                                            />
                                        )}
                                        <Icon
                                            className={cn(
                                                "h-6 w-6 transition-all duration-300",
                                                isActive ? "text-green-600 dark:text-green-400 -translate-y-1" : "text-gray-400 dark:text-gray-500"
                                            )}
                                        />
                                        <span className={cn(
                                            "text-[10px] font-medium transition-all duration-300",
                                            isActive ? "text-green-600 dark:text-green-400 opacity-100" : "text-gray-400 dark:text-gray-500 opacity-0 h-0 w-0 overflow-hidden"
                                        )}>
                                            {t(item.label)}
                                        </span>
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
