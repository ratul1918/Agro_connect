import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import MobileRoleNavigation from './ui/MobileRoleNavigation';

interface MobileDashboardContainerProps {
    children: React.ReactNode;
}

const MobileDashboardContainer: React.FC<MobileDashboardContainerProps> = ({ children }) => {
    const location = useLocation();
    const isDashboardRoute = location.pathname.match(/^\/(farmer|customer|buyer|agronomist|admin)(\/|$)/);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return (
        <div className="relative">
            <div className={isMobile && isDashboardRoute ? 'pb-20' : ''}>
                {children}
            </div>
            
            {/* Show mobile navigation only on dashboard routes */}
            {isMobile && isDashboardRoute && (
                <MobileRoleNavigation currentPath={location.pathname} />
            )}
        </div>
    );
};

export default MobileDashboardContainer;