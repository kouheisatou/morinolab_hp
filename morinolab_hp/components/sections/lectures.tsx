'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  ArrowRight,
  Users,
  Clock,
  GraduationCap,
  Monitor,
} from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { useState, useEffect } from 'react';
import {
  loadLectures,
  Lecture,
  getStaticPath,
} from '@/lib/client-content-loader';
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

export function Lectures() {
  const { elementRef: titleRef, isVisible: titleVisible } =
    useScrollAnimation<HTMLHeadingElement>({ forceVisible: true });
  const { elementRef: descRef, isVisible: descVisible } =
    useScrollAnimation<HTMLParagraphElement>({ forceVisible: true });
  const { elementRef: buttonRef, isVisible: buttonVisible } =
    useScrollAnimation<HTMLDivElement>();

  // 固定数のアニメーション用refを事前に作成（最大4つの講義用）
  const cardRefs = [
    useScrollAnimation<HTMLDivElement>(),
    useScrollAnimation<HTMLDivElement>(),
    useScrollAnimation<HTMLDivElement>(),
    useScrollAnimation<HTMLDivElement>(),
  ];

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLectures() {
      try {
        console.log('Lectures component: Starting to fetch lectures...');
        setLoading(true);
        const lecturesData = await loadLectures();
        console.log('Lectures component: Received lectures:', lecturesData);

        // 上位4つの講義を取得
        const topLectures = lecturesData.slice(0, 4);
        setLectures(topLectures);
      } catch (err) {
        console.error('Lectures component: Error loading lectures:', err);
        setError('Failed to load lectures');
      } finally {
        console.log('Lectures component: Finished loading');
        setLoading(false);
      }
    }

    fetchLectures();
  }, []);

  if (loading) {
    return (
      <SectionWrapper id='lectures' className='py-32'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto'></div>
          <p className='text-white mt-4'>Loading lectures...</p>
        </div>
      </SectionWrapper>
    );
  }

  if (error) {
    return (
      <SectionWrapper id='lectures' className='py-32'>
        <div className='text-center'>
          <p className='text-red-400'>{error}</p>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper id='lectures' className='py-32'>
      <div className='text-center mb-16'>
        <h2
          ref={titleRef}
          className={`text-5xl font-bold text-white mb-6 transition-all duration-1000 ${
            titleVisible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-10 scale-95'
          }`}
        >
          Academic Lectures
        </h2>
        <p
          ref={descRef}
          className={`text-xl text-gray-300 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
            descVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
          }`}
        >
          Comprehensive courses covering fundamental concepts to advanced topics
          in computer science and emerging technologies.
        </p>
      </div>

      <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {lectures.length === 0 ? (
          <div className='col-span-full text-center text-gray-400'>
            <p>No lectures found</p>
          </div>
        ) : (
          lectures.map((lecture, index) => {
            const { icon: Icon, color } = getLectureStyle(lecture.type);
            const { elementRef: cardRef, isVisible: cardVisible } =
              cardRefs[index % cardRefs.length];

            return (
              <div
                ref={cardRef}
                key={lecture.id}
                className={`transition-all duration-1000 ${
                  cardVisible
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-20 scale-95'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <GlassCard className='p-6 h-full flex flex-col relative overflow-hidden group hover:scale-[1.02] transition-all duration-300'>
                  {/* サムネイル */}
                  <div className='w-full h-40 rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-gray-800 to-gray-900'>
                    <Image
                      src={getStaticPath(
                        `/generated_contents/lecture/${lecture.id}.jpg`
                      )}
                      alt={lecture.nameJa}
                      width={300}
                      height={160}
                      className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-300'
                      onError={(e) => {
                        e.currentTarget.src = getStaticPath(
                          '/img/noimage_lectures.png'
                        );
                      }}
                    />
                  </div>

                  {/* 講義タイプバッジ */}
                  <div className='flex items-center space-x-2 mb-3'>
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center`}
                    >
                      <Icon className='w-4 h-4 text-white' />
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${color} bg-opacity-20 text-white border border-white/20`}
                    >
                      {lecture.type}
                    </span>
                  </div>

                  <h3 className='text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300'>
                    {lecture.nameJa}
                  </h3>

                  <p className='text-blue-400 text-sm mb-3 font-medium'>
                    {lecture.nameEn}
                  </p>

                  <p className='text-gray-300 text-sm mb-4 flex-grow line-clamp-3'>
                    {lecture.descJa}
                  </p>

                  <Link href={`/lectures/${lecture.id}`} className='mt-auto'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='w-full border-white/30 text-white hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-300'
                    >
                      View Details
                      <ArrowRight className='w-4 h-4 ml-2' />
                    </Button>
                  </Link>

                  {/* ホバーエフェクト */}
                  <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
                </GlassCard>
              </div>
            );
          })
        )}
      </div>

      <div
        ref={buttonRef}
        className={`text-center mt-12 transition-all duration-1000 delay-1000 ${
          buttonVisible
            ? 'opacity-100 translate-y-0 scale-100'
            : 'opacity-0 translate-y-8 scale-95'
        }`}
      >
        <Link href='/lectures'>
          <Button
            size='lg'
            className='bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 text-lg font-semibold'
          >
            View All Lectures
          </Button>
        </Link>
      </div>
    </SectionWrapper>
  );
}
