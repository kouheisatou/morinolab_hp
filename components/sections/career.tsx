'use client';

import { Button } from '@/components/ui/button';
import { Briefcase, ArrowRight } from 'lucide-react';
import { ScrollAwareLink } from '@/components/ui/ScrollAwareLink';
import { useLocale } from '@/contexts/locale';

export function Career() {
  const { locale } = useLocale();

  return (
    <div className='flex flex-col h-full bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow'>
      <div className='w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6'>
        <Briefcase className='w-6 h-6 text-primary' />
      </div>
      
      <h3 className='text-2xl md:text-3xl font-bold text-slate-900 mb-4'>
        {locale === 'ja' ? '卒業生の進路' : 'Graduate Path'}
      </h3>
      
      <p className='text-slate-600 mb-8 leading-relaxed flex-grow'>
        {locale === 'ja'
          ? '情報通信業界のリーディングカンパニーや研究機関など、卒業生が歩む多彩なキャリアパスをご紹介します。'
          : 'Explore the diverse career destinations of our graduates, ranging from leading ICT companies to research institutions.'}
      </p>

      <ScrollAwareLink href='/career'>
        <Button variant="outline" className='w-full border-slate-200 text-slate-700 font-bold group'>
          {locale === 'ja' ? 'すべての進路を見る' : 'View All Paths'}
          <ArrowRight className='ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform' />
        </Button>
      </ScrollAwareLink>
    </div>
  );
}
