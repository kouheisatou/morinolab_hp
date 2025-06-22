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
  Clock,
  GraduationCap,
  Monitor,
  Calendar,
  User,
  Home,
  ChevronRight,
} from 'lucide-react';
import {
  Lecture,
  loadLectureDetail,
  getStaticPath,
} from '@/lib/client-content-loader';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// 講義タイプに応じたアイコンとカラー
const getLectureStyle = (type: string) => {
  const styles = {
    必修: { icon: BookOpen, color: 'from-red-500 to-pink-500' },
    選択必修: { icon: GraduationCap, color: 'from-blue-500 to-cyan-500' },
    専門講義: { icon: Monitor, color: 'from-purple-500 to-indigo-500' },
    実習: { icon: Users, color: 'from-green-500 to-teal-500' },
    選択: { icon: Clock, color: 'from-orange-500 to-yellow-500' },
  };
  return styles[type as keyof typeof styles] || styles['専門講義'];
};

export default function LectureDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        const lectureData = await loadLectureDetail(id);
        setLecture(lectureData);
      } catch (error) {
        console.error('Error loading lecture:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLecture();
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
            <p className='text-white mt-4'>Loading lecture...</p>
          </div>
        </SectionWrapper>
        <Footer />
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className='min-h-screen relative overflow-x-hidden bg-black'>
        <ParticleBackground />
        <Navbar />
        <SectionWrapper className='py-32'>
          <div className='text-center'>
            <h1 className='text-4xl font-bold text-white mb-4'>
              Lecture Not Found
            </h1>
            <p className='text-gray-400 mb-8'>
              The requested lecture could not be found.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'></div>
          </div>
        </SectionWrapper>
        <Footer />
      </div>
    );
  }

  const { icon: Icon, color } = getLectureStyle(lecture.type);

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
              href='/lectures'
              className='text-gray-400 hover:text-cyan-400 transition-colors duration-200'
            >
              Lectures
            </Link>
            <ChevronRight className='w-4 h-4 text-gray-500' />
            <span className='text-white font-medium'>{lecture.nameJa}</span>
          </nav>
        </div>

        {/* Lecture Container */}
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
                <div className='mb-4'>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${color}/20 text-white border border-white/20`}
                  >
                    {lecture.type}
                  </span>
                </div>
                <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight'>
                  {lecture.nameJa}
                </h1>
                <p className='text-xl md:text-2xl text-gray-300 font-medium italic'>
                  {lecture.nameEn}
                </p>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className='relative h-64 md:h-80 overflow-hidden'>
            <Image
              src={getStaticPath(
                `/generated_contents/lecture/${lecture.id}.jpg`
              )}
              alt={lecture.nameJa}
              fill
              className='object-cover'
              onError={(e) => {
                e.currentTarget.src = getStaticPath(
                  '/img/noimage_lectures.png'
                );
              }}
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />
          </div>

          {/* Content Section */}
          <div className='p-8 md:p-12 space-y-12'>
            {/* Lecture Overview */}
            <div>
              <h2 className='text-2xl font-bold text-white mb-6 border-b border-cyan-400/30 pb-2'>
                講義概要
              </h2>
              <p className='text-gray-200 leading-relaxed text-lg'>
                {lecture.descJa}
              </p>
            </div>

            {/* Lecture Content */}
            {lecture.content && (
              <div>
                <h2 className='text-2xl font-bold text-white mb-6 border-b border-cyan-400/30 pb-2'>
                  詳細内容
                </h2>
                <div className='prose prose-lg prose-invert max-w-none'>
                  <div
                    className='text-gray-200 leading-relaxed text-lg whitespace-pre-wrap'
                    dangerouslySetInnerHTML={{
                      __html: lecture.content.replace(/\n/g, '<br>'),
                    }}
                  />
                </div>
              </div>
            )}

            {/* Lecture Info */}
            <div>
              <h2 className='text-2xl font-bold text-white mb-6 border-b border-cyan-400/30 pb-2'>
                講義情報
              </h2>
              <div className='grid md:grid-cols-2 gap-6'>
                <div className='flex items-center space-x-4'>
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center`}
                  >
                    <Icon className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <p className='text-sm text-gray-400'>講義タイプ</p>
                    <p className='text-white font-medium text-lg'>
                      {lecture.type}
                    </p>
                  </div>
                </div>
                <div className='flex items-center space-x-4'>
                  <div className='w-12 h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center'>
                    <User className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <p className='text-sm text-gray-400'>講義ID</p>
                    <p className='text-white font-medium text-lg'>
                      LECTURE-{lecture.id.padStart(3, '0')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </SectionWrapper>

      <Footer />
    </div>
  );
}
