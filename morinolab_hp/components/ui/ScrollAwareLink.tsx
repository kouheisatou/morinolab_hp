'use client';

import { useScrollPosition } from '@/contexts/scroll-position';
import { useRouter } from 'next/navigation';
import React from 'react';

interface ScrollAwareLinkProps extends React.ComponentProps<'a'> {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function ScrollAwareLink({
  href,
  children,
  className,
  ...rest
}: ScrollAwareLinkProps) {
  const { saveScrollPosition } = useScrollPosition();
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    saveScrollPosition();
    console.log('scroll position saved', window.scrollY);
    router.push(href);
    setTimeout(() => window.scrollTo(0, 0), 10);
  };

  return (
    <a href={href} className={className} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
