import React from 'react';
import { cn } from '../../lib/utils';

interface MobileChartContainerProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    height?: 'sm' | 'md' | 'lg';
    subtitle?: string;
    actions?: React.ReactNode;
}

const MobileChartContainer: React.FC<MobileChartContainerProps> = ({
    title,
    children,
    className,
    height = 'md',
    subtitle,
    actions
}) => {
    const heightClasses = {
        sm: 'h-48 sm:h-56',
        md: 'h-64 sm:h-80',
        lg: 'h-80 sm:h-96'
    };

    return (
        <div className={cn("bg-white rounded-lg border p-4 sm:p-6", className)}>
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    {subtitle && (
                        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                    )}
                </div>
                {actions && (
                    <div className="flex-shrink-0 ml-4">
                        {actions}
                    </div>
                )}
            </div>
            
            {/* Chart Container */}
            <div className={cn("w-full relative", heightClasses[height])}>
                {children}
            </div>
        </div>
    );
};

export default MobileChartContainer;