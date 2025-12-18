import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useNotification } from '../context/NotificationContext';
import api from '../api/axios';
import { User, KeyRound, Shield, Bell, Palette } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { ThemeSelectorSidebar } from '../components/ThemeSelectorSidebar';

const SettingsPage: React.FC = () => {
    const { user } = useAuth();
    const { success, error } = useNotification();
    const [activeSection, setActiveSection] = useState<'profile' | 'password' | 'notifications' | 'appearance'>('profile');
    const [loading, setLoading] = useState(false);

    // Profile form
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [phone, setPhone] = useState(user?.mobileNumber || '');

    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/users/profile', { fullName, mobileNumber: phone });
            success('প্রোফাইল আপডেট হয়েছে');
        } catch (err) {
            error('প্রোফাইল আপডেট ব্যর্থ হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            error('নতুন পাসওয়ার্ড মিলছে না');
            return;
        }
        setLoading(true);
        try {
            await api.put('/users/change-password', { currentPassword, newPassword });
            success('পাসওয়ার্ড পরিবর্তন হয়েছে');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            error('পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const sections = [
        { id: 'profile', label: 'প্রোফাইল (Profile)', icon: User },
        { id: 'password', label: 'পাসওয়ার্ড (Password)', icon: KeyRound },
        { id: 'appearance', label: 'থিম (Appearance)', icon: Palette },
        { id: 'notifications', label: 'নোটিফিকেশন (Notifications)', icon: Bell },
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />
            <div className="flex-1 pt-20">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-8">সেটিংস (Settings)</h1>

                    <div className="grid md:grid-cols-4 gap-6">
                        {/* Sidebar */}
                        <div className="md:col-span-1">
                            <Card>
                                <CardContent className="p-2">
                                    <nav className="space-y-1">
                                        {sections.map((section) => {
                                            const Icon = section.icon;
                                            return (
                                                <button
                                                    key={section.id}
                                                    onClick={() => setActiveSection(section.id as any)}
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${activeSection === section.id
                                                            ? 'bg-primary text-primary-foreground'
                                                            : 'hover:bg-muted text-muted-foreground'
                                                        }`}
                                                >
                                                    <Icon className="h-5 w-5" />
                                                    <span className="text-sm">{section.label}</span>
                                                </button>
                                            );
                                        })}
                                    </nav>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Content */}
                        <div className="md:col-span-3">
                            {activeSection === 'profile' && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>প্রোফাইল তথ্য</CardTitle>
                                        <CardDescription>আপনার ব্যক্তিগত তথ্য আপডেট করুন</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>ইমেইল</Label>
                                                <Input value={user?.email || ''} disabled className="bg-muted" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>পূর্ণ নাম</Label>
                                                <Input value={fullName} onChange={e => setFullName(e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>মোবাইল নম্বর</Label>
                                                <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+880..." />
                                            </div>
                                            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                                                {loading ? 'আপডেট হচ্ছে...' : 'প্রোফাইল আপডেট করুন'}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            )}

                            {activeSection === 'password' && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>পাসওয়ার্ড পরিবর্তন</CardTitle>
                                        <CardDescription>আপনার অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তন করুন</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleChangePassword} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>বর্তমান পাসওয়ার্ড</Label>
                                                <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>নতুন পাসওয়ার্ড</Label>
                                                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>নতুন পাসওয়ার্ড নিশ্চিত করুন</Label>
                                                <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                                            </div>
                                            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                                                {loading ? 'পরিবর্তন হচ্ছে...' : 'পাসওয়ার্ড পরিবর্তন করুন'}
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            )}

                            {activeSection === 'appearance' && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>থিম সেটিংস</CardTitle>
                                        <CardDescription>আপনার পছন্দের থিম নির্বাচন করুন</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <ThemeSelectorSidebar isSidebarOpen={true} />
                                    </CardContent>
                                </Card>
                            )}

                            {activeSection === 'notifications' && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>নোটিফিকেশন সেটিংস</CardTitle>
                                        <CardDescription>কোন নোটিফিকেশনগুলো পেতে চান তা নির্বাচন করুন</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">শীঘ্রই আসছে...</p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default SettingsPage;
