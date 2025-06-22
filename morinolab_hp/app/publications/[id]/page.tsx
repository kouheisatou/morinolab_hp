'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import {
  BookOpen,
  Users,
  Tags,
  Home,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import {
  Publication,
  loadPublicationDetail,
  getStaticPath,
} from '@/lib/client-content-loader';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function PublicationDetailPage() {
  const params = useParams();
  const [publication, setPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      const fetchPublicationDetail = async () => {
        try {
          const pubDetail = await loadPublicationDetail(params.id as string);
          setPublication(pubDetail);
        } catch (error) {
          console.error(error);
        }
      };
      fetchPublicationDetail();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className='min-h-screen relative overflow-x-hidden bg-black'>
        <ParticleBackground />
        <Navbar />
        <SectionWrapper className='py-32'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto'></div>
            <p className='text-white mt-4'>Loading...</p>
          </div>
        </SectionWrapper>
        <Footer />
      </div>
    );
  }

  if (!publication) {
    return (
      <div className='min-h-screen relative overflow-x-hidden bg-black'>
        <ParticleBackground />
        <Navbar />
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
        <Footer />
      </div>
    );
  }

  return (
    <div className='min-h-screen relative overflow-x-hidden bg-black'>
      <ParticleBackground />
      <Navbar />

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
                href='/publications'
                className='text-gray-400 hover:text-cyan-400 transition-colors duration-200'
              >
                Publications
              </Link>
              <ChevronRight className='w-4 h-4 text-gray-500' />
              <span className='text-white font-medium'>
                {publication.titleJa}
              </span>
            </nav>
          </div>

          {/* Publication Container */}
          <article className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden'>
            {/* Header Section */}
            <div className='relative bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-8 md:p-12'>
              {/* Publication Meta */}
              <div className='flex items-center space-x-4 mb-6'>
                <div className='w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center'>
                  <BookOpen className='w-6 h-6 text-white' />
                </div>
                <div className='flex flex-wrap items-center gap-4 text-cyan-400 text-sm'>
                  <div className='flex items-center space-x-2'>
                    <Users className='w-4 h-4' />
                    <span>
                      {publication.authorMemberIds.split(',').length} Authors
                    </span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Tags className='w-4 h-4' />
                    <span>{publication.tagIds.split(',').length} Tags</span>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <Calendar className='w-4 h-4' />
                    <span>
                      {new Date(publication.publishedDate).toLocaleDateString(
                        'ja-JP'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Title */}
              <header>
                <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight'>
                  {publication.titleJa}
                </h1>

                <p className='text-xl md:text-2xl text-gray-300 font-medium italic'>
                  {publication.titleEn}
                </p>
              </header>
            </div>

            {/* Featured Image */}
            <div className='relative h-64 md:h-80 overflow-hidden'>
              <Image
                src={getStaticPath(
                  `/generated_contents/publication/${publication.id}.jpg`
                )}
                alt={publication.titleJa}
                fill
                className='object-cover'
                onError={(e) => {
                  e.currentTarget.src = getStaticPath(
                    '/img/noimage_publication.png'
                  );
                }}
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />
            </div>

            {/* Content Section */}
            <div className='p-8 md:p-12 space-y-12'>
              {/* Publication Info */}
              <div className='grid md:grid-cols-2 gap-8'>
                <div>
                  <h2 className='text-2xl font-bold text-white mb-4 border-b border-cyan-400/30 pb-2'>
                    掲載誌
                  </h2>
                  <p className='text-cyan-400 font-semibold text-xl'>
                    {publication.publicationNameJa}
                  </p>
                </div>

                <div>
                  <h2 className='text-2xl font-bold text-white mb-4 border-b border-cyan-400/30 pb-2'>
                    Journal
                  </h2>
                  <p className='text-cyan-400 font-semibold text-xl'>
                    {publication.publicationNameEn}
                  </p>
                </div>
              </div>

              {/* Authors and Tags */}
              <div className='grid md:grid-cols-2 gap-8'>
                {/* Authors */}
                <div>
                  <div className='flex items-center space-x-2 mb-6'>
                    <Users className='w-6 h-6 text-cyan-400' />
                    <h2 className='text-2xl font-bold text-white'>Authors</h2>
                  </div>
                  <div className='flex flex-wrap gap-3'>
                    {publication.authorMemberIds
                      .split(',')
                      .map((authorId, index) => (
                        <span
                          key={index}
                          className='px-4 py-2 bg-gradient-to-r from-green-500/10 to-teal-500/10 text-green-400 rounded-full border border-green-400/30 font-medium'
                        >
                          Member #{authorId.trim()}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div className='flex items-center space-x-2 mb-6'>
                    <Tags className='w-6 h-6 text-cyan-400' />
                    <h2 className='text-2xl font-bold text-white'>
                      Research Areas
                    </h2>
                  </div>
                  <div className='flex flex-wrap gap-3'>
                    {publication.tagIds.split(',').map((tagId, index) => (
                      <span
                        key={index}
                        className='px-4 py-2 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-cyan-400 rounded-full border border-cyan-400/30 font-medium'
                      >
                        Tag #{tagId.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Abstract */}
              {publication.content && (
                <div>
                  <h2 className='text-2xl font-bold text-white mb-6 border-b border-cyan-400/30 pb-2'>
                    Abstract
                  </h2>
                  <div className='prose prose-lg prose-invert max-w-none'>
                    <div
                      className='text-gray-200 leading-relaxed text-lg'
                      dangerouslySetInnerHTML={{
                        __html: publication.content.replace(/\n/g, '<br>'),
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      </SectionWrapper>

      <Footer />
    </div>
  );
}
