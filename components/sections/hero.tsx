'use client';

import { Button } from '@/components/ui/button';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocale } from '@/contexts/locale';
import { loadThemes, Theme, getImagePath } from '@/lib/client-content-loader';
import { getLocalized } from '@/lib/utils';
import Image from 'next/image';

export function Hero() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const { locale } = useLocale();

  const titlePart1 = locale === 'ja' ? '森野' : 'Morino';
  const titlePart2 = locale === 'ja' ? '研究室' : 'Lab';

  const subtitle =
    locale === 'ja'
      ? '移動通信ネットワーク研究室'
      : 'Mobile Information Networking Laboratory';
  const description = 
    locale === 'ja'
      ? '芝浦工業大学 工学部 情報工学科。次世代の移動通信システムやネットワークプロトコルの研究を通じて、より豊かで効率的な情報社会の実現を目指しています。'
      : 'Department of Information Science and Engineering, Shibaura Institute of Technology. We aim to realize a more prosperous and efficient information society through research on next-generation mobile communication systems and network protocols.';

  const exploreText = locale === 'ja' ? '研究内容を見る' : 'Explore Research';
  const teamText = locale === 'ja' ? 'メンバーを見る' : 'Meet the Team';

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const themesData = await loadThemes();
        setThemes(themesData.slice(0, 3));
      } catch (error) {
        console.error('Error loading themes for hero:', error);
      }
    };
    fetchThemes();
  }, []);

  return (
    <div className='relative min-h-[90vh] flex items-center bg-white border-b border-slate-100'>
      <div className='max-w-7xl mx-auto px-4 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-20'>
        <div className='space-y-8 text-left'>
          <div className='space-y-4'>
            <div className='inline-block px-3 py-1 bg-secondary text-primary text-sm font-bold rounded-full mb-2'>
              {subtitle}
            </div>
            <h1 className='text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight'>
              {titlePart1}<span className='text-primary'>{titlePart2}</span>
            </h1>
            <p className='text-lg md:text-xl text-slate-600 leading-relaxed max-w-2xl'>
              {description}
            </p>
          </div>

          <div className='flex flex-wrap gap-4'>
            <Button
              size='lg'
              className='bg-primary hover:bg-primary/90 text-white px-8 h-14 text-base font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-1'
              onClick={() => document.getElementById('research')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {exploreText}
            </Button>
            <Button
              size='lg'
              variant='outline'
              className='border-slate-200 hover:bg-slate-50 text-slate-700 px-8 h-14 text-base font-bold transition-all hover:-translate-y-1'
              onClick={() => document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {teamText}
            </Button>
          </div>

          <div className='grid grid-cols-3 gap-6 pt-8 border-t border-slate-100'>
            {themes.map((theme) => (
              <div key={theme.id} className='space-y-2'>
                <div className='text-2xl font-bold text-primary'>
                  {theme.id.toString().padStart(2, '0')}
                </div>
                <div className='text-sm font-semibold text-slate-900 line-clamp-2'>
                  {getLocalized(theme, 'name', locale)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className='relative hidden lg:block'>
          <div className='absolute -inset-4 bg-primary/5 rounded-3xl -rotate-2'></div>
          <div className='relative rounded-2xl overflow-hidden shadow-2xl shadow-slate-200'>
            <Image
              src={getImagePath('/img/lab-group2023.png')}
              alt='Morino Lab Group'
              width={1200}
              height={800}
              className='object-cover'
              priority
            />
          </div>
        </div>
      </div>

      <div className='absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:block animate-bounce opacity-40'>
        <ChevronDown className='w-6 h-6 text-slate-400' />
      </div>
    </div>
  );
}
