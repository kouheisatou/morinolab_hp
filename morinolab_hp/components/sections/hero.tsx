'use client';

import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { ChevronDown, Atom, Zap, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

export function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const { elementRef: titleRef, isVisible: titleVisible } =
    useScrollAnimation<HTMLHeadingElement>();
  const { elementRef: descRef, isVisible: descVisible } =
    useScrollAnimation<HTMLParagraphElement>();
  const { elementRef: cardsRef, isVisible: cardsVisible } =
    useScrollAnimation<HTMLDivElement>();
  const { elementRef: buttonsRef, isVisible: buttonsVisible } =
    useScrollAnimation<HTMLDivElement>();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <SectionWrapper className='min-h-screen flex items-center justify-center pt-0'>
      <div className='text-center space-y-8 max-w-4xl'>
        <div
          className='space-y-6'
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
            opacity: 1 - scrollY / 800,
          }}
        >
          <h1
            ref={titleRef}
            className={`text-6xl md:text-8xl font-bold text-white leading-tight transition-all duration-1500 ${
              titleVisible
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-20 scale-90'
            }`}
          >
            Morino
            <span className='bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'>
              Lab
            </span>
          </h1>

          <p
            ref={descRef}
            className={`text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed transition-all duration-1500 delay-300 ${
              descVisible
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}
          >
            Pioneering the future of quantum computing through innovative
            research and cutting-edge technology development
          </p>
        </div>

        <div
          ref={cardsRef}
          className={`flex flex-wrap justify-center gap-4 mt-12 transition-all duration-1500 delay-600 ${
            cardsVisible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-16 scale-95'
          }`}
        >
          <GlassCard className='p-6 flex items-center space-x-3 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300'>
            <Atom className='w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform duration-300' />
            <span className='text-white font-medium group-hover:text-cyan-400 transition-colors duration-300'>
              スマートシティ
            </span>
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
          </GlassCard>
          <GlassCard className='p-6 flex items-center space-x-3 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300'>
            <Zap className='w-8 h-8 text-cyan-400 group-hover:scale-110 transition-transform duration-300' />
            <span className='text-white font-medium group-hover:text-cyan-400 transition-colors duration-300'>
              医療AI
            </span>
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
          </GlassCard>
          <GlassCard className='p-6 flex items-center space-x-3 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300'>
            <Shield className='w-8 h-8 text-purple-400 group-hover:scale-110 transition-transform duration-300' />
            <span className='text-white font-medium group-hover:text-cyan-400 transition-colors duration-300'>
              自動運転
            </span>
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
          </GlassCard>
        </div>

        <div
          ref={buttonsRef}
          className={`flex flex-col sm:flex-row gap-4 justify-center mt-12 transition-all duration-1500 delay-900 ${
            buttonsVisible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-12 scale-95'
          }`}
        >
          <Button
            size='lg'
            className='bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 text-lg font-semibold'
            onClick={() =>
              document
                .getElementById('research')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Explore Research
          </Button>
          <Button
            size='lg'
            variant='outline'
            className='border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold'
            onClick={() =>
              document
                .getElementById('team')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Meet the Team
          </Button>
        </div>

        <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce'>
          <ChevronDown className='w-8 h-8 text-white/70' />
        </div>
      </div>
    </SectionWrapper>
  );
}
