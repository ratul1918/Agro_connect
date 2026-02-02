import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Menu, X, User, LogOut, Leaf, Globe, Palette, ShoppingCart, MessageSquare, ChevronDown, LayoutDashboard } from 'lucide-react';
import api from '../../api/axios';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const { theme, setTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch unread message count
    useEffect(() => {
        if (isAuthenticated) {
            const fetchUnreadCount = async () => {
                try {
                    const res = await api.get('/messenger/chats');
                    const total = res.data.reduce((sum: number, chat: any) => sum + (chat.unread_count || 0), 0);
                    setUnreadCount(total);
                } catch {
                    setUnreadCount(0);
                }
            };
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 30000); // reduced frequency
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
    };

    const getDashboardLink = () => {
        if (!user) return '/';
        switch (user.role) {
            case 'ROLE_ADMIN': return '/admin/overview';
            case 'ROLE_FARMER': return '/farmer/overview';
            case 'ROLE_BUYER': return '/buyer/overview';
            case 'ROLE_AGRONOMIST': return '/agronomist/overview';
            case 'ROLE_CUSTOMER': return '/customer/overview';
            case 'ROLE_GENERAL_CUSTOMER': return '/customer/overview';
            default: return '/';
        }
    };

    const navLinks = [
        { label: 'nav.home', path: '/' },
        { label: 'nav.retailShop', path: '/marketplace/retail' },
        { label: 'nav.b2bMarket', path: '/marketplace/b2b' },
        { label: 'nav.blogs', path: '/blogs' },
        { label: 'nav.about', path: '/about' },
    ];

    const isCustomer = user?.role === 'ROLE_GENERAL_CUSTOMER' || user?.role === 'ROLE_CUSTOMER';

    return (
        <nav
            className={cn(
                "fixed top-0 w-full z-50 transition-all duration-300 border-b",
                scrolled
                    ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-gray-200 dark:border-gray-800 shadow-sm"
                    : "bg-white dark:bg-gray-900 border-transparent"
            )}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo area */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="bg-green-600 rounded-lg p-1.5 text-white group-hover:bg-green-700 transition-colors">
                            <Leaf className="h-5 w-5" />
                        </div>
                        <span className="font-heading font-bold text-xl text-gray-900 dark:text-white tracking-tight">
                            AgroConnect
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1">
                        {!isCustomer && navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={cn(
                                    "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                    location.pathname === link.path
                                        ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                                        : "text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                )}
                            >
                                {t(link.label)}
                            </Link>
                        ))}
                    </div>

                    {/* Right Section */}
                    <div className="hidden md:flex items-center gap-3">
                        {/* Settings / Utils Group */}
                        <div className="flex items-center gap-1 border-r border-gray-200 dark:border-gray-700 pr-3 mr-1">
                            {/* Language */}
                            <div className="relative" onMouseEnter={() => setIsLanguageMenuOpen(true)} onMouseLeave={() => setIsLanguageMenuOpen(false)}>
                                <button className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <Globe className="h-5 w-5" />
                                </button>
                                <AnimatePresence>
                                    {isLanguageMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 top-full pt-2 w-32"
                                        >
                                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden py-1">
                                                <button onClick={() => setLanguage('en')} className={cn("w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50", language === 'en' && "text-green-600 font-medium")}>English</button>
                                                <button onClick={() => setLanguage('bn')} className={cn("w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700/50", language === 'bn' && "text-green-600 font-medium")}>বাংলা</button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Theme */}
                            <div className="relative" onMouseEnter={() => setIsThemeMenuOpen(true)} onMouseLeave={() => setIsThemeMenuOpen(false)}>
                                <button className="p-2 rounded-full text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                    <Palette className="h-5 w-5" />
                                </button>
                                <AnimatePresence>
                                    {isThemeMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute right-0 top-full pt-2 w-36"
                                        >
                                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden py-1">
                                                {(['light', 'dark', 'forest', 'emerald'] as const).map((t) => (
                                                    <button key={t} onClick={() => setTheme(t)} className={cn("w-full text-left px-4 py-2 text-sm capitalize hover:bg-gray-50 dark:hover:bg-gray-700/50", theme === t && "text-green-600 font-medium")}>
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* Cart */}
                        <Link to="/cart" className="relative p-2 rounded-full text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <ShoppingCart className="h-5 w-5" />
                        </Link>

                        {/* Messages */}
                        {isAuthenticated && (
                            <Link to="/messages" className="relative p-2 rounded-full text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <MessageSquare className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900" />
                                )}
                            </Link>
                        )}

                        {/* User Profile / Login */}
                        {isAuthenticated && user ? (
                            <div className="relative ml-2" onMouseEnter={() => setIsUserMenuOpen(true)} onMouseLeave={() => setIsUserMenuOpen(false)}>
                                <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                        {user.fullName?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                </button>

                                <AnimatePresence>
                                    {isUserMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 top-full pt-2 w-56 transform origin-top-right"
                                        >
                                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden py-2">
                                                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 mb-2">
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user.fullName}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                                </div>

                                                <Link to={getDashboardLink()} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-700/50 hover:text-green-700 dark:hover:text-green-400">
                                                    <LayoutDashboard className="h-4 w-4" />
                                                    {t('nav.dashboard')}
                                                </Link>
                                                <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-700/50 hover:text-green-700 dark:hover:text-green-400">
                                                    <User className="h-4 w-4" />
                                                    {t('nav.profile')}
                                                </Link>

                                                <div className="border-t border-gray-100 dark:border-gray-700 my-1 pt-1">
                                                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
                                                        <LogOut className="h-4 w-4" />
                                                        {t('nav.logout')}
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 ml-4">
                                <Link to="/auth?tab=login">
                                    <Button variant="ghost" className="text-gray-600 dark:text-gray-300 hover:text-green-700 dark:hover:text-green-400">
                                        {t('nav.login')}
                                    </Button>
                                </Link>
                                <Link to="/auth?tab=signup">
                                    <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 shadow-md shadow-green-200 dark:shadow-none">
                                        {t('nav.signup')}
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        {isAuthenticated && (
                            <Link to="/messages" className="relative text-gray-500 dark:text-gray-400">
                                <MessageSquare className="h-6 w-6" />
                                {unreadCount > 0 && <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white" />}
                            </Link>
                        )}
                        <Link to="/cart" className="relative text-gray-500 dark:text-gray-400">
                            <ShoppingCart className="h-6 w-6" />
                        </Link>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-700 dark:text-gray-200 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-1">
                            {isAuthenticated && user && (
                                <div className="flex items-center gap-3 p-3 mb-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                    <div className="h-10 w-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold">
                                        {user.fullName?.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-semibold text-gray-900 dark:text-white truncate">{user.fullName}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                            )}

                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-green-600"
                                >
                                    {t(link.label)}
                                </Link>
                            ))}

                            {isAuthenticated && (
                                <Link
                                    to={getDashboardLink()}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-green-600"
                                >
                                    Dashboard
                                </Link>
                            )}

                            <div className="border-t border-gray-100 dark:border-gray-700 my-4 pt-4 flex gap-4">
                                <button
                                    onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium"
                                >
                                    <Globe className="h-4 w-4" />
                                    {language === 'en' ? 'বাংলা' : 'English'}
                                </button>
                                <button
                                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm font-medium"
                                >
                                    <Palette className="h-4 w-4" />
                                    {theme}
                                </button>
                            </div>

                            {isAuthenticated ? (
                                <button
                                    onClick={handleLogout}
                                    className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20"
                                >
                                    <LogOut className="h-5 w-5" />
                                    {t('nav.logout')}
                                </button>
                            ) : (
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <Link to="/auth?tab=login" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="outline" className="w-full justify-center">Log in</Button>
                                    </Link>
                                    <Link to="/auth?tab=signup" onClick={() => setIsMenuOpen(false)}>
                                        <Button className="w-full justify-center bg-green-600">Sign up</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
