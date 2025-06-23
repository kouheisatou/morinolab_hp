'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { Calendar, Award, Users, BookOpen, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import {
  useFadeInAnimation,
  useStaggeredFadeIn,
} from '@/hooks/use-fade-in-animation';
import { useState, useEffect } from 'react';
import { loadNews, NewsItem } from '@/lib/client-content-loader';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';

const iconMap = {
  award: Award,
  users: Users,
  book: BookOpen,
  trending: TrendingUp,
};

export function News() {
  const { elementRef: titleRef, isVisible: titleVisible } =
    useFadeInAnimation<HTMLHeadingElement>({ forceVisible: true });
  const { elementRef: descRef, isVisible: descVisible } =
    useFadeInAnimation<HTMLParagraphElement>({ forceVisible: true });
  const { elementRef: buttonRef, isVisible: buttonVisible } =
    useFadeInAnimation<HTMLDivElement>();

  // 固定数のアニメーション用refを事前に作成（最大4件表示）
  const cardRefs = [
    useFadeInAnimation<HTMLDivElement>(),
    useFadeInAnimation<HTMLDivElement>(),
    useFadeInAnimation<HTMLDivElement>(),
    useFadeInAnimation<HTMLDivElement>(),
  ];

  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { locale } = useLocale();

  useEffect(() => {
    const fetchNewsData = async () => {
      try {
        console.log('News component: Starting to fetch news data...');
        setLoading(true);
        const items = await loadNews();
        console.log('News component: Received items:', items);
        console.log('News component: Items length:', items.length);
        // 最新の4件のみ表示
        const slicedItems = items.slice(0, 4);
        console.log('News component: Sliced items:', slicedItems);
        setNewsItems(slicedItems);
      } catch (err) {
        console.error('News component: Error loading news:', err);
        setError('Failed to load news data');
      } finally {
        console.log('News component: Finished loading');
        setLoading(false);
      }
    };

    fetchNewsData();
  }, []);

  const getIconAndColor = (index: number) => {
    const configs = [
      { icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
      { icon: BookOpen, color: 'from-blue-500 to-cyan-500' },
      { icon: Users, color: 'from-purple-500 to-pink-500' },
      { icon: Award, color: 'from-orange-500 to-red-500' },
    ];
    return configs[index % configs.length];
  };

  if (loading) {
    return (
      <SectionWrapper id='news' className='py-32'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto'></div>
          <p className='text-white mt-4'>
            {locale === 'ja' ? 'ニュースを読み込み中...' : 'Loading news...'}
          </p>
        </div>
      </SectionWrapper>
    );
  }

  if (error) {
    return (
      <SectionWrapper id='news' className='py-32'>
        <div className='text-center'>
          <p className='text-red-400'>{error}</p>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper id='news' className='py-32'>
      <div className='text-center mb-16'>
        <h2
          ref={titleRef}
          className={`text-5xl font-bold text-white mb-6 transition-all duration-1000 ${
            titleVisible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-10 scale-95'
          }`}
        >
          {locale === 'ja' ? '最新ニュース' : 'Latest News & Updates'}
        </h2>
        <p
          ref={descRef}
          className={`text-xl text-gray-300 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
            descVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
          }`}
        >
          {locale === 'ja'
            ? '量子コンピューティング分野での最新の研究成果や出版物、受賞情報をご覧ください。'
            : 'Stay updated with our latest research breakthroughs, publications, and achievements in the field of quantum computing.'}
        </p>
      </div>

      <div className='grid md:grid-cols-2 gap-8 auto-rows-[1fr]'>
        {newsItems.length === 0 ? (
          <div className='col-span-2 text-center text-gray-400'>
            <p>
              {locale === 'ja'
                ? 'ニュースが見つかりません'
                : 'No news items found'}
            </p>
          </div>
        ) : (
          newsItems.map((item, index) => {
            const { icon: Icon, color } = getIconAndColor(index);
            // 事前に作成したrefを使用
            const { elementRef: cardRef, isVisible: cardVisible } = cardRefs[
              index
            ] || { elementRef: null, isVisible: true };

            return (
              <div
                ref={cardRef}
                key={item.id}
                className={`h-full transition-all duration-1000 ${
                  cardVisible
                    ? 'opacity-100 translate-y-0 rotate-0'
                    : 'opacity-0 translate-y-16 scale-95'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <Link href={`/news/${item.id}`} className='block h-full group'>
                  <GlassCard className='p-8 h-full flex flex-col relative overflow-hidden group-hover:scale-[1.02] transition-all duration-300'>
                    <div className='flex items-start space-x-4'>
                      <div
                        className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className='w-6 h-6 text-white' />
                      </div>

                      <div className='flex flex-col'>
                        <div className='flex items-center space-x-2 mb-3'>
                          <Calendar className='w-4 h-4 text-gray-400' />
                          <span className='text-gray-400 text-sm'>
                            {item.date}
                          </span>
                        </div>

                        <h3 className='text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors duration-300'>
                          {getLocalized(item, 'name', locale)}
                        </h3>

                        {/* action button removed; card clickable */}
                      </div>
                    </div>

                    {/* Subtle glow effect on hover */}
                    <div className='pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
                  </GlassCard>
                </Link>
              </div>
            );
          })
        )}
      </div>

      <div
        ref={buttonRef}
        className={`text-center mt-12 transition-all duration-1000 delay-1000 ${
          buttonVisible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-8 scale-95'
        }`}
      >
        <Link href='/news'>
          <Button
            size='lg'
            className='bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 text-lg font-semibold'
          >
            View All News
          </Button>
        </Link>
      </div>
    </SectionWrapper>
  );
}
