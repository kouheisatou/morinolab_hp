import React, { ReactNode } from 'react';
import { ParticleBackground } from './particle-background';
import { Navbar } from '../navigation/navbar';
import { Footer } from '../navigation/footer';

interface PageContainerProps {
  /** The actual page content to render inside <main>. */
  children: ReactNode;
  /** Whether to show the footer. Defaults to true. */
  showFooter?: boolean;
  /** Additional class names for the <main> element. */
  mainClassName?: string;
}

/**
 * Provides the common outer-shell that almost every page re-implements: background, navbar and footer.
 *
 * Usage:
 * ```tsx
 * return (
 *   <PageContainer>
 *     <SectionWrapper className="py-32">Your content</SectionWrapper>
 *   </PageContainer>
 * )
 * ```
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  showFooter = true,
  mainClassName = '',
}) => {
  return (
    <div className='min-h-screen relative overflow-x-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col'>
      <ParticleBackground />
      <Navbar />

      <main className={`flex-1 ${mainClassName}`}>{children}</main>

      {showFooter && <Footer />}
    </div>
  );
};
