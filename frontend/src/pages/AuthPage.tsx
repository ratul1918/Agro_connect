import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { login as apiLogin, signup as apiSignup } from '../api/endpoints';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Leaf, Mail, Lock, User, Phone, MapPin } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ScrollableSelect from '../components/ui/scrollable-select';

// Types for Bangladesh location data (matching bdapis.com response)
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

    // Location data state
    const [divisions, setDivisions] = useState<Division[]>([]);
    const [filteredDistricts, setFilteredDistricts] = useState<District[]>([]);
    const [filteredUpazilas, setFilteredUpazilas] = useState<Upazila[]>([]);
    const [locationLoading, setLocationLoading] = useState(true);

    // Signup state
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

    // Fetch divisions on component mount
    useEffect(() => {
        const fetchDivisions = async () => {
            try {
                setLocationLoading(true);
                const response = await fetch('https://bdapis.com/api/v1.2/divisions');
                const data = await response.json();
                setDivisions(data.data || []);
            } catch (error) {
                console.error('Error fetching divisions:', error);
                // Fallback to static data if API fails
                setDivisions([
                    { division: 'Dhaka', divisionbn: 'ঢাকা' },
                    { division: 'Chattogram', divisionbn: 'চট্টগ্রাম' },
                    { division: 'Rajshahi', divisionbn: 'রাজশাহী' },
                    { division: 'Khulna', divisionbn: 'খুলনা' },
                    { division: 'Barishal', divisionbn: 'বরিশাল' },
                    { division: 'Sylhet', divisionbn: 'সিলেট' },
                    { division: 'Rangpur', divisionbn: 'রংপুর' },
                    { division: 'Mymensingh', divisionbn: 'ময়মনসিংহ' }
                ]);
            } finally {
                setLocationLoading(false);
            }
        };

        fetchDivisions();
    }, []);

    // Fetch districts when division changes
    useEffect(() => {
        const fetchDistricts = async () => {
            if (signupData.division) {
                try {
                    const response = await fetch(`https://bdapis.com/api/v1.2/division/${signupData.division}`);
                    const data = await response.json();
                    setFilteredDistricts(data.data || []);
                } catch (error) {
                    console.error('Error fetching districts:', error);
                    setFilteredDistricts([]);
                }
            } else {
                setFilteredDistricts([]);
            }
            // Reset district and upazila when division changes
            setSignupData(prev => ({ ...prev, district: '', upazila: '', thana: '' }));
            setFilteredUpazilas([]);
        };

        fetchDistricts();
    }, [signupData.division]);

    // Filter upazilas when district changes
    useEffect(() => {
        if (signupData.district) {
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
        // Reset upazila and thana when district changes
        setSignupData(prev => ({ ...prev, upazila: '', thana: '' }));
    }, [signupData.district, filteredDistricts]);

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, isLoading, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginLoading(true);
        setLoginError('');

        try {
            const res = await apiLogin({ email: loginEmail, password: loginPassword });
            const { token, ...userData } = res.data;
            login(token, userData);
        } catch (err: any) {
            // Handle the standardized error response
            const errorMessage = err.message || err.response?.data?.message || 'Invalid email or password';
            setLoginError(errorMessage);
        } finally {
            setLoginLoading(false);
        }
    };

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
             <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-green-100 dark:from-gray-900 dark:to-gray-800">
            <Navbar />
            <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center space-x-2">
                            <Leaf className="h-12 w-12 text-green-600 dark:text-green-400" />
                            <span className="text-3xl font-bold text-green-600 dark:text-green-400">AgroConnect</span>
                        </div>
                        <p className="mt-2 text-gray-600 dark:text-gray-300">Your Agricultural Marketplace</p>
                    </div>

                    <Card className="shadow-xl bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setActiveTab('login')}
                                className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'login'
                                    ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => setActiveTab('signup')}
                                className={`flex-1 py-4 text-center font-medium transition-colors ${activeTab === 'signup'
                                    ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                Sign Up
                            </button>
                        </div>

                        <CardContent className="pt-6">
                            {activeTab === 'login' ? (
                                /* Login Form */
                                <form onSubmit={handleLogin} className="space-y-4">
                                    {loginError && (
                                        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                            {loginError}
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="login-email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="login-email"
                                                type="email"
                                                placeholder="Enter your email"
                                                value={loginEmail}
                                                onChange={(e) => setLoginEmail(e.target.value)}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="login-password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="login-password"
                                                type="password"
                                                placeholder="Enter your password"
                                                value={loginPassword}
                                                onChange={(e) => setLoginPassword(e.target.value)}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <label className="flex items-center">
                                            <input type="checkbox" className="mr-2" />
                                            Remember me
                                        </label>
                                        <a href="/forgot-password" className="text-green-600 hover:underline">
                                            Forgot password?
                                        </a>
                                    </div>

                                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loginLoading}>
                                        {loginLoading ? 'Logging in...' : 'Login'}
                                    </Button>

                                    
                                </form>
                            ) : (
                                /* Signup Form */
                                <form onSubmit={handleSignup} className="space-y-4">
                                    {signupError && (
                                        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                                            {signupError}
                                        </div>
                                    )}

                                    {signupSuccess && (
                                        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
                                            Registration successful! Redirecting to login...
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-name">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="signup-name"
                                                type="text"
                                                placeholder="Enter your full name"
                                                value={signupData.fullName}
                                                onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="signup-email"
                                                type="email"
                                                placeholder="Enter your email"
                                                value={signupData.email}
                                                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-password">Password</Label>
                                            <Input
                                                id="signup-password"
                                                type="password"
                                                placeholder="Password"
                                                value={signupData.password}
                                                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-confirm">Confirm</Label>
                                            <Input
                                                id="signup-confirm"
                                                type="password"
                                                placeholder="Confirm"
                                                value={signupData.confirmPassword}
                                                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="signup-phone">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="signup-phone"
                                                type="tel"
                                                placeholder="01XXX-XXXXXX"
                                                value={signupData.phone}
                                                onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                                                className="pl-10"
                                            />
                                        </div>
                                    </div>

                                    {/* Country Dropdown */}
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-country">Country</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                                            <select
                                                id="signup-country"
                                                value={signupData.country}
                                                onChange={(e) => setSignupData({
                                                    ...signupData,
                                                    country: e.target.value,
                                                    // Reset Bangladesh fields if country changes
                                                    division: '',
                                                    district: '',
                                                    upazila: '',
                                                    thana: ''
                                                })}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900 font-medium"
                                            >
                                                <option value="Bangladesh">🇧🇩 Bangladesh</option>
                                                <option value="India">🇮🇳 India</option>
                                                <option value="Pakistan">🇵🇰 Pakistan</option>
                                                <option value="Nepal">🇳🇵 Nepal</option>
                                                <option value="Sri Lanka">🇱🇰 Sri Lanka</option>
                                                <option value="Myanmar">🇲🇲 Myanmar</option>
                                                <option value="Thailand">🇹🇭 Thailand</option>
                                                <option value="Malaysia">🇲🇾 Malaysia</option>
                                                <option value="Singapore">🇸🇬 Singapore</option>
                                                <option value="UAE">🇦🇪 United Arab Emirates</option>
                                                <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
                                                <option value="Qatar">🇶🇦 Qatar</option>
                                                <option value="Kuwait">🇰🇼 Kuwait</option>
                                                <option value="Oman">🇴🇲 Oman</option>
                                                <option value="Bahrain">🇧🇭 Bahrain</option>
                                                <option value="UK">🇬🇧 United Kingdom</option>
                                                <option value="USA">🇺🇸 United States</option>
                                                <option value="Canada">🇨🇦 Canada</option>
                                                <option value="Australia">🇦🇺 Australia</option>
                                                <option value="Germany">🇩🇪 Germany</option>
                                                <option value="Italy">🇮🇹 Italy</option>
                                                <option value="France">🇫🇷 France</option>
                                                <option value="Japan">🇯🇵 Japan</option>
                                                <option value="South Korea">🇰🇷 South Korea</option>
                                                <option value="China">🇨🇳 China</option>
                                                <option value="Other">🌍 Other</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Bangladesh-specific location fields - only show if Bangladesh is selected */}
                                    {signupData.country === 'Bangladesh' && (
                                        <>
                                            {/* Division Dropdown */}
                                            <div className="space-y-2">
                                                <Label htmlFor="signup-division">Division</Label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
                                                    <select
                                                        id="signup-division"
                                                        value={signupData.division}
                                                        onChange={(e) => setSignupData({ ...signupData, division: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                                        disabled={locationLoading}
                                                    >
                                                        <option value="">Select Division</option>
                                                        {divisions.map((division) => (
                                                            <option key={division.division} value={division.division}>
                                                                {division.division} ({division.divisionbn})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            {/* District Dropdown */}
                                            <div className="space-y-2">
                                                <Label htmlFor="signup-district">District</Label>
                                                <ScrollableSelect
                                                    id="signup-district"
                                                    value={signupData.district}
                                                    onChange={(value) => setSignupData({ ...signupData, district: value })}
                                                    options={filteredDistricts.map((d) => ({
                                                        value: d.district,
                                                        label: `${d.district} (${d.districtbn})`
                                                    }))}
                                                    placeholder="Select District"
                                                    disabled={!signupData.division || filteredDistricts.length === 0}
                                                    icon={<MapPin className="h-5 w-5" />}
                                                    maxHeight={200}
                                                />
                                            </div>

                                            {/* Upazila & Thana Row */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="signup-upazila">Upazila</Label>
                                                    <ScrollableSelect
                                                        id="signup-upazila"
                                                        value={signupData.upazila}
                                                        onChange={(value) => setSignupData({ ...signupData, upazila: value, thana: value })}
                                                        options={filteredUpazilas.map((u) => ({
                                                            value: u.name,
                                                            label: u.name
                                                        }))}
                                                        placeholder="Select Upazila"
                                                        disabled={!signupData.district || filteredUpazilas.length === 0}
                                                        maxHeight={180}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="signup-thana">Thana</Label>
                                                    <ScrollableSelect
                                                        id="signup-thana"
                                                        value={signupData.thana}
                                                        onChange={(value) => setSignupData({ ...signupData, thana: value })}
                                                        options={filteredUpazilas.map((u) => ({
                                                            value: u.name,
                                                            label: u.name
                                                        }))}
                                                        placeholder="Select Thana"
                                                        disabled={!signupData.district || filteredUpazilas.length === 0}
                                                        maxHeight={180}
                                                    />
                                                </div>
                                            </div>

                                            {/* Post Code */}
                                            <div className="space-y-2">
                                                <Label htmlFor="signup-postcode">Post Code</Label>
                                                <Input
                                                    id="signup-postcode"
                                                    type="text"
                                                    placeholder="Enter post code (e.g., 1205)"
                                                    value={signupData.postCode}
                                                    onChange={(e) => {
                                                        // Only allow numbers
                                                        const value = e.target.value.replace(/\D/g, '');
                                                        setSignupData({ ...signupData, postCode: value });
                                                    }}
                                                    maxLength={4}
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="space-y-2">
                                        <Label>I want to register as</Label>
                                        <div className="grid grid-cols-3 gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setSignupData({ ...signupData, role: 'FARMER' })}
                                                className={`p-4 border-2 rounded-lg text-center transition-all ${signupData.role === 'FARMER'
                                                    ? 'border-green-600 bg-green-50 text-green-700'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <span className="text-2xl">👨‍🌾</span>
                                                <p className="font-medium mt-1 text-sm">Farmer</p>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSignupData({ ...signupData, role: 'BUYER' })}
                                                className={`p-4 border-2 rounded-lg text-center transition-all ${signupData.role === 'BUYER'
                                                    ? 'border-green-600 bg-green-50 text-green-700'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <span className="text-2xl">🛒</span>
                                                <p className="font-medium mt-1 text-sm">Buyer</p>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSignupData({ ...signupData, role: 'CUSTOMER' })}
                                                className={`p-4 border-2 rounded-lg text-center transition-all ${signupData.role === 'CUSTOMER'
                                                    ? 'border-orange-600 bg-orange-50 text-orange-700'
                                                    : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <span className="text-2xl">🛍️</span>
                                                <p className="font-medium mt-1 text-sm">Customer</p>
                                            </button>
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={signupLoading}>
                                        {signupLoading ? 'Creating Account...' : 'Create Account'}
                                    </Button>

                                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                        By signing up, you agree to our{' '}
                                        <a href="/terms" className="text-green-600 dark:text-green-400 hover:underline">Terms of Service</a>
                                        {' '}and{' '}
                                        <a href="/privacy" className="text-green-600 dark:text-green-400 hover:underline">Privacy Policy</a>
                                    </p>
                                </form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AuthPage;
