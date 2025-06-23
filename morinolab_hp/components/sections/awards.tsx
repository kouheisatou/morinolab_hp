'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { Award, Calendar, Trophy, Star, Medal } from 'lucide-react';
import Link from 'next/link';
import {
  useFadeInAnimation,
  useStaggeredFadeIn,
} from '@/hooks/use-fade-in-animation';
import { useState, useEffect } from 'react';
import {
  loadAwards,
  Award as AwardType,
  loadTeamMembers,
  TeamMember,
} from '@/lib/client-content-loader';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';

export function Awards() {
  const titleAnimation = useFadeInAnimation<HTMLHeadingElement>({
    delay: 100,
    duration: 1000,
  });
  const descAnimation = useFadeInAnimation<HTMLParagraphElement>({
    delay: 300,
    duration: 1000,
  });
  const buttonAnimation = useFadeInAnimation<HTMLDivElement>({
    delay: 800,
    duration: 800,
  });

  // 固定数のアニメーション用refを事前に作成（最大4件表示）
  const cardAnimations = useStaggeredFadeIn<HTMLDivElement>(4, 500, 150);

  const [awards, setAwards] = useState<AwardType[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { locale } = useLocale();

  useEffect(() => {
    const fetchAwardsData = async () => {
      try {
        console.log('Awards component: Starting to fetch awards data...');
        setLoading(true);
        const [items, teamMembers] = await Promise.all([
          loadAwards(),
          loadTeamMembers(),
        ]);
        console.log('Awards component: Received items:', items);
        console.log('Awards component: Received members:', teamMembers);
        // 最新の4件のみ表示
        const slicedItems = items.slice(0, 4);
        setAwards(slicedItems);
        setMembers(teamMembers);
      } catch (err) {
        console.error('Awards component: Error loading awards:', err);
        setError('Failed to load awards data');
      } finally {
        console.log('Awards component: Finished loading');
        setLoading(false);
      }
    };

    fetchAwardsData();
  }, []);

  const getIconAndColor = (index: number) => {
    const configs = [
      { icon: Trophy, color: 'from-yellow-500 to-orange-500' },
      { icon: Award, color: 'from-purple-500 to-pink-500' },
      { icon: Star, color: 'from-blue-500 to-cyan-500' },
      { icon: Medal, color: 'from-green-500 to-emerald-500' },
    ];
    return configs[index % configs.length];
  };

  const getAwardMembers = (award: AwardType): TeamMember[] => {
    if (!award.memberIds || !members.length) return [];
    const memberIdList = award.memberIds.split(',').map((id) => id.trim());
    return members.filter((member) => memberIdList.includes(member.id));
  };

  if (loading) {
    return (
      <SectionWrapper id='awards' className='py-32'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto'></div>
          <p className='text-white mt-4'>
            {locale === 'ja' ? '受賞歴を読み込み中...' : 'Loading awards...'}
          </p>
        </div>
      </SectionWrapper>
    );
  }

  if (error) {
    return (
      <SectionWrapper id='awards' className='py-32'>
        <div className='text-center'>
          <p className='text-red-400'>{error}</p>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper id='awards' className='py-32'>
      <div className='text-center mb-16'>
        <h2
          ref={titleAnimation.ref}
          style={titleAnimation.style}
          className='text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6'
        >
          {locale === 'ja' ? '受賞歴' : 'Awards & Recognition'}
        </h2>
        <p
          ref={descAnimation.ref}
          style={descAnimation.style}
          className='text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto px-4'
        >
          {locale === 'ja'
            ? '学術界・研究コミュニティからの受賞と評価をご紹介します。'
            : 'Celebrating our achievements and recognition from the academic and research community.'}
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 px-4 auto-rows-[1fr]'>
        {awards.length === 0 ? (
          <div className='col-span-full text-center text-gray-400'>
            <p>
              {locale === 'ja' ? '受賞が見つかりません' : 'No awards found'}
            </p>
          </div>
        ) : (
          awards.map((award, index) => {
            const { icon: Icon, color } = getIconAndColor(index);
            // 事前に作成したrefを使用
            const cardAnimation = cardAnimations[index] || cardAnimations[0];

            return (
              <div
                ref={cardAnimation.ref}
                style={cardAnimation.style}
                key={award.id}
              >
                <Link href={`/awards/${award.id}`} className='block group'>
                  <GlassCard className='p-4 sm:p-6 lg:p-8 h-full flex flex-col relative overflow-hidden group-hover:scale-[1.02] transition-all duration-300'>
                    <div className='flex items-start space-x-3 sm:space-x-4'>
                      <div
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className='w-5 h-5 sm:w-6 sm:h-6 text-white' />
                      </div>

                      <div className='flex flex-col min-w-0'>
                        <div className='flex items-center space-x-2 mb-2 sm:mb-3'>
                          <Calendar className='w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0' />
                          <span className='text-gray-400 text-xs sm:text-sm'>
                            {award.date}
                          </span>
                        </div>

                        <h3 className='text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 leading-tight group-hover:text-cyan-400 transition-colors duration-300'>
                          {getLocalized(award, 'name', locale)}
                        </h3>

                        {locale === 'en' &&
                          award.nameEn &&
                          award.nameEn !== award.nameJa && (
                            <p className='text-gray-300 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base'>
                              {award.nameEn}
                            </p>
                          )}

                        {/* メンバー情報 */}
                        {(() => {
                          const awardMembers = getAwardMembers(award);
                          if (awardMembers.length > 0) {
                            return (
                              <div className='mb-0'>
                                <div className='flex items-center flex-wrap gap-2'>
                                  {awardMembers.slice(0, 3).map((member) => (
                                    <span
                                      key={member.id}
                                      className='px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 rounded-full text-xs border border-blue-400/30 whitespace-nowrap overflow-hidden text-ellipsis'
                                    >
                                      {getLocalized(member, 'name', locale)}
                                    </span>
                                  ))}
                                  {awardMembers.length > 3 && (
                                    <span className='px-2 py-1 bg-gray-600/20 text-gray-400 rounded-full text-xs'>
                                      +{awardMembers.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
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
        ref={buttonAnimation.ref}
        style={buttonAnimation.style}
        className='text-center mt-8 sm:mt-12 px-4'
      >
        <Link href='/awards'>
          <Button
            size='lg'
            className='bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold w-full sm:w-auto'
          >
            {locale === 'ja' ? 'すべての受賞を見る' : 'View All Awards'}
          </Button>
        </Link>
      </div>
    </SectionWrapper>
  );
}
