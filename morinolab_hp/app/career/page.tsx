'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { FullPageLoader } from '@/components/ui/full-page-loader';
import { PageContainer } from '@/components/ui/page-container';
import { SimpleBreadcrumb } from '@/components/ui/breadcrumb';
import Image from 'next/image';
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
    return <FullPageLoader message='Loading career paths...' />;
  }

  return (
    <PageContainer>
      <SectionWrapper className='py-32'>
        <div className='mb-8 px-4'>
          <SimpleBreadcrumb labelJa='卒業生の進路' labelEn='Graduate Path' />
        </div>

        <div className='mb-16'>
          <h1 className='text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6'>
            {locale === 'ja' ? '卒業生の進路' : 'Graduate Path'}
          </h1>
        </div>

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
    </PageContainer>
  );
}
