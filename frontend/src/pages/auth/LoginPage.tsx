import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/context/ThemeContext';

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const { theme } = useTheme();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        // Simulate API Call
        try {
            console.log("Logging in with", data);

            // Mock Login Success logic
            // In real app, call axios.post('/auth/login', data)

            const mockUser = {
                id: 1,
                username: data.username,
                role: 'FARMER', // Default to Farmer for now to test Dashboard
                language: 'BN',
            };
            const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy";

            // Allow admin login simulation
            if (data.username === 'admin') mockUser.role = 'ADMIN';
            if (data.username === 'buyer') mockUser.role = 'BUYER';

            setTimeout(() => {
                // @ts-ignore
                login(mockToken, mockUser);
                navigate('/');
            }, 1000);

        } catch (error) {
            console.error("Login failed", error);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-background text-foreground transition-colors p-4">
            <Card className="w-full max-w-md border-border bg-card">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-2xl font-bold text-primary font-bangla">স্বাগতম / Welcome</CardTitle>
                    </div>
                    <CardDescription>Agro Connect এ লগইন করুন (Log in to Agro Connect)</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">ব্যবহারকারীর নাম (Username)</Label>
                            <Input
                                id="username"
                                placeholder="Ex: farmer123"
                                {...register('username')}
                            />
                            {errors.username && <p className="text-sm text-destructive">{errors.username.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">পাসওয়ার্ড (Password)</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="******"
                                {...register('password')}
                            />
                            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                        </div>
                        <Button type="submit" className="w-full font-bangla" disabled={isSubmitting}>
                            {isSubmitting ? 'লগইন হচ্ছে...' : 'লগইন (Login)'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button variant="link" className="text-muted-foreground font-bangla">
                        পাসওয়ার্ড ভুলে গেছেন? (Forgot Password?)
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default LoginPage;
