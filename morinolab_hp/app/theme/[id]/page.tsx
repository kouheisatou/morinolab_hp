'use client';

import { useState, useEffect } from 'react';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import {
  loadThemeDetail,
  Theme,
  getStaticPath,
} from '@/lib/client-content-loader';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Home,
  ChevronRight,
  Calendar,
  Lightbulb,
  Cpu,
  Zap,
  Atom,
  Brain,
  Shield,
} from 'lucide-react';

// アイコンの配列
const iconArray = [Atom, Brain, Shield, Lightbulb, Cpu, Zap];
const colorArray = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-green-500 to-teal-500',
  'from-orange-500 to-red-500',
  'from-indigo-500 to-purple-500',
  'from-yellow-500 to-orange-500',
];

export default function ThemeDetailPage() {
  const params = useParams();
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      const fetchThemeDetail = async () => {
        try {
          const themeData = await loadThemeDetail(params.id as string);
          setTheme(themeData);
        } catch (error) {
          console.error('Error loading theme detail:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchThemeDetail();
    }
  }, [params?.id]);

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

  if (!theme) {
    return (
      <div className='min-h-screen relative overflow-x-hidden bg-black'>
        <ParticleBackground />
        <Navbar />
        <SectionWrapper className='py-32'>
          <div className='text-center'>
            <h1 className='text-4xl font-bold text-white mb-4'>
              Theme Not Found
            </h1>
            <p className='text-gray-300 mb-8'>
              The requested research theme could not be found.
            </p>
            <Link href='/'>
              <Button className='bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'>
                Back to Home
              </Button>
            </Link>
          </div>
        </SectionWrapper>
        <Footer />
      </div>
    );
  }

  // アイコンとカラーを決定
  const iconIndex = parseInt(theme.id) % iconArray.length;
  const Icon = iconArray[iconIndex];
  const color = colorArray[iconIndex];

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
                href='/#research'
                className='text-gray-400 hover:text-cyan-400 transition-colors duration-200'
              >
                Research
              </Link>
              <ChevronRight className='w-4 h-4 text-gray-500' />
              <span className='text-white font-medium'>{theme.nameJa}</span>
            </nav>
          </div>

          {/* Theme Container */}
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
                  <h1 className='text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight'>
                    {theme.nameJa}
                  </h1>

                  <p className='text-xl md:text-2xl text-gray-300 font-medium italic'>
                    {theme.nameEn}
                  </p>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className='relative h-64 md:h-80 overflow-hidden'>
              <Image
                src={getStaticPath(
                  `/generated_contents/theme/${theme.thumbnail}`
                )}
                alt={theme.nameJa}
                fill
                className='object-cover'
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.src = getStaticPath('/img/noimage_theme.png');
                }}
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent' />
            </div>

            {/* Content Section */}
            <div className='p-8 md:p-12 space-y-12'>
              {/* Description */}
              <div className='grid md:grid-cols-2 gap-8'>
                <div>
                  <h2 className='text-2xl font-bold text-white mb-4 border-b border-cyan-400/30 pb-2'>
                    研究概要
                  </h2>
                  <p className='text-gray-200 leading-relaxed text-lg'>
                    {theme.descJa}
                  </p>
                </div>

                <div>
                  <h2 className='text-2xl font-bold text-white mb-4 border-b border-cyan-400/30 pb-2'>
                    Research Overview
                  </h2>
                  <p className='text-gray-200 leading-relaxed text-lg'>
                    {theme.descEn}
                  </p>
                </div>
              </div>

              {/* Key Achievements */}
              {theme.keyAchievements && (
                <div>
                  <h2 className='text-2xl font-bold text-white mb-6 border-b border-cyan-400/30 pb-2'>
                    Key Achievements
                  </h2>
                  <div className='space-y-3'>
                    {theme.keyAchievements
                      .split(',')
                      .map((achievement, index) => (
                        <div key={index} className='flex items-start'>
                          <span className='w-2 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mt-2 mr-4 flex-shrink-0' />
                          <p className='text-gray-200 leading-relaxed text-lg'>
                            {achievement.trim()}
                          </p>
                        </div>
                      ))}
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
