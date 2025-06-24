'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import {
  Calendar,
  Award,
  Trophy,
  Star,
  Medal,
  Home,
  ChevronRight,
} from 'lucide-react';
import {
  Award as AwardType,
  loadAwards,
  loadTeamMembers,
  TeamMember,
  getStaticPath,
} from '@/lib/client-content-loader';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';
import { t } from '@/lib/i18n';

export default function AwardsPage() {
  const [awards, setAwards] = useState<AwardType[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocale();

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const [awardData, teamMembers] = await Promise.all([
          loadAwards(),
          loadTeamMembers(),
        ]);
        // 日付でソート（新しい順）
        const sortedAwards = awardData.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        setAwards(sortedAwards);
        setMembers(teamMembers);
      } catch (error) {
        console.error('Error loading awards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAwards();
  }, []);

  // アイコンとカラーを循環的に割り当て
  const getAwardStyle = (index: number) => {
    const styles = [
      { icon: Trophy, color: 'from-yellow-500 to-orange-500' },
      { icon: Star, color: 'from-blue-500 to-purple-500' },
      { icon: Medal, color: 'from-green-500 to-teal-500' },
      { icon: Award, color: 'from-pink-500 to-rose-500' },
    ];
    return styles[index % styles.length];
  };

  // 日付をフォーマット
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const localeStr = locale === 'ja' ? 'ja-JP' : 'en-US';
      const month = date.toLocaleDateString(localeStr, {
        month: 'long',
      });
      return {
        year: date.getFullYear().toString(),
        month,
        day: date.getDate(),
      };
    } catch {
      return { year: dateString, month: '', day: '' };
    }
  };

  // 受賞のメンバーを取得
  const getAwardMembers = (award: AwardType): TeamMember[] => {
    if (!award.memberIds || !members.length) return [];
    const memberIdList = award.memberIds.split(',').map((id) => id.trim());
    return members.filter((member) => memberIdList.includes(member.id));
  };

  if (loading) {
    return (
      <div className='min-h-screen relative overflow-x-hidden bg-gradient-to-br from-slate-900 to-slate-800'>
        <ParticleBackground />
        <Navbar />
        <SectionWrapper className='py-32'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto'></div>
            <p className='text-white mt-4'>Loading awards...</p>
          </div>
        </SectionWrapper>
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen relative overflow-x-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col'>
      <ParticleBackground />
      <Navbar />

      <main className='flex-1'>
        <SectionWrapper className='py-32'>
          {/* パンくずリスト */}
          <div className='mb-8 px-4'>
            <nav className='flex items-center space-x-2 text-xs sm:text-sm'>
              <Link
                href='/'
                className='flex items-center text-gray-400 hover:text-cyan-400 transition-colors duration-200'
              >
                <Home className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
                <span className='hidden sm:inline'>Home</span>
                <span className='sm:hidden'>ホーム</span>
              </Link>
              <ChevronRight className='w-3 h-3 sm:w-4 sm:h-4 text-gray-500' />
              <span className='text-white font-medium'>
                {locale === 'ja' ? '受賞' : 'Awards'}
              </span>
            </nav>
          </div>

          {/* Overview */}
          <div className='mb-24'>
            <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6'>
              {locale === 'ja' ? '受賞歴' : 'Awards & Recognition'}
            </h1>
          </div>

          {/* Timeline - Desktop & Mobile Views */}
          <div className='max-w-5xl mx-auto mt-8 px-4'>
            {/* Desktop Timeline View */}
            <div className='hidden lg:block relative'>
              {/* タイムライン軸 */}
              <div className='absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-cyan-500 via-blue-500 to-purple-500'></div>

              {awards.map((award, index) => {
                const { icon: Icon, color } = getAwardStyle(index);
                const isEven = index % 2 === 0;
                const formattedDate = formatDate(award.date);

                // 年が変わったかどうかをチェック
                const isYearChange =
                  index === 0 ||
                  formatDate(awards[index - 1].date).year !==
                    formattedDate.year;

                return (
                  <div key={award.id} className='relative mb-16'>
                    {/* タイムライン上のドット */}
                    <div className='absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                      <div className='w-4 h-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full border-4 border-black shadow-lg shadow-cyan-500/50'></div>
                    </div>

                    {/* タイムラインからカードへの横線 */}
                    <div
                      className={`absolute top-1/2 -translate-y-1/2 ${isEven ? 'right-1/2 translate-x-2' : 'left-1/2 -translate-x-2'} w-32 h-0.5 bg-gradient-to-r ${isEven ? 'from-transparent to-cyan-500' : 'from-cyan-500 to-transparent'}`}
                    ></div>

                    {/* コンテンツ */}
                    <div
                      className={`flex ${isEven ? 'justify-start' : 'justify-end'}`}
                    >
                      <div className={`w-5/12 ${isEven ? 'pr-8' : 'pl-8'}`}>
                        <Link
                          href={`/awards/${award.id}`}
                          className='block group'
                        >
                          <GlassCard className='p-6 relative overflow-hidden group-hover:scale-[1.02] transition-all duration-300'>
                            {/* 吹き出しの三角形 */}
                            <div
                              className={`absolute top-8 ${isEven ? 'right-0 translate-x-full' : 'left-0 -translate-x-full'} w-0 h-0 border-t-8 border-b-8 border-transparent ${isEven ? 'border-l-8 border-l-white/10' : 'border-r-8 border-r-white/10'}`}
                            ></div>

                            <div className='flex items-start space-x-4'>
                              <div className='w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform duration-300'>
                                <Image
                                  src={getStaticPath(
                                    `/generated_contents/award/${award.thumbnail || `${award.id}.jpg`}`
                                  )}
                                  alt={getLocalized(award, 'name', locale)}
                                  width={48}
                                  height={48}
                                  className='object-cover w-full h-full'
                                  onError={(e) => {
                                    const img =
                                      e.currentTarget as HTMLImageElement;
                                    img.src = getStaticPath(
                                      '/img/noimage_news.png'
                                    );
                                  }}
                                />
                              </div>

                              <div className='flex-grow'>
                                {/* 日付詳細 */}
                                <div className='flex items-center space-x-2 mb-3'>
                                  <Calendar className='w-4 h-4 text-gray-400' />
                                  <span className='text-gray-400 text-sm'>
                                    {formattedDate.month}{' '}
                                    {formattedDate.day &&
                                      formattedDate.day + ', '}
                                    {formattedDate.year}
                                  </span>
                                </div>

                                <h3 className='text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300'>
                                  {getLocalized(award, 'name', locale)}
                                </h3>

                                {/* メンバー情報 */}
                                {(() => {
                                  const awardMembers = getAwardMembers(award);
                                  if (awardMembers.length > 0) {
                                    return (
                                      <div className='mb-0'>
                                        <div className='flex items-center flex-wrap gap-2'>
                                          {awardMembers
                                            .slice(0, 2)
                                            .map((member) => (
                                              <span
                                                key={member.id}
                                                className='px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 rounded-full text-xs border border-blue-400/30 whitespace-nowrap overflow-hidden text-ellipsis'
                                              >
                                                {getLocalized(
                                                  member,
                                                  'name',
                                                  locale
                                                )}
                                              </span>
                                            ))}
                                          {awardMembers.length > 2 && (
                                            <span className='px-2 py-1 bg-gray-600/20 text-gray-400 rounded-full text-xs'>
                                              +{awardMembers.length - 2}
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

                            {/* ホバーエフェクト */}
                            <div className='pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
                          </GlassCard>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile & Tablet View */}
            <div className='lg:hidden'>
              <div className='space-y-6'>
                {awards.map((award, index) => {
                  const { icon: Icon, color } = getAwardStyle(index);
                  const formattedDate = formatDate(award.date);

                  // 年が変わったかどうかをチェック
                  const isYearChange =
                    index === 0 ||
                    formatDate(awards[index - 1].date).year !==
                      formattedDate.year;

                  return (
                    <div key={award.id} className='relative'>
                      <Link
                        href={`/awards/${award.id}`}
                        className='block group'
                      >
                        <GlassCard className='p-4 sm:p-6 relative overflow-hidden group-hover:scale-[1.02] transition-all duration-300'>
                          <div className='flex items-start space-x-3 sm:space-x-4'>
                            {/* アワードアイコン/画像 */}
                            <div className='flex-shrink-0'>
                              <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden group-hover:scale-110 transition-transform duration-300'>
                                <Image
                                  src={getStaticPath(
                                    `/generated_contents/award/${award.thumbnail || `${award.id}.jpg`}`
                                  )}
                                  alt={getLocalized(award, 'name', locale)}
                                  width={48}
                                  height={48}
                                  className='object-cover w-full h-full'
                                  onError={(e) => {
                                    const img =
                                      e.currentTarget as HTMLImageElement;
                                    img.src = getStaticPath(
                                      '/img/noimage_news.png'
                                    );
                                  }}
                                />
                              </div>
                            </div>

                            <div className='flex-grow min-w-0'>
                              {/* 日付 */}
                              <div className='flex items-center space-x-2 mb-2'>
                                <Calendar className='w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0' />
                                <span className='text-gray-400 text-xs sm:text-sm'>
                                  {formattedDate.month}{' '}
                                  {formattedDate.day &&
                                    formattedDate.day + ', '}
                                  {formattedDate.year}
                                </span>
                              </div>

                              {/* タイトル */}
                              <h3 className='text-lg sm:text-xl font-bold text-white mb-3 leading-tight group-hover:text-cyan-400 transition-colors duration-300'>
                                {getLocalized(award, 'name', locale)}
                              </h3>

                              {/* メンバー情報 */}
                              {(() => {
                                const awardMembers = getAwardMembers(award);
                                if (awardMembers.length > 0) {
                                  return (
                                    <div className='mb-0'>
                                      <div className='flex items-center flex-wrap gap-2'>
                                        {awardMembers
                                          .slice(0, 2)
                                          .map((member) => (
                                            <span
                                              key={member.id}
                                              className='px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 rounded-full text-xs border border-blue-400/30 whitespace-nowrap overflow-hidden text-ellipsis'
                                            >
                                              {getLocalized(
                                                member,
                                                'name',
                                                locale
                                              )}
                                            </span>
                                          ))}
                                        {awardMembers.length > 2 && (
                                          <span className='px-2 py-1 bg-gray-600/20 text-gray-400 rounded-full text-xs'>
                                            +{awardMembers.length - 2}
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

                          {/* ホバーエフェクト */}
                          <div className='pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
                        </GlassCard>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {awards.length === 0 && (
            <div className='text-center py-12'>
              <p className='text-gray-400 text-lg'>No awards found.</p>
            </div>
          )}
        </SectionWrapper>
      </main>

      <Footer />
    </div>
  );
}
