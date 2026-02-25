'use client';

import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Calendar, ChevronRight, ArrowRight } from 'lucide-react';
import { NewsItem, loadNews, getStaticPath } from '@/lib/client-content-loader';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';
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

  if (loading) return null;

  return (
    <div className='min-h-screen bg-white flex flex-col'>
      <Navbar />

      <main className='flex-1 pt-20'>
        <div className='bg-slate-50 border-b border-slate-100 py-12'>
          <div className='max-w-7xl mx-auto px-4'>
            <nav className='flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-6'>
              <ScrollAwareLink href='/' className='hover:text-primary transition-colors'>Home</ScrollAwareLink>
              <ChevronRight className='w-3 h-3' />
              <span className='text-slate-900'>{locale === 'ja' ? 'ニュース' : 'News'}</span>
            </nav>
            <h1 className='text-4xl md:text-5xl font-black text-slate-900 tracking-tight'>
              {locale === 'ja' ? '最新ニュース' : 'Latest News'}
            </h1>
          </div>
        </div>

        <SectionWrapper className='py-16'>
          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {newsItems.map((item) => (
              <ScrollAwareLink
                key={item.id}
                href={`/news/${item.id}`}
                className='group block'
              >
                <div className='bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all h-full flex flex-col'>
                  <div className='aspect-video relative overflow-hidden bg-slate-100'>
                    <Image
                      src={getStaticPath(`/generated_contents/news/${item.id}.jpg`)}
                      alt={getLocalized(item, 'name', locale)}
                      fill
                      className='object-cover group-hover:scale-105 transition-transform duration-500'
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = getStaticPath('/img/noimage_news.png');
                      }}
                    />
                  </div>

                  <div className='p-6 flex flex-col flex-1'>
                    <div className='flex items-center text-slate-400 text-xs font-bold uppercase tracking-widest mb-3'>
                      <Calendar className='w-3 h-3 mr-2 text-primary/60' />
                      {new Date(item.date).toLocaleDateString(
                        locale === 'ja' ? 'ja-JP' : 'en-US',
                        { year: 'numeric', month: 'long', day: 'numeric' }
                      )}
                    </div>

                    <h3 className='text-lg font-bold text-slate-900 group-hover:text-primary transition-colors mb-4 line-clamp-2 leading-snug'>
                      {getLocalized(item, 'name', locale)}
                    </h3>

                    <div className='mt-auto flex items-center text-primary text-xs font-bold uppercase tracking-widest'>
                      {locale === 'ja' ? '続きを読む' : 'Read More'}
                      <ArrowRight className='w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform' />
                    </div>
                  </div>
                </div>
              </ScrollAwareLink>
            ))}
          </div>

          {newsItems.length === 0 && (
            <div className='text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200'>
              <p className='text-slate-400 font-bold uppercase tracking-widest'>No news items found.</p>
            </div>
          )}
        </SectionWrapper>
      </main>

      <Footer />
    </div>
  );
}
