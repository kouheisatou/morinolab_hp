import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

export function SectionWrapper({
  children,
  className,
  id,
}: SectionWrapperProps) {
  return (
    <section
      id={id}
      className={cn('relative z-10 py-20 px-4 max-w-7xl mx-auto', className)}
    >
      {children}
    </section>
  );
}
