'use client';

import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { Award } from 'lucide-react';
import { useFadeInAnimation } from '@/hooks/use-fade-in-animation';
import Link from 'next/link';
import { useLocale } from '@/contexts/locale';

export function Awards() {
  const titleAnimation = useFadeInAnimation<HTMLHeadingElement>({
    delay: 100,
    duration: 1000,
  });
  const descAnimation = useFadeInAnimation<HTMLParagraphElement>({
    delay: 300,
    duration: 1000,
  });
  const buttonAnimation = useFadeInAnimation<HTMLDivElement>({
    delay: 500,
    duration: 800,
  });

  const { locale } = useLocale();

  return (
    <SectionWrapper id='awards' className='py-16'>
      <div className='text-center mb-16'>
        <h2
          ref={titleAnimation.ref}
          style={titleAnimation.style}
          className='text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6'
        >
          {locale === 'ja' ? '受賞歴' : 'Awards & Recognition'}
        </h2>
        <p
          ref={descAnimation.ref}
          style={descAnimation.style}
          className='text-xl text-gray-300 max-w-3xl mx-auto min-h-[96px]'
        >
          {locale === 'ja'
            ? '研究室の革新的な研究成果が評価され、国内外の権威ある賞を受賞しています。'
            : 'Our innovative research achievements have been recognized with prestigious awards both domestically and internationally.'}
        </p>
      </div>

      <div
        ref={buttonAnimation.ref}
        style={buttonAnimation.style}
        className='text-center'
      >
        <Link href='/awards'>
          <Button
            size='lg'
            className='bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group'
          >
            <Award className='w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300' />
            {locale === 'ja' ? '受賞歴一覧を見る' : 'View All Awards'}
          </Button>
        </Link>
      </div>
    </SectionWrapper>
  );
}
