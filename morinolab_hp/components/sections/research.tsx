'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import {
  useFadeInAnimation,
  useStaggeredFadeIn,
} from '@/hooks/use-fade-in-animation';
import { useState, useEffect } from 'react';
import { loadThemes, Theme, getImagePath } from '@/lib/client-content-loader';
import { ScrollAwareLink } from '@/components/ui/ScrollAwareLink';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';

const colorArray = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-green-500 to-teal-500',
  'from-orange-500 to-red-500',
  'from-indigo-500 to-purple-500',
  'from-yellow-500 to-orange-500',
];

export function Research() {
  const titleAnimation = useFadeInAnimation<HTMLHeadingElement>({
    delay: 100,
    duration: 1000,
    translateY: 30,
  });
  const descAnimation = useFadeInAnimation<HTMLParagraphElement>({
    delay: 300,
    duration: 1000,
    translateY: 25,
  });

  // 固定数のアニメーション用refを事前に作成（最大3つのテーマ用）
  const cardAnimations = useStaggeredFadeIn<HTMLDivElement>(3, 500, 200, {
    duration: 800,
    translateY: 40,
    scale: 0.95,
  });

  // 「すべての研究テーマを見る」ボタン用アニメーション
  const buttonAnimation = useFadeInAnimation<HTMLDivElement>({
    delay: 500,
    duration: 800,
    translateY: 30,
  });

  // 表示用の上位3テーマ
  const [themes, setThemes] = useState<Theme[]>([]);
  // 全テーマ数を保持
  const [totalThemeCount, setTotalThemeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { locale } = useLocale();

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        setLoading(true);
        const themesData = await loadThemes();

        // 取得したテーマ数を保存
        setTotalThemeCount(themesData.length);
        // 上位3つのテーマを表示用に抽出
        const topThemes = themesData.slice(0, 3);
        setThemes(topThemes);
      } catch (err) {
        console.error('Research component: Error loading themes:', err);
        setError('Failed to load research themes');
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, []);

  if (loading) {
    return (
      <SectionWrapper id='research' className='py-32'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto'></div>
          <p className='text-white mt-4'>Loading research themes...</p>
        </div>
      </SectionWrapper>
    );
  }

  if (error) {
    return (
      <SectionWrapper id='research' className='py-32'>
        <div className='text-center'>
          <p className='text-red-400'>{error}</p>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper id='research' className='py-32'>
      <div className='text-center mb-16'>
        <h2
          ref={titleAnimation.ref}
          style={titleAnimation.style}
          className='text-5xl font-bold text-white mb-6'
        >
          {locale === 'ja' ? '研究テーマ' : 'Cutting-Edge Research'}
        </h2>
        <p
          ref={descAnimation.ref}
          style={descAnimation.style}
          className='text-xl text-gray-300 max-w-3xl mx-auto'
        >
          {locale === 'ja'
            ? '多様な情報通信分野にわたり、先端技術の応用と社会課題の解決に挑戦しています。'
            : 'Our research spans diverse areas of information and communication technology, striving to apply advanced technologies to solve real-world problems.'}
        </p>
      </div>

      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[1fr]'>
        {themes.length === 0 ? (
          <div className='col-span-full text-center text-gray-400'>
            <p>No research themes found</p>
          </div>
        ) : (
          themes.map((theme, index) => {
            const color = colorArray[index % colorArray.length];
            const cardAnimation = cardAnimations[index % cardAnimations.length];

            // keyAchievements を言語で抽出
            const achievementsRaw =
              locale === 'ja'
                ? theme.keyAchievementsJa
                : theme.keyAchievementsEn;

            const achievements = achievementsRaw
              ? achievementsRaw.split(',').map((item) => item.trim())
              : locale === 'ja'
                ? ['研究進行中', '革新的アプローチ', '将来的な展開']
                : [
                    'Research in progress',
                    'Innovative approaches',
                    'Future developments',
                  ];

            return (
              <div
                ref={cardAnimation.ref}
                style={cardAnimation.style}
                key={theme.id}
              >
                <GlassCard className='p-8 h-full flex flex-col relative overflow-hidden group hover:scale-[1.02] transition-all duration-300'>
                  <div
                    className={`w-16 h-16 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 p-2`}
                  >
                    <Image
                      src={getImagePath(
                        `/generated_contents/theme/${theme.thumbnail}`
                      )}
                      alt={getLocalized(theme, 'name', locale)}
                      width={48}
                      height={48}
                      className='w-full h-full object-contain'
                    />
                  </div>

                  <h3 className='text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300'>
                    {getLocalized(theme, 'name', locale)}
                  </h3>

                  <p className='text-blue-400 text-sm mb-4'>
                    {getLocalized(theme, 'desc', locale)}
                  </p>

                  {achievements.length > 0 && (
                    <div className='space-y-3 mb-6'>
                      <h4 className='text-lg font-semibold text-white'>
                        {locale === 'ja' ? '主な成果:' : 'Key Achievements:'}
                      </h4>
                      <ul className='space-y-2'>
                        {achievements.map((achievement, i) => (
                          <li
                            key={i}
                            className='text-gray-300 flex items-start'
                          >
                            <span className='w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0' />
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <ScrollAwareLink
                    href={`/theme/${theme.id}`}
                    className='mt-auto'
                  >
                    <Button
                      variant='outline'
                      className='transition-all duration-300 w-full'
                    >
                      {locale === 'ja' ? '詳しく見る' : 'Learn More'}
                      <ExternalLink className='w-4 h-4 ml-2' />
                    </Button>
                  </ScrollAwareLink>

                  {/* Subtle glow effect on hover */}
                  <div className='pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
                </GlassCard>
              </div>
            );
          })
        )}
      </div>

      {/* すべてのテーマを見るボタン */}
      {totalThemeCount > 3 && (
        <div
          ref={buttonAnimation.ref}
          style={buttonAnimation.style}
          className='mt-12 text-center'
        >
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <ScrollAwareLink href='/theme'>
              <Button className='bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 text-lg font-semibold'>
                {locale === 'ja'
                  ? 'すべての研究テーマを見る'
                  : 'View All Research Themes'}
              </Button>
            </ScrollAwareLink>
            <ScrollAwareLink href='/publications'>
              <Button
                variant='outline'
                className='relative overflow-hidden px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:text-white hover:border-transparent hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500'
              >
                {locale === 'ja'
                  ? 'すべての論文を見る'
                  : 'View All Publications'}
              </Button>
            </ScrollAwareLink>
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}
