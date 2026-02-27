'use client';

import { useState, useEffect } from 'react';
import {
  loadNewsDetail,
  NewsItem,
  getStaticPath,
} from '@/lib/client-content-loader';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Calendar, Home, ChevronRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';
import { ScrollAwareLink } from '@/components/ui/ScrollAwareLink';

interface ClientPageProps {
  id: string;
}

export default function NewsDetailClientPage({ id }: ClientPageProps) {
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocale();

  useEffect(() => {
    const fetchNewsDetail = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const item = await loadNewsDetail(id);
        setNewsItem(item);
      } catch (err) {
        console.error('Error loading news detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchNewsDetail();
  }, [id]);

  if (loading) return null;

  if (!newsItem) {
    return (
      <div className='min-h-screen bg-white flex flex-col'>
        <Navbar />
        <main className='flex-1 flex items-center justify-center pt-20'>
          <div className='text-center'>
            <h1 className='text-2xl font-black text-slate-900 mb-4'>News Not Found</h1>
            <ScrollAwareLink href='/news' className='text-primary font-bold hover:underline'>Return to News</ScrollAwareLink>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white flex flex-col'>
      <Navbar />

      <main className='flex-1 pt-20'>
        <div className='bg-slate-50 border-b border-slate-100 py-12'>
          <div className='max-w-7xl mx-auto px-4'>
            <nav className='flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8'>
              <ScrollAwareLink href='/' className='hover:text-primary transition-colors'>Home</ScrollAwareLink>
              <ChevronRight className='w-3 h-3' />
              <ScrollAwareLink href='/news' className='hover:text-primary transition-colors'>News</ScrollAwareLink>
              <ChevronRight className='w-3 h-3' />
              <span className='text-slate-900 truncate max-w-[200px]'>
                {getLocalized(newsItem, 'name', locale)}
              </span>
            </nav>

            <div className='flex items-center text-primary text-xs font-black uppercase tracking-widest mb-4'>
              <Calendar className='w-4 h-4 mr-2' />
              {new Date(newsItem.date).toLocaleDateString(locale === 'ja' ? 'ja-JP' : 'en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              })}
            </div>

            <h1 className='text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-0'>
              {getLocalized(newsItem, 'name', locale)}
            </h1>
          </div>
        </div>

        <SectionWrapper className='py-16'>
          <article className='max-w-5xl mx-auto'>
            {/* Featured Image */}
            <div className='relative aspect-video rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-slate-200'>
              <Image
                src={getStaticPath(`/generated_contents/news/${newsItem.thumbnail}`)}
                alt={getLocalized(newsItem, 'name', locale)}
                fill
                className='object-cover'
                priority
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = getStaticPath('/img/noimage_news.png');
                }}
              />
            </div>

            {/* Content */}
            <div
              className='prose prose-slate prose-lg max-w-none 
                prose-headings:text-slate-900 prose-headings:font-black prose-headings:tracking-tight
                prose-p:text-slate-600 prose-p:leading-relaxed
                prose-strong:text-slate-900 prose-strong:font-bold
                prose-a:text-primary prose-a:font-bold prose-a:no-underline hover:prose-a:underline'
              dangerouslySetInnerHTML={{
                __html: newsItem.content || '<p>No content available.</p>',
              }}
            />

            <div className='mt-20 pt-10 border-t border-slate-100'>
              <ScrollAwareLink href='/news'>
                <button className='flex items-center text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors group'>
                  <ArrowLeft className='w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform' />
                  Back to News
                </button>
              </ScrollAwareLink>
            </div>
          </article>
        </SectionWrapper>
      </main>

      <Footer />
    </div>
  );
}
