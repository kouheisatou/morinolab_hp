'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Button } from '@/components/ui/button';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Theme, loadThemes, getImagePath } from '@/lib/client-content-loader';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Home, ChevronRight, ExternalLink } from 'lucide-react';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';
import {
  useFadeInAnimation,
  useStaggeredFadeIn,
} from '@/hooks/use-fade-in-animation';

// カードカラーのバリエーション
const colorArray = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-green-500 to-teal-500',
  'from-orange-500 to-red-500',
  'from-indigo-500 to-purple-500',
  'from-yellow-500 to-orange-500',
];

export default function ThemeListPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocale();

  // アニメーション設定
  const titleAnimation = useFadeInAnimation<HTMLHeadingElement>({
    delay: 100,
    duration: 1000,
    translateY: 30,
  });
  const descAnimation = useFadeInAnimation<HTMLParagraphElement>({
    delay: 300,
    duration: 1000,
    translateY: 25,
  });
  const cardAnimations = useStaggeredFadeIn<HTMLDivElement>(9, 300, 150, {
    duration: 800,
    translateY: 40,
    scale: 0.95,
  });

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const data = await loadThemes();
        setThemes(data);
      } catch (error) {
        console.error('Error loading themes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, []);

  if (loading) {
    return (
      <div className='min-h-screen relative overflow-x-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col'>
        <ParticleBackground />
        <Navbar />
        <main className='flex-1'>
          <SectionWrapper className='py-32'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto'></div>
              <p className='text-white mt-4'>Loading...</p>
            </div>
          </SectionWrapper>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen relative overflow-x-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col'>
      <ParticleBackground />
      <Navbar />

      <main className='flex-1'>
        <SectionWrapper className='py-32'>
          {/* パンくずリスト */}
          <div className='mb-8'>
            <nav className='flex items-center space-x-2 text-sm'>
              <Link
                href='/'
                className='flex items-center text-gray-400 hover:text-cyan-400 transition-colors duration-200'
              >
                <Home className='w-4 h-4 mr-1' />
                Home
              </Link>
              <ChevronRight className='w-4 h-4 text-gray-500' />
              <span className='text-white font-medium'>
                {locale === 'ja' ? '研究テーマ' : 'Research Themes'}
              </span>
            </nav>
          </div>

          {/* 見出し */}
          <div className='mb-16'>
            <h1
              ref={titleAnimation.ref}
              style={titleAnimation.style}
              className='text-5xl font-bold text-white mb-6'
            >
              {locale === 'ja' ? '研究テーマ一覧' : 'All Research Themes'}
            </h1>
            <p
              ref={descAnimation.ref}
              style={descAnimation.style}
              className='text-xl text-gray-300 max-w-3xl mx-auto'
            >
              {locale === 'ja'
                ? '森野研究室が取り組む多彩な研究テーマをご紹介します。'
                : 'Explore the diverse research themes undertaken at Morino Laboratory.'}
            </p>
          </div>

          {themes.length === 0 ? (
            <div className='text-center text-gray-400'>
              <p>No research themes found.</p>
            </div>
          ) : (
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[1fr]'>
              {themes.map((theme, index) => {
                const color = colorArray[index % colorArray.length];
                const cardAnimation =
                  cardAnimations[index % cardAnimations.length];

                return (
                  <div
                    key={theme.id}
                    ref={cardAnimation.ref}
                    style={cardAnimation.style}
                  >
                    <GlassCard className='p-8 h-full flex flex-col relative overflow-hidden group hover:scale-[1.02] transition-all duration-300'>
                      <div
                        className={`w-16 h-16 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 p-2`}
                      >
                        <Image
                          src={getImagePath(
                            `/generated_contents/theme/${theme.thumbnail}`
                          )}
                          alt={getLocalized(theme, 'name', locale)}
                          width={48}
                          height={48}
                          className='w-full h-full object-contain'
                        />
                      </div>

                      <h3 className='text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300'>
                        {getLocalized(theme, 'name', locale)}
                      </h3>

                      <p className='text-blue-400 text-sm mb-6'>
                        {getLocalized(theme, 'desc', locale)}
                      </p>

                      <Link href={`/theme/${theme.id}`} className='mt-auto'>
                        <Button
                          variant='outline'
                          className='transition-all duration-300 w-full'
                        >
                          {locale === 'ja' ? '詳しく見る' : 'Learn More'}
                          <ExternalLink className='w-4 h-4 ml-2' />
                        </Button>
                      </Link>

                      {/* Hover グラデーション */}
                      <div className='pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
                    </GlassCard>
                  </div>
                );
              })}
            </div>
          )}
        </SectionWrapper>
      </main>

      <Footer />
    </div>
  );
}
