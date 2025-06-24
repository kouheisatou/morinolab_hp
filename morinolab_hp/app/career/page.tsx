'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { ParticleBackground } from '@/components/ui/particle-background';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import Link from 'next/link';
import Image from 'next/image';
import { Home, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocale } from '@/contexts/locale';
import {
  CareerItem,
  loadCareers,
  getStaticPath,
} from '@/lib/client-content-loader';
import { getLocalized } from '@/lib/utils';

export default function CareerListPage() {
  const [careers, setCareers] = useState<CareerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { locale } = useLocale();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadCareers();
        setCareers(data);
      } catch (error) {
        console.error('Error loading career paths:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className='min-h-screen relative overflow-x-hidden bg-gradient-to-br from-slate-900 to-slate-800'>
        <ParticleBackground />
        <Navbar />
        <SectionWrapper className='py-32'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto'></div>
            <p className='text-white mt-4'>Loading career paths...</p>
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
          {/* Breadcrumb */}
          <div className='mb-8 px-4'>
            <nav className='flex items-center space-x-2 text-xs sm:text-sm'>
              <Link
                href='/'
                className='flex items-center text-gray-400 hover:text-cyan-400 transition-colors duration-200'
              >
                <Home className='w-3 h-3 sm:w-4 sm:h-4 mr-1' />
                <span className='hidden sm:inline'>Home</span>
                <span className='sm:hidden'>ホーム</span>
              </Link>
              <ChevronRight className='w-3 h-3 sm:w-4 sm:h-4 text-gray-500' />
              <span className='text-white font-medium'>
                {locale === 'ja' ? 'キャリアパス' : 'Career Paths'}
              </span>
            </nav>
          </div>

          {/* Title */}
          <div className='mb-16'>
            <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6'>
              {locale === 'ja' ? 'キャリアパス一覧' : 'All Career Paths'}
            </h1>
          </div>

          {/* Grid */}
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 place-items-center'>
            {careers.map((career) => (
              <div
                key={career.id}
                className='flex flex-col items-center text-center'
              >
                <div className='w-20 h-20 rounded-full overflow-hidden mb-3'>
                  <Image
                    src={getStaticPath(
                      `/generated_contents/career/${career.thumbnail}`
                    )}
                    alt={getLocalized(career, 'name', locale)}
                    width={80}
                    height={80}
                    className='object-cover w-full h-full'
                  />
                </div>
                <span className='text-sm font-medium text-white'>
                  {getLocalized(career, 'name', locale)}
                </span>
              </div>
            ))}
          </div>
        </SectionWrapper>
      </main>

      <Footer />
    </div>
  );
}
