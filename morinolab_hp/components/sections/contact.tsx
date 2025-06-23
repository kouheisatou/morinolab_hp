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
                      <Mail className='w-6 h-6 text-cyan-400 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300' />
                      <div>
                        <h4 className='text-white font-semibold mb-1'>
                          {locale === 'ja' ? '名称' : 'Name'}
                        </h4>
                        <p className='text-gray-300'>
                          {locale === 'ja'
                            ? '芝浦工業大学工学部情報通信工学課程'
                            : 'Department of Information and Communication Engineering, Shibaura Institute of Technology'}
                          <br />
                          {locale === 'ja'
                            ? '森野博章研究室'
                            : 'Morino Laboratory'}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start space-x-4'>
                      <MapPin className='w-6 h-6 text-blue-400 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300' />
                      <div>
                        <h4 className='text-white font-semibold mb-1'>
                          {locale === 'ja' ? '住所' : 'Address'}
                        </h4>
                        <p className='text-gray-300'>
                          {locale === 'ja' ? '135-8548' : '135-8548'}
                          <br />
                          {locale === 'ja'
                            ? '東京都江東区豊洲3-7-5'
                            : '3-7-5 Toyosu, Koto-ku, Tokyo'}
                          <br />
                          {locale === 'ja'
                            ? '研究棟12階 12-I-32号室'
                            : '12-I-32, 12th Floor, Research Building'}
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start space-x-4'>
                      <Phone className='w-6 h-6 text-purple-400 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300' />
                      <div>
                        <h4 className='text-white font-semibold mb-1'>
                          {locale === 'ja' ? '電話' : 'Phone'}
                        </h4>
                        <p className='text-gray-300'>
                          (TEL) 03-5859-8254 (FAX) 03-5859-8254
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Subtle glow effect on hover */}
                  <div className='pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
                </GlassCard>
              ) : (
                <GlassCard className='p-8 h-full flex flex-col relative overflow-hidden group hover:scale-[1.02] transition-all duration-300'>
                  <h3 className='text-2xl font-bold text-white mb-6 group-hover:text-cyan-400 transition-colors duration-300'>
                    {locale === 'ja' ? 'アクセス' : 'Access'}
                  </h3>

                  <div className='space-y-4 mb-6 flex-grow'>
                    <p className='text-gray-300'>
                      {locale === 'ja'
                        ? '豊洲キャンパスへのアクセスは以下をご参照ください。最寄り駅から徒歩圏内でお越しいただけます。'
                        : 'Please refer to the information below for directions to the Toyosu Campus. The laboratory is within walking distance from the nearest stations.'}
                    </p>

                    <ul className='space-y-2 text-gray-300'>
                      <li className='flex items-start'>
                        <span className='w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0' />
                        {locale === 'ja'
                          ? '東京メトロ有楽町線「豊洲駅」1c出口 徒歩8分'
                          : '8-minute walk from Toyosu Station (Tokyo Metro Yurakucho Line, Exit 1c)'}
                      </li>
                      <li className='flex items-start'>
                        <span className='w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0' />
                        {locale === 'ja'
                          ? 'ゆりかもめ「豊洲駅」 徒歩10分'
                          : '10-minute walk from Toyosu Station (Yurikamome Line)'}
                      </li>
                      <li className='flex items-start'>
                        <span className='w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0' />
                        {locale === 'ja'
                          ? '都営バス「豊洲駅前」 徒歩8分'
                          : '8-minute walk from Toyosu-ekimae Bus Stop (Toei Bus)'}
                      </li>
                    </ul>
                  </div>

                  <div className='mt-auto'>
                    <Button
                      size='lg'
                      asChild
                      className='bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white w-full transition-all duration-300'
                    >
                      <a
                        href='https://maps.app.goo.gl/KnDBYQ3JDZ9r1TKZ6'
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {locale === 'ja'
                          ? 'Google マップで見る'
                          : 'View on Google Maps'}
                        <ExternalLink className='w-4 h-4 ml-2 inline' />
                      </a>
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
