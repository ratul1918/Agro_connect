import React from 'react';
import { login as loginApi } from '@/api/endpoints';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
// import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { useTheme } from '@/context/ThemeContext';

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
    const { login } = useAuth();
    // const navigate = useNavigate(); // Navigation is handled in AuthContext
    // const { theme } = useTheme(); // Not used currently

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            console.log("Logging in with", data);

            // Call Real API
            // Map username to email as backend expects 'email'
            const response = await loginApi({
                email: data.username,
                password: data.password
            });

            console.log("Login successful", response.data);

            const { token, ...userData } = response.data;

            // Update Auth Context
            login(token, userData);

            // Navigation is handled inside login() but we can ensure it here if needed
            // context.login() calls navigate()

        } catch (error: any) {
            console.error("Login failed", error);
            const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials.";

            // You might want to set a form error or show a toast here
            // For now, let's just log it or alert
            alert(errorMessage);
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
