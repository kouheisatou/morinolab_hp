"use client";
import { useLang } from '@/components/LanguageContext';

export default function Footer() {
  const { lang } = useLang();
  const year = new Date().getFullYear();
  return (
    <footer className="mt-16 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
      © {year} {lang === 'ja' ? '森野研究室' : 'Morino Lab'}. All rights reserved.
    </footer>
  );
} 