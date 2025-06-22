'use client';

import { ReactNode, ElementType } from 'react';
import { useFadeInAnimation } from '@/hooks/use-fade-in-animation';

interface AnimatedSectionProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  translateY?: number;
  scale?: number;
  className?: string;
  as?: ElementType<any>;
}

export function AnimatedSection({
  children,
  delay = 0,
  duration = 800,
  translateY = 30,
  scale = 0.95,
  className = '',
  as: Component = 'div',
}: AnimatedSectionProps) {
  const animation = useFadeInAnimation({
    delay,
    duration,
    translateY,
    scale,
  });

  return (
    <Component
      ref={animation.ref}
      style={animation.style}
      className={className}
    >
      {children}
    </Component>
  );
}
