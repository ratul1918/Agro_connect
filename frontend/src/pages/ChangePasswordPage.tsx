import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api/axios';
import { KeyRound, Eye, EyeOff } from 'lucide-react';

const ChangePasswordPage: React.FC = () => {
    const { user } = useAuth();
    const { success, error } = useNotification();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            error('New passwords do not match');
            return;
        }

        if (formData.newPassword.length < 6) {
            error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await api.put('/auth/change-password', {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });
            success('Password changed successfully!');
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err: any) {
            error(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="space-y-6">
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <KeyRound className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Update your account password</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <div className="relative">
                                <Input
                                    id="currentPassword"
                                    type={showPassword.current ? "text" : "password"}
                                    value={formData.currentPassword}
                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                    placeholder="Enter current password"
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('current')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showPassword.new ? "text" : "password"}
                                    value={formData.newPassword}
                                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                    placeholder="Enter new password (min 6 characters)"
                                    required
                                    className="pr-10"
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('new')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showPassword.confirm ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder="Confirm new password"
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePasswordVisibility('confirm')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="flex-1"
                            >
                                {loading ? 'Updating...' : 'Update Password'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setFormData({
                                    currentPassword: '',
                                    newPassword: '',
                                    confirmPassword: ''
                                })}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="max-w-2xl mx-auto bg-muted/50">
                <CardHeader>
                    <CardTitle className="text-lg">Password Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                            Minimum 6 characters long
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                            Use a unique password not used elsewhere
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary"></span>
                            Consider using a mix of letters, numbers, and symbols
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChangePasswordPage;
