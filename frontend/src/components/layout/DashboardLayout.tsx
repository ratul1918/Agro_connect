import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

interface SidebarItem {
    label: string;
    icon: React.ElementType;
    value: string; // Used for identifying active tab/state
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
        { icon: Home, label: "Home", value: sidebarItems[0]?.value || 'overview' },
        { icon: Package, label: "Orders", value: 'orders' },
        { icon: MessageSquare, label: "Messages", value: 'messages' },
        { icon: Wallet, label: "Wallet", value: 'wallet' },
        { icon: Settings, label: "Settings", value: 'settings' }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
            {/* Main Navbar - Fixed */}
            <Navbar />

            <div className="flex pt-16 min-h-screen">{/* Adjusted top padding for mobile */}
                {!isMobile && (
                <aside
                    className={cn(
                        "hidden md:flex flex-col fixed left-0 top-20 bottom-0 z-40 bg-card border-r transition-all duration-300 shadow-sm",
                        isSidebarOpen ? "w-64" : "w-16"
                    )}
                >
                    <div className="flex-1 overflow-y-auto py-4">
                        <nav className="space-y-1 px-2">
                            {sidebarItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.value;
                                return (
                                    <button
                                        key={item.value}
                                        onClick={() => onTabChange(item.value)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group",
                                            isActive
                                                ? "bg-primary text-primary-foreground font-medium shadow-sm"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                        title={!isSidebarOpen ? item.label : undefined}
                                    >
                                        <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                                        {isSidebarOpen && <span>{item.label}</span>}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* User Menu Section */}
                    <div className="border-t">
                        <nav className="space-y-1 px-2 py-3">
                            <Link
                                to="/settings"
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground"
                                title={!isSidebarOpen ? "Settings" : undefined}
                            >
                                <KeyRound className="h-5 w-5 flex-shrink-0" />
                                {isSidebarOpen && <span>সেটিংস (Settings)</span>}
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-destructive hover:bg-destructive/10"
                                title={!isSidebarOpen ? "Logout" : undefined}
                            >
                                <LogOut className="h-5 w-5 flex-shrink-0" />
                                {isSidebarOpen && <span>Logout</span>}
                            </button>
                        </nav>
                    </div>

                    {/* Theme Selector */}
                    <ThemeSelectorSidebar isSidebarOpen={isSidebarOpen} />
                </aside>
                )}

                {/* Mobile Sidebar - Slide Over */}
                {isMobile && (
                    <>
                        {/* Mobile Sidebar Overlay */}
                        {isMobileMenuOpen && (
                            <div
                                className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
                                onClick={() => setIsMobileMenuOpen(false)}
                            />
                        )}

                        {/* Sidebar - Mobile */}
                        <aside
                            className={cn(
                                "fixed left-0 top-16 bottom-16 z-50 w-72 bg-card border-r transform transition-transform duration-300 overflow-y-auto",
                                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                            )}
                        >
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-6 pb-4 border-b">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                            {user?.fullName?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <div className="font-medium truncate max-w-[180px]">{user?.fullName}</div>
                                            <div className="text-xs text-muted-foreground truncate max-w-[180px]">{user?.email}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="p-2 rounded-md hover:bg-muted"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <nav className="space-y-2">
                                    {sidebarItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = activeTab === item.value;
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
                                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                                    isActive
                                                        ? "bg-primary text-primary-foreground font-medium shadow-sm"
                                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                )}
                                            >
                                                <Icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                                                <span className="text-sm font-medium">{item.label}</span>
                                            </button>
                                        );
                                    })}
                                </nav>

                                <div className="mt-8 pt-4 border-t space-y-2">
                                    <Link
                                        to="/settings"
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <KeyRound className="h-5 w-5" />
                                        <span className="text-sm font-medium">Settings</span>
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
                                    >
                                        <LogOut className="h-5 w-5" />
                                        <span className="text-sm font-medium">Logout</span>
                                    </button>
                                </div>
                            </div>
                        </aside>
                    </>
                )}

                {/* Main Content */}
                <main
                    className={cn(
                        "flex-1 flex flex-col transition-all duration-300",
                        !isMobile && isSidebarOpen ? "md:ml-64" : !isMobile ? "md:ml-16" : "ml-0"
                    )}
                >
                    <div className="flex-1 pb-20 md:pb-8">
                        {/* Mobile Top Bar */}
                        {isMobile && (
                            <div className="sticky top-0 z-30 bg-background border-b px-4 py-3">
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => setIsMobileMenuOpen(true)}
                                        className="p-2 rounded-md hover:bg-muted"
                                    >
                                        <Menu className="h-5 w-5" />
                                    </button>
                                    <h1 className="font-semibold text-lg truncate">{title}</h1>
                                    <div className="w-9" />
                                </div>
                            </div>
                        )}

                        <div className={cn(
                            "animate-in fade-in duration-500",
                            isMobile ? "px-4 py-6" : "p-6 md:p-8"
                        )}>
                            <div className="max-w-6xl mx-auto">
                                {/* Desktop Title */}
                                {!isMobile && (
                                    <div className="mb-8">
                                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
                                        <p className="text-muted-foreground mt-1">Manage your farming activities efficiently.</p>
                                    </div>
                                )}

                                {children}
                            </div>
                        </div>
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
                    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t">
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
                                                window.location.href = '/settings';
                                            } else if (item.value === 'messages') {
                                                window.location.href = '/messages';
                                            } else {
                                                onTabChange(item.value);
                                            }
                                        }}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-1 transition-all duration-200",
                                            isActive
                                                ? "text-primary font-medium"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="text-xs">{item.label}</span>
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
