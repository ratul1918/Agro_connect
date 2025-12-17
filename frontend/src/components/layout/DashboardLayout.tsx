import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../ui/button';
import {
    Menu, User, LogOut, Leaf,
    ChevronLeft, ChevronRight, KeyRound
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

    const handleLogout = () => {
        logout(); // AuthContext handles redirect
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col transition-colors duration-300">
            {/* Main Navbar - Fixed */}
            <Navbar />

            <div className="flex pt-20 min-h-screen">{/* Added more top padding for Navbar */}
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
                                to="/profile"
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground"
                                title={!isSidebarOpen ? "Profile" : undefined}
                            >
                                <User className="h-5 w-5 flex-shrink-0" />
                                {isSidebarOpen && <span>Profile</span>}
                            </Link>
                            <button
                                onClick={() => onTabChange('change-password')}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 text-muted-foreground hover:bg-muted hover:text-foreground"
                                title={!isSidebarOpen ? "Change Password" : undefined}
                            >
                                <KeyRound className="h-5 w-5 flex-shrink-0" />
                                {isSidebarOpen && <span>Change Password</span>}
                            </button>
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

                    <div className="p-4 border-t">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="w-full flex items-center justify-center p-2 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                        >
                            {isSidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        </button>
                    </div>
                </aside>

                {/* Mobile Sidebar Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Sidebar - Mobile */}
                <aside
                    className={cn(
                        "fixed left-0 top-20 bottom-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 md:hidden overflow-y-auto",
                        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <div className="p-4">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                {user?.fullName?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <div className="font-medium truncate max-w-[150px]">{user?.fullName}</div>
                                <div className="text-xs text-muted-foreground">{user?.email}</div>
                            </div>
                        </div>

                        <nav className="space-y-1">
                            {sidebarItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.value;
                                return (
                                    <button
                                        key={item.value}
                                        onClick={() => {
                                            onTabChange(item.value);
                                            setIsMobileMenuOpen(false);
                                        }}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-3 rounded-md transition-all duration-200",
                                            isActive
                                                ? "bg-primary text-primary-foreground font-medium shadow-sm"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        <Icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                                        <span>{item.label}</span>
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="mt-8 pt-4 border-t">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-3 px-3 py-3 rounded-md text-destructive hover:bg-destructive/10 transition-colors"
                            >
                                <LogOut className="h-5 w-5" />
                                <span>{t('nav.logout')}</span>
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main
                    className={cn(
                        "flex-1 flex flex-col transition-all duration-300",
                        isSidebarOpen ? "md:ml-64" : "md:ml-16"
                    )}
                >
                    <div className="flex-1 p-6 md:p-8 overflow-x-hidden">
                        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
                            {/* Breadcrumb / Title area could go here */}
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
                                <p className="text-muted-foreground mt-1">Manage your farming activities efficiently.</p>
                            </div>

                            {children}
                        </div>
                    </div>
                    {/* Fixed Bottom Footer inside content area if needed, or global footer */}
                    <div className="mt-auto">
                        <Footer />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
