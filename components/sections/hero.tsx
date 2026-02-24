'use client';

import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  useFadeInAnimation,
  useStaggeredFadeIn,
} from '@/hooks/use-fade-in-animation';
import { useLocale } from '@/contexts/locale';
import { loadThemes, Theme, getImagePath } from '@/lib/client-content-loader';
import { getLocalized } from '@/lib/utils';
import Image from 'next/image';
import { M_PLUS_Rounded_1c } from 'next/font/google';

const mplusRounded = M_PLUS_Rounded_1c({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export function Hero() {
  const [scrollY, setScrollY] = useState(0);
  const [themes, setThemes] = useState<Theme[]>([]);
  const { locale } = useLocale();
  const titleAnimation = useFadeInAnimation<HTMLHeadingElement>({
    delay: 0,
    duration: 600,
    translateY: 25,
    scale: 0.95,
  });
  const descAnimation = useFadeInAnimation<HTMLParagraphElement>({
    delay: 150,
    duration: 600,
    translateY: 20,
  });
  const cardsAnimation = useFadeInAnimation<HTMLDivElement>({
    delay: 300,
    duration: 600,
    translateY: 25,
    scale: 0.97,
  });
  const buttonsAnimation = useFadeInAnimation<HTMLDivElement>({
    delay: 450,
    duration: 600,
    translateY: 20,
  });
  const photoAnimation = useFadeInAnimation<HTMLDivElement>({
    delay: 200,
    duration: 600,
    translateY: 20,
  });

  const titlePart1 = locale === 'ja' ? '森野' : 'Morino';
  const titlePart2 = locale === 'ja' ? '研究室' : 'Lab';

  const subtitle =
    locale === 'ja'
      ? '移動通信ネットワーク研究室'
      : 'Mobile Information Networking Laboratory';
  const exploreText = locale === 'ja' ? '研究内容を見る' : 'Explore Research';
  const teamText = locale === 'ja' ? 'メンバーを見る' : 'Meet the Team';

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const themesData = await loadThemes();
        // 最初の3つのテーマを取得
        setThemes(themesData.slice(0, 3));
      } catch (error) {
        console.error('Error loading themes for hero:', error);
      }
    };

    fetchThemes();
  }, []);

  return (
    <SectionWrapper className='min-h-screen flex items-center justify-center pt-24 md:pt-0'>
      <div className='text-center space-y-8 max-w-4xl'>
        <div
          className='space-y-6'
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
            opacity: 1 - scrollY / 800,
          }}
        >
          <h1
            ref={titleAnimation.ref}
            style={titleAnimation.style}
            className='text-6xl md:text-8xl font-bold text-foreground leading-tight'
          >
            {locale === 'ja' ? (
              <>
                <span className={mplusRounded.className}>{titlePart1}</span>
                <span
                  className={
                    mplusRounded.className +
                    ' bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'
                  }
                >
                  {titlePart2}
                </span>
              </>
            ) : (
              <>
                {titlePart1}
                <span className='bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'>
                  {titlePart2}
                </span>
              </>
            )}
          </h1>

          <p
            ref={descAnimation.ref}
            style={descAnimation.style}
            className='text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed'
          >
            {subtitle}
          </p>
        </div>

        {/* Group Photo */}
        <div
          ref={photoAnimation.ref}
          style={photoAnimation.style}
          className='flex justify-center'
        >
          <Image
            src={getImagePath('/img/lab-group2023.png')}
            alt='Morino Lab Group 2024'
            width={1200}
            height={650}
            className='w-full max-w-3xl h-auto rounded-lg shadow-lg'
          />
        </div>

        <div
          ref={cardsAnimation.ref}
          style={cardsAnimation.style}
          className='flex flex-wrap justify-center gap-4 mt-12'
        >
          {themes.slice(0, 3).map((theme, index) => {
            const colors = [
              'bg-gradient-to-r from-blue-500 to-cyan-500',
              'bg-gradient-to-r from-purple-500 to-pink-500',
              'bg-gradient-to-r from-green-500 to-teal-500',
            ];

            return (
              <GlassCard
                key={theme.id}
                className='p-6 flex items-center space-x-3 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300'
              >
                <div
                  className={`w-12 h-12 rounded-lg ${colors[index]} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 p-2`}
                >
                  <Image
                    src={getImagePath(
                      `/generated_contents/theme/${theme.thumbnail}`
                    )}
                    alt={getLocalized(theme, 'name', locale)}
                    width={32}
                    height={32}
                    className='w-full h-full object-contain'
                  />
                </div>
                <span className='text-foreground font-medium group-hover:text-cyan-600 transition-colors duration-300'>
                  {getLocalized(theme, 'name', locale)}
                </span>
                <div className='pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
              </GlassCard>
            );
          })}
        </div>

        <div
          ref={buttonsAnimation.ref}
          style={buttonsAnimation.style}
          className='flex flex-col sm:flex-row gap-4 justify-center mt-12'
        >
          <Button
            size='lg'
            className='bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 text-lg font-semibold'
            onClick={() =>
              document.getElementById('research')?.scrollIntoView()
            }
          >
            {exploreText}
          </Button>
          <Button
            size='lg'
            variant='outline'
            className='relative overflow-hidden px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:text-white hover:border-transparent hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500'
            onClick={() => document.getElementById('team')?.scrollIntoView()}
          >
            {teamText}
          </Button>
        </div>

        <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce'>
          <ChevronDown className='w-8 h-8 text-white/70' />
        </div>
      </div>
    </SectionWrapper>
  );
}
