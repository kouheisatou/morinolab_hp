'use client';

import { useState, useEffect } from 'react';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import {
  loadThemeDetail,
  Theme,
  getStaticPath,
} from '@/lib/client-content-loader';
import Link from 'next/link';
import Image from 'next/image';
import { Home, ChevronRight } from 'lucide-react';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';

interface ClientPageProps {
  id: string;
}

export default function ThemeDetailClientPage({ id }: ClientPageProps) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocale();

  useEffect(() => {
    if (id) {
      const fetchThemeDetail = async () => {
        try {
          const themeData = await loadThemeDetail(id);
          setTheme(themeData);
        } catch (error) {
          console.error('Error loading theme detail:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchThemeDetail();
    }
  }, [id]);

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

  if (!theme) {
    return (
      <div className='min-h-screen relative overflow-x-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col'>
        <ParticleBackground />
        <Navbar />
        <main className='flex-1'>
          <SectionWrapper className='py-32'>
            <div className='text-center'>
              <h1 className='text-4xl font-bold text-white mb-4'>
                Theme Not Found
              </h1>
              <p className='text-gray-300 mb-8'>
                The requested research theme could not be found.
              </p>
              <Link href='/'>
                <Button className='bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'>
                  Back to Home
                </Button>
              </Link>
            </div>
          </SectionWrapper>
        </main>
        <Footer />
      </div>
    );
  }

  // サムネイル画像パス
  const thumbnailSrc = getStaticPath(
    `/generated_contents/theme/${theme.thumbnail}`
  );

  return (
    <div className='min-h-screen relative overflow-x-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col'>
      <ParticleBackground />
      <Navbar />

      <main className='flex-1'>
        <SectionWrapper className='py-32'>
          <div className='max-w-4xl mx-auto'>
            <div className='mb-8'>
              <nav className='flex items-center space-x-2 text-sm mb-6'>
                <Link
                  href='/'
                  className='flex items-center text-gray-400 hover:text-cyan-400 transition-colors duration-200'
                >
                  <Home className='w-4 h-4 mr-1' />
                  Home
                </Link>
                <ChevronRight className='w-4 h-4 text-gray-500' />
                <Link
                  href='/#research'
                  className='text-gray-400 hover:text-cyan-400 transition-colors duration-200'
                >
                  Research
                </Link>
                <ChevronRight className='w-4 h-4 text-gray-500' />
                <span className='text-white font-medium'>
                  {getLocalized(theme, 'name', locale)}
                </span>
              </nav>
            </div>

            <article className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden'>
              <div className='relative bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-8 md:p-12'>
                <div className='flex items-start space-x-6'>
                  {/* サムネイル画像をアイコンエリアに表示 */}
                  <div className='w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0'>
                    <Image
                      src={thumbnailSrc}
                      alt={getLocalized(theme, 'name', locale)}
                      width={80}
                      height={80}
                      className='object-cover w-full h-full'
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        img.src = getStaticPath('/img/noimage_theme.png');
                      }}
                    />
                  </div>
                  <div className='flex-1'>
                    <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight'>
                      {getLocalized(theme, 'name', locale)}
                    </h1>
                  </div>
                </div>
              </div>

              <div className='p-8 md:p-12 space-y-12'>
                <div>
                  <h2 className='text-2xl font-bold text-white mb-4 border-b border-cyan-400/30 pb-2'>
                    {locale === 'ja' ? '研究概要' : 'Research Overview'}
                  </h2>
                  <p className='text-gray-200 leading-relaxed text-lg'>
                    {getLocalized(theme, 'desc', locale)}
                  </p>
                </div>

                {/* 詳細記事 */}
                {theme.content && (
                  <div
                    className='prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:text-foreground prose-p:text-gray-700'
                    dangerouslySetInnerHTML={{
                      __html: theme.content,
                    }}
                  />
                )}
              </div>
            </article>
          </div>
        </SectionWrapper>
      </main>

      <Footer />
    </div>
  );
}
