import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RetailMarketplacePage from './RetailMarketplacePage';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Leaf, ShoppingBag, TrendingUp, Users, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion, useScroll, useTransform } from 'framer-motion';

const HomePage: React.FC = () => {
    const { t } = useLanguage();
    const { user, isAuthenticated } = useAuth();
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    // For customers, show Retail Shop directly on Home URL
    if (isAuthenticated && user && (user.role === 'ROLE_GENERAL_CUSTOMER' || user.role === 'ROLE_CUSTOMER')) {
        return <RetailMarketplacePage />;
    }
    // Mock Market Data for Ticker - In real app, fetch from API
    const marketTicker = [
        { crop: 'Rice (Miniket)', price: '৳65/kg', trend: '+2%' },
        { crop: 'Potato', price: '৳45/kg', trend: '-5%' },
        { crop: 'Onion', price: '৳90/kg', trend: '+10%' },
        { crop: 'Lentils', price: '৳120/kg', trend: '0%' },
        { crop: 'Wheat', price: '৳55/kg', trend: '+1%' },
        { crop: 'Garlic', price: '৳180/kg', trend: '-2%' },
        { crop: 'Green Chili', price: '৳200/kg', trend: '+15%' },
        { crop: 'Turmeric', price: '৳220/kg', trend: '+5%' },
        { crop: 'Ginger', price: '৳240/kg', trend: '+8%' },
    ];

    // Ensure endless loop for ticker by duplicating data
    const tickerData = [...marketTicker, ...marketTicker, ...marketTicker, ...marketTicker];

    const features = [
        {
            icon: <ShoppingBag className="h-6 w-6" />,
            title: t('home.feature_direct_title'),
            description: t('home.feature_direct_desc'),
            color: "text-emerald-600 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-900/20",
            border: "border-emerald-100 dark:border-emerald-800"
        },
        {
            icon: <TrendingUp className="h-6 w-6" />,
            title: t('home.feature_prices_title'),
            description: t('home.feature_prices_desc'),
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-900/20",
            border: "border-blue-100 dark:border-blue-800"
        },
        {
            icon: <Users className="h-6 w-6" />,
            title: t('home.feature_expert_title'),
            description: t('home.feature_expert_desc'),
            color: "text-purple-600 dark:text-purple-400",
            bg: "bg-purple-50 dark:bg-purple-900/20",
            border: "border-purple-100 dark:border-purple-800"
        },
        {
            icon: <Shield className="h-6 w-6" />,
            title: t('home.feature_secure_title'),
            description: t('home.feature_secure_desc'),
            color: "text-orange-600 dark:text-orange-400",
            bg: "bg-orange-50 dark:bg-orange-900/20",
            border: "border-orange-100 dark:border-orange-800"
        }
    ];

    // Assuming t works with keys, otherwise fallbacks are English
    const categories = [
        { name: 'Rice', image: "🌾", count: 154, color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
        { name: 'Vegetables', image: "🥬", count: 230, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
        { name: 'Fruits', image: "🍎", count: 180, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
        { name: 'Spices', image: "🌶️", count: 95, color: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
        { name: 'Pulses', image: "🫘", count: 120, color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
        { name: 'Fish', image: "🐟", count: 85, color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-green-100 selection:text-green-900 font-sans">

            {/* HERO SECTION */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                {/* Background Decor */}
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-green-100/40 via-transparent to-transparent dark:from-green-900/20"></div>
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent dark:from-blue-900/20"></div>

                {/* Animated Shapes */}
                <motion.div style={{ y: y1 }} className="absolute top-20 right-[10%] w-64 h-64 bg-yellow-200/20 rounded-full blur-3xl -z-10" />
                <motion.div style={{ y: y2 }} className="absolute bottom-20 left-[10%] w-72 h-72 bg-green-200/20 rounded-full blur-3xl -z-10" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="text-center lg:text-left space-y-8"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-green-200 dark:border-green-800 shadow-sm">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-sm font-medium text-green-800 dark:text-green-300 tracking-wide uppercase text-[11px]">{t('home.badge')}</span>
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-gray-900 dark:text-white">
                                {t('home.hero_title_1')} <br className="hidden lg:block" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500 dark:from-green-400 dark:to-emerald-300">
                                    {t('home.hero_title_2')}
                                </span>
                            </h1>

                            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                {t('home.hero_subtitle')}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
                                <Link to="/marketplace/retail">
                                    <Button size="lg" className="h-14 px-8 text-base rounded-full shadow-lg shadow-green-600/20 hover:shadow-green-600/30 transition-all bg-green-600 hover:bg-green-700 text-white border-none w-full sm:w-auto">
                                        {t('home.browse_marketplace')}
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-4">
                                    <Link to="/auth?tab=signup&role=farmer">
                                        <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 w-full sm:w-auto">
                                            {t('home.join_farmer')}
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            <div className="pt-6 flex items-center justify-center lg:justify-start gap-3 text-sm text-gray-500 dark:text-gray-400">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 overflow-hidden" >
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 55}`} alt="User" />
                                        </div>
                                    ))}
                                </div>
                                <p><span className="font-bold text-gray-900 dark:text-white">5k+</span> Farmers & Buyers</p>
                            </div>
                        </motion.div>

                        {/* Interactive Hero Image */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative group perspective-1000"
                        >
                            <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-green-900/10 border border-white/20 dark:border-gray-700 bg-white/10 backdrop-blur-sm transform transition-transform duration-500 group-hover:rotate-y-2 group-hover:rotate-x-2">
                                <img
                                    src="/hero_agriculture.png"
                                    alt="Modern Agriculture"
                                    className="w-full h-auto object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
                                    onError={(e) => {
                                        // Fallback if image missing
                                        e.currentTarget.src = "https://images.unsplash.com/photo-1625246333195-098e4785461b?q=80&w=1920&auto=format&fit=crop";
                                    }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                                {/* Floating Card 1 */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute bottom-8 left-8 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-4 border border-green-100 dark:border-gray-700 max-w-[200px]"
                                >
                                    <div className="bg-green-100 dark:bg-green-900/50 p-2.5 rounded-xl text-green-600 dark:text-green-400">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Market Trend</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Rice Price <span className="text-green-500 text-xs">+12%</span></p>
                                    </div>
                                </motion.div>

                                {/* Floating Card 2 */}
                                <motion.div
                                    animate={{ y: [0, 10, 0] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                    className="absolute top-8 right-8 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-blue-100 dark:border-gray-700"
                                >
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">Verified Seller</span>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Decorative Blob */}
                            <div className="absolute -inset-4 bg-gradient-to-r from-green-400 to-emerald-600 rounded-[3rem] blur-2xl opacity-20 -z-10 group-hover:opacity-30 transition-opacity duration-500"></div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* LIVE TICKER */}
            <div className="w-full bg-slate-900 border-y border-slate-800 py-3 overflow-hidden relative z-20">
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-900 to-transparent z-10"></div>
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-900 to-transparent z-10"></div>

                <motion.div
                    className="flex gap-16 whitespace-nowrap min-w-full"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                >
                    {tickerData.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <span className="font-semibold text-slate-300 text-sm tracking-wide">{item.crop}</span>
                            <span className="font-bold text-white font-mono">{item.price}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${item.trend.includes('+') ? 'bg-green-500/20 text-green-400' : item.trend.includes('-') ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                {item.trend}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* KEY FEATURES GRID */}
            <section className="py-24 bg-gray-50/50 dark:bg-gray-900/50 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-green-600 font-semibold tracking-wider uppercase text-sm">{t('home.features_subtitle')}</span>
                        <h2 className="text-3xl lg:text-4xl font-bold mt-2 mb-4 text-gray-900 dark:text-white">{t('home.features_title')}</h2>
                        <div className="h-1 w-20 bg-green-500 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className={`h-full border border-gray-100 dark:border-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden`}>
                                    <div className={`absolute top-0 right-0 w-24 h-24 ${feature.bg} rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700 ease-out`}></div>
                                    <CardContent className="p-8 relative">
                                        <div className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform`}>
                                            {feature.icon}
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{feature.title}</h3>
                                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
                                            {feature.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CATEGORIES SECTION */}
            <section className="py-24 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{t('home.categories_title')}</h2>
                            <p className="text-gray-500 dark:text-gray-400">{t('home.categories_subtitle')}</p>
                        </div>
                        <Link to="/marketplace/retail">
                            <Button variant="ghost" className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 group">
                                View All Categories <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                        {categories.map((cat, idx) => (
                            <Link to={`/marketplace/retail?category=${cat.name}`} key={idx}>
                                <motion.div
                                    whileHover={{ y: -8 }}
                                    className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-6 text-center shadow-sm hover:shadow-lg hover:border-green-200 dark:hover:border-green-800 transition-all cursor-pointer group h-full flex flex-col items-center"
                                >
                                    <div className={`w-20 h-20 mx-auto rounded-full ${cat.color} flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        {cat.image}
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{cat.name}</h3>
                                    <span className="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-full">{cat.count}+ Products</span>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS / CTA BLEND */}
            <section className="py-24 relative">
                <div className="absolute inset-x-4 bottom-4 top-20 bg-gray-900 rounded-[3rem] -z-20 overflow-hidden">
                    {/* Abstract Noise Texture */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
                    <div className="absolute right-0 top-0 w-[800px] h-[800px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none"></div>
                    <div className="absolute left-0 bottom-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                </div>

                <div className="max-w-7xl mx-auto px-8 pt-32 pb-20 text-center text-white">
                    <Leaf className="w-16 h-16 text-green-400 mx-auto mb-6" />
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">{t('home.cta_title')}</h2>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-12">
                        {t('home.cta_subtitle')}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <Link to="/auth?tab=signup&role=farmer">
                            <Button size="lg" className="h-16 px-10 bg-green-500 hover:bg-green-400 text-green-950 font-bold text-lg rounded-full shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_50px_rgba(34,197,94,0.5)] transition-all border-none">
                                <Leaf className="mr-2 h-5 w-5" />
                                {t('home.register_farmer')}
                            </Button>
                        </Link>
                        <Link to="/auth?tab=signup&role=buyer">
                            <Button size="lg" variant="outline" className="h-16 px-10 border-2 border-white/20 text-white hover:bg-white/10 rounded-full text-lg font-semibold backdrop-blur-sm">
                                {t('home.register_buyer')}
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto text-left md:text-center">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400 mb-4 md:mx-auto font-bold text-lg">1</div>
                            <h4 className="font-bold text-lg mb-2">Register</h4>
                            <p className="text-sm text-gray-400">Create an account as a Farmer, Buyer, or specific role.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 mb-4 md:mx-auto font-bold text-lg">2</div>
                            <h4 className="font-bold text-lg mb-2">Connect</h4>
                            <p className="text-sm text-gray-400">List produce or browse the marketplace for best deals.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 mb-4 md:mx-auto font-bold text-lg">3</div>
                            <h4 className="font-bold text-lg mb-2">Trade</h4>
                            <p className="text-sm text-gray-400">Secure transactions and reliable delivery support.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
