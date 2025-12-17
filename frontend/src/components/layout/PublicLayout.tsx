import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface PublicLayoutProps {
    children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default PublicLayout;
