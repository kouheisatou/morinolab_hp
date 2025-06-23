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
  Filter,
  X,
  Home,
  ChevronRight,
} from 'lucide-react';
import {
  Lecture,
  loadLectures,
  getStaticPath,
} from '@/lib/client-content-loader';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';
import { t } from '@/lib/i18n';

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

export default function LecturesPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocale();

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        const lecturesData = await loadLectures();
        setLectures(lecturesData);
      } catch (error) {
        console.error('Error loading lectures:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLectures();
  }, []);

  // 利用可能な講義タイプを取得
  const availableTypes = Array.from(
    new Set(lectures.map((lecture) => lecture.type))
  );

  // フィルタリング機能を削除したため、すべての講義を表示
  const filteredLectures = lectures;

  // タイプの切り替え
  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // 全タイプをクリア
  const clearAllTypes = () => {
    setSelectedTypes([]);
  };

  if (loading) {
    return (
      <div className='min-h-screen relative overflow-x-hidden bg-gradient-to-br from-slate-900 to-slate-800'>
        <ParticleBackground />
        <Navbar />
        <SectionWrapper className='py-32'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto'></div>
            <p className='text-white mt-4'>Loading lectures...</p>
          </div>
        </SectionWrapper>
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
          {/* パンくずリスト */}
          <div className='mb-8'>
            <nav className='flex items-center space-x-2 text-sm'>
              <Link
                href='/'
                className='flex items-center text-gray-400 hover:text-cyan-400 transition-colors duration-200'
              >
                <Home className='w-4 h-4 mr-1' />
                Home
              </Link>
              <ChevronRight className='w-4 h-4 text-gray-500' />
              <span className='text-white font-medium'>
                {locale === 'ja' ? '講義' : 'Lectures'}
              </span>
            </nav>
          </div>

          <div className='text-center mb-16'>
            <h1 className='text-5xl font-bold text-white mb-6'>
              {locale === 'ja' ? '講義一覧' : 'Academic Lectures'}
            </h1>
            <p className='text-xl text-gray-300 max-w-3xl mx-auto'>
              {locale === 'ja'
                ? 'コンピュータサイエンスと情報通信技術に関する基礎から応用までを網羅した講義を提供します。'
                : 'Comprehensive courses covering fundamental concepts to advanced topics in computer science and information communication technologies.'}
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {filteredLectures.map((lecture) => {
              const { icon: Icon, color } = getLectureStyle(
                lecture.typeJa ?? lecture.type
              );

              return (
                <Link
                  href={`/lectures/${lecture.id}`}
                  key={lecture.id}
                  className='block group'
                >
                  <GlassCard className='p-6 h-full flex flex-col relative overflow-hidden group-hover:scale-[1.02] transition-all duration-300'>
                    {/* サムネイル */}
                    <div className='w-full h-48 rounded-lg overflow-hidden mb-4 bg-gradient-to-br from-gray-800 to-gray-900'>
                      <Image
                        src={getStaticPath(
                          `/generated_contents/lecture/${lecture.id}.jpg`
                        )}
                        alt={lecture.nameJa}
                        width={400}
                        height={192}
                        className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-300'
                        onError={(e) => {
                          e.currentTarget.src = getStaticPath(
                            '/img/noimage_lectures.png'
                          );
                        }}
                      />
                    </div>

                    {/* 講義タイプバッジ */}
                    <div className='flex items-center space-x-2 mb-4'>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${color} bg-opacity-20 text-white border border-white/20`}
                      >
                        {locale === 'ja' ? lecture.typeJa : lecture.typeEn}
                      </span>
                    </div>

                    <h3 className='text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300'>
                      {getLocalized(lecture, 'name', locale)}
                    </h3>

                    <p className='text-gray-300 mb-6 flex-grow'>
                      {getLocalized(lecture, 'desc', locale)}
                    </p>

                    {/* Card is clickable; button removed */}

                    {/* ホバーエフェクト */}
                    <div className='pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
                  </GlassCard>
                </Link>
              );
            })}
          </div>

          {filteredLectures.length === 0 && (
            <div className='text-center py-12'>
              <p className='text-gray-400 text-lg'>
                No lectures found with the selected filters.
              </p>
              {selectedTypes.length > 0 && (
                <Button
                  variant='outline'
                  onClick={clearAllTypes}
                  className='mt-4 border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10'
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </SectionWrapper>
      </main>

      <Footer />
    </div>
  );
}
