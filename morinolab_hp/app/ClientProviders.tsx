'use client';

import React from 'react';
import { LocaleProvider } from '@/contexts/locale';

interface Props {
  children: React.ReactNode;
}

/**
 * アプリ全体で使用するクライアントサイドの Provider 群をまとめたコンポーネント。
 * ここでは LocaleProvider のみをラップしていますが、将来的に追加する場合も
 * ここに登録することで一箇所で管理できます。
 */
export function ClientProviders({ children }: Props) {
  return <LocaleProvider>{children}</LocaleProvider>;
}

export default ClientProviders;
