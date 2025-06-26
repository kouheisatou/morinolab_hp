'use client';

import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { useFadeInAnimation } from '@/hooks/use-fade-in-animation';
import { ScrollAwareLink } from '@/components/ui/ScrollAwareLink';
import { useLocale } from '@/contexts/locale';

export function Lectures() {
  const { elementRef: titleRef, isVisible: titleVisible } =
    useFadeInAnimation<HTMLHeadingElement>({ forceVisible: true });
  const { elementRef: descRef, isVisible: descVisible } =
    useFadeInAnimation<HTMLParagraphElement>({ forceVisible: true });
  const { elementRef: buttonRef, isVisible: buttonVisible } =
    useFadeInAnimation<HTMLDivElement>();

  const { locale } = useLocale();

  return (
    <SectionWrapper id='lectures' className='py-16'>
      <div className='text-center mb-16'>
        <h2
          ref={titleRef}
          className={`text-5xl font-bold text-white mb-6 transition-all duration-1000 ${
            titleVisible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-10 scale-95'
          }`}
        >
          {locale === 'ja' ? '講義' : 'Academic Lectures'}
        </h2>
        <p
          ref={descRef}
          className={`text-xl text-gray-300 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
            descVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
          }`}
        >
          {locale === 'ja'
            ? 'コンピュータサイエンスと情報通信技術に関する基礎から応用までを網羅した講義を提供します。'
            : 'Comprehensive courses covering fundamental concepts to advanced topics in computer science and information communication technologies.'}
        </p>
      </div>

      <div
        ref={buttonRef}
        className={`text-center transition-all duration-1000 delay-400 ${
          buttonVisible
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-10'
        }`}
      >
        <ScrollAwareLink href='/lectures'>
          <Button
            size='lg'
            className='bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group'
          >
            <BookOpen className='w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300' />
            {locale === 'ja' ? '講義一覧を見る' : 'View All Lectures'}
          </Button>
        </ScrollAwareLink>
      </div>
    </SectionWrapper>
  );
}
