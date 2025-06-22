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
        'backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl',
        hover &&
          'hover:bg-white/15 hover:border-white/30 transition-all duration-300 hover:shadow-2xl hover:scale-105',
        className
      )}
    >
      {children}
    </div>
  );
}
