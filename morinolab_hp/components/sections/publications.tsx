'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { ScrollAwareLink } from '@/components/ui/ScrollAwareLink';
import {
  useFadeInAnimation,
  useStaggeredFadeIn,
} from '@/hooks/use-fade-in-animation';
import { useState, useEffect } from 'react';
import {
  loadPublications,
  Publication,
  loadTeamMembers,
  TeamMember,
  getStaticPath,
} from '@/lib/client-content-loader';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';
import Image from 'next/image';

export function Publications() {
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
  const buttonAnimation = useFadeInAnimation<HTMLDivElement>({
    delay: 300,
    duration: 800,
    translateY: 40,
    rootMargin: '0px 0px -50px 0px',
  });

  // 固定数のアニメーション用refを事前に作成（最大4件表示）
  const cardAnimations = useStaggeredFadeIn<HTMLDivElement>(4, 500, 150, {
    duration: 800,
    translateY: 35,
    scale: 0.95,
  });

  const [publications, setPublications] = useState<Publication[]>([]);
  const [members, setMembers] = useState<Record<string, TeamMember>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { locale } = useLocale();

  useEffect(() => {
    const fetchPublicationsData = async () => {
      try {
        setLoading(true);
        const [items, memberItems] = await Promise.all([
          loadPublications(),
          loadTeamMembers(),
        ]);
        // 最新の4件のみ表示
        const slicedItems = items.slice(0, 4);
        setPublications(slicedItems);

        // メンバーをマップ化
        const memberMap: Record<string, TeamMember> = {};
        memberItems.forEach((m) => {
          memberMap[m.id] = m;
        });
        setMembers(memberMap);
      } catch (err) {
        console.error(
          'Publications component: Error loading publications:',
          err
        );
        setError('Failed to load publications data');
      } finally {
        setLoading(false);
      }
    };

    fetchPublicationsData();
  }, []);

  if (loading) {
    return (
      <SectionWrapper id='publications' className='py-32'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto'></div>
          <p className='text-white mt-4'>
            {locale === 'ja'
              ? '論文を読み込み中...'
              : 'Loading publications...'}
          </p>
        </div>
      </SectionWrapper>
    );
  }

  if (error) {
    return (
      <SectionWrapper id='publications' className='py-32'>
        <div className='text-center'>
          <p className='text-red-400'>{error}</p>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper id='publications' className='py-32'>
      <div className='text-center mb-16'>
        <h2
          ref={titleAnimation.ref}
          style={titleAnimation.style}
          className='text-5xl font-bold text-white mb-6'
        >
          {locale === 'ja' ? '論文' : 'Publications'}
        </h2>
      </div>

      <div className='grid md:grid-cols-2 xl:grid-cols-3 gap-8 auto-rows-[1fr]'>
        {publications.length === 0 ? (
          <div className='col-span-2 text-center text-gray-400'>
            <p>
              {locale === 'ja'
                ? '論文が見つかりません'
                : 'No publications found'}
            </p>
          </div>
        ) : (
          publications.map((publication, index) => {
            // 事前に作成したrefを使用
            const cardAnimation = cardAnimations[index] || cardAnimations[0];

            return (
              <div
                ref={cardAnimation.ref}
                style={cardAnimation.style}
                key={publication.id}
              >
                <ScrollAwareLink
                  href={`/publications/${publication.id}`}
                  className='block group'
                >
                  <GlassCard className='relative overflow-hidden group-hover:scale-[1.02] transition-all duration-300 flex flex-col h-full'>
                    {/* Header Image */}
                    <div className='relative w-full h-32 sm:h-40 lg:h-48 overflow-hidden'>
                      <Image
                        src={getStaticPath(
                          `/generated_contents/publication/${publication.id}.jpg`
                        )}
                        alt={getLocalized(publication, 'title', locale)}
                        fill
                        className='object-cover object-center transition-transform duration-500 group-hover:scale-110'
                        sizes='(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw'
                      />

                      {/* Category Label */}
                      <span className='absolute top-2 left-2 bg-black/50 backdrop-blur-sm text-xs text-white px-2 py-0.5 rounded'>
                        Journal
                      </span>
                    </div>

                    {/* Content */}
                    <div className='p-8 flex flex-col gap-3 flex-1'>
                      {/* Title */}
                      <h3 className='text-lg sm:text-xl font-semibold leading-snug text-white line-clamp-2 hover:text-cyan-400 transition-colors'>
                        {getLocalized(publication, 'title', locale)}
                      </h3>

                      {/* Meta */}
                      <div className='flex items-center text-gray-400 text-xs mt-1'>
                        <Calendar className='w-4 h-4 text-gray-400' />
                        <span className='ml-1 mr-2'>
                          {getLocalized(publication, 'publicationName', locale)}
                        </span>
                        <span className='text-gray-500'>•</span>
                        <span className='ml-2'>
                          {publication.publishedDate}
                        </span>
                      </div>

                      {/* Authors */}
                      {publication.authorMemberIds && (
                        <div className='mt-2 flex flex-wrap gap-2 min-h-[1.75rem]'>
                          {publication.authorMemberIds
                            .split(',')
                            .map((id) => id.trim())
                            .slice(0, 3)
                            .map((memberId) => {
                              const member = members[memberId];
                              return member ? (
                                <span
                                  key={member.id}
                                  className='px-2 py-1 bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-700 rounded-full text-xs border border-blue-400/30 whitespace-nowrap overflow-hidden text-ellipsis'
                                >
                                  {getLocalized(member, 'name', locale)}
                                </span>
                              ) : null;
                            })}
                          {publication.authorMemberIds.split(',').length >
                            3 && (
                            <span className='px-2 py-1 bg-gray-600/20 text-gray-400 rounded-full text-xs'>
                              +
                              {publication.authorMemberIds.split(',').length -
                                3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Abstract */}
                      {getLocalized(publication, 'abstract', locale) && (
                        <div className='mt-3'>
                          <p className='text-gray-300 text-sm line-clamp-3 leading-relaxed'>
                            {getLocalized(publication, 'abstract', locale)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Glow effect */}
                    <div className='pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
                  </GlassCard>
                </ScrollAwareLink>
              </div>
            );
          })
        )}
      </div>

      <div
        ref={buttonAnimation.ref}
        style={buttonAnimation.style}
        className='text-center mt-12'
      >
        <ScrollAwareLink href='/publications'>
          <Button
            size='lg'
            className='bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold'
          >
            {locale === 'ja' ? 'すべての論文を見る' : 'View All Publications'}
          </Button>
        </ScrollAwareLink>
      </div>
    </SectionWrapper>
  );
}
