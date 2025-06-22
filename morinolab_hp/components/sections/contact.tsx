import { GlassCard } from '@/components/ui/glass-card';
import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Button } from '@/components/ui/button';
import { MapPin, Mail, Phone, ExternalLink } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/use-scroll-animation';

export function Contact() {
  const { elementRef: titleRef, isVisible: titleVisible } =
    useScrollAnimation<HTMLHeadingElement>();
  const { elementRef: descRef, isVisible: descVisible } =
    useScrollAnimation<HTMLParagraphElement>();

  // Pre-create animation refs for the cards to avoid calling hooks in callbacks
  const cardRefs = [
    useScrollAnimation<HTMLDivElement>(),
    useScrollAnimation<HTMLDivElement>(),
  ];

  return (
    <SectionWrapper id='contact' className='py-32'>
      <div className='text-center mb-16'>
        <h2
          ref={titleRef}
          className={`text-5xl font-bold text-white mb-6 transition-all duration-1000 ${
            titleVisible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-10 scale-95'
          }`}
        >
          Get In Touch
        </h2>
        <p
          ref={descRef}
          className={`text-xl text-gray-300 max-w-3xl mx-auto transition-all duration-1000 delay-200 ${
            descVisible
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-10'
          }`}
        >
          Interested in collaborating or learning more about our research?
          We&apos;d love to hear from you.
        </p>
      </div>

      <div className='grid md:grid-cols-2 gap-12'>
        {[1, 2].map((cardIndex) => {
          const { elementRef: cardRef, isVisible: cardVisible } =
            cardRefs[cardIndex - 1];
          return (
            <div
              ref={cardRef}
              key={cardIndex}
              className={`transition-all duration-1000 ${
                cardVisible
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-20 scale-95'
              }`}
              style={{ transitionDelay: `${(cardIndex - 1) * 300}ms` }}
            >
              {cardIndex === 1 ? (
                <GlassCard className='p-8 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300'>
                  <h3 className='text-2xl font-bold text-white mb-6 group-hover:text-cyan-400 transition-colors duration-300'>
                    Contact Information
                  </h3>

                  <div className='space-y-6'>
                    <div className='flex items-start space-x-4'>
                      <MapPin className='w-6 h-6 text-blue-400 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300' />
                      <div>
                        <h4 className='text-white font-semibold mb-1'>
                          Address
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
                        <h4 className='text-white font-semibold mb-1'>Email</h4>
                        <p className='text-gray-300'>
                          morino.lab@university.edu
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start space-x-4'>
                      <Phone className='w-6 h-6 text-purple-400 flex-shrink-0 mt-1 group-hover:scale-110 transition-transform duration-300' />
                      <div>
                        <h4 className='text-white font-semibold mb-1'>Phone</h4>
                        <p className='text-gray-300'>+1 (555) 123-4567</p>
                      </div>
                    </div>
                  </div>

                  {/* Subtle glow effect on hover */}
                  <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
                </GlassCard>
              ) : (
                <GlassCard className='p-8 relative overflow-hidden group hover:scale-[1.02] transition-all duration-300'>
                  <h3 className='text-2xl font-bold text-white mb-6 group-hover:text-cyan-400 transition-colors duration-300'>
                    Research Opportunities
                  </h3>

                  <div className='space-y-4 mb-6'>
                    <p className='text-gray-300'>
                      We are always looking for talented students and
                      researchers to join our team. If you&apos;re passionate
                      about quantum computing and want to contribute to
                      cutting-edge research, we&apos;d love to discuss
                      opportunities.
                    </p>

                    <ul className='space-y-2 text-gray-300'>
                      <li className='flex items-start'>
                        <span className='w-2 h-2 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0' />
                        PhD and Master&apos;s positions available
                      </li>
                      <li className='flex items-start'>
                        <span className='w-2 h-2 bg-cyan-400 rounded-full mt-2 mr-3 flex-shrink-0' />
                        Postdoctoral research opportunities
                      </li>
                      <li className='flex items-start'>
                        <span className='w-2 h-2 bg-purple-400 rounded-full mt-2 mr-3 flex-shrink-0' />
                        Industry collaboration projects
                      </li>
                    </ul>
                  </div>

                  <Button
                    size='lg'
                    className='bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white w-full transition-all duration-300'
                  >
                    Apply Now
                    <ExternalLink className='w-4 h-4 ml-2' />
                  </Button>

                  {/* Subtle glow effect on hover */}
                  <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out' />
                </GlassCard>
              )}
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
