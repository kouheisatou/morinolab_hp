import { useEffect, useState } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import Image from 'next/image';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';
import {
  CareerItem,
  loadCareers,
  getStaticPath,
} from '@/lib/client-content-loader';

// 背景カラーのマッピング（交互に変えるだけ）
const colorArray = [
  'from-blue-500 to-cyan-500',
  'from-purple-500 to-pink-500',
  'from-green-500 to-emerald-500',
];

// 個々のキャリアカードを描画するサブコンポーネント
function CareerCard({ career, index }: { career: CareerItem; index: number }) {
  const { elementRef: cardRef, isVisible: cardVisible } =
    useScrollAnimation<HTMLDivElement>({ forceVisible: true });

  const color = colorArray[index % colorArray.length];

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-1000 ${
        cardVisible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-10 scale-95'
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      <GlassCard className='p-8 h-full flex flex-col items-center text-center relative overflow-hidden group hover:scale-[1.02] transition-all duration-300'>
        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center mb-4 overflow-hidden`}
        >
          <Image
            src={getStaticPath(
              `/generated_contents/career/${career.thumbnail}`
            )}
            alt={career.nameJa}
            width={48}
            height={48}
            className='object-cover w-full h-full'
          />
        </div>

        <h3 className='text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors duration-300'>
          {career.nameJa}
        </h3>
        {career.nameEn && career.nameEn !== career.nameJa && (
          <p className='text-gray-400 text-sm mb-4'>{career.nameEn}</p>
        )}

        {/* Subtle glow effect on hover */}
        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
      </GlassCard>
    </div>
  );
}

export function Career() {
  const { elementRef: titleRef, isVisible: titleVisible } =
    useScrollAnimation<HTMLHeadingElement>({ forceVisible: true });
  const { elementRef: descRef, isVisible: descVisible } =
    useScrollAnimation<HTMLParagraphElement>({ forceVisible: true });

  const [careers, setCareers] = useState<CareerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          <p className='text-white mt-4'>Loading career data...</p>
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
    <SectionWrapper id='career' className='py-32'>
      <div className='text-center mb-16'>
        <h2
          ref={titleRef}
          className={`text-5xl font-bold text-white mb-6 transition-all duration-1000 ${
            titleVisible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-10 scale-95'
          }`}
        >
          Career Paths
        </h2>
        <p
          ref={descRef}
          className={`text-xl text-gray-300 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
            descVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
          }`}
        >
          Explore the diverse career destinations pursued by our alumni and
          researchers.
        </p>
      </div>

      <div className='grid md:grid-cols-3 gap-8 items-stretch'>
        {careers.map((career, index) => (
          <CareerCard key={career.id} career={career} index={index} />
        ))}
      </div>
    </SectionWrapper>
  );
}
