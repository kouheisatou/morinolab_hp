'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
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
  loadAwardDetail,
  getStaticPath,
  loadTeamMembers,
  TeamMember,
} from '@/lib/client-content-loader';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';

interface ClientPageProps {
  id: string;
}

export default function AwardDetailClientPage({ id }: ClientPageProps) {
  const [award, setAward] = useState<AwardType | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocale();

  useEffect(() => {
    const fetchAward = async () => {
      try {
        const [awardData, teamMembers] = await Promise.all([
          loadAwardDetail(id),
          loadTeamMembers(),
        ]);
        setAward(awardData);
        setMembers(teamMembers);
      } catch (error) {
        console.error('Error loading award:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAward();
    }
  }, [id]);

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

  // 受賞のメンバーを取得
  const getAwardMembers = (award: AwardType): TeamMember[] => {
    if (!award.memberIds || !members.length) return [];
    const memberIdList = award.memberIds.split(',').map((id) => id.trim());
    return members.filter((member) => memberIdList.includes(member.id));
  };

  if (loading) {
    return (
      <div className='min-h-screen relative overflow-x-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col'>
        <ParticleBackground />
        <Navbar />
        <main className='flex-1'>
          <SectionWrapper className='py-32'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto'></div>
              <p className='text-white mt-4'>Loading award...</p>
            </div>
          </SectionWrapper>
        </main>
        <Footer />
      </div>
    );
  }

  if (!award) {
    return (
      <div className='min-h-screen relative overflow-x-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col'>
        <ParticleBackground />
        <Navbar />
        <main className='flex-1'>
          <SectionWrapper className='py-32'>
            <div className='text-center'>
              <h1 className='text-4xl font-bold text-white mb-4'>
                Award Not Found
              </h1>
              <p className='text-gray-400 mb-8'>
                The requested award could not be found.
              </p>
            </div>
          </SectionWrapper>
        </main>
        <Footer />
      </div>
    );
  }

  const { icon: Icon, color } = getAwardStyle(parseInt(award.id) || 0);

  return (
    <div className='min-h-screen relative overflow-x-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col'>
      <ParticleBackground />
      <Navbar />

      <main className='flex-1'>
        <SectionWrapper className='py-32'>
          {/* パンくずリスト */}
          <div className='mb-8 px-4'>
            <nav className='flex items-center space-x-2 text-xs sm:text-sm mb-6'>
              <Link
                href='/'
                className='flex items-center text-gray-400 hover:text-cyan-400 transition-colors duration-200'
              >
                <Home className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
                <span className='hidden sm:inline'>Home</span>
                <span className='sm:hidden'>ホーム</span>
              </Link>
              <ChevronRight className='w-3 h-3 sm:w-4 sm:h-4 text-gray-500' />
              <Link
                href='/awards'
                className='text-gray-400 hover:text-cyan-400 transition-colors duration-200'
              >
                <span className='hidden sm:inline'>Awards</span>
                <span className='sm:hidden'>受賞</span>
              </Link>
              <ChevronRight className='w-3 h-3 sm:w-4 sm:h-4 text-gray-500' />
              <span className='text-white font-medium truncate max-w-[150px] sm:max-w-none'>
                {getLocalized(award, 'name', locale)}
              </span>
            </nav>
          </div>

          {/* Award Container */}
          <article className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden mx-4'>
            {/* Header Section */}
            <div className='relative bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-4 sm:p-6 md:p-8 lg:p-12'>
              <div className='flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6'>
                <div
                  className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className='w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white' />
                </div>
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center space-x-2 mb-3 sm:mb-4'>
                    <Calendar className='w-3 h-3 sm:w-4 sm:h-4 text-cyan-400 flex-shrink-0' />
                    <time className='text-cyan-400 text-xs sm:text-sm font-medium'>
                      {new Date(award.date).toLocaleDateString(
                        locale === 'ja' ? 'ja-JP' : 'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }
                      )}
                    </time>
                  </div>

                  <h1 className='text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 leading-tight'>
                    {getLocalized(award, 'name', locale)}
                  </h1>

                  {/* メンバー情報 */}
                  {(() => {
                    const awardMembers = getAwardMembers(award);
                    if (awardMembers.length > 0) {
                      return (
                        <div className='mt-4'>
                          <div className='flex items-center flex-wrap gap-2'>
                            <span className='text-gray-400 text-xs sm:text-sm flex-shrink-0'>
                              {locale === 'ja' ? '受賞者:' : 'Recipients:'}
                            </span>
                            {awardMembers.map((member) => (
                              <span
                                key={member.id}
                                className='px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 rounded-full text-xs border border-blue-400/30'
                              >
                                {getLocalized(member, 'name', locale)}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className='relative h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden'>
              <Image
                src={getStaticPath(
                  `/generated_contents/award/${award.thumbnail}`
                )}
                alt={award.nameJa}
                fill
                className='object-cover'
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = getStaticPath('/img/noimage_news.png');
                }}
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />
            </div>

            {/* Content Section */}
            <div className='p-4 sm:p-6 md:p-8 lg:p-12'>
              <div
                className='prose prose-sm sm:prose-base lg:prose-lg prose-invert max-w-none prose-headings:text-white prose-h1:text-xl prose-h1:sm:text-2xl prose-h1:lg:text-3xl prose-h1:font-bold prose-h1:mb-4 prose-h1:sm:mb-6 prose-h2:text-lg prose-h2:sm:text-xl prose-h2:lg:text-2xl prose-h2:font-semibold prose-h2:mb-3 prose-h2:sm:mb-4 prose-h3:text-base prose-h3:sm:text-lg prose-h3:lg:text-xl prose-h3:font-medium prose-h3:mb-2 prose-h3:sm:mb-3 prose-p:text-gray-200 prose-p:leading-relaxed prose-p:mb-3 prose-p:sm:mb-4 prose-ul:text-gray-200 prose-li:text-gray-200 prose-li:mb-1 prose-li:sm:mb-2 prose-strong:text-white prose-em:text-gray-300 prose-img:rounded-lg prose-img:shadow-lg'
                dangerouslySetInnerHTML={{
                  __html:
                    award.content ||
                    '<p class="text-gray-400">No content available.</p>',
                }}
              />
            </div>
          </article>
        </SectionWrapper>
      </main>

      <Footer />
    </div>
  );
}
