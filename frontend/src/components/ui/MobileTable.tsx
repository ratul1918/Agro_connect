import React from 'react';
import { cn } from '../../lib/utils';

interface MobileTableProps {
    headers: { key: string; label: string }[];
    data: Record<string, any>[];
    className?: string;
    emptyMessage?: string;
    onRowClick?: (row: Record<string, any>) => void;
}

const MobileTable: React.FC<MobileTableProps> = ({
    headers,
    data,
    className,
    emptyMessage = "No data available",
    onRowClick
}) => {
    if (data.length === 0) {
        return (
            <div className={cn("text-center py-8 text-gray-500", className)}>
                <div className="text-4xl mb-4">📊</div>
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={cn("space-y-3", className)}>
            {data.map((row, index) => (
                <div 
                    key={index}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                        "bg-white border rounded-lg p-4 space-y-3",
                        "hover:shadow-md transition-shadow duration-200",
                        onRowClick && "cursor-pointer touch-manipulation"
                    )}
                >
                    {headers.map((header) => {
                        const value = row[header.key];
                        const isVisible = value !== undefined && value !== null && value !== '';
                        
                        if (!isVisible) return null;
                        
                        return (
                            <div key={header.key} className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-600">
                                    {header.label}:
                                </span>
                                <span className="text-sm text-gray-900 text-right flex-1 ml-4">
                                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                                </span>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default MobileTable;