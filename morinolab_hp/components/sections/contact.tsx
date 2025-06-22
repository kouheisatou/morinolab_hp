import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { MapPin, Mail, Phone, ExternalLink } from 'lucide-react';
import {
  useFadeInAnimation,
  useStaggeredFadeIn,
} from '@/hooks/use-fade-in-animation';
import { useLocale } from '@/contexts/locale';

export function Contact() {
  const titleAnimation = useFadeInAnimation<HTMLHeadingElement>({
    delay: 100,
    duration: 1000,
    translateY: 30,
  });
  const descAnimation = useFadeInAnimation<HTMLParagraphElement>({
    delay: 300,
    duration: 1000,
    translateY: 25,
  });

  // Pre-create animation refs for the cards to avoid calling hooks in callbacks
  const cardAnimations = useStaggeredFadeIn<HTMLDivElement>(2, 500, 300, {
    duration: 800,
    translateY: 40,
    scale: 0.95,
  });

  const { locale } = useLocale();

  return (
    <SectionWrapper id='contact' className='py-32'>
      <div className='text-center mb-16'>
        <h2
          ref={titleAnimation.ref}
          style={titleAnimation.style}
          className='text-5xl font-bold text-white mb-6'
        >
          {locale === 'ja' ? 'お問い合わせ' : 'Get In Touch'}
        </h2>
        <p
          ref={descAnimation.ref}
          style={descAnimation.style}
          className='text-xl text-gray-300 max-w-3xl mx-auto'
        >
          {locale === 'ja'
            ? '共同研究や詳細情報にご興味がありますか？お気軽にご連絡ください。'
            : "Interested in collaborating or learning more about our research? We'd love to hear from you."}
        </p>
      </div>

      <div className='grid md:grid-cols-2 gap-12'>
        {[1, 2].map((cardIndex) => {
          const cardAnimation = cardAnimations[cardIndex - 1];
          return (
            <div
              ref={cardAnimation.ref}
              style={cardAnimation.style}
              key={cardIndex}
            >
              {cardIndex === 1 ? (
                <GlassCard className='p-8 h-full flex flex-col relative overflow-hidden group hover:scale-[1.02] transition-all duration-300'>
                  <h3 className='text-2xl font-bold text-white mb-6 group-hover:text-cyan-400 transition-colors duration-300'>
                    {locale === 'ja' ? '連絡先情報' : 'Contact Information'}
                  </h3>

                  <div className='space-y-6 flex-grow'>
                    <div className='flex items-start space-x-4'>
                      <MapPin className='w-6 h-6 text-blue-400 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300' />
                      <div>
                        <h4 className='text-white font-semibold mb-1'>
                          {locale === 'ja' ? '住所' : 'Address'}
                        </h4>
                        <p className='text-gray-300'>
                          Department of Computer Science
                          <br />
                          University of Technology
                          <br />
                          123 Research Blvd
                          <br />
                          Tech City, TC 12345
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start space-x-4'>
                      <Mail className='w-6 h-6 text-cyan-400 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300' />
                      <div>
                        <h4 className='text-white font-semibold mb-1'>
                          {locale === 'ja' ? 'メール' : 'Email'}
                        </h4>
                        <p className='text-gray-300'>
                          morino.lab@university.edu
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start space-x-4'>
                      <Phone className='w-6 h-6 text-purple-400 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300' />
                      <div>
                        <h4 className='text-white font-semibold mb-1'>
                          {locale === 'ja' ? '電話' : 'Phone'}
                        </h4>
                        <p className='text-gray-300'>+1 (555) 123-4567</p>
                      </div>
                    </div>
                  </div>

                  {/* Subtle glow effect on hover */}
                  <div className='pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
                </GlassCard>
              ) : (
                <GlassCard className='p-8 h-full flex flex-col relative overflow-hidden group hover:scale-[1.02] transition-all duration-300'>
                  <h3 className='text-2xl font-bold text-white mb-6 group-hover:text-cyan-400 transition-colors duration-300'>
                    {locale === 'ja'
                      ? '研究参加希望'
                      : 'Research Opportunities'}
                  </h3>

                  <div className='space-y-4 mb-6 flex-grow'>
                    <p className='text-gray-300'>
                      {locale === 'ja'
                        ? '才能ある学生や研究者を募集しています。量子コンピューティングへの情熱をお持ちで最先端研究に参加したい方は、ぜひご相談ください。'
                        : "We are always looking for talented students and researchers to join our team. If you're passionate about quantum computing and want to contribute to cutting-edge research, we'd love to discuss opportunities."}
                    </p>

                    <ul className='space-y-2 text-gray-300'>
                      <li className='flex items-start'>
                        <span className='w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0' />
                        {locale === 'ja'
                          ? '博士課程・修士課程の募集'
                          : "PhD and Master's positions available"}
                      </li>
                      <li className='flex items-start'>
                        <span className='w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0' />
                        {locale === 'ja'
                          ? 'ポスドク研究員の募集'
                          : 'Postdoctoral research opportunities'}
                      </li>
                      <li className='flex items-start'>
                        <span className='w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0' />
                        {locale === 'ja'
                          ? '産学連携プロジェクト'
                          : 'Industry collaboration projects'}
                      </li>
                    </ul>
                  </div>

                  <div className='mt-auto'>
                    <Button
                      size='lg'
                      className='bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white w-full transition-all duration-300'
                    >
                      {locale === 'ja' ? '応募する' : 'Apply Now'}
                      <ExternalLink className='w-4 h-4 ml-2' />
                    </Button>
                  </div>

                  {/* Subtle glow effect on hover */}
                  <div className='pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
                </GlassCard>
              )}
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
