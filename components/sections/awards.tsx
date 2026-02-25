'use client';

import { Button } from '@/components/ui/button';
import { Award, ArrowRight } from 'lucide-react';
import { ScrollAwareLink } from '@/components/ui/ScrollAwareLink';
import { useLocale } from '@/contexts/locale';

export function Awards() {
  const { locale } = useLocale();

  return (
    <div className='flex flex-col h-full bg-white p-8 md:p-12 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow'>
      <div className='w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6'>
        <Award className='w-6 h-6 text-amber-600' />
      </div>
      
      <h3 className='text-2xl md:text-3xl font-bold text-slate-900 mb-4'>
        {locale === 'ja' ? '受賞歴' : 'Awards'}
      </h3>
      
      <p className='text-slate-600 mb-8 leading-relaxed flex-grow'>
        {locale === 'ja'
          ? '研究室の革新的な研究成果が評価され、国内外の権威ある学会や団体から多数の賞を受賞しています。'
          : 'Our innovative research achievements have been recognized with numerous prestigious awards from academic societies and organizations.'}
      </p>

      <ScrollAwareLink href='/awards'>
        <Button variant="outline" className='w-full border-slate-200 text-slate-700 font-bold group'>
          {locale === 'ja' ? '受賞歴一覧を見る' : 'View All Awards'}
          <ArrowRight className='ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform' />
        </Button>
      </ScrollAwareLink>
    </div>
  );
}
