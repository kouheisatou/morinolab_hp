'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import {
  Atom,
  Brain,
  Shield,
  ExternalLink,
  Lightbulb,
  Cpu,
  Zap,
} from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { useState, useEffect } from 'react';
import { loadThemes, Theme } from '@/lib/client-content-loader';
import Link from 'next/link';

// アイコンの配列（順番に使用）
const iconArray = [Atom, Brain, Shield, Lightbulb, Cpu, Zap];
const colorArray = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-green-500 to-teal-500',
  'from-orange-500 to-red-500',
  'from-indigo-500 to-purple-500',
  'from-yellow-500 to-orange-500',
];

export function Research() {
  const { elementRef: titleRef, isVisible: titleVisible } =
    useScrollAnimation<HTMLHeadingElement>({ forceVisible: true });
  const { elementRef: descRef, isVisible: descVisible } =
    useScrollAnimation<HTMLParagraphElement>({ forceVisible: true });

  // 固定数のアニメーション用refを事前に作成（最大3つのテーマ用）
  const cardRefs = [
    useScrollAnimation<HTMLDivElement>(),
    useScrollAnimation<HTMLDivElement>(),
    useScrollAnimation<HTMLDivElement>(),
  ];

  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchThemes() {
      try {
        console.log('Research component: Starting to fetch themes...');
        setLoading(true);
        const themesData = await loadThemes();
        console.log('Research component: Received themes:', themesData);

        // 上位3つのテーマを取得
        const topThemes = themesData.slice(0, 3);
        setThemes(topThemes);
      } catch (err) {
        console.error('Research component: Error loading themes:', err);
        setError('Failed to load research themes');
      } finally {
        console.log('Research component: Finished loading');
        setLoading(false);
      }
    }

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
          ref={titleRef}
          className={`text-5xl font-bold text-white mb-6 transition-all duration-1000 ${
            titleVisible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-10 scale-95'
          }`}
        >
          Cutting-Edge Research
        </h2>
        <p
          ref={descRef}
          className={`text-xl text-gray-300 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
            descVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
          }`}
        >
          Our research spans multiple domains of advanced technology and
          computational methods, pushing the boundaries of what&apos;s possible
          in modern innovation.
        </p>
      </div>

      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
        {themes.length === 0 ? (
          <div className='col-span-full text-center text-gray-400'>
            <p>No research themes found</p>
          </div>
        ) : (
          themes.map((theme, index) => {
            const Icon = iconArray[index % iconArray.length];
            const color = colorArray[index % colorArray.length];
            const { elementRef: cardRef, isVisible: cardVisible } =
              cardRefs[index % cardRefs.length];

            // keyAchievementsを配列に変換
            const achievements = theme.keyAchievements
              ? theme.keyAchievements.split(',').map((item) => item.trim())
              : [
                  'Research in progress',
                  'Innovative approaches',
                  'Future developments',
                ];

            return (
              <div
                ref={cardRef}
                key={theme.id}
                className={`transition-all duration-1000 ${
                  cardVisible
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-20 scale-95'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <GlassCard className='p-8 h-full flex flex-col relative overflow-hidden group hover:scale-[1.02] transition-all duration-300'>
                  <div
                    className={`w-16 h-16 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className='w-8 h-8 text-white' />
                  </div>

                  <h3 className='text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300'>
                    {theme.nameJa}
                  </h3>

                  <p className='text-lg text-blue-400 mb-4'>{theme.nameEn}</p>

                  <p className='text-gray-300 mb-6 flex-grow'>{theme.descJa}</p>

                  {achievements.length > 0 && (
                    <div className='space-y-3 mb-6'>
                      <h4 className='text-lg font-semibold text-white'>
                        Key Achievements:
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

                  <Link href={`/theme/${theme.id}`}>
                    <Button
                      variant='outline'
                      className='border-white/30 text-white hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-300 w-full'
                    >
                      Learn More
                      <ExternalLink className='w-4 h-4 ml-2' />
                    </Button>
                  </Link>

                  {/* Subtle glow effect on hover */}
                  <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
                </GlassCard>
              </div>
            );
          })
        )}
      </div>
    </SectionWrapper>
  );
}
