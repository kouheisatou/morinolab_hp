'use client';

import { useEffect, useState } from 'react';
import {
  Publication,
  loadPublicationDetail,
} from '@/lib/client-content-loader';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { SectionWrapper } from '@/components/ui/section-wrapper';

interface ClientPageProps {
  id: string;
}

export default function PublicationDetailClientPage({ id }: ClientPageProps) {
  const [publication, setPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchPublicationDetail = async () => {
        try {
          const pubDetail = await loadPublicationDetail(id);
          setPublication(pubDetail);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchPublicationDetail();
    }
  }, [id]);

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
          <article className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden'>
            <div className='p-8 md:p-12'>
              <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight'>
                {publication.titleJa}
              </h1>
              <p className='text-xl md:text-2xl text-gray-300 font-medium italic'>
                {publication.titleEn}
              </p>
              <div
                className='mt-8 prose prose-lg prose-invert max-w-none prose-headings:text-white prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-6 prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-4 prose-h3:text-xl prose-h3:font-medium prose-h3:mb-3 prose-p:text-gray-200 prose-p:leading-relaxed prose-p:mb-4 prose-ul:text-gray-200 prose-li:text-gray-200 prose-li:mb-2 prose-strong:text-white prose-em:text-gray-300'
                dangerouslySetInnerHTML={{
                  __html:
                    publication.content ||
                    '<p class="text-gray-400">No content available.</p>',
                }}
              />
            </div>
          </article>
        </div>
      </SectionWrapper>
      <Footer />
    </div>
  );
}
