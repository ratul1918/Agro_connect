import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

interface PublicLayoutProps {
    children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className={`flex-1 ${!isHomePage ? 'pt-16' : ''}`}>
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
