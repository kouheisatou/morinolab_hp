'use client';

import React, { useEffect } from 'react';
import { LocaleProvider } from '@/contexts/locale';
import { ScrollPositionProvider } from '@/contexts/scroll-position';
import { ScrollDebugProvider } from '@/components/ScrollDebugProvider';

interface Props {
  children: React.ReactNode;
}

/**
 * アプリ全体で使用するクライアントサイドの Provider 群をまとめたコンポーネント。
 * LocaleProvider、ScrollPositionProvider、ScrollDebugProvider をラップして、
 * 一箇所で管理できるようにしています。
 */
export function ClientProviders({ children }: Props) {
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'scrollRestoration' in window.history
    ) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <LocaleProvider>
      <ScrollPositionProvider>
        <ScrollDebugProvider>{children}</ScrollDebugProvider>
      </ScrollPositionProvider>
    </LocaleProvider>
  );
}

export default ClientProviders;
