'use client';

import { useState, useEffect } from 'react';
import {
  loadNewsDetail,
  NewsItem,
  getStaticPath,
} from '@/lib/client-content-loader';
import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Calendar, Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';

interface ClientPageProps {
  id: string;
}

export default function NewsDetailClientPage({ id }: ClientPageProps) {
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { locale } = useLocale();

  useEffect(() => {
    const fetchNewsDetail = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const item = await loadNewsDetail(id);
        setNewsItem(item);
      } catch (err) {
        setError('Failed to load news detail');
        console.error('Error loading news detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();
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
              <p className='text-white mt-4'>Loading news...</p>
            </div>
          </SectionWrapper>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !newsItem) {
    return (
      <div className='min-h-screen relative overflow-x-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col'>
        <ParticleBackground />
        <Navbar />
        <main className='flex-1'>
          <SectionWrapper className='py-32'>
            <div className='text-center'>
              <h1 className='text-4xl font-bold text-white mb-4'>
                News Not Found
              </h1>
              <p className='text-red-400'>
                {error || 'The requested news article could not be found.'}
              </p>
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
                href='/news'
                className='text-gray-400 hover:text-cyan-400 transition-colors duration-200'
              >
                News
              </Link>
              <ChevronRight className='w-4 h-4 text-gray-500' />
              <span className='text-white font-medium'>
                {getLocalized(newsItem, 'name', locale)}
              </span>
            </nav>
          </div>

          {/* Article Container */}
          <article className='max-w-4xl mx-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden'>
            {/* Hero Image */}
            <div className='relative h-64 md:h-80 lg:h-96 overflow-hidden'>
              <Image
                src={getStaticPath(
                  `/generated_contents/news/${newsItem.thumbnail}`
                )}
                alt={getLocalized(newsItem, 'name', locale)}
                fill
                className='object-cover'
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = getStaticPath('/img/noimage_news.png');
                }}
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />
            </div>

            {/* Article Content */}
            <div className='p-8 md:p-12'>
              {/* Date */}
              <div className='flex items-center space-x-2 mb-6'>
                <Calendar className='w-4 h-4 text-cyan-400' />
                <time className='text-cyan-400 text-sm font-medium'>
                  {new Date(newsItem.date).toLocaleDateString(
                    locale === 'ja' ? 'ja-JP' : 'en-US',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    }
                  )}
                </time>
              </div>

              {/* Title */}
              <header className='mb-8'>
                <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight'>
                  {getLocalized(newsItem, 'name', locale)}
                </h1>
              </header>

              {/* Content */}
              <div
                className='prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-gray-700'
                dangerouslySetInnerHTML={{
                  __html:
                    newsItem.content ||
                    '<p class="text-gray-400">No content available.</p>',
                }}
              />
            </div>
          </article>
        </SectionWrapper>
      </main>

      <Footer />
    </div>
  );
}
