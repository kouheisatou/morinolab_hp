import { useEffect, useState } from 'react';
import Image from 'next/image';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import {
  useFadeInAnimation,
  useStaggeredFadeIn,
} from '@/hooks/use-fade-in-animation';
import {
  CareerItem,
  loadCareers,
  getStaticPath,
} from '@/lib/client-content-loader';
import { useLocale } from '@/contexts/locale';
import { getLocalized } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

// 背景カラーのマッピング（交互に変えるだけ）
const colorArray = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-green-500 to-emerald-500',
];

// コンパクトなリスト項目
function CareerListItem({
  career,
  index,
}: {
  career: CareerItem;
  index: number;
}) {
  const { locale } = useLocale();
  const { elementRef: itemRef, isVisible } =
    useFadeInAnimation<HTMLLIElement>();

  const color = colorArray[index % colorArray.length];

  return (
    <li
      ref={itemRef}
      className={`transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className='p-6 h-full flex flex-col items-center group hover:scale-[1.03] transition-transform duration-300'>
        <div
          className={`w-16 h-16 rounded-full bg-gradient-to-r ${color} overflow-hidden flex items-center justify-center mb-3`}
        >
          <Image
            src={getStaticPath(
              `/generated_contents/career/${career.thumbnail}`
            )}
            alt={getLocalized(career, 'name', locale)}
            width={64}
            height={64}
            className='object-cover w-full h-full'
          />
        </div>
        <span className='text-white text-sm font-medium text-center group-hover:text-cyan-400 transition-colors duration-300'>
          {getLocalized(career, 'name', locale)}
        </span>
      </div>
    </li>
  );
}

export function Career() {
  const { elementRef: titleRef, isVisible: titleVisible } =
    useFadeInAnimation<HTMLHeadingElement>({ delay: 100, duration: 1000 });
  const { elementRef: descRef, isVisible: descVisible } =
    useFadeInAnimation<HTMLParagraphElement>({
      delay: 300,
      duration: 1000,
      translateY: 25,
    });

  const buttonAnimation = useFadeInAnimation<HTMLDivElement>({
    delay: 600,
    duration: 800,
    translateY: 30,
  });

  const [careers, setCareers] = useState<CareerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { locale } = useLocale();

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const items = await loadCareers();
        const topItems = items.slice(0, 6);
        setCareers(topItems);
      } catch (err) {
        console.error('Error loading career items:', err);
        setError('Failed to load career data');
      } finally {
        setLoading(false);
      }
    };

    fetchCareers();
  }, []);

  if (loading) {
    return (
      <SectionWrapper id='career' className='py-32'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto'></div>
          <p className='text-white mt-4'>
            {locale === 'ja'
              ? 'キャリア情報を読み込み中...'
              : 'Loading career data...'}
          </p>
        </div>
      </SectionWrapper>
    );
  }

  if (error) {
    return (
      <SectionWrapper id='career' className='py-32'>
        <div className='text-center'>
          <p className='text-red-400'>{error}</p>
        </div>
      </SectionWrapper>
    );
  }

  return (
    <SectionWrapper id='career' className='py-16'>
      <div className='text-center mb-16'>
        <h2
          ref={titleRef}
          className={`text-5xl font-bold text-white mb-6 transition-all duration-1000 ${
            titleVisible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-10 scale-95'
          }`}
        >
          {locale === 'ja' ? '卒業生の進路' : 'Graduate Path'}
        </h2>
        <p
          ref={descRef}
          className={`text-xl text-gray-300 max-w-3xl mx-auto min-h-[96px] transition-all duration-1000 delay-200 ${
            descVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
          }`}
        >
          {locale === 'ja'
            ? '卒業生や研究者が歩む多彩なキャリアをご紹介します。'
            : 'Explore the diverse career destinations pursued by our alumni and researchers.'}
        </p>
      </div>

      <div
        ref={buttonAnimation.ref}
        style={buttonAnimation.style}
        className='text-center mt-12'
      >
        <Link href='/career'>
          <Button className='bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 text-lg font-semibold'>
            {locale === 'ja'
              ? 'すべての卒業生の進路を見る'
              : 'View All Graduate Paths'}
          </Button>
        </Link>
      </div>
    </SectionWrapper>
  );
}
