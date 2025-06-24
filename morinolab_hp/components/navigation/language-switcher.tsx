'use client';

import { useLocale } from '@/contexts/locale';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ dark = false }: { dark?: boolean } = {}) {
  const { locale, toggleLocale } = useLocale();

  return (
    <Button
      variant='ghost'
      size='sm'
      onClick={toggleLocale}
      className={cn(
        'hover:bg-white/10 transition-all duration-200',
        dark ? 'text-white' : 'text-gray-700'
      )}
    >
      {locale === 'ja' ? 'English' : '日本語'}
    </Button>
  );
}
