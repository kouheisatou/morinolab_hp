'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Calendar, Tags, Home, ChevronRight } from 'lucide-react';
import {
  TeamMember,
  MemberType,
  Tag,
  loadTeamMemberDetail,
  loadMemberTypes,
  loadTags,
  getStaticPath,
} from '@/lib/client-content-loader';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';

interface ClientPageProps {
  id: string;
}

export default function TeamMemberDetailClientPage({ id }: ClientPageProps) {
  const [member, setMember] = useState<TeamMember | null>(null);
  const [memberTypes, setMemberTypes] = useState<MemberType[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocale();

  useEffect(() => {
    if (id) {
      const fetchTeamMemberDetail = async () => {
        try {
          const [memberDetail, memberTypesData, tagsData] = await Promise.all([
            loadTeamMemberDetail(id),
            loadMemberTypes(),
            loadTags(),
          ]);
          setMember(memberDetail);
          setMemberTypes(memberTypesData);
          setTags(tagsData);
        } catch (error) {
          console.error('Error loading team member detail:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchTeamMemberDetail();
    }
  }, [id]);

  if (loading) {
    return (
      <div className='min-h-screen relative overflow-x-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col'>
        <ParticleBackground />
        <Navbar />
        <main className='flex-1'>
          <SectionWrapper className='py-32'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto'></div>
              <p className='text-white mt-4'>Loading...</p>
            </div>
          </SectionWrapper>
        </main>
        <Footer />
      </div>
    );
  }

  if (!member) {
    return (
      <div className='min-h-screen relative overflow-x-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col'>
        <ParticleBackground />
        <Navbar />
        <main className='flex-1'>
          <SectionWrapper className='py-32'>
            <div className='text-center'>
              <h1 className='text-4xl font-bold text-white mb-4'>
                Member Not Found
              </h1>
              <p className='text-gray-300 mb-8'>
                The requested team member could not be found.
              </p>
            </div>
          </SectionWrapper>
        </main>
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
          <div className='max-w-4xl mx-auto'>
            {/* パンくずリスト */}
            <div className='mb-8'>
              <nav className='flex items-center space-x-2 text-sm mb-6'>
                <Link
                  href='/'
                  className='flex items-center text-gray-400 hover:text-cyan-400 transition-colors duration-200'
                >
                  <Home className='w-4 h-4 mr-1' />
                  Home
                </Link>
                <ChevronRight className='w-4 h-4 text-gray-500' />
                <Link
                  href='/team'
                  className='text-gray-400 hover:text-cyan-400 transition-colors duration-200'
                >
                  Team
                </Link>
                <ChevronRight className='w-4 h-4 text-gray-500' />
                <span className='text-white font-medium'>
                  {getLocalized(member, 'name', locale)}
                </span>
              </nav>
            </div>

            {/* Member Profile Container */}
            <div className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden'>
              {/* Header Section */}
              <div className='relative bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-8 md:p-12'>
                <div className='flex flex-col md:flex-row items-center md:items-start gap-8'>
                  {/* Avatar */}
                  <div className='flex-shrink-0'>
                    <Avatar className='w-32 h-32 md:w-40 md:h-40 ring-4 ring-white/20'>
                      <AvatarImage
                        src={getStaticPath(
                          `/generated_contents/member/${member.id}.jpg`
                        )}
                        alt={member.nameJa}
                        onError={(e) => {
                          e.currentTarget.src = '/img/noimage_campany.svg';
                        }}
                      />
                      <AvatarFallback className='bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-2xl'>
                        <User className='w-16 h-16' />
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Basic Info */}
                  <div className='flex-1 text-center md:text-left'>
                    <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3'>
                      {getLocalized(member, 'name', locale)}
                    </h1>

                    <div className='flex flex-col sm:flex-row justify-center md:justify-start gap-4 text-gray-300'>
                      <div className='flex items-center justify-center md:justify-start space-x-2'>
                        <User className='w-4 h-4 text-cyan-400' />
                        <span>
                          {(() => {
                            const type = memberTypes.find(
                              (t) => t.id === member.memberTypeId
                            );
                            return type
                              ? getLocalized(type, 'name', locale)
                              : member.memberTypeId;
                          })()}
                        </span>
                      </div>
                      {member.gradYear && (
                        <div className='flex items-center justify-center md:justify-start space-x-2'>
                          <Calendar className='w-4 h-4 text-cyan-400' />
                          <span>Graduation: {member.gradYear}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className='p-8 md:p-12 space-y-12'>
                <div>
                  <h2 className='text-2xl font-bold text-foreground mb-4 border-b border-cyan-400/30 pb-2'>
                    {locale === 'ja' ? 'プロフィール' : 'Profile'}
                  </h2>
                  <p className='text-gray-700 leading-relaxed text-lg'>
                    {getLocalized(member, 'desc', locale)}
                  </p>
                </div>

                {/* Research Tags */}
                {member.tagIds && (
                  <div>
                    <div className='flex items-center space-x-2 mb-6'>
                      <Tags className='w-6 h-6 text-cyan-400' />
                      <h2 className='text-2xl font-bold text-foreground'>
                        {locale === 'ja' ? '研究分野' : 'Research Areas'}
                      </h2>
                    </div>
                    <div className='flex flex-wrap gap-3'>
                      {member.tagIds.split(',').map((tagIdRaw, index) => {
                        const tagId = tagIdRaw.trim();
                        const tag = tags.find((t) => t.id === tagId);
                        const tagName = tag
                          ? getLocalized(tag, 'name', locale)
                          : `Tag #${tagId}`;
                        return (
                          <span
                            key={index}
                            className='px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-cyan-400 rounded-full border border-cyan-400/30 font-medium'
                          >
                            {tagName}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Additional Content */}
                {member.content && (
                  <div>
                    <h2 className='text-2xl font-bold text-foreground mb-6 border-b border-cyan-400/30 pb-2'>
                      詳細情報
                    </h2>
                    <div
                      className='prose prose-lg max-w-none prose-headings:text-foreground prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-6 prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-4 prose-h3:text-xl prose-h3:font-medium'
                      dangerouslySetInnerHTML={{
                        __html: member.content,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </SectionWrapper>
      </main>

      <Footer />
    </div>
  );
}
