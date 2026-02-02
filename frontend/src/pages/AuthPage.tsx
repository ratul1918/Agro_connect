import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { login as apiLogin, signup as apiSignup } from '../api/endpoints';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Leaf, Mail, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ScrollableSelect from '../components/ui/scrollable-select';
import { locationData } from '../data/locationData';
import { motion, AnimatePresence } from 'framer-motion';

// Types for Bangladesh location data
interface Division {
    division: string;
    divisionbn: string;
    coordinates?: string;
}

interface District {
    district: string;
    districtbn: string;
    coordinates?: string;
    upazilla: string[];
}

interface Upazila {
    name: string;
}

const AuthPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login, isAuthenticated, isLoading } = useAuth();
    const { success } = useNotification();

    const [activeTab, setActiveTab] = useState<'login' | 'signup'>(
        searchParams.get('tab') === 'signup' ? 'signup' : 'login'
    );

    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    // Location & Signup state
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState<Upazila[]>([]);


    const [signupData, setSignupData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        country: 'Bangladesh',
        division: '',
        district: '',
        upazila: '',
        thana: '',
        postCode: '',
        role: searchParams.get('role')?.toUpperCase() || 'BUYER'
    });
    const [signupError, setSignupError] = useState('');
    const [signupLoading, setSignupLoading] = useState(false);
    const [signupSuccess, setSignupSuccess] = useState(false);

    // Initialize Location Data
    useEffect(() => {
        const staticDivisions = Object.values(locationData).map(d => ({
            division: d.division,
            divisionbn: d.divisionbn
        }));
        setDivisions(staticDivisions);
    }, []);

    // Filter Districts
    useEffect(() => {
        if (signupData.division) {
            const divisionData = locationData[signupData.division];
            if (divisionData) {
                setFilteredDistricts(divisionData.districts.map(d => ({
                    district: d.district,
                    districtbn: d.districtbn,
                    upazilla: d.upazillas
                })));
            } else {
                setFilteredDistricts([]);
            }
            setSignupData(prev => ({ ...prev, district: '', upazila: '', thana: '' }));
            setFilteredUpazilas([]);
        } else {
            setFilteredDistricts([]);
            setSignupData(prev => ({ ...prev, district: '', upazila: '', thana: '' }));
            setFilteredUpazilas([]);
        }
    }, [signupData.division]);

    // Filter Upazilas
    useEffect(() => {
        if (signupData.district && filteredDistricts && filteredDistricts.length > 0) {
            const selectedDistrict = filteredDistricts.find(d => d.district === signupData.district);
            if (selectedDistrict && selectedDistrict.upazilla) {
                const upazilaList: Upazila[] = selectedDistrict.upazilla.map(name => ({ name }));
                setFilteredUpazilas(upazilaList);
            } else {
                setFilteredUpazilas([]);
            }
        } else {
            setFilteredUpazilas([]);
        }
        setSignupData(prev => ({ ...prev, upazila: '', thana: '' }));
    }, [signupData.district, filteredDistricts]);

    // Redirect if authenticated
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, isLoading, navigate]);

    // Handle Login
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError('');

        try {
            const res = await apiLogin({ email: loginEmail, password: loginPassword });
            const { token, ...userData } = res.data;
            login(token, userData);
        } catch (err: any) {
            const errorMessage = err.message || err.response?.data?.message || 'Invalid email or password';
            setLoginError(errorMessage);
        } finally {
            setLoginLoading(false);
        }
    };

    // Handle Signup
    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setSignupLoading(true);
        setSignupError('');

        if (signupData.password !== signupData.confirmPassword) {
            setSignupError('Passwords do not match');
            setSignupLoading(false);
            return;
        }

        if (signupData.password.length < 6) {
            setSignupError('Password must be at least 6 characters');
            setSignupLoading(false);
            return;
        }

        try {
            await apiSignup({
                fullName: signupData.fullName,
                email: signupData.email,
                password: signupData.password,
                phone: signupData.phone,
                country: signupData.country,
                division: signupData.country === 'Bangladesh' ? signupData.division : '',
                district: signupData.country === 'Bangladesh' ? signupData.district : '',
                upazila: signupData.country === 'Bangladesh' ? signupData.upazila : '',
                thana: signupData.country === 'Bangladesh' ? signupData.thana : '',
                postCode: signupData.country === 'Bangladesh' ? signupData.postCode : '',
                role: signupData.role
            });
            setSignupSuccess(true);
            success('Registration successful! Please login.');
            setTimeout(() => {
                setActiveTab('login');
                setSignupSuccess(false);
            }, 2000);
        } catch (err: any) {
            setSignupError(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setSignupLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="h-10 w-10 animate-spin text-green-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col font-sans selection:bg-green-100 selection:text-green-900">
            <Navbar />

            {/* Main Content - Added pt-24 to fix navbar overlap */}
            <div className="flex-1 flex pt-24 pb-12 lg:pb-0">
                {/* Desktop Split Layout */}
                <div className="w-full max-w-[1920px] mx-auto flex flex-col lg:flex-row min-h-[calc(100vh-80px)] lg:min-h-screen">

                    {/* Left Side - Image/Branding (Desktop Only) */}
                    <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-black">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1625246333195-098e4785461b?q=80&w=1920&auto=format&fit=crop')] bg-cover bg-center opacity-60"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-green-900/40 to-black/20"></div>

                        <div className="relative z-10 w-full h-full flex flex-col justify-between p-20 text-white">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
                                    <Leaf className="w-8 h-8 text-green-400" />
                                </div>
                                <span className="text-2xl font-bold tracking-tight">AgroConnect</span>
                            </div>

                            <div className="max-w-xl space-y-6">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <h1 className="text-5xl font-bold leading-tight">
                                        Empowering Agriculture <br />
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                                            Through Technology
                                        </span>
                                    </h1>
                                </motion.div>
                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-lg text-gray-200 leading-relaxed"
                                >
                                    Join thousands of farmers, buyers, and agronomists in the most advanced agricultural ecosystem. Trade securely, get expert advice, and grow your business.
                                </motion.p>
                            </div>

                            <div className="flex gap-4 text-sm font-medium text-gray-300">
                                <span>© 2026 AgroConnect</span>
                                <span>•</span>
                                <span>Privacy Policy</span>
                                <span>•</span>
                                <span>Terms of Service</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Forms */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 lg:p-12 relative bg-white dark:bg-gray-900">
                        {/* Background Blobs for Mobile/Tablet */}
                        <div className="lg:hidden absolute top-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                        <div className="lg:hidden absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                        <div className="w-full max-w-md space-y-8 relative z-10 lg:pt-0">
                            {/* Header */}
                            <div className="text-center space-y-2">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                    {activeTab === 'login' ? 'Welcome Back!' : 'Create Account'}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400">
                                    {activeTab === 'login'
                                        ? 'Please enter your details to sign in.'
                                        : 'Join our community and start your journey.'}
                                </p>
                            </div>

                            {/* Custom Tab Switcher */}
                            <div className="p-1 bg-gray-100 dark:bg-gray-800 rounded-xl flex">
                                <button
                                    onClick={() => setActiveTab('login')}
                                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${activeTab === 'login'
                                        ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    Login
                                </button>
                                <button
                                    onClick={() => setActiveTab('signup')}
                                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${activeTab === 'signup'
                                        ? 'bg-white dark:bg-gray-700 text-green-600 shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                        }`}
                                >
                                    Sign Up
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, x: activeTab === 'login' ? -20 : 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: activeTab === 'login' ? 20 : -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {activeTab === 'login' ? (
                                        <form onSubmit={handleLogin} className="space-y-6">
                                            {loginError && (
                                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 flex-shrink-0"></span>
                                                    {loginError}
                                                </div>
                                            )}

                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="login-email">Email Address</Label>
                                                    <div className="relative group">
                                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                                        <Input
                                                            id="login-email"
                                                            type="email"
                                                            placeholder="name@example.com"
                                                            value={loginEmail}
                                                            onChange={(e) => setLoginEmail(e.target.value)}
                                                            className="pl-10 h-12 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-green-500/20 focus:border-green-500 rounded-xl"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <Label htmlFor="login-password">Password</Label>
                                                        <a href="/forgot-password" className="text-xs font-medium text-green-600 hover:text-green-700 dark:text-green-400">
                                                            Forgot password?
                                                        </a>
                                                    </div>
                                                    <div className="relative group">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                                                        <Input
                                                            id="login-password"
                                                            type="password"
                                                            placeholder="Enter your password"
                                                            value={loginPassword}
                                                            onChange={(e) => setLoginPassword(e.target.value)}
                                                            className="pl-10 h-12 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 focus:ring-green-500/20 focus:border-green-500 rounded-xl"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 hover:shadow-green-600/30 transition-all text-base"
                                                disabled={loginLoading}
                                            >
                                                {loginLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                                            </Button>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleSignup} className="space-y-6">
                                            {signupError && (
                                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
                                                    {signupError}
                                                </div>
                                            )}
                                            {signupSuccess && (
                                                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Registration successful! Redirecting...
                                                </div>
                                            )}

                                            <div className="space-y-4 max-h-[50vh] md:max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
                                                {/* Role Selection */}
                                                <div className="grid grid-cols-3 gap-3">
                                                    {[
                                                        { id: 'FARMER', icon: '👨‍🌾', label: 'Farmer', color: 'bg-green-50 border-green-200 text-green-700' },
                                                        { id: 'BUYER', icon: '🛒', label: 'Buyer', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                                                        { id: 'CUSTOMER', icon: '🛍️', label: 'Customer', color: 'bg-orange-50 border-orange-200 text-orange-700' }
                                                    ].map((role) => (
                                                        <button
                                                            key={role.id}
                                                            type="button"
                                                            onClick={() => setSignupData({ ...signupData, role: role.id })}
                                                            className={`p-3 border-2 rounded-xl text-center transition-all duration-200 ${signupData.role === role.id
                                                                ? `${role.color} dark:bg-opacity-10 shadow-sm transform scale-105`
                                                                : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 opacity-60 hover:opacity-100'
                                                                }`}
                                                        >
                                                            <span className="text-2xl block mb-1">{role.icon}</span>
                                                            <span className="text-xs font-bold">{role.label}</span>
                                                        </button>
                                                    ))}
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Full Name</Label>
                                                    <Input
                                                        type="text"
                                                        placeholder="John Doe"
                                                        value={signupData.fullName}
                                                        onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                                                        className="bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Email</Label>
                                                    <Input
                                                        type="email"
                                                        placeholder="name@example.com"
                                                        value={signupData.email}
                                                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                                                        className="bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                                        required
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>Password</Label>
                                                        <Input
                                                            type="password"
                                                            placeholder="••••••"
                                                            value={signupData.password}
                                                            onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                                            className="bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Confirm</Label>
                                                        <Input
                                                            type="password"
                                                            placeholder="••••••"
                                                            value={signupData.confirmPassword}
                                                            onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                                                            className="bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Phone</Label>
                                                    <Input
                                                        type="tel"
                                                        placeholder="01XXX-XXXXXX"
                                                        value={signupData.phone}
                                                        onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                                                        className="bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Country</Label>
                                                    <select
                                                        value={signupData.country}
                                                        onChange={(e) => setSignupData({
                                                            ...signupData,
                                                            country: e.target.value,
                                                            division: '', district: '', upazila: '', thana: ''
                                                        })}
                                                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                                    >
                                                        <option value="Bangladesh">🇧🇩 Bangladesh</option>
                                                        <option value="India">🇮🇳 India</option>
                                                        <option value="Other">🌍 Other</option>
                                                    </select>
                                                </div>

                                                {signupData.country === 'Bangladesh' && (
                                                    <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800">
                                                        <div className="space-y-2">
                                                            <Label>Division</Label>
                                                            <select
                                                                value={signupData.division}
                                                                onChange={(e) => setSignupData({ ...signupData, division: e.target.value })}
                                                                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                                            >
                                                                <option value="">Select Division</option>
                                                                {divisions.map((d) => (
                                                                    <option key={d.division} value={d.division}>{d.division}</option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label>District</Label>
                                                            <ScrollableSelect
                                                                options={filteredDistricts.map(d => ({ value: d.district, label: d.district }))}
                                                                value={signupData.district}
                                                                onChange={(v) => setSignupData({ ...signupData, district: v })}
                                                                placeholder="Select District"
                                                                maxHeight={200}
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-2">
                                                                <Label>Upazila</Label>
                                                                <ScrollableSelect
                                                                    options={filteredUpazilas.map(u => ({ value: u.name, label: u.name }))}
                                                                    value={signupData.upazila}
                                                                    onChange={(v) => setSignupData({ ...signupData, upazila: v, thana: v })}
                                                                    placeholder="Select"
                                                                    maxHeight={200}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Code</Label>
                                                                <Input
                                                                    value={signupData.postCode}
                                                                    onChange={(e) => setSignupData({ ...signupData, postCode: e.target.value })}
                                                                    placeholder="1234"
                                                                    className="bg-gray-50 dark:bg-gray-800/50 rounded-lg"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <Button
                                                type="submit"
                                                className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-600/20 hover:shadow-green-600/30 transition-all text-base mt-2"
                                                disabled={signupLoading}
                                            >
                                                {signupLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                                            </Button>

                                            <div className="text-center text-xs text-gray-500">
                                                By signing up, you agree to our <span className="text-green-600 hover:underline cursor-pointer">Terms</span> & <span className="text-green-600 hover:underline cursor-pointer">Privacy Policy</span>.
                                            </div>
                                        </form>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default AuthPage;
