import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { ChevronRight, MoreHorizontal, Home } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from '@/contexts/locale';

import { cn } from '@/lib/utils';

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<'nav'> & {
    separator?: React.ReactNode;
  }
>(({ ...props }, ref) => <nav ref={ref} aria-label='breadcrumb' {...props} />);
Breadcrumb.displayName = 'Breadcrumb';

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<'ol'>
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      'flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5',
      className
    )}
    {...props}
  />
));
BreadcrumbList.displayName = 'BreadcrumbList';

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<'li'>
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn('inline-flex items-center gap-1.5', className)}
    {...props}
  />
));
BreadcrumbItem.displayName = 'BreadcrumbItem';

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<'a'> & {
    asChild?: boolean;
  }
>(({ asChild, className, ...props }, ref) => {
  const Comp = asChild ? Slot : 'a';

  return (
    <Comp
      ref={ref}
      className={cn('transition-colors hover:text-foreground', className)}
      {...props}
    />
  );
});
BreadcrumbLink.displayName = 'BreadcrumbLink';

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<'span'>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role='link'
    aria-disabled='true'
    aria-current='page'
    className={cn('font-normal text-foreground', className)}
    {...props}
  />
));
BreadcrumbPage.displayName = 'BreadcrumbPage';

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<'li'>) => (
  <li
    role='presentation'
    aria-hidden='true'
    className={cn('[&>svg]:size-3.5', className)}
    {...props}
  >
    {children ?? <ChevronRight />}
  </li>
);
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<'span'>) => (
  <span
    role='presentation'
    aria-hidden='true'
    className={cn('flex h-9 w-9 items-center justify-center', className)}
    {...props}
  >
    <MoreHorizontal className='h-4 w-4' />
    <span className='sr-only'>More</span>
  </span>
);
BreadcrumbEllipsis.displayName = 'BreadcrumbElipssis';

interface SimpleBreadcrumbProps {
  /** Japanese label for the current page */
  labelJa: string;
  /** English label for the current page */
  labelEn: string;
  /** Optional extra class for the wrapper */
  className?: string;
}

/**
 * Simple breadcrumb: Home › Current page.
 * 他にも階層が必要になったら `items` 配列を取るよう拡張すれば良い。
 */
export const SimpleBreadcrumb: React.FC<SimpleBreadcrumbProps> = ({
  labelJa,
  labelEn,
  className = '',
}) => {
  const { locale } = useLocale();

  const currentLabel = locale === 'ja' ? labelJa : labelEn;

  return (
    <nav
      className={`flex items-center space-x-2 text-xs sm:text-sm ${className}`}
      aria-label='Breadcrumb'
    >
      <Link
        href='/'
        className='flex items-center text-gray-400 hover:text-cyan-400 transition-colors duration-200'
      >
        <Home className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
        <span className='hidden sm:inline'>Home</span>
        <span className='sm:hidden'>ホーム</span>
      </Link>
      <ChevronRight className='w-3 h-3 sm:w-4 sm:h-4 text-gray-500' />
      <span className='text-white font-medium'>{currentLabel}</span>
    </nav>
  );
};

export {
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  Breadcrumb,
};
