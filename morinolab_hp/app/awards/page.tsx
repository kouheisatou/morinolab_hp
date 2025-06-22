'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import {
  Calendar,
  ArrowRight,
  Award,
  Trophy,
  Star,
  Medal,
  Home,
  ChevronRight,
} from 'lucide-react';
import { Award as AwardType, loadAwards } from '@/lib/client-content-loader';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AwardsPage() {
  const [awards, setAwards] = useState<AwardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAwards = async () => {
      try {
        const awardData = await loadAwards();
        // 日付でソート（新しい順）
        const sortedAwards = awardData.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        setAwards(sortedAwards);
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
      return {
        year: date.getFullYear().toString(),
        month: date.toLocaleDateString('ja-JP', { month: 'long' }),
        day: date.getDate(),
      };
    } catch {
      return {
        year: dateString,
        month: '',
        day: '',
      };
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen relative overflow-x-hidden bg-black'>
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
    <div className='min-h-screen relative overflow-x-hidden bg-black'>
      <ParticleBackground />
      <Navbar />

      <SectionWrapper className='py-32'>
        {/* パンくずリスト */}
        <div className='mb-8'>
          <nav className='flex items-center space-x-2 text-sm'>
            <Link
              href='/'
              className='flex items-center text-gray-400 hover:text-cyan-400 transition-colors duration-200'
            >
              <Home className='w-4 h-4 mr-1' />
              Home
            </Link>
            <ChevronRight className='w-4 h-4 text-gray-500' />
            <span className='text-white font-medium'>Awards</span>
          </nav>
        </div>

        <div className='text-center mb-16'>
          <h1 className='text-5xl font-bold text-white mb-6'>
            Awards & Recognition
          </h1>
          <p className='text-xl text-gray-300 max-w-3xl mx-auto'>
            Our research excellence has been recognized by prestigious
            organizations and institutions worldwide, highlighting our
            contributions to quantum computing.
          </p>
        </div>

        {/* タイムライン */}
        <div className='max-w-4xl mx-auto'>
          <div className='relative'>
            {/* タイムライン軸 */}
            <div className='absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-cyan-500 via-blue-500 to-purple-500'></div>

            {awards.map((award, index) => {
              const { icon: Icon, color } = getAwardStyle(index);
              const isEven = index % 2 === 0;
              const formattedDate = formatDate(award.date);

              // 年が変わったかどうかをチェック
              const isYearChange =
                index === 0 ||
                formatDate(awards[index - 1].date).year !== formattedDate.year;

              return (
                <div key={award.id} className='relative mb-16'>
                  {/* タイムライン上のドット */}
                  <div className='absolute left-1/2 transform -translate-x-1/2 -translate-y-1/2 top-8'>
                    <div className='w-4 h-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full border-4 border-black shadow-lg shadow-cyan-500/50'></div>
                  </div>

                  {/* 年表示（年が変わる時のみ） */}
                  {isYearChange && (
                    <div className='absolute left-1/2 transform -translate-x-1/2 -translate-y-full -top-2'>
                      <div className='bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-full text-lg font-bold shadow-lg border-2 border-white/20'>
                        {formattedDate.year}
                      </div>
                    </div>
                  )}

                  {/* タイムラインからカードへの横線 */}
                  <div
                    className={`absolute top-8 ${isEven ? 'right-1/2 translate-x-2' : 'left-1/2 -translate-x-2'} w-16 h-0.5 bg-gradient-to-r ${isEven ? 'from-transparent to-cyan-500' : 'from-cyan-500 to-transparent'}`}
                  ></div>

                  {/* 月表示（横線の上） */}
                  <div
                    className={`absolute top-6 ${isEven ? 'right-1/2 translate-x-4' : 'left-1/2 -translate-x-4'}`}
                  >
                    <div className='bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-md text-xs font-medium shadow-md'>
                      {formattedDate.month.replace('月', '')}月
                    </div>
                  </div>

                  {/* コンテンツ */}
                  <div
                    className={`flex ${isEven ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`w-5/12 ${isEven ? 'pr-8' : 'pl-8'}`}>
                      <GlassCard className='p-6 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300'>
                        {/* 吹き出しの三角形 */}
                        <div
                          className={`absolute top-8 ${isEven ? 'right-0 translate-x-full' : 'left-0 -translate-x-full'} w-0 h-0 border-t-8 border-b-8 border-transparent ${isEven ? 'border-l-8 border-l-white/10' : 'border-r-8 border-r-white/10'}`}
                        ></div>

                        <div className='flex items-start space-x-4'>
                          <div
                            className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                          >
                            <Icon className='w-6 h-6 text-white' />
                          </div>

                          <div className='flex-grow'>
                            {/* 日付詳細 */}
                            <div className='flex items-center space-x-2 mb-3'>
                              <Calendar className='w-4 h-4 text-gray-400' />
                              <span className='text-gray-400 text-sm'>
                                {formattedDate.month}{' '}
                                {formattedDate.day && formattedDate.day + ', '}
                                {formattedDate.year}
                              </span>
                            </div>

                            <h3 className='text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300'>
                              {award.nameJa}
                            </h3>

                            {award.nameEn && award.nameEn !== award.nameJa && (
                              <p className='text-cyan-400 text-sm mb-3 font-medium'>
                                {award.nameEn}
                              </p>
                            )}

                            <Link href={`/awards/${award.id}`}>
                              <Button
                                variant='outline'
                                size='sm'
                                className='border-white/30 text-white hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-300'
                              >
                                View Details
                                <ArrowRight className='w-4 h-4 ml-2' />
                              </Button>
                            </Link>
                          </div>
                        </div>

                        {/* ホバーエフェクト */}
                        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
                      </GlassCard>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {awards.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-gray-400 text-lg'>No awards found.</p>
          </div>
        )}
      </SectionWrapper>

      <Footer />
    </div>
  );
}
