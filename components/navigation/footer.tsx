import { SectionWrapper } from '@/components/ui/section-wrapper';
import { Atom, Mail, MapPin, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className='bg-white/50 backdrop-blur-md border-t border-white/10'>
      <SectionWrapper className='py-16'>
        <p className='text-gray-400 text-sm text-center'>
          © 2024 MorinoLab. All rights reserved.
        </p>
      </SectionWrapper>
    </footer>
  );
}
