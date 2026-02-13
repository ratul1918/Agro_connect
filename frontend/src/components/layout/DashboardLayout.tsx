import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../ui/button';
import {
    Menu, X, LogOut, ChevronLeft, ChevronRight, KeyRound, Home, Package, MessageSquare, Wallet, Settings, LayoutDashboard,
    Bell, Search
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
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
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 text-foreground flex flex-col font-sans selection:bg-green-100 selection:text-green-900 overflow-hidden">
            {/* Background Blobs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-green-50/50 to-transparent dark:from-green-900/10"></div>
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-green-200/20 dark:bg-green-900/10 blur-[100px] animate-blob"></div>
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-200/20 dark:bg-blue-900/10 blur-[100px] animate-blob animation-delay-2000"></div>
            </div>

            {/* Main Navbar - Fixed */}
            <Navbar />

            <div className="flex pt-16 min-h-screen relative">
                {/* Desktop Sidebar */}
                {!isMobile && (
                    <motion.aside
                        initial={false}
                        animate={{ width: isSidebarOpen ? 280 : 88 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className={cn(
                            "hidden lg:flex flex-col fixed left-0 top-16 bottom-0 z-40",
                            "bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl",
                            "border-r border-white/20 dark:border-gray-800",
                            "shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
                        )}
                    >
                        {/* Sidebar Header / Toggle */}
                        <div className="flex items-center justify-between p-4 mb-2">
                            {isSidebarOpen && (
                                <span className="text-xs font-bold tracking-widest text-gray-400 uppercase ml-2">Menu</span>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className={cn(
                                    "text-gray-400 hover:text-green-600 dark:text-gray-500 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all",
                                    !isSidebarOpen && "mx-auto"
                                )}
                            >
                                {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                            </Button>
                        </div>

                        {/* Sidebar Items */}
                        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
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
                                                ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30"
                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200",
                                            !isSidebarOpen && "justify-center px-0"
                                        )}
                                        title={!isSidebarOpen ? labelText : undefined}
                                    >
                                        <Icon className={cn("h-5 w-5 flex-shrink-0 z-10 transition-transform duration-300", isActive ? "text-white" : "text-gray-500 dark:text-gray-400 group-hover:scale-110")} />

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

                                        {/* Active Indicator Dot for collapsed state */}
                                        {!isSidebarOpen && isActive && (
                                            <motion.div
                                                layoutId="activeDot"
                                                className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white shadow-sm"
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* User Profile & Settings */}
                        <div className="m-4 p-4 rounded-2xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 space-y-2 backdrop-blur-sm">
                            {isSidebarOpen && user && (
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700/50">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 p-[2px]">
                                        <div className="h-full w-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
                                            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-tr from-green-500 to-emerald-700">
                                                {user.fullName?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{user.fullName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                    </div>
                                </div>
                            )}

                            {/* Theme Selector - Compact when closed */}
                            <div className={cn("transition-all mb-2", !isSidebarOpen && "flex justify-center")}>
                                <ThemeSelectorSidebar isSidebarOpen={isSidebarOpen} />
                            </div>

                            <div className="space-y-1">
                                <Link
                                    to="/settings"
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200 hover:shadow-sm ring-1 ring-transparent hover:ring-gray-200 dark:hover:ring-gray-700",
                                        location.pathname === '/settings' && "bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 font-medium shadow-sm ring-gray-200 dark:ring-gray-700",
                                        !isSidebarOpen && "justify-center"
                                    )}
                                    title={!isSidebarOpen ? t('dashboard.settings') : undefined}
                                >
                                    <KeyRound className="h-4 w-4 flex-shrink-0" />
                                    {isSidebarOpen && <span className="text-sm">{t('dashboard.settings')}</span>}
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700",
                                        !isSidebarOpen && "justify-center"
                                    )}
                                    title={!isSidebarOpen ? t('dashboard.logout') : undefined}
                                >
                                    <LogOut className="h-4 w-4 flex-shrink-0" />
                                    {isSidebarOpen && <span className="text-sm">{t('dashboard.logout')}</span>}
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
                                className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50"
                                onClick={() => setIsMobileMenuOpen(false)}
                            />

                            {/* Sidebar - Mobile */}
                            <motion.aside
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -100, opacity: 0 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className="fixed left-4 top-4 bottom-4 z-50 w-[85%] max-w-[320px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-gray-800 shadow-2xl rounded-3xl overflow-y-auto"
                            >
                                <div className="p-5 flex items-center justify-between border-b border-gray-100 dark:border-gray-800/50">
                                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600 flex items-center gap-2">
                                        <LayoutDashboard className="h-6 w-6 text-green-600" />
                                        AgroConnect
                                    </h2>
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <div className="p-4 space-y-6">
                                    {user && (
                                        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/10 rounded-2xl border border-green-100 dark:border-green-800/30">
                                            <div className="h-12 w-12 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-xl font-bold text-green-600 dark:text-green-400">
                                                {user.fullName?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div className="overflow-hidden">
                                                <div className="font-bold text-gray-900 dark:text-white truncate">{user.fullName}</div>
                                                <Badge className="mt-1 bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200 border-none text-[10px] px-2 py-0.5 h-auto">
                                                    {user.role?.replace('ROLE_', '')}
                                                </Badge>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Menu</p>
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
                                                        "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200",
                                                        isActive
                                                            ? "bg-green-600 text-white shadow-lg shadow-green-200 dark:shadow-none"
                                                            : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                                    )}
                                                >
                                                    <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-gray-500 dark:text-gray-400")} />
                                                    <span className="font-medium">{labelText}</span>
                                                    {isActive && <ChevronRight className="h-4 w-4 ml-auto opacity-50" />}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <div className="space-y-1 border-t border-gray-100 dark:border-gray-800 pt-6">
                                        <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Settings</p>
                                        <Link
                                            to="/settings"
                                            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-medium"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <KeyRound className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                            <span>{t('dashboard.settings')}</span>
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
                        !isMobile && isSidebarOpen ? "lg:ml-[280px]" : !isMobile ? "lg:ml-[88px]" : "ml-0"
                    )}
                >
                    <div className="flex-1 pb-24 md:pb-12 max-w-[1920px]">
                        {/* Mobile Top Header (Sidebar Toggle + Title) */}
                        {isMobile && (
                            <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center justify-between shadow-sm">
                                <button
                                    onClick={() => setIsMobileMenuOpen(true)}
                                    className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                                >
                                    <Menu className="h-5 w-5" />
                                </button>
                                <h1 className="font-heading font-bold text-lg text-gray-900 dark:text-white capitalize tracking-tight flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    {title}
                                </h1>
                                {/* Notification Bell (Placeholder for now) */}
                                <button className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400">
                                    <Bell className="h-5 w-5" />
                                </button>
                            </div>
                        )}

                        <motion.div
                            key={activeTab} // Animate when tab changes
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            className={cn(
                                "h-full",
                                isMobile ? "px-4 py-6" : "p-8 lg:p-10"
                            )}
                        >
                            <div className="max-w-[1600px] mx-auto space-y-8">
                                {/* Desktop Header */}
                                {!isMobile && (
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="h-10 w-1 p-0.5 rounded-full bg-gradient-to-b from-green-500 to-emerald-600"></div>
                                                <h1 className="text-4xl font-heading font-bold tracking-tight text-gray-900 dark:text-white">
                                                    {title}
                                                </h1>
                                            </div>
                                            <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed max-w-2xl pl-4">
                                                {t('dashboard.subtitle')}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {/* Search box placeholder for dashboards */}
                                            <div className="relative hidden xl:block group">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    placeholder="Search dashboard..."
                                                    className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all w-64 shadow-sm"
                                                />
                                            </div>

                                            <div className="text-right hidden xl:block">
                                                <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm text-sm font-medium text-gray-600 dark:text-gray-300">
                                                    <span className="relative flex h-2.5 w-2.5">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                                                    </span>
                                                    {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Divider */}
                                {!isMobile && <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent mb-8"></div>}

                                {children}
                            </div>
                        </motion.div>
                    </div>

                    {/* Desktop Footer */}
                    {!isMobile && (
                        <div className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md">
                            <Footer />
                        </div>
                    )}
                </main>

                {/* Mobile Bottom Navigation Bar (Glassmorphism) */}
                {isMobile && (
                    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                        <div className="grid grid-cols-5 h-[70px] items-center px-2">
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
                                        className="relative flex flex-col items-center justify-center h-full w-full group"
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTabMobile"
                                                className="absolute -top-[1px] w-10 h-1 bg-green-500 rounded-b-full shadow-[0_2px_8px_rgba(34,197,94,0.5)]"
                                            />
                                        )}
                                        <div className={cn(
                                            "p-1.5 rounded-xl transition-all duration-300",
                                            isActive ? "bg-green-50 dark:bg-green-900/20 -translate-y-1" : ""
                                        )}>
                                            <Icon
                                                className={cn(
                                                    "h-6 w-6 transition-all duration-300",
                                                    isActive ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                                                )}
                                            />
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-medium transition-all duration-300 absolute bottom-1.5",
                                            isActive ? "text-green-600 dark:text-green-400 opacity-100" : "text-gray-400 dark:text-gray-500 opacity-0 scale-75"
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
