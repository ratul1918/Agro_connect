import React from 'react';
import Navbar from './Navbar';

interface NavOnlyLayoutProps {
    children: React.ReactNode;
}

const NavOnlyLayout: React.FC<NavOnlyLayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 bg-background">
                {children}
            </main>
        </div>
    );
};

export default NavOnlyLayout;
