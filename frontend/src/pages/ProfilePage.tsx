import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { User, Mail, Edit, Save, X, Camera, Shield, Activity, Map as MapIcon } from 'lucide-react';
import api from '../api/axios';

const ProfilePage: React.FC = () => {
    const { user, isAuthenticated } = useAuth();
    const { t, language } = useLanguage();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState<'personal' | 'location'>('personal');

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        division: '',
        district: '',
        upazila: '',
        thana: '',
        postCode: ''
    });

    const [divisions, setDivisions] = useState<any[]>([]);
    const [districts, setDistricts] = useState<any[]>([]);
    const [upazilas, setUpazilas] = useState<any[]>([]);

    useEffect(() => {
        if (!isAuthenticated) navigate('/auth');
        else fetchDivisions();
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        if (user) {
            const divisionObj = divisions.length > 0 ? divisions.find(d => d.name === user.division) : null;
            setFormData({
                fullName: user.fullName || '',
                email: user.email || '',
                phone: user.phone || '',
                division: user.division || '',
                district: user.district || '',
                upazila: user.upazila || '',
                thana: user.thana || '',
                postCode: user.postCode || ''
            });
            if (divisionObj && user.division) fetchDistricts(user.division);
        }
    }, [user, divisions]);

    const fetchDivisions = async () => {
        try {
            const response = await fetch('https://bdapis.com/api/v1.2/divisions');
            const data = await response.json();
            setDivisions(data.data.map((d: any) => ({
                id: d.division, name: d.division, bn_name: d.divisionbn
            })) || []);
        } catch (error) {
            setDivisions([
                { id: 'Dhaka', name: 'Dhaka', bn_name: 'ঢাকা' },
                { id: 'Chittagong', name: 'Chattogram', bn_name: 'চট্টগ্রাম' },
                { id: 'Rajshahi', name: 'Rajshahi', bn_name: 'রাজশাহী' },
                { id: 'Khulna', name: 'Khulna', bn_name: 'খুলনা' },
                { id: 'Barisal', name: 'Barishal', bn_name: 'বরিশাল' },
                { id: 'Sylhet', name: 'Sylhet', bn_name: 'সিলেট' },
                { id: 'Rangpur', name: 'Rangpur', bn_name: 'রংপুর' },
                { id: 'Mymensingh', name: 'Mymensingh', bn_name: 'ময়মনসিংহ' }
            ]);
        }
    };

    const fetchDistricts = async (divisionName: string) => {
        try {
            const response = await fetch(`https://bdapis.com/api/v1.2/division/${divisionName}`);
            const data = await response.json();
            const mappedDistricts = data.data.map((d: any) => ({
                id: d.district, name: d.district, bn_name: d.districtbn || d.district,
                upazilas: (d.upazilla || []).map((u: string) => ({ id: u, name: u, bn_name: u }))
            }));
            setDistricts(mappedDistricts || []);
            if (formData.district) {
                const districtObj = mappedDistricts.find((d: any) => d.name === formData.district);
                if (districtObj) setUpazilas(districtObj.upazilas || []);
            }
        } catch (error) {
            setDistricts([]); setUpazilas([]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'division') {
            const selectedDiv = divisions.find(d => d.name === value);
            if (selectedDiv) {
                setFormData(prev => ({ ...prev, division: value, district: '', upazila: '', thana: '' }));
                fetchDistricts(value);
            }
        } else if (name === 'district') {
            setFormData(prev => ({ ...prev, district: value, upazila: '', thana: '' }));
            const districtObj = districts.find(d => d.name === value);
            if (districtObj) setUpazilas(districtObj.upazilas || []);
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        setMessage('');
        try {
            await api.put('/auth/profile', formData);
            setMessage(t('profile.success'));
            setIsEditing(false);
            setTimeout(() => window.location.reload(), 1500);
        } catch (error: any) {
            setMessage(error.response?.data?.message || t('profile.error'));
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>;

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ROLE_ADMIN': return 'destructive';
            case 'ROLE_FARMER': return 'default';
            case 'ROLE_BUYER': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
            {/* Header / Cover Section */}
            <div className="relative h-60 bg-gradient-to-r from-green-600 to-emerald-800 dark:from-green-900 dark:to-emerald-950">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 md:left-24 md:translate-x-0 flex flex-col items-center md:items-start group">
                    <div className="relative">
                        <div className="h-32 w-32 rounded-full border-4 border-white dark:border-gray-900 bg-gray-200 overflow-hidden shadow-xl">
                            {user.profileImageUrl ? (
                                <img src={user.profileImageUrl} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400">
                                    <User className="h-16 w-16" />
                                </div>
                            )}
                        </div>
                        <button className="absolute bottom-2 right-2 p-2 bg-green-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-700">
                            <Camera className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-24">
                <div className="md:flex justify-between items-start mb-8">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{user.fullName || t('profile.full_name')}</h1>
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-2 text-gray-500 dark:text-gray-400">
                            <Badge variant={getRoleBadgeColor(user.role || '')} className="uppercase">
                                {user.role ? t(`role.${user.role.replace('ROLE_', '').toLowerCase().replace(/_/g, '.')}`) : 'User'}
                            </Badge>
                            <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {user.email}</span>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0 flex justify-center gap-3">
                        {!isEditing ? (
                            <Button onClick={() => setIsEditing(true)} className="bg-green-600 hover:bg-green-700">
                                <Edit className="h-4 w-4 mr-2" /> {t('profile.edit')}
                            </Button>
                        ) : (
                            <div className="flex gap-2">
                                <Button onClick={handleSaveProfile} disabled={loading} className="bg-green-600 hover:bg-green-700">
                                    <Save className="h-4 w-4 mr-2" /> {loading ? t('profile.saving') : t('profile.save')}
                                </Button>
                                <Button variant="outline" onClick={() => setIsEditing(false)}>
                                    <X className="h-4 w-4 mr-2" /> {t('profile.cancel')}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-lg bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800`}>
                        {message}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Sidebar / Tabs */}
                    <div className="md:col-span-1 space-y-4">
                        <Card className="overflow-hidden">
                            <div className="flex flex-col">
                                <button
                                    onClick={() => setActiveTab('personal')}
                                    className={`flex items-center gap-3 px-6 py-4 text-left transition-colors border-l-4 ${activeTab === 'personal' ? 'bg-green-50 dark:bg-green-900/20 border-green-600 text-green-700 dark:text-green-400' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-900'}`}
                                >
                                    <User className="h-5 w-5" />
                                    <span className="font-medium">{t('profile.personal_info')}</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('location')}
                                    className={`flex items-center gap-3 px-6 py-4 text-left transition-colors border-l-4 ${activeTab === 'location' ? 'bg-green-50 dark:bg-green-900/20 border-green-600 text-green-700 dark:text-green-400' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-900'}`}
                                >
                                    <MapIcon className="h-5 w-5" />
                                    <span className="font-medium">{t('profile.location')}</span>
                                </button>
                                <div className="px-6 py-4 text-gray-400 flex items-center gap-3 cursor-not-allowed">
                                    <Shield className="h-5 w-5" />
                                    <span>Security (Coming Soon)</span>
                                </div>
                                <div className="px-6 py-4 text-gray-400 flex items-center gap-3 cursor-not-allowed">
                                    <Activity className="h-5 w-5" />
                                    <span>Activity (Coming Soon)</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Content Area */}
                    <div className="md:col-span-3">
                        <Card>
                            <CardHeader>
                                <CardTitle>{activeTab === 'personal' ? t('profile.personal_info') : t('profile.location')}</CardTitle>
                                <CardDescription>Manage your {activeTab} details</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {activeTab === 'personal' && (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{t('profile.full_name')}</label>
                                            <Input name="fullName" value={formData.fullName} onChange={handleInputChange} disabled={!isEditing} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{t('profile.email')}</label>
                                            <Input name="email" value={formData.email} onChange={handleInputChange} disabled={true} className="bg-gray-100 dark:bg-gray-800" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{t('profile.phone')}</label>
                                            <Input name="phone" value={formData.phone} onChange={handleInputChange} disabled={!isEditing} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{t('profile.post_code')}</label>
                                            <Input name="postCode" value={formData.postCode} onChange={handleInputChange} disabled={!isEditing} maxLength={4} />
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'location' && (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{t('profile.division')}</label>
                                            {isEditing ? (
                                                <select name="division" value={formData.division} onChange={handleInputChange} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                                    <option value="">{t('profile.select_division')}</option>
                                                    {divisions.map(d => <option key={d.id} value={d.name}>{language === 'bn' ? d.bn_name : d.name}</option>)}
                                                </select>
                                            ) : (
                                                <div className="p-2 border rounded-md bg-gray-50 dark:bg-gray-900">{formData.division || 'N/A'}</div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{t('profile.district')}</label>
                                            {isEditing ? (
                                                <select name="district" value={formData.district} onChange={handleInputChange} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                                    <option value="">{t('profile.select_district')}</option>
                                                    {districts.map(d => <option key={d.id} value={d.name}>{language === 'bn' ? d.bn_name : d.name}</option>)}
                                                </select>
                                            ) : (
                                                <div className="p-2 border rounded-md bg-gray-50 dark:bg-gray-900">{formData.district || 'N/A'}</div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{t('profile.upazila')}</label>
                                            {isEditing ? (
                                                <select name="upazila" value={formData.upazila} onChange={handleInputChange} className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                                    <option value="">{t('profile.select_upazila')}</option>
                                                    {upazilas.map(u => <option key={u.id} value={u.name}>{language === 'bn' ? u.bn_name : u.name}</option>)}
                                                </select>
                                            ) : (
                                                <div className="p-2 border rounded-md bg-gray-50 dark:bg-gray-900">{formData.upazila || 'N/A'}</div>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">{t('profile.thana')}</label>
                                            <Input name="thana" value={formData.thana} onChange={handleInputChange} disabled={!isEditing} />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
