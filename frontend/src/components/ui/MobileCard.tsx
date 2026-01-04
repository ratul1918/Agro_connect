import React from 'react';
import { cn } from '../../lib/utils';

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hover?: boolean;
}

const MobileCard: React.FC<MobileCardProps> = ({
  children,
  className,
  onClick,
  padding = 'md',
  shadow = 'sm',
  border = true,
  hover = false,
}) => {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
  };

  return (
    <div
      className={cn(
        'bg-card rounded-xl transition-all duration-200',
        paddingClasses[padding],
        shadowClasses[shadow],
        border && 'border',
        hover && 'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default MobileCard;