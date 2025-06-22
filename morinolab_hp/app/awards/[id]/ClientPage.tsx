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
} from '@/lib/client-content-loader';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ClientPageProps {
  id: string;
}

export default function AwardDetailClientPage({ id }: ClientPageProps) {
  const [award, setAward] = useState<AwardType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAward = async () => {
      try {
        const awardData = await loadAwardDetail(id);
        setAward(awardData);
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

  if (loading) {
    return (
      <div className='min-h-screen relative overflow-x-hidden bg-black'>
        <ParticleBackground />
        <Navbar />
        <SectionWrapper className='py-32'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto'></div>
            <p className='text-white mt-4'>Loading award...</p>
          </div>
        </SectionWrapper>
        <Footer />
      </div>
    );
  }

  if (!award) {
    return (
      <div className='min-h-screen relative overflow-x-hidden bg-black'>
        <ParticleBackground />
        <Navbar />
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
        <Footer />
      </div>
    );
  }

  const { icon: Icon, color } = getAwardStyle(parseInt(award.id) || 0);

  return (
    <div className='min-h-screen relative overflow-x-hidden bg-black'>
      <ParticleBackground />
      <Navbar />

      <SectionWrapper className='py-32'>
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
              href='/awards'
              className='text-gray-400 hover:text-cyan-400 transition-colors duration-200'
            >
              Awards
            </Link>
            <ChevronRight className='w-4 h-4 text-gray-500' />
            <span className='text-white font-medium'>{award.nameJa}</span>
          </nav>
        </div>

        {/* Award Container */}
        <article className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden'>
          {/* Header Section */}
          <div className='relative bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-8 md:p-12'>
            <div className='flex items-start space-x-6'>
              <div
                className={`w-16 h-16 md:w-20 md:h-20 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center flex-shrink-0`}
              >
                <Icon className='w-8 h-8 md:w-10 md:h-10 text-white' />
              </div>
              <div className='flex-1'>
                <div className='flex items-center space-x-2 mb-4'>
                  <Calendar className='w-4 h-4 text-cyan-400' />
                  <time className='text-cyan-400 text-sm font-medium'>
                    {new Date(award.date).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                </div>

                <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight'>
                  {award.nameJa}
                </h1>

                {award.nameEn && award.nameEn !== award.nameJa && (
                  <h2 className='text-xl md:text-2xl text-gray-300 font-medium italic'>
                    {award.nameEn}
                  </h2>
                )}
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className='relative h-64 md:h-80 lg:h-96 overflow-hidden'>
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
          <div className='p-8 md:p-12'>
            <div
              className='prose prose-lg prose-invert max-w-none prose-headings:text-white prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-6 prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-4 prose-h3:text-xl prose-h3:font-medium prose-h3:mb-3 prose-p:text-gray-200 prose-p:leading-relaxed prose-p:mb-4 prose-ul:text-gray-200 prose-li:text-gray-200 prose-li:mb-2 prose-strong:text-white prose-em:text-gray-300'
              dangerouslySetInnerHTML={{
                __html:
                  award.content ||
                  '<p class="text-gray-400">No content available.</p>',
              }}
            />
          </div>
        </article>
      </SectionWrapper>

      <Footer />
    </div>
  );
}
