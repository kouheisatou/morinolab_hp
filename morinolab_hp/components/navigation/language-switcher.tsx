'use client';

import { useLocale } from '@/contexts/locale';
import { Button } from '@/components/ui/button';

export function LanguageSwitcher() {
  const { locale, toggleLocale } = useLocale();

  return (
    <Button
      variant='ghost'
      size='sm'
      onClick={toggleLocale}
      className='text-white hover:bg-white/10 transition-all duration-200'
    >
      {locale === 'ja' ? 'English' : '日本語'}
    </Button>
  );
}
