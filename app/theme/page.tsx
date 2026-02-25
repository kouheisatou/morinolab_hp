'use client';

import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Button } from '@/components/ui/button';
import { Theme, loadThemes, getImagePath } from '@/lib/client-content-loader';
import { useEffect, useState } from 'react';
import { ScrollAwareLink } from '@/components/ui/ScrollAwareLink';
import Image from 'next/image';
import { Home, ChevronRight, ArrowRight } from 'lucide-react';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';

export default function ThemeListPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocale();

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
              <span className='text-slate-900'>{locale === 'ja' ? '研究テーマ' : 'Research'}</span>
            </nav>
            <h1 className='text-4xl md:text-5xl font-black text-slate-900 tracking-tight'>
              {locale === 'ja' ? '研究テーマ一覧' : 'Research Themes'}
            </h1>
            <p className='text-slate-500 mt-4 max-w-2xl font-medium'>
              {locale === 'ja' 
                ? '森野研究室が取り組む、移動通信システムやネットワークプロトコルに関する多彩な研究テーマをご紹介します。'
                : 'Explore the diverse research themes undertaken at Morino Laboratory, focusing on mobile communication systems and network protocols.'}
            </p>
          </div>
        </div>

        <SectionWrapper className='py-16'>
          {themes.length === 0 ? (
            <div className='text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200 text-slate-400 font-bold uppercase tracking-widest'>
              No research themes found.
            </div>
          ) : (
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {themes.map((theme) => (
                <ScrollAwareLink
                  key={theme.id}
                  href={`/theme/${theme.id}`}
                  className='group block'
                >
                  <div className='bg-white border border-slate-100 p-8 rounded-3xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all flex flex-col h-full'>
                    <div className='w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform'>
                      <Image
                        src={getImagePath(`/generated_contents/theme/${theme.thumbnail}`)}
                        alt={getLocalized(theme, 'name', locale)}
                        width={32}
                        height={32}
                        className='object-contain'
                      />
                    </div>

                    <h3 className='text-xl font-bold text-slate-900 group-hover:text-primary transition-colors mb-3'>
                      {getLocalized(theme, 'name', locale)}
                    </h3>

                    <p className='text-sm text-slate-500 mb-6 leading-relaxed line-clamp-3'>
                      {getLocalized(theme, 'desc', locale)}
                    </p>

                    <div className='mt-auto pt-6 border-t border-slate-50 flex items-center text-primary text-xs font-black uppercase tracking-widest'>
                      {locale === 'ja' ? '詳しく見る' : 'Learn More'}
                      <ArrowRight className='w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform' />
                    </div>
                  </div>
                </ScrollAwareLink>
              ))}
            </div>
          )}
        </SectionWrapper>
      </main>

      <Footer />
    </div>
  );
}
