import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Leaf, ShoppingBag, TrendingUp, Users, Shield, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
    const { t } = useLanguage();

    // Mock Market Data for Ticker - In real app, fetch from API
    const marketTicker = [
        { crop: 'Rice (Miniket)', price: '৳65/kg', trend: '+2%' },
        { crop: 'Potato', price: '৳45/kg', trend: '-5%' },
        { crop: 'Onion', price: '৳90/kg', trend: '+10%' },
        { crop: 'Lentils', price: '৳120/kg', trend: '0%' },
        { crop: 'Wheat', price: '৳55/kg', trend: '+1%' },
        { crop: 'Garlic', price: '৳180/kg', trend: '-2%' },
        { crop: 'Green Chili', price: '৳200/kg', trend: '+15%' },
    ];

    // Ensure endless loop for ticker by duplicating data
    const tickerData = [...marketTicker, ...marketTicker, ...marketTicker];

    const features = [
        {
            icon: <ShoppingBag className="h-8 w-8 text-green-600 dark:text-green-400" />,
            title: t('home.feature_direct_title'),
            description: t('home.feature_direct_desc'),
            bg: "bg-green-50 dark:bg-green-900/20"
        },
        {
            icon: <TrendingUp className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
            title: t('home.feature_prices_title'),
            description: t('home.feature_prices_desc'),
            bg: "bg-blue-50 dark:bg-blue-900/20"
        },
        {
            icon: <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />,
            title: t('home.feature_expert_title'),
            description: t('home.feature_expert_desc'),
            bg: "bg-purple-50 dark:bg-purple-900/20"
        },
        {
            icon: <Shield className="h-8 w-8 text-orange-600 dark:text-orange-400" />,
            title: t('home.feature_secure_title'),
            description: t('home.feature_secure_desc'),
            bg: "bg-orange-50 dark:bg-orange-900/20"
        }
    ];

    const categories = [
        { name: t('category.rice'), image: "🌾", count: 150, color: "from-amber-200 to-yellow-100" },
        { name: t('category.vegetables'), image: "🥬", count: 230, color: "from-green-200 to-emerald-100" },
        { name: t('category.fruits'), image: "🍎", count: 180, color: "from-red-200 to-pink-100" },
        { name: t('category.spices'), image: "🌶️", count: 95, color: "from-orange-200 to-red-100" },
        { name: t('category.pulses'), image: "🫘", count: 120, color: "from-yellow-200 to-amber-100" },
        { name: t('category.fish'), image: "🐟", count: 85, color: "from-blue-200 to-cyan-100" }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

            {/* HER0 SECTION */}
            <section className="relative pt-24 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
                {/* Abstract Background Blobs - Theme Responsive */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                    <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-green-200/30 dark:bg-green-900/20 blur-[100px]" />
                    <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-200/30 dark:bg-blue-900/20 blur-[100px]" />
                    <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-yellow-200/30 dark:bg-yellow-900/20 blur-[100px]" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="flex flex-col lg:flex-row items-center gap-12 text-center lg:text-left">
                        {/* Text Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="flex-1 space-y-8"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 border border-accent text-accent-foreground backdrop-blur-sm shadow-sm">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-sm font-medium">{t('home.badge')}</span>
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-110%">
                                <span className="block text-foreground">{t('home.hero_title_1')}</span>
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400 dark:from-green-400 dark:to-emerald-300">
                                    {t('home.hero_title_2')}
                                </span>
                            </h1>

                            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                {t('home.hero_subtitle')}
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                                <Link to="/marketplace">
                                    <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg shadow-green-500/20 hover:shadow-green-500/30 transition-all bg-green-600 hover:bg-green-700 text-white border-none">
                                        {t('home.browse_marketplace')}
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link to="/auth?tab=signup&role=farmer">
                                    <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2 hover:bg-muted font-semibold">
                                        {t('home.join_farmer')}
                                    </Button>
                                </Link>
                            </div>

                            <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-muted-foreground">
                                <div className="flex -space-x-4">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-gray-200 dark:bg-gray-700 overflow-hidden" >
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i * 123}`} alt="User" />
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs font-bold">+5k</div>
                                </div>
                                <div className="text-sm font-medium">
                                    <div className="text-foreground font-bold">Trusted by 5000+</div>
                                    <div>Farmers & Buyers</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Hero Image / Graphic */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="flex-1 w-full relative group"
                        >
                            <div className="relative z-10 bg-white/40 dark:bg-black/40 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl skew-y-3 group-hover:skew-y-2 transition-transform duration-700">
                                <img
                                    src="https://images.unsplash.com/photo-1595856552697-393c8374d7ae?q=80&w=1200"
                                    alt="Argiculture"
                                    className="rounded-2xl shadow-inner w-full h-auto object-cover aspect-[4/3]"
                                />

                                {/* Floating Badge */}
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                    className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-xl border border-border flex items-center gap-3"
                                >
                                    <div className="bg-green-100 dark:bg-green-900/50 p-3 rounded-full text-green-600 dark:text-green-400">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Market Price</p>
                                        <p className="text-lg font-bold text-foreground">Rice +5%</p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-green-400 to-blue-500 rounded-3xl blur-3xl opacity-20 -z-10 transform rotate-6 scale-105"></div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* LIVE MARKET TICKER */}
            <div className="w-full bg-green-900 text-white py-3 overflow-hidden relative shadow-inner">
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-green-900 to-transparent z-10"></div>
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-green-900 to-transparent z-10"></div>

                <motion.div
                    className="flex gap-12 whitespace-nowrap"
                    animate={{ x: [0, -1000] }}
                    transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                >
                    {tickerData.map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <span className="font-semibold text-green-100">{item.crop}</span>
                            <span className="font-bold text-white">{item.price}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${item.trend.includes('+') ? 'bg-green-500/20 text-green-300' : item.trend.includes('-') ? 'bg-red-500/20 text-red-300' : 'bg-gray-500/20 text-gray-300'}`}>
                                {item.trend}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* CATEGORIES GRID */}
            <section className="py-24 bg-muted/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold mb-4">{t('home.categories_title')}</h2>
                        <p className="text-muted-foreground">{t('home.categories_subtitle')}</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {categories.map((cat, idx) => (
                            <Link to={`/marketplace?category=${cat.name}`} key={idx}>
                                <motion.div
                                    whileHover={{ y: -5, scale: 1.02 }}
                                    className="bg-card hover:bg-accent/50 border border-border/50 hover:border-primary/50 rounded-2xl p-6 text-center transition-all shadow-sm hover:shadow-lg cursor-pointer h-full flex flex-col items-center justify-center group"
                                >
                                    <div className={`text-5xl mb-4 p-4 rounded-full bg-gradient-to-br ${cat.color} group-hover:scale-110 transition-transform`}>
                                        {cat.image}
                                    </div>
                                    <h3 className="font-semibold text-lg">{cat.name}</h3>
                                    <span className="text-xs text-muted-foreground font-medium mt-1 bg-muted px-2 py-1 rounded-full">{cat.count} items</span>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURES */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold mb-4">{t('home.features_title')}</h2>
                        <p className="text-muted-foreground">{t('home.features_subtitle')}</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, idx) => (
                            <Card key={idx} className="border-none shadow-lg bg-card/50 backdrop-blur-sm overflow-hidden relative group">
                                <div className={`absolute top-0 right-0 w-32 h-32 ${feature.bg} rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500`}></div>
                                <CardContent className="pt-8 px-6 pb-8">
                                    <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6`}>
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{feature.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-green-900 dark:bg-green-950 -z-20"></div>
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 -z-10"></div>
                <div className="absolute -right-20 -top-20 w-96 h-96 bg-green-500/30 rounded-full blur-[100px]"></div>

                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <Leaf className="w-16 h-16 mx-auto mb-6 text-green-300" />
                    <h2 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight">{t('home.cta_title')}</h2>
                    <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">{t('home.cta_subtitle')}</p>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center">
                        <Link to="/auth?tab=signup&role=farmer">
                            <Button size="lg" className="h-14 px-8 bg-white text-green-900 hover:bg-green-50 hover:text-green-950 font-bold rounded-full text-lg shadow-xl">
                                {t('home.register_farmer')}
                            </Button>
                        </Link>
                        <Link to="/auth?tab=signup&role=buyer">
                            <Button size="lg" variant="outline" className="h-14 px-8 border-2 border-green-300 text-green-100 hover:bg-green-800 hover:text-white rounded-full text-lg font-semibold bg-transparent">
                                {t('home.register_buyer')}
                            </Button>
                        </Link>
                    </div>

                    <div className="mt-12 flex items-center justify-center gap-6 text-green-200/80 text-sm">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> <span>Free Registration</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> <span>Secure Payments</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> <span>24/7 Support</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
