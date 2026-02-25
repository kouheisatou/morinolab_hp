'use client';

import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Navbar } from '@/components/navigation/navbar';
import { Footer } from '@/components/navigation/footer';
import { ChevronRight, Briefcase } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useLocale } from '@/contexts/locale';
import {
  CareerItem,
  loadCareers,
  getStaticPath,
} from '@/lib/client-content-loader';
import { getLocalized } from '@/lib/utils';
import { ScrollAwareLink } from '@/components/ui/ScrollAwareLink';

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

  if (loading) return null;

  return (
    <div className='min-h-screen bg-white flex flex-col'>
      <Navbar />

      <main className='flex-1 pt-20'>
        <div className='bg-slate-50 border-b border-slate-100 py-12'>
          <div className='max-w-7xl mx-auto px-4'>
            <nav className='flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-slate-400 mb-6'>
              <ScrollAwareLink href='/' className='hover:text-primary transition-colors'>Home</ScrollAwareLink>
              <ChevronRight className='w-3 h-3' />
              <span className='text-slate-900'>{locale === 'ja' ? 'キャリア' : 'Career'}</span>
            </nav>
            <h1 className='text-4xl md:text-5xl font-black text-slate-900 tracking-tight'>
              {locale === 'ja' ? '卒業生の進路' : 'Graduate Path'}
            </h1>
            <p className='text-slate-500 mt-4 max-w-2xl font-medium'>
              {locale === 'ja' 
                ? '当研究室の卒業生は、情報通信分野のトップ企業や公的機関など、多方面で活躍しています。'
                : 'Graduates of our laboratory are active in various fields, including top ICT companies and public institutions.'}
            </p>
          </div>
        </div>

        <SectionWrapper className='py-16'>
          <div className='max-w-7xl mx-auto'>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8'>
              {careers.map((career) => (
                <div
                  key={career.id}
                  className='group flex flex-col items-center text-center p-6 bg-white border border-slate-100 rounded-3xl hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all'
                >
                  <div className='relative mb-4'>
                    <div className='absolute -inset-1 bg-primary/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity'></div>
                    <div className='w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md relative'>
                      <Image
                        src={getStaticPath(`/generated_contents/career/${career.thumbnail}`)}
                        alt={getLocalized(career, 'name', locale)}
                        width={80}
                        height={80}
                        className='object-cover w-full h-full grayscale group-hover:grayscale-0 transition-all'
                      />
                    </div>
                  </div>
                  <span className='text-xs font-black text-slate-900 uppercase tracking-widest group-hover:text-primary transition-colors'>
                    {getLocalized(career, 'name', locale)}
                  </span>
                </div>
              ))}
            </div>

            {careers.length === 0 && (
              <div className='text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200'>
                <p className='text-slate-400 font-bold uppercase tracking-widest'>No career data found.</p>
              </div>
            )}
          </div>
        </SectionWrapper>
      </main>

      <Footer />
    </div>
  );
}
