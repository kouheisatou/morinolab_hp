import { ParticleBackground } from './particle-background';
import { Navbar } from '../navigation/navbar';
import { Footer } from '../navigation/footer';
import { SectionWrapper } from './section-wrapper';
import React from 'react';

interface FullPageLoaderProps {
  /**
   * Message to display under the spinner.
   * Defaults to "Loading...".
   */
  message?: string;
}

/**
 * Full-width loading skeleton used while page level data is fetching.
 *
 * This component consolidates the duplicated loading UI that existed in many pages.
 * Instead of re-implementing the same markup and styling in every page, just render:
 *
 * ```tsx
 * if (loading) return <FullPageLoader message="Loading articles…" />;
 * ```
 */
export const FullPageLoader: React.FC<FullPageLoaderProps> = ({
  message = 'Loading...',
}) => (
  <div className='min-h-screen relative overflow-x-hidden bg-gradient-to-br from-slate-900 to-slate-800'>
    <ParticleBackground />
    <Navbar />

    <SectionWrapper className='py-32'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto'></div>
        <p className='text-white mt-4'>{message}</p>
      </div>
    </SectionWrapper>

    <Footer />
  </div>
);
