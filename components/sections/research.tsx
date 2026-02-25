'use client';

import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { loadThemes, Theme, getImagePath } from '@/lib/client-content-loader';
import { ScrollAwareLink } from '@/components/ui/ScrollAwareLink';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';

export function Research() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [totalThemeCount, setTotalThemeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocale();

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        setLoading(true);
        const themesData = await loadThemes();
        setTotalThemeCount(themesData.length);
        setThemes(themesData.slice(0, 3));
      } catch (err) {
        console.error('Research component: Error loading themes:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchThemes();
  }, []);

  if (loading) return null;

  return (
    <section id='research' className='bg-white'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6'>
          <div className='max-w-2xl'>
            <h2 className='text-primary font-bold tracking-wider mb-2 uppercase text-sm'>Research Themes</h2>
            <h3 className='text-3xl md:text-4xl font-bold text-slate-900'>
              {locale === 'ja' ? '最先端の研究テーマ' : 'Cutting-Edge Research'}
            </h3>
            <p className='text-lg text-slate-600 mt-4'>
              {locale === 'ja'
                ? '多様な情報通信分野にわたり、先端技術の応用と社会課題の解決に挑戦しています。'
                : 'Our research spans diverse areas of ICT, striving to apply advanced technologies to solve real-world problems.'}
            </p>
          </div>
          <ScrollAwareLink href='/theme'>
            <Button variant="outline" className="group border-primary text-primary hover:bg-primary hover:text-white transition-all">
              {locale === 'ja' ? 'すべてのテーマを見る' : 'View All Themes'}
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </ScrollAwareLink>
        </div>

        <div className='grid md:grid-cols-3 gap-8'>
          {themes.map((theme) => {
            const achievementsRaw = locale === 'ja' ? theme.keyAchievementsJa : theme.keyAchievementsEn;
            const achievements = achievementsRaw ? achievementsRaw.split(',').map((item) => item.trim()) : [];

            return (
              <div key={theme.id} className='group flex flex-col bg-white border border-slate-100 rounded-2xl p-8 hover:shadow-xl hover:shadow-primary/5 transition-all hover:-translate-y-1'>
                <div className='w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform'>
                  <Image
                    src={getImagePath(`/generated_contents/theme/${theme.thumbnail}`)}
                    alt={getLocalized(theme, 'name', locale)}
                    width={32}
                    height={32}
                    className='object-contain'
                  />
                </div>

                <h4 className='text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors'>
                  {getLocalized(theme, 'name', locale)}
                </h4>

                <p className='text-slate-500 text-sm mb-6 line-clamp-2'>
                  {getLocalized(theme, 'desc', locale)}
                </p>

                <div className='mt-auto pt-6 border-t border-slate-50'>
                  <ul className='space-y-3 mb-6'>
                    {achievements.slice(0, 2).map((achievement, i) => (
                      <li key={i} className='text-slate-600 text-sm flex items-start'>
                        <span className='w-1.5 h-1.5 bg-primary rounded-full mt-1.5 mr-2.5 flex-shrink-0' />
                        {achievement}
                      </li>
                    ))}
                  </ul>

                  <ScrollAwareLink href={`/theme/${theme.id}`}>
                    <span className='text-primary font-bold text-sm flex items-center group-hover:underline'>
                      {locale === 'ja' ? '詳細を読む' : 'Read More'}
                      <ArrowRight className='w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform' />
                    </span>
                  </ScrollAwareLink>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
