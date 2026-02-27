'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import {
  loadThemeDetail,
  Theme,
  getStaticPath,
} from '@/lib/client-content-loader';
import { ScrollAwareLink } from '@/components/ui/ScrollAwareLink';
import Image from 'next/image';
import { Home, ChevronRight, ArrowLeft } from 'lucide-react';
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

  if (loading) return null;

  if (!theme) {
    return (
      <div className='min-h-screen bg-white flex flex-col'>
        <Navbar />
        <main className='flex-1 flex items-center justify-center pt-20'>
          <div className='text-center'>
            <h1 className='text-2xl font-black text-slate-900 mb-4'>Research Theme Not Found</h1>
            <ScrollAwareLink href='/'>
              <Button className='bg-primary text-white font-bold'>Back to Home</Button>
            </ScrollAwareLink>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const thumbnailSrc = getStaticPath(`/generated_contents/theme/${theme.thumbnail}`);

  return (
    <div className='min-h-screen bg-white flex flex-col'>
      <Navbar />

      <main className='flex-1 pt-20'>
        <div className='bg-slate-50 border-b border-slate-100 py-12'>
          <div className='max-w-7xl mx-auto px-4'>
            <nav className='flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-8'>
              <ScrollAwareLink href='/' className='hover:text-primary transition-colors'>Home</ScrollAwareLink>
              <ChevronRight className='w-3 h-3' />
              <ScrollAwareLink href='/theme' className='hover:text-primary transition-colors'>Research</ScrollAwareLink>
              <ChevronRight className='w-3 h-3' />
              <span className='text-slate-900 truncate max-w-[200px]'>
                {getLocalized(theme, 'name', locale)}
              </span>
            </nav>

            <div className='flex items-start gap-6'>
              <div className='w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center flex-shrink-0 p-2 border border-slate-100'>
                <Image
                  src={thumbnailSrc}
                  alt={getLocalized(theme, 'name', locale)}
                  width={80}
                  height={80}
                  className='object-contain w-full h-full'
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = getStaticPath('/img/noimage_theme.png');
                  }}
                />
              </div>
              <div>
                <h1 className='text-3xl md:text-5xl font-black text-slate-900 leading-tight tracking-tight mb-0'>
                  {getLocalized(theme, 'name', locale)}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <SectionWrapper className='py-16'>
          <article className='max-w-5xl mx-auto'>
            <div className='mb-16'>
              <h2 className='text-xl font-black text-slate-900 uppercase tracking-tight mb-6 flex items-center'>
                <span className='w-8 h-1 bg-primary mr-3'></span>
                {locale === 'ja' ? '研究概要' : 'Research Overview'}
              </h2>
              <p className='text-xl text-slate-600 leading-relaxed font-medium'>
                {getLocalized(theme, 'desc', locale)}
              </p>
            </div>

            {theme.content && (
              <div
                className='prose prose-slate prose-lg max-w-none 
                  prose-headings:text-slate-900 prose-headings:font-black
                  prose-p:text-slate-600 prose-p:leading-relaxed
                  prose-strong:text-slate-900
                  prose-a:text-primary prose-a:font-bold hover:prose-a:underline'
                dangerouslySetInnerHTML={{
                  __html: theme.content,
                }}
              />
            )}

            <div className='mt-20 pt-10 border-t border-slate-100'>
              <ScrollAwareLink href='/#research'>
                <button className='flex items-center text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors group'>
                  <ArrowLeft className='w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform' />
                  Back to Research
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
