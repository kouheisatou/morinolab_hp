'use client';

import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight } from 'lucide-react';
import { ScrollAwareLink } from '@/components/ui/ScrollAwareLink';
import { useState, useEffect } from 'react';
import { loadNews, NewsItem } from '@/lib/client-content-loader';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';

export function News() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocale();

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        setLoading(true);
        const items = await loadNews();
        setNewsItems(items.slice(0, 4));
      } catch (err) {
        console.error('News component: Error loading news:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNewsData();
  }, []);

  if (loading) return null;

  return (
    <section id='news' className='bg-slate-50 py-24'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6'>
          <div className='max-w-2xl'>
            <h2 className='text-primary font-bold tracking-wider mb-2 uppercase text-sm'>News & Events</h2>
            <h3 className='text-3xl md:text-4xl font-bold text-slate-900'>
              {locale === 'ja' ? '最新ニュース' : 'Latest News'}
            </h3>
          </div>
          <ScrollAwareLink href='/news'>
            <Button variant="ghost" className="group text-primary hover:bg-primary/10 transition-all font-bold">
              {locale === 'ja' ? 'すべてのニュースを見る' : 'View All News'}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </ScrollAwareLink>
        </div>

        <div className='grid gap-4'>
          {newsItems.map((item) => (
            <ScrollAwareLink
              key={item.id}
              href={`/news/${item.id}`}
              className='group block'
            >
              <div className='bg-white border border-slate-100 p-6 rounded-xl flex flex-col md:flex-row md:items-center gap-4 md:gap-8 hover:border-primary/30 hover:shadow-md transition-all'>
                <div className='flex items-center text-slate-400 text-sm font-medium min-w-[120px]'>
                  <Calendar className='w-4 h-4 mr-2' />
                  {item.date}
                </div>
                
                <div className='flex-1'>
                  <h4 className='text-lg font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-1'>
                    {getLocalized(item, 'name', locale)}
                  </h4>
                </div>

                <div className='flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity'>
                  <span className='text-sm font-bold mr-2'>{locale === 'ja' ? '詳細' : 'Details'}</span>
                  <ArrowRight className='w-4 h-4' />
                </div>
              </div>
            </ScrollAwareLink>
          ))}
        </div>
      </div>
    </section>
  );
}
