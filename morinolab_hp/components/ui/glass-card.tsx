import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({
  children,
  className,
  hover = true,
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'backdrop-blur-sm bg-transparent rounded-xl shadow-xl',
        hover &&
          'hover:bg-gray-100/20 transition-all duration-300 hover:shadow-2xl hover:scale-105',
        className
      )}
    >
      {children}
    </div>
  );
}
