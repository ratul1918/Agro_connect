import React, { useState } from 'react';
import { login } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const Login: React.FC = () => {
    const { login: authLogin } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // Added loading state

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); // Start loading
        try {
            const res = await login({ email, password });
            const { token, ...userData } = res.data;
            authLogin(token, userData);
        } catch (err) {
            setError('Invalid credentials');
        } finally {
            setLoading(false); // End loading
        }
    };

    return (
        <div className="flex justify-center items-center h-screen">
            <form onSubmit={handleSubmit} className="p-8 bg-white shadow-md rounded w-96 space-y-4">
                <h2 className="text-2xl font-bold text-center">Login</h2>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </Button>
            </form>

            <div className="mt-4">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with
                        </span>
                    </div>
                </div>
                <Button
                    variant="outline"
                    type="button"
                    className="w-full mt-4"
                    onClick={() => window.location.href = 'http://localhost:8080/oauth2/authorization/google'}
                >
                    <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
                    Sign in with Google
                </Button>
            </div>
        </div>
    );
};

export default Login;
