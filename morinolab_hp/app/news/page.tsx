'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import {
  Calendar,
  ArrowRight,
  Newspaper,
  Home,
  ChevronRight,
} from 'lucide-react';
import { NewsItem, loadNews, getStaticPath } from '@/lib/client-content-loader';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function NewsPage() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className='min-h-screen relative overflow-x-hidden bg-black'>
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
    <div className='min-h-screen relative overflow-x-hidden bg-black'>
      <ParticleBackground />
      <Navbar />

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
            <span className='text-white font-medium'>News</span>
          </nav>
        </div>

        <div className='text-center mb-16'>
          <h1 className='text-5xl font-bold text-white mb-6'>Latest News</h1>
          <p className='text-xl text-gray-300 max-w-3xl mx-auto'>
            Stay updated with our latest research breakthroughs, publications,
            and achievements in the field of quantum computing.
          </p>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {newsItems.map((item) => (
            <GlassCard
              key={item.id}
              className='p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300'
            >
              <div className='aspect-video relative mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-blue-500/20 to-cyan-500/20'>
                <Image
                  src={getStaticPath(`/generated_contents/news/${item.id}.jpg`)}
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
                  {new Date(item.date).toLocaleDateString('ja-JP')}
                </span>
              </div>

              <h3 className='text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors duration-300 line-clamp-2'>
                {item.nameJa}
              </h3>

              <p className='text-gray-400 text-sm mb-4'>{item.nameEn}</p>

              <div className='flex justify-between items-center'>
                <Link href={`/news/${item.id}`}>
                  <Button
                    variant='outline'
                    size='sm'
                    className='border-white/30 text-white hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-300'
                  >
                    Read More
                    <ArrowRight className='w-4 h-4 ml-2' />
                  </Button>
                </Link>
              </div>

              {/* Subtle glow effect on hover */}
              <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
            </GlassCard>
          ))}
        </div>

        {newsItems.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-gray-400 text-lg'>No news items found.</p>
          </div>
        )}
      </SectionWrapper>

      <Footer />
    </div>
  );
}
