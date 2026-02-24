'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Calendar, Newspaper, Home, ChevronRight } from 'lucide-react';
import { NewsItem, loadNews, getStaticPath } from '@/lib/client-content-loader';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';
import { t } from '@/lib/i18n';
import { ScrollAwareLink } from '@/components/ui/ScrollAwareLink';

export default function NewsPage() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocale();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const items = await loadNews();
        setNewsItems(items);
      } catch (error) {
        console.error('Error loading news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className='min-h-screen relative overflow-x-hidden bg-gradient-to-br from-slate-900 to-slate-800'>
        <ParticleBackground />
        <Navbar />
        <SectionWrapper className='py-32'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto'></div>
            <p className='text-white mt-4'>Loading...</p>
          </div>
        </SectionWrapper>
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
              <ScrollAwareLink
                href='/'
                className='flex items-center text-gray-400 hover:text-cyan-400 transition-colors duration-200'
              >
                <Home className='w-4 h-4 mr-1' />
                Home
              </ScrollAwareLink>
              <ChevronRight className='w-4 h-4 text-gray-500' />
              <span className='text-white font-medium'>
                {locale === 'ja' ? 'ニュース' : 'News'}
              </span>
            </nav>
          </div>

          <div className='text-center mb-16'>
            <h1 className='text-5xl font-bold text-white mb-6'>
              {locale === 'ja' ? '最新ニュース' : 'Latest News'}
            </h1>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {newsItems.map((item) => (
              <ScrollAwareLink
                key={item.id}
                href={`/news/${item.id}`}
                className='block group'
              >
                <GlassCard className='p-6 h-full flex flex-col relative overflow-hidden group-hover:scale-[1.02] transition-all duration-300'>
                  <div className='aspect-video relative mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500/20 to-cyan-500/20'>
                    <Image
                      src={getStaticPath(
                        `/generated_contents/news/${item.id}.jpg`
                      )}
                      alt={item.nameJa}
                      fill
                      className='object-cover group-hover:scale-110 transition-transform duration-300'
                      onError={(e) => {
                        e.currentTarget.src = getStaticPath(
                          '/img/noimage_news.png'
                        );
                      }}
                    />
                    <div className='absolute top-3 left-3'>
                      <div className='w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                        <Newspaper className='w-5 h-5 text-white' />
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center space-x-2 mb-3'>
                    <Calendar className='w-4 h-4 text-gray-400' />
                    <span className='text-gray-400 text-sm'>
                      {new Date(item.date).toLocaleDateString(
                        locale === 'ja' ? 'ja-JP' : 'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }
                      )}
                    </span>
                  </div>

                  <h3 className='text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors duration-300 line-clamp-2'>
                    {getLocalized(item, 'name', locale)}
                  </h3>

                  {/* Subtle glow effect on hover */}
                  <div className='pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
                </GlassCard>
              </ScrollAwareLink>
            ))}
          </div>

          {newsItems.length === 0 && (
            <div className='text-center py-12'>
              <p className='text-gray-400 text-lg'>No news items found.</p>
            </div>
          )}
        </SectionWrapper>
      </main>

      <Footer />
    </div>
  );
}
