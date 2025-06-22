import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Atom, Mail, MapPin, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className='bg-black/50 backdrop-blur-md border-t border-white/10'>
      <SectionWrapper className='py-16'>
        <div className='grid md:grid-cols-4 gap-8'>
          <div className='space-y-4'>
            <div className='flex items-center space-x-2'>
              <Atom className='w-8 h-8 text-blue-400' />
              <span className='text-xl font-bold text-white'>MorinoLab</span>
            </div>
            <p className='text-gray-300 text-sm'>
              Pioneering the future of quantum computing through innovative
              research and cutting-edge technology development.
            </p>
          </div>

          <div>
            <h4 className='text-white font-semibold mb-4'>Quick Links</h4>
            <ul className='space-y-2 text-sm'>
              {['Research', 'Team', 'Publications', 'News'].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className='text-gray-300 hover:text-white transition-colors duration-200'
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className='text-white font-semibold mb-4'>Research Areas</h4>
            <ul className='space-y-2 text-sm'>
              {[
                'Quantum Computing',
                'Machine Learning',
                'Cryptography',
                'Optimization',
              ].map((item) => (
                <li key={item} className='text-gray-300'>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className='text-white font-semibold mb-4'>Contact</h4>
            <div className='space-y-2 text-sm'>
              <div className='flex items-center space-x-2'>
                <Mail className='w-4 h-4 text-gray-400' />
                <span className='text-gray-300'>morino.lab@university.edu</span>
              </div>
              <div className='flex items-start space-x-2'>
                <MapPin className='w-4 h-4 text-gray-400 mt-0.5' />
                <span className='text-gray-300'>
                  University of Technology
                  <br />
                  Tech City, TC 12345
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='border-t border-white/10 mt-12 pt-8 text-center'>
          <p className='text-gray-400 text-sm'>
            © 2024 MorinoLab. All rights reserved. | Built with cutting-edge
            technology.
          </p>
        </div>
      </SectionWrapper>
    </footer>
  );
}
