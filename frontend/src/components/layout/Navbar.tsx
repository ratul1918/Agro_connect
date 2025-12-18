import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Menu, X, User, LogOut, Leaf, BarChart3, Globe, Palette, ShoppingCart, MessageSquare } from 'lucide-react';
import api from '../../api/axios';

const Navbar: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const { theme, setTheme } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch unread message count
    useEffect(() => {
        if (isAuthenticated) {
            const fetchUnreadCount = async () => {
                try {
                    const res = await api.get('/messages/chats');
                    const total = res.data.reduce((sum: number, chat: any) => sum + (chat.unreadCount || 0), 0);
                    setUnreadCount(total);
                } catch {
                    setUnreadCount(0);
                }
            };
            fetchUnreadCount();
            const interval = setInterval(fetchUnreadCount, 10000); // Poll every 10 seconds
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const handleLogout = () => {
        logout(); // AuthContext handles redirect to home
        setIsMenuOpen(false);
    };

    const getDashboardLink = () => {
        if (!user) return '/';
        switch (user.role) {
            case 'ROLE_ADMIN': return '/admin';
            case 'ROLE_FARMER': return '/farmer';
            case 'ROLE_BUYER': return '/buyer';
            case 'ROLE_AGRONOMIST': return '/agronomist';
            case 'ROLE_CUSTOMER': return '/customer';
            default: return '/';
        }
    };

    // Get role-specific navbar items
    const getRoleSpecificLinks = () => {
        if (!isAuthenticated || !user) return null;

        const baseLinks: { label: string; path: string; icon: any }[] = [];

        switch (user.role) {
            case 'ROLE_FARMER':
                return baseLinks;
            case 'ROLE_BUYER':
                return [
                    ...baseLinks,
                    { label: 'prices', path: '/market-prices', icon: BarChart3 }
                ];
            case 'ROLE_ADMIN':
                return baseLinks;
            case 'ROLE_AGRONOMIST':
                return baseLinks;
            default:
                return baseLinks;
        }
    };

    return (
        <nav className="bg-white shadow-lg border-b border-green-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl text-green-600 hover:text-green-700">
                        <Leaf className="h-6 w-6" />
                        AgroConnect
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/" className="text-gray-700 hover:text-green-600">{t('nav.home')}</Link>
                        <Link to="/blogs" className="text-gray-700 hover:text-green-600">{t('nav.blogs')}</Link>
                        <Link to="/marketplace/retail" className="text-gray-700 hover:text-green-600">{t('nav.retailShop')}</Link>
                        <Link to="/marketplace/b2b" className="text-gray-700 hover:text-green-600">{t('nav.b2bMarket')}</Link>
                        {isAuthenticated && getRoleSpecificLinks()?.map((link) => {
                            const IconComponent = link.icon;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="flex items-center gap-1 text-gray-700 hover:text-green-600"
                                >
                                    <IconComponent className="h-4 w-4" />
                                    {t(`nav.${link.label}`)}
                                </Link>
                            );
                        })}
                        {!isAuthenticated && (
                            <Link to="/about" className="text-gray-700 hover:text-green-600">{t('nav.about')}</Link>
                        )}
                    </div>

                    {/* Desktop Right Section */}
                    <div className="hidden md:flex items-center gap-4">
                        {/* Language Switcher - Always visible */}
                        <div className="relative"
                            onMouseEnter={() => setIsLanguageMenuOpen(true)}
                            onMouseLeave={() => setIsLanguageMenuOpen(false)}
                        >
                            <button
                                className="flex items-center gap-2 text-gray-700 hover:text-green-600 p-2 rounded hover:bg-gray-100"
                            >
                                <Globe className="h-4 w-4" />
                                <span className="text-sm font-medium">{language === 'en' ? 'English' : 'বাংলা'}</span>
                            </button>
                            {isLanguageMenuOpen && (
                                <div
                                    className="absolute right-0 top-full pt-1 z-50"
                                >
                                    <div className="bg-white border border-gray-200 rounded-md shadow-lg w-32">
                                        <button
                                            onClick={() => {
                                                setLanguage('en');
                                                setIsLanguageMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm rounded-t-md ${language === 'en' ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            English
                                        </button>
                                        <button
                                            onClick={() => {
                                                setLanguage('bn');
                                                setIsLanguageMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm border-t rounded-b-md ${language === 'bn' ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            বাংলা
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Theme Switcher - Always visible */}
                        <div className="relative"
                            onMouseEnter={() => setIsThemeMenuOpen(true)}
                            onMouseLeave={() => setIsThemeMenuOpen(false)}
                        >
                            <button
                                className="flex items-center gap-2 text-gray-700 hover:text-green-600 p-2 rounded hover:bg-gray-100"
                            >
                                <Palette className="h-4 w-4" />
                                <span className="text-sm font-medium capitalize">{theme}</span>
                            </button>
                            {isThemeMenuOpen && (
                                <div className="absolute right-0 top-full pt-1 z-50">
                                    <div className="bg-white border border-gray-200 rounded-md shadow-lg w-36">
                                        {(['light', 'dark', 'forest', 'emerald'] as const).map((t) => (
                                            <button
                                                key={t}
                                                onClick={() => {
                                                    setTheme(t);
                                                    setIsThemeMenuOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm first:rounded-t-md last:rounded-b-md border-t first:border-t-0 ${theme === t ? 'bg-green-100 text-green-700' : 'text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                <span className="capitalize">{t}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Cart Icon - Visible to everyone */}
                        <Link to="/cart" className="relative text-gray-700 hover:text-green-600 p-2">
                            <ShoppingCart className="h-5 w-5" />
                        </Link>

                        {/* Messages Icon - For authenticated users */}
                        {isAuthenticated && (
                            <Link to="/messages" className="relative text-gray-700 hover:text-green-600 p-2">
                                <MessageSquare className="h-5 w-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {isAuthenticated && user ? (
                            <>
                                {/* User Menu */}
                                <div className="relative"
                                    onMouseEnter={() => setIsUserMenuOpen(true)}
                                    onMouseLeave={() => setIsUserMenuOpen(false)}
                                >
                                    <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                                        <User className="h-4 w-4" />
                                        {user.fullName || 'User'}
                                    </button>
                                    {isUserMenuOpen && (
                                        <div className="absolute right-0 top-full pt-1 z-50">
                                            <div className="bg-white border border-gray-200 rounded-md shadow-lg w-48">
                                                <Link
                                                    to="/profile"
                                                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50 rounded-t-md"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    <User className="h-4 w-4 inline mr-2" />
                                                    {t('nav.profile')}
                                                </Link>
                                                <Link
                                                    to={getDashboardLink()}
                                                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-green-50"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    {t('nav.dashboard')}
                                                </Link>
                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 border-t rounded-b-md"
                                                >
                                                    <LogOut className="h-4 w-4 inline mr-2" />
                                                    {t('nav.logout')}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/auth" className="text-gray-700 hover:text-green-600">{t('nav.login')}</Link>
                                <Link to="/auth" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">{t('nav.signup')}</Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden text-gray-700 hover:text-green-600"
                    >
                        {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden pb-4 border-t">
                        <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${location.pathname === '/' ? 'text-primary bg-primary/10' : 'text-gray-600 hover:text-primary hover:bg-gray-50'}`}>
                            {t('nav.home')}
                        </Link>

                        {/* Public Marketplace Links - Visible to Everyone */}
                        <Link to="/marketplace/retail" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${location.pathname === '/marketplace/retail' ? 'text-primary bg-primary/10' : 'text-gray-600 hover:text-primary hover:bg-gray-50'}`}>
                            {t('nav.retailShop')}
                        </Link>
                        <Link to="/marketplace/b2b" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${location.pathname === '/marketplace/b2b' ? 'text-primary bg-primary/10' : 'text-gray-600 hover:text-primary hover:bg-gray-50'}`}>
                            {t('nav.b2bMarket')}
                        </Link>

                        {/* Role Specific Links */}
                        {isAuthenticated && getRoleSpecificLinks()?.map((link) => {
                            const IconComponent = link.icon;
                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${location.pathname === link.path ? 'text-primary bg-primary/10' : 'text-gray-600 hover:text-primary hover:bg-gray-50'}`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <IconComponent className="h-4 w-4" />
                                    {t(`nav.${link.label}`)}
                                </Link>
                            );
                        })}

                        {!isAuthenticated && (
                            <Link to="/about" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${location.pathname === '/about' ? 'text-primary bg-primary/10' : 'text-gray-600 hover:text-primary hover:bg-gray-50'}`} onClick={() => setIsMenuOpen(false)}>
                                {t('nav.about')}
                            </Link>
                        )}
                        <div className="border-t pt-4 mt-4">
                            {isAuthenticated && user ? (
                                <>
                                    <div className="flex items-center gap-2 text-gray-700 py-2 border-b pb-4">
                                        <User className="h-4 w-4" />
                                        <span>{user.fullName || 'User'}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setLanguage(language === 'en' ? 'bn' : 'en');
                                        }}
                                        className="flex items-center gap-2 py-2 text-gray-700 hover:text-green-600 w-full text-left"
                                    >
                                        <span className="h-4 w-4 inline mr-2 text-center font-bold">A</span>
                                        {language === 'en' ? 'বাংলা' : 'English'}
                                    </button>
                                    <Link
                                        to="/messages"
                                        className="flex items-center gap-2 py-2 text-gray-700 hover:text-green-600"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <MessageSquare className="h-4 w-4" />
                                        Messages
                                        {unreadCount > 0 && (
                                            <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className="block py-2 text-gray-700 hover:text-green-600"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {t('nav.profile')}
                                    </Link>
                                    <Link
                                        to={getDashboardLink()}
                                        className="block py-2 text-gray-700 hover:text-green-600"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        {t('nav.dashboard')}
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 py-2 text-red-600 hover:text-red-700 w-full"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        {t('nav.logout')}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/auth" className="block py-2 text-gray-700 hover:text-green-600" onClick={() => setIsMenuOpen(false)}>
                                        {t('nav.login')}
                                    </Link>
                                    <Link to="/auth" className="block py-2 text-gray-700 hover:text-green-600" onClick={() => setIsMenuOpen(false)}>
                                        {t('nav.signup')}
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
