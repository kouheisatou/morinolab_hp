'use client';

import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import {
  Award,
  Calendar,
  ExternalLink,
  Trophy,
  Star,
  Target,
  Medal,
} from 'lucide-react';
import Link from 'next/link';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import { useState, useEffect } from 'react';
import { loadAwards, Award as AwardType } from '@/lib/client-content-loader';

export function Awards() {
  const { elementRef: titleRef, isVisible: titleVisible } =
    useScrollAnimation<HTMLHeadingElement>({ forceVisible: true });
  const { elementRef: descRef, isVisible: descVisible } =
    useScrollAnimation<HTMLParagraphElement>({ forceVisible: true });
  const { elementRef: buttonRef, isVisible: buttonVisible } =
    useScrollAnimation<HTMLDivElement>();

  // 固定数のアニメーション用refを事前に作成（最大4件表示）
  const cardRefs = [
    useScrollAnimation<HTMLDivElement>(),
    useScrollAnimation<HTMLDivElement>(),
    useScrollAnimation<HTMLDivElement>(),
    useScrollAnimation<HTMLDivElement>(),
  ];

  const [awards, setAwards] = useState<AwardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAwardsData = async () => {
      try {
        console.log('Awards component: Starting to fetch awards data...');
        setLoading(true);
        const items = await loadAwards();
        console.log('Awards component: Received items:', items);
        // 最新の4件のみ表示
        const slicedItems = items.slice(0, 4);
        setAwards(slicedItems);
      } catch (err) {
        console.error('Awards component: Error loading awards:', err);
        setError('Failed to load awards data');
      } finally {
        console.log('Awards component: Finished loading');
        setLoading(false);
      }
    };

    fetchAwardsData();
  }, []);

  const getIconAndColor = (index: number) => {
    const configs = [
      { icon: Trophy, color: 'from-yellow-500 to-orange-500' },
      { icon: Award, color: 'from-purple-500 to-pink-500' },
      { icon: Star, color: 'from-blue-500 to-cyan-500' },
      { icon: Medal, color: 'from-green-500 to-emerald-500' },
    ];
    return configs[index % configs.length];
  };

  if (loading) {
    return (
      <SectionWrapper id='awards' className='py-32'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto'></div>
          <p className='text-white mt-4'>Loading awards...</p>
        </div>
      </SectionWrapper>
    );
  }

  if (error) {
    return (
      <SectionWrapper id='awards' className='py-32'>
        <div className='text-center'>
          <p className='text-red-400'>{error}</p>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper id='awards' className='py-32'>
      <div className='text-center mb-16'>
        <h2
          ref={titleRef}
          className={`text-5xl font-bold text-white mb-6 transition-all duration-1000 ${
            titleVisible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-100 translate-y-0 scale-100'
          }`}
        >
          Awards & Recognition
        </h2>
        <p
          ref={descRef}
          className={`text-xl text-gray-300 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
            descVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-100 translate-y-0'
          }`}
        >
          Celebrating our achievements and recognition from the academic and
          research community.
        </p>
      </div>

      <div className='grid md:grid-cols-2 gap-8'>
        {awards.length === 0 ? (
          <div className='col-span-2 text-center text-gray-400'>
            <p>No awards found</p>
          </div>
        ) : (
          awards.map((award, index) => {
            const { icon: Icon, color } = getIconAndColor(index);
            // 事前に作成したrefを使用
            const { elementRef: cardRef, isVisible: cardVisible } = cardRefs[
              index
            ] || { elementRef: null, isVisible: true };

            return (
              <div
                ref={cardRef}
                key={award.id}
                className={`transition-all duration-1000 ${
                  cardVisible
                    ? 'opacity-100 translate-y-0 rotate-0'
                    : 'opacity-30 translate-y-8 rotate-1'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                <GlassCard className='p-8 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300'>
                  <div className='flex items-start space-x-4'>
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className='w-6 h-6 text-white' />
                    </div>

                    <div className='flex-grow'>
                      <div className='flex items-center space-x-2 mb-3'>
                        <Calendar className='w-4 h-4 text-gray-400' />
                        <span className='text-gray-400 text-sm'>
                          {award.date}
                        </span>
                      </div>

                      <h3 className='text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors duration-300'>
                        {award.nameJa}
                      </h3>

                      {award.nameEn && award.nameEn !== award.nameJa && (
                        <p className='text-gray-300 mb-4 leading-relaxed'>
                          {award.nameEn}
                        </p>
                      )}

                      <Link href={`/awards/${award.id}`}>
                        <Button
                          variant='outline'
                          size='sm'
                          className='border-white/30 text-white hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-300'
                        >
                          Read More
                          <ExternalLink className='w-4 h-4 ml-2' />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Subtle glow effect on hover */}
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
            : 'opacity-100 translate-y-0 scale-100'
        }`}
      >
        <Link href='/awards'>
          <Button
            size='lg'
            className='bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-8 py-4 text-lg font-semibold'
          >
            View All Awards
          </Button>
        </Link>
      </div>
    </SectionWrapper>
  );
}
