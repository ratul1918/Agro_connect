import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuth2RedirectHandler: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const fetchUserAndLogin = async () => {
            const token = searchParams.get('token');
            if (token) {
                try {
                    // Fetch user details with the token
                    const response = await fetch('http://localhost:8080/api/auth/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        const userData = await response.json();
                        // Map backend user to frontend user interface if needed
                        // Our backend User model has roles as Set<String>, frontend User interface has 'role' string.
                        // We need to adapt.
                        const userForFrontend = {
                            ...userData,
                            role: userData.roles && userData.roles.length > 0 ? userData.roles[0] : 'ROLE_USER'
                        };

                        login(token, userForFrontend);
                    } else {
                        console.error('Failed to fetch user details');
                        navigate('/login');
                    }
                } catch (error) {
                    console.error('Error during OAuth login:', error);
                    navigate('/login');
                }
            } else {
                navigate('/login');
            }
        };

        fetchUserAndLogin();
    }, [searchParams, login, navigate]);

    return (
        <div className="flex items-center justify-center p-20">
            <h2 className="text-xl">Logging you in...</h2>
        </div>
    );
};

export default OAuth2RedirectHandler;
