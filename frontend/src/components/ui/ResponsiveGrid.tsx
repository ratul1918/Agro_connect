import React from 'react';
import { cn } from '../../lib/utils';

interface ResponsiveGridProps {
    children: React.ReactNode;
    className?: string;
    cols?: {
        default: number;
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
    gap?: number;
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
    children,
    className,
    cols = { default: 1, sm: 2, md: 3, lg: 4 },
    gap = 4
}) => {
    const gridClasses = cn(
        'grid',
        `gap-${gap}`,
        `grid-cols-${cols.default}`,
        cols.sm && `sm:grid-cols-${cols.sm}`,
        cols.md && `md:grid-cols-${cols.md}`,
        cols.lg && `lg:grid-cols-${cols.lg}`,
        cols.xl && `xl:grid-cols-${cols.xl}`,
        className
    );

    return <div className={gridClasses}>{children}</div>;
};

export default ResponsiveGrid;