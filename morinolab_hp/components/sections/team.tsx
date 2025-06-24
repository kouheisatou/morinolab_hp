'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { Users, ExternalLink, Mail, User, GraduationCap } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  useFadeInAnimation,
  useStaggeredFadeIn,
} from '@/hooks/use-fade-in-animation';
import { useState, useEffect, useRef } from 'react';
import {
  loadTeamMembers,
  loadTags,
  TeamMember,
  Tag,
  getStaticPath,
} from '@/lib/client-content-loader';
import Image from 'next/image';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';

export function Team() {
  const { elementRef: titleRef, isVisible: titleVisible } =
    useFadeInAnimation<HTMLHeadingElement>({ forceVisible: true });
  const { elementRef: descRef, isVisible: descVisible } =
    useFadeInAnimation<HTMLParagraphElement>({ forceVisible: true });
  const { elementRef: professorRef, isVisible: professorVisible } =
    useFadeInAnimation<HTMLDivElement>({ forceVisible: true });
  const { elementRef: buttonRef, isVisible: buttonVisible } =
    useFadeInAnimation<HTMLDivElement>();

  // 固定数のアニメーション用refを事前に作成
  const cardRefs = [
    useFadeInAnimation<HTMLDivElement>(),
    useFadeInAnimation<HTMLDivElement>(),
    useFadeInAnimation<HTMLDivElement>(),
    useFadeInAnimation<HTMLDivElement>(),
    useFadeInAnimation<HTMLDivElement>(),
    useFadeInAnimation<HTMLDivElement>(),
  ];

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [professor, setProfessor] = useState<TeamMember | null>(null);
  const [students, setStudents] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { locale } = useLocale();

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        console.log('Team component: Starting to fetch team data...');
        setLoading(true);
        const [members, tagsData] = await Promise.all([
          loadTeamMembers(),
          loadTags(),
        ]);
        console.log('Team component: Received members:', members);
        console.log('Team component: Received tags:', tagsData);

        // 先生は別途表示し、学生を6名まで表示
        const professor = members.find((member) => member.memberTypeId === '1');
        const students = members
          .filter((member) => member.memberTypeId !== '1')
          .slice(0, 6);

        setTeamMembers(members);
        setTags(tagsData);
        setProfessor(professor || null);
        setStudents(students);
      } catch (err) {
        console.error('Team component: Error loading team:', err);
        setError('Failed to load team data');
      } finally {
        console.log('Team component: Finished loading');
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  // タグ名を取得するヘルパー関数
  const getTagName = (tagId: string) => {
    const tag = tags.find((t) => t.id === tagId);
    return tag ? getLocalized(tag, 'name', locale) : `Tag #${tagId}`;
  };

  if (loading) {
    return (
      <SectionWrapper id='team' className='py-32'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto'></div>
          <p className='text-white mt-4'>
            {locale === 'ja' ? 'メンバーを読み込み中...' : 'Loading team...'}
          </p>
        </div>
      </SectionWrapper>
    );
  }

  if (error) {
    return (
      <SectionWrapper id='team' className='py-32'>
        <div className='text-center'>
          <p className='text-red-400'>{error}</p>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper id='team' className='py-32'>
      <div className='text-center mb-16'>
        <h2
          ref={titleRef}
          className={`text-5xl font-bold text-white mb-6 transition-all duration-1000 ${
            titleVisible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-10 scale-95'
          }`}
        >
          {locale === 'ja' ? '研究チーム' : 'Our Research Team'}
        </h2>
      </div>

      {/* Professor Section */}
      {professor && (
        <div className='mb-16'>
          <h3 className='text-3xl font-bold text-white text-center mb-8'>
            {locale === 'ja' ? '教授' : 'Principal Investigator'}
          </h3>
          <div
            ref={professorRef}
            className={`max-w-md mx-auto transition-all duration-1000 delay-400 ${
              professorVisible
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-10 scale-95'
            }`}
          >
            <GlassCard className='p-8 text-center group hover:scale-105 transition-all duration-300 relative overflow-hidden'>
              <div className='relative mb-6'>
                <Avatar className='w-32 h-32 mx-auto border-4 border-white/20 group-hover:border-cyan-400/50 transition-colors duration-300'>
                  <AvatarImage
                    src={getStaticPath(
                      `/generated_contents/member/${professor.id}.jpg`
                    )}
                    alt={getLocalized(professor, 'name', locale)}
                    className='object-cover'
                  />
                  <AvatarFallback className='text-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white'>
                    {getLocalized(professor, 'name', locale).slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>

              <h3 className='text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300'>
                {getLocalized(professor, 'name', locale)}
              </h3>

              {/* Professor Description */}
              <p className='text-gray-300 text-sm mb-4 leading-relaxed'>
                {getLocalized(professor, 'desc', locale)}
              </p>

              {/* Professor Tags */}
              <div className='flex flex-wrap gap-1 justify-center mb-4'>
                {professor.tagIds
                  .split(',')
                  .slice(0, 3)
                  .map((tagId, index) => (
                    <span
                      key={index}
                      className='px-2 py-1 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-700 rounded-full text-xs border border-cyan-400/30'
                    >
                      {getTagName(tagId.trim())}
                    </span>
                  ))}
                {professor.tagIds.split(',').length > 3 && (
                  <span className='px-2 py-1 bg-gray-600/20 text-gray-400 rounded-full text-xs'>
                    +{professor.tagIds.split(',').length - 3}
                  </span>
                )}
              </div>

              {/* Subtle glow effect on hover */}
              <div className='pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />

              <Link href={`/team/${professor.id}`}>
                <Button
                  variant='outline'
                  size='sm'
                  className='transition-all duration-300'
                >
                  {locale === 'ja' ? 'プロフィールを見る' : 'View Profile'}
                  <ExternalLink className='w-4 h-4 ml-2' />
                </Button>
              </Link>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Students Section */}
      <div>
        <h3 className='text-3xl font-bold text-white text-center mb-12'>
          {locale === 'ja' ? '研究メンバー' : 'Research Team'}
        </h3>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-[1fr]'>
          {students.length === 0 ? (
            <div className='col-span-full text-center text-gray-400'>
              <p>
                {locale === 'ja'
                  ? 'メンバーが見つかりません'
                  : 'No team members found'}
              </p>
            </div>
          ) : (
            students.map((member, index) => {
              // 事前に作成したrefを使用
              const { elementRef: cardRef, isVisible: cardVisible } = cardRefs[
                index
              ] || { elementRef: null, isVisible: true };

              return (
                <div
                  ref={cardRef}
                  key={member.id}
                  className={`transition-all duration-1000 ${
                    cardVisible
                      ? 'opacity-100 translate-y-0 rotate-0'
                      : 'opacity-0 translate-y-16 scale-95'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <GlassCard className='p-6 h-full flex flex-col text-center group hover:scale-105 transition-all duration-300 relative overflow-hidden'>
                    <div className='relative mb-4'>
                      <Avatar className='w-20 h-20 mx-auto border-2 border-white/20 group-hover:border-cyan-400/50 transition-colors duration-300'>
                        <AvatarImage
                          src={getStaticPath(
                            `/generated_contents/member/${member.id}.jpg`
                          )}
                          alt={getLocalized(member, 'name', locale)}
                          className='object-cover'
                        />
                        <AvatarFallback className='text-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white'>
                          {getLocalized(member, 'name', locale).slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    <h3 className='text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300'>
                      {getLocalized(member, 'name', locale)}
                    </h3>

                    <p className='text-gray-300 text-sm mb-4 leading-relaxed flex-grow'>
                      {getLocalized(member, 'desc', locale)}
                    </p>

                    <div className='flex flex-wrap gap-1 justify-center mb-4'>
                      {member.tagIds
                        .split(',')
                        .slice(0, 2)
                        .map((tagId, index) => (
                          <span
                            key={index}
                            className='px-2 py-1 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-700 rounded-full text-xs border border-cyan-400/30'
                          >
                            {getTagName(tagId.trim())}
                          </span>
                        ))}
                      {member.tagIds.split(',').length > 2 && (
                        <span className='px-2 py-1 bg-gray-600/20 text-gray-400 rounded-full text-xs'>
                          +{member.tagIds.split(',').length - 2}
                        </span>
                      )}
                    </div>

                    {/* Subtle glow effect on hover */}
                    <div className='pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
                  </GlassCard>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div
        ref={buttonRef}
        className={`text-center mt-12 transition-all duration-1000 delay-1000 ${
          buttonVisible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-8 scale-95'
        }`}
      >
        <Link href='/team'>
          <Button
            size='lg'
            className='bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 text-lg font-semibold'
          >
            {locale === 'ja' ? '全メンバーを見る' : 'Meet Full Team'}
          </Button>
        </Link>
      </div>
    </SectionWrapper>
  );
}
