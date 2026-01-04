import React from 'react';
import MobileCard from './MobileCard';
import { cn } from '../../lib/utils';

interface MobileStatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'green' | 'blue' | 'red' | 'yellow' | 'purple' | 'orange';
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  onClick?: () => void;
}

const MobileStatCard: React.FC<MobileStatCardProps> = ({
  title,
  value,
  icon,
  color = 'blue',
  trend,
  onClick,
}) => {
  const colorClasses = {
    green: 'bg-green-50 border-green-200 text-green-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    red: 'bg-red-50 border-red-200 text-red-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    orange: 'bg-orange-50 border-orange-200 text-orange-800',
  };

  const iconBgClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <MobileCard
      onClick={onClick}
      className={cn(
        'flex items-center justify-between',
        colorClasses[color]
      )}
      padding="md"
      hover={!!onClick}
    >
      <div className="flex-1">
        <p className="text-sm font-medium opacity-90">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 mt-2 text-xs font-medium',
            trend.direction === 'up' && 'text-green-600',
            trend.direction === 'down' && 'text-red-600',
            trend.direction === 'neutral' && 'text-gray-600'
          )}>
            {trend.direction === 'up' && '↑'}
            {trend.direction === 'down' && '↓'}
            {trend.direction === 'neutral' && '→'}
            {trend.value}
          </div>
        )}
      </div>
      {icon && (
        <div className={cn(
          'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
          iconBgClasses[color]
        )}>
          {icon}
        </div>
      )}
    </MobileCard>
  );
};

export default MobileStatCard;