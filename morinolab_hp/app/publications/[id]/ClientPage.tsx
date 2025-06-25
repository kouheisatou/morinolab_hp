'use client';

import { useEffect, useState } from 'react';
import {
  Publication,
  loadPublicationDetail,
  TeamMember,
  Tag,
  loadTeamMembers,
  loadTags,
  getStaticPath,
} from '@/lib/client-content-loader';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen,
  Users,
  Tags as TagsIcon,
  Calendar,
  Home,
  ChevronRight,
} from 'lucide-react';

interface ClientPageProps {
  id: string;
}

export default function PublicationDetailClientPage({ id }: ClientPageProps) {
  const [publication, setPublication] = useState<Publication | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocale();

  // Helpers to map IDs to display names
  const getMemberName = (memberId: string) => {
    const member = teamMembers.find((m) => m.id === memberId);
    return member
      ? getLocalized(member, 'name', locale)
      : `Member #${memberId}`;
  };

  const getTagName = (tagId: string) => {
    const tag = tags.find((t) => t.id === tagId);
    return tag ? getLocalized(tag, 'name', locale) : `Tag #${tagId}`;
  };

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const [pubDetail, membersData, tagsData] = await Promise.all([
          loadPublicationDetail(id),
          loadTeamMembers(),
          loadTags(),
        ]);
        setPublication(pubDetail);
        setTeamMembers(membersData);
        setTags(tagsData);
      } catch (error) {
        console.error('Error loading publication detail:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  if (!publication) {
    return (
      <div className='min-h-screen relative overflow-x-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col'>
        <ParticleBackground />
        <Navbar />
        <main className='flex-1'>
          <SectionWrapper className='py-32'>
            <div className='text-center'>
              <h1 className='text-4xl font-bold text-white mb-4'>
                Publication Not Found
              </h1>
              <p className='text-gray-300 mb-8'>
                The requested publication could not be found.
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
          {/* Breadcrumb */}
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
                href='/publications'
                className='text-gray-400 hover:text-cyan-400 transition-colors duration-200'
              >
                {locale === 'ja' ? '論文' : 'Publications'}
              </Link>
              <ChevronRight className='w-4 h-4 text-gray-500' />
              <span className='text-white font-medium'>
                {getLocalized(publication, 'title', locale)}
              </span>
            </nav>
          </div>

          {/* Publication Container */}
          <article className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden'>
            {/* Header Section with icon and publication name */}
            <div className='relative bg-gradient-to-br from-emerald-900/20 to-blue-900/20 p-8 md:p-12'>
              <div className='flex items-start space-x-6'>
                <div className='w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 flex items-center justify-center flex-shrink-0'>
                  <BookOpen className='w-8 h-8 md:w-10 md:h-10 text-white' />
                </div>
                <div className='flex-1'>
                  {/* Publication Name (e.g., Journal or Conference) */}
                  <div className='flex items-center space-x-2 mb-4'>
                    <TagsIcon className='w-4 h-4 text-cyan-400' />
                    <span className='text-cyan-400 text-sm font-medium'>
                      {getLocalized(publication, 'publicationName', locale)}
                    </span>
                  </div>

                  <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight'>
                    {getLocalized(publication, 'title', locale)}
                  </h1>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className='relative h-64 md:h-80 overflow-hidden'>
              <Image
                src={getStaticPath(
                  `/generated_contents/publication/${publication.id}.jpg`
                )}
                alt={getLocalized(publication, 'title', locale)}
                fill
                className='object-cover'
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = getStaticPath('/img/noimage_publication.png');
                }}
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />
            </div>

            {/* Content Section */}
            <div className='p-8 md:p-12 space-y-12'>
              {/* Metadata */}
              <div className='space-y-2'>
                <div className='flex items-center space-x-2 text-gray-400 text-sm'>
                  <Users className='w-4 h-4' />
                  <span>
                    {publication.authorMemberIds
                      .split(',')
                      .map((id) => getMemberName(id.trim()))
                      .join(', ')}
                  </span>
                </div>

                <div className='flex items-center space-x-2 text-gray-400 text-sm'>
                  <Calendar className='w-4 h-4' />
                  <span>{publication.publishedDate}</span>
                </div>

                {/* Tags */}
                <div className='flex flex-wrap gap-2 pt-2'>
                  {publication.tagIds
                    .split(',')
                    .map((id) => id.trim())
                    .map((tagId) => (
                      <span
                        key={tagId}
                        className='text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full'
                      >
                        {getTagName(tagId)}
                      </span>
                    ))}
                </div>
              </div>

              {/* Description / Markdown Content */}
              <div>
                <h2 className='text-2xl font-bold text-white mb-4 border-b border-cyan-400/30 pb-2'>
                  {locale === 'ja' ? '概要' : 'Abstract'}
                </h2>
                <div
                  className='prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-gray-700'
                  dangerouslySetInnerHTML={{
                    __html:
                      publication.content ||
                      '<p class="text-gray-400">No content available.</p>',
                  }}
                />
              </div>
            </div>
          </article>
        </SectionWrapper>
      </main>
      <Footer />
    </div>
  );
}
